/** Un informe cuenta qué pasó, dónde y en qué nivel quedó cada habilidad. */

import { describe, expect, it } from 'vitest';
import { crearPiloto, seededDb } from '../db/testing';
import { pilotAction, pilotLog } from '../db/schema';
import { recordEntry, type XpChange } from '../services/log';
import { resolveIfDue, startTravel } from '../services/actions';
import { getBody } from '../services/universe';
import { buildBitacora } from './log';
import type { Db } from '../db/types';
import { eq } from 'drizzle-orm';

/** Escribe un informe de viaje y devuelve cómo se ve en la bitácora. */
function informeDe(db: Db, pilotId: number, xp: readonly XpChange[]) {
	recordEntry(db, pilotId, {
		kind: 'travel',
		durationSeconds: 99,
		originBodyId: getBody(db, 'puerto_anfora')!.id,
		destinationBodyId: getBody(db, 'anfora_estrella')!.id,
		xp
	});
	return buildBitacora(db, pilotId).entries[0];
}

/** Un cambio de experiencia que no hace subir de nivel. */
function suma(skill: string, xp: number, before = 0): XpChange {
	return { skill, xp, before, after: before + xp };
}

describe('un informe', () => {
	it('lleva un titular genérico y dice qué acción fue', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		const informe = informeDe(db, piloto.id, [suma('navigation', 16)]);

		// El titular es el mismo para toda acción: van a ser muchas y todas
		// responden a la misma pregunta al volver.
		expect(informe.title).toBe('Acción terminada');
		expect(informe.kindLabel).toBe('Viaje');
		expect(informe.icon).toBe('rocket-launch');
	});

	it('nombra el destino y de dónde salió', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		const informe = informeDe(db, piloto.id, [suma('navigation', 16)]);

		expect(informe.place).toBe('Ánfora');
		expect(informe.details).toContainEqual({ label: 'Salida', value: 'Puerto Ánfora' });
		expect(informe.details).toContainEqual({ label: 'Duración', value: '1 m 39 s' });
	});

	it('dice en qué nivel quedó cada habilidad, no sólo cuánto sumó', async () => {
		const db = seededDb();
		// El minero arranca con Navegación entrenada, así que el nivel que informa
		// sale de lo acumulado y no de lo que dio esta acción sola.
		const piloto = await crearPiloto(db);

		const informe = informeDe(db, piloto.id, [suma('navigation', 16)]);
		const navegacion = informe.xp.find((fila) => fila.skill === 'navigation')!;

		expect(navegacion.name).toBe('Navegación');
		expect(navegacion.xp).toBe(16);
		expect(navegacion.level).toMatch(/^(0|[IVX]+)$/);
		expect(navegacion.progress).toBeGreaterThanOrEqual(0);
		expect(navegacion.progress).toBeLessThanOrEqual(100);
	});

	it('ordena la experiencia de mayor a menor: la principal explica la acción', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		const informe = informeDe(db, piloto.id, [suma('fuel_efficiency', 2), suma('navigation', 16)]);

		expect(informe.xp.map((fila) => fila.skill)).toEqual(['navigation', 'fuel_efficiency']);
	});

	it('no lista una habilidad que no ganó nada', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		// Un viaje muy corto reparte cero, y un "+0 XP" en pantalla es ruido.
		const informe = informeDe(db, piloto.id, [suma('navigation', 0), suma('fuel_efficiency', 0)]);

		expect(informe.xp).toEqual([]);
	});

	it('una fila con el JSON roto no tumba la bitácora', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		informeDe(db, piloto.id, [suma('navigation', 16)]);
		db.update(pilotLog)
			.set({ xpAwarded: 'no soy json' })
			.where(eq(pilotLog.pilotId, piloto.id))
			.run();

		const bitacora = buildBitacora(db, piloto.id);

		expect(bitacora.entries).toHaveLength(1);
		expect(bitacora.entries[0].xp).toEqual([]);
	});
});

describe('la bitácora de un viaje de verdad', () => {
	it('queda escrita al resolverse, sin leer y con lo que pasó', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const salida = piloto.locationId;
		const destino = getBody(db, 'anfora_estrella')!;
		const orden = startTravel(db, piloto, destino);

		// Se la hace vencer corriéndole el arranque hacia atrás, que es exactamente
		// lo que mira `resolveIfDue`.
		db.update(pilotAction)
			.set({ startedAt: new Date(Date.now() - (orden.durationSeconds + 5) * 1000) })
			.where(eq(pilotAction.id, orden.id))
			.run();

		const report = resolveIfDue(db, piloto);
		expect(report).not.toBeNull();

		const bitacora = buildBitacora(db, piloto.id);
		expect(bitacora.total).toBe(1);

		const informe = bitacora.entries[0];
		expect(informe.id).toBe(report!.id);
		expect(informe.kindLabel).toBe('Viaje');
		expect(informe.place).toBe(destino.name);
		expect(informe.details).toContainEqual({ label: 'Salida', value: 'Puerto Ánfora' });
		// Nace sin leer: es lo que enciende la notificación del Neocom.
		expect(informe.unread).toBe(true);
		expect(salida).not.toBe(destino.id);
	});
});

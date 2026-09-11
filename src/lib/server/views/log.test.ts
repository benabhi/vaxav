/** Un informe cuenta qué pasó, dónde y cuánto dejó en el pozo de su rama. */

import { describe, expect, it } from 'vitest';
import { eq } from 'drizzle-orm';
import { crearPiloto, seededDb } from '../db/testing';
import { pilotAction, pilotLog } from '../db/schema';
import { recordEntry, type PoolDeposit } from '../services/log';
import { resolveIfDue, startTravel } from '../services/actions';
import { getBody } from '../services/universe';
import { buildBitacora } from './log';
import type { Db } from '../db/types';

/** Escribe un informe de viaje y devuelve cómo se ve en la bitácora. */
function informeDe(db: Db, pilotId: number, deposit: PoolDeposit) {
	recordEntry(db, pilotId, {
		kind: 'travel',
		durationSeconds: 99,
		originBodyId: getBody(db, 'puerto_anfora')!.id,
		destinationBodyId: getBody(db, 'anfora_estrella')!.id,
		deposit
	});
	return buildBitacora(db, pilotId).entries[0];
}

/** Un depósito al pozo de Pilotaje. */
function deposito(xp: number, before = 0): PoolDeposit {
	return { family: 'piloting', familyName: 'Pilotaje', xp, before, after: before + xp };
}

describe('un informe', () => {
	it('lleva un titular genérico y dice qué acción fue', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		const informe = informeDe(db, piloto.id, deposito(16));

		// El titular es el mismo para toda acción: van a ser muchas y todas
		// responden a la misma pregunta al volver.
		expect(informe.title).toBe('Acción terminada');
		expect(informe.kindLabel).toBe('Viaje');
		expect(informe.icon).toBe('rocket-launch');
	});

	it('nombra el destino y de dónde salió', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		const informe = informeDe(db, piloto.id, deposito(16));

		expect(informe.place).toBe('Ánfora');
		expect(informe.details).toContainEqual({ label: 'Salida', value: 'Puerto Ánfora' });
		expect(informe.details).toContainEqual({ label: 'Duración', value: '1 m 39 s' });
	});

	it('cuenta el depósito y cuánto quedó para gastar', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		const informe = informeDe(db, piloto.id, deposito(26, 100));

		expect(informe.deposit).not.toBeNull();
		expect(informe.deposit!.name).toBe('Pilotaje');
		expect(informe.deposit!.xp).toBe(26);
		// El después es la pregunta que sigue a "gané 26": cuánto tengo para gastar.
		expect(informe.deposit!.after).toBe(126);
		expect(informe.xpTotal).toBe(26);
		// Una acción ya no le paga a ninguna habilidad.
		expect(informe.xp).toEqual([]);
	});

	it('una fila con el JSON roto no tumba la bitácora', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		informeDe(db, piloto.id, deposito(16));
		db.update(pilotLog)
			.set({ xpAwarded: 'no soy json' })
			.where(eq(pilotLog.pilotId, piloto.id))
			.run();

		const bitacora = buildBitacora(db, piloto.id);

		expect(bitacora.entries).toHaveLength(1);
		expect(bitacora.entries[0].deposit).toBeNull();
		expect(bitacora.entries[0].xp).toEqual([]);
	});

	it('sigue leyendo los informes anteriores al pozo', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		informeDe(db, piloto.id, deposito(16));

		// La forma vieja: la experiencia iba derecha a la habilidad.
		db.update(pilotLog)
			.set({
				xpAwarded: JSON.stringify([{ skill: 'navigation', xp: 16, before: 100, after: 116 }])
			})
			.where(eq(pilotLog.pilotId, piloto.id))
			.run();

		const informe = buildBitacora(db, piloto.id).entries[0];

		expect(informe.deposit).toBeNull();
		expect(informe.xp).toHaveLength(1);
		expect(informe.xp[0].name).toBe('Navegación');
		expect(informe.xp[0].xp).toBe(16);
	});
});

describe('la bitácora de un viaje de verdad', () => {
	it('queda escrita al resolverse, sin leer y con el depósito', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
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
		expect(informe.deposit!.family).toBe('piloting');
		// Nace sin leer: es lo que enciende la notificación del Neocom.
		expect(informe.unread).toBe(true);
	});
});

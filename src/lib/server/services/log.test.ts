/** La bitácora guarda, pagina y recuerda qué se leyó. */

import { describe, expect, it } from 'vitest';
import { crearPiloto, seededDb } from '../db/testing';
import { getBody } from './universe';
import { logPage, markRead, recordEntry, unreadCount, PAGE_SIZE } from './log';
import type { Db } from '../db/types';

/** Escribe `cuantos` informes, del más viejo al más nuevo. */
function sembrarInformes(db: Db, pilotId: number, cuantos: number): void {
	const destino = getBody(db, 'anfora_estrella')!;
	const origen = getBody(db, 'puerto_anfora')!;
	for (let i = 0; i < cuantos; i++) {
		recordEntry(db, pilotId, {
			kind: 'travel',
			durationSeconds: 60 + i,
			originBodyId: origen.id,
			destinationBodyId: destino.id,
			xp: [{ skill: 'navigation', xp: 10 + i, before: 0, after: 10 + i }]
		});
	}
}

describe('escribir un informe', () => {
	it('guarda lo que pasó, sin leer', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const destino = getBody(db, 'anfora_estrella')!;

		const fila = recordEntry(db, piloto.id, {
			kind: 'travel',
			durationSeconds: 99,
			originBodyId: piloto.locationId,
			destinationBodyId: destino.id,
			xp: [
				{ skill: 'navigation', xp: 16, before: 100, after: 116 },
				{ skill: 'fuel_efficiency', xp: 2, before: 0, after: 2 }
			]
		});

		expect(fila.kind).toBe('travel');
		expect(fila.durationSeconds).toBe(99);
		expect(fila.destinationBodyId).toBe(destino.id);
		// Nace sin leer: es lo que enciende la notificación.
		expect(fila.readAt).toBeNull();
		expect(JSON.parse(fila.xpAwarded)).toEqual([
			{ skill: 'navigation', xp: 16, before: 100, after: 116 },
			{ skill: 'fuel_efficiency', xp: 2, before: 0, after: 2 }
		]);
	});
});

describe('la paginación', () => {
	it('con la bitácora vacía sigue habiendo una página', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		const pagina = logPage(db, piloto.id);

		expect(pagina.entries).toEqual([]);
		expect(pagina.total).toBe(0);
		expect(pagina.pages).toBe(1);
	});

	it('corta en el tamaño de página y cuenta el total', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		sembrarInformes(db, piloto.id, PAGE_SIZE + 5);

		const primera = logPage(db, piloto.id, 1);

		expect(primera.entries).toHaveLength(PAGE_SIZE);
		expect(primera.total).toBe(PAGE_SIZE + 5);
		expect(primera.pages).toBe(2);
	});

	it('devuelve lo más nuevo primero y sin repetir entre páginas', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		sembrarInformes(db, piloto.id, PAGE_SIZE + 5);

		const primera = logPage(db, piloto.id, 1);
		const segunda = logPage(db, piloto.id, 2);

		// El último escrito encabeza la lista.
		expect(primera.entries[0].id).toBeGreaterThan(primera.entries[1].id);
		// Y ninguna fila aparece en las dos páginas: eso es lo que rompe una
		// paginación mal ordenada.
		const ids = [...primera.entries, ...segunda.entries].map((fila) => fila.id);
		expect(new Set(ids).size).toBe(PAGE_SIZE + 5);
	});

	it('una página fuera de rango cae en la última', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		sembrarInformes(db, piloto.id, PAGE_SIZE + 1);

		expect(logPage(db, piloto.id, 99).page).toBe(2);
		expect(logPage(db, piloto.id, 0).page).toBe(1);
		expect(logPage(db, piloto.id, -3).page).toBe(1);
	});

	it('no mezcla la bitácora de dos pilotos', async () => {
		const db = seededDb();
		const uno = await crearPiloto(db, 'Uno');
		const otro = await crearPiloto(db, 'Otro');
		sembrarInformes(db, uno.id, 3);

		expect(logPage(db, uno.id).total).toBe(3);
		expect(logPage(db, otro.id).total).toBe(0);
	});
});

describe('lo que no se leyó', () => {
	it('cuenta sólo lo que el piloto todavía no vio', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		sembrarInformes(db, piloto.id, 3);

		expect(unreadCount(db, piloto.id)).toBe(3);
	});

	it('abrir la bitácora los da por vistos a todos', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		sembrarInformes(db, piloto.id, PAGE_SIZE + 4);

		// Todos y no sólo los de la primera página: el aviso dice "hay algo
		// nuevo", y quien entró ya sabe que lo hay.
		expect(markRead(db, piloto.id)).toBe(PAGE_SIZE + 4);
		expect(unreadCount(db, piloto.id)).toBe(0);
	});

	it('volver a marcar no toca nada, y lo nuevo vuelve a avisar', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		sembrarInformes(db, piloto.id, 2);
		markRead(db, piloto.id);

		expect(markRead(db, piloto.id)).toBe(0);

		sembrarInformes(db, piloto.id, 1);
		expect(unreadCount(db, piloto.id)).toBe(1);
	});

	it('no da por leído lo de otro piloto', async () => {
		const db = seededDb();
		const uno = await crearPiloto(db, 'Uno');
		const otro = await crearPiloto(db, 'Otro');
		sembrarInformes(db, uno.id, 2);
		sembrarInformes(db, otro.id, 2);

		markRead(db, uno.id);

		expect(unreadCount(db, uno.id)).toBe(0);
		expect(unreadCount(db, otro.id)).toBe(2);
	});
});

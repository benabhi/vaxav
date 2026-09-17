/**
 * La reputación: todo movimiento deja asiento, y el número cierra siempre.
 *
 * El último test de este archivo no prueba una función: **recorre el código
 * fuente** para verificar que ningún otro módulo escriba la tabla `standing`. Es
 * la misma red que tiene la billetera, y por el mismo motivo: el día que alguien
 * con apuro le sume diez puntos desde otro lado, todo va a seguir compilando y
 * pasando los demás tests, y el histórico va a empezar a mentir sin avisar.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { crearPiloto, seededDb } from '../db/testing';
import { standing } from '../db/schema';
import { MAX_REPUTATION_RAW, REPUTATION_SCALE } from '$lib/game/reputation';
import {
	NO_STANDINGS,
	ReputationError,
	auditStanding,
	award,
	pilotStandings,
	standingHistory,
	standingOf
} from './reputation';

/** La casa que opera Puerto Ánfora, y que existe en toda base sembrada. */
const CASA = { kind: 'corporation', code: 'casa_verlan' } as const;
const DOMINIO = { kind: 'faction', code: 'dominion' } as const;

/** Lo que se guarda para tener esos puntos. */
function puntos(valor: number): number {
	return valor * REPUTATION_SCALE;
}

describe('mover reputación', () => {
	it('sin fila, el piloto está en cero', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		// Nadie nace con una fila por cada corporación del sector.
		expect(standingOf(db, piloto.id, CASA)).toBe(0);
		expect(pilotStandings(db, piloto.id)).toEqual(NO_STANDINGS);
	});

	it('sube, baja y deja el valor en lo que corresponde', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		award(db, piloto.id, CASA, puntos(12), { kind: 'mission' });
		award(db, piloto.id, CASA, -puntos(2), { kind: 'adjustment' });

		expect(standingOf(db, piloto.id, CASA)).toBe(puntos(10));
	});

	it('cada movimiento deja su asiento con el valor que dejó', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		award(db, piloto.id, CASA, 250, { kind: 'mission', memo: 'Despacho menor' });
		award(db, piloto.id, CASA, 249, { kind: 'mission' });

		const libro = standingHistory(db, piloto.id, CASA);
		expect(libro.total).toBe(2);
		expect(libro.entries[0].amount).toBe(249);
		expect(libro.entries[0].valueAfter).toBe(499);
		expect(libro.entries[1].memo).toBe('Despacho menor');
	});

	it('separa la de la corporación de la de su facción', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		award(db, piloto.id, CASA, puntos(30), { kind: 'mission' });
		award(db, piloto.id, DOMINIO, puntos(4), { kind: 'mission' });

		const suyas = pilotStandings(db, piloto.id);
		expect(suyas.corporations.casa_verlan).toBe(puntos(30));
		expect(suyas.factions.dominion).toBe(puntos(4));
		// Y no se pisan: son dos escaleras distintas.
		expect(suyas.corporations.dominion).toBeUndefined();
	});

	/*
	 * El asiento tiene que decir lo que de verdad pasó. Uno de «+1,00» sobre un
	 * piloto que estaba a 0,30 del techo sería una mentira prolija, y además
	 * rompería la suma del libro contra el caché.
	 */
	it('recorta al techo y lo asienta recortado', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		award(db, piloto.id, CASA, MAX_REPUTATION_RAW - 300, { kind: 'adjustment' });
		const ultimo = award(db, piloto.id, CASA, puntos(1), { kind: 'mission' });

		expect(ultimo.amount).toBe(300);
		expect(ultimo.valueAfter).toBe(MAX_REPUTATION_RAW);
		expect(auditStanding(db, piloto.id, CASA)).toBeNull();
	});

	it('no baja del piso: hoy nadie te odia, sólo no te conoce', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		award(db, piloto.id, CASA, puntos(2), { kind: 'mission' });
		const ultimo = award(db, piloto.id, CASA, -puntos(50), { kind: 'adjustment' });

		expect(ultimo.valueAfter).toBe(0);
		expect(ultimo.amount).toBe(-puntos(2));
		expect(auditStanding(db, piloto.id, CASA)).toBeNull();
	});

	it('no escribe con quien no existe, para no dejar una fila huérfana', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		expect(() =>
			award(db, piloto.id, { kind: 'corporation', code: 'los_lunares' }, 100, { kind: 'mission' })
		).toThrow(ReputationError);
		expect(() =>
			award(db, piloto.id, { kind: 'faction', code: 'marcianos' }, 100, { kind: 'mission' })
		).toThrow(ReputationError);
	});

	it('la reputación se mueve en enteros', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		expect(() => award(db, piloto.id, CASA, 12.5, { kind: 'mission' })).toThrow(ReputationError);
	});
});

describe('el histórico', () => {
	it('pagina en la base, de lo más nuevo a lo más viejo', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		for (let i = 0; i < 15; i++) {
			award(db, piloto.id, CASA, 100, { kind: 'mission', memo: `misión ${i}` });
		}

		const primera = standingHistory(db, piloto.id, CASA, 1, 10);
		expect(primera.entries).toHaveLength(10);
		expect(primera.total).toBe(15);
		expect(primera.pages).toBe(2);
		expect(primera.entries[0].memo).toBe('misión 14');

		const segunda = standingHistory(db, piloto.id, CASA, 2, 10);
		expect(segunda.entries).toHaveLength(5);
		// Ninguna fila sale en las dos páginas: el desempate por id lo garantiza.
		const ids = new Set([...primera.entries, ...segunda.entries].map((una) => una.id));
		expect(ids.size).toBe(15);
	});

	it('con el libro vacío sigue habiendo una página', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		const vacio = standingHistory(db, piloto.id, CASA);
		expect(vacio.entries).toEqual([]);
		expect(vacio.pages).toBe(1);
		expect(vacio.page).toBe(1);
	});

	it('sin sujeto trae la historia entera del piloto', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		award(db, piloto.id, CASA, 100, { kind: 'mission' });
		award(db, piloto.id, DOMINIO, 100, { kind: 'mission' });

		expect(standingHistory(db, piloto.id).total).toBe(2);
		expect(standingHistory(db, piloto.id, CASA).total).toBe(1);
	});

	it('una página pedida fuera de rango cae en la última', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		award(db, piloto.id, CASA, 100, { kind: 'mission' });

		expect(standingHistory(db, piloto.id, CASA, 99).page).toBe(1);
		expect(standingHistory(db, piloto.id, CASA, 0).page).toBe(1);
	});
});

describe('la auditoría', () => {
	it('encuentra un caché que no coincide con el libro', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		award(db, piloto.id, CASA, puntos(10), { kind: 'mission' });

		expect(auditStanding(db, piloto.id, CASA)).toBeNull();

		// Se corrompe a propósito: es lo que esta función existe para encontrar.
		db.update(standing)
			.set({ value: puntos(99) })
			.run();

		expect(auditStanding(db, piloto.id, CASA)).toEqual({
			stored: puntos(99),
			ledger: puntos(10)
		});
	});
});

/** Todos los `.ts` de una carpeta, hacia abajo. */
function sourceFiles(dir: string): string[] {
	return readdirSync(dir).flatMap((name) => {
		const full = join(dir, name);
		if (statSync(full).isDirectory()) return sourceFiles(full);
		return name.endsWith('.ts') ? [full] : [];
	});
}

describe('quién puede escribir la reputación', () => {
	it('sólo este servicio la escribe, en todo el repositorio', () => {
		// El valor es un caché del libro. Que exista la columna invita a sumarle
		// diez puntos desde cualquier lado, y eso no rompe nada hasta el día que el
		// histórico no explica el número que muestra la pantalla.
		const culpables = sourceFiles(join('src', 'lib', 'server'))
			.filter((file) => !file.endsWith('.test.ts'))
			.filter((file) => !file.endsWith(join('services', 'reputation.ts')))
			.filter((file) => /\b(insert|update)\(\s*standing\s*\)/s.test(readFileSync(file, 'utf8')));

		expect(culpables, 'Estos escriben standing sin pasar por el servicio').toEqual([]);
	});
});

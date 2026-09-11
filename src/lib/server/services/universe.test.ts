/** La siembra deja el universo como dice el plano, y se puede repetir. */

import { describe, expect, it } from 'vitest';
import { freshDb, seededDb } from '../db/testing';
import { allAgents, allBodies, CORPORATIONS } from '../game/universe';
import {
	bodyDetail,
	bodyDistance,
	getBody,
	seedUniverse,
	systemOverview,
	systemTree
} from './universe';

describe('la siembra', () => {
	it('escribe el plano completo', () => {
		const db = freshDb();
		const conteo = seedUniverse(db);
		expect(conteo).toEqual({
			corporaciones: CORPORATIONS.length,
			agentes: allAgents().length,
			regiones: 1,
			constelaciones: 1,
			sistemas: 1,
			cuerpos: allBodies().length
		});
	});

	it('es idempotente', () => {
		// Correrla diez veces deja lo mismo que correrla una.
		const db = freshDb();
		const primera = seedUniverse(db);
		const segunda = seedUniverse(db);
		expect(segunda).toEqual(primera);
		expect(systemTree(db, 'anfora')).toHaveLength(allBodies().length);
	});
});

describe('la consulta', () => {
	it('encuentra un cuerpo por su código', () => {
		const db = seededDb();
		expect(getBody(db, 'puerto_anfora')?.name).toBe('Puerto Ánfora');
		expect(getBody(db, 'inventado')).toBeNull();
	});

	it('deriva la seguridad del gobierno', () => {
		const db = seededDb();
		const ficha = systemOverview(db, 'anfora')!;
		expect(ficha.system.government).toBe('corporate');
		expect(ficha.security).toBe('high');
		expect(ficha.claimable).toBe(false);
	});

	it('cuenta los cuerpos y las estaciones del sistema', () => {
		const db = seededDb();
		const ficha = systemOverview(db, 'anfora')!;
		expect(ficha.bodyCount).toBe(allBodies().length);
		expect(ficha.stationCount).toBe(5);
		expect(ficha.exploredCount).toBe(allBodies().length);
	});

	it('resuelve la corporación y los servicios de una estación', () => {
		const db = seededDb();
		const ficha = bodyDetail(db, 'puerto_anfora')!;
		expect(ficha.corporation?.code).toBe('casa_verlan');
		expect(ficha.services).toContain('outfitting');
		expect(ficha.agents.length).toBe(4);
	});

	it('ordena los agentes por nivel y después por nombre', () => {
		const db = seededDb();
		const niveles = bodyDetail(db, 'puerto_anfora')!.agents.map((a) => a.agent.level);
		expect(niveles).toEqual([...niveles].sort((a, b) => a - b));
	});

	it('no le da agentes a una estación sin Contactos', () => {
		const db = seededDb();
		const ficha = bodyDetail(db, 'planta_escarcha')!;
		expect(ficha.services).not.toContain('contacts');
		expect(ficha.agents).toEqual([]);
	});

	it('mide la distancia subiendo hasta el ancestro común', () => {
		const db = seededDb();
		const uno = getBody(db, 'anfora_i')!;
		const dos = getBody(db, 'anfora_ii')!;
		// Ambos cuelgan de la estrella: 40 + 95.
		expect(bodyDistance(db, uno.id, dos.id)).toBe(135);
		expect(bodyDistance(db, uno.id, uno.id)).toBe(0);
	});

	it('aplana el árbol en el orden en que se dibuja', () => {
		const db = seededDb();
		const nodos = systemTree(db, 'anfora');
		expect(nodos[0].body.code).toBe('anfora_estrella');
		expect(nodos[0].depth).toBe(0);
		expect(nodos[0].hasChildren).toBe(true);
		expect(nodos[nodos.length - 1].isLast).toBe(true);
	});
});

/** El mapa de la galaxia: una sola armada, y la misma para las dos pantallas. */

import { describe, expect, it } from 'vitest';
import { constellation } from '../db/schema';
import { seededDb } from '../db/testing';
import {
	connectGates,
	createBody,
	createGate,
	createSystem,
	setGateClosed,
	setStation,
	type SystemDraft
} from '../services/worldbuilding';
import { hopsFrom } from '$lib/game/galaxy';
import { SERVICE_ORDER, type StationServiceKind } from '$lib/game/universe';
import type { Db } from '../db/types';
import { buildGalaxyMap, neighbourhood } from './galaxy';

/** Un sistema mínimo, con lo que el constructor pide sí o sí. */
function borrador(db: Db, cambios: Partial<SystemDraft> = {}): SystemDraft {
	return {
		name: 'Vela',
		constellationId: db.select().from(constellation).get()!.id,
		government: 'corporate',
		security: 70,
		controllingFaction: 'dominion',
		capitalOf: '',
		description: '',
		...cambios
	};
}

/** Una puerta colgada de algo, que es la única forma en que se plantan. */
function puerta(parentId: number, name = 'Puerta Norte') {
	return {
		name,
		kind: 'gate' as const,
		parentId,
		orbitDistance: 400,
		description: '',
		explored: true
	};
}

/**
 * Dos sistemas unidos por una puerta.
 *
 * Es el escenario mínimo en el que la galaxia es una galaxia y no un sistema
 * suelto: sin dos puntas, ni los saltos ni las salidas significan nada.
 */
function dosSistemas(db: Db) {
	const uno = createSystem(db, borrador(db), null);
	const otro = createSystem(db, borrador(db, { name: 'Ocaso' }), null);

	const salida = createGate(db, uno.system.id, puerta(uno.star.id), 'n', null);
	const vuelta = createGate(db, otro.system.id, puerta(otro.star.id, 'Puerta Sur'), 's', null);
	connectGates(db, salida.gate.id, vuelta.gate.id, 14, null);

	return { uno, otro, salida, vuelta };
}

describe('el mapa de la galaxia', () => {
	it('trae todos los sistemas, con su casilla y su bandera', () => {
		const db = seededDb();
		const { uno, otro } = dosSistemas(db);

		const mapa = buildGalaxyMap(db);
		const codigos = mapa.systems.map((nodo) => nodo.code);

		expect(codigos).toContain(uno.system.code);
		expect(codigos).toContain(otro.system.code);
		// Ánfora también: el mapa nunca recorta, ni siquiera lo que no se filtró.
		expect(codigos).toContain('anfora');

		const vela = mapa.systems.find((nodo) => nodo.code === uno.system.code)!;
		expect(vela.factionName).toBe('El Dominio');
		expect(vela.hex).toEqual({ x: uno.system.x, y: uno.system.y, z: uno.system.z });
	});

	it('dibuja una línea por pasaje y no una por puerta', () => {
		const db = seededDb();
		const { uno, otro } = dosSistemas(db);

		const enlaces = buildGalaxyMap(db).links.filter(
			(enlace) =>
				[enlace.from, enlace.to].includes(uno.system.code) &&
				[enlace.from, enlace.to].includes(otro.system.code)
		);

		expect(enlaces).toHaveLength(1);
		expect(enlaces[0].distance).toBe('1,4 al');
	});

	it('marca a la deriva lo que no llega caminando hasta la semilla', () => {
		const db = seededDb();
		const { uno } = dosSistemas(db);

		// Los dos nuevos cuelgan entre sí pero de nada más: Ánfora es la semilla
		// —la más vieja— y desde ahí no se llega a ninguno de los dos.
		const vela = buildGalaxyMap(db).systems.find((nodo) => nodo.code === uno.system.code)!;
		expect(vela.adrift).toBe(true);
		expect(buildGalaxyMap(db).systems.find((nodo) => nodo.code === 'anfora')!.adrift).toBe(false);
	});

	it('junta los servicios de todas las estaciones del sistema', () => {
		const db = seededDb();
		const { uno } = dosSistemas(db);

		const puesto = createBody(
			db,
			uno.system.id,
			{
				name: 'Refugio',
				kind: 'station',
				parentId: uno.star.id,
				orbitDistance: 120,
				description: '',
				explored: true
			},
			null
		);
		setStation(db, puesto.id, 'casa_verlan', ['market', 'refinery'], null);

		const vela = buildGalaxyMap(db).systems.find((nodo) => nodo.code === uno.system.code)!;
		expect(vela.stations).toBe(1);
		expect(vela.services).toEqual(['market', 'refinery']);
	});

	it('no inventa servicios donde no hay estaciones', () => {
		const db = seededDb();
		const { otro } = dosSistemas(db);

		const ocaso = buildGalaxyMap(db).systems.find((nodo) => nodo.code === otro.system.code)!;
		expect(ocaso.stations).toBe(0);
		expect(ocaso.services).toEqual([]);
	});

	/*
	 * Una lista de servicios que cambia de orden entre dos sistemas no se puede
	 * comparar de un vistazo, que es justo para lo que está.
	 */
	it('los servicios salen en el orden del catálogo y no en el de la base', () => {
		const db = seededDb();
		// Ánfora ya viene sembrada con varias estaciones y varios servicios, así que
		// alcanza con mirar el orden en que salieron.
		const anfora = buildGalaxyMap(db).systems.find((nodo) => nodo.code === 'anfora')!;
		const posiciones = anfora.services.map((servicio) =>
			SERVICE_ORDER.indexOf(servicio as StationServiceKind)
		);

		expect(anfora.services.length).toBeGreaterThan(1);
		expect(posiciones).toEqual([...posiciones].sort((a, b) => a - b));
		// Y ninguno se repite: el sistema junta lo de todas sus estaciones, y dos
		// mercados en dos estaciones siguen siendo «acá hay mercado».
		expect(new Set(anfora.services).size).toBe(anfora.services.length);
	});
});

describe('quién es vecino de quién', () => {
	it('une las dos puntas de cada pasaje', () => {
		const db = seededDb();
		const { uno, otro } = dosSistemas(db);

		const vecinos = neighbourhood(buildGalaxyMap(db));

		expect(vecinos.get(uno.system.code)).toEqual([otro.system.code]);
		expect(vecinos.get(otro.system.code)).toEqual([uno.system.code]);
	});

	/*
	 * Contar saltos por un pasaje que nadie puede cruzar daría una distancia que no
	 * existe: lo que el jugador lee como «a dos saltos» tiene que ser un camino que
	 * pueda hacer.
	 */
	it('un paso cerrado no es un vecino', () => {
		const db = seededDb();
		const { uno, otro, salida } = dosSistemas(db);
		setGateClosed(db, salida.gate.id, true, null);

		const vecinos = neighbourhood(buildGalaxyMap(db));

		expect(vecinos.get(uno.system.code)).toEqual([]);
		expect(hopsFrom(vecinos, uno.system.code).has(otro.system.code)).toBe(false);
	});
});

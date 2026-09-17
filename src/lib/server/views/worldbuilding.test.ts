/** El listado del cuartel: qué recorta cada filtro y qué se niega a leer. */

import { describe, expect, it } from 'vitest';
import { constellation } from '../db/schema';
import { seededDb } from '../db/testing';
import { createBody, createSystem, setStation } from '../services/worldbuilding';
import { getBody } from '../services/universe';
import { SERVICE_ORDER } from '$lib/game/universe';
import type { Db } from '../db/types';
import { buildUniverso, readUniverseQuery } from './worldbuilding';

/** Un sistema vacío, sin una sola estación. */
function sistemaPelado(db: Db, name: string) {
	return createSystem(
		db,
		{
			name,
			constellationId: db.select().from(constellation).get()!.id,
			government: 'corporate',
			security: 70,
			controllingFaction: 'dominion',
			capitalOf: '',
			description: ''
		},
		null
	);
}

/** Le cuelga una estación con los servicios que se le pidan. */
function conEstacion(db: Db, systemId: number, parentId: number, services: 'shipyard'[]) {
	const puesto = createBody(
		db,
		systemId,
		{
			name: 'Refugio',
			kind: 'station',
			parentId,
			orbitDistance: 120,
			description: '',
			explored: true
		},
		null
	);
	setStation(db, puesto.id, 'casa_verlan', services, null);
	return puesto;
}

describe('lo que el listado lee de la URL', () => {
	it('descarta un servicio que no está en el catálogo', () => {
		expect(readUniverseQuery(new URLSearchParams('servicio=casino')).service).toBe('');
		expect(readUniverseQuery(new URLSearchParams('servicio=shipyard')).service).toBe('shipyard');
	});

	/*
	 * Es la garantía de que esto crece solo: un servicio nuevo en el catálogo queda
	 * filtrable el mismo día, sin tocar la vista ni la pantalla. Y uno que todavía
	 * no instaló nadie se pide igual —que no encuentre nada **es** la respuesta, y
	 * es la que dice qué falta construir—.
	 */
	it('acepta cualquier servicio del catálogo, sin enumerarlos en ningún lado', () => {
		for (const servicio of SERVICE_ORDER) {
			expect(readUniverseQuery(new URLSearchParams(`servicio=${servicio}`)).service).toBe(servicio);
		}
	});

	it('el filtro apaga sistemas pero no los borra del mapa', () => {
		const db = seededDb();
		sistemaPelado(db, 'Ocaso');

		const vista = buildUniverso(db, readUniverseQuery(new URLSearchParams('servicio=refinery')));

		expect(vista.found).toBeLessThan(vista.total);
		expect(vista.map.systems.length).toBe(vista.total);
	});
});

describe('el filtro por servicio', () => {
	it('deja sólo los sistemas que lo tienen', () => {
		const db = seededDb();
		const conAstillero = sistemaPelado(db, 'Vela');
		conEstacion(db, conAstillero.system.id, conAstillero.star.id, ['shipyard']);
		sistemaPelado(db, 'Ocaso');

		const vista = buildUniverso(db, readUniverseQuery(new URLSearchParams('servicio=shipyard')));

		// Ánfora ya viene sembrada con astillero, así que pasan las dos que lo tienen
		// y queda afuera la que no.
		expect(vista.matches).toContain('vela');
		expect(vista.matches).toContain('anfora');
		expect(vista.matches).not.toContain('ocaso');
		expect(vista.found).toBe(vista.matches.length);
		expect(vista.found).toBeLessThan(vista.total);
	});

	it('cada fila dice qué servicios tiene, y salen del mismo lugar que los del mapa', () => {
		const db = seededDb();
		const vista = buildUniverso(db);

		const anfora = vista.systems.find((fila) => fila.code === 'anfora')!;
		const enElMapa = vista.map.systems.find((nodo) => nodo.code === 'anfora')!;

		expect(anfora.services).toEqual(enElMapa.services);
		expect(anfora.services.length).toBeGreaterThan(0);
	});

	it('se apila con los demás: un sistema entra si pasa todos', () => {
		const db = seededDb();
		const vela = sistemaPelado(db, 'Vela');
		conEstacion(db, vela.system.id, vela.star.id, ['shipyard']);

		// El astillero está en Vela, pero el nombre que se busca es otro.
		const vista = buildUniverso(
			db,
			readUniverseQuery(new URLSearchParams('servicio=shipyard&buscar=Ocaso'))
		);

		expect(vista.found).toBe(0);
	});

	it('no cuenta una estación de otro sistema', () => {
		const db = seededDb();
		const ocaso = sistemaPelado(db, 'Ocaso');
		// Puerto Ánfora tiene astillero, pero es de Ánfora.
		expect(getBody(db, 'puerto_anfora')).not.toBeNull();

		const vista = buildUniverso(db, readUniverseQuery(new URLSearchParams('servicio=shipyard')));

		expect(vista.matches).not.toContain(ocaso.system.code);
	});
});

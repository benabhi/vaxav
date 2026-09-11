/** La pestaña Ubicación describe el lugar, y en tránsito no describe ninguno. */

import { describe, expect, it } from 'vitest';
import { crearPiloto, moverPiloto, seededDb } from '../db/testing';
import { startTravel } from '../services/actions';
import { bodyDetail, getBody } from '../services/universe';
import { SERVICES } from '$lib/game/universe';
import { MIN_REPUTATION, MAX_REPUTATION } from '$lib/game/reputation';
import { buildAgentRows, buildLocationView, buildModuleTiles } from './navigation';

describe('el mosaico de módulos', () => {
	it('muestra los ocho siempre, marcando los que la estación tiene', () => {
		const baldosas = buildModuleTiles(['market', 'shipyard']);

		expect(baldosas).toHaveLength(Object.keys(SERVICES).length);
		expect(
			baldosas
				.filter((b) => b.available)
				.map((b) => b.code)
				.sort()
		).toEqual(['market', 'shipyard']);
		// Los que faltan también salen: es lo que deja leer de un vistazo qué
		// clase de estación es ésta.
		expect(baldosas.some((b) => !b.available)).toBe(true);
	});

	it('respeta el orden del catálogo, que es el que dibuja la grilla', () => {
		const baldosas = buildModuleTiles([]);
		expect(baldosas.map((b) => b.code)).toEqual(Object.keys(SERVICES));
	});

	it('trae el nombre, el resumen y la fase de cada módulo', () => {
		const astillero = buildModuleTiles(['shipyard']).find((b) => b.code === 'shipyard')!;
		expect(astillero.name).toBe(SERVICES.shipyard.name);
		expect(astillero.summary).toBe(SERVICES.shipyard.summary);
		expect(astillero.phase).toBe(SERVICES.shipyard.phase);
	});
});

describe('los agentes', () => {
	it('salen todos, atiendan o no', () => {
		const db = seededDb();
		const detalle = bodyDetail(db, 'puerto_anfora')!;

		const filas = buildAgentRows(detalle.agents, MIN_REPUTATION);

		expect(filas).toHaveLength(detalle.agents.length);
		expect(filas.length).toBeGreaterThan(1);
		// Sin reputación, sólo abre el de nivel más bajo.
		expect(filas.some((f) => f.open)).toBe(true);
		expect(filas.some((f) => !f.open)).toBe(true);
	});

	it('dice qué falta para que atienda el que no atiende', () => {
		const db = seededDb();
		const detalle = bodyDetail(db, 'puerto_anfora')!;

		const cerrado = buildAgentRows(detalle.agents, MIN_REPUTATION).find((f) => !f.open)!;

		expect(cerrado.requirement).toMatch(/^Requiere \d+ de reputación con /);
		expect(cerrado.requirement).toContain(cerrado.faction);
	});

	it('con reputación al tope los abre a todos', () => {
		const db = seededDb();
		const detalle = bodyDetail(db, 'puerto_anfora')!;

		const filas = buildAgentRows(detalle.agents, MAX_REPUTATION);

		expect(filas.every((f) => f.open)).toBe(true);
	});

	it('escribe el nivel en romanos', () => {
		const db = seededDb();
		const detalle = bodyDetail(db, 'puerto_anfora')!;

		for (const fila of buildAgentRows(detalle.agents)) {
			expect(fila.level).toMatch(/^[IVX]+$/);
		}
	});
});

describe('la ficha del lugar', () => {
	it('describe la estación donde está parado el piloto', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		const vista = buildLocationView(db, piloto);

		expect(vista.name).toBe('Puerto Ánfora');
		expect(vista.isStation).toBe(true);
		expect(vista.inTransit).toBe(false);
		expect(vista.system).toBe('Ánfora');
		expect(vista.corporation).not.toBe('');
		expect(vista.moduleCount).toMatch(new RegExp(`^\\d+ de ${Object.keys(SERVICES).length}$`));
		expect(vista.agentCount).toMatch(/^\d+ de \d+$/);
	});

	it('en un cinturón no hay mosaico ni agentes', async () => {
		const db = seededDb();
		let piloto = await crearPiloto(db);
		piloto = moverPiloto(db, piloto, 'anillos_anfora_iii');

		const vista = buildLocationView(db, piloto);

		expect(vista.name).toBe('Anillos de Ánfora III');
		expect(vista.isStation).toBe(false);
		expect(vista.modules).toEqual([]);
		expect(vista.agents).toEqual([]);
		expect(vista.corporation).toBe('');
	});

	it('en tránsito no describe la estación que se dejó atrás', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const destino = getBody(db, 'muelle_de_los_anillos')!;
		startTravel(db, piloto, destino);

		const vista = buildLocationView(db, piloto);

		expect(vista.inTransit).toBe(true);
		expect(vista.name).toBe('En tránsito');
		// Vaciar módulos y agentes es parte de decir la verdad: no se está en
		// ninguna estación.
		expect(vista.isStation).toBe(false);
		expect(vista.modules).toEqual([]);
		expect(vista.agents).toEqual([]);
		expect(vista.moduleCount).toBe('');
	});
});

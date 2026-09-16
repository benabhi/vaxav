/** La pestaña Ubicación describe el lugar, y en tránsito no describe ninguno. */

import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { body, constellation, pilot, system } from '../db/schema';
import { crearPiloto, moverPiloto, seededDb } from '../db/testing';
import { startTravel } from '../services/actions';
import { bodyDetail, getBody, systemTree } from '../services/universe';
import { SERVICES, allBodies } from '$lib/game/universe';
import { MIN_REPUTATION, MAX_REPUTATION } from '$lib/game/reputation';
import {
	buildAgentRows,
	buildBodyRows,
	buildLocationView,
	buildModuleTiles,
	buildSystemView
} from './navigation';

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

	it('trae el nombre y el resumen de cada módulo', () => {
		const astillero = buildModuleTiles(['shipyard']).find((b) => b.code === 'shipyard')!;
		expect(astillero.name).toBe(SERVICES.shipyard.name);
		expect(astillero.summary).toBe(SERVICES.shipyard.summary);
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
		// Nombra **el destino**, no el lugar que se dejó atrás: mostrar el origen
		// como si se estuviera ahí es la mentira que este test cuida.
		expect(vista.name).toBe('Rumbo a Muelle de los Anillos');
		expect(vista.leg?.destination.name).toBe('Muelle de los Anillos');
		expect(vista.leg?.origin.name).toBe('Puerto Ánfora');

		// Vaciar módulos y agentes es parte de decir la verdad: no se está en
		// ninguna estación.
		expect(vista.isStation).toBe(false);
		expect(vista.modules).toEqual([]);
		expect(vista.agents).toEqual([]);
		expect(vista.moduleCount).toBe('');
	});

	it('el tramo lleva el sistema de las dos puntas, no sólo el de llegada', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const destino = getBody(db, 'muelle_de_los_anillos')!;
		startTravel(db, piloto, destino);

		const tramo = buildLocationView(db, piloto).leg!;

		// En un viaje interno las dos puntas caen en el mismo sistema; el día que
		// sea un salto van a ser distintos, y por eso el dato viaja duplicado en vez
		// de una sola vez en la llegada.
		expect(tramo.origin.system).toBe('Ánfora');
		expect(tramo.destination.system).toBe('Ánfora');
		// Con qué se está tratando: es lo único que lo dice mientras la nave vuela,
		// porque la ficha del lugar se apaga en tránsito.
		expect(tramo.destination.faction).not.toBe('');
		expect(tramo.destination.security).not.toBe('');
		expect(tramo.destination.kindLabel).toBe('Estación');
		expect(tramo.duration).not.toBe('');
	});

	it('un viaje dentro del sistema no inventa distancia ni combustible', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		startTravel(db, piloto, getBody(db, 'muelle_de_los_anillos')!);

		const tramo = buildLocationView(db, piloto).leg!;

		// Vacío y no cero: sólo los saltos queman, y una fila en blanco miente más
		// que una fila que no está.
		expect(tramo.distance).toBe('');
		expect(tramo.fuel).toBe('');
	});
});

describe('el árbol del sistema', () => {
	it('aplana el sistema entero en orden de árbol', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		const vista = buildSystemView(db, piloto);

		expect(vista.name).toBe('Ánfora');
		expect(vista.bodies).toHaveLength(allBodies().length);
		// La estrella primero y en la raíz.
		expect(vista.bodies[0].depth).toBe(0);
		expect(vista.bodies[0].kind).toBe('Estrella');
	});

	it('no salta niveles: cada fila cuelga de la anterior o de un ancestro', () => {
		const db = seededDb();
		const vista = buildBodyRows(db, systemTree(db, 'anfora'), '', null, 190);

		for (let i = 1; i < vista.length; i++) {
			// Bajar de a un nivel por vez; subir, los que haga falta.
			expect(vista[i].depth).toBeLessThanOrEqual(vista[i - 1].depth + 1);
		}
	});

	it('lleva una guía por columna de ancestro, sin contar la estrella', () => {
		const db = seededDb();
		const filas = buildBodyRows(db, systemTree(db, 'anfora'), '', null, 190);

		for (const fila of filas) {
			// La columna de la estrella se descarta: no tiene hermanos ni columna
			// donde caer. De ahí que las guías sean una menos que la profundidad.
			expect(fila.rails).toHaveLength(Math.max(0, fila.depth - 1));
		}
	});

	it('la guía de un ancestro sigue bajando sólo si le quedan hermanos', () => {
		const db = seededDb();
		const filas = buildBodyRows(db, systemTree(db, 'anfora'), '', null, 190);

		// Para cada fila con guías, la marca de la columna k dice si el ancestro de
		// profundidad k+1 todavía tiene algo por debajo en la lista.
		for (const [indice, fila] of filas.entries()) {
			fila.rails.forEach((sigue, columna) => {
				const profundidad = columna + 1;
				const ancestro = filas
					.slice(0, indice)
					.reverse()
					.find((f) => f.depth === profundidad);
				expect(sigue).toBe(ancestro !== undefined && !ancestro.isLast);
			});
		}
	});

	it('la fila del piloto no ofrece viajar ni distancia', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		const vista = buildSystemView(db, piloto);
		const aqui = vista.bodies.filter((body) => body.isHere);

		expect(aqui).toHaveLength(1);
		expect(aqui[0].name).toBe('Puerto Ánfora');
		expect(aqui[0].distance).toBe('');
		expect(aqui[0].travelLabel).toBe('');
		// Y todas las demás sí.
		for (const body of vista.bodies.filter((b) => !b.isHere)) {
			expect(body.distance).not.toBe('');
			expect(body.travelLabel).toMatch(/^\d+s$/);
		}
	});

	it('con una orden en curso el árbol lo dice, que es lo que apaga los botones', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		expect(buildSystemView(db, piloto).actionInProgress).toBe(false);

		startTravel(db, piloto, getBody(db, 'habitat_talo')!);

		const vista = buildSystemView(db, piloto);
		expect(vista.actionInProgress).toBe(true);
		expect(vista.hasShip).toBe(true);
	});
});

describe('en qué sistema se para el árbol', () => {
	it('sale de dónde está el piloto y no de una constante', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		// Un segundo sistema, mínimo pero real. Con el sistema cableado a Ánfora,
		// esto dibujaba los cuerpos del sistema equivocado y el cálculo de
		// distancia no encontraba ancestro común: la pantalla reventaba y el piloto
		// quedaba encerrado sin forma de volver.
		const cadena = db.select().from(constellation).get()!;
		const otro = db
			.insert(system)
			.values({ code: 'brida', name: 'Brida', constellationId: cadena.id })
			.returning()
			.get();
		const estrella = db
			.insert(body)
			.values({ code: 'brida_estrella', name: 'Brida', systemId: otro.id, kind: 'star' })
			.returning()
			.get();
		db.update(pilot).set({ locationId: estrella.id }).where(eq(pilot.id, piloto.id)).run();

		const vista = buildSystemView(db, { ...piloto, locationId: estrella.id });

		expect(vista.name).toBe('Brida');
		expect(vista.bodies.map((fila) => fila.name)).toEqual(['Brida']);
	});
});

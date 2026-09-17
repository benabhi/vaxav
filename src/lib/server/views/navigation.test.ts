/** La pestaña Ubicación describe el lugar, y en tránsito no describe ninguno. */

import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { body, constellation, pilot, system } from '../db/schema';
import { crearPiloto, moverPiloto, seededDb } from '../db/testing';
import type { Db } from '../db/types';
import { startTravel } from '../services/actions';
import { bodyDetail, getBody, systemTree } from '../services/universe';
import { SERVICES, allBodies } from '$lib/game/universe';
import { MAX_REPUTATION, REPUTATION_SCALE } from '$lib/game/reputation';
import { connectGates, createGate, createSystem, setGateClosed } from '../services/worldbuilding';
import {
	buildAgentRows,
	buildBodyRows,
	buildGalaxia,
	buildLocationView,
	buildModuleTiles,
	buildSystemView,
	readGalaxyQuery
} from './navigation';
import { NO_STANDINGS, type PilotStandings } from '../services/reputation';

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

/** Un piloto con esa reputación con la facción y nada con nadie más. */
function conLaBandera(code: string, puntos: number): PilotStandings {
	return { corporations: {}, factions: { [code]: puntos * REPUTATION_SCALE } };
}

/** Y uno con esa reputación con una sola corporación. */
function conLaCorporacion(code: string, puntos: number): PilotStandings {
	return { corporations: { [code]: puntos * REPUTATION_SCALE }, factions: {} };
}

describe('los agentes', () => {
	it('salen todos, atiendan o no', () => {
		const db = seededDb();
		const detalle = bodyDetail(db, 'puerto_anfora')!;

		const filas = buildAgentRows(detalle.agents, NO_STANDINGS);

		expect(filas).toHaveLength(detalle.agents.length);
		expect(filas.length).toBeGreaterThan(1);
		// Sin reputación, sólo abre el de nivel más bajo.
		expect(filas.some((f) => f.open)).toBe(true);
		expect(filas.some((f) => !f.open)).toBe(true);
	});

	it('dice qué falta para que atienda el que no atiende', () => {
		const db = seededDb();
		const detalle = bodyDetail(db, 'puerto_anfora')!;

		const cerrado = buildAgentRows(detalle.agents, NO_STANDINGS).find((f) => !f.open)!;

		// Las dos puertas, dichas: la corporación abre a los suyos y la bandera abre
		// ese nivel en todas las que la llevan.
		expect(cerrado.requirement).toMatch(/^Requiere \d+ de reputación con /);
		expect(cerrado.requirement).toContain(cerrado.corporation);
		expect(cerrado.requirement).toContain(cerrado.faction);
	});

	/*
	 * La bandera abre a todas las corporaciones que la llevan **y a ninguna más**.
	 * En Puerto Ánfora hay una agente de la Extractora Anillo, que es concorde,
	 * sentada en un puerto del Dominio: con el Dominio al tope ella sigue cerrada,
	 * y eso es exactamente lo que tiene que pasar.
	 */
	it('la bandera abre a los suyos, no a los de la de al lado', () => {
		const db = seededDb();
		const detalle = bodyDetail(db, 'puerto_anfora')!;

		const filas = buildAgentRows(detalle.agents, conLaBandera('dominion', MAX_REPUTATION));
		const delDominio = detalle.agents
			.filter((uno) => uno.corporation.faction === 'dominion')
			.map((uno) => uno.agent.name);
		const ajenos = detalle.agents
			.filter((uno) => uno.corporation.faction && uno.corporation.faction !== 'dominion')
			.map((uno) => uno.agent.name);

		expect(delDominio.length).toBeGreaterThan(0);
		expect(ajenos.length).toBeGreaterThan(0);
		for (const fila of filas) {
			if (delDominio.includes(fila.name)) expect(fila.open, `${fila.name}`).toBe(true);
			if (ajenos.includes(fila.name)) expect(fila.open, `${fila.name}`).toBe(false);
		}
	});

	/*
	 * La escalera barata: sin nada con la bandera, la reputación con una sola
	 * corporación abre a **sus** agentes y no a los de las otras.
	 */
	it('la reputación con una corporación abre sólo la suya', () => {
		const db = seededDb();
		const detalle = bodyDetail(db, 'puerto_anfora')!;

		const cerrado = buildAgentRows(detalle.agents, NO_STANDINGS).find((f) => !f.open)!;
		const suCodigo = detalle.agents.find((uno) => uno.agent.name === cerrado.name)!.corporation
			.code;

		const abierto = buildAgentRows(detalle.agents, conLaCorporacion(suCodigo, MAX_REPUTATION)).find(
			(f) => f.name === cerrado.name
		)!;

		expect(abierto.open).toBe(true);
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

describe('la puerta, para el dibujo', () => {
	// El rumbo es **la identidad de una puerta** —la Noreste no es la Sur— y hasta
	// que hubo figura vivía solamente adentro del nombre. El dibujo lo necesita
	// como valor, y el tajo del paso cerrado necesita un sí o un no: una frase en
	// `blocked` no se puede dibujar.
	it('dice por qué lado se sale y si el paso está cerrado', async () => {
		const db = seededDb();
		const { salida } = conSalida(db);
		const piloto = moverPiloto(db, await crearPiloto(db), salida.body.code);

		const abierta = buildLocationView(db, piloto).gate!;

		expect(abierta.bearing).toBe('n');
		expect(abierta.bearingLabel).toBe('Norte');
		expect(abierta.closed).toBe(false);

		setGateClosed(db, salida.gate.id, true, null);

		expect(buildLocationView(db, piloto).gate!.closed).toBe(true);
	});
});

describe('de dónde sale cada verbo del cinturón', () => {
	it('nombra el módulo que lo habilita y las habilidades que lo mejoran', async () => {
		const db = seededDb();
		const piloto = moverPiloto(db, await crearPiloto(db), 'anillos_anfora_iii');

		const campo = buildLocationView(db, piloto).field;

		// **El módulo no es un detalle:** es la diferencia entre poder y no poder, y
		// el piloto que lo tiene montado nunca se enteraba de que existía.
		expect(campo.scanSource.modules.every((uno) => uno.fitted)).toBe(true);
		expect(campo.mineSource.modules.every((uno) => uno.fitted)).toBe(true);
		expect(campo.scanSource.verb).toBe('Escanear');
		expect(campo.mineSource.verb).toBe('Extraer');

		// Las habilidades salen aunque el piloto no las tenga: son la lista de lo
		// que queda por entrenar, que es la mitad útil del renglón.
		expect(campo.scanSource.levers.length).toBeGreaterThan(0);
		expect(campo.mineSource.levers.length).toBeGreaterThan(0);
	});

	it('dice qué daría el escalón siguiente', async () => {
		const db = seededDb();
		const piloto = moverPiloto(db, await crearPiloto(db), 'anillos_anfora_iii');

		const campo = buildLocationView(db, piloto).field;

		// Sin esto la línea informa y se queda ahí; con esto es un motivo para
		// entrenar, que es toda la diferencia entre mostrar la cadena y sólo tenerla.
		expect(campo.scanSource.next.length).toBeGreaterThan(0);
		expect(campo.mineSource.next.length).toBeGreaterThan(0);
	});

	it('fuera de un cinturón no inventa ningún verbo', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		const campo = buildLocationView(db, piloto).field;

		expect(campo.scannable).toBe(false);
		expect(campo.scanSource.verb).toBe('');
		expect(campo.mineSource.modules).toEqual([]);
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

/**
 * Ánfora con una salida, y un sistema del otro lado.
 *
 * Es el escenario mínimo de la pestaña: sin una puerta terminada, el mapa del
 * piloto no tiene nada que contestar.
 */
function conSalida(db: Db) {
	const cadena = db.select().from(constellation).get()!;
	const anfora = db.select().from(system).where(eq(system.code, 'anfora')).get()!;
	const estrella = getBody(db, 'anfora_estrella')!;

	const otro = createSystem(
		db,
		{
			name: 'Ocaso',
			constellationId: cadena.id,
			government: 'feudal',
			security: 20,
			controllingFaction: '',
			capitalOf: '',
			description: ''
		},
		null
	);

	const draft = {
		kind: 'gate' as const,
		orbitDistance: 400,
		description: '',
		explored: true
	};
	const salida = createGate(
		db,
		anfora.id,
		{ ...draft, name: 'Puerta Norte', parentId: estrella.id },
		'n',
		null
	);
	const vuelta = createGate(
		db,
		otro.system.id,
		{ ...draft, name: 'Puerta Sur', parentId: otro.star.id },
		's',
		null
	);
	connectGates(db, salida.gate.id, vuelta.gate.id, 14, null);

	return { anfora, otro, salida };
}

describe('lo que el mapa de la galaxia lee de la URL', () => {
	it('deja pasar lo que existe', () => {
		const query = readGalaxyQuery(
			new URLSearchParams(
				'buscar=Ocaso&faccion=dominion&region=Confin&seguridad=high&servicio=market&corporacion=casa_verlan&pintar=region&territorio=constelacion'
			)
		);

		expect(query).toEqual({
			search: 'Ocaso',
			faction: 'dominion',
			region: 'Confin',
			security: 'high',
			service: 'market',
			corporation: 'casa_verlan',
			paint: 'region',
			territory: 'constelacion'
		});
	});

	/*
	 * Un servicio inventado o una banda que no existe entran igual de fácil que los
	 * buenos: el borde es acá y no en la pantalla.
	 */
	it('descarta lo que no está en ningún catálogo', () => {
		const query = readGalaxyQuery(
			new URLSearchParams('seguridad=altisima&servicio=casino&pintar=gobierno&territorio=barrio')
		);

		expect(query.security).toBe('');
		expect(query.service).toBe('');
		// Pintar por gobierno es del cuartel: acá no está en la lista.
		expect(query.paint).toBe('');
		expect(query.territory).toBe('');
	});
});

describe('la pestaña Galaxia', () => {
	it('se para donde está el piloto', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		const vista = buildGalaxia(db, piloto);

		expect(vista.pilot.system).toBe('anfora');
		expect(vista.here?.name).toBe('Ánfora');
		expect(vista.pilot.jumps.anfora).toBe(0);
	});

	it('cuenta los saltos hasta cada sistema, y sólo hasta los que se alcanzan', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const { otro } = conSalida(db);

		const vista = buildGalaxia(db, piloto);

		expect(vista.pilot.jumps[otro.system.code]).toBe(1);
		// Un sistema sin ninguna puerta no está en la lista: **no se llega**, que no
		// es lo mismo que estar lejos.
		const suelto = createSystem(
			db,
			{
				name: 'Brida',
				constellationId: db.select().from(constellation).get()!.id,
				government: 'corporate',
				security: 70,
				controllingFaction: 'dominion',
				capitalOf: '',
				description: ''
			},
			null
		);
		expect(buildGalaxia(db, piloto).pilot.jumps[suelto.system.code]).toBeUndefined();
	});

	it('dice qué cuesta llegar a la puerta y qué cuesta el salto', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const { otro } = conSalida(db);

		const salida = buildGalaxia(db, piloto).exits.find((una) => una.code === otro.system.code)!;

		expect(salida.gate).toBe('Puerta Norte');
		expect(salida.bearing).toBe('Norte');
		expect(salida.distance).toBe('1,4 al');
		// Las dos mitades: el viaje hasta la puerta y el salto de después.
		expect(salida.travelDistance).toMatch(/ ud$/);
		expect(salida.travelDuration).not.toBe('');
		expect(salida.fuel).toMatch(/ u$/);
		expect(salida.standingThere).toBe(false);
	});

	/*
	 * El motivo sale de `jumpProblem`, la misma función pura que apaga el botón en
	 * Ubicación y que usa el servicio para rechazar la orden: el mapa, la pantalla y
	 * el servidor dicen exactamente lo mismo.
	 */
	it('dice por qué no se puede cruzar, antes de viajar hasta la puerta', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const { otro, salida } = conSalida(db);

		// Con la lanzadera de astillero el salto entra: no hay motivo que dar.
		expect(buildGalaxia(db, piloto).pilot.reach[otro.system.code]).toBe('');

		setGateClosed(db, salida.gate.id, true, null);
		const cerrada = buildGalaxia(db, piloto);

		expect(cerrada.pilot.reach[otro.system.code]).toBe('El paso por esta puerta está cerrado.');
		// El mismo motivo en los dos lados: la ficha lo dice y el mapa apaga la
		// línea con esa misma razón, que sale de `jumpProblem` una sola vez.
		expect(cerrada.exits[0].blocked).toBe(cerrada.pilot.reach[otro.system.code]);
		// Y deja de contarse como camino: «a un salto» por una puerta cerrada sería
		// una distancia que no existe.
		expect(cerrada.pilot.jumps[otro.system.code]).toBeUndefined();
	});

	it('el filtro apaga sistemas pero no los borra del mapa', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		conSalida(db);

		const todo = buildGalaxia(db, piloto);
		const recortado = buildGalaxia(
			db,
			piloto,
			readGalaxyQuery(new URLSearchParams('buscar=Ocaso'))
		);

		// El mapa llega entero: recortarlo le sacaría la forma del conjunto, que es
		// justo para lo que se mira un mapa.
		expect(recortado.map.systems.length).toBe(todo.map.systems.length);
		expect(recortado.matches).toEqual(['ocaso']);
		expect(recortado.found).toBe(1);
		expect(recortado.total).toBe(todo.total);
	});

	it('filtra por servicio, que es lo que contesta si vale la pena ir', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		conSalida(db);

		const conMercado = buildGalaxia(
			db,
			piloto,
			readGalaxyQuery(new URLSearchParams('servicio=market'))
		);

		expect(conMercado.matches).toContain('anfora');
		// Ocaso no tiene ni una estación: no hay dónde atracar, menos un mercado.
		expect(conMercado.matches).not.toContain('ocaso');
	});

	/*
	 * El que enciende el botón «ver en el mapa» de la pestaña Corporación: sin
	 * esto, el botón prometía mostrar dónde está la tuya y abría la galaxia entera.
	 */
	it('filtra por corporación, que es dónde tiene puestos', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		conSalida(db);

		const suyos = buildGalaxia(
			db,
			piloto,
			readGalaxyQuery(new URLSearchParams('corporacion=casa_verlan'))
		);

		expect(suyos.matches).toContain('anfora');
		expect(suyos.matches).not.toContain('ocaso');

		// Una que existe en el catálogo pero no opera nada no deja nada en pie: es
		// la respuesta correcta, y el desplegable ni siquiera la ofrece.
		const ninguno = buildGalaxia(
			db,
			piloto,
			readGalaxyQuery(new URLSearchParams('corporacion=mineria_baronal'))
		);

		expect(ninguno.matches).toEqual([]);
	});

	it('filtra por bandera y por cuánta ley hay', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		conSalida(db);

		const libres = buildGalaxia(db, piloto, readGalaxyQuery(new URLSearchParams('faccion=libre')));
		expect(libres.matches).toEqual(['ocaso']);

		const bajas = buildGalaxia(db, piloto, readGalaxyQuery(new URLSearchParams('seguridad=low')));
		expect(bajas.matches).toEqual(['ocaso']);
	});

	it('el verbo del mapa es viajar, y dice de dónde sale', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		const vista = buildGalaxia(db, piloto);

		expect(vista.travelSource.verb).toBe('Viajar');
		expect(vista.travelSource.modules.map((uno) => uno.requirement)).toEqual(['Propulsores']);
	});

	// El mapa también ofrece **saltar**, para cuando ya estás parado en la puerta.
	// No da la orden —manda a Ubicación— pero con una orden en curso aquella
	// pantalla muestra el viaje y no la puerta, así que el camino no lleva a ninguna
	// parte: el control tiene que apagarse **acá** y decir por qué.
	it('con una orden en curso el mapa apaga el salto y dice el motivo', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		const libre = buildGalaxia(db, piloto);
		expect(libre.jumpSource.verb).toBe('Saltar');
		expect(libre.jumpSource.blockers).toEqual([]);

		startTravel(db, piloto, getBody(db, 'muelle_de_los_anillos')!);

		expect(buildGalaxia(db, piloto).jumpSource.blockers).toContain('Ya hay una orden en curso.');
	});
});

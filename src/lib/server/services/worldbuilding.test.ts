/** Construir el universo: lo que se puede armar, lo que no, y qué queda anotado. */

import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { beltDeposit, body as bodyTable, pilot as pilotTable, system } from '../db/schema';
import { crearPiloto, seededDb } from '../db/testing';
import { eventsPage } from './events';
import { getBody, systemTree } from './universe';
import { isValidHex, neighbourOf } from '$lib/game/galaxy';
import {
	BuilderError,
	allRegions,
	bodiesOf,
	bodyBlockers,
	connectGates,
	constellationsIn,
	createBody,
	createConstellation,
	createGate,
	createRegion,
	createSystem,
	deleteBody,
	deleteSystem,
	disconnectGate,
	isShortcut,
	gatesOf,
	growFromGate,
	looseGates,
	orphanGates,
	setDeposits,
	setStation,
	starOf,
	systemBlockers,
	takenBearings,
	updateBody,
	updateSystem,
	type SystemDraft
} from './worldbuilding';
import type { Db } from '../db/types';

/** La constelación que trae la siembra, que es donde cae todo lo de prueba. */
function laConstelacion(db: Db): number {
	return constellationsIn(db)[0].id;
}

/** Un sistema mínimo, listo para retocarle lo que el test necesite. */
function borrador(db: Db, cambios: Partial<SystemDraft> = {}): SystemDraft {
	return {
		name: 'Vela',
		constellationId: laConstelacion(db),
		government: 'corporate',
		security: 70,
		controllingFaction: 'dominion',
		capitalOf: '',
		description: '',
		...cambios
	};
}

describe('regiones y constelaciones', () => {
	it('se crean con el código derivado del nombre', () => {
		const db = seededDb();
		const creada = createRegion(db, '  Borde de Hierro  ', null);

		expect(creada.code).toBe('borde_de_hierro');
		expect(creada.name).toBe('Borde de Hierro');
		expect(allRegions(db).length).toBe(2);
	});

	it('no deja repetir un nombre', () => {
		const db = seededDb();
		createRegion(db, 'Borde de Hierro', null);

		expect(() => createRegion(db, 'borde de hierro', null)).toThrow(BuilderError);
	});

	it('una constelación cuelga de una región que exista', () => {
		const db = seededDb();
		const region = createRegion(db, 'Borde de Hierro', null);
		const creada = createConstellation(db, region.id, 'Cadena Rota', null);

		expect(constellationsIn(db, region.id).map((una) => una.id)).toEqual([creada.id]);
		expect(() => createConstellation(db, 9999, 'Otra', null)).toThrow(BuilderError);
	});
});

describe('crear un sistema', () => {
	/*
	 * Un sistema sin nada en la raíz no se puede dibujar, no se puede visitar y no
	 * es un sistema. Por eso la estrella no es un segundo paso.
	 */
	it('nace con su estrella, que se llama como él', () => {
		const db = seededDb();
		const { system, star } = createSystem(db, borrador(db), null);

		expect(system.code).toBe('vela');
		expect(star.kind).toBe('star');
		expect(star.name).toBe('Vela');
		expect(star.parentId).toBeNull();
		expect(starOf(db, system.id).id).toBe(star.id);
	});

	it('no deja dos sistemas con el mismo nombre', () => {
		const db = seededDb();
		createSystem(db, borrador(db), null);

		expect(() => createSystem(db, borrador(db), null)).toThrow(BuilderError);
	});

	it('rechaza una facción que no existe', () => {
		const db = seededDb();
		expect(() => createSystem(db, borrador(db, { controllingFaction: 'nadie' }), null)).toThrow(
			BuilderError
		);
	});

	/*
	 * La banda del gobierno es lo que impide la contradicción que preocupaba: el
	 * número se guarda, pero no cualquier número entra.
	 */
	it('rechaza una seguridad fuera de la banda del gobierno', () => {
		const db = seededDb();
		expect(() =>
			createSystem(db, borrador(db, { government: 'anarchy', security: 90 }), null)
		).toThrow(BuilderError);

		expect(() =>
			createSystem(db, borrador(db, { controllingFaction: '', security: 90 }), null)
		).toThrow(BuilderError);
	});

	it('una capital tiene que ser de quien controla el sistema', () => {
		const db = seededDb();
		expect(() => createSystem(db, borrador(db, { capitalOf: 'concord' }), null)).toThrow(
			BuilderError
		);
	});

	it('una facción tiene una sola capital', () => {
		const db = seededDb();
		createSystem(db, borrador(db, { capitalOf: 'dominion' }), null);

		expect(() =>
			createSystem(db, borrador(db, { name: 'Otra', capitalOf: 'dominion' }), null)
		).toThrow(BuilderError);
	});

	it('deja constancia de lo que creó', () => {
		const db = seededDb();
		createSystem(db, borrador(db), null);

		const fila = eventsPage(db, { kinds: ['system.created'] }).rows[0];
		expect(fila.payload.name).toBe('Vela');
	});
});

describe('editar un sistema', () => {
	it('cambia los datos pero nunca el código', () => {
		const db = seededDb();
		const { system } = createSystem(db, borrador(db), null);

		updateSystem(db, system.id, borrador(db, { name: 'Vela Mayor', security: 95 }), null);

		const despues = bodiesOf(db, system.id);
		expect(despues.length).toBe(1);
		expect(systemTree(db, 'vela')).toHaveLength(1);
	});

	/*
	 * Al editar hay que excluirse a sí mismo de la comprobación de capital, o un
	 * sistema que ya es capital no podría volver a guardarse.
	 */
	it('un sistema que ya es capital se puede seguir editando', () => {
		const db = seededDb();
		const { system } = createSystem(db, borrador(db, { capitalOf: 'dominion' }), null);

		expect(() =>
			updateSystem(db, system.id, borrador(db, { capitalOf: 'dominion', security: 80 }), null)
		).not.toThrow();
	});
});

describe('borrar un sistema', () => {
	it('se lleva sus cuerpos', () => {
		const db = seededDb();
		const { system } = createSystem(db, borrador(db), null);

		deleteSystem(db, system.id, null);

		expect(getBody(db, 'vela')).toBeNull();
		expect(bodiesOf(db, system.id)).toHaveLength(0);
	});

	/*
	 * Las claves foráneas están activas y `body.parent_id` apunta a otro cuerpo:
	 * borrar un planeta antes que su luna revienta la restricción a mitad de la
	 * transacción. El orden en que salen de la consulta no es el del árbol.
	 */
	it('se lleva un árbol de varios niveles sin romper las foráneas', () => {
		const db = seededDb();
		const { system, star } = createSystem(db, borrador(db), null);

		const planeta = createBody(
			db,
			system.id,
			{
				name: 'Vela I',
				kind: 'planet',
				parentId: star.id,
				orbitDistance: 40,
				description: '',
				explored: true
			},
			null
		);
		const luna = createBody(
			db,
			system.id,
			{
				name: 'Vela I-a',
				kind: 'moon',
				parentId: planeta.id,
				orbitDistance: 3,
				description: '',
				explored: true
			},
			null
		);
		createBody(
			db,
			system.id,
			{
				name: 'Muelle Hondo',
				kind: 'station',
				parentId: luna.id,
				orbitDistance: 1,
				description: '',
				explored: true
			},
			null
		);

		expect(() => deleteSystem(db, system.id, null)).not.toThrow();
		expect(bodiesOf(db, system.id)).toHaveLength(0);
	});

	/*
	 * Borrar el sistema donde está parado alguien lo dejaría apuntando a una fila
	 * que no existe, y no hay pantalla desde donde sacarlo de ahí.
	 */
	it('no se borra si hay un piloto adentro', async () => {
		const db = seededDb();
		const { system, star } = createSystem(db, borrador(db), null);
		const piloto = await crearPiloto(db);
		db.update(pilotTable).set({ locationId: star.id }).where(eq(pilotTable.id, piloto.id)).run();

		expect(systemBlockers(db, system.id)).not.toHaveLength(0);
		expect(() => deleteSystem(db, system.id, null)).toThrow(BuilderError);
	});

	it('no se borra si hay una puerta de otro sistema que le apunta', () => {
		const db = seededDb();
		const { system, star } = createSystem(db, borrador(db), null);
		const salida = createGate(db, system.id, puerta(star.id), 'n', null);
		const vecino = growFromGate(db, salida.gate.id, borrador(db, { name: 'Ocaso' }), 12, null);

		expect(systemBlockers(db, vecino.id)).not.toHaveLength(0);
		expect(() => deleteSystem(db, vecino.id, null)).toThrow(BuilderError);
	});
});

/** Un cuerpo de puerta, que es lo único que `createGate` no arma solo. */
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

describe('los cuerpos', () => {
	it('sólo cuelgan de donde pueden colgar', () => {
		const db = seededDb();
		const { system, star } = createSystem(db, borrador(db), null);

		const planeta = createBody(
			db,
			system.id,
			{
				name: 'Vela I',
				kind: 'planet',
				parentId: star.id,
				orbitDistance: 40,
				description: '',
				explored: true
			},
			null
		);

		expect(planeta.code).toBe('vela_i');

		// Una luna del planeta, sí; una estrella colgada del planeta, no.
		expect(() =>
			createBody(
				db,
				system.id,
				{
					name: 'Vela I-a',
					kind: 'moon',
					parentId: planeta.id,
					orbitDistance: 3,
					description: '',
					explored: true
				},
				null
			)
		).not.toThrow();

		expect(() =>
			createBody(
				db,
				system.id,
				{
					name: 'Otra estrella',
					kind: 'star',
					parentId: planeta.id,
					orbitDistance: 0,
					description: '',
					explored: true
				},
				null
			)
		).toThrow(BuilderError);
	});

	it('no se cuelgan de un cuerpo de otro sistema', () => {
		const db = seededDb();
		const { system } = createSystem(db, borrador(db), null);
		const ajeno = getBody(db, 'anfora_ii')!;

		expect(() =>
			createBody(
				db,
				system.id,
				{
					name: 'Vela I',
					kind: 'planet',
					parentId: ajeno.id,
					orbitDistance: 40,
					description: '',
					explored: true
				},
				null
			)
		).toThrow(BuilderError);
	});

	/*
	 * Un ciclo dejaría colgado el recorrido que dibuja el árbol del sistema, y no
	 * se notaría hasta que alguien abriera esa pantalla.
	 */
	it('no se cuelgan de algo que cuelga de ellos', () => {
		const db = seededDb();
		const { system, star } = createSystem(db, borrador(db), null);
		const planeta = createBody(
			db,
			system.id,
			{
				name: 'Vela I',
				kind: 'planet',
				parentId: star.id,
				orbitDistance: 40,
				description: '',
				explored: true
			},
			null
		);
		const luna = createBody(
			db,
			system.id,
			{
				name: 'Vela I-a',
				kind: 'moon',
				parentId: planeta.id,
				orbitDistance: 3,
				description: '',
				explored: true
			},
			null
		);

		expect(() =>
			updateBody(
				db,
				planeta.id,
				{
					name: 'Vela I',
					kind: 'planet',
					parentId: luna.id,
					orbitDistance: 40,
					description: '',
					explored: true
				},
				null
			)
		).toThrow(BuilderError);
	});

	it('no se borra uno que tiene algo orbitándolo', () => {
		const db = seededDb();
		const { system, star } = createSystem(db, borrador(db), null);
		const planeta = createBody(
			db,
			system.id,
			{
				name: 'Vela I',
				kind: 'planet',
				parentId: star.id,
				orbitDistance: 40,
				description: '',
				explored: true
			},
			null
		);
		createBody(
			db,
			system.id,
			{
				name: 'Vela I-a',
				kind: 'moon',
				parentId: planeta.id,
				orbitDistance: 3,
				description: '',
				explored: true
			},
			null
		);

		expect(bodyBlockers(db, planeta.id)).not.toHaveLength(0);
		expect(() => deleteBody(db, planeta.id, null)).toThrow(BuilderError);
	});

	it('una estación se queda con su corporación y sus módulos', () => {
		const db = seededDb();
		const { system, star } = createSystem(db, borrador(db), null);
		const muelle = createBody(
			db,
			system.id,
			{
				name: 'Muelle Largo',
				kind: 'station',
				parentId: star.id,
				orbitDistance: 8,
				description: '',
				explored: true
			},
			null
		);

		setStation(db, muelle.id, 'casa_verlan', ['market', 'storage'], null);
		// Volver a guardarla deja exactamente los módulos del segundo pedido: se
		// reescriben enteros, no se acumulan.
		setStation(db, muelle.id, 'casa_verlan', ['market', 'refinery'], null);

		const ficha = systemTree(db, 'vela').find((nodo) => nodo.body.id === muelle.id)!;
		expect(ficha.corporation?.code).toBe('casa_verlan');
		expect([...ficha.services].sort()).toEqual(['market', 'refinery']);

		// Una estrella no es una estación, por mucho que se insista.
		expect(() => setStation(db, star.id, 'casa_verlan', [], null)).toThrow(BuilderError);
	});
});

describe('las puertas', () => {
	it('ocupan un rumbo y no dejan otra del mismo lado', () => {
		const db = seededDb();
		const { system, star } = createSystem(db, borrador(db), null);

		createGate(db, system.id, puerta(star.id), 'n', null);

		expect(takenBearings(db, system.id)).toEqual(['n']);
		expect(() => createGate(db, system.id, puerta(star.id, 'Otra'), 'n', null)).toThrow(
			BuilderError
		);
	});

	/*
	 * Es el orden en que uno construye: primero se decide que de acá se sale hacia
	 * el norte, y después se dice adónde va.
	 */
	it('nacen sin destino, y eso es un estado válido', () => {
		const db = seededDb();
		const { system, star } = createSystem(db, borrador(db), null);
		const salida = createGate(db, system.id, puerta(star.id), 'n', null);

		expect(salida.gate.destinationId).toBeNull();
		expect(looseGates(db).map((una) => una.gate.id)).toContain(salida.gate.id);
	});

	it('se unen en los dos sentidos, con la misma distancia', () => {
		const db = seededDb();
		const uno = createSystem(db, borrador(db), null);
		const otro = createSystem(db, borrador(db, { name: 'Ocaso' }), null);

		const salida = createGate(db, uno.system.id, puerta(uno.star.id), 'n', null);
		const vuelta = createGate(db, otro.system.id, puerta(otro.star.id, 'Puerta Sur'), 's', null);

		connectGates(db, salida.gate.id, vuelta.gate.id, 24, null);

		const [ida] = gatesOf(db, uno.system.id);
		const [regreso] = gatesOf(db, otro.system.id);
		expect(ida.gate.destinationId).toBe(vuelta.body.id);
		expect(regreso.gate.destinationId).toBe(salida.body.id);
		expect(regreso.gate.jumpDistance).toBe(24);
		expect(orphanGates(db)).toHaveLength(0);
	});

	it('conectar coloca al vecino en la casilla que dice el rumbo', () => {
		const db = seededDb();
		// Se cuelga de Ánfora, que es la semilla de la grilla: un sistema entra al
		// mapa **atándose a lo que ya está en el mapa**, que es el flujo real del
		// constructor. Dos sistemas nuevos unidos entre sí forman una isla que
		// todavía no tiene lugar, y eso es correcto: lo tendrán al engancharla.
		const anfora = getBody(db, 'anfora_estrella')!;
		const nuevo = createSystem(db, borrador(db, { name: 'Ocaso' }), null);

		const salida = createGate(db, anfora.systemId, puerta(anfora.id, 'Puerta Este'), 'ne', null);
		const vuelta = createGate(db, nuevo.system.id, puerta(nuevo.star.id, 'Puerta Sur'), 'sw', null);
		connectGates(db, salida.gate.id, vuelta.gate.id, 24, null);

		const puesto = db.select().from(system).where(eq(system.id, nuevo.system.id)).get()!;
		const semilla = db.select().from(system).where(eq(system.id, anfora.systemId)).get()!;

		expect({ x: puesto.x, y: puesto.y, z: puesto.z }).toEqual(
			neighbourOf({ x: semilla.x, y: semilla.y, z: semilla.z }, 'ne')
		);
		// Y la casilla existe: tres enteros que suman cero.
		expect(isValidHex({ x: puesto.x, y: puesto.y, z: puesto.z })).toBe(true);
		expect(isShortcut(db, salida.gate.id)).toBe(false);
	});

	it('no mueve un sistema que ya tenía lugar: la segunda puerta es un atajo', () => {
		const db = seededDb();
		const anfora = getBody(db, 'anfora_estrella')!;
		const vecino = createSystem(db, borrador(db, { name: 'Ocaso' }), null);

		// Primero se lo coloca al norte.
		const aNorte = createGate(db, anfora.systemId, puerta(anfora.id, 'Puerta Norte'), 'n', null);
		const desdeSur = createGate(
			db,
			vecino.system.id,
			puerta(vecino.star.id, 'Puerta Sur'),
			's',
			null
		);
		connectGates(db, aNorte.gate.id, desdeSur.gate.id, 10, null);
		const colocado = db.select().from(system).where(eq(system.id, vecino.system.id)).get()!;

		// Y ahora se los vuelve a unir por un rumbo que no cierra. La puerta se
		// conecta igual —una galaxia donde todo cierra en espejo es una grilla y nada
		// más— pero **el sistema no se mueve**: su casilla es el lenguaje común de
		// todos los que ya la vieron.
		const atajo = createGate(db, anfora.systemId, puerta(anfora.id, 'Puerta Sureste'), 'se', null);
		const vuelta = createGate(
			db,
			vecino.system.id,
			puerta(vecino.star.id, 'Puerta Noroeste'),
			'nw',
			null
		);
		connectGates(db, atajo.gate.id, vuelta.gate.id, 40, null);

		const despues = db.select().from(system).where(eq(system.id, vecino.system.id)).get()!;
		expect({ x: despues.x, y: despues.y, z: despues.z }).toEqual({
			x: colocado.x,
			y: colocado.y,
			z: colocado.z
		});
		expect(isShortcut(db, atajo.gate.id)).toBe(true);
		expect(isShortcut(db, aNorte.gate.id)).toBe(false);
	});

	it('engancha una isla entera sin deshacerla por dentro', () => {
		const db = seededDb();
		const anfora = getBody(db, 'anfora_estrella')!;
		const uno = createSystem(db, borrador(db, { name: 'Ocaso' }), null);
		const dos = createSystem(db, borrador(db, { name: 'Vigía' }), null);

		// Un ramal armado aparte, todavía fuera del mapa.
		const aDos = createGate(db, uno.system.id, puerta(uno.star.id, 'Puerta Norte'), 'n', null);
		const desdeDos = createGate(db, dos.system.id, puerta(dos.star.id, 'Puerta Sur'), 's', null);
		connectGates(db, aDos.gate.id, desdeDos.gate.id, 10, null);

		// Y ahora se engancha a Ánfora por el otro extremo.
		const aMapa = createGate(db, anfora.systemId, puerta(anfora.id, 'Puerta Este'), 'ne', null);
		const desdeUno = createGate(db, uno.system.id, puerta(uno.star.id, 'Puerta Sur'), 'sw', null);
		connectGates(db, aMapa.gate.id, desdeUno.gate.id, 10, null);

		const semilla = db.select().from(system).where(eq(system.id, anfora.systemId)).get()!;
		const puestoUno = db.select().from(system).where(eq(system.id, uno.system.id)).get()!;
		const puestoDos = db.select().from(system).where(eq(system.id, dos.system.id)).get()!;

		// El ramal se mudó entero con el mismo desplazamiento: adentro, lo que estaba
		// al norte sigue al norte. Rehacer el ramal sería perder el trabajo de armarlo.
		expect({ x: puestoUno.x, y: puestoUno.y, z: puestoUno.z }).toEqual(
			neighbourOf({ x: semilla.x, y: semilla.y, z: semilla.z }, 'ne')
		);
		expect({ x: puestoDos.x, y: puestoDos.y, z: puestoDos.z }).toEqual(
			neighbourOf({ x: puestoUno.x, y: puestoUno.y, z: puestoUno.z }, 'n')
		);
	});

	it('no se conectan dos del mismo sistema, ni una ya conectada', () => {
		const db = seededDb();
		const uno = createSystem(db, borrador(db), null);
		const norte = createGate(db, uno.system.id, puerta(uno.star.id), 'n', null);
		const sur = createGate(db, uno.system.id, puerta(uno.star.id, 'Puerta Sur'), 's', null);

		expect(() => connectGates(db, norte.gate.id, sur.gate.id, 10, null)).toThrow(BuilderError);

		const otro = createSystem(db, borrador(db, { name: 'Ocaso' }), null);
		const lejana = createGate(db, otro.system.id, puerta(otro.star.id, 'Puerta Sur'), 's', null);
		connectGates(db, norte.gate.id, lejana.gate.id, 10, null);

		expect(() => connectGates(db, norte.gate.id, sur.gate.id, 10, null)).toThrow(BuilderError);
	});

	it('se separan también en los dos sentidos', () => {
		const db = seededDb();
		const uno = createSystem(db, borrador(db), null);
		const otro = createSystem(db, borrador(db, { name: 'Ocaso' }), null);
		const salida = createGate(db, uno.system.id, puerta(uno.star.id), 'n', null);
		const vuelta = createGate(db, otro.system.id, puerta(otro.star.id, 'Puerta Sur'), 's', null);
		connectGates(db, salida.gate.id, vuelta.gate.id, 24, null);

		disconnectGate(db, salida.gate.id, null);

		expect(gatesOf(db, uno.system.id)[0].gate.destinationId).toBeNull();
		expect(gatesOf(db, otro.system.id)[0].gate.destinationId).toBeNull();
		expect(orphanGates(db)).toHaveLength(0);
	});

	/*
	 * Es el gesto que uno quiere al construir una galaxia: se planta la salida y
	 * desde ella se crea lo que hay del otro lado, sin ir a otra pantalla ni
	 * acordarse de volver a conectar.
	 */
	it('desde una suelta se crea el sistema del otro lado, ya conectado', () => {
		const db = seededDb();
		const uno = createSystem(db, borrador(db), null);
		const salida = createGate(db, uno.system.id, puerta(uno.star.id), 'ne', null);

		const vecino = growFromGate(db, salida.gate.id, borrador(db, { name: 'Ocaso' }), 18, null);

		// La gemela sale por el rumbo opuesto: es lo que hace que el mapa cierre.
		expect(takenBearings(db, vecino.id)).toEqual(['sw']);
		expect(looseGates(db)).toHaveLength(0);
		expect(orphanGates(db)).toHaveLength(0);
		expect(gatesOf(db, uno.system.id)[0].gate.jumpDistance).toBe(18);
	});

	it('borrar el cuerpo de una puerta se lleva su fila', () => {
		const db = seededDb();
		const { system, star } = createSystem(db, borrador(db), null);
		const salida = createGate(db, system.id, puerta(star.id), 'n', null);

		deleteBody(db, salida.body.id, null);

		expect(gatesOf(db, system.id)).toHaveLength(0);
	});
});

describe('los cinturones', () => {
	it('nacen con rocas y con los minerales que se les pongan', () => {
		const db = seededDb();
		const { system, star } = createSystem(db, borrador(db), null);
		const cinturon = createBody(
			db,
			system.id,
			{
				name: 'Cinturón de Vela',
				kind: 'belt',
				parentId: star.id,
				orbitDistance: 300,
				description: '',
				explored: true
			},
			null
		);

		setDeposits(db, cinturon.id, [{ ore: 'pyroxene', capacity: 5000, regenPerHour: 100 }], null);

		const filas = db.select().from(beltDeposit).where(eq(beltDeposit.bodyId, cinturon.id)).all();
		expect(filas).toHaveLength(1);
		expect(filas[0].remaining).toBe(5000);
	});

	/*
	 * Cambiar el tope es una decisión de balance; devolver el depósito a lleno
	 * sería borrar el trabajo de todos los que lo estuvieron minando.
	 */
	it('cambiar el tope no rellena lo que quedaba', () => {
		const db = seededDb();
		const anillos = getBody(db, 'anillos_anfora_iii')!;
		db.update(beltDeposit).set({ remaining: 12 }).where(eq(beltDeposit.bodyId, anillos.id)).run();

		setDeposits(
			db,
			anillos.id,
			[
				{ ore: 'ferrous_silicate', capacity: 99_000, regenPerHour: 3000 },
				{ ore: 'carbon_chondrite', capacity: 40_000, regenPerHour: 2000 }
			],
			null
		);

		const fila = db
			.select()
			.from(beltDeposit)
			.where(eq(beltDeposit.bodyId, anillos.id))
			.all()
			.find((una) => una.oreCode === 'ferrous_silicate')!;

		expect(fila.capacity).toBe(99_000);
		expect(fila.remaining).toBe(12);
	});

	it('bajar el tope por debajo de lo que queda lo recorta', () => {
		const db = seededDb();
		const anillos = getBody(db, 'anillos_anfora_iii')!;

		setDeposits(
			db,
			anillos.id,
			[{ ore: 'ferrous_silicate', capacity: 100, regenPerHour: 10 }],
			null
		);

		const filas = db.select().from(beltDeposit).where(eq(beltDeposit.bodyId, anillos.id)).all();
		expect(filas).toHaveLength(1);
		expect(filas[0].remaining).toBeLessThanOrEqual(100);
	});

	it('no acepta un cuerpo que no sea cinturón', () => {
		const db = seededDb();
		expect(() => setDeposits(db, getBody(db, 'anfora_ii')!.id, [], null)).toThrow(BuilderError);
	});
});

describe('la constancia', () => {
	it('queda anotado todo lo que se construye y lo que se borra', () => {
		const db = seededDb();
		const { system, star } = createSystem(db, borrador(db), null);
		const planeta = createBody(
			db,
			system.id,
			{
				name: 'Vela I',
				kind: 'planet',
				parentId: star.id,
				orbitDistance: 40,
				description: '',
				explored: true
			},
			null
		);
		deleteBody(db, planeta.id, null);

		const codigos = eventsPage(db, {}, 1, 50).rows.map((fila) => fila.kind);
		expect(codigos).toContain('system.created');
		expect(codigos).toContain('body.created');
		expect(codigos).toContain('body.deleted');
	});

	it('el borrado de un cuerpo no deja la fila en la base', () => {
		const db = seededDb();
		const { system, star } = createSystem(db, borrador(db), null);
		const planeta = createBody(
			db,
			system.id,
			{
				name: 'Vela I',
				kind: 'planet',
				parentId: star.id,
				orbitDistance: 40,
				description: '',
				explored: true
			},
			null
		);

		deleteBody(db, planeta.id, null);

		expect(db.select().from(bodyTable).where(eq(bodyTable.id, planeta.id)).get()).toBeUndefined();
	});
});

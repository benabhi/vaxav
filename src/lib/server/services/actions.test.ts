/**
 * El motor de acciones contra una base real: viajar y cruzar una puerta, de punta
 * a punta.
 *
 * Lo que el salto protege acá es **la garantía del cambio de regla**: cruzar una
 * puerta no cuesta combustible. Es lo que evita que un piloto quede varado, y si
 * se rompe no se nota en ninguna cuenta: se nota cuando alguien no puede volver.
 */

import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import {
	body,
	constellation,
	pilot,
	pilotAction,
	pilotLog,
	pilotSkill,
	system,
	type Pilot
} from '../db/schema';
import { crearPiloto, desguazar, seededDb } from '../db/testing';
import { JUMP_KIND, travelDurationSeconds } from '$lib/game/actions';
import { jumpSeconds } from '$lib/game/jumps';
import {
	TRAVEL_KIND,
	ActionError,
	currentAction,
	resolveIfDue,
	startJump,
	startTravel
} from './actions';
import { skillXp } from './pilots';
import {
	ShipError,
	activeShip,
	refit,
	saveFit,
	setFuel,
	shipFit,
	shipHull,
	shipReadout
} from './ships';
import { situation } from './status';
import { SKILLS } from '$lib/game/skills';
import { xpForLevel } from '$lib/game/progression';
import { bodyDistance, getBody } from './universe';
import { connectGates, createGate, createSystem } from './worldbuilding';
import type { Db } from '../db/types';

/** Le pone a una habilidad la experiencia justa para ese nivel. */
function entrenar(db: Db, row: Pilot, code: keyof typeof SKILLS, level: number): void {
	const xp = xpForLevel(level, SKILLS[code].difficulty);
	db.insert(pilotSkill)
		.values({ pilotId: row.id, skill: code, xp })
		.onConflictDoUpdate({ target: [pilotSkill.pilotId, pilotSkill.skill], set: { xp } })
		.run();
}

/** Deja la nave del piloto pelada, que es el estado con los números del cuadro. */
function pelar(db: Db, row: Pilot): void {
	const nave = activeShip(db, row.id)!;
	saveFit(
		db,
		nave,
		shipHull(nave).slots.map(() => '')
	);
}

describe('la distancia', () => {
	it('suma el árbol hasta el ancestro común', () => {
		const db = seededDb();
		const puerto = getBody(db, 'puerto_anfora')!;
		const anforaI = getBody(db, 'anfora_i')!;
		// Puerto Ánfora (3) -> Ánfora II (95) -> estrella -> Ánfora I (40).
		expect(bodyDistance(db, puerto.id, anforaI.id)).toBe(3 + 95 + 40);
	});

	it('es cero hasta uno mismo', () => {
		const db = seededDb();
		const puerto = getBody(db, 'puerto_anfora')!;
		expect(bodyDistance(db, puerto.id, puerto.id)).toBe(0);
	});
});

describe('dar la orden de viajar', () => {
	it('crea la orden con su duración', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const destino = getBody(db, 'anfora_i')!;

		const orden = startTravel(db, piloto, destino);

		expect(orden.kind).toBe(TRAVEL_KIND);
		expect(orden.originBodyId).toBe(piloto.locationId);
		expect(orden.destinationBodyId).toBe(destino.id);

		// La duración sale de la distancia y de **la hoja real de su nave**: la
		// alineación, que ya trae adentro el bono de Maniobra con el que el minero
		// arranca, más el crucero a la velocidad de warp de su casco. Se calcula acá
		// en vez de asumir un número, para no depender ni de la XP inicial de la
		// profesión ni del casco que entregue el astillero el día que cambie.
		const distancia = bodyDistance(db, orden.originBodyId, destino.id);
		const readout = shipReadout(db, piloto)!;
		expect(orden.durationSeconds).toBe(travelDurationSeconds(distancia, readout));
	});

	it('acorta el mismo viaje con una nave más rápida', async () => {
		// Es lo que hace que equipar la nave importe fuera de la pantalla de nave.
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const destino = getBody(db, 'anfora_i')!;
		const distancia = bodyDistance(db, piloto.locationId, destino.id);

		const nave = activeShip(db, piloto.id)!;
		const hull = shipHull(nave);
		const deFabrica = travelDurationSeconds(distancia, shipReadout(db, piloto)!);

		// Un optimizador de warp estira el tramo que escala y cobra en firma. Cuesta
		// una ranura baja: no hay forma de mejorar el viaje sin pagarla.
		const codigos = shipFit(db, nave).map((module) => module.code);
		codigos[hull.slots.findIndex((slot) => slot.kind === 'low')] = 'warp_optimizer_i2';
		saveFit(db, nave, codigos);

		const conMejores = travelDurationSeconds(distancia, shipReadout(db, piloto)!);
		expect(conMejores).toBeLessThan(deFabrica);
	});

	it('y la duración ya no se puede mover: con el viaje encargado no se equipa', async () => {
		// **El exploit clásico, y este proyecto ya lo tuvo una vez en el salto**:
		// encargar el viaje con la nave como está y montar el optimizador después,
		// para que el reloj siga corriendo con la duración vieja mientras la nave
		// llega mejorada. No se puede, y no por casualidad: la orden deja al piloto
		// **en tránsito desde el primer segundo** —aunque siga físicamente atracado en
		// la estación— y equipar exige estar atracado.
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const orden = startTravel(db, piloto, getBody(db, 'anfora_i')!);

		const ahora = situation(db, piloto);
		expect(ahora.status).toBe('in_transit');
		expect(ahora.canRefit).toBe(false);

		// Ni siquiera volver a guardar lo mismo: el servicio no confía en que un
		// pedido que dice no cambiar nada no cambie nada.
		const codigos = shipFit(db, activeShip(db, piloto.id)!).map((module) => module.code);
		expect(() => refit(db, piloto, codigos)).toThrow(ShipError);

		// Y lo guardado sigue siendo lo que se cobró al encargar.
		expect(currentAction(db, piloto.id)!.durationSeconds).toBe(orden.durationSeconds);
	});

	it('se niega sin nave', async () => {
		// El servicio no confía en que la interfaz haya bloqueado el botón.
		const db = seededDb();
		const piloto = await crearPiloto(db);
		desguazar(db, piloto);

		expect(() => startTravel(db, piloto, getBody(db, 'anfora_i')!)).toThrow(/nave/);
	});

	it('se niega con una orden ya en curso', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		startTravel(db, piloto, getBody(db, 'anfora_i')!);

		expect(() => startTravel(db, piloto, getBody(db, 'anfora_ii')!)).toThrow(ActionError);
	});

	it('se niega a viajar a un cuerpo de otro sistema', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const destino = getBody(db, 'anfora_i')!;

		// Un cuerpo de otro sistema. Sin la guarda, esto hacía estallar el cálculo
		// de distancia con un error que el form action no atrapa, y al jugador le
		// salía un 500 en vez de un motivo.
		const ajeno = { ...destino, systemId: destino.systemId + 1 };

		expect(() => startTravel(db, piloto, ajeno)).toThrow(ActionError);
		expect(currentAction(db, piloto.id)).toBeNull();
	});

	it('se niega a viajar al lugar donde ya se está', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const aqui = db.select().from(body).where(eq(body.id, piloto.locationId)).get()!;

		expect(() => startTravel(db, piloto, aqui)).toThrow(ActionError);
	});
});

describe('resolver la orden', () => {
	it('no hace nada si todavía no venció', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		startTravel(db, piloto, getBody(db, 'anfora_i')!);

		expect(resolveIfDue(db, piloto)).toBeNull();
		expect(currentAction(db, piloto.id)).not.toBeNull();
	});

	it('mueve al piloto y reparte la experiencia cuando venció', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const destino = getBody(db, 'anfora_i')!;
		const xpPrevio = skillXp(db, piloto.id);
		const orden = startTravel(db, piloto, destino);

		// Simula que ya pasó el tiempo: nadie espera 28 segundos en un test.
		db.update(pilotAction)
			.set({ startedAt: new Date(orden.startedAt.getTime() - (orden.durationSeconds + 1) * 1000) })
			.where(eq(pilotAction.id, orden.id))
			.run();

		const parte = resolveIfDue(db, piloto);

		expect(parte).not.toBeNull();
		expect(parte!.destinationName).toBe(destino.name);
		// La experiencia va al pozo de la rama y no a la habilidad usada: es lo
		// que convierte especializarse en una decisión (docs/systems/SKILLS.md).
		expect(parte!.deposit.family).toBe('piloting');
		expect(parte!.deposit.xp).toBeGreaterThan(0);
		expect(parte!.deposit.after).toBe(parte!.deposit.before + parte!.deposit.xp);

		const despues = db.select().from(pilot).where(eq(pilot.id, piloto.id)).get()!;
		expect(despues.locationId).toBe(destino.id);
		expect(currentAction(db, piloto.id)).toBeNull();

		// Y **ninguna habilidad se movió sola**: resolver un viaje ya no entrena
		// Navegación, la deja pagada en el pozo para que el piloto elija. Se miran
		// todas y no una: cuáles trae cada profesión es contenido, y este test no
		// tiene por qué romperse cuando ese contenido cambie.
		expect(skillXp(db, piloto.id)).toEqual(xpPrevio);
	});

	/*
	 * **Mejorar la nave no puede castigar**, y hasta este cambio castigaba: la
	 * experiencia salía de la duración, así que montar el optimizador —la mejora
	 * que existe para acortar el viaje— le sacaba al piloto parte de lo que ese
	 * viaje pagaba. Ahora paga la distancia, que es la misma para todos.
	 *
	 * Se prueba con la misma ruta dos veces y no con dos cascos porque no hay
	 * astillero: lo que se puede cambiar de una nave hoy es lo que lleva puesto, y
	 * alcanza para que el reloj se mueva y la experiencia no.
	 */
	it('paga lo mismo por la misma ruta con la nave mejorada que sin ella', async () => {
		const recorrer = async (optimizador: string | null) => {
			const db = seededDb();
			const piloto = await crearPiloto(db);
			entrenar(db, piloto, 'navigation', 2);
			pelar(db, piloto);

			if (optimizador) {
				const nave = activeShip(db, piloto.id)!;
				const codigos = shipFit(db, nave).map((module) => module.code);
				codigos[shipHull(nave).slots.findIndex((slot) => slot.kind === 'low')] = optimizador;
				saveFit(db, nave, codigos);
			}

			const orden = startTravel(db, piloto, getBody(db, 'anfora_i')!);
			db.update(pilotAction)
				.set({
					startedAt: new Date(orden.startedAt.getTime() - (orden.durationSeconds + 1) * 1000)
				})
				.where(eq(pilotAction.id, orden.id))
				.run();

			return { duracion: orden.durationSeconds, xp: resolveIfDue(db, piloto)!.deposit.xp };
		};

		const pelada = await recorrer(null);
		const mejorada = await recorrer('warp_optimizer_i2');

		// El viaje sí se acorta —para eso existe el módulo—...
		expect(mejorada.duracion).toBeLessThan(pelada.duracion);
		// ...y sin embargo el pozo recibe exactamente lo mismo.
		expect(pelada.xp).toBeGreaterThan(0);
		expect(mejorada.xp).toBe(pelada.xp);
	});

	it('una clase de acción desconocida no mueve al piloto ni le paga', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const destino = getBody(db, 'anfora_estrella')!;
		const orden = startTravel(db, piloto, destino);

		// Una orden de una versión más nueva del juego. Perderla sería peor que
		// dejarla esperando, así que no se resuelve y **tampoco se borra**.
		db.update(pilotAction)
			.set({ kind: 'no_existe' as 'travel', startedAt: new Date(Date.now() - 3_600_000) })
			.where(eq(pilotAction.id, orden.id))
			.run();

		expect(resolveIfDue(db, piloto)).toBeNull();

		const despues = db.select().from(pilot).where(eq(pilot.id, piloto.id)).get()!;
		expect(despues.locationId).toBe(piloto.locationId);
		expect(currentAction(db, piloto.id)).not.toBeNull();
	});

	it('sólo la resuelve una vez', async () => {
		// Dos consultas simultáneas no pueden entregar el botín dos veces.
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const orden = startTravel(db, piloto, getBody(db, 'anfora_i')!);
		db.update(pilotAction)
			.set({ startedAt: new Date(orden.startedAt.getTime() - (orden.durationSeconds + 1) * 1000) })
			.where(eq(pilotAction.id, orden.id))
			.run();

		const primera = resolveIfDue(db, piloto);
		const segunda = resolveIfDue(db, piloto);

		expect(primera).not.toBeNull();
		expect(segunda).toBeNull();
	});
});

/**
 * Una puerta terminada en Ánfora, con un sistema del otro lado.
 *
 * El universo sembrado no trae puertas, así que el escenario del salto hay que
 * construirlo: dos puertas conectadas es lo mínimo que `startJump` necesita para
 * tener adónde mandar a alguien.
 */
function conPuerta(db: Db, decimas = 14) {
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
			capitalOf: ''
		},
		null
	);

	const draft = {
		kind: 'gate',
		orbitDistance: 400,
		bodyClass: '',
		atmosphere: '',
		starClass: '',
		explored: true
	} as const;
	const salida = createGate(
		db,
		anfora.id,
		{ ...draft, name: 'Puerta Norte', parentId: estrella.id },
		'n',
		null
	);
	const llegada = createGate(
		db,
		otro.system.id,
		{ ...draft, name: 'Puerta Sur', parentId: otro.star.id },
		's',
		null
	);
	connectGates(db, salida.gate.id, llegada.gate.id, decimas, null);

	return { salida: salida.body, llegada: llegada.body, decimas };
}

/** Deja al piloto parado en un cuerpo, sin viajar hasta él. */
function pararEn(db: Db, row: Pilot, bodyId: number): Pilot {
	return db.update(pilot).set({ locationId: bodyId }).where(eq(pilot.id, row.id)).returning().get();
}

/** Corre el arranque hacia atrás para que la orden ya haya vencido. */
function vencer(db: Db, orden: { id: number; startedAt: Date; durationSeconds: number }): void {
	db.update(pilotAction)
		.set({ startedAt: new Date(orden.startedAt.getTime() - (orden.durationSeconds + 1) * 1000) })
		.where(eq(pilotAction.id, orden.id))
		.run();
}

describe('cruzar una puerta', () => {
	it('crea la orden con lo que tarda la puerta', async () => {
		const db = seededDb();
		const { salida, llegada, decimas } = conPuerta(db);
		const piloto = pararEn(db, await crearPiloto(db), salida.id);

		const orden = startJump(db, piloto);

		expect(orden.kind).toBe(JUMP_KIND);
		expect(orden.originBodyId).toBe(salida.id);
		expect(orden.destinationBodyId).toBe(llegada.id);
		expect(orden.durationSeconds).toBe(jumpSeconds(decimas));
	});

	/*
	 * **La garantía central del cambio.** El tanque tiene que valer lo mismo antes
	 * y después: si alguien vuelve a descontarlo acá, el piloto que se quedó sin
	 * combustible deja de poder volver, que es exactamente lo que se sacó.
	 */
	it('no le toca el tanque al encargar', async () => {
		const db = seededDb();
		const { salida } = conPuerta(db);
		const piloto = pararEn(db, await crearPiloto(db), salida.id);
		const antes = activeShip(db, piloto.id)!.fuel;

		startJump(db, piloto);

		expect(activeShip(db, piloto.id)!.fuel).toBe(antes);
		expect(antes).toBeGreaterThan(0);
	});

	it('tampoco al resolver: el tanque queda igual del otro lado', async () => {
		const db = seededDb();
		const { salida, llegada } = conPuerta(db);
		const piloto = pararEn(db, await crearPiloto(db), salida.id);
		const antes = activeShip(db, piloto.id)!.fuel;

		vencer(db, startJump(db, piloto));
		const parte = resolveIfDue(db, piloto);

		expect(parte).not.toBeNull();
		expect(db.select().from(pilot).where(eq(pilot.id, piloto.id)).get()!.locationId).toBe(
			llegada.id
		);
		expect(activeShip(db, piloto.id)!.fuel).toBe(antes);
	});

	/*
	 * El caso que decide todo: **una nave con el tanque en cero cruza y llega**.
	 * Nadie queda varado, que es el argumento con el que el cobro se fue.
	 */
	it('una nave con el tanque vacío cruza igual y llega', async () => {
		const db = seededDb();
		const { salida, llegada } = conPuerta(db);
		const piloto = pararEn(db, await crearPiloto(db), salida.id);
		setFuel(db, activeShip(db, piloto.id)!, 0);

		vencer(db, startJump(db, piloto));
		resolveIfDue(db, piloto);

		expect(db.select().from(pilot).where(eq(pilot.id, piloto.id)).get()!.locationId).toBe(
			llegada.id
		);
		expect(activeShip(db, piloto.id)!.fuel).toBe(0);
	});

	/*
	 * **La misma puerta tarda lo mismo para todos.** Una nave pelada y una con el
	 * equipo del oficio pesan distinto, y antes eso movía el reloj: hoy el tiempo
	 * es un dato del universo y montar cosas no lo cambia.
	 */
	it('la misma puerta tarda lo mismo para cualquier nave', async () => {
		const db = seededDb();
		const { salida } = conPuerta(db);

		const equipado = pararEn(db, await crearPiloto(db, 'Equipado'), salida.id);
		const pelado = pararEn(db, await crearPiloto(db, 'Pelado'), salida.id);

		const nave = activeShip(db, pelado.id)!;
		saveFit(
			db,
			nave,
			shipFit(db, nave).map(() => '')
		);

		expect(shipReadout(db, pelado)!.mass).toBeLessThan(shipReadout(db, equipado)!.mass);
		expect(startJump(db, pelado).durationSeconds).toBe(startJump(db, equipado).durationSeconds);
	});

	it('el informe cuenta la distancia y ningún costo', async () => {
		const db = seededDb();
		const { salida, decimas } = conPuerta(db);
		const piloto = pararEn(db, await crearPiloto(db), salida.id);

		vencer(db, startJump(db, piloto));
		resolveIfDue(db, piloto);

		const fila = db.select().from(pilotLog).where(eq(pilotLog.pilotId, piloto.id)).get()!;

		// Lo que se guarda es lo que pasó: se cruzó tanta distancia y nada más. El
		// campo del combustible no vuelve a escribirse nunca.
		expect(JSON.parse(fila.result)).toEqual({ jump: { tenths: decimas } });
	});

	it('sin puerta donde estar parado no se salta', async () => {
		const db = seededDb();
		conPuerta(db);
		const piloto = await crearPiloto(db);

		// Atracado en el puerto: una estación no es una puerta.
		expect(() => startJump(db, piloto)).toThrow(ActionError);
	});

	it('una nave sin condiciones de volar no cruza, por mucho tanque que lleve', async () => {
		const db = seededDb();
		const { salida } = conPuerta(db);
		const piloto = pararEn(db, await crearPiloto(db), salida.id);

		// Se le monta lo que no sabe usar: la nave queda clavada en tierra y el
		// tanque no tiene nada que ver con eso.
		const nave = activeShip(db, piloto.id)!;
		const codes = shipFit(db, nave).map((module) => module.code);
		const alta = shipHull(nave).slots.findIndex((slot) => slot.kind === 'high');
		saveFit(
			db,
			nave,
			codes.map((code, index) => (index === alta ? 'mining_laser_i2' : code))
		);

		expect(shipReadout(db, piloto)!.flyable).toBe(false);
		expect(() => startJump(db, piloto)).toThrow(ActionError);
	});
});

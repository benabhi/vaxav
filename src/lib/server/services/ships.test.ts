/**
 * El hangar contra una base real: crear la nave, guardarla y calcular lo que
 * rinde.
 *
 * Lo que se guarda es sólo el casco y qué hay en cada ranura; todo número que
 * describa a la nave se le pide a la calculadora. Estas pruebas cuidan
 * justamente esa frontera: que lo guardado vuelva igual, y que lo calculado use
 * los niveles del piloto de verdad.
 */

import { and, eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { fittedModule, pilotSkill, ship } from '../db/schema';
import { crearPiloto, desguazar, seededDb } from '../db/testing';
import { situation } from './status';
import {
	auditStacks,
	cargoHold,
	fitsUnits,
	itemHistory,
	moveItem,
	quantityOf,
	shipContainer,
	stationContainer
} from './containers';
import { buildReadout, defaultFit, fitFromCodes } from '$lib/game/fitting';
import { STARTING_HULL } from '$lib/game/hulls';
import { EMPTY } from '$lib/game/modules';
import {
	ShipError,
	activeShip,
	burnFuel,
	createStarterShip,
	ensureEveryPilotHasAShip,
	ensureEveryShipHasFuel,
	fill,
	fuelCapacity,
	pilotSkillLevels,
	refit,
	saveFit,
	setFuel,
	shipFit,
	shipHull,
	shipReadout
} from './ships';

describe('el alta de la nave', () => {
	it('le da nave a un piloto nuevo', async () => {
		// Un piloto sin nave no puede hacer nada: sería un piloto a medias.
		const db = seededDb();
		const piloto = await crearPiloto(db);
		expect(activeShip(db, piloto.id)).not.toBeNull();
	});

	it('le da la lanzadera inicial', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		expect(shipHull(activeShip(db, piloto.id)!).code).toBe(STARTING_HULL);
	});

	it('sale volando sin llevar nada montado', async () => {
		// El empuje, la planta y el acumulador son del casco: una nave de astillero
		// vuela pelada, y todas sus ranuras son del piloto desde el primer minuto.
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const readout = shipReadout(db, piloto)!;
		expect(readout.speed).toBeGreaterThan(0);
		expect(readout.power.total).toBeGreaterThan(0);
	});

	it('sale del astillero con el resto de las ranuras vacías', async () => {
		// Viene completa, no viene buena: lo que la define lo elige el piloto.
		//
		// Se prueba sobre una nave recién salida del astillero y no sobre la del
		// piloto, porque encima de ésta el oficio monta su equipo. Son **dos reglas
		// distintas** —cómo sale una nave y con qué te manda a volar tu oficio— y
		// mezclarlas haría que cambiar un kit rompiera el test del astillero.
		const db = seededDb();
		const piloto = await crearPiloto(db);
		desguazar(db, piloto);

		const nave = createStarterShip(db, piloto.id);
		const hull = shipHull(nave);
		const fit = shipFit(db, nave);
		expect(fit.length).toBe(hull.slots.length);
		for (const module of fit) expect(module).toBe(EMPTY);
	});

	it('sale volable', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const readout = shipReadout(db, piloto);
		expect(readout).not.toBeNull();
		expect(readout!.flyable, readout!.problems.join(' · ')).toBe(true);
	});

	it('le da una distinta a cada piloto', async () => {
		const db = seededDb();
		const uno = await crearPiloto(db, 'Halcon');
		const otro = await crearPiloto(db, 'Vencejo');
		expect(activeShip(db, uno.id)!.id).not.toBe(activeShip(db, otro.id)!.id);
	});
});

describe('guardar y volver a leer', () => {
	it('devuelve lo mismo que se guardó', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const nave = activeShip(db, piloto.id)!;

		const codigos = shipFit(db, nave).map((module) => module.code);
		codigos[0] = 'mining_laser_i1';
		saveFit(db, nave, codigos);

		expect(shipFit(db, nave).map((module) => module.code)).toEqual(codigos);
	});

	it('no deja fila al vaciar una ranura', async () => {
		// Una ranura vacía es la ausencia de una fila, no una fila con vacío.
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const nave = activeShip(db, piloto.id)!;

		const codigos = shipFit(db, nave).map((module) => module.code);
		codigos[0] = 'mining_laser_i1';
		saveFit(db, nave, codigos);
		codigos[0] = '';
		saveFit(db, nave, codigos);

		const filas = db
			.select()
			.from(fittedModule)
			.where(and(eq(fittedModule.shipId, nave.id), eq(fittedModule.slotIndex, 0)))
			.all();
		expect(filas).toEqual([]);
	});

	it('no acumula filas', async () => {
		// Guardar diez veces deja las mismas filas que guardar una.
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const nave = activeShip(db, piloto.id)!;
		const codigos = shipFit(db, nave).map((module) => module.code);

		const contar = () =>
			db.select().from(fittedModule).where(eq(fittedModule.shipId, nave.id)).all().length;
		const antes = contar();
		for (let i = 0; i < 3; i++) saveFit(db, nave, codigos);

		expect(contar()).toBe(antes);
	});

	it('falla con la cantidad equivocada de ranuras', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const nave = activeShip(db, piloto.id)!;
		expect(() => saveFit(db, nave, ['plant_i2'])).toThrow(ShipError);
	});

	it('dice claro que un casco inventado no está en el catálogo', async () => {
		// El catálogo es la verdad; una nave que no encaja en él es un error claro.
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const nave = db
			.update(ship)
			.set({ hull: 'acorazado_fantasma' })
			.where(eq(ship.pilotId, piloto.id))
			.returning()
			.get();

		expect(() => shipHull(nave)).toThrow(/catálogo/);
	});
});

describe('la hoja de rendimiento', () => {
	it('usa los niveles del piloto', async () => {
		// Si no, la ficha prometería un rendimiento que el piloto no tiene.
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const niveles = pilotSkillLevels(db, piloto.id);
		expect(Object.keys(niveles).length).toBeGreaterThan(0); // el minero arranca entrenado

		const conLosSuyos = shipReadout(db, piloto)!;
		const sinNada = shipReadout(db, piloto, {})!;
		expect(conLosSuyos.cargo).toBeGreaterThanOrEqual(sinNada.cargo);
	});

	it('no existe sin nave', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		desguazar(db, piloto);
		expect(shipReadout(db, piloto)).toBeNull();
	});

	it('frena la nave al montar algo pesado', async () => {
		// La masa cuesta tiempo, y eso tiene que verse desde el servicio.
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const nave = activeShip(db, piloto.id)!;
		const hull = shipHull(nave);

		const antes = shipReadout(db, piloto)!.speed;
		const codigos = shipFit(db, nave).map((module) => module.code);
		hull.slots.forEach((slot, i) => {
			if (slot.kind === 'low') codigos[i] = 'armor_plate_i1';
		});
		saveFit(db, nave, codigos);

		expect(shipReadout(db, piloto)!.speed).toBeLessThan(antes);
	});

	it('acelera la nave con mejores propulsores', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const nave = activeShip(db, piloto.id)!;
		const hull = shipHull(nave);

		const antes = shipReadout(db, piloto)!.speed;
		const codigos = shipFit(db, nave).map((module) => module.code);
		codigos[hull.slots.findIndex((slot) => slot.kind === 'mid')] = 'thruster_i2';
		saveFit(db, nave, codigos);

		expect(shipReadout(db, piloto)!.speed).toBeGreaterThan(antes);
	});
});

describe('el reparto de naves', () => {
	it('le da nave a quien no tiene', async () => {
		// Los pilotos creados antes de que existiera el hangar se arreglan acá.
		const db = seededDb();
		const piloto = await crearPiloto(db);
		desguazar(db, piloto);

		expect(ensureEveryPilotHasAShip(db)).toBe(1);
		expect(activeShip(db, piloto.id)).not.toBeNull();
	});

	it('no le da dos naves a nadie', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		expect(ensureEveryPilotHasAShip(db)).toBe(0);

		const naves = db.select().from(ship).where(eq(ship.pilotId, piloto.id)).all();
		expect(naves).toHaveLength(1);
	});

	it('reparte naves que se pueden volar', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		desguazar(db, piloto);
		ensureEveryPilotHasAShip(db);

		expect(shipReadout(db, piloto)!.flyable).toBe(true);
	});

	it('arma la misma nave que la configuración de fábrica', async () => {
		// `createStarterShip` y `defaultFit` no pueden separarse.
		const db = seededDb();
		const piloto = await crearPiloto(db, 'Percal');
		desguazar(db, piloto);

		const nave = createStarterShip(db, piloto.id);
		expect(shipFit(db, nave)).toEqual(defaultFit(shipHull(nave)));
	});
});

describe('bajar y subir modulos mueve la carga', () => {
	/** El índice de la ranura donde el minero trae su láser, y las dos bodegas. */
	function bancada(
		db: ReturnType<typeof seededDb>,
		piloto: Awaited<ReturnType<typeof crearPiloto>>
	) {
		const nave = activeShip(db, piloto.id)!;
		const codes = shipFit(db, nave).map((module) => module.code);
		const ahora = situation(db, piloto);
		return {
			nave,
			codes,
			index: codes.indexOf('mining_laser_i1'),
			bodega: shipContainer(db, nave.id),
			hangar: stationContainer(db, piloto.id, ahora.stationId!)
		};
	}

	it('lo que se baja queda en la estación', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const { nave, codes, index, hangar } = bancada(db, piloto);

		const vaciada = [...codes];
		vaciada[index] = '';
		refit(db, piloto, vaciada);

		// Equipar sólo se puede atracado, así que lo que sale de una ranura sale
		// ahí. Desmontar era tirar el módulo sin decirlo, que es la clase de
		// pérdida silenciosa que arruina la confianza en un inventario.
		expect(quantityOf(db, hangar.id, 'mining_laser_i1')).toBe(1);
		expect(shipFit(db, nave)[index].code).toBe('');
	});

	it('lo que se sube desde la bodega de la nave sale de ahí', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const { nave, codes, index, bodega } = bancada(db, piloto);

		// El minero trae un repuesto en la nave; se baja el puesto y se sube ése.
		const vaciada = [...codes];
		vaciada[index] = '';
		refit(db, piloto, vaciada);
		refit(db, piloto, codes, 'ship');

		expect(quantityOf(db, bodega.id, 'mining_laser_i1')).toBe(0);
		expect(shipFit(db, nave)[index].code).toBe('mining_laser_i1');
	});

	it('y lo que se sube desde la estación sale de la estación', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const { nave, codes, index, bodega, hangar } = bancada(db, piloto);

		const vaciada = [...codes];
		vaciada[index] = '';
		refit(db, piloto, vaciada);
		const enBodega = quantityOf(db, bodega.id, 'mining_laser_i1');

		refit(db, piloto, codes, 'station');

		// La pantalla muestra las dos bodegas por separado y el jugador eligió una:
		// tomar de la otra sería hacerle algo distinto de lo que pidió.
		expect(quantityOf(db, hangar.id, 'mining_laser_i1')).toBe(0);
		expect(quantityOf(db, bodega.id, 'mining_laser_i1')).toBe(enBodega);
		expect(shipFit(db, nave)[index].code).toBe('mining_laser_i1');
	});

	it('no se puede montar lo que no se tiene', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const { nave, codes, index } = bancada(db, piloto);

		// La estación ya no surte el catálogo: comprar es del mercado.
		const conCanon = [...codes];
		conCanon[index] = 'mass_cannon_i1';

		expect(() => refit(db, piloto, conCanon)).toThrow(ShipError);
		expect(shipFit(db, nave).map((m) => m.code)).toEqual(codes);
	});

	it('cada cambio deja su asiento', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const { codes, index, hangar } = bancada(db, piloto);

		const vaciada = [...codes];
		vaciada[index] = '';
		refit(db, piloto, vaciada);

		expect(itemHistory(db, hangar.id)[0].kind).toBe('unfitted');
		expect(auditStacks(db, hangar.id)).toEqual([]);
	});

	it('se niega si al desmontar deja de entrar la carga', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const { nave, codes, bodega } = bancada(db, piloto);

		// Se llena la bodega de mineral hasta el tope.
		const libre = cargoHold(db, bodega.id, shipReadout(db, piloto)!.cargo).freeTenths;
		moveItem(db, bodega.id, 'ferrous_silicate', fitsUnits(libre, 'ferrous_silicate'), 'mined');

		const sinBodega = [...codes];
		sinBodega[codes.indexOf('cargo_rack_i1')] = '';

		// Bajar una bodega adicional achica el lugar sin sacar nada de adentro.
		expect(() => refit(db, piloto, sinBodega)).toThrow(ShipError);
		expect(shipFit(db, nave).map((m) => m.code)).toEqual(codes);
	});
});

describe('lo que el piloto no sabe usar', () => {
	it('el servicio se niega a montarlo, aunque el pedido venga armado a mano', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const nave = activeShip(db, piloto.id)!;
		const codes = shipFit(db, nave).map((module) => module.code);
		const index = codes.indexOf('mining_laser_i1');
		// Se lo metemos en la bodega para que el único impedimento sea la habilidad.
		moveItem(db, shipContainer(db, nave.id).id, 'mining_laser_ii1', 1, 'bought');

		const avanzado = [...codes];
		avanzado[index] = 'mining_laser_ii1';

		// El minero sale con Minería II... pero el láser A pide justamente eso, así
		// que primero lo bajamos a I para que falte.
		db.update(pilotSkill)
			.set({ xp: 100 })
			.where(and(eq(pilotSkill.pilotId, piloto.id), eq(pilotSkill.skill, 'mining')))
			.run();

		expect(() => refit(db, piloto, avanzado)).toThrow(ShipError);
		// Y el mensaje dice qué falta, no "no podés": un piloto que lee "te falta
		// Minería II" sabe adónde ir.
		expect(() => refit(db, piloto, avanzado)).toThrow(/Minería II/);
	});

	it('con la habilidad entrenada, lo monta', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const nave = activeShip(db, piloto.id)!;
		const codes = shipFit(db, nave).map((module) => module.code);
		const index = codes.indexOf('mining_laser_i1');
		moveItem(db, shipContainer(db, nave.id).id, 'mining_laser_ii1', 1, 'bought');

		const avanzado = [...codes];
		avanzado[index] = 'mining_laser_ii1';
		refit(db, piloto, avanzado);

		expect(shipFit(db, nave)[index].code).toBe('mining_laser_ii1');
	});

	it('y la nave con algo que no sabe usar no vuela', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const nave = activeShip(db, piloto.id)!;
		const hull = shipHull(nave);
		const codes = shipFit(db, nave).map((module) => module.code);
		codes[codes.indexOf('mining_laser_i1')] = 'mining_laser_ii1';

		const hoja = buildReadout(hull, fitFromCodes(hull, codes), { mining: 1 });

		// Volar exige que no haya problemas, y todas las acciones lo consultan: con
		// esto, saber usar cada módulo decide si se puede viajar, minar o escanear.
		expect(hoja.flyable).toBe(false);
		expect(hoja.problems.join(' · ')).toContain('Minería II');
	});
});

describe('el tanque', () => {
	/*
	 * Una nave nueva vacía sería un piloto que no puede saltar y no sabe por qué:
	 * el combustible no se ve hasta abrir la ficha, y nadie la abre antes del
	 * primer viaje.
	 */
	it('una nave nueva sale del astillero llena', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const nave = activeShip(db, piloto.id)!;

		expect(nave.fuel).toBe(fuelCapacity(db, nave));
		expect(nave.fuel).toBeGreaterThan(0);
	});

	it('gastar le saca del tanque y nunca lo deja en negativo', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const nave = activeShip(db, piloto.id)!;

		const despues = burnFuel(db, nave, 10);
		expect(despues.fuel).toBe(nave.fuel - 10);

		expect(burnFuel(db, despues, 100_000).fuel).toBe(0);
	});

	/*
	 * Desmontar un tanque deja la nave con más combustible del que puede llevar.
	 * Se recorta en vez de fallar: no tiene por qué tumbar lo que el piloto
	 * estaba haciendo.
	 */
	it('no deja más combustible del que entra', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const nave = activeShip(db, piloto.id)!;
		const capacidad = fuelCapacity(db, nave);

		expect(setFuel(db, nave, capacidad + 500).fuel).toBe(capacidad);
	});

	it('llenar lo deja al tope', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const nave = activeShip(db, piloto.id)!;
		const vacia = burnFuel(db, nave, 100_000);

		expect(fill(db, vacia).fuel).toBe(fuelCapacity(db, nave));
	});

	/*
	 * **Lo que no entra se derrama, y se derrama al desmontar.**
	 *
	 * Un depósito auxiliar bajado deja la nave con más combustible del que ahora le
	 * cabe. La bodega puede negarse a ese cambio porque la carga se puede dejar en
	 * tierra; el combustible ya está adentro del tanque y no hay dónde ponerlo, así
	 * que se recorta. Que se recorte **en la base y no al mirarlo** es lo que evita
	 * que dos vistas lo tapen con un `Math.min` y la nave siga guardando un número
	 * imposible.
	 */
	it('desmontar un depósito auxiliar recorta lo que ya no entra', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const nave = activeShip(db, piloto.id)!;
		const codes = shipFit(db, nave).map((module) => module.code);
		const baja = shipHull(nave).slots.findIndex(
			(slot, index) => slot.kind === 'low' && slot.size >= 2 && codes[index] === ''
		);
		// La capacidad se mide antes: la lee del equipamiento guardado, así que
		// después de montar el depósito ya contesta la grande.
		const chico = fuelCapacity(db, nave);

		saveFit(
			db,
			nave,
			codes.map((code, index) => (index === baja ? 'fuel_tank_i2' : code))
		);
		const grande = fill(db, activeShip(db, piloto.id)!);
		expect(grande.fuel).toBeGreaterThan(chico);

		refit(db, piloto, codes);

		const despues = activeShip(db, piloto.id)!;
		expect(despues.fuel).toBe(fuelCapacity(db, despues));
		expect(despues.fuel).toBeLessThan(grande.fuel);
	});

	/* Sólo las vacías: una a medio tanque saltó, y rellenarla sería un regalo. */
	it('el relleno de la siembra no toca una nave a medio tanque', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const nave = activeShip(db, piloto.id)!;
		const usada = burnFuel(db, nave, 10);

		expect(ensureEveryShipHasFuel(db)).toBe(0);
		expect(activeShip(db, piloto.id)!.fuel).toBe(usada.fuel);
	});
});

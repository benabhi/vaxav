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
import { fittedModule, ship, type Pilot } from '../db/schema';
import { crearPiloto, seededDb } from '../db/testing';
import type { Db } from '../db/types';
import { defaultFit } from '$lib/game/fitting';
import { STARTING_HULL, coreSlotIndex } from '$lib/game/hulls';
import { EMPTY } from '$lib/game/modules';
import {
	ShipError,
	activeShip,
	createStarterShip,
	ensureEveryPilotHasAShip,
	pilotSkillLevels,
	saveFit,
	shipFit,
	shipHull,
	shipReadout
} from './ships';

/** Deja al piloto sin nave, respetando las claves foráneas. */
function desguazar(db: Db, piloto: Pilot): void {
	const nave = activeShip(db, piloto.id)!;
	db.delete(fittedModule).where(eq(fittedModule.shipId, nave.id)).run();
	db.delete(ship).where(eq(ship.id, nave.id)).run();
}

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

	it('sale con los internos esenciales puestos', async () => {
		// Se mejoran, no se quitan: una nave sin propulsores no vuela.
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const nave = activeShip(db, piloto.id)!;
		const hull = shipHull(nave);
		const fit = shipFit(db, nave);
		hull.slots.forEach((slot, i) => {
			if (slot.kind === 'core') expect(fit[i], String(slot.core)).not.toBe(EMPTY);
		});
	});

	it('sale con el resto de las ranuras vacías', async () => {
		// Viene completa, no viene buena: lo que la define lo elige el piloto.
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const nave = activeShip(db, piloto.id)!;
		const hull = shipHull(nave);
		const fit = shipFit(db, nave);
		hull.slots.forEach((slot, i) => {
			if (slot.kind !== 'core') expect(fit[i]).toBe(EMPTY);
		});
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
		codigos[0] = 'mining_laser_1e';
		saveFit(db, nave, codigos);

		expect(shipFit(db, nave).map((module) => module.code)).toEqual(codigos);
	});

	it('no deja fila al vaciar una ranura', async () => {
		// Una ranura vacía es la ausencia de una fila, no una fila con vacío.
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const nave = activeShip(db, piloto.id)!;

		const codigos = shipFit(db, nave).map((module) => module.code);
		codigos[0] = 'mining_laser_1e';
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
		expect(() => saveFit(db, nave, ['plant_2e'])).toThrow(ShipError);
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
			if (slot.kind === 'utility') codigos[i] = 'armor_plate_1d';
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
		codigos[coreSlotIndex(hull, 'thrusters')] = 'thrusters_2a';
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

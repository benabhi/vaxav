/**
 * Escanear contra una base real: el instrumento, la lectura y su vencimiento.
 *
 * Cuatro cosas se prueban acá que las reglas puras no pueden: que **el módulo sea
 * el requisito duro**, que la lectura sea **de quien miró y de la piedra que
 * miró**, que **pague Ciencias** —porque es lo único que lo hace, y sin eso la
 * rama sería inalcanzable en la práctica— y que una roca que se termina **se
 * lleve su lectura**, para que nadie quede recordando algo que ya no existe.
 */

import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { asteroidSurvey, fittedModule, pilotAction } from '../db/schema';
import { crearPiloto, moverPiloto, seededDb } from '../db/testing';
import { ActionError, resolveIfDue, startSurvey } from './actions';
import { asteroidsAt, takeFromAsteroid } from './asteroids';
import { hasFreshSurvey, recordSurvey, surveyOf, surveyPlan, surveysOf } from './prospecting';
import { activeShip } from './ships';
import { getBody } from './universe';
import { getModule } from '$lib/game/modules';
import { SURVEY_FRESH_HOURS } from '$lib/game/prospecting';
import type { Db } from '../db/types';

const UNA_HORA = 3_600_000;

/** Un minero parado en los Anillos, con su escáner de fábrica montado. */
async function enLosAnillos(db: Db) {
	const piloto = await crearPiloto(db);
	const enElCinturon = moverPiloto(db, piloto, 'anillos_anfora_iii');
	return { piloto: enElCinturon, rocas: asteroidsAt(db, enElCinturon.locationId) };
}

/**
 * Le saca el escáner a la nave, dejando el resto del equipo como estaba.
 *
 * Se borra la fila montada y no se reescribe la configuración entera: lo que hace
 * falta es una nave sin instrumento, y pasar por `saveFit` obligaría a armar a
 * mano las once ranuras para cambiar una.
 */
function desmontarEscaner(db: Db, pilotId: number): void {
	const nave = activeShip(db, pilotId)!;
	const montados = db.select().from(fittedModule).where(eq(fittedModule.shipId, nave.id)).all();

	for (const fila of montados) {
		if (getModule(fila.moduleCode).sensorRange > 0) {
			db.delete(fittedModule).where(eq(fittedModule.id, fila.id)).run();
		}
	}
}

/** Hace vencer la orden en curso corriéndole el arranque hacia atrás. */
function vencer(db: Db, pilotId: number): void {
	const orden = db.select().from(pilotAction).where(eq(pilotAction.pilotId, pilotId)).get()!;
	db.update(pilotAction)
		.set({ startedAt: new Date(Date.now() - (orden.durationSeconds + 5) * 1000) })
		.where(eq(pilotAction.id, orden.id))
		.run();
}

describe('qué hace falta para escanear', () => {
	it('el minero sale del astillero con el instrumento puesto', async () => {
		const db = seededDb();
		const { piloto } = await enLosAnillos(db);

		const plan = surveyPlan(db, piloto);

		expect(plan.blocked).toBe('');
		expect(plan.sensorRange).toBeGreaterThan(0);
	});

	it('sin escáner montado no hay nada que hacer', async () => {
		const db = seededDb();
		const { piloto, rocas } = await enLosAnillos(db);
		desmontarEscaner(db, piloto.id);

		// El módulo es el requisito duro: es un instrumento, no una corazonada.
		expect(surveyPlan(db, piloto).blocked).not.toBe('');
		expect(() => startSurvey(db, piloto, rocas[0].id)).toThrow(ActionError);
	});

	it('sin entrenar nada igual se puede escanear', async () => {
		const db = seededDb();
		const { piloto } = await enLosAnillos(db);

		// Si la habilidad fuera el permiso, un minero nuevo no podría escanear
		// nunca, y Ciencias sería una rama sin ninguna fuente de experiencia.
		expect(surveyPlan(db, piloto).blocked).toBe('');
	});

	it('se niega con una roca que no está acá', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const lejos = asteroidsAt(db, getBody(db, 'anillos_anfora_iii')!.id)[0];

		expect(() => startSurvey(db, piloto, lejos.id)).toThrow(ActionError);
	});

	it('se niega con una orden ya en curso', async () => {
		const db = seededDb();
		const { piloto, rocas } = await enLosAnillos(db);
		startSurvey(db, piloto, rocas[0].id);

		expect(() => startSurvey(db, piloto, rocas[1].id)).toThrow(ActionError);
	});
});

describe('resolver la lectura', () => {
	it('deja escrito lo que se vio de esa roca', async () => {
		const db = seededDb();
		const { piloto, rocas } = await enLosAnillos(db);

		startSurvey(db, piloto, rocas[0].id);
		vencer(db, piloto.id);
		resolveIfDue(db, piloto);

		expect(surveyOf(db, piloto.id, rocas[0].id)).not.toBeNull();
		// Y sólo de esa roca: mirar una piedra no identifica el campo entero.
		expect(surveyOf(db, piloto.id, rocas[1].id)).toBeNull();
	});

	it('paga la experiencia a Ciencias', async () => {
		const db = seededDb();
		const { piloto, rocas } = await enLosAnillos(db);

		startSurvey(db, piloto, rocas[0].id);
		vencer(db, piloto.id);
		const informe = resolveIfDue(db, piloto)!;

		// Es lo único que paga Ciencias: si esto se rompiera, la rama quedaría sin
		// ninguna forma de crecer.
		expect(informe.deposit.family).toBe('science');
	});

	it('no mueve al piloto', async () => {
		const db = seededDb();
		const { piloto, rocas } = await enLosAnillos(db);

		startSurvey(db, piloto, rocas[0].id);
		vencer(db, piloto.id);
		resolveIfDue(db, piloto);

		expect(piloto.locationId).toBe(getBody(db, 'anillos_anfora_iii')!.id);
		expect(db.select().from(pilotAction).all()).toEqual([]);
	});

	it('volver a mirarla reemplaza la lectura en vez de apilar otra', async () => {
		const db = seededDb();
		const { piloto, rocas } = await enLosAnillos(db);

		for (let vez = 0; vez < 2; vez++) {
			startSurvey(db, piloto, rocas[0].id);
			vencer(db, piloto.id);
			resolveIfDue(db, piloto);
		}

		// Lo que importa es lo último que se vio; un historial de lecturas viejas
		// sería guardar el error de ayer.
		const todas = db
			.select()
			.from(asteroidSurvey)
			.where(eq(asteroidSurvey.pilotId, piloto.id))
			.all();
		expect(todas.length).toBe(1);
	});

	it('si la roca desapareció, la orden se cierra sin lectura', async () => {
		const db = seededDb();
		const { piloto, rocas } = await enLosAnillos(db);

		startSurvey(db, piloto, rocas[0].id);
		takeFromAsteroid(db, rocas[0].id, rocas[0].units);
		vencer(db, piloto.id);

		expect(() => resolveIfDue(db, piloto)).not.toThrow();
		// La orden no queda colgada: el piloto tiene que poder dar otra.
		expect(db.select().from(pilotAction).all()).toEqual([]);
	});
});

describe('la lectura guardada', () => {
	it('la de recién habilita trabajar', async () => {
		const db = seededDb();
		const { piloto, rocas } = await enLosAnillos(db);
		recordSurvey(db, piloto.id, rocas[0].id, 1);

		expect(hasFreshSurvey(db, piloto.id, rocas[0].id)).toBe(true);
	});

	it('la vieja se conserva pero deja de habilitar', async () => {
		const db = seededDb();
		const { piloto, rocas } = await enLosAnillos(db);
		recordSurvey(db, piloto.id, rocas[0].id, 1);
		db.update(asteroidSurvey)
			.set({ takenAt: new Date(Date.now() - (SURVEY_FRESH_HOURS + 1) * UNA_HORA) })
			.where(eq(asteroidSurvey.pilotId, piloto.id))
			.run();

		// No se borra: se muestra con su antigüedad y el piloto decide. Lo que no
		// hace es habilitar el láser, porque la roca es de todos.
		expect(surveyOf(db, piloto.id, rocas[0].id)).not.toBeNull();
		expect(hasFreshSurvey(db, piloto.id, rocas[0].id)).toBe(false);
	});

	it('es de quien miró, y no de la roca', async () => {
		const db = seededDb();
		const { piloto, rocas } = await enLosAnillos(db);
		const otro = await crearPiloto(db, 'Testigo');
		recordSurvey(db, piloto.id, rocas[0].id, 2);

		// Dos pilotos en el mismo campo tienen identificadas rocas distintas.
		expect(hasFreshSurvey(db, otro.id, rocas[0].id)).toBe(false);
	});

	it('la roca que se acaba se lleva su lectura', async () => {
		const db = seededDb();
		const { piloto, rocas } = await enLosAnillos(db);
		recordSurvey(db, piloto.id, rocas[0].id, 2);

		takeFromAsteroid(db, rocas[0].id, rocas[0].units);

		// Nadie tiene que quedar recordando una piedra que ya no existe.
		expect(surveyOf(db, piloto.id, rocas[0].id)).toBeNull();
	});

	it('se traen de a muchas para dibujar el campo de una vez', async () => {
		const db = seededDb();
		const { piloto, rocas } = await enLosAnillos(db);
		recordSurvey(db, piloto.id, rocas[0].id, 1);
		recordSurvey(db, piloto.id, rocas[1].id, 2);

		const lecturas = surveysOf(
			db,
			piloto.id,
			rocas.map((roca) => roca.id)
		);

		expect(lecturas.size).toBe(2);
		expect(lecturas.get(rocas[1].id)!.depth).toBe(2);
	});

	it('sin rocas que preguntar no va a la base', async () => {
		const db = seededDb();
		const { piloto } = await enLosAnillos(db);

		expect(surveysOf(db, piloto.id, []).size).toBe(0);
	});
});

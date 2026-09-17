/**
 * Lo que un piloto sabe de una roca, y cómo se entera.
 *
 * El cinturón está en el mapa y sus rocas se ven desde lejos —son bultos en el
 * radar—, pero **de qué son y cuánto tienen no se sabe sin apuntarles el
 * escáner**. Eso escribe una lectura.
 *
 * La lectura es **por piloto**: no es una propiedad de la roca sino de quién la
 * miró. Dos pilotos en el mismo campo pueden tener identificadas rocas distintas,
 * y el que tenga una lectura vieja está mirando la foto de ayer de una piedra que
 * cualquiera pudo estar picando mientras tanto.
 *
 * Corresponde a docs/systems/UNIVERSE.md.
 */

import { and, eq } from 'drizzle-orm';
import { asteroidSurvey, type AsteroidSurvey, type Pilot } from '../db/schema';
import type { Db } from '../db/types';
import { activeShip, pilotSkillLevels, shipFit, shipReadout } from './ships';
import { grantingModule, leverOf, leversFor, type Lever } from '$lib/game/sourcing';
import {
	SURVEY_REFINE_SKILL,
	SURVEY_SKILL,
	surveyAge,
	surveyDepth,
	surveySeconds,
	type SurveyDepth
} from '$lib/game/prospecting';

/** No se puede escanear. El mensaje se le muestra al jugador. */
export class SurveyError extends Error {}

/** La lectura que un piloto tiene de una roca, o `null` si nunca la miró. */
export function surveyOf(db: Db, pilotId: number, asteroidId: number): AsteroidSurvey | null {
	return (
		db
			.select()
			.from(asteroidSurvey)
			.where(and(eq(asteroidSurvey.pilotId, pilotId), eq(asteroidSurvey.asteroidId, asteroidId)))
			.get() ?? null
	);
}

/** Las lecturas que tiene de un puñado de rocas, por id. */
export function surveysOf(
	db: Db,
	pilotId: number,
	asteroidIds: readonly number[]
): Map<number, AsteroidSurvey> {
	if (asteroidIds.length === 0) return new Map();
	return new Map(
		db
			.select()
			.from(asteroidSurvey)
			.where(eq(asteroidSurvey.pilotId, pilotId))
			.all()
			.filter((fila) => asteroidIds.includes(fila.asteroidId))
			.map((fila) => [fila.asteroidId, fila])
	);
}

/**
 * Si la lectura que tiene de esa roca sirve para trabajar.
 *
 * Una lectura vieja **no se borra**: se muestra con su antigüedad y el piloto
 * decide. Lo que sí hace es dejar de habilitar la extracción, porque encenderle
 * el láser a una roca con datos de la semana pasada es apostar.
 */
export function hasFreshSurvey(db: Db, pilotId: number, asteroidId: number): boolean {
	const lectura = surveyOf(db, pilotId, asteroidId);
	return lectura !== null && !surveyAge(lectura.takenAt.getTime()).stale;
}

/** Lo que hace falta para escanear, y qué saldría si se hiciera ahora. */
export interface SurveyPlan {
	/** El alcance del escáner montado. Cero es que no hay ninguno. */
	readonly sensorRange: number;
	readonly durationSeconds: number;
	readonly depth: SurveyDepth;
	/**
	 * El escáner montado que habilita el verbo, o vacío si no hay ninguno.
	 *
	 * Viaja en el plan y no se busca aparte porque **es la misma pregunta** que
	 * `blocked` contesta al revés: uno dice por qué no se puede y el otro gracias a
	 * qué sí. Separarlos deja que se contradigan.
	 */
	readonly module: string;
	/** Las habilidades que cambian la lectura, con el nivel que el piloto tiene. */
	readonly levers: readonly Lever[];
	/** Por qué no se puede, o vacío si se puede. */
	readonly blocked: string;
}

/**
 * Qué escáner tiene el piloto y qué lectura sacaría.
 *
 * El **módulo es el requisito duro**: sin un escáner montado no hay nada que
 * hacer, por mucha habilidad que se tenga. La habilidad decide cuánto detalle
 * sale, no si sale: si fuera el permiso, un minero nuevo no podría escanear
 * nunca, porque Escaneo es de Ciencias, los pozos son por rama y escanear es lo
 * único que paga Ciencias. Sería una puerta cerrada con la llave adentro.
 */
export function surveyPlan(db: Db, row: Pilot): SurveyPlan {
	const nave = activeShip(db, row.id);
	const readout = shipReadout(db, row);
	const levels = pilotSkillLevels(db, row.id);
	const depth = surveyDepth(levels[SURVEY_SKILL] ?? 0, levels[SURVEY_REFINE_SKILL] ?? 0);

	if (readout === null || nave === null) {
		return {
			sensorRange: 0,
			durationSeconds: 0,
			depth,
			module: '',
			levers: [],
			blocked: 'Necesitás una nave.'
		};
	}

	// Las palancas salen igual cuando no hay escáner: sin ellas, la pantalla que
	// dice «te falta un escáner» no dice qué más hace falta, y el piloto compra el
	// instrumento para descubrir después que la lectura le sale a medias.
	const palancas = [
		...leversFor('sensor_range', readout.hull, levels),
		leverOf(SURVEY_REFINE_SKILL, levels)
	];
	const instrumento = grantingModule(shipFit(db, nave), 'sensorRange');

	if (readout.sensorRange <= 0 || instrumento === null) {
		return {
			sensorRange: 0,
			durationSeconds: 0,
			depth,
			module: '',
			levers: palancas,
			blocked: 'No tenés escáner montado: sin instrumento no hay nada que leer.'
		};
	}

	return {
		sensorRange: readout.sensorRange,
		durationSeconds: surveySeconds(readout.sensorRange),
		depth,
		module: instrumento.name,
		levers: palancas,
		blocked: readout.flyable ? '' : 'Tu nave no está en condiciones de trabajar.'
	};
}

/**
 * Deja escrito lo que el piloto acaba de ver.
 *
 * Reemplaza la lectura anterior en vez de apilar otra: lo que importa es lo
 * último que se vio, y un historial de lecturas viejas sería guardar el error de
 * ayer.
 */
export function recordSurvey(
	db: Db,
	pilotId: number,
	asteroidId: number,
	depth: SurveyDepth
): void {
	db.insert(asteroidSurvey)
		.values({ pilotId, asteroidId, depth, takenAt: new Date() })
		.onConflictDoUpdate({
			target: [asteroidSurvey.pilotId, asteroidSurvey.asteroidId],
			set: { depth, takenAt: new Date() }
		})
		.run();
}

/**
 * Escanear un cinturón: saber qué tiene antes de encenderle el láser.
 *
 * Un cinturón se ve desde el árbol del sistema —está ahí, en el mapa, a la vista
 * de cualquiera— pero **qué mineral guarda y cuánto queda no se sabe sin
 * mirarlo**. Eso es lo que hace esta acción, y es lo que convierte llegar a un
 * sistema nuevo en algo que hacer en vez de una lista que ya venía escrita.
 *
 * Tres decisiones que ordenan todo lo demás:
 *
 * 1. **El requisito duro es el módulo.** Sin un escáner montado no hay nada que
 *    hacer, por mucha habilidad que se tenga: es un instrumento, no una
 *    corazonada.
 * 2. **La habilidad gobierna cuánto se ve, no si se ve.** Sin entrenar sale una
 *    lectura pobre —qué minerales hay— y con Escaneo salen las cantidades. Si la
 *    habilidad fuera el permiso, un minero nuevo no podría escanear nunca:
 *    Escaneo es de Ciencias, los pozos son por rama, y **escanear es lo único que
 *    paga Ciencias**. Sería una puerta cerrada con la llave adentro.
 * 3. **La lectura envejece.** El cinturón es de todos y se agota entre todos, así
 *    que lo que uno vio ayer puede no ser lo que hay hoy. Una lectura vieja no
 *    miente: dice de cuándo es, y el piloto decide si le alcanza.
 *
 * Reglas puras: acá no hay base de datos ni piloto. Corresponde a
 * docs/systems/UNIVERSE.md.
 */

import { floorDiv } from './math';
import type { SkillFamily } from './skills';

/** A qué rama le paga escanear. */
export const SURVEY_FAMILY: SkillFamily = 'science';

/**
 * Cuánto pesa una lectura a la hora de repartir experiencia.
 *
 * Por encima de uno porque es corta y exigente: se lee un cinturón entero en
 * minuto y medio. Y porque **es lo único que paga Ciencias**: si rindiera poco,
 * la rama seguiría siendo inalcanzable en la práctica aunque técnicamente
 * tuviera una fuente.
 */
export const SURVEY_DIFFICULTY = 1.5;

/** La habilidad que decide cuánto detalle sale de una lectura. */
export const SURVEY_SKILL = 'scanning';
/** La que además revela a qué ritmo se recupera el cinturón. */
export const SURVEY_REFINE_SKILL = 'prospecting';

/**
 * Lo que tarda una lectura, antes del escáner.
 *
 * Corta a propósito: escanear es el paso previo a trabajar, no el trabajo. Si
 * costara lo que una extracción, nadie exploraría y todos volverían al cinturón
 * que ya conocen, que es justo lo contrario de para qué existe.
 */
export const BASE_SURVEY_SECONDS = 90;

/**
 * El piso, por la misma razón que lo tienen la extracción y la horquilla: por
 * mucho instrumento que se monte, mirar lleva un rato.
 */
export const MIN_SURVEY_SECONDS = 30;

/** El alcance de sensores del que se parte, para medir los escáneres contra algo. */
export const REFERENCE_SENSOR_RANGE = 25;

/**
 * Cuánto tarda leer un cinturón con el escáner que se tenga montado.
 *
 * Más alcance, más rápido: un instrumento mejor lee de más lejos y por lo tanto
 * abarca el cinturón en menos pasadas. Es la misma forma que tiene el viaje con
 * la velocidad.
 */
export function surveySeconds(sensorRange: number): number {
	if (sensorRange <= 0) return BASE_SURVEY_SECONDS;
	const acortado = floorDiv(BASE_SURVEY_SECONDS * REFERENCE_SENSOR_RANGE, sensorRange);
	return Math.max(MIN_SURVEY_SECONDS, acortado);
}

/**
 * Qué tan fina sale una lectura.
 *
 * - **0** — qué minerales hay. Es lo que sale sin entrenar nada, y alcanza para
 *   decidir si el cinturón sirve.
 * - **1** — además, cuánto queda de cada uno. Con eso se planifica un viaje.
 * - **2** — además, a qué ritmo se recupera. Es saber si conviene volver.
 */
export const SURVEY_DEPTHS = [0, 1, 2] as const;
export type SurveyDepth = (typeof SURVEY_DEPTHS)[number];

export function surveyDepth(scanning: number, prospecting: number): SurveyDepth {
	if (prospecting >= 1 && scanning >= 1) return 2;
	if (scanning >= 1) return 1;
	return 0;
}

/**
 * Qué dice una lectura de esa profundidad.
 *
 * Toma un número suelto y no el tipo cerrado a propósito: lo que llega de la base
 * es un entero, y una lectura guardada con una profundidad que el catálogo ya no
 * conoce tiene que poder nombrarse igual en vez de romper la pantalla.
 */
export function depthLabel(depth: number): string {
	if (depth >= 2) return 'Completa';
	if (depth >= 1) return 'Con cantidades';
	return 'Superficial';
}

/**
 * Cuánto vale una lectura antes de quedar vieja, en horas.
 *
 * Un día: lo bastante para que volver al cinturón de siempre no sea un trámite
 * diario, y lo bastante poco para que un cinturón muy trabajado por otros no se
 * quede con una foto de la semana pasada.
 */
export const SURVEY_FRESH_HOURS = 24;

const MILLISECONDS_PER_HOUR = 3_600_000;

/** Si una lectura sigue sirviendo, y de cuándo es. */
export function surveyAge(
	takenAt: number,
	now: number = Date.now()
): {
	hours: number;
	stale: boolean;
} {
	const horas = Math.max(0, floorDiv(now - takenAt, MILLISECONDS_PER_HOUR));
	return { hours: horas, stale: horas >= SURVEY_FRESH_HOURS };
}

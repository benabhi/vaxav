/**
 * El motor de acciones: cuánto tarda una acción y qué la habilita.
 *
 * Funciones puras sobre números, sin base de datos — la misma separación que ya
 * usa `progression`. La fórmula es la que fija docs/systems/ACTIONS.md: duración
 * base dividida por uno más la bolsa de bonos.
 *
 * Corresponde a docs/systems/ACTIONS.md y docs/systems/UNIVERSE.md.
 */

import { MINING_FAMILY } from './mining';
import { SURVEY_FAMILY } from './prospecting';
import type { SkillFamily } from './skills';

import { roundHalfEven } from './math';

/**
 * Segundos que tarda un viaje por cada unidad de distancia (suma de
 * `orbitDistance` a través del árbol), volando a la velocidad de referencia.
 *
 * Es una constante de MVP: con los valores sembrados del sistema Ánfora da
 * viajes de ~10 a ~110 segundos reales, pensados para poder probar el flujo sin
 * esperar.
 */
export const SECONDS_PER_DISTANCE_UNIT = 0.2;

/**
 * La velocidad contra la que se calibró esa constante: la de una lanzadera
 * recién salida del astillero. Una nave más rápida llega antes y una más cargada
 * tarda más, **sin mover los tiempos de hoy**.
 */
export const REFERENCE_SPEED = 190;

// Navegación **no** entra acá: ya está adentro de la velocidad de la nave, que
// la calcula `fitting` junto con el bono de rol del casco. Aplicarla otra vez
// sería contar el mismo bono dos veces para el mismo efecto, que es exactamente
// lo que la regla de "una sola bolsa" de ACTIONS.md quiere evitar.

/**
 * Las clases de acción que el juego sabe resolver.
 *
 * Es una tupla y no texto libre a propósito: el `kind` viaja hasta dos tablas, y
 * con más de una acción un error de tipeo llegaría a la base sin que nada lo
 * frene. Cada entrada de acá necesita su resolvedor en
 * `server/services/actions.ts`, y un test lo verifica.
 */
export const ACTION_KINDS = ['travel', 'mine', 'publish', 'survey'] as const;
export type ActionKind = (typeof ACTION_KINDS)[number];

export const TRAVEL_KIND: ActionKind = 'travel';
export const MINE_KIND: ActionKind = 'mine';
/** Acordar una orden del mercado, que es lo que la pone en el libro. */
export const PUBLISH_KIND: ActionKind = 'publish';
/** Leer un cinturón para saber qué tiene y cuánto queda. */
export const SURVEY_KIND: ActionKind = 'survey';

/**
 * La rama a la que viajar le deposita la experiencia.
 *
 * Se declara y no se deriva de la habilidad principal: el día que una acción
 * pague a una familia que no es la de su habilidad más obvia —entregar una
 * misión de combate, por ejemplo—, eso tiene que poder decirse acá y no
 * descubrirse leyendo el catálogo.
 */
export const TRAVEL_FAMILY: SkillFamily = 'piloting';
/** Acordar una compra o una venta paga Comercio, que es de lo que se trata. */
export const TRADE_FAMILY: SkillFamily = 'trade';

/**
 * Las ramas que hoy tienen de dónde entrenarse.
 *
 * **La experiencia se deposita por rama**, así que una rama sin ninguna acción
 * que la pague es una rama que nadie puede subir nunca. De ahí sale una regla que
 * condiciona todo el diseño de requisitos: **nada se gatea con una habilidad de
 * una rama que no esté en esta lista**, o el requisito sería una puerta cerrada
 * con la llave adentro.
 *
 * Las dos que faltan tienen fecha, no olvido:
 *
 * - **Ingeniería** es la rama del taller. Fabricar módulos es lo que la paga, y
 *   eso llega con la etapa 7. Hasta entonces, la planta y el distribuidor del
 *   escalón A no piden Gestión de energía aunque sea su habilidad natural.
 * - **Combate** llega con el combate. Hoy no hay ningún módulo avanzado de
 *   combate en el catálogo, así que todavía no necesita gatear nada.
 *
 * Se arma con las constantes de cada acción y no con una lista suelta: así
 * agregar una acción que pague una rama nueva la habilita acá sola.
 */
export const TRAINABLE_FAMILIES: readonly SkillFamily[] = [
	TRAVEL_FAMILY,
	TRADE_FAMILY,
	MINING_FAMILY,
	SURVEY_FAMILY
];

/**
 * Duración de un viaje entre dos cuerpos del mismo sistema, en segundos.
 *
 * Sale de la distancia y de la **velocidad de la nave**, y nada más. Todo lo que
 * acelera un viaje —Navegación, el bono de rol del casco, unos propulsores
 * mejores— ya está adentro de esa velocidad; volver a aplicarlo acá sería
 * contarlo dos veces.
 *
 * Que la velocidad mande es lo que hace que la masa de los módulos cueste tiempo
 * de verdad: una placa de blindaje que no consume energía igual te frena, y
 * frenar es llegar más tarde.
 *
 * Nunca da menos de un segundo, para que una distancia mínima no resuelva
 * instantáneamente.
 */
export function travelDurationSeconds(distance: number, speed: number = REFERENCE_SPEED): number {
	if (distance < 0) throw new RangeError('La distancia no puede ser negativa');
	if (speed <= 0) throw new RangeError('Una nave sin velocidad no puede viajar');

	return Math.max(
		1,
		roundHalfEven((distance * SECONDS_PER_DISTANCE_UNIT * REFERENCE_SPEED) / speed)
	);
}

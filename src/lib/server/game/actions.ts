/**
 * El motor de acciones: cuánto tarda una acción y qué la habilita.
 *
 * Funciones puras sobre números, sin base de datos — la misma separación que ya
 * usa `progression`. La fórmula es la que fija docs/systems/ACTIONS.md: duración
 * base dividida por uno más la bolsa de bonos.
 *
 * Corresponde a docs/systems/ACTIONS.md y docs/systems/UNIVERSE.md.
 */

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
 * Habilidades que reparte un viaje: Navegación se lleva el pozo completo,
 * Eficiencia de combustible su fracción de secundaria (ver `progression`).
 */
export const TRAVEL_PRIMARY_SKILL = 'navigation';
export const TRAVEL_SECONDARY_SKILLS = ['fuel_efficiency'] as const;

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

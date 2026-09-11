/**
 * Los tres tipos de daño y las tres capas que hay que atravesar.
 *
 * La decisión de fondo: **las resistencias no son un atributo de la nave, salen
 * de qué es cada capa.** Un escudo es un campo, así que lo atraviesa lo iónico y
 * le rebota lo cinético; el blindaje es materia y le pasa al revés; el casco
 * desnudo no resiste nada. Son nueve números, una sola vez, acá.
 *
 * Eso alcanza para calcular **puntos efectivos por tipo de daño**, que es el
 * número que un piloto mira para decidir si sale o no. Y no es un atajo que haya
 * que rehacer: las resistencias por casco y por módulo, cuando lleguen con el
 * combate (F14), son un modificador encima de esta tabla, y una nave sin ellos se
 * comporta exactamente como hoy.
 *
 * Corresponde a docs/systems/SHIPS.md.
 */

import { roundHalfEven } from './math';

/**
 * De qué está hecho un disparo.
 *
 * Tres y no cuatro: en un navegador, el cuarto tipo es el que nadie termina de
 * entender. Con tres, cada uno se explica en una línea y ninguno sobra.
 */
export const DAMAGE_TYPES = [
	/** Balas, metralla, misiles. Lo que tiene masa y llega hasta el metal. */
	'kinetic',
	/** Descargas que atraviesan un campo como si no estuviera. */
	'ionic',
	/** Calor. Pasa por todo, pero pega menos que un tipo especializado. */
	'thermal'
] as const;

export type DamageType = (typeof DAMAGE_TYPES)[number];

/** Las tres capas que hay que atravesar, de afuera hacia adentro. */
export const LAYERS = ['shield', 'armor', 'structure'] as const;

export type Layer = (typeof LAYERS)[number];

/** El orden en que se come el daño: primero el escudo, al final el casco. */
export const LAYER_ORDER: readonly Layer[] = LAYERS;

/**
 * Resistencia de cada capa a cada tipo, en porcentaje entero.
 *
 * Se lee por filas y cuenta la misma historia tres veces: el escudo frena la
 * materia y no frena la energía, el blindaje al revés, y el casco desnudo no
 * frena nada. El térmico queda en el medio en todas partes, y por eso las armas
 * térmicas pegan menos: ganan cuando no sabés a qué te enfrentás y pierden
 * cuando sí.
 */
export const BASE_RESISTANCE: Record<Layer, Record<DamageType, number>> = {
	shield: { kinetic: 50, ionic: 0, thermal: 25 },
	armor: { kinetic: 10, ionic: 50, thermal: 25 },
	structure: { kinetic: 0, ionic: 0, thermal: 0 }
};

/** Cuánto frena esa capa a ese tipo de daño, en porcentaje. */
export function resistance(layer: Layer, damageType: DamageType): number {
	return BASE_RESISTANCE[layer][damageType];
}

/**
 * Cuánto daño de ese tipo aguanta una capa con esos puntos.
 *
 * Con 50 % de resistencia, cien puntos de escudo aguantan doscientos de daño
 * cinético. Es el número que sirve para comparar dos configuraciones, porque los
 * puntos crudos no dicen nada sin saber contra qué.
 */
export function effectiveHp(points: number, layer: Layer, damageType: DamageType): number {
	if (points < 0) throw new RangeError('Una capa no puede tener puntos negativos');

	const stopped = resistance(layer, damageType);
	// Una resistencia del 100 % daría una nave invulnerable; la tabla no llega
	// ahí, pero la fórmula tiene que negarse igual antes que dividir por cero.
	if (stopped >= 100) throw new RangeError(`Resistencia imposible: ${stopped} %`);
	return roundHalfEven((points * 100) / (100 - stopped));
}

/**
 * Lo que aguanta la nave entera contra ese tipo, sumando las tres capas.
 *
 * Sumarlas es correcto porque el daño las atraviesa en orden: no hay forma de
 * pegarle al casco sin haber tirado antes el escudo y el blindaje.
 */
export function totalEffectiveHp(
	shield: number,
	armor: number,
	structure: number,
	damageType: DamageType
): number {
	return (
		effectiveHp(shield, 'shield', damageType) +
		effectiveHp(armor, 'armor', damageType) +
		effectiveHp(structure, 'structure', damageType)
	);
}

/**
 * Contra qué tipo de daño esta nave aguanta menos.
 *
 * Es la lectura que le importa al piloto antes de salir: no "cuánto escudo
 * tengo" sino "por dónde me van a romper". Los empates los resuelve el orden de
 * declaración, igual que el original.
 */
export function weakestAgainst(shield: number, armor: number, structure: number): DamageType {
	let weakest: DamageType = DAMAGE_TYPES[0];
	let least = totalEffectiveHp(shield, armor, structure, weakest);
	for (const damageType of DAMAGE_TYPES.slice(1)) {
		const aguante = totalEffectiveHp(shield, armor, structure, damageType);
		if (aguante < least) {
			least = aguante;
			weakest = damageType;
		}
	}
	return weakest;
}

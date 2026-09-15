/**
 * Las rocas de un cinturón: lo que se escanea y lo que se mina.
 *
 * Un cinturón no es un tanque de mineral: es **un campo de rocas**, y cada una
 * tiene lo suyo. Eso cambia el gesto del juego. Con el mineral a nivel del
 * cinturón, extraer era elegir de una lista que ya venía escrita; con rocas hay
 * que mirar cuál es cuál, y una roca que se agota **desaparece** en vez de bajar
 * un número.
 *
 * El depósito del cinturón no se va: pasa a ser **el plano**. Dice qué minerales
 * puede dar ese cinturón, cuánto aguanta y a qué ritmo se repone; las rocas son
 * los ejemplares que el plano genera. Así el agotamiento sigue siendo compartido
 * —las rocas son de todos y el que llega primero se las lleva— y sigue
 * recuperándose solo, pero a una escala que se puede señalar con el dedo.
 *
 * Reglas puras: acá no hay base de datos ni piloto. Corresponde a
 * docs/systems/UNIVERSE.md.
 */

import { floorDiv } from './math';

/**
 * Cuántas rocas tiene un cinturón lleno.
 *
 * Ocho: las suficientes para que haya que elegir y para que se note cuando el
 * campo está trabajado, y las pocas suficientes para que la lista quepa en una
 * pantalla sin paginarse. Un campo de cuarenta rocas no es más rico, es más
 * tedioso.
 */
export const ASTEROIDS_PER_BELT = 8;

/**
 * Entre qué fracciones del tamaño típico sale una roca, en centésimos.
 *
 * Las rocas **no son todas iguales** y ésa es la mitad de la gracia de
 * escanearlas: si todas tuvieran lo mismo, mirar cuál es cuál no aportaría nada
 * y el escáner sería un trámite. Con un rango ancho, encontrar una grande es un
 * hallazgo y el campo vale la pena recorrerlo.
 */
export const MIN_ASTEROID_PERCENT = 40;
export const MAX_ASTEROID_PERCENT = 160;

/**
 * El tamaño típico de una roca de un mineral, antes de la variación.
 *
 * Sale de repartir lo que el cinturón aguanta de ese mineral entre las rocas que
 * tiene. Así un cinturón rico da rocas grandes y uno pobre las da chicas, sin
 * una segunda tabla de tamaños que mantener en pareja con la primera.
 */
export function typicalUnits(capacity: number): number {
	return Math.max(1, floorDiv(capacity, ASTEROIDS_PER_BELT));
}

/**
 * Lo que trae una roca, dado un sorteo de 0 a 99.
 *
 * El azar entra **como parámetro y no como llamada**: así la regla es pura y se
 * puede probar con un número fijo, que es la única forma de tener un test que
 * valga sobre algo aleatorio.
 */
export function rolledUnits(capacity: number, roll: number): number {
	const rango = MAX_ASTEROID_PERCENT - MIN_ASTEROID_PERCENT;
	const porciento = MIN_ASTEROID_PERCENT + floorDiv(Math.max(0, Math.min(99, roll)) * rango, 100);
	return Math.max(1, floorDiv(typicalUnits(capacity) * porciento, 100));
}

/**
 * Cuántas rocas repone un cinturón en un rato, a su propio ritmo.
 *
 * El ritmo del plano se guarda en unidades por hora, que es como se pensó el
 * agotamiento compartido. Convertirlo a rocas mantiene esa promesa: un cinturón
 * muy trabajado tarda en volver a llenarse, y no hay forma de vaciarlo y
 * encontrarlo lleno cinco minutos después.
 */
export function spawnsIn(regenPerHour: number, capacity: number, secondsElapsed: number): number {
	if (regenPerHour <= 0 || secondsElapsed <= 0) return 0;
	const unidades = floorDiv(regenPerHour * secondsElapsed, 3600);
	return floorDiv(unidades, typicalUnits(capacity));
}

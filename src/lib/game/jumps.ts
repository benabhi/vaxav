/**
 * Cruzar una puerta: cuánto tarda y si se puede.
 *
 * **Cruzar una puerta es gratis.** No cuesta combustible, no pide alcance y el
 * tiempo sale de la distancia de la puerta y de nada más: cualquier nave cruza
 * cualquier puerta, como en EVE. La puerta hace todo el trabajo, que es para lo
 * que alguien la construyó.
 *
 * Hasta acá esto cobraba combustible por masa y distancia, que es **la fórmula
 * del motor de salto de EVE aplicada a la puerta**. Son dos cosas distintas: allá
 * el combustible paga por *saltearse* la red de puertas, no por usarla. Y el
 * argumento que lo decidió es de este juego y no de aquél: en EVE quedarse sin
 * isótopos te deja lento, y acá te dejaría **varado**, porque la puerta es el
 * único camino. Es el mismo razonamiento con el que el viaje dentro del sistema
 * ya era gratis.
 *
 * Lo que sí va a costar combustible es **el motor de salto de las capitales**, el
 * que cruza entre sistemas que no son vecinos y sin puerta. Ése es el verbo que
 * este módulo todavía no tiene, y por eso la maquinaria del insumo —`jumpFuel`,
 * `jumpsWithFuel`, el consumo por masa y su eficiencia— queda escrita y sin
 * llamadores: está dormida, no muerta, y el día que aparezca ese verbo es lo
 * único que no hay que volver a decidir.
 *
 * **Nada llega nunca a cero**: el tiempo tiene su piso de un segundo, como el
 * viaje dentro del sistema. Corresponde a docs/systems/ACTIONS.md y
 * docs/systems/UNIVERSE.md.
 */

import { floorDiv, roundHalfEven } from './math';

/**
 * En qué unidad se guarda una distancia de salto.
 *
 * **Décimas de año luz, en enteros**, como todo número del juego: con decimales,
 * dos jugadores calcularían saltos distintos por un redondeo. Se muestra como el
 * jugador la piensa —`1,4 al`— y se guarda como `14`.
 */
export const TENTHS = 10;

/**
 * Cuántas toneladas de nave gasta una unidad de combustible, por año luz.
 *
 * **Dormida hasta el motor de salto de las capitales.** Cruzar una puerta no
 * consume nada, así que hoy esto sólo lo lee `jumpFuel`, que tampoco tiene quién
 * lo llame: es el número que va a hacer que a una capital cargada le cueste más
 * saltar que a una vacía.
 */
export const MASS_PER_FUEL_UNIT = 40;

/**
 * Cuánto tarda cruzar un año luz de puerta.
 *
 * Es una constante de MVP, calibrada como la del viaje dentro del sistema: da
 * cruces de un par de minutos, largos comparados con moverse entre planetas
 * —cambiar de sistema tiene que sentirse como un viaje— pero cortos para poder
 * probar el flujo sin esperar una tarde.
 *
 * **Es lo único que decide el tiempo.** Antes se dividía por el alcance de la
 * nave y se le ponía un piso, y las dos cosas se fueron con el cobro: la puerta
 * tarda lo que tarda, y la misma puerta tarda lo mismo para todos.
 */
export const SECONDS_PER_LIGHT_YEAR = 240;

/** Lo mínimo que consumiría un salto sin puerta. Ninguno saldría gratis. */
export const MIN_JUMP_FUEL = 1;

/**
 * Cuánto tarda cruzar una puerta, en segundos.
 *
 * Sale de **la distancia de la puerta y nada más**: es un dato del universo, no
 * de la nave. Dos sistemas están a lo que están, y montar un calibrador de salto
 * no acorta el cruce ni un segundo — lo que acorta un cruce es que la puerta esté
 * más cerca.
 */
export function jumpSeconds(tenths: number): number {
	if (tenths < 0) throw new RangeError('La distancia de salto no puede ser negativa');

	return Math.max(1, roundHalfEven((tenths / TENTHS) * SECONDS_PER_LIGHT_YEAR));
}

/**
 * Cuánto combustible costaría un salto **sin puerta**, en unidades del tanque.
 *
 * **Dormida: hoy no la llama nadie.** Cruzar una puerta es gratis, y el verbo que
 * va a gastar combustible —el motor de salto de las capitales, que cruza entre
 * sistemas no adyacentes— todavía no existe. Se queda escrita porque es la regla
 * que ya está decidida y probada, y volver a derivarla más adelante sería pagar
 * dos veces por la misma cuenta.
 *
 * Escala con **la distancia y con la masa**, y las dos cosas importan. Sin la
 * distancia, un salto corto costaría lo mismo que uno largo y convendría siempre
 * el más largo, que es lo contrario de tener una galaxia con geografía. Sin la
 * masa, cargar la bodega hasta el tope saldría gratis.
 *
 * Eficiencia de combustible baja el gasto pero **nunca por debajo de una unidad**:
 * un salto gratis convertiría el combustible en un adorno.
 */
export function jumpFuel(tenths: number, mass: number, fuelEfficiency = 0): number {
	if (tenths < 0) throw new RangeError('La distancia de salto no puede ser negativa');
	if (mass < 0) throw new RangeError('La masa no puede ser negativa');

	const porAnoLuz = mass / MASS_PER_FUEL_UNIT;
	const bruto = (porAnoLuz * tenths) / TENTHS;
	const neto = bruto / (1 + fuelEfficiency / 100);

	return Math.max(MIN_JUMP_FUEL, roundHalfEven(neto));
}

/**
 * Cuántos saltos sin puerta —uno de un año luz— aguantaría un tanque.
 *
 * **Dormida por lo mismo que `jumpFuel`**, con una salvedad: la ficha de la nave
 * todavía la muestra como autonomía. Esa cifra habla del motor de salto que
 * todavía no existe, así que hasta que exista es un número sin verbo, y la
 * pantalla tendría que dejar de prometerlo.
 *
 * Se calcula con la misma función que el gasto para que la cifra de la ficha y la
 * del salto no puedan decir cosas distintas.
 */
export function jumpsWithFuel(fuel: number, mass: number, fuelEfficiency = 0): number {
	return floorDiv(fuel, jumpFuel(TENTHS, mass, fuelEfficiency));
}

/**
 * Lo que hace falta saber de la nave para decidir si puede cruzar.
 *
 * **Quedó en un solo campo**, y eso es exactamente la decisión: la puerta no
 * pregunta por el motor, ni por la masa, ni por el tanque. Sigue siendo un objeto
 * y no un booleano suelto porque el motor de salto de las capitales va a volver a
 * preguntar por todo eso, y porque `jumpProblem(nave, ...)` se lee y
 * `jumpProblem(true, 14, false)` no.
 */
export interface JumpShip {
	/** Si la configuración se puede volar. */
	readonly flyable: boolean;
}

/**
 * Por qué no se puede cruzar esta puerta, o `null` si se puede.
 *
 * Devuelve la frase lista para mostrar, como el resto de las validaciones del
 * proyecto. **Los tres motivos que quedan no se arreglan comprando**: una nave
 * que no vuela, una puerta sin nada del otro lado y un paso cerrado. Eso es lo
 * que queda cuando cruzar deja de costar: la puerta no se gana con equipo, y por
 * eso el piloto nuevo llega a cualquier lado.
 */
export function jumpProblem(ship: JumpShip, tenths: number | null, closed = false): string | null {
	if (!ship.flyable) return 'La nave no está en condiciones de volar.';
	if (tenths === null) return 'Esta puerta todavía no lleva a ninguna parte.';
	if (closed) return 'El paso por esta puerta está cerrado.';

	return null;
}

/**
 * Una distancia de salto en años luz, con un decimal.
 *
 * Se guarda en décimas y en enteros —como todo número del juego— y se muestra
 * como el jugador la piensa: `1,4 al` y no `14`.
 */
export function lightYears(tenths: number): string {
	const enteros = floorDiv(tenths, TENTHS);
	return `${enteros},${Math.abs(tenths % TENTHS)} al`;
}

/**
 * Cruzar una puerta: cuánto tarda, cuánto combustible cuesta y si se llega.
 *
 * Las tres cosas salen de **la distancia de la puerta**, que es un dato del
 * universo y no de la nave: dos sistemas están a lo que están, y lo que cambia de
 * un piloto a otro es con qué lo cruza.
 *
 * **Nada llega nunca a cero.** Ni el tiempo ni el consumo, por mejor equipado que
 * esté alguien: el techo de eficiencia es parte del balance y no un efecto
 * colateral. Es la misma regla que el viaje dentro del sistema, que nunca baja de
 * un segundo, y la que va a valer para toda actividad futura.
 *
 * Y **todo lo que mejora un salto ya está adentro de `jumpRange`**: el motor que
 * lleva montado, la masa que arrastra y Astrogación, que le da un 4 % por nivel.
 * Volver a aplicarlos acá sería contarlos dos veces, que es el error que el viaje
 * dentro del sistema ya evita apoyándose en la velocidad.
 *
 * Corresponde a docs/systems/ACTIONS.md y docs/systems/UNIVERSE.md.
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
 * Vive con el salto y no con el equipamiento porque es una regla del salto: es el
 * número que hace que cargar la bodega hasta el tope también acorte la autonomía,
 * y no sólo la velocidad. La ficha de la nave lo usa a través de `jumpsWithFuel`,
 * así que la autonomía que muestra y el gasto real no pueden contradecirse.
 */
export const MASS_PER_FUEL_UNIT = 40;

/**
 * Cuánto tarda cruzar un año luz con el alcance de referencia.
 *
 * Es una constante de MVP, calibrada como la del viaje dentro del sistema: da
 * saltos de un par de minutos, largos comparados con moverse entre planetas
 * —cruzar a otro sistema tiene que sentirse como un viaje— pero cortos para poder
 * probar el flujo sin esperar una tarde.
 */
export const SECONDS_PER_LIGHT_YEAR = 240;

/**
 * El alcance contra el que se calibró: el de una lanzadera de astillero.
 *
 * Una nave con mejor motor de salto cruza antes y una cargada tarda más, **sin
 * mover los tiempos de hoy**.
 */
export const REFERENCE_JUMP_RANGE = 30;

/**
 * El piso del tiempo de salto, como fracción de la base.
 *
 * Por muchos bonos que junte nadie salta en cero segundos. Un cuarenta por ciento
 * quiere decir que el mejor equipo del juego llega, como mucho, en poco menos de
 * la mitad de lo que tarda una lanzadera — una diferencia que se nota y que no
 * borra el viaje.
 */
export const JUMP_FLOOR_PERCENT = 40;

/** Lo mínimo que consume un salto. Ninguno sale gratis. */
export const MIN_JUMP_FUEL = 1;

/**
 * Cuánto tarda un salto, en segundos.
 *
 * Sale de la distancia y del alcance de la nave, que es exactamente la forma del
 * viaje dentro del sistema: distancia sobre capacidad de moverse. Una nave sin
 * motor de salto no puede saltar, así que su alcance cero no entra acá: eso lo
 * atrapa `jumpProblem` antes.
 */
export function jumpSeconds(tenths: number, jumpRange: number): number {
	if (tenths < 0) throw new RangeError('La distancia de salto no puede ser negativa');
	if (jumpRange <= 0) throw new RangeError('Una nave sin alcance de salto no puede saltar');

	const base = (tenths / TENTHS) * SECONDS_PER_LIGHT_YEAR;
	const propio = (base * REFERENCE_JUMP_RANGE) / jumpRange;
	const piso = (base * JUMP_FLOOR_PERCENT) / 100;

	return Math.max(1, roundHalfEven(Math.max(propio, piso)));
}

/**
 * Cuánto combustible cuesta un salto, en unidades del tanque.
 *
 * Escala con **la distancia y con la masa**, y las dos cosas importan. Sin la
 * distancia, un salto corto costaría lo mismo que uno largo y convendría siempre
 * el más largo, que es lo contrario de tener una galaxia con geografía. Sin la
 * masa, cargar la bodega hasta el tope saldría gratis.
 *
 * El consumo de referencia —una tonelada cada cuarenta, por año luz— es el mismo
 * número con el que la ficha de la nave calcula cuántos saltos le entran en el
 * tanque, así que las dos cuentas no pueden contradecirse.
 *
 * Eficiencia de combustible baja el gasto pero **nunca por debajo de una unidad**:
 * un salto gratis convertiría el combustible en un adorno.
 */
export function jumpFuel(tenths: number, mass: number, efficiencyPercent = 0): number {
	if (tenths < 0) throw new RangeError('La distancia de salto no puede ser negativa');
	if (mass < 0) throw new RangeError('La masa no puede ser negativa');

	const porAnoLuz = mass / MASS_PER_FUEL_UNIT;
	const bruto = (porAnoLuz * tenths) / TENTHS;
	const neto = bruto / (1 + efficiencyPercent / 100);

	return Math.max(MIN_JUMP_FUEL, roundHalfEven(neto));
}

/**
 * Cuántos saltos de referencia —uno de un año luz— aguanta un tanque.
 *
 * Es lo que la ficha de la nave muestra como autonomía. Se calcula con la misma
 * función que el gasto real para que la cifra de la ficha y la del salto no
 * puedan decir cosas distintas.
 */
export function jumpsWithFuel(fuel: number, mass: number, efficiencyPercent = 0): number {
	return floorDiv(fuel, jumpFuel(TENTHS, mass, efficiencyPercent));
}

/** Lo que hace falta saber de la nave para decidir si puede cruzar. */
export interface JumpShip {
	/** Alcance máximo, en décimas de año luz. */
	readonly jumpRange: number;
	readonly mass: number;
	/** Lo que tiene en el tanque ahora. */
	readonly fuel: number;
	/** Si la configuración se puede volar. */
	readonly flyable: boolean;
	readonly efficiencyPercent?: number;
}

/**
 * Por qué no se puede cruzar esta puerta, o `null` si se puede.
 *
 * Devuelve la frase lista para mostrar, como el resto de las validaciones del
 * proyecto. El orden importa: primero lo que no depende del salto —la nave no
 * vuela, la puerta no lleva a ningún lado—, después el alcance y al final el
 * combustible, que es lo único que se arregla comprando.
 */
export function jumpProblem(ship: JumpShip, tenths: number | null, closed = false): string | null {
	if (!ship.flyable) return 'La nave no está en condiciones de volar.';
	if (tenths === null) return 'Esta puerta todavía no lleva a ninguna parte.';
	// **Antes que el alcance y el combustible.** Una puerta cerrada no se cruza
	// con mejor nave ni con más tanque, así que decir «te falta alcance» sería
	// mandar al jugador a gastar en algo que no lo va a dejar pasar igual.
	if (closed) return 'El paso por esta puerta está cerrado.';

	if (ship.jumpRange <= 0) return 'La nave no tiene motor de salto.';
	if (tenths > ship.jumpRange) {
		return `El salto es de ${lightYears(tenths)} y la nave alcanza ${lightYears(ship.jumpRange)}.`;
	}

	const cuesta = jumpFuel(tenths, ship.mass, ship.efficiencyPercent ?? 0);
	if (ship.fuel < cuesta) {
		return `Hacen falta ${cuesta} de combustible y hay ${ship.fuel}.`;
	}

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

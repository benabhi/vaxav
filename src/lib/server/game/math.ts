/**
 * Aritmética de enteros con la semántica exacta del balance del juego.
 *
 * Python y JavaScript no redondean igual, y estos números son el balance: una
 * diferencia de un punto en una resistencia o de un segundo en un viaje se
 * arrastra a todo lo que dependa de ellos. Estas tres funciones reproducen los
 * operadores que usa el diseño original, y **toda** regla del juego las usa en
 * lugar de `Math.round`, `/` o `Math.trunc` sueltos.
 */

/**
 * Redondea al entero más cercano y, ante un empate exacto, al par.
 *
 * Es lo que hace `round()` en Python: `roundHalfEven(2.5) === 2` y
 * `roundHalfEven(3.5) === 4`, mientras que `Math.round` devuelve 3 y 4. El
 * sesgo de redondear siempre para arriba se acumula cuando se aplica a miles de
 * cálculos, y acá se aplica a las resistencias, los bonos y las duraciones.
 */
export function roundHalfEven(value: number): number {
	const lower = Math.floor(value);
	const rest = value - lower;
	if (rest > 0.5) return lower + 1;
	if (rest < 0.5) return lower;
	// Empate exacto: se queda con el par de los dos candidatos.
	return lower % 2 === 0 ? lower : lower + 1;
}

/**
 * División entera hacia abajo, como el operador `//`.
 *
 * `Math.floor(a / b)` y no `Math.trunc`: con negativos son cosas distintas, y
 * el original redondea hacia abajo siempre.
 */
export function floorDiv(dividend: number, divisor: number): number {
	return Math.floor(dividend / divisor);
}

/**
 * Descarta la parte decimal acercándose a cero, como `int()` sobre un flotante.
 *
 * No es redondear: `truncate(9.9) === 9`. Se usa donde el original convierte un
 * cálculo con decimales a entero, como el pozo de experiencia de una acción.
 */
export function truncate(value: number): number {
	return Math.trunc(value);
}

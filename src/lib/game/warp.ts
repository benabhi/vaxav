/**
 * Cuánto cuesta salir y cuánto cuesta cruzar: alineación y velocidad de warp.
 *
 * Viajar dentro de un sistema dejó de ser empuje sobre masa. Ahora son dos cosas
 * que se suman y que no se parecen en nada:
 *
 * - **La alineación** es un costo fijo. La nave tiene que apuntar y tomar vector
 *   antes de entrar en warp, y eso tarda lo mismo para ir al planeta de al lado
 *   que al otro extremo del sistema. Sale de la **agilidad** —masa por inercia—,
 *   que es lo que hace que una carguera se sienta carguera desde el primer
 *   segundo.
 * - **El crucero** es lo único que escala con la distancia, y sale de la
 *   **velocidad de warp del casco**.
 *
 * Que sean dos números distintos es la mitad del diseño: **un casco rápido no
 * alinea más rápido**. El Vencejo sale antes y llega antes; la Mula hace las dos
 * cosas tarde. Y el piloto sólo puede mejorar la primera —con Maniobra—, porque
 * la segunda es de la nave: en EVE ninguna habilidad sube la velocidad de warp, a
 * propósito, para que elegir casco siga decidiendo algo cuando el piloto ya lo
 * entrenó todo.
 *
 * Vive aparte de `actions` porque es física de la nave y no del verbo: la
 * calculadora de equipamiento la necesita para la ficha y el motor de acciones
 * para la orden. Las dos leen de acá, así que la pantalla no puede prometer un
 * tiempo distinto del que la orden va a cobrar.
 *
 * Corresponde a docs/systems/ACTIONS.md y docs/systems/SHIPS.md.
 */

// La misma escala de décimas con la que el juego lleva todo lo que necesita
// fracción. Vive con la distancia de salto por historia, y `fitting` ya la usa
// para el daño por segundo: repetir el 10 acá sería la misma unidad en dos
// lugares.
import { TENTHS } from './jumps';
import { roundHalfEven } from './math';

/**
 * El logaritmo de la fórmula de alineación de EVE.
 *
 * Alinear no es girar hasta el rumbo: es alcanzar la fracción de velocidad a la
 * que el motor de warp engancha, y eso se acerca de forma exponencial. De ahí
 * sale el `ln(2)` —y no un factor lineal— en `ln(2) × inercia × masa`.
 */
const ALIGN_LOG = Math.LN2;

/**
 * Cuánta agilidad se paga con un segundo de alineación.
 *
 * **Es la constante recalibrada, y el único número que se movió al cambiar de
 * modelo.** EVE divide por 500.000 sobre masas en kilos, que sobre las toneladas
 * de Vaxav equivale a dividir por 500: con eso la lanzadera inicial alinearía en
 * menos de un segundo y el sumando fijo no se notaría contra un viaje de medio
 * minuto, que es justamente lo que el modelo nuevo viene a que se note.
 *
 * Con 100, la lanzadera de astillero alinea en cuatro segundos y la carguera en
 * quince: entre un décimo y la mitad de un viaje corto: se siente al salir sin
 * volverse un peaje. Es la misma clase de compresión que ya tienen las masas y
 * las distancias del juego.
 */
export const AGILITY_PER_ALIGN_SECOND = 100;

/** Ninguna nave sale instantáneamente, por liviana que sea. */
export const MIN_ALIGN_SECONDS = 1;

/**
 * La agilidad de una nave: masa por inercia, y cuanto más baja, mejor.
 *
 * **Es el único número que el equipamiento empeora sin pedir permiso**: cada
 * módulo montado suma masa, y la masa entra acá. Una placa de blindaje que no
 * consume nada igual te hace salir más tarde.
 *
 * El bono **divide en vez de multiplicar**, como la eficiencia de combustible:
 * Maniobra mejora la agilidad, y mejorar la agilidad es bajar el número. Con
 * Maniobra V —+25 %— la alineación baja un 20 %.
 *
 * La inercia llega en décimas, que es como la guarda el casco.
 *
 * **Devuelve el valor exacto y no lo redondea**, que es lo contrario de lo que
 * hace el resto de las reglas y por eso se dice acá: el único destino de este
 * número es `alignSeconds`, y redondear dos veces —una la agilidad y otra los
 * segundos— movía un segundo en veintiocho de cada veintiún mil casos, para los
 * dos lados. La cuenta redondea **donde termina**, que es en el segundo que se
 * muestra y se cobra. Quien quiera mostrar la agilidad la redondea al mostrarla,
 * como hace la hoja de la nave.
 */
export function agility(mass: number, inertiaTenths: number, bonusPercent = 0): number {
	if (mass < 0) throw new RangeError('La masa no puede ser negativa');
	if (inertiaTenths <= 0) throw new RangeError('Un casco sin inercia no existe');

	return (mass * inertiaTenths) / TENTHS / (1 + bonusPercent / 100);
}

/**
 * Cuánto tarda una nave en alinearse, en segundos.
 *
 * Es la fórmula de EVE con la constante de Vaxav. **Redondea una sola vez y es la
 * única que redondea** en toda la cuenta: recibe la agilidad exacta —ver
 * `agility`— y devuelve el segundo entero. Se redondea acá y no al sumar el viaje
 * entero para que **el número que muestra la ficha sea el mismo que paga la
 * orden**: un segundo de diferencia entre lo prometido y lo cobrado es de los
 * errores que el jugador descubre justo cuando lo perjudica.
 */
export function alignSeconds(shipAgility: number): number {
	if (shipAgility < 0) throw new RangeError('La agilidad no puede ser negativa');

	return Math.max(
		MIN_ALIGN_SECONDS,
		roundHalfEven((ALIGN_LOG * shipAgility) / AGILITY_PER_ALIGN_SECOND)
	);
}

/**
 * Cuánto tarda el tramo en warp, en segundos: distancia sobre velocidad.
 *
 * **Es la única parte que escala con la distancia**, y por eso dos viajes de
 * distinto largo con la misma nave se diferencian sólo acá. La velocidad llega en
 * décimas de unidad de distancia por segundo, que es como la guarda el casco.
 *
 * Puede dar cero: cruzar de una luna a su planeta es casi nada de crucero y todo
 * de alineación, que es exactamente lo que pasa en EVE. El piso de un segundo lo
 * pone la alineación, que nunca es cero.
 */
export function warpSeconds(distance: number, warpSpeedTenths: number): number {
	if (distance < 0) throw new RangeError('La distancia no puede ser negativa');
	if (warpSpeedTenths <= 0) throw new RangeError('Una nave sin motor de warp no puede viajar');

	return roundHalfEven((distance * TENTHS) / warpSpeedTenths);
}

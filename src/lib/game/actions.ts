/**
 * El motor de acciones: cuánto tarda una acción y qué la habilita.
 *
 * Funciones puras sobre números, sin base de datos — la misma separación que ya
 * usa `progression`. La fórmula general es la que fija docs/systems/ACTIONS.md:
 * duración base dividida por uno más la bolsa de bonos.
 *
 * **Viajar tiene forma propia y es el único que la tiene**: no hay una duración
 * base que dividir, porque la mitad del reloj no depende de la distancia. Son
 * dos sumandos —alineación más crucero— y la regla de "un bono se aplica una
 * sola vez" se cumple igual: cada uno está adentro de un número distinto de la
 * hoja de la nave.
 *
 * Corresponde a docs/systems/ACTIONS.md y docs/systems/UNIVERSE.md.
 */

import { STARTING_HULL, getHull } from './hulls';
import { MINING_FAMILY } from './mining';
import { SURVEY_FAMILY } from './prospecting';
import type { SkillFamily } from './skills';
import { actionXpPool } from './progression';
import { agility, alignSeconds, warpSeconds } from './warp';

/**
 * Lo que hace falta saber de la nave para calcular un viaje.
 *
 * **Dos números y no uno**, que es todo el modelo: cuánto tarda en salir y cuán
 * rápido cruza. Los calcula `fitting` —la misma hoja que ve la pantalla— así que
 * una `Readout` entra acá tal cual, y lo prometido y lo cobrado no pueden
 * separarse.
 *
 * Es un objeto y no dos parámetros sueltos por lo mismo que `JumpShip`:
 * `travelDurationSeconds(distancia, nave)` se lee, y `(distancia, 50, 4)` no.
 */
export interface TravelShip {
	/** Décimas de unidad de distancia por segundo. */
	readonly warpSpeed: number;
	/** Segundos de alineación antes de entrar en warp. */
	readonly alignSeconds: number;
}

/**
 * La nave contra la que está calibrado el universo sembrado: **la lanzadera de
 * astillero**, sin nada montado y sin nadie entrenado.
 *
 * Sale del catálogo y no de dos literales copiados: el día que la Pioner cambie
 * de clase, las duraciones que muestran las pantallas sin nave cambian con ella.
 * Se usa donde todavía no hay nave de la que sacar los números —un piloto que
 * mira el mapa antes de que le entreguen la suya—, que es el único caso en el
 * que hay que inventar una.
 *
 * **Los cinco décimos de segundo por unidad de distancia siguen siendo los
 * mismos de antes**: la constante vieja era `0,2 s/ud`, que es exactamente una
 * nave de 5,0 de warp. Lo que se sumó encima es la alineación, y es todo lo que
 * cambió de escala.
 */
export const REFERENCE_SHIP: TravelShip = referenceShip();

/** La terna de viaje de un casco recién salido del astillero, sin módulos. */
function referenceShip(): TravelShip {
	const hull = getHull(STARTING_HULL);
	return {
		warpSpeed: hull.warpSpeed,
		alignSeconds: alignSeconds(agility(hull.mass, hull.inertia))
	};
}

// Ni Navegación ni Maniobra entran acá: la primera está dormida con la velocidad
// sub-warp y la segunda ya está adentro de la alineación, que la calcula
// `fitting` junto con el bono de rol del casco. Aplicarlas otra vez sería contar
// el mismo bono dos veces para el mismo efecto, que es exactamente lo que la
// regla de "una sola bolsa" de ACTIONS.md quiere evitar.

/**
 * Las clases de acción que el juego sabe resolver.
 *
 * Es una tupla y no texto libre a propósito: el `kind` viaja hasta dos tablas, y
 * con más de una acción un error de tipeo llegaría a la base sin que nada lo
 * frene. Cada entrada de acá necesita su resolvedor en
 * `server/services/actions.ts`, y un test lo verifica.
 */
export const ACTION_KINDS = ['travel', 'jump', 'mine', 'publish', 'survey'] as const;
export type ActionKind = (typeof ACTION_KINDS)[number];

export const TRAVEL_KIND: ActionKind = 'travel';
/**
 * Cruzar una puerta hacia otro sistema.
 *
 * Es una acción aparte de viajar y no un viaje más largo: cambia de sistema, su
 * duración sale de la distancia de la puerta y no de la velocidad de la nave, y
 * deja anotada esa distancia en el informe. Viajar no hace ninguna de las tres
 * cosas, y meterlas en el mismo resolvedor obligaría a preguntarse en cada rama
 * si esto es un salto — que es exactamente el error que el despachador por clase
 * existe para evitar.
 */
export const JUMP_KIND: ActionKind = 'jump';
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
 * **Son dos sumandos que no se parecen**, y ésa es toda la mecánica:
 *
 * ```
 * duración = alineación + distancia ÷ velocidad de warp
 * ```
 *
 * La alineación es fija: se paga igual para ir a la luna de al lado que al otro
 * extremo del sistema, y sale de la agilidad de la nave —masa por inercia—, así
 * que una carguera con el bastidor lleno de placas la paga cara. El crucero es lo
 * único que escala con la distancia, y sale de la velocidad de warp del casco.
 *
 * Que estén separados es lo que hace que **dos viajes de distinto largo con la
 * misma nave se diferencien sólo en el segundo sumando**, y que un casco rápido
 * no salga antes: son dos números distintos y se mejoran por caminos distintos
 * —el piloto entrena Maniobra, la nave se elige—.
 *
 * Antes era `distancia ÷ velocidad` y nada más, con lo que un trayecto corto y
 * uno largo se sentían iguales y la única palanca era el empuje.
 *
 * Nunca da menos de un segundo: lo garantiza la alineación, que nunca es cero.
 */
export function travelDurationSeconds(distance: number, ship: TravelShip = REFERENCE_SHIP): number {
	if (distance < 0) throw new RangeError('La distancia no puede ser negativa');

	return Math.max(1, ship.alignSeconds + warpSeconds(distance, ship.warpSpeed));
}

/** Segundos de un minuto, que es la unidad en la que se reparte experiencia. */
const SECONDS_PER_MINUTE = 60;

/**
 * Cuánto pesa viajar a la hora de repartir experiencia: **el piso de la escala**.
 *
 * SKILLS.md fija la dificultad de una acción entre 0,5 y 3, y viajar se lleva el
 * mínimo documentado porque es **el verbo más barato que hay**: no arriesga nada,
 * no gasta nada y no hay forma de hacerlo mal. El número no se inventó acá: es el
 * extremo de abajo del rango que el documento ya tenía escrito.
 */
export const TRAVEL_DIFFICULTY = 0.5;

/**
 * La experiencia que deposita un viaje, **por lo recorrido y no por lo que tardó**.
 *
 * Hasta acá salía de la duración, y eso premiaba exactamente lo contrario de lo
 * que el juego quiere premiar: la misma ruta pagaba 21 de Pilotaje en la
 * exploradora y 64 en la carguera, y montar un optimizador —la mejora que existe
 * para acortar el viaje— le sacaba al piloto el 41 % de lo que ese viaje pagaba.
 * **Mejorar la nave castigaba**, que es un incentivo al revés y de los que se
 * descubren tarde.
 *
 * Con la distancia, la misma ruta paga lo mismo para todos: lo que se recorrió es
 * lo que se aprendió, y con qué nave se hizo es problema del piloto.
 *
 * Los minutos que entran a la fórmula del pozo son **los de la nave de
 * referencia**, no los de la que viajó. Así la cuenta documentada de SKILLS.md
 * —`10 × minutos × dificultad`— sigue siendo la misma y no hace falta inventarle
 * una segunda al lado: los minutos son los que tardaría la lanzadera de astillero
 * contra la que está calibrado todo el universo. **Y sin la alineación**, que no
 * es distancia recorrida: arrancar el motor no enseña nada.
 */
export function travelXp(distance: number): number {
	if (distance < 0) throw new RangeError('La distancia no puede ser negativa');

	const minutos = warpSeconds(distance, REFERENCE_SHIP.warpSpeed) / SECONDS_PER_MINUTE;
	return actionXpPool(minutos, TRAVEL_DIFFICULTY);
}

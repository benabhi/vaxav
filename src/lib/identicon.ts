/**
 * El sello: un emblema que se calcula a partir de un nombre.
 *
 * **Nace porque hay cosas que necesitan cara y nadie va a dibujarles una.** Treinta
 * y siete corporaciones hoy, cientos mañana, y un piloto que todavía no subió foto:
 * pedir una imagen por cada una es pedir que el contenido nuevo llegue siempre a
 * medias. El sello sale del nombre, así que todo lo que existe tiene emblema desde
 * el segundo en que existe.
 *
 * Cuatro reglas lo definen:
 *
 * 1. **Del nombre y de nada más.** Mismo nombre, mismo sello, en esta máquina y en
 *    la del jugador, hoy y en seis años. No se guarda en ninguna tabla porque no
 *    hay nada que guardar: se recalcula en dos microsegundos.
 * 2. **Simétrico.** Espejado sobre el eje vertical, que es lo que convierte un
 *    ruido de celdas en algo que parece un escudo. La simetría no se dibuja: se
 *    arma acá, plantando cada celda junto a su reflejo.
 * 3. **Una familia por clase de cosa.** Una corporación no se puede confundir con
 *    un piloto ni de reojo: la corporación es un **panal hexagonal con marco de
 *    seis lados** y el piloto un **disco de casillas cuadradas**. Cambian la
 *    silueta, la celda y el color, que son las tres cosas que se leen antes que el
 *    nombre. Agregar una familia —alianzas, estaciones— es agregar una receta.
 * 4. **Del idioma del juego.** Hexágonos porque la galaxia es una grilla de
 *    hexágonos y el árbol del piloto es un hexágono; y la saturación y el brillo
 *    fijos de la paleta, para que ningún emblema desentone con el naranja del HUD
 *    aunque su tono sea verde.
 *
 * **Puro y sin dependencias de pantalla**: devuelve un plano —colores, celdas,
 * variantes— y `Identicon.svelte` lo dibuja. Así se puede probar la simetría sin
 * montar un componente, que es lo único de esto que realmente puede romperse.
 *
 * Corresponde a docs/systems/CORPORATIONS.md.
 */

import { BRILLO, SATURACION, hslToHex } from './palette';
import { dadoDe } from './random';
import { hexToPixel, type Hex } from './game/galaxy';

/**
 * Las medidas del dibujo, en unidades del lienzo.
 *
 * Viven acá y no en el componente porque el plano ya trae las celdas ubicadas: dos
 * juegos de medidas serían un emblema que se sale de su marco.
 */
export const LIENZO = 100;
const CENTRO = LIENZO / 2;
/** Radio del marco, pegado al borde del lienzo. */
export const MARCO = 48;
/** Y el del anillo de adentro, que va más tenue. */
export const INTERIOR = 40;

/**
 * Radio de una casilla del panal.
 *
 * **Es el número que decide cuánto ocupa el dibujo**, y tiene un techo: el racimo
 * mide dos anillos y medio de alto —`4,33 · celda`— y tiene que entrar en el alto
 * del marco, que con un hexágono de lado plano es `0,866 · radio`. De ahí sale que
 * no puede pasar de la quinta parte del marco.
 */
const CELDA_PANAL = 9.5;
/** Cuántos anillos tiene el panal: 2 da diecinueve casillas. */
const RADIO_PANAL = 2;

/**
 * Separación entre casillas del disco, y cuánto mide cada una.
 *
 * La grilla es de cinco por cinco **sin las cuatro esquinas**, que quedan fuera del
 * círculo: eso es lo que le da al conjunto la silueta redondeada en vez de la de un
 * tablero recortado.
 */
const PASO_DISCO = 16;
const CELDA_DISCO = PASO_DISCO * 0.84;
const RADIO_DISCO = 2;

/** A qué clase de cosa pertenece el sello. */
export type Familia = 'corporacion' | 'piloto';

/** Qué se dibuja en una celda encendida. */
export type Glifo = 'lleno' | 'hueco' | 'nucleo';

/** Qué lleva la celda del medio, que nunca está apagada. */
export type Corazon = 'hexagono' | 'anillo' | 'rombo' | 'triangulo' | 'disco' | 'cruz' | 'barra';

/** Con qué figura se dibuja cada casilla y el marco. */
export type Forma = 'hexagono' | 'cuadrado';
export type Marco = 'hexagono' | 'disco';

/** Una celda ya ubicada en el lienzo. */
export interface CeldaSello {
	readonly cx: number;
	readonly cy: number;
	readonly glyph: Glifo;
}

/** El plano completo de un emblema. */
export interface Sello {
	/** El nombre del que salió, para depurar y para el texto alternativo. */
	readonly seed: string;
	readonly family: Familia;
	/** El color de lo lleno. */
	readonly ink: string;
	/** El de los detalles que resaltan. */
	readonly bright: string;
	/** El de lo que va atrás. */
	readonly dim: string;
	/** El del marco. */
	readonly edge: string;
	/** Qué figura tiene el contorno, y qué figura tiene cada casilla. */
	readonly ring: Marco;
	readonly cellShape: Forma;
	/** Cuánto mide una casilla: radio del hexágono o medio lado del cuadrado. */
	readonly cellSize: number;
	readonly cells: readonly CeldaSello[];
	readonly core: Corazon;
	/** Si lleva el anillo interior. */
	readonly innerRing: boolean;
	/** Si lleva los radios que van del centro al borde. */
	readonly spokes: boolean;
	/** Cuánto gira el marco, en grados. */
	readonly tilt: number;
}

/**
 * La bolsa de la que sale cada celda.
 *
 * Es una lista y no un `if` con umbrales porque **la densidad es una decisión de
 * diseño y se mira de un vistazo**: tres de ocho apagadas, dos huecas, dos llenas y
 * una con núcleo. Un emblema demasiado lleno es una mancha y uno demasiado vacío no
 * se distingue del de al lado; el reparto se ajusta moviendo entradas acá.
 */
const BOLSA: readonly (Glifo | 'vacio')[] = [
	'vacio',
	'vacio',
	'vacio',
	'hueco',
	'hueco',
	'lleno',
	'lleno',
	'nucleo'
];

/** Los corazones de cada familia. No comparten ninguno, y es a propósito. */
const CORAZONES: Readonly<Record<Familia, readonly Corazon[]>> = {
	corporacion: ['hexagono', 'anillo', 'rombo', 'triangulo'],
	piloto: ['disco', 'cruz', 'barra', 'rombo']
};

/** Una posición del lienzo con su reflejo ya calculado. */
interface Casilla {
	readonly cx: number;
	readonly cy: number;
	/** Dónde cae su reflejo, o `null` si es su propio reflejo. */
	readonly espejo: { cx: number; cy: number } | null;
}

/**
 * Las casillas del panal: coordenadas cúbicas, como el mapa de la galaxia.
 *
 * El reflejo en cúbicas no es negar la `x`: hay que rearmar las otras dos para que
 * la suma siga dando cero y el centro caiga en el mismo alto. Sale de igualar las
 * dos posiciones en píxeles —`z' + x'/2 = z + x/2` con `x' = -x`— y despejar.
 */
function panal(): readonly Casilla[] {
	const ubicar = (hex: Hex) => {
		const punto = hexToPixel(hex, CELDA_PANAL);
		return { cx: CENTRO + punto.x, cy: CENTRO + punto.y };
	};

	const salida: Casilla[] = [];
	for (let x = 0; x <= RADIO_PANAL; x++) {
		const desde = Math.max(-RADIO_PANAL, -x - RADIO_PANAL);
		const hasta = Math.min(RADIO_PANAL, -x + RADIO_PANAL);
		for (let z = desde; z <= hasta; z++) {
			if (x === 0 && z === 0) continue;
			const hex = { x, y: -x - z, z };
			salida.push({
				...ubicar(hex),
				espejo: x === 0 ? null : ubicar({ x: -x, y: -z, z: z + x })
			});
		}
	}
	return salida;
}

/**
 * Las casillas del disco: una grilla de cinco por cinco sin las esquinas.
 *
 * Las cuatro esquinas quedan afuera porque se salen del círculo, y eso es
 * justamente lo que le da la silueta redonda. El reflejo acá sí es negar la
 * columna, que es la ventaja de una grilla cuadrada.
 */
function disco(): readonly Casilla[] {
	const salida: Casilla[] = [];
	for (let col = 0; col <= RADIO_DISCO; col++) {
		for (let fila = -RADIO_DISCO; fila <= RADIO_DISCO; fila++) {
			if (Math.abs(col) === RADIO_DISCO && Math.abs(fila) === RADIO_DISCO) continue;
			if (col === 0 && fila === 0) continue;
			salida.push({
				cx: CENTRO + col * PASO_DISCO,
				cy: CENTRO + fila * PASO_DISCO,
				espejo: col === 0 ? null : { cx: CENTRO - col * PASO_DISCO, cy: CENTRO + fila * PASO_DISCO }
			});
		}
	}
	return salida;
}

/**
 * El sello de ese nombre, en la familia que corresponda.
 *
 * **Nada de esto es aleatorio de verdad**: el dado sale del nombre, así que lo que
 * parece azar es una función. Cambiarle una letra al nombre cambia el emblema
 * entero, que es justo lo que hace que dos corporaciones no se confundan.
 *
 * La familia entra en la semilla, así que **una corporación y un piloto que se
 * llamen igual tampoco comparten dibujo**: son dos cosas distintas y se ven
 * distintas.
 */
export function sealFor(name: string, family: Familia = 'corporacion'): Sello {
	const semilla = `${family} ${name || 'sin nombre'}`;
	const dado = dadoDe(semilla);
	const esPiloto = family === 'piloto';

	// El tono primero, para que agregar variantes más abajo no le cambie el color a
	// lo que ya existe. El orden en que se tira **es** parte del formato.
	const tono = Math.floor(dado() * 360);
	// **El segundo tono es lo que separa a las dos familias en color.** Una
	// corporación es de dos colores —el marco lejos del relleno, como una bandera—
	// y un piloto es de uno solo, apenas corrido, como una chapa grabada.
	const tonoMarco = esPiloto
		? (tono + 350 + Math.floor(dado() * 20)) % 360
		: (tono + 140 + Math.floor(dado() * 80)) % 360;

	const corazones = CORAZONES[family];
	const core = corazones[Math.floor(dado() * corazones.length)];
	const innerRing = dado() < 0.65;
	const spokes = dado() < (esPiloto ? 0.35 : 0.45);
	// El disco gira en pasos de quince grados y el panal sólo tiene dos posiciones
	// útiles: un hexágono girado treinta ya es el mismo hexágono.
	const tilt = esPiloto ? Math.floor(dado() * 4) * 15 : dado() < 0.5 ? 0 : 30;

	// La mitad derecha decide, la izquierda la copia. Las de la columna del medio
	// son su propio reflejo, así que se plantan una sola vez.
	const cells: CeldaSello[] = [];
	for (const casilla of esPiloto ? disco() : panal()) {
		const elegido = BOLSA[Math.floor(dado() * BOLSA.length)];
		if (elegido === 'vacio') continue;

		cells.push({ cx: casilla.cx, cy: casilla.cy, glyph: elegido });
		if (casilla.espejo) cells.push({ ...casilla.espejo, glyph: elegido });
	}

	// El piloto va un punto menos saturado: son chapas, no banderas, y en una lista
	// de cien nombres un color más calmo se lee mejor que cien colores peleando.
	const sat = esPiloto ? SATURACION - 14 : SATURACION;

	return {
		seed: name,
		family,
		ink: hslToHex(tono, sat, BRILLO),
		bright: hslToHex(tono, Math.min(100, sat + 8), Math.min(100, BRILLO + 16)),
		dim: hslToHex(tono, Math.max(0, sat - 12), Math.max(0, BRILLO - 26)),
		edge: hslToHex(tonoMarco, Math.max(0, sat - 16), Math.max(0, BRILLO - 14)),
		ring: esPiloto ? 'disco' : 'hexagono',
		cellShape: esPiloto ? 'cuadrado' : 'hexagono',
		cellSize: esPiloto ? CELDA_DISCO / 2 : CELDA_PANAL,
		cells,
		core,
		innerRing,
		spokes,
		tilt
	};
}

/** El centro del lienzo, que el dibujo necesita para el marco y el corazón. */
export const MEDIO = CENTRO;

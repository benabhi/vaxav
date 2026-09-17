/**
 * La galaxia como grilla de hexágonos: dónde cae cada sistema y cómo se dibuja.
 *
 * **El mapa no se genera cada vez que alguien lo abre.** Un acomodado por fuerzas
 * en el navegador da un dibujo distinto en cada sesión, y eso rompe lo único que
 * un mapa compartido tiene que dar: un lenguaje común. Nadie puede decir «estoy
 * al norte de Ánfora» si mañana Ánfora está en otro lado. Así que la posición
 * **se guarda** —en `system.x/y/z`, que hasta hoy eran tres números que nadie
 * leía— y se calcula una sola vez: al conectar las puertas.
 *
 * Se eligió hexágono y no cuadrícula porque un sistema necesita más de cuatro
 * salidas y las diagonales de una cuadrícula son más largas que sus lados, así
 * que «un salto» mediría distinto según la dirección. En un hexágono los seis
 * vecinos están a la misma distancia, que es lo que un rumbo promete.
 *
 * Corresponde a docs/systems/UNIVERSE.md.
 */

import { GATE_BEARINGS, type GateBearing } from './universe';

/**
 * Dónde está un sistema en la grilla, en coordenadas cúbicas.
 *
 * Tres enteros que **suman cero**: es la forma clásica de direccionar hexágonos y
 * la que hace que moverse, medir distancias y buscar vecinos sean sumas y restas
 * en vez de casos especiales por fila par o impar.
 *
 * Que sean tres y no dos es lo que justifica reusar `x`, `y` y `z` tal como están
 * en la base. La tercera no sobra: es la que sostiene la invariante.
 */
export interface Hex {
	readonly x: number;
	readonly y: number;
	readonly z: number;
}

/** El centro de la galaxia, donde cae el primer sistema que se siembra. */
export const ORIGIN: Hex = { x: 0, y: 0, z: 0 };

/**
 * Hacia dónde mueve cada rumbo, en coordenadas cúbicas.
 *
 * Hexágono de **tapa plana**: los vecinos están arriba, abajo y en las cuatro
 * diagonales. Por eso la roseta tiene norte y sur pero no este ni oeste —a los
 * costados de un hexágono de tapa plana no hay ninguna casilla, hay un vértice—.
 *
 * Cada vector suma cero, como manda la invariante, y el de un rumbo es el opuesto
 * exacto del rumbo de enfrente. Un test lo verifica en vez de confiar en que la
 * tabla se escribió bien.
 */
export const BEARING_VECTORS: Readonly<Record<GateBearing, Hex>> = {
	n: { x: 0, y: 1, z: -1 },
	ne: { x: 1, y: 0, z: -1 },
	se: { x: 1, y: -1, z: 0 },
	s: { x: 0, y: -1, z: 1 },
	sw: { x: -1, y: 0, z: 1 },
	nw: { x: -1, y: 1, z: 0 }
};

/** La casilla vecina en ese rumbo. */
export function neighbourOf(hex: Hex, bearing: GateBearing): Hex {
	const paso = BEARING_VECTORS[bearing];
	return { x: hex.x + paso.x, y: hex.y + paso.y, z: hex.z + paso.z };
}

/** Si dos casillas son la misma. */
export function sameHex(a: Hex, b: Hex): boolean {
	return a.x === b.x && a.y === b.y && a.z === b.z;
}

/**
 * Cuántos saltos de grilla hay entre dos casillas.
 *
 * No es la distancia de salto —ésa la guarda cada puerta y depende del tendido—
 * sino **cuán lejos se ven en el mapa**. Sirve para encuadrar el dibujo y para
 * ordenar «los sistemas más cercanos» sin recorrer el grafo.
 */
export function hexDistance(a: Hex, b: Hex): number {
	return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.z - b.z));
}

/** En qué rumbo está `b` respecto de `a`, o `null` si no son vecinas. */
export function bearingBetween(a: Hex, b: Hex): GateBearing | null {
	for (const bearing of GATE_BEARINGS) {
		if (sameHex(neighbourOf(a, bearing), b)) return bearing;
	}
	return null;
}

/**
 * Si la casilla respeta la invariante de las coordenadas cúbicas.
 *
 * Se valida al escribir y no sólo al leer: una coordenada que no suma cero no es
 * una posición rara, es una que **no existe** en la grilla, y dejarla entrar
 * convierte todo lo de arriba en cuentas sobre un dato imposible.
 */
export function isValidHex(hex: Hex): boolean {
	return (
		Number.isInteger(hex.x) &&
		Number.isInteger(hex.y) &&
		Number.isInteger(hex.z) &&
		hex.x + hex.y + hex.z === 0
	);
}

/** Un punto del lienzo, en píxeles. */
export interface Point {
	readonly x: number;
	readonly y: number;
}

/** Cuánto se separan dos centros vecinos, como múltiplo del radio. */
const ALTO = Math.sqrt(3);

/**
 * Dónde cae el centro de una casilla en el lienzo, con el norte hacia arriba.
 *
 * `size` es el radio del hexágono —del centro a un vértice—, así que dos vecinos
 * en diagonal quedan a `1,5 · size` de distancia horizontal.
 *
 * **La `y` no se invierte**, aunque en un lienzo crezca hacia abajo: la `z` de la
 * grilla ya decrece hacia el norte, así que las dos vueltas se cancelan. Darla
 * vuelta «para corregir» deja el mapa espejado con el norte al pie, que es el
 * error que nadie nota hasta que hay cincuenta sistemas puestos.
 */
export function hexToPixel(hex: Hex, size: number): Point {
	return {
		x: size * 1.5 * hex.x,
		y: size * ALTO * (hex.z + hex.x / 2)
	};
}

/**
 * Qué vecina separa cada lado del hexágono.
 *
 * `hexCorners` arranca a la derecha y gira como el reloj, y el lado `i` va del
 * vértice `i-1` al `i`. Con eso, el lado 0 —del vértice de arriba a la derecha al
 * de la derecha— es el que da al noreste, y de ahí siguen en orden.
 *
 * **Vive acá y con un test.** Es una tabla de seis entradas que no se puede
 * verificar mirando: con el orden mal, un mapa de territorios dibuja los bordes
 * de adentro en vez de los de la frontera y sigue pareciendo un mapa, sólo que
 * uno que miente. Ya pasó.
 */
export const SIDE_BEARINGS: readonly GateBearing[] = ['ne', 'se', 's', 'sw', 'nw', 'n'];

/**
 * Los seis vértices de una casilla, para dibujarla.
 *
 * Arranca a la derecha y gira como el reloj. Tapa plana quiere decir que el
 * primer vértice está en el ángulo cero, sin el medio paso que lleva la de tapa
 * puntiaguda.
 */
export function hexCorners(center: Point, size: number): readonly Point[] {
	return Array.from({ length: 6 }, (_, i) => {
		const angulo = (Math.PI / 180) * (60 * i);
		return { x: center.x + size * Math.cos(angulo), y: center.y + size * Math.sin(angulo) };
	});
}

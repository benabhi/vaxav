/**
 * La grilla de hexágonos sobre la que se dibuja la galaxia.
 *
 * Lo que estos tests cuidan es una invariante, no una cuenta: una coordenada que
 * no suma cero no es una posición rara, es una que **no existe** en la grilla. Si
 * entra una, todo lo que se apoya arriba —vecinos, distancias, el dibujo— pasa a
 * operar sobre un dato imposible y falla lejos de donde se rompió.
 */

import { describe, expect, it } from 'vitest';
import {
	BEARING_VECTORS,
	ORIGIN,
	bearingBetween,
	hexCorners,
	hexDistance,
	hexToPixel,
	isValidHex,
	neighbourOf,
	sameHex
} from './galaxy';
import { GATE_BEARINGS, oppositeBearing } from './universe';

describe('las coordenadas de la grilla', () => {
	it('el origen es una casilla válida', () => {
		expect(isValidHex(ORIGIN)).toBe(true);
	});

	it('rechaza lo que no suma cero', () => {
		expect(isValidHex({ x: 1, y: 1, z: 1 })).toBe(false);
		expect(isValidHex({ x: 0.5, y: -0.5, z: 0 })).toBe(false);
	});

	it('hay un vector por rumbo, y todos son casillas válidas', () => {
		// Que la tabla se escribió bien no se confía: se verifica. Un signo cambiado
		// manda un sistema a la casilla de al lado y el mapa queda torcido sin que
		// nada falle.
		expect(Object.keys(BEARING_VECTORS)).toHaveLength(GATE_BEARINGS.length);
		for (const bearing of GATE_BEARINGS) expect(isValidHex(BEARING_VECTORS[bearing])).toBe(true);
	});

	it('moverse al rumbo de enfrente vuelve al mismo lugar', () => {
		// Es la propiedad que hace que una puerta y su gemela sean coherentes: si de
		// Ánfora se sale al norte, desde el otro lado se vuelve por el sur y se cae
		// exactamente en Ánfora.
		for (const bearing of GATE_BEARINGS) {
			const ida = neighbourOf(ORIGIN, bearing);
			const vuelta = neighbourOf(ida, oppositeBearing(bearing));
			expect(sameHex(vuelta, ORIGIN)).toBe(true);
		}
	});

	it('los seis vecinos están todos a un salto', () => {
		// Es la razón de ser del hexágono: en una cuadrícula con diagonales, cuatro de
		// los ocho vecinos quedan más lejos que los otros cuatro y un salto mide
		// distinto según hacia dónde.
		for (const bearing of GATE_BEARINGS) {
			expect(hexDistance(ORIGIN, neighbourOf(ORIGIN, bearing))).toBe(1);
		}
	});

	it('los seis vecinos son seis casillas distintas', () => {
		const vecinos = GATE_BEARINGS.map((bearing) => neighbourOf(ORIGIN, bearing));
		const claves = new Set(vecinos.map((hex) => `${hex.x},${hex.y},${hex.z}`));

		expect(claves.size).toBe(GATE_BEARINGS.length);
	});

	it('dice en qué rumbo está una vecina, y nada si no lo es', () => {
		for (const bearing of GATE_BEARINGS) {
			expect(bearingBetween(ORIGIN, neighbourOf(ORIGIN, bearing))).toBe(bearing);
		}
		// Dos casillas a dos saltos no tienen rumbo entre ellas: la puerta que las
		// una va a ser un atajo, y el mapa tiene que poder decirlo.
		expect(bearingBetween(ORIGIN, { x: 0, y: 2, z: -2 })).toBeNull();
		expect(bearingBetween(ORIGIN, ORIGIN)).toBeNull();
	});

	it('la distancia crece con los saltos', () => {
		expect(hexDistance(ORIGIN, ORIGIN)).toBe(0);
		expect(hexDistance(ORIGIN, { x: 3, y: -3, z: 0 })).toBe(3);
	});
});

describe('el dibujo', () => {
	it('el norte queda arriba', () => {
		// En un lienzo la `y` crece hacia abajo, y la `z` de la grilla ya decrece
		// hacia el norte: las dos vueltas se cancelan. Darla vuelta «para corregir»
		// deja el mapa espejado con el norte al pie, que es el error que nadie nota
		// hasta que hay cincuenta sistemas puestos. Este test es el que lo nota.
		const norte = hexToPixel(neighbourOf(ORIGIN, 'n'), 10);
		const sur = hexToPixel(neighbourOf(ORIGIN, 's'), 10);

		expect(norte.y).toBeLessThan(0);
		expect(sur.y).toBeGreaterThan(0);
		expect(norte.x).toBeCloseTo(0);
	});

	it('el noreste va a la derecha y arriba', () => {
		const ne = hexToPixel(neighbourOf(ORIGIN, 'ne'), 10);

		expect(ne.x).toBeGreaterThan(0);
		expect(ne.y).toBeLessThan(0);
	});

	it('el origen cae en el cero del lienzo', () => {
		expect(hexToPixel(ORIGIN, 10)).toEqual({ x: 0, y: 0 });
	});

	it('los seis vecinos quedan todos a la misma distancia en píxeles', () => {
		// La promesa del hexágono, ahora en el dibujo: si acá fallara, la grilla
		// sería correcta y el mapa igual mentiría.
		const distancias = GATE_BEARINGS.map((bearing) => {
			const punto = hexToPixel(neighbourOf(ORIGIN, bearing), 10);
			return Math.hypot(punto.x, punto.y);
		});

		for (const distancia of distancias) expect(distancia).toBeCloseTo(distancias[0], 6);
	});

	it('una casilla tiene seis vértices a un radio del centro', () => {
		const vertices = hexCorners({ x: 0, y: 0 }, 10);

		expect(vertices).toHaveLength(6);
		for (const vertice of vertices) expect(Math.hypot(vertice.x, vertice.y)).toBeCloseTo(10);
	});
});

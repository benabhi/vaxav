/** El sello: siempre el mismo, siempre simétrico, siempre distinto del de al lado. */

import { describe, expect, it } from 'vitest';
import { CORPORATIONS } from './game/universe';
import { LIENZO, sealFor } from './identicon';

/** Cómo se compara una posición sin pelear con los decimales del coseno. */
const redondo = (valor: number) => Math.round(valor * 100) / 100;

/** La firma de un sello, para comparar dos sin mirarlos. */
function firma(name: string): string {
	const sello = sealFor(name);
	const celdas = sello.cells
		.map((celda) => `${redondo(celda.cx)}:${redondo(celda.cy)}:${celda.glyph}`)
		.sort()
		.join('|');
	return [
		sello.ink,
		sello.edge,
		sello.core,
		sello.innerRing,
		sello.spokes,
		sello.tilt,
		celdas
	].join('/');
}

describe('el sello', () => {
	/*
	 * Es la propiedad que lo vuelve utilizable: si no fuera estable habría que
	 * guardarlo en una tabla, y entonces sería una imagen más que mantener.
	 */
	it('sale igual todas las veces', () => {
		expect(sealFor('Casa Verlan')).toEqual(sealFor('Casa Verlan'));
		expect(firma('Casa Verlan')).toBe(firma('Casa Verlan'));
	});

	it('es simétrico sobre el eje vertical', () => {
		for (const nombre of ['Casa Verlan', 'Comuna Talo', 'Hidros Escarcha', 'Zeta']) {
			const celdas = sealFor(nombre).cells;
			expect(celdas.length).toBeGreaterThan(0);

			for (const celda of celdas) {
				const reflejo = celdas.find(
					(otra) =>
						redondo(otra.cx) === redondo(LIENZO - celda.cx) &&
						redondo(otra.cy) === redondo(celda.cy) &&
						otra.glyph === celda.glyph
				);
				expect(
					reflejo,
					`${nombre}: la celda en ${redondo(celda.cx)} no tiene reflejo`
				).toBeTruthy();
			}
		}
	});

	it('no se sale del lienzo', () => {
		for (const nombre of ['Casa Verlan', 'Extractora Anillo', 'Libre Amarre']) {
			for (const celda of sealFor(nombre).cells) {
				expect(celda.cx).toBeGreaterThan(0);
				expect(celda.cx).toBeLessThan(LIENZO);
				expect(celda.cy).toBeGreaterThan(0);
				expect(celda.cy).toBeLessThan(LIENZO);
			}
		}
	});

	/*
	 * Un identicón que repite dibujo es un identicón que miente: el emblema es lo
	 * que hace reconocible a una corporación de un vistazo, y dos iguales rompen
	 * justo eso. No hay garantía matemática de que no colisione nunca —sale de un
	 * hash— pero sí de que ninguna de las que existen choque con otra.
	 */
	it('no repite dibujo entre las corporaciones que existen', () => {
		const firmas = CORPORATIONS.map((una) => firma(una.name));
		expect(new Set(firmas).size).toBe(CORPORATIONS.length);
	});

	/*
	 * **«Imposible» no existe y conviene decirlo.** El sello sale de un hash, así que
	 * dos nombres distintos *pueden* caer en el mismo dibujo; lo que se puede
	 * garantizar es otra cosa, y es la que importa:
	 *
	 * - el generador **no** es el cuello de botella: sfc32 arranca de 128 bits, así
	 *   que no hay dos nombres que compartan secuencia por la semilla;
	 * - el dibujo tiene del orden de **4 · 10¹²** variantes —once celdas por cuatro
	 *   estados, cuatro corazones, tres interruptores, trescientos sesenta tonos y
	 *   ochenta desplazamientos de marco—, y por el cumpleaños eso pone el primer
	 *   choque probable **cerca de los dos millones de nombres**;
	 * - y sobre veinte mil nombres medidos acá no hay ninguno.
	 *
	 * Si algún día el juego pasa esa escala, lo que hay que agrandar es el dibujo
	 * —un anillo más de celdas multiplica el espacio por un millón—, no el hash.
	 */
	it('no repite dibujo sobre veinte mil nombres', () => {
		const nombres = Array.from({ length: 20000 }, (_, i) => `Corporación ${i.toString(36)}`);
		const firmas = new Set(nombres.map(firma));
		expect(firmas.size).toBe(nombres.length);
	});

	it('tampoco entre distintivos de piloto, que es el otro uso', () => {
		const nombres = Array.from({ length: 5000 }, (_, i) => `Piloto${i}`);
		expect(new Set(nombres.map(firma)).size).toBe(nombres.length);
	});

	/*
	 * El seguro contra un refactor distraído: cualquier cambio en el generador, en
	 * el orden de las tiradas o en las medidas del dibujo mueve estos números, y
	 * entonces **todos los sellos del juego cambian de cara a la vez**. Que falle un
	 * test obliga a que eso sea una decisión y no un accidente.
	 */
	it('el dibujo de un nombre conocido no se mueve entre versiones', () => {
		const sello = sealFor('Casa Verlan');
		expect({
			ink: sello.ink,
			edge: sello.edge,
			core: sello.core,
			innerRing: sello.innerRing,
			spokes: sello.spokes,
			tilt: sello.tilt,
			celdas: sello.cells.length
		}).toMatchInlineSnapshot(`
			{
			  "celdas": 14,
			  "core": "hexagono",
			  "edge": "#3bba5d",
			  "ink": "#ad5ce0",
			  "innerRing": true,
			  "spokes": true,
			  "tilt": 0,
			}
		`);
	});

	/*
	 * Cambiar una letra tiene que cambiar el emblema entero y no un detalle: es lo
	 * que evita que «Casa Verlan» y «Casa Verlán» se confundan en una lista.
	 */
	it('una letra de diferencia da otro emblema', () => {
		expect(firma('Casa Verlan')).not.toBe(firma('Casa Verlán'));
		expect(firma('Talo')).not.toBe(firma('Tolo'));
	});

	/*
	 * Una corporación y un piloto no se pueden confundir ni de reojo: cambian la
	 * silueta, la casilla y el color, que son las tres cosas que se leen antes que
	 * el nombre. Y el mismo nombre en las dos familias da dos dibujos distintos,
	 * porque la familia entra en la semilla.
	 */
	it('las dos familias se ven distintas', () => {
		const corp = sealFor('Comuna Talo', 'corporacion');
		const piloto = sealFor('Comuna Talo', 'piloto');

		expect(corp.ring).toBe('hexagono');
		expect(corp.cellShape).toBe('hexagono');
		expect(piloto.ring).toBe('disco');
		expect(piloto.cellShape).toBe('cuadrado');
		expect(firma('Comuna Talo')).not.toBe(
			[
				piloto.ink,
				piloto.edge,
				piloto.core,
				piloto.innerRing,
				piloto.spokes,
				piloto.tilt,
				piloto.cells.length
			].join('/')
		);
	});

	it('el disco del piloto también es simétrico y entra en el lienzo', () => {
		for (const nombre of ['benabhi', 'Halcon_7', 'Zeta']) {
			const celdas = sealFor(nombre, 'piloto').cells;
			expect(celdas.length).toBeGreaterThan(0);

			for (const celda of celdas) {
				expect(celda.cx).toBeGreaterThan(0);
				expect(celda.cx).toBeLessThan(LIENZO);
				expect(celda.cy).toBeGreaterThan(0);
				expect(celda.cy).toBeLessThan(LIENZO);
				expect(
					celdas.some(
						(otra) =>
							redondo(otra.cx) === redondo(LIENZO - celda.cx) &&
							redondo(otra.cy) === redondo(celda.cy) &&
							otra.glyph === celda.glyph
					)
				).toBe(true);
			}
		}
	});

	it('un nombre vacío no revienta: da el sello de «sin nombre»', () => {
		expect(() => sealFor('')).not.toThrow();
		expect(firma('')).toBe(firma('sin nombre'));
	});
});

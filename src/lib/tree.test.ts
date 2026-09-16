/** Las guías de un árbol plano: qué verticales atraviesan cada fila. */

import { describe, expect, it } from 'vitest';
import { railsFor } from './tree';

/**
 * El árbol de Ánfora, recortado a lo que importa.
 *
 * ```
 * Ánfora            0
 *   Ánfora I        1
 *   Ánfora II       1
 *     Puerto        2
 *   Ánfora III      1   (último)
 *     Anillos       2   (último)
 * ```
 */
const ANFORA = [
	{ depth: 0, isLast: true },
	{ depth: 1, isLast: false },
	{ depth: 1, isLast: false },
	{ depth: 2, isLast: true },
	{ depth: 1, isLast: true },
	{ depth: 2, isLast: true }
];

describe('las guías', () => {
	it('la raíz no tiene ninguna, y sus hijos tampoco', () => {
		const guias = railsFor(ANFORA);
		expect(guias[0]).toEqual([]);
		expect(guias[1]).toEqual([]);
		expect(guias[2]).toEqual([]);
	});

	/*
	 * Es el corte que se vio en pantalla: la vertical de la estrella tiene que
	 * atravesar la fila de Puerto Ánfora, porque abajo todavía queda Ánfora III.
	 * Sin ella, Ánfora II y Ánfora III quedan desconectados.
	 */
	it('la de un ancestro atraviesa a los nietos mientras le queden hijos', () => {
		expect(railsFor(ANFORA)[3]).toEqual([true]);
	});

	/*
	 * Y se corta cuando ya no queda nada: debajo de los Anillos no hay más hijos
	 * de la estrella, así que su columna no tiene por qué seguir bajando.
	 */
	it('se corta cuando el ancestro ya no tiene más hijos', () => {
		expect(railsFor(ANFORA)[5]).toEqual([false]);
	});

	it('hay una guía por columna de ancestro, sin contar la del padre directo', () => {
		const guias = railsFor(ANFORA);
		for (const [indice, nodo] of ANFORA.entries()) {
			expect(guias[indice], `fila ${indice}`).toHaveLength(Math.max(0, nodo.depth - 1));
		}
	});

	it('un árbol vacío no tiene guías', () => {
		expect(railsFor([])).toEqual([]);
	});

	/*
	 * Un sistema binario tiene dos estrellas en la raíz. Cada una cuelga lo suyo y
	 * **entre ellas no hay vertical**: las raíces no se conectan entre sí, así que
	 * lo único que importa es que la guía de cada estrella baje mientras le queden
	 * hijos propios por dibujar.
	 */
	it('aguanta más de una raíz', () => {
		const binario = [
			{ depth: 0, isLast: false }, // Estrella A
			{ depth: 1, isLast: false }, //   A I
			{ depth: 2, isLast: true }, //     A I-a
			{ depth: 1, isLast: true }, //   A II
			{ depth: 0, isLast: true } // Estrella B
		];

		const guias = railsFor(binario);
		// Bajo la luna todavía queda A II colgando de la estrella: la guía sigue.
		expect(guias[2]).toEqual([true]);
		// Las dos raíces no llevan ninguna: nada las une.
		expect(guias[0]).toEqual([]);
		expect(guias[4]).toEqual([]);
	});

	/*
	 * Y se corta cuando al ancestro ya no le queda nada debajo, aunque el árbol
	 * siga con otra rama: la vertical es de esa rama, no del listado.
	 */
	it('no la deja bajar de más cuando la rama se cerró', () => {
		const cerrada = [
			{ depth: 0, isLast: false },
			{ depth: 1, isLast: true },
			{ depth: 2, isLast: true },
			{ depth: 0, isLast: true }
		];

		expect(railsFor(cerrada)[2]).toEqual([false]);
	});
});

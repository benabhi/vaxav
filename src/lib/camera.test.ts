/**
 * La cámara del lienzo.
 *
 * Lo que cuidan estos tests es una sensación, no un número: un acercamiento que
 * no respeta el punto del cursor se siente resbaladizo y nadie sabe decir por
 * qué. Acá se prueba sin abrir un navegador, que es el único modo de que no se
 * rompa sin que nos enteremos.
 */

import { describe, expect, it } from 'vitest';
import { MAX_SCALE, MIN_SCALE, clampScale, fit, pan, toScreen, toWorld, zoomAt } from './camera';

const VIEWPORT = { x: 800, y: 600 };

describe('los dos planos', () => {
	it('el centro de la cámara cae en el medio de la pantalla', () => {
		const camara = { center: { x: 120, y: -40 }, scale: 2 };

		expect(toScreen(camara.center, camara, VIEWPORT)).toEqual({ x: 400, y: 300 });
	});

	it('ir y volver deja el mismo punto', () => {
		const camara = { center: { x: 12, y: -7 }, scale: 1.7 };
		const punto = { x: 93, y: 41 };

		const vuelta = toWorld(toScreen(punto, camara, VIEWPORT), camara, VIEWPORT);

		expect(vuelta.x).toBeCloseTo(punto.x);
		expect(vuelta.y).toBeCloseTo(punto.y);
	});
});

describe('acercarse', () => {
	it('deja quieto el punto que está bajo el cursor', () => {
		// **La propiedad que hace que el mapa se sienta sólido.** Sin esto, acercarse
		// tira todo hacia el centro y hay que volver a buscar lo que uno miraba.
		const camara = { center: { x: 0, y: 0 }, scale: 1 };
		const cursor = { x: 640, y: 180 };
		const antes = toWorld(cursor, camara, VIEWPORT);

		const acercada = zoomAt(camara, cursor, 1.8, VIEWPORT);
		const despues = toWorld(cursor, acercada, VIEWPORT);

		expect(despues.x).toBeCloseTo(antes.x);
		expect(despues.y).toBeCloseTo(antes.y);
		expect(acercada.scale).toBeGreaterThan(camara.scale);
	});

	it('no pasa de los topes, y en el tope no se mueve', () => {
		const alTope = zoomAt(
			{ center: { x: 5, y: 5 }, scale: MAX_SCALE },
			{ x: 10, y: 10 },
			2,
			VIEWPORT
		);

		expect(alTope.scale).toBe(MAX_SCALE);
		// Y no corre el centro al pedo: una cámara que no cambió de escala tiene que
		// quedar igual, o el mapa se desliza solo al llegar al tope.
		expect(alTope.center).toEqual({ x: 5, y: 5 });

		expect(clampScale(0.001)).toBe(MIN_SCALE);
		expect(clampScale(999)).toBe(MAX_SCALE);
	});
});

describe('arrastrar', () => {
	it('mueve el plano tanto como el mouse, sin importar el acercamiento', () => {
		// Arrastrar cien píxeles tiene que correr el contenido cien píxeles, esté
		// donde esté el zoom. Si no, el mapa se escapa de la mano.
		for (const scale of [0.5, 1, 3]) {
			const camara = { center: { x: 0, y: 0 }, scale };
			const punto = { x: 0, y: 0 };

			const antes = toScreen(punto, camara, VIEWPORT);
			const despues = toScreen(punto, pan(camara, 100, -40), VIEWPORT);

			expect(despues.x - antes.x).toBeCloseTo(100);
			expect(despues.y - antes.y).toBeCloseTo(-40);
		}
	});
});

describe('encuadrar', () => {
	it('centra en el medio de lo que hay', () => {
		const camara = fit(
			[
				{ x: -100, y: -50 },
				{ x: 100, y: 50 }
			],
			VIEWPORT
		);

		expect(camara.center).toEqual({ x: 0, y: 0 });
	});

	it('todo lo que hay entra en la pantalla', () => {
		const puntos = [
			{ x: -400, y: -300 },
			{ x: 250, y: 900 },
			{ x: 10, y: 4 }
		];
		const camara = fit(puntos, VIEWPORT);

		for (const punto of puntos) {
			const donde = toScreen(punto, camara, VIEWPORT);
			expect(donde.x).toBeGreaterThanOrEqual(0);
			expect(donde.x).toBeLessThanOrEqual(VIEWPORT.x);
			expect(donde.y).toBeGreaterThanOrEqual(0);
			expect(donde.y).toBeLessThanOrEqual(VIEWPORT.y);
		}
	});

	it('con un solo punto no se acerca al infinito', () => {
		// Una galaxia de un sistema es el primer día del constructor, y ahí el mapa
		// tiene que verse normal en vez de un punto gigante.
		const camara = fit([{ x: 42, y: -8 }], VIEWPORT);

		expect(camara.center).toEqual({ x: 42, y: -8 });
		expect(camara.scale).toBe(1);
	});

	it('encuadrar aleja, pero nunca acerca', () => {
		// Con dos sistemas pegados, la cuenta pura daría el acercamiento máximo y los
		// dibujaría del tamaño de un plato: entra todo y se pierde la escala a la que
		// las cosas se leen.
		const juntos = fit(
			[
				{ x: -5, y: -5 },
				{ x: 5, y: 5 }
			],
			VIEWPORT
		);
		expect(juntos.scale).toBe(1);

		const lejos = fit(
			[
				{ x: -4000, y: -3000 },
				{ x: 4000, y: 3000 }
			],
			VIEWPORT
		);
		expect(lejos.scale).toBeLessThan(1);
	});

	it('sin nada que mostrar no explota', () => {
		expect(fit([], VIEWPORT)).toEqual({ center: { x: 0, y: 0 }, scale: 1 });
	});
});

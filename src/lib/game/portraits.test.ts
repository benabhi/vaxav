/**
 * Las reglas del retrato, sin disco ni navegador.
 *
 * Lo que se prueba acá es lo que decide si una foto se ve bien o deformada —el
 * recorte— y lo que decide si un archivo entra o no —el guardián—. Las dos cosas
 * son puras a propósito: el recorte tiene que dar lo mismo en el navegador que lo
 * que el servidor espera, y el guardián corre en el borde.
 */

import { describe, expect, it } from 'vitest';
import {
	PORTRAIT_HEIGHT,
	PORTRAIT_MAX_BYTES,
	PORTRAIT_TYPE,
	PORTRAIT_WIDTH,
	coverBox,
	looksLikeWebp,
	portraitFileName,
	portraitProblem
} from './portraits';

/** Unos bytes que empiezan como un WebP de verdad: `RIFF` … `WEBP`. */
function webpBytes(largo = 64): Uint8Array {
	const bytes = new Uint8Array(largo);
	const firma = (texto: string, desde: number) => {
		for (let i = 0; i < texto.length; i++) bytes[desde + i] = texto.charCodeAt(i);
	};
	firma('RIFF', 0);
	firma('WEBP', 8);
	return bytes;
}

describe('el recorte que cubre el hueco', () => {
	it('una foto apaisada se recorta a los costados', () => {
		const recorte = coverBox(2000, 1000);

		// Se queda con todo el alto y descarta ancho: es lo que sobra.
		expect(recorte.height).toBe(1000);
		expect(recorte.width).toBeLessThan(2000);
		expect(recorte.y).toBe(0);
	});

	it('una foto más vertical que el hueco se recorta arriba y abajo', () => {
		const recorte = coverBox(1000, 3000);

		expect(recorte.width).toBe(1000);
		expect(recorte.height).toBeLessThan(3000);
		expect(recorte.x).toBe(0);
	});

	it('queda centrado, salvo el píxel impar', () => {
		// Centrar y no alinear arriba es lo correcto para una cara: lo que sobra de
		// una foto vertical es tanto el pelo como el mentón. Con un sobrante impar el
		// desplazamiento se trunca, así que puede quedar un píxel corrido: es eso o
		// que el recorte se salga de la imagen, y medio píxel no lo ve nadie.
		const ancha = coverBox(2000, 1000);
		expect(2000 - (ancha.x * 2 + ancha.width)).toBeLessThanOrEqual(1);

		const alta = coverBox(1000, 3000);
		expect(3000 - (alta.y * 2 + alta.height)).toBeLessThanOrEqual(1);
	});

	it('el recorte tiene la proporción del hueco', () => {
		const recorte = coverBox(1920, 1080);
		const objetivo = PORTRAIT_WIDTH / PORTRAIT_HEIGHT;

		expect(recorte.width / recorte.height).toBeCloseTo(objetivo, 2);
	});

	it('una foto que ya tiene la proporción no se recorta', () => {
		const recorte = coverBox(PORTRAIT_WIDTH, PORTRAIT_HEIGHT);

		expect(recorte).toEqual({ x: 0, y: 0, width: PORTRAIT_WIDTH, height: PORTRAIT_HEIGHT });
	});

	it('nunca se sale de la imagen', () => {
		for (const [ancho, alto] of [
			[100, 100],
			[4000, 10],
			[10, 4000],
			[481, 639]
		]) {
			const recorte = coverBox(ancho, alto);
			expect(recorte.x).toBeGreaterThanOrEqual(0);
			expect(recorte.y).toBeGreaterThanOrEqual(0);
			expect(recorte.x + recorte.width).toBeLessThanOrEqual(ancho);
			expect(recorte.y + recorte.height).toBeLessThanOrEqual(alto);
		}
	});

	it('una imagen vacía no rompe', () => {
		// Llega de un archivo corrupto, y devolver ceros es mejor que dividir por
		// cero en medio del dibujado.
		expect(coverBox(0, 0)).toEqual({ x: 0, y: 0, width: 0, height: 0 });
	});
});

describe('el nombre del archivo', () => {
	it('es el id del piloto, y nada más', () => {
		// La carpeta ya dice que son retratos; el nombre sólo tiene que ser la clave.
		// Y es lo que hace que subir uno nuevo reemplace al anterior sin dejar basura.
		expect(portraitFileName(7)).toBe('7.webp');
	});

	it('dos pilotos nunca comparten archivo', () => {
		expect(portraitFileName(7)).not.toBe(portraitFileName(70));
	});
});

describe('qué se deja guardar', () => {
	it('un WebP del tamaño esperado pasa', () => {
		expect(portraitProblem(webpBytes(), PORTRAIT_TYPE)).toBe('');
	});

	it('nada no pasa', () => {
		expect(portraitProblem(new Uint8Array(0), PORTRAIT_TYPE)).not.toBe('');
	});

	it('otro formato no pasa, aunque los bytes sean válidos', () => {
		expect(portraitProblem(webpBytes(), 'image/png')).toContain('WebP');
	});

	it('lo que pesa de más no pasa, y dice cuánto', () => {
		const problema = portraitProblem(webpBytes(PORTRAIT_MAX_BYTES + 1), PORTRAIT_TYPE);

		expect(problema).toContain('kB');
	});

	it('lo que dice ser WebP y no lo es, tampoco', () => {
		// El tipo lo escribe quien manda el pedido: mirar la firma es lo que descarta
		// lo que ni siquiera intenta parecer una imagen.
		const mentira = new Uint8Array(64);
		expect(portraitProblem(mentira, PORTRAIT_TYPE)).not.toBe('');
	});
});

describe('la firma de un WebP', () => {
	it('reconoce uno de verdad', () => {
		expect(looksLikeWebp(webpBytes())).toBe(true);
	});

	it('rechaza un archivo demasiado corto para tener firma', () => {
		expect(looksLikeWebp(new Uint8Array(4))).toBe(false);
	});

	it('rechaza algo que empieza igual pero no es', () => {
		const casi = webpBytes();
		casi[8] = 'A'.charCodeAt(0);
		expect(looksLikeWebp(casi)).toBe(false);
	});
});

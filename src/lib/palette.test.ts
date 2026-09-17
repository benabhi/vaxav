/**
 * El color automático de una categoría.
 *
 * Lo que cuidan estos tests es que **el mismo nombre dé siempre el mismo color** —o
 * el mapa de hoy no se puede comparar con el de ayer— y que nombres parecidos no
 * caigan en tonos parecidos, que en un mapa es lo mismo que no tener color.
 */

import { describe, expect, it } from 'vitest';
import { colorFor, hslToHex, hueOf, swatches } from './palette';

describe('el tono de un nombre', () => {
	it('es el mismo siempre', () => {
		expect(hueOf('Marca de Ávila')).toBe(hueOf('Marca de Ávila'));
		expect(colorFor('Bancos del Norte')).toBe(colorFor('Bancos del Norte'));
	});

	it('nombres parecidos caen lejos', () => {
		// **La razón de ser del ángulo áureo.** Sin él, dos nombres que empiezan igual
		// dan hashes vecinos y por lo tanto colores casi iguales, que es lo mismo que
		// no pintar. Se mide en el círculo, así que 350 y 10 están a 20 grados.
		const separacion = (a: string, b: string) => {
			const diferencia = Math.abs(hueOf(a) - hueOf(b));
			return Math.min(diferencia, 360 - diferencia);
		};

		expect(separacion('Pleamar', 'Pleamor')).toBeGreaterThan(25);
		expect(separacion('Vela Blanca', 'Vela Blanco')).toBeGreaterThan(25);
	});

	it('no tiene techo: cada nombre tiene el suyo', () => {
		// Antes eran siete colores de una paleta fija y la octava región repetía uno.
		const nombres = Array.from({ length: 40 }, (_, i) => `Región ${i}`);
		const tonos = new Set(nombres.map(hueOf));

		expect(tonos.size).toBeGreaterThan(30);
	});
});

describe('el color elegido', () => {
	it('gana sobre el automático', () => {
		expect(colorFor('Marca de Ávila', '#ff0000')).toBe('#ff0000');
	});

	it('vacío quiere decir «elegilo vos», no «sin color»', () => {
		const automatico = colorFor('Marca de Ávila', '');
		expect(automatico).toMatch(/^#[0-9a-f]{6}$/);
	});

	it('sin nombre ni elección, el gris de lo que no tiene dueño', () => {
		expect(colorFor('', '')).toBe('var(--color-text-muted)');
	});
});

describe('la conversión a hexadecimal', () => {
	it('da seis dígitos siempre', () => {
		for (let h = 0; h < 360; h += 17) {
			expect(hslToHex(h, 68, 62)).toMatch(/^#[0-9a-f]{6}$/);
		}
	});

	it('los extremos son blanco y negro', () => {
		expect(hslToHex(0, 0, 0)).toBe('#000000');
		expect(hslToHex(0, 0, 100)).toBe('#ffffff');
	});
});

describe('las muestras del selector', () => {
	it('son todas distintas', () => {
		const doce = swatches(12);
		expect(new Set(doce).size).toBe(12);
	});
});

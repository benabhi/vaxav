/**
 * Que la descripción derivada sea **técnica**, y que lo siga siendo.
 *
 * El riesgo de generar prosa es que se vuelva opinión: que un cinturón diga que
 * su mineral es común o que las patrullas llegan tarde. Eso no es describir un
 * lugar, es evaluarlo, y además envejece mal. Varios de estos tests no verifican
 * qué dice la frase sino **qué no dice**, que es lo que hay que cuidar.
 */

import { describe, expect, it } from 'vitest';
import { describeBody, describeSystem, SIN_CONTEXTO, type BodyContext } from './descriptions';
import { thermalBand, threatLevel } from './game/universe';

/** Ánfora: una enana amarilla con el borde en las 520 del cinturón exterior. */
const ANFORA: BodyContext = {
	...SIN_CONTEXTO,
	starClass: 'G',
	edgeDistance: 520
};

describe('la banda térmica', () => {
	it('deja a Ánfora como estaba escrita a mano', () => {
		expect(thermalBand('G', 40)).toBe('scorched');
		expect(thermalBand('G', 95)).toBe('temperate');
		expect(thermalBand('G', 210)).toBe('cold');
		expect(thermalBand('G', 380)).toBe('frozen');
	});

	it('mueve la zona templada con la clase de la estrella', () => {
		// La misma órbita: templada alrededor de una amarilla, hielo alrededor de
		// una enana roja y fuego alrededor de una gigante azul.
		expect(thermalBand('G', 95)).toBe('temperate');
		expect(thermalBand('M', 95)).toBe('frozen');
		expect(thermalBand('O', 95)).toBe('scorched');
	});

	it('no dice nada sin estrella o sin órbita', () => {
		expect(thermalBand('', 95)).toBe('');
		expect(thermalBand('G', 0)).toBe('');
	});
});

describe('describeBody', () => {
	const cuerpo = {
		kind: 'planet' as const,
		bodyClass: '' as const,
		atmosphere: '' as const,
		starClass: '' as const,
		explored: true
	};

	it('describe una estrella por su clase', () => {
		expect(describeBody({ ...cuerpo, kind: 'star', starClass: 'G' }, SIN_CONTEXTO)).toEqual([
			'Enana amarilla de clase G.'
		]);
	});

	it('junta composición, clima y atmósfera en un planeta', () => {
		const frases = describeBody(
			{ ...cuerpo, bodyClass: 'rocky', atmosphere: 'none' },
			{ ...ANFORA, starDistance: 40 }
		);
		expect(frases).toEqual(['Rocoso y abrasado.', 'Sin atmósfera.']);
	});

	it('no dice dos veces lo mismo con dos palabras distintas', () => {
		// Una luna helada en órbita fría no es «helada y fría».
		const frases = describeBody(
			{ ...cuerpo, kind: 'moon', bodyClass: 'ice', atmosphere: 'none' },
			{ ...ANFORA, starDistance: 216 }
		);
		expect(frases).toEqual(['Helada.', 'Sin atmósfera.']);
	});

	it('concuerda en femenino con las lunas', () => {
		const frases = describeBody(
			{ ...cuerpo, kind: 'moon', bodyClass: 'rocky' },
			{ ...ANFORA, starDistance: 40 }
		);
		expect(frases).toEqual(['Rocosa y abrasada.']);
	});

	it('describe un cinturón por lo poblado que está el campo', () => {
		const anillos = describeBody(
			{ ...cuerpo, kind: 'belt' },
			{ ...ANFORA, starDistance: 212, beltCapacity: 100_000 }
		);
		expect(anillos).toEqual(['Campo denso de asteroides.']);

		const exterior = describeBody(
			{ ...cuerpo, kind: 'belt' },
			{ ...ANFORA, starDistance: 520, beltCapacity: 11_400 }
		);
		expect(exterior).toEqual(['Campo disperso de asteroides.']);
	});

	it('no opina sobre lo que vale, ni sobre el peligro, ni sobre dónde está', () => {
		// Qué mineral tiene y cuánto paga lo contesta el escáner; dónde está, la
		// columna de distancia; qué tan riesgoso es, el aviso de riesgo. La
		// descripción dice qué **es** el lugar y se calla el resto.
		const frases = describeBody(
			{ ...cuerpo, kind: 'belt' },
			{ ...ANFORA, starDistance: 520, beltCapacity: 9_000 }
		);
		expect(frases).toHaveLength(1);
		expect(frases[0]).not.toMatch(/mineral|común|raro|patrulla|vigilancia|pirata|borde|interior/i);
	});

	it('calla en una estación y en una puerta', () => {
		expect(describeBody({ ...cuerpo, kind: 'station' }, ANFORA)).toEqual([]);
		expect(describeBody({ ...cuerpo, kind: 'gate' }, ANFORA)).toEqual([]);
	});

	it('no regala lo que hay en un cuerpo sin explorar', () => {
		const frases = describeBody(
			{ ...cuerpo, kind: 'belt', explored: false },
			{ ...ANFORA, starDistance: 520, beltCapacity: 11_400 }
		);
		expect(frases).toEqual(['Sin explorar: no hay datos de lo que hay acá.']);
	});
});

describe('describeSystem', () => {
	it('calla, porque la pantalla ya muestra todo lo que diría', () => {
		// Gobierno, seguridad, región y quién lo controla están arriba, cada uno con
		// su rótulo. Repetirlos en prosa sería decirlos dos veces.
		expect(describeSystem({ capitalOf: '' })).toEqual([]);
	});

	it('dice cuando es capital, que no es un rótulo de la pantalla', () => {
		expect(describeSystem({ capitalOf: 'El Dominio' })).toEqual(['Es la capital del Dominio.']);
	});

	it('contrae el artículo del nombre de la facción', () => {
		expect(describeSystem({ capitalOf: 'La Concordia' })).toEqual([
			'Es la capital de la Concordia.'
		]);
	});
});

describe('threatLevel', () => {
	it('empeora al alejarse del centro, con la misma seguridad', () => {
		// Ánfora, seguridad 78: los Anillos son tranquilos y el Cinturón Exterior
		// no, aunque el número del sistema sea el mismo para los dos.
		expect(threatLevel(78, false)).toBe('calm');
		expect(threatLevel(78, true)).toBe('watched');
	});

	it('empeora al bajar la seguridad, en el mismo lugar', () => {
		expect(threatLevel(50, false)).toBe('watched');
		expect(threatLevel(20, false)).toBe('exposed');
		expect(threatLevel(0, false)).toBe('hostile');
	});

	it('no tiene salida en el borde de un sistema sin ley', () => {
		expect(threatLevel(0, true)).toBe('hostile');
	});
});

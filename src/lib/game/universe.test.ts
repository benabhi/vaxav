/** Las reglas del plano: seguridad, órbitas, rumbos y cómo se llama cada cosa. */

import { describe, expect, it } from 'vitest';
import {
	BODY_KINDS,
	FREE_SPACE_CEILING,
	GATE_BEARINGS,
	GOVERNMENTS,
	SECURITY_BANDS,
	SECURITY_MAX,
	SECURITY_MIN,
	allSystems,
	bearingAngle,
	bodyCodeFrom,
	canOrbit,
	codeFrom,
	freeBearings,
	moonLetter,
	oppositeBearing,
	romanNumeral,
	securityBand,
	securityLevel,
	securityProblem,
	suggestedBodyName,
	suggestedSecurity,
	type Government
} from './universe';

describe('la seguridad', () => {
	it('cae en el cajón que le toca', () => {
		expect(securityLevel(0)).toBe('lawless');
		expect(securityLevel(1)).toBe('low');
		expect(securityLevel(34)).toBe('low');
		expect(securityLevel(35)).toBe('medium');
		expect(securityLevel(64)).toBe('medium');
		expect(securityLevel(65)).toBe('high');
		expect(securityLevel(SECURITY_MAX)).toBe('high');
	});

	it('toda banda vive dentro de la escala y no está al revés', () => {
		for (const government of GOVERNMENTS) {
			const { min, max } = SECURITY_BANDS[government];
			expect(min).toBeGreaterThanOrEqual(SECURITY_MIN);
			expect(max).toBeLessThanOrEqual(SECURITY_MAX);
			expect(min).toBeLessThanOrEqual(max);
		}
	});

	/*
	 * Es la contradicción que preocupaba desde el principio y la razón de que la
	 * banda exista: el número se guarda, pero no cualquier número entra.
	 */
	it('no deja una anarquía con seguridad alta', () => {
		expect(securityProblem(0, 'anarchy', true)).toBeNull();
		expect(securityProblem(90, 'anarchy', true)).not.toBeNull();
		expect(securityProblem(70, 'feudal', true)).not.toBeNull();
	});

	/*
	 * Una facción controladora no es un rótulo: es quién paga las patrullas. Sin
	 * ella no hay a quién reclamarle, por corporativo que sea el gobierno local.
	 */
	it('le pone techo al espacio sin dueño', () => {
		expect(securityBand('corporate', true).max).toBe(100);
		expect(securityBand('corporate', false).max).toBe(FREE_SPACE_CEILING);
		expect(securityProblem(80, 'corporate', false)).not.toBeNull();
		expect(securityProblem(45, 'corporate', false)).toBeNull();
	});

	it('el techo no deja una banda dada vuelta', () => {
		for (const government of GOVERNMENTS) {
			const { min, max } = securityBand(government, false);
			expect(min).toBeLessThanOrEqual(max);
		}
	});

	it('exige un entero', () => {
		expect(securityProblem(70.5, 'corporate', true)).not.toBeNull();
	});

	it('lo que propone por omisión siempre es válido', () => {
		for (const government of GOVERNMENTS) {
			for (const controlada of [true, false]) {
				const propuesta = suggestedSecurity(government, controlada);
				expect(securityProblem(propuesta, government, controlada)).toBeNull();
			}
		}
	});

	/*
	 * Si dos gobiernos cayeran siempre en el mismo cajón, el gobierno sería otro
	 * nombre para la seguridad y no valdría la pena tener los dos. Que las bandas
	 * crucen los cajones es justamente lo que le devuelve un oficio.
	 */
	it('un mismo gobierno puede dar sistemas de cajones distintos', () => {
		const cajones = (government: Government) => {
			const { min, max } = SECURITY_BANDS[government];
			return new Set([securityLevel(min), securityLevel(max)]);
		};

		expect(cajones('prison').size).toBeGreaterThan(1);
		expect(cajones('dictatorship').size).toBeGreaterThan(1);
		expect(cajones('corporate').size).toBeGreaterThan(1);
	});
});

describe('qué cuelga de qué', () => {
	it('deja armar un sistema como los que existen', () => {
		expect(canOrbit('planet', 'star')).toBe(true);
		expect(canOrbit('moon', 'planet')).toBe(true);
		expect(canOrbit('belt', 'planet')).toBe(true);
		expect(canOrbit('station', 'moon')).toBe(true);
		expect(canOrbit('gate', 'star')).toBe(true);
	});

	it('no deja armar uno imposible', () => {
		expect(canOrbit('star', 'planet')).toBe(false);
		expect(canOrbit('planet', 'moon')).toBe(false);
		expect(canOrbit('moon', 'station')).toBe(false);
		expect(canOrbit('station', 'gate')).toBe(false);
	});

	/*
	 * La estrella es la raíz: no cuelga de nadie. Si alguna vez apareciera como
	 * hija de algo, el constructor dejaría anidar soles.
	 */
	it('la estrella no cuelga de nada', () => {
		for (const kind of BODY_KINDS) expect(canOrbit('star', kind)).toBe(false);
	});
});

describe('la roseta', () => {
	it('tiene ocho rumbos repartidos cada 45 grados', () => {
		expect(GATE_BEARINGS).toHaveLength(8);
		expect(bearingAngle('n')).toBe(0);
		expect(bearingAngle('e')).toBe(90);
		expect(bearingAngle('s')).toBe(180);
		expect(bearingAngle('w')).toBe(270);
	});

	it('el opuesto es el de enfrente, y el opuesto del opuesto es uno mismo', () => {
		expect(oppositeBearing('n')).toBe('s');
		expect(oppositeBearing('se')).toBe('nw');
		for (const bearing of GATE_BEARINGS) {
			expect(oppositeBearing(oppositeBearing(bearing))).toBe(bearing);
		}
	});

	it('dice qué lados quedan libres', () => {
		expect(freeBearings(['n', 's'])).not.toContain('n');
		expect(freeBearings(['n', 's'])).toHaveLength(6);
		expect(freeBearings([])).toHaveLength(8);
		expect(freeBearings(GATE_BEARINGS)).toHaveLength(0);
	});
});

describe('cómo se llaman las cosas', () => {
	it('numera los planetas en romano, desde la estrella hacia afuera', () => {
		expect(romanNumeral(1)).toBe('I');
		expect(romanNumeral(4)).toBe('IV');
		expect(romanNumeral(9)).toBe('IX');
		expect(romanNumeral(14)).toBe('XIV');
		expect(romanNumeral(40)).toBe('XL');
	});

	it('nombra las lunas con letras y sigue después de la z', () => {
		expect(moonLetter(1)).toBe('a');
		expect(moonLetter(26)).toBe('z');
		expect(moonLetter(27)).toBe('aa');
		expect(moonLetter(28)).toBe('ab');
	});

	it('arma códigos sin acentos ni espacios', () => {
		expect(codeFrom('Ánfora III')).toBe('anfora_iii');
		expect(codeFrom('Anillos de Ánfora III')).toBe('anillos_de_anfora_iii');
		expect(codeFrom('  Puerto  Ánfora  ')).toBe('puerto_anfora');
	});

	/*
	 * `body.code` es único en **toda la galaxia**, no por sistema. Copiar un
	 * sistema sin renombrar cada cuerpo revienta recién al sembrar, así que el
	 * código lleva el del sistema por delante y no se escribe a mano.
	 */
	it('le pone el sistema por delante al código de un cuerpo', () => {
		expect(bodyCodeFrom('vela', 'Muelle Largo')).toBe('vela_muelle_largo');
		// Y no lo repite si el nombre ya lo trae.
		expect(bodyCodeFrom('vela', 'Vela III')).toBe('vela_iii');
	});

	it('propone el nombre que sigue según el tipo', () => {
		const contexto = { systemName: 'Ánfora', siblings: 2 };

		expect(suggestedBodyName('planet', contexto)).toBe('Ánfora III');
		expect(suggestedBodyName('moon', { ...contexto, parentName: 'Ánfora III' })).toBe(
			'Ánfora III-c'
		);
		expect(suggestedBodyName('belt', { ...contexto, parentName: 'Ánfora III' })).toBe(
			'Anillos de Ánfora III'
		);
		expect(suggestedBodyName('gate', { ...contexto, destinationName: 'Vela' })).toBe(
			'Puerta a Vela'
		);
		// Sin destino todavía, se la nombra por el lado por el que sale.
		expect(suggestedBodyName('gate', { ...contexto, bearingName: 'Norte' })).toBe('Puerta Norte');
		expect(suggestedBodyName('gate', contexto)).toBe('');
	});

	it('la primera estrella se llama como el sistema y la segunda lleva letra', () => {
		expect(suggestedBodyName('star', { systemName: 'Ánfora', siblings: 0 })).toBe('Ánfora');
		expect(suggestedBodyName('star', { systemName: 'Ánfora', siblings: 1 })).toBe('Ánfora B');
	});

	/*
	 * Las estaciones llevan nombre propio: las construyó alguien y las bautizó, y
	 * un número las volvería intercambiables, que es lo contrario de lo que son.
	 */
	it('no propone nombre para una estación', () => {
		expect(suggestedBodyName('station', { systemName: 'Ánfora', siblings: 0 })).toBe('');
	});
});

describe('el plano que viene con el juego', () => {
	it('declara una seguridad que su propio gobierno admite', () => {
		for (const system of allSystems()) {
			const problema = securityProblem(
				system.security,
				system.government,
				Boolean(system.controllingFaction)
			);
			expect(problema, `${system.name}: ${problema}`).toBeNull();
		}
	});

	/*
	 * Una capital de una facción que no controla el sistema es un estado
	 * imposible, y el plano es el primer lugar donde podría colarse.
	 */
	it('no declara una capital de quien no controla el sistema', () => {
		const descolgadas = allSystems()
			.filter((system) => system.capitalOf && system.capitalOf !== system.controllingFaction)
			.map((system) => system.name);

		expect(descolgadas).toEqual([]);
	});

	it('no le da dos capitales a la misma facción', () => {
		const capitales = allSystems()
			.map((system) => system.capitalOf)
			.filter(Boolean);

		expect(new Set(capitales).size).toBe(capitales.length);
	});
});

/** El catálogo de corporaciones: lo que tiene que cumplir para no dejar huecos. */

import { describe, expect, it } from 'vitest';
import { FACTION_LIST } from './factions';
import {
	CORPORATIONS,
	CORPORATION_KINDS,
	corporationsByKind,
	corporationsOf,
	getCorporation
} from './corporations';

/** Lo mínimo por facción para que elegir a cuál alistarse sea elegir. */
const MINIMO_POR_FACCION = 10;

describe('el catálogo de corporaciones', () => {
	it('no repite códigos ni nombres', () => {
		expect(new Set(CORPORATIONS.map((una) => una.code)).size).toBe(CORPORATIONS.length);
		expect(new Set(CORPORATIONS.map((una) => una.name)).size).toBe(CORPORATIONS.length);
	});

	/*
	 * Con tres o cuatro por facción, elegir no sería elegir: sería aceptar la única
	 * que hace lo que uno quiere hacer.
	 */
	it('tiene al menos diez por facción', () => {
		for (const faccion of FACTION_LIST) {
			expect(
				corporationsOf(faccion.code).length,
				`${faccion.name} tiene menos de ${MINIMO_POR_FACCION}`
			).toBeGreaterThanOrEqual(MINIMO_POR_FACCION);
		}
	});

	/*
	 * El rubro es lo que va a decidir qué contratos publica y qué compra cada una.
	 * Una facción a la que le falte un rubro es una facción donde media profesión
	 * no encuentra trabajo.
	 */
	it('cada facción cubre los seis rubros', () => {
		for (const faccion of FACTION_LIST) {
			const rubros = new Set(corporationsOf(faccion.code).map((una) => una.kind));
			for (const rubro of CORPORATION_KINDS) {
				expect(rubros.has(rubro), `${faccion.name} no tiene ninguna de ${rubro}`).toBe(true);
			}
		}
	});

	/*
	 * Una estación sin bandera es lo que vuelve interesante al Amarre Franco: no le
	 * rinde cuentas a ninguna de las tres.
	 */
	it('hay corporaciones sin bandera', () => {
		expect(corporationsOf('').length).toBeGreaterThan(0);
	});

	it('todas declaran un rubro del catálogo y una descripción', () => {
		for (const una of CORPORATIONS) {
			expect(CORPORATION_KINDS).toContain(una.kind);
			expect(una.description.length, `${una.name} no tiene descripción`).toBeGreaterThan(40);
			expect(una.code).toMatch(/^[a-z0-9_]+$/);
		}
	});

	it('la bandera que declaran existe, o es la cadena vacía', () => {
		const banderas = new Set(FACTION_LIST.map((una) => una.code));
		for (const una of CORPORATIONS) {
			if (una.faction === '') continue;
			expect(banderas.has(una.faction), `${una.name} responde a una facción que no existe`).toBe(
				true
			);
		}
	});

	it('se busca por código y por rubro', () => {
		expect(getCorporation('casa_verlan')?.name).toBe('Casa Verlan');
		expect(getCorporation('no_existe')).toBeNull();
		expect(corporationsByKind('mining').every((una) => una.kind === 'mining')).toBe(true);
		expect(corporationsByKind('mining').length).toBeGreaterThan(0);
	});
});

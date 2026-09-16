/** El mapa del cuartel: quién entra, qué secciones ve y dónde está parado. */

import { describe, expect, it } from 'vitest';
import {
	ADMIN_ENTRY,
	ADMIN_ROUTE,
	ADMIN_SECTIONS,
	canEnterAdmin,
	sectionForRoute,
	sectionsFor
} from './admin';
import { ALL_PERMISSIONS, isPermission } from './permissions';

describe('las secciones declaradas', () => {
	/*
	 * Un permiso mal escrito en esta lista no rompe nada: simplemente esconde la
	 * sección para siempre, y en silencio. Es justo la clase de error que sólo
	 * aparece cuando alguien pregunta por qué no ve el registro.
	 */
	it('piden permisos que existen en el catálogo', () => {
		for (const section of ADMIN_SECTIONS) {
			if (section.permission) expect(isPermission(section.permission)).toBe(true);
		}
	});

	it('cuelgan todas de la raíz del cuartel', () => {
		for (const section of ADMIN_SECTIONS) {
			expect(section.tabs[0].route.startsWith(ADMIN_ROUTE)).toBe(true);
		}
		expect(ADMIN_ENTRY.tabs[0].route).toBe(ADMIN_ROUTE);
	});
});

describe('cruzar la puerta', () => {
	it('la abre cualquier llave', () => {
		expect(canEnterAdmin(['stats.read'])).toBe(true);
		expect(canEnterAdmin(ALL_PERMISSIONS)).toBe(true);
	});

	it('no la abre quien no tiene ninguna', () => {
		expect(canEnterAdmin([])).toBe(false);
		expect(canEnterAdmin(['lo.que.sea'])).toBe(false);
	});
});

describe('qué secciones ve', () => {
	it('las que no piden nada las ve cualquiera que haya entrado', () => {
		const vistas = sectionsFor(new Set(['stats.read'])).map((uno) => uno.code);
		expect(vistas).toContain('overview');
		expect(vistas).not.toContain('events');
	});

	it('con la llave del registro, lo ve', () => {
		expect(sectionsFor(new Set(['events.read'])).map((uno) => uno.code)).toContain('events');
	});
});

describe('dónde está parado', () => {
	it('encuentra la sección de una ruta', () => {
		expect(sectionForRoute(ADMIN_ROUTE)?.code).toBe('overview');
		expect(sectionForRoute(`${ADMIN_ROUTE}/eventos`)?.code).toBe('events');
	});

	/*
	 * La raíz es prefijo de todas las demás. Sin quedarse con la coincidencia más
	 * larga, cada pantalla del cuartel encendería "Cuartel" en la barra lateral.
	 */
	it('gana la coincidencia más larga y no la raíz', () => {
		expect(sectionForRoute(`${ADMIN_ROUTE}/eventos?dia=2026-01-01`.split('?')[0])?.code).toBe(
			'events'
		);
	});

	it('una ruta de afuera no es de ninguna sección', () => {
		expect(sectionForRoute('/piloto')).toBeNull();
		expect(sectionForRoute('/administracion')).toBeNull();
	});
});

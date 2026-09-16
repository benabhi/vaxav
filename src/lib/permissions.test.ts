/** El catálogo de permisos y las preguntas que se le hacen. */

import { describe, expect, it } from 'vitest';
import {
	ALL_PERMISSIONS,
	AREA_LABELS,
	PERMISSIONS,
	PERMISSION_AREAS,
	can,
	canAll,
	canAny,
	getPermission,
	isPermission,
	permissionLabel,
	permissionsOfArea
} from './permissions';

describe('el catálogo', () => {
	it('no repite códigos', () => {
		expect(new Set(ALL_PERMISSIONS).size).toBe(ALL_PERMISSIONS.length);
	});

	it('pone cada permiso en un área que existe y tiene nombre', () => {
		for (const permission of PERMISSIONS) {
			expect(PERMISSION_AREAS).toContain(permission.area);
			expect(AREA_LABELS[permission.area]).toBeTruthy();
		}
	});

	it('le escribe a cada permiso qué habilita, en una frase terminada', () => {
		for (const permission of PERMISSIONS) {
			expect(permission.label).toBeTruthy();
			expect(permission.summary.endsWith('.')).toBe(true);
		}
	});

	it('reparte todos los permisos entre las áreas, sin dejar ninguno afuera', () => {
		const repartidos = PERMISSION_AREAS.flatMap((area) => permissionsOfArea(area));
		expect(repartidos).toHaveLength(PERMISSIONS.length);
	});

	/*
	 * Marcar lo peligroso es la única señal que separa "editar" de "borrar para
	 * siempre" en un formulario de casillas. Si nadie estuviera marcado, la señal
	 * no existiría y nadie se enteraría hasta usarla.
	 */
	it('marca como peligroso lo que borra o reparte poder', () => {
		const peligrosos = PERMISSIONS.filter((permission) => permission.dangerous).map(
			(permission) => permission.code
		);

		expect(peligrosos).toContain('pilots.delete');
		expect(peligrosos).toContain('universe.delete');
		expect(peligrosos).toContain('roles.edit');
	});
});

describe('preguntar por un código', () => {
	it('reconoce los del catálogo y ninguno más', () => {
		expect(isPermission('pilots.read')).toBe(true);
		expect(isPermission('pilots.volar')).toBe(false);
		expect(getPermission('pilots.volar')).toBeNull();
	});

	/*
	 * Un rol viejo puede llevar una llave que se sacó del código. La pantalla
	 * tiene que poder mostrarla para que alguien la quite, así que se cae al
	 * código en vez de romper.
	 */
	it('devuelve el código a secas cuando ya no lo conoce', () => {
		expect(permissionLabel('pilots.read')).toBe('Ver pilotos');
		expect(permissionLabel('lo.que.sea')).toBe('lo.que.sea');
	});
});

describe('si un manojo de llaves abre una puerta', () => {
	const manojo = ['pilots.read', 'events.read'];

	it('abre las que tiene', () => {
		expect(can(manojo, 'pilots.read')).toBe(true);
		expect(can(manojo, 'pilots.delete')).toBe(false);
	});

	/*
	 * Ni siquiera leer. Un piloto común no tiene ningún permiso, y que el vacío
	 * abriera algo convertiría a todo el juego en administrador.
	 */
	it('no abre nada con el manojo vacío', () => {
		expect(can([], 'pilots.read')).toBe(false);
		expect(canAny([], ALL_PERMISSIONS)).toBe(false);
		expect(canAll([], ALL_PERMISSIONS)).toBe(false);
	});

	it('pide todas para `canAll` y cualquiera para `canAny`', () => {
		expect(canAll(manojo, ['pilots.read', 'events.read'])).toBe(true);
		expect(canAll(manojo, ['pilots.read', 'pilots.delete'])).toBe(false);
		expect(canAny(manojo, ['pilots.delete', 'events.read'])).toBe(true);
		expect(canAny(manojo, ['pilots.delete'])).toBe(false);
	});

	/*
	 * Sin lista no hay nada que abrir. Devolver `true` —que es lo que hace
	 * `every` con un arreglo vacío— dejaría pasar a cualquiera por una puerta que
	 * se olvidó de declarar qué pide.
	 */
	it('no da por cumplida una lista vacía', () => {
		expect(canAll(ALL_PERMISSIONS, [])).toBe(false);
	});
});

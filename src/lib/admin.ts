/**
 * El mapa del cuartel general: por dónde se mueve un administrador.
 *
 * Es al área de administración lo que `$lib/navigation.ts` al juego, y **está
 * aparte a propósito**. No son dos listas de lo mismo: las del juego las ve todo
 * el mundo, y éstas dependen de qué llaves tenga quien mira. Mezclarlas
 * obligaría a que el Neocom del juego supiera de permisos, que es conocimiento
 * que no le toca.
 *
 * Reutiliza el tipo `Module` para que la misma barra lateral pueda dibujar las
 * dos: lo único que agrega una sección del cuartel es **qué permiso pide**.
 *
 * **Sólo se declara lo que existe.** Igual que el árbol del juego: una entrada
 * que lleva a un cartel de "próximamente" es una puerta cerrada con el nombre
 * puesto. El cuartel crece sección por sección, a medida que hay herramientas
 * detrás.
 *
 * Corresponde a docs/systems/ADMIN.md.
 */

import { ALL_PERMISSIONS, canAny } from '$lib/permissions';
import type { Module } from '$lib/navigation';

/** La raíz del área. Todo lo del cuartel cuelga de acá. */
export const ADMIN_ROUTE = '/admin';

/**
 * Una sección del cuartel.
 *
 * `permission` vacío quiere decir que alcanza con poder entrar al área: es el
 * caso del resumen, que no muestra nada que no muestre otra sección.
 */
export interface AdminSection extends Module {
	readonly permission: string;
}

export const ADMIN_SECTIONS: readonly AdminSection[] = [
	{
		code: 'overview',
		label: 'Cuartel',
		icon: 'crown-simple',
		permission: '',
		tabs: [{ route: ADMIN_ROUTE, label: 'Cuartel' }]
	},
	{
		code: 'pilots',
		label: 'Pilotos',
		icon: 'identification-badge',
		permission: 'pilots.read',
		tabs: [{ route: `${ADMIN_ROUTE}/pilotos`, label: 'Pilotos' }]
	},
	{
		code: 'universe',
		label: 'Universo',
		icon: 'planet',
		permission: 'universe.read',
		tabs: [{ route: `${ADMIN_ROUTE}/universo`, label: 'Universo' }]
	},
	{
		code: 'events',
		label: 'Registro',
		icon: 'clipboard-text',
		permission: 'events.read',
		tabs: [{ route: `${ADMIN_ROUTE}/eventos`, label: 'Registro' }]
	}
];

/**
 * Cómo se ve el cuartel desde el Neocom del juego.
 *
 * Va abajo, junto a Opciones, y **sólo aparece si el piloto tiene alguna llave**.
 * Un enlace que todos ven y casi nadie puede abrir es una puerta con cartel:
 * invita a empujarla y no cuenta nada.
 */
export const ADMIN_ENTRY: Module = {
	code: 'admin',
	label: 'Cuartel',
	icon: 'crown-simple',
	tabs: [{ route: ADMIN_ROUTE, label: 'Cuartel' }]
};

/**
 * Si un piloto puede cruzar la puerta del cuartel.
 *
 * **Cualquier llave abre la puerta**, y después cada sección pide la suya. Es lo
 * que permite que exista un rol que sólo mira estadísticas sin inventarle un
 * permiso extra de "entrar", que no protegería nada que su propio permiso no
 * proteja ya.
 */
export function canEnterAdmin(permissions: Iterable<string>): boolean {
	return canAny(permissions, ALL_PERMISSIONS);
}

/** Las secciones que ese piloto puede abrir, en el orden declarado. */
export function sectionsFor(permissions: ReadonlySet<string>): readonly AdminSection[] {
	return ADMIN_SECTIONS.filter(
		(section) => !section.permission || permissions.has(section.permission)
	);
}

/**
 * La sección a la que pertenece una ruta, o `null`.
 *
 * Gana la coincidencia más larga, para que una pantalla que cuelga del registro
 * no termine encendiendo el resumen —que es la raíz y es prefijo de todo.
 */
export function sectionForRoute(path: string): AdminSection | null {
	let mejor: AdminSection | null = null;

	for (const section of ADMIN_SECTIONS) {
		const route = section.tabs[0].route;
		if (path !== route && !path.startsWith(`${route}/`)) continue;
		if (!mejor || route.length > mejor.tabs[0].route.length) mejor = section;
	}

	return mejor;
}

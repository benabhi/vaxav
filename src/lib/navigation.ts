/**
 * El árbol de navegación del juego: módulos y pestañas.
 *
 * Es la **única fuente de verdad** de por dónde se mueve el jugador. De acá
 * salen el Neocom, las barras de pestañas y el título de cada pantalla, así que
 * una pantalla nueva se agrega en un solo lugar y aparece en los tres.
 *
 * Hay **dos niveles y nunca un tercero**. El Neocom lleva a un módulo; las
 * pestañas llevan a una pantalla dentro de ese módulo. Si un módulo necesitara
 * más profundidad, se resuelve con el diseño de esa pantalla —una lista con el
 * detalle al lado, por ejemplo—, no con más navegación.
 *
 * La ruta de un módulo **es la de su primera pestaña**: `/piloto` es Información.
 * Así no hay redirecciones ni dos URL para la misma pantalla.
 */

import type { IconName } from '$lib/icons';

/**
 * Una pantalla dentro de un módulo.
 *
 * Sólo se declara lo que **existe**. El árbol no anuncia pantallas futuras: una
 * entrada del menú que lleva a un cartel es una puerta cerrada con el nombre
 * puesto, y prometer es peor que no ofrecer. El Neocom crece cuando hay algo
 * detrás.
 */
export interface Tab {
	readonly route: string;
	readonly label: string;
}

/** Una entrada del Neocom, con sus pantallas. */
export interface Module {
	readonly code: string;
	readonly label: string;
	readonly icon: IconName;
	readonly tabs: readonly Tab[];
}

export const MODULES: readonly Module[] = [
	{
		code: 'pilot',
		label: 'Piloto',
		icon: 'identification-badge',
		tabs: [
			{
				route: '/piloto',
				label: 'Información'
			},
			{
				route: '/piloto/habilidades',
				label: 'Habilidades'
			},
			{
				route: '/piloto/bitacora',
				label: 'Bitácora'
			}
		]
	},
	{
		code: 'ship',
		label: 'Nave',
		icon: 'rocket',
		tabs: [
			{
				route: '/nave',
				label: 'Ficha'
			},
			{
				route: '/nave/bodega',
				label: 'Bodega'
			}
		]
	},
	{
		code: 'navigation',
		label: 'Navegación',
		icon: 'map-trifold',
		tabs: [
			{
				route: '/navegacion',
				label: 'Ubicación'
			},
			{
				route: '/navegacion/sistema',
				label: 'Sistema'
			}
		]
	},
	{
		code: 'wallet',
		label: 'Billetera',
		icon: 'wallet',
		tabs: [
			{
				route: '/billetera',
				label: 'Billetera'
			}
		]
	}
];

/**
 * El Neocom no dibuja "Opciones" junto a los módulos del juego: cuelga aparte,
 * entre "Plegar" y "Salir". Pero igual necesita su pantalla y encender su
 * pestaña como cualquier otro, así que cuenta para eso.
 */
export const OPTIONS_MODULE: Module = {
	code: 'options',
	label: 'Opciones',
	icon: 'gear-six',
	tabs: [
		{
			route: '/opciones',
			label: 'Cuenta'
		}
	]
};

/**
 * La pantalla donde aparecen los informes de las acciones resueltas.
 *
 * Vive acá y no en el servicio porque es una decisión de navegación: qué pestaña
 * se enciende cuando hay algo nuevo. El día que las misiones o los mensajes
 * también avisen, se suma su ruta y el Neocom y la barra de pestañas se enteran
 * solos.
 */
export const LOG_TAB = '/piloto/bitacora';

/**
 * Si alguna de las pantallas de un módulo tiene un aviso pendiente.
 *
 * El Neocom marca el módulo y la barra marca la pestaña: el jugador ve desde
 * cualquier pantalla que hay algo, y una vez adentro ve dónde.
 */
export function moduleHasNotice(module: Module, notices: readonly string[]): boolean {
	return module.tabs.some((tab) => notices.includes(tab.route));
}

/** Todos los módulos que tienen pantalla, incluida la de opciones. */
export const ALL_MODULES: readonly Module[] = [...MODULES, OPTIONS_MODULE];

/** Todas las pestañas, en el orden en que se declaran. */
export const TABS: readonly Tab[] = ALL_MODULES.flatMap((module) => module.tabs);

/** La ruta de un módulo es la de su primera pestaña. */
export function moduleRoute(module: Module): string {
	return module.tabs[0].route;
}

/** Un módulo de una sola pantalla no dibuja barra de pestañas. */
export function hasTabs(module: Module): boolean {
	return module.tabs.length > 1;
}

/**
 * El módulo al que pertenece una ruta, o `null` si no es de ninguno.
 *
 * Una ruta pertenece a un módulo si es la suya o si cuelga de ella, de modo que
 * `/piloto/habilidades` encienda la entrada "Piloto" del Neocom.
 */
export function moduleForRoute(path: string): Module | null {
	for (const module of ALL_MODULES) {
		const route = moduleRoute(module);
		if (path === route || path.startsWith(`${route}/`)) return module;
	}
	return null;
}

/** La pestaña exacta de una ruta, o `null`. */
export function tabForRoute(path: string): Tab | null {
	return TABS.find((tab) => tab.route === path) ?? null;
}

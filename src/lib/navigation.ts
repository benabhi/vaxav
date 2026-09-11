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

/** Una pantalla dentro de un módulo. */
export interface Tab {
	readonly route: string;
	readonly label: string;
	/** Qué va a mostrar y en qué fase llega. Vacío cuando ya está construida. */
	readonly pending?: string;
	readonly phase?: string;
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
				label: 'Bitácora',
				pending:
					'El registro de todo lo que resolviste: qué hiciste, qué ' +
					'salió y cuánta experiencia dejó. Es lo primero que se lee ' +
					'al volver, porque las cosas pasan mientras no estás.',
				phase: 'F7'
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
				label: 'Ficha',
				pending:
					'Los atributos de tu nave: casco, combustible, energía ' +
					'disponible y los bonos que le dan tus habilidades. Todavía ' +
					'no tenés nave; la primera, una lanzadera Estribo, llega ' +
					'con el hangar.',
				phase: 'F6'
			},
			{
				route: '/nave/equipamiento',
				label: 'Equipamiento',
				pending:
					'Las ranuras de la nave —anclajes, utilitarios e internos— ' +
					'con su clase, y los módulos montados en cada una. Acá se ' +
					'decide a qué se dedica la nave.',
				phase: 'F6'
			},
			{
				route: '/nave/bodega',
				label: 'Bodega',
				pending:
					'Qué llevás y cuánto espacio queda. La bodega es chica a ' +
					'propósito: obliga a elegir qué vale la pena cargar.',
				phase: 'F6'
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
			},
			{
				route: '/navegacion/galaxia',
				label: 'Galaxia',
				pending:
					'El mapa de los sistemas conocidos y las rutas entre ellos. ' +
					'Hoy Ánfora es el único que existe, así que sería un mapa ' +
					'de un punto.',
				phase: 'F13'
			}
		]
	},
	{
		code: 'market',
		label: 'Mercado',
		icon: 'storefront',
		tabs: [
			{
				route: '/mercado',
				label: 'Comprar',
				pending:
					'Lo que se ofrece en la estación y a qué precio. Los ' +
					'precios los van a mover los propios pilotos, no una tabla ' +
					'fija.',
				phase: 'F10'
			},
			{
				route: '/mercado/vender',
				label: 'Vender',
				pending:
					'Poner a la venta lo que traés en la bodega, al precio que ' +
					'creas que alguien va a pagar.',
				phase: 'F10'
			},
			{
				route: '/mercado/ordenes',
				label: 'Mis órdenes',
				pending: 'Tus órdenes abiertas, cuáles se cumplieron y cuáles están ' + 'por vencer.',
				phase: 'F10'
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
				label: 'Billetera',
				pending:
					'El saldo en créditos y el detalle de cada movimiento: qué ' +
					'cobraste, qué pagaste y por qué. Cada asiento queda ' +
					'registrado, que es lo que permite auditar la economía ' +
					'cuando algo no cierra.',
				phase: 'F4'
			}
		]
	},
	{
		code: 'assets',
		label: 'Propiedades',
		icon: 'buildings',
		tabs: [
			{
				route: '/propiedades',
				label: 'Bodegas',
				pending:
					'Lo que tengas guardado en cada estación. Mover cosas entre ' +
					'bodegas también va a costar tiempo.',
				phase: 'F15'
			},
			{
				route: '/propiedades/naves',
				label: 'Naves',
				pending:
					'Las naves que no estás usando y dónde quedaron. Una nave ' +
					'guardada en la otra punta del sector no te sirve de mucho.',
				phase: 'F15'
			}
		]
	},
	{
		code: 'mail',
		label: 'Mensajes',
		icon: 'envelope-simple',
		tabs: [
			{
				route: '/mensajes',
				label: 'Recibidos',
				pending:
					'Avisos del sector, contratos ofrecidos y mensajes de otros ' +
					'comandantes. Lo que el chat no puede sostener: lo que hay ' +
					'que poder leer tres días después.',
				phase: 'F9'
			},
			{
				route: '/mensajes/enviados',
				label: 'Enviados',
				pending: 'Lo que mandaste, por si hace falta releerlo.',
				phase: 'F9'
			}
		]
	},
	{
		code: 'corporation',
		label: 'Corporación',
		icon: 'users-three',
		tabs: [
			{
				route: '/corporacion',
				label: 'Resumen',
				pending:
					'Tu corporación: qué es, quién la dirige y con quién está ' +
					'enfrentada. Sin corporaciones, Vaxav es un juego de a uno ' +
					'en un mundo compartido.',
				phase: 'F12'
			},
			{
				route: '/corporacion/miembros',
				label: 'Miembros',
				pending: 'Quiénes la forman, qué puede hacer cada uno y quién ' + 'responde por qué.',
				phase: 'F12'
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

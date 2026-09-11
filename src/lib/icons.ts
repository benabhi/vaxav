/**
 * Los íconos de Phosphor que usa la interfaz.
 *
 * La lista se declara acá y no se descubre en tiempo de ejecución para que el
 * compilador atrape un nombre mal escrito: un ícono que no existe no rompe la
 * página, deja un hueco silencioso, que es peor.
 *
 * Para sumar uno, descargar los seis pesos desde
 * `https://raw.githubusercontent.com/phosphor-icons/core/main/assets/<peso>/<nombre>[-<peso>].svg`
 * y guardarlos como `static/icons/<peso>/<nombre>.svg` —sin el sufijo del peso
 * en el nombre, porque ya lo dice la carpeta— y agregarlo a esta lista.
 */

/**
 * Los seis pesos, del más liviano al más pesado.
 *
 * El peso da jerarquía sin cambiar de ícono ni de color: `duotone` para lo
 * destacado, `light` para lo mismo en reposo, `bold` o `fill` para los íconos
 * chicos de interfaz, `thin` para lo decorativo grande.
 */
export const ICON_WEIGHTS = ['thin', 'light', 'regular', 'bold', 'fill', 'duotone'] as const;

export type IconWeight = (typeof ICON_WEIGHTS)[number];

/** Todos los íconos disponibles, en los seis pesos. */
export const ICON_NAMES = [
	'address-book',
	'anchor',
	'arrows-out-cardinal',
	'atom',
	'battery-charging',
	'binoculars',
	'broadcast',
	'buildings',
	'caret-down',
	'caret-left',
	'caret-right',
	'caret-up',
	'chat-teardrop-dots',
	'check',
	'circles-three',
	'clipboard-text',
	'clock',
	'coins',
	'compass',
	'crosshair',
	'crown-simple',
	'diamond',
	'drop',
	'envelope-simple',
	'eye-slash',
	'factory',
	'flame',
	'gas-can',
	'gear-six',
	'hammer',
	'handshake',
	'identification-badge',
	'identification-card',
	'lightning',
	'magnet',
	'magnifying-glass',
	'map-pin',
	'map-trifold',
	'moon',
	'mountains',
	'package',
	'planet',
	'rocket-launch',
	'rocket',
	'scales',
	'shield-check',
	'shield-chevron',
	'shield',
	'sidebar-simple',
	'sign-out',
	'squares-four',
	'star-half',
	'star',
	'storefront',
	'sun',
	'sword',
	'target',
	'truck',
	'users-three',
	'users',
	'wallet',
	'warehouse',
	'warning',
	'wind',
	'wrench',
	'x'
] as const;

export type IconName = (typeof ICON_NAMES)[number];

/**
 * Las tres formas y los tres tamaños de un control del HUD.
 *
 * Viven acá y no adentro del componente porque el enlace con forma de botón usa
 * exactamente las mismas clases: un `<a>` y un `<button>` tienen que verse
 * idénticos, y la única manera de garantizarlo es que compartan la fuente.
 */

/**
 * La altura de un control, por tamaño.
 *
 * **Botones y campos comparten la escala**, y de ahí que esté separada: en una
 * cabina los controles están a la misma altura, y un campo más alto que el botón
 * que tiene al lado se nota aunque nadie sepa decir por qué. Las medidas van
 * literales porque no están en la escala de espaciado, que es lo que manda
 * CLAUDE.md para este caso.
 */
export const CONTROL_HEIGHTS = {
	'1': 'h-[1.75rem]',
	'2': 'h-[2.15rem]',
	'3': 'h-11'
} as const;

export type ControlSize = keyof typeof CONTROL_HEIGHTS;

export const BUTTON_VARIANTS = {
	/** La acción principal: ya viene encendida. */
	primary:
		'bg-accent text-on-accent border border-accent shadow-glow ' +
		'hover:bg-accent-bright hover:border-accent-bright hover:shadow-glow-strong',
	/** La de siempre: contorno, y se llena al señalarla. */
	outline:
		'bg-transparent text-accent-bright border border-border ' +
		'hover:bg-accent hover:text-on-accent hover:border-accent hover:shadow-glow',
	/** Para acciones secundarias que no deben pesar. */
	ghost:
		'bg-transparent text-text-body border border-transparent ' +
		'hover:text-accent-bright hover:border-border-soft'
} as const;

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;

export const BUTTON_SIZES = {
	'1': `text-[0.7rem] px-[0.7rem] py-[0.3rem] ${CONTROL_HEIGHTS['1']}`,
	'2': `text-[0.78rem] px-4 py-[0.45rem] ${CONTROL_HEIGHTS['2']}`,
	'3': `text-[0.88rem] px-[1.6rem] py-[0.65rem] ${CONTROL_HEIGHTS['3']}`
} as const;

export type ButtonSize = ControlSize;

/**
 * Lo que comparten los campos: el fondo apagado, el borde fino y el halo naranja
 * al enfocarlos. Es la contracara del botón, con la misma altura.
 */
export const FIELD_BASE =
	'w-full border border-border-soft bg-field text-text-strong ' +
	'transition-[border-color,box-shadow] placeholder:text-text-muted ' +
	'hover:border-border focus:border-accent focus:shadow-glow focus:outline-none';

/** Lo que comparten todos: la voz del HUD y el movimiento del sistema. */
export const BUTTON_BASE =
	'inline-flex items-center justify-center gap-2 font-display font-semibold ' +
	'tracking-label uppercase cursor-pointer whitespace-nowrap ' +
	'transition-[background-color,color,border-color,box-shadow] ' +
	'disabled:cursor-not-allowed';

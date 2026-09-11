/**
 * Las tres formas y los tres tamaños de un botón del HUD.
 *
 * Viven acá y no adentro del componente porque el enlace con forma de botón usa
 * exactamente las mismas clases: un `<a>` y un `<button>` tienen que verse
 * idénticos, y la única manera de garantizarlo es que compartan la fuente.
 */

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
	'1': 'text-[0.7rem] px-[0.7rem] py-[0.3rem] h-7',
	'2': 'text-[0.78rem] px-4 py-[0.45rem] h-[2.15rem]',
	'3': 'text-[0.88rem] px-[1.6rem] py-[0.65rem] h-11'
} as const;

export type ButtonSize = keyof typeof BUTTON_SIZES;

/** Lo que comparten todos: la voz del HUD y el movimiento del sistema. */
export const BUTTON_BASE =
	'inline-flex items-center justify-center gap-2 font-display font-semibold ' +
	'tracking-label uppercase cursor-pointer whitespace-nowrap ' +
	'transition-[background-color,color,border-color,box-shadow] ' +
	'disabled:cursor-not-allowed';

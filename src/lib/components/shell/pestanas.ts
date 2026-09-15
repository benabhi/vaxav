/**
 * El aspecto de una pestaña, en un solo lugar.
 *
 * Hay dos clases de pestaña en el juego y se ven igual a propósito: las que
 * **navegan** —cada una es una URL del módulo, y son enlaces— y las que
 * **cambian lo que se mira sin ir a ningún lado**, que son estado de pantalla y
 * por lo tanto botones. Dos componentes, un solo aspecto: si las clases
 * estuvieran copiadas en los dos, el día que cambie el naranja cambiaría en uno.
 *
 * Es el mismo reparto que ya usa `buttons/estilos.ts` con las alturas de los
 * controles.
 */

/**
 * Las clases de una pestaña.
 *
 * `active` la rellena de naranja con el texto casi negro —la regla de "lo
 * seleccionado se llena" que usa todo el proyecto— y `notice` le enciende el
 * borde de abajo cuando tiene algo sin leer.
 */
export function tabClasses(active: boolean, notice = false): string {
	return [
		'flex h-[2.25rem] shrink-0 cursor-pointer items-center border-b-[2px] border-b-transparent',
		'px-4 font-display text-[0.78rem] font-semibold tracking-label whitespace-nowrap uppercase',
		'no-underline transition-[background-color,color]',
		active
			? 'bg-accent text-on-accent shadow-glow'
			: 'bg-transparent text-accent-dim hover:bg-surface-hover hover:text-accent-bright',
		notice && !active ? 'aviso-abajo' : ''
	].join(' ');
}

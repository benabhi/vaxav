/**
 * Cómo se pinta cada peso de evento.
 *
 * Vive aparte y no dentro de un componente porque lo usan dos: la tabla del
 * registro y el resumen de la portada. Es el mismo patrón que `buttons/estilos.ts`.
 *
 * Los tres tonos son **el mismo naranja del HUD en tres intensidades**, salvo el
 * grave, que se va al rojo. No es alarmismo: grave quiere decir que algo dejó de
 * existir o que alguien recibió poder, y son exactamente las dos filas que uno
 * busca cuando abre un registro porque algo no cierra.
 */

import type { EventTone } from '$lib/events';

/** El color del ícono y de la marca lateral de la fila. */
export const TONE_COLOR: Readonly<Record<EventTone, string>> = {
	neutral: 'text-text-muted',
	notable: 'text-accent-bright',
	grave: 'text-danger'
};

/** El borde izquierdo, que es lo que se recorre con la vista en una lista larga. */
export const TONE_EDGE: Readonly<Record<EventTone, string>> = {
	neutral: 'border-l-border-soft',
	notable: 'border-l-accent',
	grave: 'border-l-danger'
};

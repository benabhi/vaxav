/**
 * El aviso de una sola lectura: lo que se le dice a alguien en la pantalla
 * siguiente.
 *
 * Hace falta porque las acciones que borran algo **terminan en otra pantalla**:
 * borrar un sistema manda al listado, y sin nada que lo diga el sistema
 * simplemente desaparece de la lista — quien lo borró no sabe si pasó por haberlo
 * apretado o porque estaba mirando mal.
 *
 * **Va en una cookie y no en la URL**, que fue el primer intento y estaba mal:
 * con el mensaje en la dirección, recargar vuelve a mostrar un aviso de algo que
 * pasó hace media hora y el enlace copiado le anuncia a otro un borrado que no
 * hizo. Limpiarlo del lado del navegador tampoco sirve: en una carga completa el
 * router todavía no arrancó y `replaceState` se niega.
 *
 * La cookie se **borra al leerla**, así que el aviso aparece exactamente una vez.
 * Y como todo pasa en el servidor, funciona sin JavaScript.
 */

import type { Cookies } from '@sveltejs/kit';

const FLASH_COOKIE = 'vaxav_aviso';

/**
 * Deja un aviso para la próxima pantalla.
 *
 * Se llama justo antes de redirigir. Dura un minuto: es un aviso, no un mensaje
 * — si algo sale mal y nadie lo lee, es preferible que se pierda a que aparezca
 * media hora después sin contexto.
 */
export function setFlash(cookies: Cookies, message: string): void {
	cookies.set(FLASH_COOKIE, message, {
		path: '/',
		maxAge: 60,
		httpOnly: true,
		sameSite: 'lax'
	});
}

/**
 * Lee el aviso y lo consume.
 *
 * Devuelve cadena vacía si no hay ninguno, que es lo que espera el componente que
 * lo dibuja: sin mensaje no ocupa lugar.
 */
export function takeFlash(cookies: Cookies): string {
	const mensaje = cookies.get(FLASH_COOKIE) ?? '';
	if (mensaje) cookies.delete(FLASH_COOKIE, { path: '/' });
	return mensaje;
}

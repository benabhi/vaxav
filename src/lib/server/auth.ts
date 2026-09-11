/**
 * La cookie de sesión: cómo se llama, cuánto dura y cómo se pone.
 *
 * Es `httpOnly`, así que el navegador la manda pero ningún script la lee: un
 * token que puede leerse desde JavaScript se puede robar con cualquier
 * inyección.
 */

import type { Cookies } from '@sveltejs/kit';
import { SESSION_DURATION_SECONDS } from './services/sessions';

export const SESSION_COOKIE = 'vaxav_session';

/** Deja la sesión abierta en este navegador. */
export function setSessionCookie(cookies: Cookies, token: string): void {
	cookies.set(SESSION_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		maxAge: SESSION_DURATION_SECONDS
	});
}

/** La borra del navegador. Cerrarla del lado del servidor es aparte. */
export function clearSessionCookie(cookies: Cookies): void {
	cookies.delete(SESSION_COOKIE, { path: '/' });
}

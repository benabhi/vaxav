/**
 * Salir: cierra la sesión del lado del servidor y limpia el navegador.
 *
 * Es un endpoint y no una acción de página porque no tiene pantalla propia: el
 * botón del Neocom lo llama desde cualquier lugar del juego.
 */

import { redirect, type RequestHandler } from '@sveltejs/kit';
import { clearSessionCookie } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { closeSession } from '$lib/server/services/sessions';
import { INDEX_ROUTE } from '$lib/routes';

export const POST: RequestHandler = async ({ cookies, locals }) => {
	if (locals.sessionToken) closeSession(db, locals.sessionToken);
	clearSessionCookie(cookies);
	redirect(303, INDEX_ROUTE);
};

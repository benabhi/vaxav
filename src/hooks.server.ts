/**
 * Quién está entrando, resuelto una sola vez por pedido.
 *
 * Cada pantalla necesita saber quién es el piloto, y preguntarlo en cada `load`
 * sería consultar la base varias veces por la misma página. Acá se resuelve una
 * vez y queda en `event.locals`.
 *
 * **Esto no protege nada por sí solo**: sólo averigua. Quién puede entrar a qué
 * lo decide el `+layout.server.ts` de cada grupo de rutas.
 */

import type { Handle } from '@sveltejs/kit';
import { SESSION_COOKIE } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { pilotForToken } from '$lib/server/services/sessions';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SESSION_COOKIE) ?? '';
	event.locals.sessionToken = token;
	event.locals.pilot = token ? pilotForToken(db, token) : null;
	return resolve(event);
};

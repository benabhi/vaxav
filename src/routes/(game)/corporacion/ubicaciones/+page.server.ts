/**
 * Pestaña Ubicaciones: dónde se encuentra a la corporación.
 *
 * Sólo lee. El recorte viaja en la URL, como en todo listado del proyecto: se
 * comparte, se vuelve con el botón de atrás y se recarga sin perderlo.
 */

import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { buildUbicaciones, readStationsQuery } from '$lib/server/views/stations';
import { LOGIN_ROUTE } from '$lib/routes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	// El guard del layout del grupo ya rechazó a quien no tiene sesión.
	if (!locals.pilot) redirect(303, LOGIN_ROUTE);
	return { ubicaciones: buildUbicaciones(db, locals.pilot, readStationsQuery(url.searchParams)) };
};

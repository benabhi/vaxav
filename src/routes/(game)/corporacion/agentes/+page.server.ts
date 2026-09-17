/**
 * Pestaña Agentes: quiénes reparten trabajo en nombre de la corporación.
 *
 * Sólo lee. Pedir una misión va a ser una acción de acá, pero las misiones no
 * existen todavía y la pantalla no las anuncia.
 *
 * El recorte viaja en la URL, como en todo listado del proyecto: se comparte, se
 * vuelve con el botón de atrás y se recarga sin perderlo.
 */

import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { buildAgentes, readAgentsQuery } from '$lib/server/views/agents';
import { LOGIN_ROUTE } from '$lib/routes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	// El guard del layout del grupo ya rechazó a quien no tiene sesión.
	if (!locals.pilot) redirect(303, LOGIN_ROUTE);
	return { agentes: buildAgentes(db, locals.pilot, readAgentsQuery(url.searchParams)) };
};

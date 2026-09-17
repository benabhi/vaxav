/**
 * Pestaña Reputación: la escalera con tu corporación y cómo llegaste ahí.
 *
 * Sólo lee. La reputación la mueven las misiones, que todavía no existen; acá no
 * hay ninguna acción que ofrecer y la pantalla no anuncia ninguna.
 *
 * La página del histórico viaja en la URL, como todo recorte del proyecto: se
 * comparte, se vuelve con el botón de atrás y se recarga sin perderla.
 */

import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { buildPaginaReputacion } from '$lib/server/views/reputation';
import { LOGIN_ROUTE } from '$lib/routes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	// El guard del layout del grupo ya rechazó a quien no tiene sesión.
	if (!locals.pilot) redirect(303, LOGIN_ROUTE);

	// El servicio vuelve a acotar la página, así que acá alcanza con no romperse
	// si llega cualquier cosa escrita a mano.
	const pagina = Number(url.searchParams.get('pagina') ?? '1');
	return { reputacion: buildPaginaReputacion(db, locals.pilot, pagina) };
};

/**
 * Pestaña Reputación del piloto: quién te conoce en el sector, y cuánto.
 *
 * Sólo lee. La reputación la mueven las misiones, que todavía no existen; acá no
 * hay ninguna acción que ofrecer y la pantalla no anuncia ninguna.
 *
 * **Cuál de las dos listas se está mirando viaja en la URL**, como todo recorte
 * del proyecto: así se comparte, se vuelve con el botón de atrás y se recarga sin
 * perderla. Y como se dibuja una sola por vez, las dos pueden usar los mismos
 * parámetros de búsqueda, orden y página sin pisarse: `lista` decide quién los
 * interpreta.
 */

import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { buildDirectorioAgentes, readSectorQuery } from '$lib/server/views/agents';
import { buildPanorama, readPanoramaQuery } from '$lib/server/views/reputation';
import { LOGIN_ROUTE } from '$lib/routes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	// El guard del layout del grupo ya rechazó a quien no tiene sesión.
	if (!locals.pilot) redirect(303, LOGIN_ROUTE);

	const lista = url.searchParams.get('lista') === 'agentes' ? 'agentes' : 'corporaciones';

	return {
		lista,
		// Las dos se arman siempre: la de banderas va arriba pase lo que pase, y las
		// cuentas de las dos solapas tienen que estar aunque se mire una sola.
		panorama: buildPanorama(db, locals.pilot, readPanoramaQuery(url.searchParams)),
		agentes: buildDirectorioAgentes(db, locals.pilot, readSectorQuery(url.searchParams))
	};
};

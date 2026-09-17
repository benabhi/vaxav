/**
 * Pestaña Galaxia: el mapa de la galaxia, visto desde la cabina.
 *
 * Los filtros viajan en la URL, como en todo el proyecto: un recorte se comparte,
 * se vuelve con el botón de atrás y se recarga sin perderlo. Mover la cámara y
 * elegir un sistema, en cambio, no pasan por acá: son estado de pantalla.
 *
 * **Desde el mapa no se salta.** Cruzar una puerta exige estar parado en ella, así
 * que lo único que esta pantalla ordena es **viajar hasta la puerta**, que es la
 * misma orden que da el árbol del sistema. El salto sigue ocurriendo en Ubicación,
 * que es donde uno está cuando llega.
 */

import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { ActionError, startTravel } from '$lib/server/services/actions';
import { getBody } from '$lib/server/services/universe';
import { buildGalaxia, readGalaxyQuery } from '$lib/server/views/navigation';
import { LOGIN_ROUTE } from '$lib/routes';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	// El guard del layout del grupo ya rechazó a quien no tiene sesión.
	if (!locals.pilot) redirect(303, LOGIN_ROUTE);
	return { galaxia: buildGalaxia(db, locals.pilot, readGalaxyQuery(url.searchParams)) };
};

export const actions: Actions = {
	/**
	 * Ordena viajar hasta una puerta del sistema donde está el piloto.
	 *
	 * Es el mismo servicio que usa el árbol del sistema, con el mismo destino: un
	 * cuerpo del sistema actual. La pantalla ya apaga el botón cuando hay una orden
	 * en curso, así que el error de acá es la red de seguridad y no el camino
	 * habitual.
	 */
	viajar: async ({ request, locals }) => {
		if (!locals.pilot) return fail(401, { error: 'Tu sesión venció. Volvé a entrar.' });

		const form = await request.formData();
		const destination = getBody(db, String(form.get('destino') ?? ''));
		if (destination === null) return fail(400, { error: 'Esa puerta no existe.' });

		try {
			startTravel(db, locals.pilot, destination);
		} catch (error) {
			if (error instanceof ActionError) return fail(400, { error: error.message });
			throw error;
		}

		return { ok: true };
	}
};

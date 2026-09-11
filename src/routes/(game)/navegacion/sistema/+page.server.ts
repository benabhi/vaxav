/**
 * Pestaña Sistema: el sistema actual y todos sus cuerpos.
 *
 * Plegar ramas no pasa por acá: es estado de interfaz y vive en el navegador.
 * Lo único que el servidor hace además de armar el árbol es aceptar la orden de
 * viajar.
 */

import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { ActionError, startTravel } from '$lib/server/services/actions';
import { getBody } from '$lib/server/services/universe';
import { buildSystemView } from '$lib/server/views/navigation';
import { LOGIN_ROUTE } from '$lib/routes';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// El guard del layout del grupo ya rechazó a quien no tiene sesión.
	if (!locals.pilot) redirect(303, LOGIN_ROUTE);
	return { system: buildSystemView(db, locals.pilot) };
};

export const actions: Actions = {
	/**
	 * Ordena viajar hasta un cuerpo.
	 *
	 * La pantalla ya bloquea el botón cuando falta algo —nave, o una orden en
	 * curso—, así que acá el error es la red de seguridad y no el camino
	 * habitual: quien llega igual es alguien que armó el pedido a mano.
	 */
	viajar: async ({ request, locals }) => {
		if (!locals.pilot) return fail(401, { error: 'Tu sesión venció. Volvé a entrar.' });

		const form = await request.formData();
		const destination = getBody(db, String(form.get('destino') ?? ''));
		if (destination === null) return fail(400, { error: 'Ese cuerpo no existe.' });

		try {
			startTravel(db, locals.pilot, destination);
		} catch (error) {
			if (error instanceof ActionError) return fail(400, { error: error.message });
			throw error;
		}

		return { ok: true };
	}
};

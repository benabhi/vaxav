/**
 * Pestaña Ubicación: el lugar exacto donde está el piloto, y qué se hace ahí.
 *
 * El layout del grupo ya trajo al piloto y resolvió la orden vencida, así que
 * acá sólo se arma la vista. El módulo elegido del mosaico no pasa por el
 * servidor: es estado de pantalla y vive en el navegador.
 *
 * **Minar se ordena desde acá y no desde el árbol del sistema.** El árbol dice
 * adónde ir; la ubicación dice qué hacer una vez que llegaste.
 */

import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { ActionError, startMining } from '$lib/server/services/actions';
import { buildLocationView } from '$lib/server/views/navigation';
import { LOGIN_ROUTE } from '$lib/routes';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// El guard del layout del grupo ya rechazó a quien no tiene sesión. Se repite
	// acá porque el compilador no puede saberlo, y un redirect dice mejor lo que
	// pasa que una aserción de que no es nulo.
	if (!locals.pilot) redirect(303, LOGIN_ROUTE);
	return { location: buildLocationView(db, locals.pilot) };
};

export const actions: Actions = {
	/**
	 * Encarga extraer un mineral en el cinturón donde está el piloto.
	 *
	 * El servicio revalida todo —que sea un cinturón, que la nave sirva, que haya
	 * qué sacar y dónde ponerlo—: la pantalla ya lo filtra, pero nadie más que el
	 * servicio escribe en la base.
	 */
	minar: async ({ request, locals }) => {
		if (!locals.pilot) return fail(401, { error: 'Tu sesión venció. Volvé a entrar.' });

		const form = await request.formData();
		const ore = String(form.get('mineral') ?? '');

		try {
			startMining(db, locals.pilot, ore);
		} catch (error) {
			if (error instanceof ActionError) return fail(400, { error: error.message });
			// Un código que no existe en el catálogo llega como Error a secas: es
			// alguien armando el pedido a mano, no un camino de la interfaz.
			if (error instanceof Error) return fail(400, { error: 'Ese mineral no existe.' });
			throw error;
		}
		return { ok: true };
	}
};

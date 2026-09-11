/**
 * Pestaña Habilidades: el árbol, y dónde se gasta el pozo.
 *
 * Es la pantalla donde se decide en qué se convierte el piloto, así que muestra
 * el catálogo entero —no sólo lo entrenado— y deja invertir desde acá.
 */

import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { PoolError, invest } from '$lib/server/services/pools';
import { buildSkillTree } from '$lib/server/views/skills';
import { LOGIN_ROUTE } from '$lib/routes';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// El guard del layout del grupo ya rechazó a quien no tiene sesión.
	if (!locals.pilot) redirect(303, LOGIN_ROUTE);
	return { tree: buildSkillTree(db, locals.pilot.id) };
};

export const actions: Actions = {
	/**
	 * Compra el nivel siguiente de una habilidad con el pozo de su rama.
	 *
	 * El servicio revalida adentro de la transacción: entre que la pantalla dibujó
	 * el botón y llegó este pedido, el pozo pudo gastarse en otra pestaña.
	 */
	invertir: async ({ request, locals }) => {
		if (!locals.pilot) return fail(401, { error: 'Tu sesión venció. Volvé a entrar.' });

		const form = await request.formData();
		const code = String(form.get('habilidad') ?? '');

		try {
			const resultado = invest(db, locals.pilot.id, code);
			return { invested: code, level: resultado.level };
		} catch (error) {
			if (error instanceof PoolError) return fail(400, { error: error.message });
			// Un código que no existe en el catálogo llega como Error a secas: es
			// alguien armando el pedido a mano, no un camino de la interfaz.
			if (error instanceof Error) return fail(400, { error: 'Esa habilidad no existe.' });
			throw error;
		}
	}
};

/**
 * Pestaña Corporación: a quién le rinde cuentas el piloto.
 *
 * Dos acciones, y son las dos caras de la misma decisión: **alistarse** cuando no
 * se responde a nadie y **renunciar** cuando sí. Cobrar de la billetera compartida
 * y aceptar contratos van a ser acciones de acá, pero ninguna existe todavía y la
 * pantalla no las anuncia.
 */

import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import {
	CorporationError,
	joinCorporation,
	leaveCorporation
} from '$lib/server/services/corporations';
import { buildCorporacion } from '$lib/server/views/corporation';
import { LOGIN_ROUTE } from '$lib/routes';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// El guard del layout del grupo ya rechazó a quien no tiene sesión.
	if (!locals.pilot) redirect(303, LOGIN_ROUTE);

	// **Acá siempre la propia.** Mirar la de otro se hace en una ventana y no en
	// esta pantalla: puesta acá, con el Neocom marcando «Corporación» y las
	// pestañas de uno al lado, una corporación ajena se lee como si fuera la tuya.
	// Ver `/fichas/corporacion`.
	return {
		corporacion: buildCorporacion(db, locals.pilot),
		// La bandera del piloto, para ofrecerle las suyas cuando está sin corporación.
		// Sale de acá y no de la vista porque es del piloto y no de la corporación:
		// un independiente no tiene una de la cual sacarla.
		faction: locals.pilot.faction
	};
};

export const actions: Actions = {
	/** Se alista en una del catálogo. Las del mundo aceptan siempre. */
	unirse: async ({ request, locals }) => {
		if (!locals.pilot) return fail(401, { error: 'Tu sesión venció. Volvé a entrar.' });

		const form = await request.formData();
		const code = String(form.get('corporacion') ?? '');

		try {
			joinCorporation(db, locals.pilot, code);
		} catch (error) {
			if (error instanceof CorporationError) return fail(400, { error: error.message });
			throw error;
		}

		return { done: 'Ya respondés a tu nueva corporación.' };
	},

	/** Renuncia y vuelve a volar por su cuenta. */
	renunciar: async ({ locals }) => {
		if (!locals.pilot) return fail(401, { error: 'Tu sesión venció. Volvé a entrar.' });

		try {
			leaveCorporation(db, locals.pilot);
		} catch (error) {
			if (error instanceof CorporationError) return fail(400, { error: error.message });
			throw error;
		}

		return { done: 'Renunciaste. Volás por tu cuenta.' };
	}
};

/**
 * Pestaña Cuenta: lo que no se puede deshacer.
 *
 * Hoy tiene una sola cosa y es la más pesada del juego: borrar la cuenta. Vive
 * en su propia pestaña justamente por eso —nadie llega acá de rebote mientras
 * cambia una contraseña— y el servicio pide la contraseña antes de tocar nada.
 */

import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { PilotError, deleteAccount } from '$lib/server/services/pilots';
import { clearSessionCookie } from '$lib/server/auth';
import { LOGIN_ROUTE } from '$lib/routes';
import type { Actions } from './$types';

export const actions: Actions = {
	/**
	 * Borra la cuenta y todo lo que colgaba de ella.
	 *
	 * Pide **dos cosas distintas**, y cada una frena algo distinto: el distintivo
	 * escrito a mano frena al dedo apurado, y la contraseña frena a quien se sentó
	 * en una sesión ajena. Una sola de las dos dejaría una de las dos puertas
	 * abierta.
	 *
	 * La sesión se vuelve a mirar acá aunque el layout del grupo ya tenga su guard:
	 * una acción corre **antes** que los `load`, así que es este chequeo y no aquél
	 * el que atrapa a quien envía el formulario con la sesión vencida.
	 */
	default: async ({ request, locals, cookies }) => {
		if (!locals.pilot) return fail(401, { error: 'Tu sesión venció. Volvé a entrar.' });

		const form = await request.formData();
		const confirmacion = String(form.get('callsign') ?? '').trim();
		const password = String(form.get('password') ?? '');

		if (confirmacion !== locals.pilot.callsign) {
			return fail(400, { error: 'Escribí tu distintivo exactamente como es.' });
		}

		try {
			await deleteAccount(db, locals.pilot, password);
		} catch (error) {
			if (error instanceof PilotError) return fail(400, { error: error.message });
			throw error;
		}

		// La fila de la sesión se fue con el resto de la cuenta; lo que queda es la
		// galleta en el navegador, y dejarla sería mandar a alguien a una sesión que
		// apunta a un piloto que ya no existe.
		clearSessionCookie(cookies);

		redirect(303, LOGIN_ROUTE);
	}
};

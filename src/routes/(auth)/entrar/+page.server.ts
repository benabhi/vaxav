/** Ingreso de un piloto ya registrado. */

import { fail, redirect } from '@sveltejs/kit';
import { setSessionCookie } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { authenticate } from '$lib/server/services/pilots';
import { blockedBy, blockedMessage } from '$lib/server/services/moderation';
import { openSession } from '$lib/server/services/sessions';
import { HOME_ROUTE } from '$lib/routes';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const callsign = String(form.get('callsign') ?? '').trim();
		const password = String(form.get('password') ?? '');

		const pilot = await authenticate(db, callsign, password);
		if (!pilot) {
			// El mismo mensaje para los dos casos: decir cuál falló contaría qué
			// distintivos existen.
			return fail(400, {
				callsign,
				error: 'El distintivo o la contraseña no coinciden.'
			});
		}

		// La contraseña estaba bien, así que se le puede decir la verdad: no es una
		// pista sobre qué cuentas existen, es su propia cuenta.
		const sancion = blockedBy(db, pilot.id);
		if (sancion) return fail(403, { callsign, error: blockedMessage(sancion) });

		setSessionCookie(cookies, openSession(db, pilot.id));
		redirect(303, HOME_ROUTE);
	}
};

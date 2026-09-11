/** Ingreso de un piloto ya registrado. */

import { fail, redirect } from '@sveltejs/kit';
import { setSessionCookie } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { authenticate } from '$lib/server/services/pilots';
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

		setSessionCookie(cookies, openSession(db, pilot.id));
		redirect(303, HOME_ROUTE);
	}
};

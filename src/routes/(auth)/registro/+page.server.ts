/**
 * Alta de piloto, paso a paso.
 *
 * Los pasos son estado del navegador —elegir un oficio no es una escritura— así
 * que el servidor sólo interviene dos veces: para validar la cuenta, que exige
 * mirar la base, y para crear el piloto.
 */

import { fail, redirect } from '@sveltejs/kit';
import { setSessionCookie } from '$lib/server/auth';
import { db } from '$lib/server/db';
import {
	CALLSIGN_MAX_LENGTH,
	CALLSIGN_MIN_LENGTH,
	PASSWORD_MIN_LENGTH,
	PilotError,
	callsignTaken,
	countByFaction,
	createPilot,
	emailTaken,
	validateCredentials
} from '$lib/server/services/pilots';
import { openSession } from '$lib/server/services/sessions';
import { HOME_ROUTE } from '$lib/routes';
import type { Actions, PageServerLoad } from './$types';

/** Los datos de la cuenta, tal como los manda cualquiera de las dos acciones. */
function readAccount(form: FormData) {
	return {
		callsign: String(form.get('callsign') ?? '').trim(),
		email: String(form.get('email') ?? '').trim(),
		password: String(form.get('password') ?? ''),
		confirmation: String(form.get('password_confirmation') ?? '')
	};
}

/**
 * Lo que el alta necesita saber antes de empezar.
 *
 * Los pilotos por facción son un dato del mundo, no del formulario: sirven para
 * que la elección no sea a ciegas. Los límites del distintivo y la contraseña
 * viajan con la carga porque las reglas de validación viven bajo `$lib/server`,
 * que el navegador no puede importar, y la pantalla los necesita para escribir
 * sus aclaraciones sin repetir los números a mano.
 */
export const load: PageServerLoad = async () => ({
	factionPilots: countByFaction(db),
	limits: {
		callsignMin: CALLSIGN_MIN_LENGTH,
		callsignMax: CALLSIGN_MAX_LENGTH,
		passwordMin: PASSWORD_MIN_LENGTH
	}
});

export const actions: Actions = {
	/**
	 * Valida el paso de la cuenta, incluida la disponibilidad.
	 *
	 * Se consulta la base acá y no recién al crear el piloto: enterarse de que el
	 * distintivo estaba ocupado después de haber elegido oficio y origen sería
	 * hacerle perder el tiempo al jugador.
	 */
	verificar: async ({ request }) => {
		const { callsign, email, password, confirmation } = readAccount(await request.formData());

		const problem = validateCredentials(callsign, email, password, confirmation);
		if (problem) return fail(400, { error: problem });

		if (callsignTaken(db, callsign)) {
			return fail(400, { error: `Ya hay un piloto llamado ${callsign}.` });
		}
		if (emailTaken(db, email)) {
			return fail(400, { error: 'Ese correo ya está usado por otro piloto.' });
		}

		return { ok: true };
	},

	/** Crea el piloto y lo deja adentro, sin pedirle que vuelva a escribir todo. */
	crear: async ({ request, cookies }) => {
		const form = await request.formData();
		const { callsign, email, password } = readAccount(form);
		const profession = String(form.get('profession') ?? '');
		const faction = String(form.get('faction') ?? '');

		try {
			const pilot = await createPilot(db, callsign, email, password, profession, faction);
			setSessionCookie(cookies, openSession(db, pilot.id));
		} catch (error) {
			if (error instanceof PilotError) return fail(400, { error: error.message });
			throw error;
		}

		// Fuera del `try`: la redirección de SvelteKit se lanza como excepción y el
		// `catch` de arriba se la comería.
		redirect(303, HOME_ROUTE);
	}
};

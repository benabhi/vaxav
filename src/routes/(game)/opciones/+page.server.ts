/**
 * Módulo Opciones: la cuenta del piloto, aparte del juego en sí.
 *
 * No cuelga del Neocom junto a Piloto/Nave/etc. —vive entre "Plegar" y "Salir",
 * más cerca de la salida que del juego— pero es una pantalla más: exige sesión y
 * se registra igual que cualquier otra.
 *
 * Lo que se puede hacer acá es de la cuenta: la foto, la contraseña, quién puede
 * mirar tu ficha y darse de baja. Van en **una sola pestaña** justamente por eso;
 * partirlas sería inventar categorías donde hay una. Las pestañas llegan el día
 * que haya opciones que no sean de la cuenta —interfaz, avisos— y entonces cada
 * una va a estar nombrando algo distinto de verdad.
 */

import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import {
	PilotError,
	changePassword,
	deleteAccount,
	setProfilePrivacy
} from '$lib/server/services/pilots';
import { clearSessionCookie } from '$lib/server/auth';
import { LOGIN_ROUTE } from '$lib/routes';
import type { Actions } from './$types';

export const actions: Actions = {
	/**
	 * Valida y aplica el cambio de contraseña del piloto conectado.
	 *
	 * La sesión se vuelve a mirar acá aunque el layout del grupo ya tenga su
	 * guard: una acción corre **antes** que los `load`, así que es este chequeo y
	 * no aquél el que atrapa a quien envía el formulario con la sesión vencida.
	 */
	contrasena: async ({ request, locals }) => {
		if (!locals.pilot) return fail(401, { scope: 'password', error: 'Tu sesión venció.' });

		const form = await request.formData();
		const currentPassword = String(form.get('current_password') ?? '');
		const newPassword = String(form.get('new_password') ?? '');
		const confirmation = String(form.get('new_password_confirmation') ?? '');

		try {
			await changePassword(db, locals.pilot, currentPassword, newPassword, confirmation);
		} catch (error) {
			if (error instanceof PilotError)
				return fail(400, { scope: 'password', error: error.message });
			throw error;
		}

		return { scope: 'password', success: 'Contraseña actualizada.' };
	},

	/**
	 * Abre o cierra la ficha del piloto.
	 *
	 * Un form action y no un interruptor que guarda solo: cambia la partida —quién
	 * puede verte— y lo que cambia la partida va al servidor, que es la regla del
	 * proyecto. El valor llega como el estado que se quiere dejar y no como «dar
	 * vuelta lo que haya»: dos clics apurados en dos pestañas abiertas no pueden
	 * terminar en lo contrario de lo que se apretó.
	 */
	ficha: async ({ request, locals }) => {
		if (!locals.pilot) return fail(401, { scope: 'privacy', error: 'Tu sesión venció.' });

		const form = await request.formData();
		const cerrada = String(form.get('cerrada') ?? '') === '1';
		setProfilePrivacy(db, locals.pilot, cerrada);

		return {
			scope: 'privacy',
			success: cerrada
				? 'Tu ficha queda cerrada: los demás ven sólo tu distintivo.'
				: 'Tu ficha queda abierta.'
		};
	},

	/**
	 * Borra la cuenta y todo lo que colgaba de ella.
	 *
	 * Pide **dos cosas distintas**, y cada una frena algo distinto: el distintivo
	 * escrito a mano frena al dedo apurado, y la contraseña frena a quien se sentó
	 * en una sesión ajena. Una sola de las dos dejaría una de las dos puertas
	 * abierta.
	 */
	eliminar: async ({ request, locals, cookies }) => {
		if (!locals.pilot) return fail(401, { scope: 'delete', error: 'Tu sesión venció.' });

		const form = await request.formData();
		const confirmacion = String(form.get('callsign') ?? '').trim();
		const password = String(form.get('password') ?? '');

		if (confirmacion !== locals.pilot.callsign) {
			return fail(400, { scope: 'delete', error: 'Escribí tu distintivo exactamente como es.' });
		}

		try {
			await deleteAccount(db, locals.pilot, password);
		} catch (error) {
			if (error instanceof PilotError) return fail(400, { scope: 'delete', error: error.message });
			throw error;
		}

		// La fila de la sesión se fue con el resto de la cuenta; lo que queda es la
		// galleta en el navegador, y dejarla sería mandar a alguien a una sesión que
		// apunta a un piloto que ya no existe.
		clearSessionCookie(cookies);

		redirect(303, LOGIN_ROUTE);
	}
};

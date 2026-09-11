/**
 * Módulo Opciones: la cuenta del piloto, aparte del juego en sí.
 *
 * No cuelga del Neocom junto a Piloto/Nave/etc. —vive entre "Plegar" y "Salir",
 * más cerca de la salida que del juego— pero es una pantalla más: exige sesión y
 * se registra igual que cualquier otra.
 */

import { fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { PilotError, changePassword } from '$lib/server/services/pilots';
import type { Actions } from './$types';

export const actions: Actions = {
	/**
	 * Valida y aplica el cambio de contraseña del piloto conectado.
	 *
	 * La sesión se vuelve a mirar acá aunque el layout del grupo ya tenga su
	 * guard: una acción corre **antes** que los `load`, así que es este chequeo y
	 * no aquél el que atrapa a quien envía el formulario con la sesión vencida.
	 */
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const currentPassword = String(form.get('current_password') ?? '');
		const newPassword = String(form.get('new_password') ?? '');
		const confirmation = String(form.get('new_password_confirmation') ?? '');

		if (!locals.pilot) return fail(401, { error: 'Tu sesión venció. Volvé a entrar.' });

		try {
			await changePassword(db, locals.pilot, currentPassword, newPassword, confirmation);
		} catch (error) {
			if (error instanceof PilotError) return fail(400, { error: error.message });
			throw error;
		}

		return { success: 'Contraseña actualizada.' };
	}
};

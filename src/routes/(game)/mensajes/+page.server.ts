/**
 * Pestaña Recibidos: lo que te escribieron.
 *
 * **Y la única que manda**, venga el formulario de la bandeja que venga: el envío
 * es uno solo y tener la misma acción escrita dos veces es tener dos que un día
 * validan distinto. Al salir bien lleva a Enviados, que es lo primero que uno
 * quiere ver después de mandar algo.
 *
 * La página y el mensaje abierto viajan en la URL, como todo recorte del
 * proyecto: se comparten, se vuelven con el botón de atrás y se recargan sin
 * perderse.
 */

import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { MessageError, sendMessage } from '$lib/server/services/messages';
import { buildBandeja } from '$lib/server/views/messages';
import { LOGIN_ROUTE } from '$lib/routes';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	// El guard del layout del grupo ya rechazó a quien no tiene sesión.
	if (!locals.pilot) redirect(303, LOGIN_ROUTE);

	// El servicio vuelve a acotar la página, así que acá alcanza con no romperse
	// si llega cualquier cosa escrita a mano.
	const pagina = Number(url.searchParams.get('pagina') ?? '1');
	const abierto = Number(url.searchParams.get('m') ?? '0');

	return { bandeja: buildBandeja(db, locals.pilot, 'recibidos', pagina, abierto) };
};

export const actions: Actions = {
	/** Manda un mensaje a otro piloto, por su distintivo. */
	enviar: async ({ request, locals }) => {
		if (!locals.pilot) return fail(401, { error: 'Tu sesión venció. Volvé a entrar.' });

		const form = await request.formData();
		const para = String(form.get('para') ?? '');
		const asunto = String(form.get('asunto') ?? '');
		const cuerpo = String(form.get('cuerpo') ?? '');

		try {
			sendMessage(db, locals.pilot, para, asunto, cuerpo);
		} catch (error) {
			if (error instanceof MessageError) return fail(400, { error: error.message });
			throw error;
		}

		redirect(303, '/mensajes/enviados');
	}
};

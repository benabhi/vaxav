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
import { MessageError, sendMessage, setArchived } from '$lib/server/services/messages';
import { buildBandeja } from '$lib/server/views/messages';
import { LOGIN_ROUTE } from '$lib/routes';
import type { Actions, PageServerLoad } from './$types';

/** Las únicas vueltas posibles después de archivar. Ver la acción de abajo. */
const BANDEJAS = ['/mensajes', '/mensajes/enviados', '/mensajes/archivados'];

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
	},

	/**
	 * Guarda un mensaje en archivados, o lo devuelve a su bandeja.
	 *
	 * Vive acá y no en cada bandeja por lo mismo que el envío: es una sola acción,
	 * y tenerla escrita tres veces es tener tres que un día validan distinto.
	 */
	archivar: async ({ request, locals }) => {
		if (!locals.pilot) return fail(401, { error: 'Tu sesión venció. Volvé a entrar.' });

		const form = await request.formData();
		const id = Number(form.get('mensaje') ?? '0');
		const guardar = form.get('guardar') === '1';

		try {
			setArchived(db, locals.pilot.id, id, guardar);
		} catch (error) {
			if (error instanceof MessageError) return fail(400, { error: error.message });
			throw error;
		}

		// **Se vuelve a la bandeja de la que vino, y sólo a una de las tres.** El
		// destino llega del formulario, y un destino que llega de afuera se elige de
		// una lista o no se elige: si no, cualquiera arma un enlace que manda a otro
		// lado con la sesión puesta.
		const vuelta = String(form.get('volver') ?? '');
		redirect(303, BANDEJAS.includes(vuelta) ? vuelta : '/mensajes');
	}
};

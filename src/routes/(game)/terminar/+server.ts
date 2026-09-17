/**
 * Terminar la orden en curso al instante. **Herramienta de pruebas.**
 *
 * Existe para poder mirar pantallas sin esperar diez minutos a que llegue una
 * nave, y por eso pide su propia llave —`pilots.rush`— en vez de colarse con la
 * de editar pilotos: es una capacidad distinta, saltea el reloj del juego, y un
 * permiso que hace dos cosas es uno que nadie puede dar a medias.
 *
 * **No resuelve nada por su cuenta.** Le corre el arranque hacia atrás a la
 * orden y deja que la resuelva el camino de siempre, que corre en `hooks` antes
 * de cada `load`. Así el resultado es idéntico al de haber esperado: el mismo
 * informe salta en la pantalla siguiente, con la misma experiencia y el mismo
 * movimiento. Un segundo camino para terminar una acción sería un segundo
 * camino que mantener, y el día que se desfasen el que miente es el de pruebas.
 *
 * Es un `+server.ts` y no un form action porque el botón vive en la barra de
 * estado, que está en el layout: tiene que poder dispararse desde cualquier
 * pantalla del juego, y un layout no puede declarar acciones.
 */

import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { rushAction } from '$lib/server/services/actions';
import { record } from '$lib/server/services/events';
import { actionLabel } from '$lib/format';
import { LOGIN_ROUTE } from '$lib/routes';
import type { RequestHandler } from './$types';

/** La llave que abre esto, y la única. */
const LLAVE = 'pilots.rush';

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.pilot) redirect(303, LOGIN_ROUTE);

	// **404 y no 403**, igual que el cuartel: un 403 confirma que la herramienta
	// existe, y a quien prueba URL a ver qué encuentra no hay por qué contestarle
	// esa pregunta.
	if (!locals.permissions.has(LLAVE)) error(404, 'No existe esa página.');

	const vencida = rushAction(db, locals.pilot);

	// Queda constancia. Es una llave peligrosa —saltea el tiempo, que es la moneda
	// de este juego— y lo que se hace con ella tiene que poder leerse después.
	if (vencida) {
		record(db, {
			kind: 'account.rushed',
			actorId: locals.pilot.id,
			subject: { kind: 'pilot', id: locals.pilot.id },
			payload: { callsign: locals.pilot.callsign, action: actionLabel(vencida.kind) }
		});
	}

	// Se vuelve a donde se estaba, y **sólo adentro del sitio**: el destino llega
	// del formulario, y un destino que llega de afuera se acota o no se usa.
	const form = await request.formData();
	const volver = String(form.get('volver') ?? '');
	const destino = volver.startsWith('/') && !volver.startsWith('//') ? volver : '/navegacion';
	redirect(303, destino);
};

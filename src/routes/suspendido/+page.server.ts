/**
 * La pantalla del piloto con la puerta cerrada.
 *
 * Vive fuera del grupo `(game)` a propósito: ese layout rebota a acá, así que
 * ponerla adentro sería un bucle. Y no es un error del ingreso porque la sanción
 * puede caerle con la sesión ya abierta —el hook la resuelve en cada pedido— y
 * porque hay tres cosas que decirle que no entran en una línea roja.
 *
 * **Sin sanción no hay nada que mostrar**: si venció mientras miraba, se lo
 * devuelve al juego.
 */

import { redirect } from '@sveltejs/kit';
import { blockedMessage } from '$lib/server/services/moderation';
import { sanctionLabel } from '$lib/sanctions';
import { HOME_ROUTE, LOGIN_ROUTE } from '$lib/routes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (!locals.pilot) redirect(303, LOGIN_ROUTE);
	if (!locals.sanction) redirect(303, HOME_ROUTE);

	const fila = locals.sanction;

	return {
		callsign: locals.pilot.callsign,
		kind: sanctionLabel(fila.kind),
		reason: fila.reason,
		message: blockedMessage(fila),
		// En milisegundos, como todo instante que viaja a la pantalla.
		until: fila.until ? fila.until.getTime() : null,
		since: fila.createdAt.getTime()
	};
};

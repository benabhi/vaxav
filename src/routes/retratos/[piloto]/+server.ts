/**
 * Sirve el retrato de un piloto.
 *
 * Existe porque los retratos viven en `data/` y no en `static/`: son estado de la
 * partida —los sube el jugador y tienen que sobrevivir a un despliegue— y por eso
 * SvelteKit no los sirve solo.
 *
 * **Es público a propósito.** Un retrato es lo que los demás pilotos van a ver de
 * vos en un libro de órdenes, en una corporación o en un chat: esconderlo detrás
 * de la sesión sería esconderlo de todo el juego. Lo que no es público es
 * cambiarlo, y de eso se encarga la otra ruta.
 */

import { error } from '@sveltejs/kit';
import { readPortrait } from '$lib/server/services/portraits';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const pilotId = Number(params.piloto);
	if (!Number.isInteger(pilotId) || pilotId <= 0) error(404, 'No existe ese retrato');

	const retrato = readPortrait(pilotId);
	if (!retrato) error(404, 'Ese piloto no tiene retrato');

	return new Response(new Uint8Array(retrato.bytes), {
		headers: {
			'content-type': retrato.type,
			'content-length': String(retrato.bytes.length),
			// Un año, porque la URL lleva la marca de tiempo de la subida: cambiar el
			// retrato cambia la URL, así que nunca hay que invalidar ésta.
			'cache-control': 'public, max-age=31536000, immutable'
		}
	});
};

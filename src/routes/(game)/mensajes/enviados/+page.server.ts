/**
 * Pestaña Enviados: copia de lo que mandaste.
 *
 * Sólo lee. El envío vive en la otra pestaña y no acá, porque es uno solo: ver
 * `/mensajes`.
 */

import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { buildBandeja } from '$lib/server/views/messages';
import { LOGIN_ROUTE } from '$lib/routes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.pilot) redirect(303, LOGIN_ROUTE);

	const pagina = Number(url.searchParams.get('pagina') ?? '1');
	const abierto = Number(url.searchParams.get('m') ?? '0');

	return { bandeja: buildBandeja(db, locals.pilot, 'enviados', pagina, abierto) };
};

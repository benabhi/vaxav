/**
 * Pestaña Archivados: lo que guardaste, venga del lado que venga.
 *
 * **Un solo archivo para los dos lados.** Quien busca algo viejo no se acuerda de
 * si lo escribió o se lo escribieron; se acuerda de con quién fue.
 *
 * Sólo lee. Archivar y devolver viven en `/mensajes`, con el envío, porque son
 * una sola acción y tenerla escrita tres veces es tener tres que un día validan
 * distinto.
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

	return { bandeja: buildBandeja(db, locals.pilot, 'archivados', pagina, abierto) };
};

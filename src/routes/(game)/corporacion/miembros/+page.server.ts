/**
 * Pestaña Miembros: quiénes son los otros.
 *
 * Sólo lee. Invitar, echar y repartir roles van a ser acciones de acá el día que
 * existan las corporaciones de jugadores; en una del mundo no hay nada que tocar.
 */

import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { buildMiembros, readMembersQuery } from '$lib/server/views/members';
import { LOGIN_ROUTE } from '$lib/routes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!locals.pilot) redirect(303, LOGIN_ROUTE);
	return { miembros: buildMiembros(db, locals.pilot, readMembersQuery(url.searchParams)) };
};

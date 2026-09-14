/** Pestaña Bodega: qué llevás y cuánto lugar queda. */

import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { buildCargoView } from '$lib/server/views/cargo';
import { LOGIN_ROUTE } from '$lib/routes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// El guard del layout del grupo ya rechazó a quien no tiene sesión.
	if (!locals.pilot) redirect(303, LOGIN_ROUTE);
	return { bodega: buildCargoView(db, locals.pilot) };
};

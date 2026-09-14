/** Pantalla Billetera: el saldo y el libro que lo explica. */

import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { buildWalletView } from '$lib/server/views/wallet';
import { LOGIN_ROUTE } from '$lib/routes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.pilot) redirect(303, LOGIN_ROUTE);
	return { billetera: buildWalletView(db, locals.pilot) };
};

/**
 * Propiedades: qué tiene el piloto y **dónde**.
 *
 * Existe porque el mercado dejó de teletransportar lo comprado: una orden entrega
 * en su propia estación, así que las cosas de uno terminan repartidas por la
 * galaxia. Sin esta pantalla, comprar lejos sería una forma elegante de perder la
 * compra.
 */

import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { buildAssetsView } from '$lib/server/views/assets';
import { LOGIN_ROUTE } from '$lib/routes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.pilot) redirect(303, LOGIN_ROUTE);
	return { assets: buildAssetsView(db, locals.pilot) };
};

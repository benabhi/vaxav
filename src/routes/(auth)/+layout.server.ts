/**
 * Quien ya entró no tiene nada que hacer en ingreso ni en alta.
 *
 * El guard vive en el layout del grupo y no en cada página: agregar una pantalla
 * pública nueva no debería obligar a acordarse de protegerla.
 */

import { redirect } from '@sveltejs/kit';
import { HOME_ROUTE } from '$lib/routes';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (locals.pilot) redirect(303, HOME_ROUTE);
	return {};
};

/**
 * Pestaña Ubicación: el lugar exacto donde está el piloto.
 *
 * El layout del grupo ya trajo al piloto y resolvió la orden vencida, así que
 * acá sólo se arma la vista. El módulo elegido del mosaico no pasa por el
 * servidor: es estado de pantalla y vive en el navegador.
 */

import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { buildLocationView } from '$lib/server/views/navigation';
import { LOGIN_ROUTE } from '$lib/routes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// El guard del layout del grupo ya rechazó a quien no tiene sesión. Se repite
	// acá porque el compilador no puede saberlo, y un redirect dice mejor lo que
	// pasa que una aserción de que no es nulo.
	if (!locals.pilot) redirect(303, LOGIN_ROUTE);
	return { location: buildLocationView(db, locals.pilot) };
};

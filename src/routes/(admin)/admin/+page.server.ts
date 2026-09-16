/**
 * La portada del cuartel.
 *
 * El guardia del layout ya decidió que se puede entrar; acá sólo se arma lo que
 * se muestra, y qué partes se muestran lo sigue decidiendo qué llaves tiene.
 */

import { db } from '$lib/server/db';
import { buildCuartel } from '$lib/server/views/admin';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	// El layout garantiza que hay piloto: sin él ya habría redirigido a entrar.
	const pilot = locals.pilot!;

	return { cuartel: buildCuartel(db, pilot.id, locals.permissions) };
};

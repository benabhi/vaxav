/**
 * Pestaña Información: el resumen del piloto.
 *
 * El layout ya trae al piloto entero; lo único que hace falta acá es lo último
 * que le pasó, que es lo que un resumen tiene que contestar sin hacer navegar a
 * ningún lado.
 */

import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { logPage } from '$lib/server/services/log';
import { buildLogPage } from '$lib/server/views/log';
import { LOGIN_ROUTE } from '$lib/routes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// El guard del layout del grupo ya rechazó a quien no tiene sesión.
	if (!locals.pilot) redirect(303, LOGIN_ROUTE);

	// Uno solo: es un resumen, y el archivo entero está en la bitácora.
	const ultima = buildLogPage(db, locals.pilot.id, logPage(db, locals.pilot.id, 1, 1));

	return {
		lastReport: ultima.entries[0] ?? null,
		logTotal: ultima.total,
		// El número impreso en la credencial. Sale del id de la cuenta y no de un
		// campo nuevo: ya es único y ya es el que identifica al piloto en todo el
		// resto del juego; inventar un segundo número sería tener dos verdades.
		serial: `VX-${String(locals.pilot.id).padStart(6, '0')}`
	};
};

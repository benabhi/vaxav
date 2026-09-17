/**
 * Pestaña Corporación: a quién le rinde cuentas el piloto.
 *
 * Sólo lee. Renunciar, cobrar de la billetera compartida y aceptar contratos van a
 * ser acciones de acá, pero ninguna existe todavía y la pantalla no las anuncia.
 */

import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { buildCorporacion } from '$lib/server/views/corporation';
import { LOGIN_ROUTE } from '$lib/routes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// El guard del layout del grupo ya rechazó a quien no tiene sesión.
	if (!locals.pilot) redirect(303, LOGIN_ROUTE);
	return { corporacion: buildCorporacion(db, locals.pilot) };
};

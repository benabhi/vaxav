/**
 * Pestaña Bitácora: el registro de todo lo que el piloto resolvió.
 *
 * Abrirla **es leerla**: entrar ya apaga la notificación del Neocom. La
 * alternativa —marcar leído informe por informe— obligaría al jugador a paginar
 * hasta el final para apagar un aviso que ya entendió al entrar.
 */

import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { markRead } from '$lib/server/services/log';
import { buildBitacora } from '$lib/server/views/log';
import { LOGIN_ROUTE } from '$lib/routes';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	// El guard del layout del grupo ya rechazó a quien no tiene sesión.
	if (!locals.pilot) redirect(303, LOGIN_ROUTE);

	// Se arma la página **antes** de marcar leído: así los informes nuevos se ven
	// encendidos esta vez, que es la única en que importa distinguirlos.
	const bitacora = buildBitacora(db, locals.pilot.id, Number(url.searchParams.get('pagina') ?? 1));
	markRead(db, locals.pilot.id);

	return { bitacora };
};

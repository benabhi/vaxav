/**
 * Lo que necesita toda pantalla del juego, resuelto una sola vez.
 *
 * Tres cosas pasan acá, en este orden:
 *
 * 1. **El guard.** Sin sesión no se entra. Vive en el layout del grupo y no en
 *    cada página: agregar una pantalla nueva no debería obligar a acordarse de
 *    protegerla, y la protección tiene que estar en el servidor y no en que el
 *    Neocom no muestre el enlace.
 * 2. **La resolución perezosa.** Si la orden en curso ya venció, se aplica antes
 *    de dibujar nada. No hay ningún proceso de fondo: lo que resuelve una acción
 *    es que alguien la mire.
 * 3. **El piloto y la orden**, que son lo que dibujan el Neocom y la barra de
 *    estado en todas las pantallas.
 */

import { redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { pilot as pilotTable } from '$lib/server/db/schema';
import { currentAction, resolveIfDue } from '$lib/server/services/actions';
import { getBodyById } from '$lib/server/services/universe';
import { buildPilotView } from '$lib/server/views/pilot';
import { moduleForRoute, tabForRoute } from '$lib/navigation';
import { LOGIN_ROUTE } from '$lib/routes';
import type { AccionEnCurso } from '$lib/tipos';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const pilot = locals.pilot;
	if (!pilot) redirect(303, LOGIN_ROUTE);

	// Se resuelve antes de leer nada más: si el viaje terminó, el piloto ya está
	// en su destino cuando la pantalla se dibuja. Y como resolverlo lo movió, la
	// fila que trajo el hook quedó vieja: hay que releerla.
	const llegada = resolveIfDue(db, pilot);
	const actual = llegada
		? (db.select().from(pilotTable).where(eq(pilotTable.id, pilot.id)).get() ?? pilot)
		: pilot;

	const pending = currentAction(db, actual.id);
	const action: AccionEnCurso | null = pending
		? {
				kind: pending.kind,
				label: 'Viajando',
				icon: 'rocket-launch',
				origin: getBodyById(db, pending.originBodyId)?.name ?? '',
				destination: getBodyById(db, pending.destinationBodyId)?.name ?? '',
				startedAt: pending.startedAt.getTime(),
				durationSeconds: pending.durationSeconds
			}
		: null;

	const module = moduleForRoute(url.pathname);
	const tab = tabForRoute(url.pathname);

	return {
		pilot: buildPilotView(db, actual),
		action,
		activeModule: module?.code ?? '',
		activeTab: tab?.route ?? '',
		tabs: module?.tabs ?? []
	};
};

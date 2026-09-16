/**
 * Lo que necesita toda pantalla del juego, resuelto una sola vez.
 *
 * Tres cosas pasan acá, en este orden:
 *
 * 1. **El guard.** Sin sesión no se entra. Vive en el layout del grupo y no en
 *    cada página: agregar una pantalla nueva no debería obligar a acordarse de
 *    protegerla, y la protección tiene que estar en el servidor y no en que el
 *    Neocom no muestre el enlace.
 * 2. **El piloto y la orden**, que son lo que dibujan el Neocom y la barra de
 *    estado en todas las pantallas.
 * 3. **El aviso y las notificaciones.** Si la orden se acaba de resolver, el
 *    informe salta en el acto; y venga de donde venga, el Neocom marca que hay
 *    algo sin leer hasta que el piloto abra la bitácora.
 *
 * **Resolver la orden vencida ya no pasa acá**: lo hace `hooks.server.ts`, que
 * corre antes que todo `load`. Este layout y las páginas cargan en paralelo, así
 * que si el piloto se movía en este archivo, la página ya había leído la fila
 * anterior y dibujaba el lugar de salida.
 */

import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { pilotLog } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { currentAction } from '$lib/server/services/actions';
import { unreadCount } from '$lib/server/services/log';
import { getBodyById } from '$lib/server/services/universe';
import { buildInforme } from '$lib/server/views/log';
import { buildPilotView } from '$lib/server/views/pilot';
import { actionIcon, actionLabel } from '$lib/format';
import { canEnterAdmin } from '$lib/admin';
import { LOG_TAB, moduleForRoute, tabForRoute } from '$lib/navigation';
import { LOGIN_ROUTE, SUSPENDED_ROUTE } from '$lib/routes';
import type { AccionEnCurso, Informe } from '$lib/tipos';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const pilot = locals.pilot;
	if (!pilot) redirect(303, LOGIN_ROUTE);

	// Una sanción que cierra la puerta la cierra **acá**, en el layout del grupo,
	// por lo mismo que el guardia de sesión: agregar una pantalla no debería
	// obligar a acordarse de protegerla.
	if (locals.sanction) redirect(303, SUSPENDED_ROUTE);

	const pending = currentAction(db, pilot.id);
	const action: AccionEnCurso | null = pending
		? {
				kind: pending.kind,
				label: actionLabel(pending.kind),
				icon: actionIcon(pending.kind),
				origin: getBodyById(db, pending.originBodyId)?.name ?? '',
				// Puede no haber destino: minar ocurre donde estás parado.
				destination:
					pending.destinationBodyId === null
						? ''
						: (getBodyById(db, pending.destinationBodyId)?.name ?? ''),
				startedAt: pending.startedAt.getTime(),
				durationSeconds: pending.durationSeconds
			}
		: null;

	// El informe se arma desde la fila que quedó escrita y no desde lo que
	// devolvió la resolución: así el aviso dice literalmente lo mismo que la
	// bitácora, porque lee lo mismo.
	const llegada = locals.resolved;
	const fila = llegada
		? db.select().from(pilotLog).where(eq(pilotLog.id, llegada.id)).get()
		: undefined;
	const notice: Informe | null = fila ? buildInforme(db, fila) : null;

	// Las rutas que tienen algo sin leer. Hoy sólo la bitácora avisa; el día que
	// las misiones o los mensajes también lo hagan, se suman acá.
	//
	// Estando parado en la pantalla que avisa, no avisa: el `load` de la página es
	// el que marca leído y corre en paralelo con éste, así que sin esta condición
	// el Neocom seguiría titilando justo en el render en que el jugador ya entró.
	const enLaPantalla = url.pathname === LOG_TAB;
	const notices = !enLaPantalla && unreadCount(db, pilot.id) > 0 ? [LOG_TAB] : [];

	const module = moduleForRoute(url.pathname);
	const tab = tabForRoute(url.pathname);

	return {
		pilot: buildPilotView(db, pilot),
		action,
		notice,
		notices,
		// El recuadro del cuartel sólo aparece si hay alguna llave. Un enlace que
		// todos ven y casi nadie puede abrir invita a empujar una puerta cerrada.
		admin: canEnterAdmin(locals.permissions),
		activeModule: module?.code ?? '',
		activeTab: tab?.route ?? '',
		tabs: module?.tabs ?? [],
		// El título de la pestaña del navegador sale del árbol de navegación, para
		// que una pantalla nueva no haya que declararla dos veces.
		title: titulo(module?.label ?? '', tab?.label ?? '')
	};
};

/**
 * El título de la pestaña del navegador.
 *
 * Un módulo de una sola pantalla no repite su nombre dos veces: "Nave · Vaxav" y
 * no "Nave · Nave · Vaxav".
 */
function titulo(moduleLabel: string, tabLabel: string): string {
	if (!moduleLabel) return 'Vaxav';
	if (tabLabel === moduleLabel) return `${moduleLabel} · Vaxav`;
	return `${tabLabel} · ${moduleLabel} · Vaxav`;
}

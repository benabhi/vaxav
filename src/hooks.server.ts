/**
 * Quién está entrando y qué le venció, resuelto una sola vez por pedido.
 *
 * Cada pantalla necesita saber quién es el piloto, y preguntarlo en cada `load`
 * sería consultar la base varias veces por la misma página. Acá se resuelve una
 * vez y queda en `event.locals`.
 *
 * **Acá también se aplica la orden vencida**, y no en el `load` del layout como
 * estaba antes. La razón es de orden: el layout y la página cargan en paralelo,
 * así que si el layout movía al piloto, la página ya había leído la fila vieja y
 * dibujaba el lugar anterior. Se veía como un retraso —el árbol del sistema
 * seguía marcando el cuerpo de salida hasta la navegación siguiente— y no era un
 * retraso sino una foto sacada un instante antes.
 *
 * Resolver acá arregla las dos cosas de una: pasa antes que todo `load`, así que
 * todas las pantallas de ese pedido ven lo mismo, y no hay un orden que recordar.
 *
 * **Esto no protege nada por sí solo**: sólo averigua. Quién puede entrar a qué
 * lo decide el `+layout.server.ts` de cada grupo de rutas.
 */

import { eq } from 'drizzle-orm';
import type { Handle } from '@sveltejs/kit';
import { SESSION_COOKIE } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { pilot as pilotTable } from '$lib/server/db/schema';
import { resolveIfDue } from '$lib/server/services/actions';
import { pilotForToken } from '$lib/server/services/sessions';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SESSION_COOKIE) ?? '';
	event.locals.sessionToken = token;

	const found = token ? pilotForToken(db, token) : null;
	event.locals.pilot = found;
	event.locals.resolved = null;

	if (found) {
		// No hay ningún proceso de fondo: lo que resuelve una acción es que
		// alguien la mire, y mirar es hacer un pedido.
		const report = resolveIfDue(db, found);
		if (report) {
			event.locals.resolved = report;
			// Resolverla lo movió, así que la fila que se acaba de leer quedó vieja.
			event.locals.pilot =
				db.select().from(pilotTable).where(eq(pilotTable.id, found.id)).get() ?? found;
		}
	}

	return resolve(event);
};

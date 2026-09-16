/**
 * El registro de eventos.
 *
 * Los filtros salen de la URL y no de un formulario con estado: un registro que
 * se consulta es un registro que se cita, y para citarlo hay que poder pasar el
 * enlace tal como quedó. De paso, el botón de atrás hace lo que se espera.
 *
 * El guardia del layout ya comprobó `events.read`; acá no se vuelve a preguntar.
 */

import { db } from '$lib/server/db';
import { buildRegistro, readQuery } from '$lib/server/views/events';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
	return { registro: buildRegistro(db, readQuery(url.searchParams)) };
};

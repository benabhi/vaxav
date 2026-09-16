/**
 * El listado de pilotos.
 *
 * Los filtros van en la URL, como los del registro: quien modera cita lo que
 * mira, y el botón de atrás tiene que hacer lo que se espera.
 */

import { db } from '$lib/server/db';
import { PILOT_STATES, buildPilotos } from '$lib/server/views/accounts';
import { takeFlash } from '$lib/server/flash';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url, cookies }) => {
	const estado = url.searchParams.get('estado') ?? '';

	return {
		// El aviso de lo que se acaba de hacer. Leerlo lo consume.
		aviso: takeFlash(cookies),
		pilotos: buildPilotos(
			db,
			url.searchParams.get('buscar') ?? '',
			// Un estado que no existe se descarta: es una URL que alguien pegó, no
			// una orden, y tiene que dejar la pantalla en su estado por omisión.
			(PILOT_STATES as readonly string[]).includes(estado) ? estado : '',
			Math.max(1, Number.parseInt(url.searchParams.get('pagina') ?? '1', 10) || 1)
		)
	};
};

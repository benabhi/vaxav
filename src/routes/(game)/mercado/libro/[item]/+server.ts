/**
 * El libro de órdenes de un ítem, para la ventana del mercado.
 *
 * Es un endpoint y no parte del `load` de la pantalla a propósito: el catálogo se
 * dibuja una vez y el libro se pide **al abrir un ítem**. Traerlos todos por las
 * dudas sería mandar miles de filas de las que se miran dos.
 */

import { error, json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { buildBookView } from '$lib/server/views/book';
import { isItem } from '$lib/game/items';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, params }) => {
	if (!locals.pilot) error(401, 'Sin sesión');
	// Un código inventado llega hasta acá sólo si alguien arma el pedido a mano.
	if (!isItem(params.item)) error(404, 'Ese ítem no existe');

	return json(buildBookView(db, locals.pilot, params.item));
};

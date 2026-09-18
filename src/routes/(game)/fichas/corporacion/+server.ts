/**
 * La ficha de una corporación, para mirarla sin salir de donde estás.
 *
 * **Es una ventana y no una pantalla**, y por eso es un endpoint. Puesta en el
 * módulo Corporación —con el Neocom marcando «Corporación» y las pestañas de uno
 * al lado— una corporación ajena se lee como si fuera la tuya, que es
 * exactamente lo que no tiene que pasar cuando uno abre el nombre de una que
 * apareció en una lista.
 *
 * Devuelve lo mismo que arma la ficha propia, con el mismo constructor: dos
 * maneras de describir una corporación serían dos que un día dicen cosas
 * distintas. Lo que cambia es dónde se dibuja.
 *
 * Se pide **al abrir la ventana y no antes**: el panorama del piloto lista
 * cuarenta, y traerlas todas por si acaso sería cuarenta fichas para mirar una.
 */

import { error, json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { buildCorporacion } from '$lib/server/views/corporation';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, url }) => {
	if (!locals.pilot) error(401, 'Tu sesión venció.');

	const code = url.searchParams.get('code') ?? '';
	if (!code) error(400, 'Falta de cuál.');

	const ficha = buildCorporacion(db, locals.pilot, code);
	// `belongs` en falso con código puesto quiere decir que no existe: el
	// constructor devuelve el vacío de «no respondés a nadie» y acá eso es un 404.
	if (!ficha.belongs) error(404, 'No existe esa corporación.');

	return json(ficha);
};

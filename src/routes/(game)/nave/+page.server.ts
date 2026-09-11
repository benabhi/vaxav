/**
 * Pestaña Ficha: armar la nave y ver en qué se convierte.
 *
 * **Se guarda en cada cambio, no hay botón de aplicar**: en un juego que se
 * juega de a ratos, una configuración a medias que se pierde al cerrar la
 * pestaña es peor que cualquier ahorro de escrituras. `refit` es la puerta con
 * llave: si se niega —en pleno viaje, o en un lugar sin taller— la pantalla se
 * queda con el motivo y la nave no se movió, porque nunca se escribió nada.
 */

import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { ShipError, activeShip, refit, shipFit } from '$lib/server/services/ships';
import { buildShipView } from '$lib/server/views/ship';
import { LOGIN_ROUTE } from '$lib/routes';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// El guard del layout del grupo ya rechazó a quien no tiene sesión.
	if (!locals.pilot) redirect(303, LOGIN_ROUTE);
	return { ship: buildShipView(db, locals.pilot) };
};

/** Escribe una configuración entera, o devuelve por qué no se pudo. */
function guardar(pilot: Parameters<typeof refit>[1], codes: readonly string[]) {
	try {
		refit(db, pilot, codes);
	} catch (error) {
		if (error instanceof ShipError) return fail(400, { error: error.message });
		throw error;
	}
	return { ok: true };
}

export const actions: Actions = {
	/**
	 * Monta un módulo en una ranura, o la deja vacía con un código en blanco.
	 *
	 * La ranura y el módulo se validan contra el casco de verdad y no contra lo
	 * que diga el formulario: la pantalla ya filtra lo que se puede montar, así
	 * que quien llega con otra cosa lo armó a mano.
	 */
	montar: async ({ request, locals }) => {
		if (!locals.pilot) return fail(401, { error: 'Tu sesión venció. Volvé a entrar.' });

		const ship = activeShip(db, locals.pilot.id);
		if (ship === null) return fail(400, { error: 'No tenés nave.' });

		const form = await request.formData();
		const index = Number(form.get('ranura'));
		const code = String(form.get('modulo') ?? '');

		const codes = shipFit(db, ship).map((module) => module.code);
		if (!Number.isInteger(index) || index < 0 || index >= codes.length) {
			return fail(400, { error: 'Esa ranura no existe.' });
		}

		codes[index] = code;
		return guardar(locals.pilot, codes);
	}
};

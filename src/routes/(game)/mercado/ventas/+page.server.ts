/**
 * Las órdenes de venta que el piloto tiene puestas.
 *
 * Es una pestaña del módulo y no un panel más del mercado porque son dos
 * preguntas distintas: el mercado contesta "¿a cuánto está esto?" y esta pantalla
 * "¿qué tengo publicado?". Apiladas, la segunda quedaba abajo de todo; con
 * cincuenta órdenes abiertas eso deja de ser una lista y pasa a ser un descenso.
 */

import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { OrderError, cancelOrder } from '$lib/server/services/orders';
import { buildOrdersView } from '$lib/server/views/market';
import { LOGIN_ROUTE } from '$lib/routes';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.pilot) redirect(303, LOGIN_ROUTE);
	return { orders: buildOrdersView(db, locals.pilot, 'sell') };
};

export const actions: Actions = {
	/**
	 * Retirar una orden propia.
	 *
	 * Es instantáneo, al revés que publicarla: acordar una venta lleva tiempo
	 * porque hay alguien del otro lado con quien arreglar, y retirarse de la mesa
	 * no necesita el permiso de nadie.
	 */
	cancelar: async ({ request, locals }) => {
		if (!locals.pilot) return fail(401, { error: 'Tu sesión venció. Volvé a entrar.' });

		const form = await request.formData();
		const orderId = Number(form.get('orden'));
		if (!Number.isInteger(orderId) || orderId <= 0) {
			return fail(400, { error: 'Esa orden no existe.' });
		}

		try {
			cancelOrder(db, locals.pilot, orderId);
			return { done: 'Orden cancelada', note: 'La comisión de publicación no se devuelve.' };
		} catch (error) {
			if (error instanceof OrderError) return fail(400, { error: error.message });
			throw error;
		}
	}
};

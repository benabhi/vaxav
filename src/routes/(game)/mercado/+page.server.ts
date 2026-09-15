/**
 * El mercado de la región.
 *
 * Vive en el Neocom y no en una estación porque **mirar precios es información**:
 * parado en un cinturón con la bodega llena, saber a cuánto se está pagando el
 * iridio es justamente lo que decide adónde ir. Lo que sí exige un mostrador es
 * **operar**, y de eso se encargan los servicios, que revalidan todo.
 *
 * Las cinco acciones son las cinco cosas que se pueden hacer con una orden:
 * comprarle, venderle, publicar una de cada lado, y cancelar la propia. Comprar y
 * vender llevan dos caminos —contra otro piloto o contra la estación—, porque son
 * dos contrapartes distintas aunque se dibujen en la misma tabla.
 */

import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { CargoError } from '$lib/server/services/containers';
import { MarketError, buyFromStation, sellToStation } from '$lib/server/services/market';
import { ActionError, startPublish } from '$lib/server/services/actions';
import { OrderError, buyFromOrder, cancelOrder, sellToOrder } from '$lib/server/services/orders';
import { WalletError } from '$lib/server/services/wallet';
import { buildMarketView } from '$lib/server/views/market';
import { LOGIN_ROUTE } from '$lib/routes';
import { thousands } from '$lib/format';
import type { ContainerKind } from '$lib/game/items';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.pilot) redirect(303, LOGIN_ROUTE);
	return { market: buildMarketView(db, locals.pilot) };
};

/** Un entero de un formulario, o cero si vino cualquier cosa. */
function number(value: FormDataEntryValue | null): number {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

/** De cuál de las dos bodegas del piloto sale la mercadería. */
function hold(value: FormDataEntryValue | null): ContainerKind {
	return value === 'station' ? 'station' : 'ship';
}

/**
 * El mensaje de un error de comercio.
 *
 * Los cuatro errores del circuito ya traen texto escrito para el jugador, así que
 * se muestran tal cual. Cualquier otra cosa es alguien armando el pedido a mano y
 * sale genérico: filtrar acá evita que un error interno termine en pantalla.
 */
function message(error: unknown): string {
	if (
		error instanceof MarketError ||
		error instanceof OrderError ||
		error instanceof ActionError ||
		error instanceof WalletError ||
		error instanceof CargoError
	) {
		return error.message;
	}
	return 'No se pudo hacer eso.';
}

export const actions: Actions = {
	/** Compra ya: contra la orden de otro piloto, o contra la estación. */
	comprar: async ({ request, locals }) => {
		if (!locals.pilot) return fail(401, { error: 'Tu sesión venció. Volvé a entrar.' });

		const form = await request.formData();
		const orderId = number(form.get('orden'));
		const units = number(form.get('unidades'));

		try {
			const recibo = orderId
				? buyFromOrder(db, locals.pilot, orderId, units)
				: buyFromStation(db, locals.pilot, String(form.get('item') ?? ''), units);
			return {
				done: `Comprado ${recibo.quantity} × ${recibo.itemName} por ${thousands(recibo.total)} CR`,
				note: 'Queda en la estación de la orden: hay que ir a buscarlo.'
			};
		} catch (error) {
			return fail(400, { error: message(error) });
		}
	},

	/** Vende ya: contra la orden de otro piloto, o contra la estación. */
	vender: async ({ request, locals }) => {
		if (!locals.pilot) return fail(401, { error: 'Tu sesión venció. Volvé a entrar.' });

		const form = await request.formData();
		const orderId = number(form.get('orden'));
		const units = number(form.get('unidades'));
		const desde = hold(form.get('desde'));

		try {
			const recibo = orderId
				? sellToOrder(db, locals.pilot, orderId, units, number(form.get('estacion')), desde)
				: sellToStation(db, locals.pilot, String(form.get('item') ?? ''), units, desde);
			return {
				done: `Vendido ${recibo.quantity} × ${recibo.itemName} por ${thousands(recibo.total)} CR`
			};
		} catch (error) {
			return fail(400, { error: message(error) });
		}
	},

	/**
	 * Encarga acordar una orden, de compra o de venta.
	 *
	 * Es **una acción con tiempo**, no un botón: se están cerrando condiciones con
	 * alguien. Por eso paga experiencia de Comercio, y por eso ocupa el único turno
	 * que el piloto tiene. La garantía se toma ahora; la orden abre cuando el trato
	 * se cierra.
	 */
	publicar: async ({ request, locals }) => {
		if (!locals.pilot) return fail(401, { error: 'Tu sesión venció. Volvé a entrar.' });

		const form = await request.formData();
		const lado = form.get('lado') === 'buy' ? 'buy' : 'sell';

		try {
			startPublish(db, locals.pilot, {
				kind: lado,
				itemCode: String(form.get('item') ?? ''),
				quantity: number(form.get('unidades')),
				price: number(form.get('precio')),
				stationId: number(form.get('estacion')),
				days: number(form.get('dias')) || undefined,
				rangeRegions: number(form.get('alcance')),
				from: hold(form.get('desde'))
			});
			return {
				done: lado === 'sell' ? 'Acordando la venta' : 'Acordando la compra',
				note: 'La orden entra al libro cuando se cierre el trato.'
			};
		} catch (error) {
			return fail(400, { error: message(error) });
		}
	},

	/** Cancela una orden propia. La comisión ya pagada no vuelve. */
	cancelar: async ({ request, locals }) => {
		if (!locals.pilot) return fail(401, { error: 'Tu sesión venció. Volvé a entrar.' });

		const form = await request.formData();
		try {
			cancelOrder(db, locals.pilot, number(form.get('orden')));
			return { done: 'Orden cancelada', note: 'La comisión de publicación no se devuelve.' };
		} catch (error) {
			return fail(400, { error: message(error) });
		}
	}
};

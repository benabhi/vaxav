/**
 * El mercado de la estación: vender lo que se trajo y comprar lo que falta.
 *
 * Cuelga de Ubicación porque es **una sala del lugar donde está el piloto**, no
 * un destino del Neocom: se entra desde la baldosa del módulo y se vuelve ahí.
 * Estando en otro lado la pantalla no redirige, explica: que la orden diga "hay
 * que estar atracado" es más útil que aparecer de vuelta en la ubicación sin
 * saber por qué.
 *
 * Las dos acciones revalidan todo en el servicio. La pantalla ya filtra lo que
 * se puede vender y lo que alcanza para comprar, pero el precio y la existencia
 * se vuelven a resolver contra la base: entre que se dibujó la lista y llegó el
 * pedido pudo cambiar cualquiera de los dos.
 */

import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { MarketError, buyFromStation, sellToStation } from '$lib/server/services/market';
import { WalletError } from '$lib/server/services/wallet';
import { CargoError } from '$lib/server/services/containers';
import { buildMarketView } from '$lib/server/views/market';
import { LOGIN_ROUTE } from '$lib/routes';
import { thousands } from '$lib/format';
import type { ContainerKind } from '$lib/game/items';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.pilot) redirect(303, LOGIN_ROUTE);
	return { market: buildMarketView(db, locals.pilot) };
};

/** Lo que llega de un formulario, convertido a una cantidad usable. */
function units(value: FormDataEntryValue | null): number {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? Math.trunc(parsed) : 0;
}

/**
 * El mensaje de un error de comercio.
 *
 * Los tres errores del circuito —mostrador, billetera y bodega— ya traen texto
 * escrito para el jugador, así que se muestran tal cual. Cualquier otra cosa es
 * alguien armando el pedido a mano y sale con un mensaje genérico: filtrar acá
 * evita que un error interno termine dibujado en pantalla.
 */
function message(error: unknown): string {
	if (error instanceof MarketError || error instanceof WalletError || error instanceof CargoError) {
		return error.message;
	}
	return 'Ese ítem no existe.';
}

export const actions: Actions = {
	/** Vende un montón entero, de la bodega que diga el formulario. */
	vender: async ({ request, locals }) => {
		if (!locals.pilot) return fail(401, { error: 'Tu sesión venció. Volvé a entrar.' });

		const form = await request.formData();
		const code = String(form.get('item') ?? '');
		const where: ContainerKind = form.get('desde') === 'station' ? 'station' : 'ship';

		try {
			const recibo = sellToStation(db, locals.pilot, code, units(form.get('unidades')), where);
			return { sold: `${recibo.quantity} × ${recibo.itemName} · +${thousands(recibo.total)} CR` };
		} catch (error) {
			return fail(400, { error: message(error) });
		}
	},

	/** Compra módulos, que quedan en la bodega de la estación. */
	comprar: async ({ request, locals }) => {
		if (!locals.pilot) return fail(401, { error: 'Tu sesión venció. Volvé a entrar.' });

		const form = await request.formData();
		const code = String(form.get('item') ?? '');

		try {
			const recibo = buyFromStation(db, locals.pilot, code, units(form.get('unidades')));
			return { bought: `${recibo.quantity} × ${recibo.itemName} · −${thousands(recibo.total)} CR` };
		} catch (error) {
			return fail(400, { error: message(error) });
		}
	}
};

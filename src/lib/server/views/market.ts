/**
 * El mostrador de la estación, listo para dibujar.
 *
 * La forma es la del mercado de EVE, que es la que aguanta un catálogo enorme:
 * **un árbol de categorías para examinar, y el ítem elegido con sus dos libros de
 * órdenes** —quién vende y quién compra—. Con cuarenta y siete módulos podría
 * alcanzar una lista; con seiscientos no, y la pantalla no se rehace dos veces.
 *
 * Por eso el catálogo viaja como **una sola lista de ítems con los dos precios**
 * y no como dos listas separadas: comprar y vender son dos caras del mismo
 * renglón, y tenerlas juntas es lo que deja mostrar el ítem elegido con sus dos
 * libros sin ir a buscar nada más.
 *
 * Todo viaja resuelto —grupo, clase, escalón, precio, cuánto tengo— para que
 * buscar y filtrar pasen **en el navegador**. Una lista que va al servidor por
 * cada tecla es insoportable en cuanto la lista crece.
 */

import type { Pilot } from '../db/schema';
import type { Db } from '../db/types';
import { cargoHold, shipContainer, stationContainer, type CargoHold } from '../services/containers';
import { deskFor, quote, spreadOf, type MarketDesk } from '../services/market';
import { activeShip, shipReadout } from '../services/ships';
import { balance } from '../services/wallet';
import { MODULES, getModule, type ShipModule } from '$lib/game/modules';
import { ORE_LIST, getItem, type Item } from '$lib/game/items';
import { bidTotal } from '$lib/game/market';
import { SLOT_KINDS, type SlotKind } from '$lib/game/hulls';
import {
	corporationKindLabel,
	cubicMeters,
	itemIcon,
	itemKindLabel,
	moduleIcon,
	slotKindIcon,
	slotKindLabel,
	thousands
} from '$lib/format';
import type { CorporationKind } from '$lib/game/universe';
import type { FilaMercado, GrupoMercado, Horquilla, Mercado } from '$lib/tipos';

/** El grupo que junta lo que el piloto ya tiene encima. */
export const GROUP_HELD = 'held';
/** Los dos grupos de primer nivel del catálogo. */
export const GROUP_ORE = 'ore';
export const GROUP_MODULE = 'module';

/** Una horquilla apagada, para el mostrador cerrado. */
const SIN_HORQUILLA: Horquilla = {
	percent: 0,
	base: 0,
	corporationEdge: 0,
	haggling: 0,
	atFloor: false
};

/** Un mostrador cerrado: el piloto no está en ninguna estación. */
const CERRADO: Mercado = {
	open: false,
	closedReason: 'Hay que estar atracado en una estación para comerciar.',
	stationName: '',
	corporationName: '',
	corporationKind: '',
	buysOre: false,
	tradesModules: false,
	balance: '0',
	oreSpread: SIN_HORQUILLA,
	moduleSpread: SIN_HORQUILLA,
	groups: [],
	items: [],
	heldTotal: '0',
	cargoFree: '0,0'
};

/** La horquilla desarmada, como la dibuja la figura de la pantalla. */
function horquilla(desk: MarketDesk, kind: 'ore' | 'module'): Horquilla {
	const spread = spreadOf(desk, kind);
	return {
		percent: spread.percent,
		base: spread.base,
		corporationEdge: spread.corporationEdge,
		haggling: spread.haggling,
		atFloor: spread.atFloor
	};
}

/** Cuánto hay de cada ítem en una bodega, por código. */
function byCode(hold: CargoHold | null): Map<string, number> {
	return new Map(hold?.lines.map((line) => [line.itemCode, line.quantity]) ?? []);
}

/**
 * Un renglón del catálogo, con **los dos lados del mostrador resueltos**.
 *
 * Que un precio venga en cero significa que la estación no opera de ese lado: no
 * vende mineral nunca, y no toca módulos si no tiene mercado. La pantalla lo lee
 * de `sells` y `buys` y no del precio, para que un ítem gratuito —el día que
 * exista— no se confunda con uno que no se comercia.
 */
function line(
	desk: MarketDesk,
	item: Item,
	module: ShipModule | null,
	inShip: number,
	inStation: number
): FilaMercado {
	const cotizacion = quote(desk, item.code);
	const held = inShip + inStation;
	const opera = item.kind === 'ore' ? desk.services.buysOre : desk.services.tradesModules;
	// Lo que pagarían por todo lo que tiene encima, calculado sobre el lote: es
	// la cifra con la que se decide vender, y redondea distinto que el unitario.
	const holdingValue = opera ? bidTotal(item.basePrice, held, cotizacion.spread.percent) : 0;

	return {
		itemCode: item.code,
		name: item.name,
		icon: module ? moduleIcon(module) : itemIcon(item),
		kindLabel: itemKindLabel(item.kind),
		group: module ? module.kind : GROUP_ORE,
		groupLabel: module ? slotKindLabel(module.kind) : itemKindLabel(item.kind),
		// Clase y escalón juntos, como los escribe el equipamiento: "2E".
		tier: module ? `${module.size}${module.tier}` : '',
		size: module?.size ?? 0,
		tierLetter: module?.tier ?? '',
		volume: cubicMeters(item.volumeTenths),
		summary: item.description,
		sells: opera && item.kind === 'module',
		buys: opera,
		basePrice: item.basePrice,
		ask: cotizacion.ask,
		askLabel: thousands(cotizacion.ask),
		bid: cotizacion.bid,
		bidLabel: thousands(cotizacion.bid),
		inShip,
		inStation,
		held,
		holdingValue,
		holdingValueLabel: thousands(holdingValue)
	};
}

/** El árbol de categorías, con cuántos ítems cuelgan de cada rama. */
function buildGroups(items: readonly FilaMercado[], tradesModules: boolean): GrupoMercado[] {
	const cuantos = (group: string) => items.filter((item) => item.group === group).length;

	const ramas: GrupoMercado[] = [
		{
			code: GROUP_HELD,
			label: 'En mi bodega',
			icon: 'package',
			parent: '',
			count: items.filter((item) => item.held > 0).length
		},
		{
			code: GROUP_ORE,
			label: 'Minerales',
			icon: 'mountains',
			parent: '',
			count: cuantos(GROUP_ORE)
		}
	];

	if (!tradesModules) return ramas;

	return [
		...ramas,
		{
			code: GROUP_MODULE,
			label: 'Módulos',
			icon: 'squares-four',
			parent: '',
			count: items.filter((item) => item.group !== GROUP_ORE).length
		},
		...SLOT_KINDS.map((kind: SlotKind) => ({
			code: kind,
			label: slotKindLabel(kind),
			icon: slotKindIcon(kind),
			parent: GROUP_MODULE,
			count: cuantos(kind)
		}))
	];
}

/**
 * Todo lo que la pantalla del mercado necesita, en una sola pasada.
 *
 * El catálogo se arma entero y no paginado a propósito: son cuarenta y siete
 * módulos y cuatro minerales, caben de sobra en una respuesta, y tenerlos todos
 * en el navegador es lo que permite que examinar el árbol y buscar sean
 * instantáneos. El día que sean miles, esto se parte y la pantalla no se entera.
 */
export function buildMarketView(db: Db, row: Pilot): Mercado {
	const desk = deskFor(db, row);
	if (!desk) return CERRADO;

	if (!desk.services.buysOre && !desk.services.tradesModules) {
		return {
			...CERRADO,
			closedReason: `${desk.stationName} no tiene mercado ni refinería: acá no se comercia.`,
			stationName: desk.stationName,
			corporationName: desk.corporationName
		};
	}

	const nave = activeShip(db, row.id);
	const bodega = nave
		? cargoHold(db, shipContainer(db, nave.id).id, shipReadout(db, row)?.cargo ?? 0)
		: null;
	const hangar = cargoHold(db, stationContainer(db, row.id, desk.stationId).id, 0);
	const enNave = byCode(bodega);
	const enEstacion = byCode(hangar);

	const minerales = ORE_LIST.map((ore) =>
		line(desk, getItem(ore.code), null, enNave.get(ore.code) ?? 0, enEstacion.get(ore.code) ?? 0)
	);

	const modulos = desk.services.tradesModules
		? MODULES.filter((module) => module.code !== '').map((module) =>
				line(
					desk,
					getItem(module.code),
					module,
					enNave.get(module.code) ?? 0,
					enEstacion.get(module.code) ?? 0
				)
			)
		: // Sin mercado no hay catálogo de módulos, pero lo que el piloto ya tiene
			// igual tiene que aparecer: si la estación no lo compra, la fila lo dice.
			[...enNave.keys(), ...enEstacion.keys()]
				.filter((code) => getItem(code).kind === 'module')
				.map((code) =>
					line(
						desk,
						getItem(code),
						getModule(code),
						enNave.get(code) ?? 0,
						enEstacion.get(code) ?? 0
					)
				);

	const items = [...minerales, ...modulos].sort(
		(a, b) => a.size - b.size || a.name.localeCompare(b.name) || a.tier.localeCompare(b.tier)
	);

	return {
		open: true,
		closedReason: '',
		stationName: desk.stationName,
		corporationName: desk.corporationName,
		corporationKind: desk.corporationKind
			? corporationKindLabel(desk.corporationKind as CorporationKind)
			: '',
		buysOre: desk.services.buysOre,
		tradesModules: desk.services.tradesModules,
		balance: thousands(balance(db, row.id)),
		oreSpread: horquilla(desk, 'ore'),
		moduleSpread: horquilla(desk, 'module'),
		groups: buildGroups(items, desk.services.tradesModules),
		items,
		heldTotal: thousands(items.reduce((total, item) => total + item.holdingValue, 0)),
		// Lo que entra todavía en la nave: sin esto, comprar algo grande y no poder
		// subirlo a bordo se descubre recién en el equipamiento.
		cargoFree: cubicMeters(bodega?.freeTenths ?? 0)
	};
}

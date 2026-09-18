/**
 * La vista del mercado.
 *
 * Lo que se prueba acá es la distinción que ordena toda la pantalla: **el
 * catálogo se ve siempre, operar exige un mostrador**. Un piloto parado en un
 * cinturón tiene que poder mirar precios —es para eso que existe el mercado
 * regional— y tiene que ver escrito por qué no puede apretar nada.
 *
 * Y que el resumen del libro diga la verdad: el mejor precio de cada lado es el
 * más barato del que vende y el más caro del que compra, y confundirlos haría que
 * la lista entera recomendara lo contrario de lo que conviene.
 */

import { describe, expect, it } from 'vitest';
import { crearPiloto, moverPiloto, seededDb } from '../db/testing';
import { moveItem, shipContainer } from '../services/containers';
import { deskFor } from '../services/market';
import { placeBuyOrder, placeSellOrder } from '../services/orders';
import { activeShip } from '../services/ships';
import { credit } from '../services/wallet';
import { getBody } from '../services/universe';
import { constellationsIn, createBody, createSystem, setStation } from '../services/worldbuilding';
import { buildMarketView, marketStations, systemOf } from './market';
import type { Db } from '../db/types';

/** Un piloto parado donde se diga, con lo que se diga en la bodega. */
async function parado(db: Db, donde: string, carga: readonly [string, number][] = []) {
	const piloto = moverPiloto(db, await crearPiloto(db), donde);
	const bodega = shipContainer(db, activeShip(db, piloto.id)!.id);
	for (const [code, units] of carga) moveItem(db, bodega.id, code, units, 'mined');
	return piloto;
}

describe('dónde se puede operar', () => {
	it('atracado en una estación con mercado, sí', async () => {
		const db = seededDb();
		const piloto = await parado(db, 'puerto_anfora');

		const vista = buildMarketView(db, piloto);

		expect(vista.canTradeHere).toBe(true);
		expect(vista.dockedAt).toBe('Puerto Ánfora');
		expect(vista.whyNot).toBe('');
	});

	it('en una estación sin módulo de Mercado, no, y lo dice con su nombre', async () => {
		const db = seededDb();
		const piloto = await parado(db, 'planta_escarcha');

		const vista = buildMarketView(db, piloto);

		expect(vista.canTradeHere).toBe(false);
		expect(vista.whyNot).toContain('Planta Escarcha');
	});

	it('en un cinturón el catálogo se ve igual, pero no se opera', async () => {
		const db = seededDb();
		const piloto = await parado(db, 'anillos_anfora_iii');

		const vista = buildMarketView(db, piloto);

		// Mirar precios desde cualquier parte es justamente para lo que existe un
		// mercado regional: decidir adónde ir con lo que uno trae.
		expect(vista.items.length).toBeGreaterThan(0);
		expect(vista.canTradeHere).toBe(false);
		expect(vista.whyNot).toContain('atracado');
	});
});

describe('el catálogo', () => {
	it('trae los cuatro minerales y los treinta y cuatro módulos', async () => {
		const db = seededDb();
		const piloto = await parado(db, 'puerto_anfora');

		expect(buildMarketView(db, piloto).items).toHaveLength(38);
	});

	it('cada rama del árbol cuenta lo que tiene debajo', async () => {
		const db = seededDb();
		const piloto = await parado(db, 'puerto_anfora');

		const vista = buildMarketView(db, piloto);
		const rama = (code: string) => vista.groups.find((grupo) => grupo.code === code)!;

		expect(rama('ore').count).toBe(4);
		expect(rama('module').count).toBe(34);
		const ranuras = ['high', 'mid', 'low'].map((code) => rama(code).count);
		expect(ranuras.reduce((total, cuantos) => total + cuantos, 0)).toBe(34);
	});

	it('cuenta lo que el piloto tiene en toda la galaxia, no sólo acá', async () => {
		const db = seededDb();
		const piloto = await parado(db, 'puerto_anfora', [['ferrous_silicate', 40]]);

		const silicato = buildMarketView(db, piloto).items.find(
			(item) => item.itemCode === 'ferrous_silicate'
		)!;
		expect(silicato.held).toBe(40);
	});

	it('sólo entran al libro las estaciones con mostrador', () => {
		const db = seededDb();

		const conMercado = marketStations(db).map((estacion) => estacion.name);

		// La Planta Escarcha refina pero no comercia.
		expect(conMercado).not.toContain('Planta Escarcha');
		expect(conMercado).toContain('Puerto Ánfora');
	});

	/*
	 * Mientras no exista el salto entre sistemas, una orden de otro sistema es un
	 * trato que nadie puede tomar. Y además la distancia entre dos cuerpos de
	 * sistemas distintos no existe: mostrarla no era sólo inútil, tumbaba la
	 * pantalla con un 500 apenas hubo un segundo sistema.
	 */
	it('no alcanza las de otro sistema', () => {
		const db = seededDb();
		const vela = createSystem(
			db,
			{
				name: 'Vela',
				constellationId: constellationsIn(db)[0].id,
				government: 'corporate',
				security: 70,
				controllingFaction: 'dominion',
				capitalOf: ''
			},
			null
		);

		const muelle = createBody(
			db,
			vela.system.id,
			{
				name: 'Muelle Largo',
				kind: 'station',
				parentId: vela.star.id,
				orbitDistance: 5,
				bodyClass: '',
				atmosphere: '',
				starClass: '',
				explored: true
			},
			null
		);
		setStation(db, muelle.id, 'casa_verlan', ['market'], null);

		// Sin recorte, las de los dos sistemas.
		expect(marketStations(db).map((una) => una.name)).toContain('Muelle Largo');

		// Recortado al sistema de Ánfora, sólo las de Ánfora.
		const anfora = getBody(db, 'puerto_anfora')!;
		const desdeAnfora = marketStations(db, systemOf(db, anfora.id)).map((una) => una.name);
		expect(desdeAnfora).toContain('Puerto Ánfora');
		expect(desdeAnfora).not.toContain('Muelle Largo');
	});
});

describe('el mejor precio de cada lado', () => {
	it('del lado que vende es el más barato, y del que compra el que más paga', async () => {
		const db = seededDb();
		const vendedor = moverPiloto(db, await crearPiloto(db, 'Vendedora'), 'puerto_anfora');
		credit(db, vendedor.id, 100_000, { kind: 'adjustment', memo: 'prueba' });
		const bodega = shipContainer(db, activeShip(db, vendedor.id)!.id);
		moveItem(db, bodega.id, 'ferrous_silicate', 200, 'mined');
		const stationId = deskFor(db, vendedor)!.stationId;

		placeSellOrder(db, vendedor, {
			itemCode: 'ferrous_silicate',
			quantity: 100,
			price: 9,
			stationId
		});
		placeBuyOrder(db, vendedor, {
			itemCode: 'ferrous_silicate',
			quantity: 100,
			price: 30,
			stationId
		});

		const silicato = buildMarketView(db, vendedor).items.find(
			(item) => item.itemCode === 'ferrous_silicate'
		)!;

		// Confundirlos haría que la lista recomendara lo contrario de lo que conviene.
		expect(silicato.bestAsk).toBe(9);
		expect(silicato.bestBid).toBe(30);
		expect(silicato.sellOrders).toBe(1);
		expect(silicato.buyOrders).toBe(1);
	});

	it('la estación entra al libro como una orden más', async () => {
		const db = seededDb();
		const piloto = await parado(db, 'puerto_anfora');

		const silicato = buildMarketView(db, piloto).items.find(
			(item) => item.itemCode === 'ferrous_silicate'
		)!;

		// Sin ninguna orden de jugador, el único que compra es el mostrador.
		expect(silicato.buyOrders).toBe(0);
		expect(silicato.bestBid).toBe(10);
		// Y mineral no vende nadie: lo compra para procesarlo.
		expect(silicato.bestAsk).toBeNull();
	});

	it('parado en un cinturón se sigue viendo lo que paga la estación', async () => {
		const db = seededDb();
		const enElCinturon = await parado(db, 'anillos_anfora_iii');
		const amarrado = moverPiloto(db, await crearPiloto(db, 'Amarrada'), 'puerto_anfora');

		const desdeLejos = buildMarketView(db, enElCinturon).items.find(
			(item) => item.itemCode === 'ferrous_silicate'
		)!;
		const desdeAdentro = buildMarketView(db, amarrado).items.find(
			(item) => item.itemCode === 'ferrous_silicate'
		)!;

		// El mercado se lee desde cualquier parte: esconder el precio de la estación
		// mientras uno está minando diría que no hay a quién venderle, justo cuando
		// hay que decidir si vale la pena volver.
		expect(desdeLejos.bestBid).toBe(desdeAdentro.bestBid);
		expect(desdeLejos.bestBidPlace?.station).toBe('Puerto Ánfora');
	});

	it('la estación vende módulos aunque el piloto esté lejos', async () => {
		const db = seededDb();
		const piloto = await parado(db, 'anillos_anfora_iii');

		const laser = buildMarketView(db, piloto).items.find(
			(item) => item.itemCode === 'mining_laser_i1'
		)!;

		// Es lo que cierra el ciclo del minero: trae mineral, lo vende y ve con qué
		// mejorar sin depender de que otro piloto haya publicado algo.
		expect(laser.bestAsk).not.toBeNull();
		expect(laser.bestAskPlace?.station).toBe('Puerto Ánfora');
	});
});

describe('lo que el piloto puede hacer', () => {
	it('viaja con sus topes y sus costos, para poder explicarlos', async () => {
		const db = seededDb();
		const piloto = await parado(db, 'puerto_anfora');

		const vista = buildMarketView(db, piloto);

		expect(vista.orderLimit).toBe(1);
		expect(vista.openBuys).toBe(0);
		expect(vista.openSells).toBe(0);
		expect(vista.regionsInRange).toBe(1);
		expect(vista.brokerPermille).toBe(30);
		expect(vista.taxPermille).toBe(50);
	});
});

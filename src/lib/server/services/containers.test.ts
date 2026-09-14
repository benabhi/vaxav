/**
 * Las bodegas contra una base real: nada entra ni sale sin dejar asiento.
 *
 * Lo que importa probar acá no es que sumar funcione, sino que **el caché y el
 * libro no se puedan separar**. La cantidad guardada en el montón existe para no
 * sumar años de asientos en cada pantalla; el día que deje de coincidir con el
 * libro, el juego tiene una economía que no cierra y nadie se entera.
 */

import { describe, expect, it } from 'vitest';
import { container, station } from '../db/schema';
import { crearPiloto, seededDb } from '../db/testing';
import { activeShip } from './ships';
import {
	CargoError,
	auditStacks,
	cargoHold,
	fitsUnits,
	itemHistory,
	moveItem,
	quantityOf,
	shipContainer,
	stacks,
	transferItem,
	usedVolume
} from './containers';
import type { Db } from '../db/types';

/**
 * Un piloto con una bodega **vacía** para trabajar.
 *
 * Es la de una estación y no la de la nave a propósito: la de la nave ya viene
 * con lo que le dejó el oficio, y un test de inventario que arranca con algo
 * adentro mide dos cosas a la vez. Que las dos clases de bodega se comporten
 * igual es además lo que se quiere probar.
 */
async function conBodega(db: Db, callsign = 'Halcon') {
	const piloto = await crearPiloto(db, callsign);
	const nave = activeShip(db, piloto.id)!;
	const puerto = db.select().from(station).get()!;
	const bodega = db
		.insert(container)
		.values({ kind: 'station', pilotId: piloto.id, stationId: puerto.id })
		.returning()
		.get();
	return { piloto, nave, bodega };
}

describe('la bodega de una nave', () => {
	it('se crea la primera vez que se la pide y después es siempre la misma', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const nave = activeShip(db, piloto.id)!;

		const primera = shipContainer(db, nave.id);
		const segunda = shipContainer(db, nave.id);

		// Crearla al pedirla es lo que hace que las naves anteriores a que
		// existieran las bodegas no necesiten una migración de datos.
		expect(segunda.id).toBe(primera.id);
		expect(primera.kind).toBe('ship');
	});

	it('arranca vacía', async () => {
		const db = seededDb();
		const { bodega } = await conBodega(db);

		expect(stacks(db, bodega.id)).toEqual([]);
		expect(usedVolume(db, bodega.id)).toBe(0);
	});
});

describe('mover carga', () => {
	it('suma, resta y deja el montón en lo que corresponde', async () => {
		const db = seededDb();
		const { bodega } = await conBodega(db);

		expect(moveItem(db, bodega.id, 'ferrous_silicate', 40, 'mined')).toBe(40);
		expect(moveItem(db, bodega.id, 'ferrous_silicate', 12, 'mined')).toBe(52);
		expect(moveItem(db, bodega.id, 'ferrous_silicate', -20, 'sold')).toBe(32);
		expect(quantityOf(db, bodega.id, 'ferrous_silicate')).toBe(32);
	});

	it('cero no es una fila en cero: es una fila que se borra', async () => {
		const db = seededDb();
		const { bodega } = await conBodega(db);
		moveItem(db, bodega.id, 'ferrous_silicate', 10, 'mined');

		moveItem(db, bodega.id, 'ferrous_silicate', -10, 'sold');

		// Un inventario lleno de ceros crece para siempre y ensucia toda consulta
		// que recorra montones.
		expect(stacks(db, bodega.id)).toEqual([]);
		expect(quantityOf(db, bodega.id, 'ferrous_silicate')).toBe(0);
	});

	it('no deja sacar más de lo que hay', async () => {
		const db = seededDb();
		const { bodega } = await conBodega(db);
		moveItem(db, bodega.id, 'ferrous_silicate', 5, 'mined');

		expect(() => moveItem(db, bodega.id, 'ferrous_silicate', -6, 'sold')).toThrow(CargoError);
		expect(quantityOf(db, bodega.id, 'ferrous_silicate')).toBe(5);
	});

	it('se niega a guardar algo que el catálogo no conoce', async () => {
		const db = seededDb();
		const { bodega } = await conBodega(db);

		// Carga que después nadie puede valuar ni mostrar.
		expect(() => moveItem(db, bodega.id, 'polvo_magico', 1, 'mined')).toThrow();
	});

	it('cada movimiento deja su asiento, con cómo quedó el montón', async () => {
		const db = seededDb();
		const { bodega } = await conBodega(db);
		moveItem(db, bodega.id, 'ferrous_silicate', 40, 'mined');
		moveItem(db, bodega.id, 'ferrous_silicate', -15, 'sold');

		const libro = itemHistory(db, bodega.id);

		expect(libro).toHaveLength(2);
		expect(libro[0].quantity).toBe(-15);
		expect(libro[0].quantityAfter).toBe(25);
		expect(libro[0].kind).toBe('sold');
	});
});

describe('el volumen', () => {
	it('lo cuenta en décimas y dice cuánto queda', async () => {
		const db = seededDb();
		const { bodega } = await conBodega(db);
		// El silicato ocupa 1 m³ la unidad; la Pioner lleva 200.
		moveItem(db, bodega.id, 'ferrous_silicate', 30, 'mined');

		const hold = cargoHold(db, bodega.id, 200);

		expect(hold.usedTenths).toBe(300);
		expect(hold.capacityTenths).toBe(2000);
		expect(hold.freeTenths).toBe(1700);
	});

	it('una bodega pasada de peso no informa lugar negativo', async () => {
		const db = seededDb();
		const { bodega } = await conBodega(db);
		moveItem(db, bodega.id, 'ferrous_silicate', 30, 'mined');

		// Puede pasar si la nave pierde capacidad al desmontar algo. "Queda -100" no
		// es una lectura útil.
		const hold = cargoHold(db, bodega.id, 10);

		expect(hold.freeTenths).toBe(0);
	});

	it('dice cuántas unidades entran en lo que queda, truncando', () => {
		// La veta iridiada ocupa 0,6 m³: en 2 m³ entran tres y sobra un poco.
		expect(fitsUnits(20, 'iridium_vein')).toBe(3);
		expect(fitsUnits(0, 'iridium_vein')).toBe(0);
	});
});

describe('pasar carga de una bodega a otra', () => {
	it('mueve las dos puntas y las deja apuntándose', async () => {
		const db = seededDb();
		const { bodega } = await conBodega(db);
		const otra = shipContainer(db, (await conBodega(db, 'Cuervo')).nave.id);
		moveItem(db, bodega.id, 'ferrous_silicate', 30, 'mined');

		transferItem(db, bodega.id, otra.id, 'ferrous_silicate', 12);

		expect(quantityOf(db, bodega.id, 'ferrous_silicate')).toBe(18);
		expect(quantityOf(db, otra.id, 'ferrous_silicate')).toBe(12);
		expect(itemHistory(db, otra.id)[0].counterpartId).toBe(bodega.id);
	});

	it('si una punta falla no se mueve nada', async () => {
		const db = seededDb();
		const { bodega } = await conBodega(db);
		const otra = shipContainer(db, (await conBodega(db, 'Cuervo')).nave.id);
		moveItem(db, bodega.id, 'ferrous_silicate', 5, 'mined');

		// Media transferencia es carga duplicada o carga perdida, y las dos son
		// peores que un error.
		expect(() => transferItem(db, bodega.id, otra.id, 'ferrous_silicate', 9)).toThrow(CargoError);

		expect(quantityOf(db, bodega.id, 'ferrous_silicate')).toBe(5);
		expect(quantityOf(db, otra.id, 'ferrous_silicate')).toBe(0);
	});
});

describe('la auditoría', () => {
	it('no encuentra nada cuando el caché y el libro coinciden', async () => {
		const db = seededDb();
		const { bodega } = await conBodega(db);
		moveItem(db, bodega.id, 'ferrous_silicate', 40, 'mined');
		moveItem(db, bodega.id, 'iridium_vein', 3, 'mined');
		moveItem(db, bodega.id, 'ferrous_silicate', -15, 'sold');

		expect(auditStacks(db, bodega.id)).toEqual([]);
	});

	it('encuentra un montón que no coincide con sus asientos', async () => {
		const db = seededDb();
		const { bodega } = await conBodega(db);
		moveItem(db, bodega.id, 'ferrous_silicate', 40, 'mined');

		// Alguien tocó la cantidad sin pasar por el servicio: exactamente lo que la
		// auditoría existe para encontrar.
		db.run(
			`update item_stack set quantity = 999 where container_id = ${bodega.id} and item_code = 'ferrous_silicate'` as never
		);

		expect(auditStacks(db, bodega.id)).toEqual([
			{ itemCode: 'ferrous_silicate', stored: 999, ledger: 40 }
		]);
	});
});

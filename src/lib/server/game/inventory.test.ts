/**
 * Un módulo tiene que estar en algún lado para poder montarlo.
 *
 * Sin esta capa, la pantalla de equipamiento ofrece el catálogo entero como si
 * los módulos no fueran de nadie. Estas reglas son las que hacen que el mapa
 * importe: dónde estás parado decide qué podés armar.
 */

import { describe, expect, it } from 'vitest';
import { availableForSlot, stationStocksModules } from './inventory';
import { getModule, modulesForSlot } from './modules';
import type { StationServiceKind } from './universe';

const CON_EQUIPAMIENTO: StationServiceKind[] = ['outfitting', 'market'];
const SIN_EQUIPAMIENTO: StationServiceKind[] = ['refinery', 'storage'];

describe('qué surte una estación', () => {
	it('surte si tiene equipamiento', () => {
		expect(stationStocksModules(CON_EQUIPAMIENTO)).toBe(true);
	});

	it('no surte sin equipamiento', () => {
		// El astillero vende cascos; el equipamiento monta piezas.
		expect(stationStocksModules(SIN_EQUIPAMIENTO)).toBe(false);
		expect(stationStocksModules(['shipyard'])).toBe(false);
	});
});

describe('qué se puede montar acá y ahora', () => {
	it('no ofrece nada sin estación ni bodega', () => {
		// No es un error: es lo que significa estar en un puesto de hielo.
		expect(availableForSlot('hardpoint', 1, null)).toEqual([]);
	});

	it('ofrece todo lo que entra si la estación surte', () => {
		const disponibles = availableForSlot('hardpoint', 1, null, CON_EQUIPAMIENTO);
		const ofrecidos = new Set(disponibles.map((item) => item.module.code));
		expect(ofrecidos).toEqual(new Set(modulesForSlot('hardpoint', 1).map((m) => m.code)));
	});

	it('marca lo de la estación como de la estación', () => {
		const disponibles = availableForSlot('utility', 1, null, CON_EQUIPAMIENTO);
		expect(disponibles.length).toBeGreaterThan(0);
		expect(disponibles.every((item) => item.source === 'station')).toBe(true);
	});

	it('deja montar lo de la bodega aunque la estación no surta', () => {
		// Lo que traés puesto sirve en cualquier lado: por eso lo traés.
		const laser = getModule('mining_laser_1e');
		const disponibles = availableForSlot('hardpoint', 1, null, SIN_EQUIPAMIENTO, [laser]);
		expect(disponibles.map((item) => item.module)).toEqual([laser]);
		expect(disponibles[0].source).toBe('cargo');
	});

	it('pone la bodega primero', () => {
		// Lo que ya tenés se usa antes que lo que hay que conseguir.
		const laser = getModule('mining_laser_1e');
		const disponibles = availableForSlot('hardpoint', 1, null, CON_EQUIPAMIENTO, [laser]);
		expect(disponibles[0].module).toEqual(laser);
		expect(disponibles[0].source).toBe('cargo');
	});

	it('no repite un módulo que está en los dos lugares', () => {
		const laser = getModule('mining_laser_1e');
		const disponibles = availableForSlot('hardpoint', 1, null, CON_EQUIPAMIENTO, [laser]);
		const codigos = disponibles.map((item) => item.module.code);
		expect(new Set(codigos).size).toBe(codigos.length);
	});

	it('no ofrece de la bodega lo que no entra en la ranura', () => {
		// Llevar un módulo de clase 2 no lo hace entrar en una ranura de clase 1.
		const grande = getModule('mining_laser_2a');
		expect(availableForSlot('hardpoint', 1, null, [], [grande])).toEqual([]);
	});

	it('filtra los internos esenciales por su sistema', () => {
		const disponibles = availableForSlot('core', 2, 'power_plant', CON_EQUIPAMIENTO);
		expect(disponibles.length).toBeGreaterThan(0);
		expect(disponibles.every((item) => item.module.core === 'power_plant')).toBe(true);
	});
});

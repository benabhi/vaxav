/**
 * Qué puede hacer un piloto según dónde está y qué está haciendo.
 *
 * Es la respuesta única que consultan la pantalla de navegación, la de la nave y
 * el motor de acciones. Antes cada una decidía por su cuenta, y dos lugares que
 * deciden lo mismo terminan decidiendo distinto.
 */

import { describe, expect, it } from 'vitest';
import {
	canGiveOrders,
	canRefit,
	orderBlockedReason,
	refitBlockedReason,
	statusFor
} from './status';
import type { StationServiceKind } from './universe';

const CON_TALLER: StationServiceKind[] = ['outfitting', 'market'];
const SIN_TALLER: StationServiceKind[] = ['refinery', 'storage'];

describe('de dónde sale cada situación', () => {
	it('atracado es estar quieto en una estación', () => {
		expect(statusFor(true, false)).toBe('docked');
	});

	it('en el espacio es estar quieto en cualquier otra cosa', () => {
		expect(statusFor(false, false)).toBe('in_space');
	});

	it('deja que estar ocupado gane sobre dónde estás', () => {
		// Mientras se viaja no importa de qué estación se salió: ya no se está ahí.
		expect(statusFor(true, true)).toBe('in_transit');
		expect(statusFor(false, true)).toBe('in_transit');
	});
});

describe('dar órdenes', () => {
	it('se puede estando quieto', () => {
		expect(canGiveOrders('docked')).toBe(true);
		expect(canGiveOrders('in_space')).toBe(true);
	});

	it('no se puede en tránsito', () => {
		// Una por vez, sin cola: es lo que hace que elegir sea una decisión.
		expect(canGiveOrders('in_transit')).toBe(false);
	});

	it('dice por qué cuando no se puede', () => {
		expect(orderBlockedReason('in_transit')).not.toBe('');
		expect(orderBlockedReason('docked')).toBe('');
	});
});

describe('equipar', () => {
	it('pide estar atracado y que haya taller', () => {
		expect(canRefit('docked', CON_TALLER)).toBe(true);
	});

	it('no alcanza con una estación sin equipamiento', () => {
		expect(canRefit('docked', SIN_TALLER)).toBe(false);
	});

	it('no se puede en el espacio aunque no haya orden', () => {
		// Estar quieto no alcanza: hace falta un lugar con con qué.
		expect(canRefit('in_space', CON_TALLER)).toBe(false);
	});

	it('no se puede en pleno viaje', () => {
		expect(canRefit('in_transit', CON_TALLER)).toBe(false);
	});

	it('no se puede sin servicios', () => {
		expect(canRefit('docked')).toBe(false);
	});
});

describe('los motivos', () => {
	it('no deja motivo cuando sí se puede equipar', () => {
		expect(refitBlockedReason('docked', CON_TALLER)).toBe('');
	});

	it('habla del viaje cuando se está viajando', () => {
		expect(refitBlockedReason('in_transit', CON_TALLER).toLowerCase()).toContain('viaje');
	});

	it('nombra el lugar cuando se está en el espacio', () => {
		// Decir "acá no se puede" es una queja; con el nombre es una instrucción.
		expect(refitBlockedReason('in_space', [], 'Ánfora III')).toContain('Ánfora III');
	});

	it('nombra la estación cuando no tiene taller', () => {
		const motivo = refitBlockedReason('docked', SIN_TALLER, 'Planta Escarcha');
		expect(motivo).toContain('Planta Escarcha');
		expect(motivo).toContain('Equipamiento');
	});

	it('escribe frases y no códigos', () => {
		// Se le muestran al jugador tal cual, así que tienen que leerse.
		const motivos = [
			refitBlockedReason('in_transit', CON_TALLER, 'Puerto Ánfora'),
			refitBlockedReason('in_space', [], 'Ánfora I'),
			refitBlockedReason('docked', SIN_TALLER, 'Planta Escarcha'),
			orderBlockedReason('in_transit')
		];
		for (const motivo of motivos) {
			expect(motivo).not.toBe('');
			expect(motivo[0]).toBe(motivo[0].toUpperCase());
			expect(motivo.endsWith('.')).toBe(true);
		}
	});
});

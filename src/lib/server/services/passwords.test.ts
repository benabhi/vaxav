/** El hashing de contraseñas hace lo que promete y no filtra nada. */

import { describe, expect, it } from 'vitest';
import { hashPassword, needsRehash, verifyPassword } from './passwords';

describe('el hashing', () => {
	it('no deja la contraseña adentro del hash', async () => {
		expect(await hashPassword('abrete-sesamo')).not.toContain('abrete-sesamo');
	});

	it('da hashes distintos para la misma contraseña', async () => {
		// Cada hash lleva su propia sal: dos iguales delatarían contraseñas iguales.
		expect(await hashPassword('abrete-sesamo')).not.toBe(await hashPassword('abrete-sesamo'));
	});

	it('verifica la contraseña correcta', async () => {
		expect(await verifyPassword(await hashPassword('abrete-sesamo'), 'abrete-sesamo')).toBe(true);
	});

	it('rechaza la contraseña incorrecta', async () => {
		expect(await verifyPassword(await hashPassword('abrete-sesamo'), 'abrete sesamo')).toBe(false);
	});

	it('no deja entrar ni explota con un hash corrupto', async () => {
		expect(await verifyPassword('esto-no-es-un-hash', 'abrete-sesamo')).toBe(false);
	});

	it('no marca para rehacer un hash corrupto', async () => {
		expect(await needsRehash('esto-no-es-un-hash')).toBe(false);
	});

	it('no marca para rehacer un hash recién hecho', async () => {
		expect(await needsRehash(await hashPassword('abrete-sesamo'))).toBe(false);
	});
});

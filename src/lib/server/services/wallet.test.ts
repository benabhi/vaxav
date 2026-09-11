/**
 * La billetera: todo movimiento deja asiento, y el saldo cierra siempre.
 *
 * El último test de este archivo no prueba una función: **recorre el código
 * fuente** para verificar que ningún otro módulo escriba `pilot.credits`. Es la
 * única forma de sostener una regla de arquitectura, porque el día que alguien
 * con apuro sume diez créditos desde otro lado, todo va a seguir compilando y
 * pasando los demás tests.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { crearPiloto, seededDb } from '../db/testing';
import { WalletError, auditBalance, balance, credit, debit, entryCount, history } from './wallet';

describe('mover plata', () => {
	it('cobra, paga y deja el saldo en lo que corresponde', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		credit(db, piloto.id, 500, { kind: 'ore_sale' });
		debit(db, piloto.id, 120, { kind: 'module_purchase' });

		expect(balance(db, piloto.id)).toBe(380);
	});

	it('cada movimiento deja su asiento con el saldo que dejó', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		credit(db, piloto.id, 500, { kind: 'ore_sale', memo: 'Silicato ferroso x40' });
		debit(db, piloto.id, 120, { kind: 'module_purchase' });

		const libro = history(db, piloto.id);

		expect(entryCount(db, piloto.id)).toBe(2);
		expect(libro[0].amount).toBe(-120);
		expect(libro[0].balanceAfter).toBe(380);
		expect(libro[1].memo).toBe('Silicato ferroso x40');
	});

	it('no deja el saldo en negativo', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		credit(db, piloto.id, 100, { kind: 'ore_sale' });

		// Deber plata es una mecánica, no un accidente de resta.
		expect(() => debit(db, piloto.id, 101, { kind: 'module_purchase' })).toThrow(WalletError);
		expect(balance(db, piloto.id)).toBe(100);
		expect(entryCount(db, piloto.id)).toBe(1);
	});

	it('un cobro o un pago en cero o negativo no es un movimiento', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		expect(() => credit(db, piloto.id, 0, { kind: 'ore_sale' })).toThrow(WalletError);
		expect(() => debit(db, piloto.id, -5, { kind: 'module_purchase' })).toThrow(WalletError);
	});

	it('los créditos son enteros', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);

		expect(() => credit(db, piloto.id, 10.5, { kind: 'ore_sale' })).toThrow(WalletError);
	});
});

describe('la auditoría del saldo', () => {
	it('no encuentra nada cuando el caché y el libro coinciden', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		credit(db, piloto.id, 500, { kind: 'ore_sale' });
		debit(db, piloto.id, 120, { kind: 'module_purchase' });

		expect(auditBalance(db, piloto.id)).toBeNull();
	});

	it('encuentra un saldo que no coincide con sus asientos', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		credit(db, piloto.id, 500, { kind: 'ore_sale' });

		// Alguien editó el saldo sin pasar por la billetera: exactamente lo que la
		// auditoría existe para encontrar.
		db.run(`update pilot set credits = 9999 where id = ${piloto.id}` as never);

		expect(auditBalance(db, piloto.id)).toEqual({ stored: 9999, ledger: 500 });
	});
});

/** Todos los archivos `.ts` de un directorio y sus subdirectorios. */
function sourceFiles(dir: string): string[] {
	return readdirSync(dir).flatMap((name) => {
		const full = join(dir, name);
		if (statSync(full).isDirectory()) return sourceFiles(full);
		return name.endsWith('.ts') ? [full] : [];
	});
}

describe('quién puede escribir el saldo', () => {
	it('sólo la billetera lo escribe, en todo el repositorio', () => {
		// El saldo es un caché del libro. Que exista la columna invita a sumarle
		// diez créditos desde cualquier lado, y eso no rompe nada hasta el día que
		// la economía no cierra y no hay con qué reconstruirla.
		const culpables = sourceFiles(join('src', 'lib', 'server'))
			.filter((file) => !file.endsWith('.test.ts'))
			.filter((file) => !file.endsWith(join('services', 'wallet.ts')))
			.filter((file) => /\.set\(\s*\{[^}]*\bcredits\s*:/s.test(readFileSync(file, 'utf8')));

		expect(culpables, 'Estos escriben pilot.credits sin pasar por la billetera').toEqual([]);
	});
});

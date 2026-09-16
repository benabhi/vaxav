/** Qué sanción pesa, cuál venció y cuál no debería haberse podido poner. */

import { describe, expect, it } from 'vitest';
import {
	SANCTIONS,
	SANCTION_KINDS,
	SANCTION_ORDER,
	blockingSanction,
	isBlocking,
	isSanctionKind,
	sanctionLabel,
	sanctionProblem
} from './sanctions';

const AHORA = new Date('2026-09-16T12:00:00Z');
const ANTES = new Date('2026-09-10T12:00:00Z');
const DESPUES = new Date('2026-09-30T12:00:00Z');

/** Una sanción puesta, lista para retocarle lo que el test necesite. */
function puesta(
	cambios: Partial<{ kind: string; until: Date | null; liftedAt: Date | null }> = {}
) {
	return { kind: 'ban', until: null, liftedAt: null, ...cambios };
}

describe('el catálogo', () => {
	it('ofrece los tres, de lo más leve a lo más grave', () => {
		expect(SANCTION_ORDER).toEqual(['warning', 'suspension', 'ban']);
		expect([...SANCTION_ORDER].sort()).toEqual([...SANCTION_KINDS].sort());
	});

	/*
	 * Es lo que separa a las tres: una suspensión sin fecha sería un baneo con
	 * otro nombre, y un baneo con fecha sería una suspensión.
	 */
	it('sólo la suspensión lleva fecha, y el aviso no cierra nada', () => {
		expect(SANCTIONS.warning.blocks).toBe(false);
		expect(SANCTIONS.suspension.blocks).toBe(true);
		expect(SANCTIONS.suspension.dated).toBe(true);
		expect(SANCTIONS.ban.blocks).toBe(true);
		expect(SANCTIONS.ban.dated).toBe(false);
	});

	it('reconoce los suyos y devuelve el código a secas para el resto', () => {
		expect(isSanctionKind('ban')).toBe(true);
		expect(isSanctionKind('destierro')).toBe(false);
		expect(sanctionLabel('ban')).toBe('Baneo');
		expect(sanctionLabel('destierro')).toBe('destierro');
	});
});

describe('si una sanción pesa', () => {
	it('un baneo puesto pesa siempre', () => {
		expect(isBlocking(puesta(), AHORA)).toBe(true);
	});

	it('un aviso no pesa nunca, aunque esté puesto', () => {
		expect(isBlocking(puesta({ kind: 'warning' }), AHORA)).toBe(false);
	});

	it('una suspensión pesa hasta su fecha y después no', () => {
		expect(isBlocking(puesta({ kind: 'suspension', until: DESPUES }), AHORA)).toBe(true);
		expect(isBlocking(puesta({ kind: 'suspension', until: ANTES }), AHORA)).toBe(false);
	});

	it('una levantada a mano deja de pesar', () => {
		expect(isBlocking(puesta({ liftedAt: ANTES }), AHORA)).toBe(false);
	});

	it('una clase que el código ya no conoce no pesa', () => {
		expect(isBlocking(puesta({ kind: 'destierro' }), AHORA)).toBe(false);
	});
});

describe('cuál le cierra la puerta', () => {
	it('sin sanciones, ninguna', () => {
		expect(blockingSanction([], AHORA)).toBeNull();
	});

	it('ignora las vencidas y las levantadas', () => {
		const historial = [
			puesta({ kind: 'suspension', until: ANTES }),
			puesta({ liftedAt: ANTES }),
			puesta({ kind: 'warning' })
		];

		expect(blockingSanction(historial, AHORA)).toBeNull();
	});

	/*
	 * Es la trampa que hay que evitar: levantar una suspensión vieja no puede
	 * abrir la puerta que un baneo posterior había cerrado.
	 */
	it('un baneo le gana a cualquier suspensión', () => {
		const historial = [puesta({ kind: 'suspension', until: DESPUES }), puesta()];

		expect(blockingSanction(historial, AHORA)?.kind).toBe('ban');
	});

	it('entre dos suspensiones gana la que termina más tarde', () => {
		const larga = puesta({ kind: 'suspension', until: DESPUES });
		const corta = puesta({
			kind: 'suspension',
			until: new Date('2026-09-17T12:00:00Z')
		});

		expect(blockingSanction([larga, corta], AHORA)).toBe(larga);
		expect(blockingSanction([corta, larga], AHORA)).toBe(larga);
	});
});

describe('poner una sanción', () => {
	it('exige un motivo', () => {
		expect(sanctionProblem('ban', '  ', null)).not.toBeNull();
		expect(sanctionProblem('ban', 'Macros', null)).toBeNull();
	});

	it('exige fecha a la suspensión y se la prohíbe al resto', () => {
		expect(sanctionProblem('suspension', 'Macros', null)).not.toBeNull();
		expect(sanctionProblem('suspension', 'Macros', DESPUES)).toBeNull();
		expect(sanctionProblem('ban', 'Macros', DESPUES)).not.toBeNull();
		expect(sanctionProblem('warning', 'Macros', DESPUES)).not.toBeNull();
	});

	it('rechaza una clase inventada', () => {
		expect(sanctionProblem('destierro', 'Macros', null)).not.toBeNull();
	});
});

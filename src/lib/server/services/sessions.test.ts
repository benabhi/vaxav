/** Las sesiones se abren, se resuelven y se cierran del lado del servidor. */

import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { authSession } from '../db/schema';
import { crearPiloto, seededDb } from '../db/testing';
import { closeSession, openSession, pilotForToken } from './sessions';

describe('las sesiones', () => {
	it('resuelven a su piloto', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const token = openSession(db, piloto.id);
		expect(pilotForToken(db, token)?.id).toBe(piloto.id);
	});

	it('dan tokens distintos a dos sesiones del mismo piloto', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		expect(openSession(db, piloto.id)).not.toBe(openSession(db, piloto.id));
	});

	it('no resuelven un token desconocido', () => {
		expect(pilotForToken(seededDb(), 'token-inventado')).toBeNull();
	});

	it('no resuelven sin token', () => {
		expect(pilotForToken(seededDb(), '')).toBeNull();
	});

	it('invalidan el token al cerrarse', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const token = openSession(db, piloto.id);
		closeSession(db, token);
		expect(pilotForToken(db, token)).toBeNull();
	});

	it('no fallan al cerrar una que ya no existe', () => {
		const db = seededDb();
		expect(() => closeSession(db, 'token-inventado')).not.toThrow();
		expect(() => closeSession(db, '')).not.toThrow();
	});

	it('no valen vencidas, y se borran al consultarlas', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const vencida = db
			.insert(authSession)
			.values({
				pilotId: piloto.id,
				token: 'token-vencido',
				expiresAt: new Date(Date.now() - 1000)
			})
			.returning()
			.get();

		expect(pilotForToken(db, 'token-vencido')).toBeNull();
		expect(
			db.select().from(authSession).where(eq(authSession.id, vencida.id)).get()
		).toBeUndefined();
	});
});

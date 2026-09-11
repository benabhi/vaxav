/**
 * Sesiones: abrir, resolver y cerrar el vínculo entre un navegador y un piloto.
 *
 * El token vive en una cookie y su contraparte en la base. Que la sesión sea una
 * fila y no sólo una cookie firmada permite cerrarla del lado del servidor: al
 * salir se borra la fila y el token deja de valer, aunque alguien lo conserve.
 */

import { randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import type { Db } from '../db/types';
import { authSession, pilot, type Pilot } from '../db/schema';

/**
 * Un mes sin volver a escribir la contraseña. Es un juego de sesiones cortas y
 * frecuentes: pedir la clave cada vez sería un peaje diario sin nada a cambio.
 */
export const SESSION_DURATION_SECONDS = 30 * 24 * 60 * 60;

/** 32 bytes de entropía, en texto seguro para cookies. */
const TOKEN_BYTES = 32;

/** Abre una sesión para el piloto y devuelve el token que va a la cookie. */
export function openSession(db: Db, pilotId: number): string {
	const token = randomBytes(TOKEN_BYTES).toString('base64url');
	const expiresAt = new Date(Date.now() + SESSION_DURATION_SECONDS * 1000);
	db.insert(authSession).values({ pilotId, token, expiresAt }).run();
	return token;
}

/**
 * Devuelve el piloto de una sesión vigente, o `null`.
 *
 * Una sesión vencida se borra en el momento en que se la consulta: no hace falta
 * una tarea de limpieza para lo que se descubre solo.
 */
export function pilotForToken(db: Db, token: string): Pilot | null {
	if (!token) return null;

	const found = db.select().from(authSession).where(eq(authSession.token, token)).get();
	if (!found) return null;

	if (found.expiresAt.getTime() <= Date.now()) {
		db.delete(authSession).where(eq(authSession.id, found.id)).run();
		return null;
	}

	return db.select().from(pilot).where(eq(pilot.id, found.pilotId)).get() ?? null;
}

/** Cierra la sesión de ese token. No falla si ya no existe. */
export function closeSession(db: Db, token: string): void {
	if (!token) return;
	db.delete(authSession).where(eq(authSession.token, token)).run();
}

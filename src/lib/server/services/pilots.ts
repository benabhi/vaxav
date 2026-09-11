/**
 * Alta y consulta de pilotos.
 *
 * Es la capa que junta las reglas del juego con las tablas. Todas las funciones
 * reciben la base como primer argumento en vez de abrirla adentro: así se las
 * puede probar contra una base en memoria y quien llama controla la
 * transacción.
 */

import { count, eq, sql } from 'drizzle-orm';
import { pilot, pilotSkill, type Pilot } from '../db/schema';
import type { Db } from '../db/types';
import { getFaction } from '../game/factions';
import { getProfession, startingXp } from '../game/professions';
import { hashPassword, needsRehash, verifyPassword } from './passwords';
import { createStarterShip } from './ships';
import { UniverseError, requireStation } from './universe';

export const CALLSIGN_MIN_LENGTH = 3;
export const CALLSIGN_MAX_LENGTH = 20;
/**
 * Letras, números, guion y guion bajo. Sin espacios: el distintivo se escribe
 * para entrar, y un espacio de más es un problema que no vale la pena tener.
 */
const CALLSIGN_PATTERN = /^[A-Za-z0-9_-]+$/;

export const PASSWORD_MIN_LENGTH = 8;

export const EMAIL_MAX_LENGTH = 254;
/**
 * No se valida el correo con una expresión exhaustiva a propósito: la única
 * prueba real de que un correo existe es mandarle algo. Acá sólo se descartan
 * los que seguro no sirven.
 */
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Algo impide crear o autenticar al piloto. El mensaje se le muestra al jugador. */
export class PilotError extends Error {}

/** Devuelve el motivo por el que un distintivo no sirve, o `null` si sirve. */
export function validateCallsign(callsign: string): string | null {
	if (!callsign) return 'Elegí un distintivo.';
	if (callsign.length < CALLSIGN_MIN_LENGTH) {
		return `El distintivo necesita al menos ${CALLSIGN_MIN_LENGTH} caracteres.`;
	}
	if (callsign.length > CALLSIGN_MAX_LENGTH) {
		return `El distintivo no puede pasar de ${CALLSIGN_MAX_LENGTH} caracteres.`;
	}
	if (!CALLSIGN_PATTERN.test(callsign)) {
		return 'El distintivo sólo admite letras, números, guion y guion bajo.';
	}
	return null;
}

/** Devuelve el motivo por el que un correo no sirve, o `null` si sirve. */
export function validateEmail(email: string): string | null {
	if (!email) return 'Escribí un correo.';
	if (email.length > EMAIL_MAX_LENGTH) return 'Ese correo es demasiado largo.';
	if (!EMAIL_PATTERN.test(email)) return 'Ese correo no parece un correo.';
	return null;
}

/** Devuelve el motivo por el que una contraseña no sirve, o `null` si sirve. */
export function validatePassword(password: string): string | null {
	if (password.length < PASSWORD_MIN_LENGTH) {
		return `La contraseña necesita al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
	}
	return null;
}

/**
 * Valida los datos de la cuenta, sin tocar la base.
 *
 * Junta las tres validaciones sueltas más la repetición de la contraseña, que es
 * lo que necesita cualquier formulario de alta. Que sea una función pura la hace
 * probable sin levantar nada.
 */
export function validateCredentials(
	callsign: string,
	email: string,
	password: string,
	confirmation: string
): string | null {
	const problems = [
		validateCallsign(callsign.trim()),
		validateEmail(email.trim()),
		validatePassword(password)
	];
	for (const problem of problems) if (problem) return problem;
	if (password !== confirmation) return 'Las contraseñas no coinciden.';
	return null;
}

/**
 * Busca un piloto por distintivo, sin distinguir mayúsculas.
 *
 * Que `Halcon` y `halcon` sean el mismo piloto evita el clásico registro gemelo
 * que sólo se diferencia por una mayúscula.
 */
export function findByCallsign(db: Db, callsign: string): Pilot | null {
	return (
		db
			.select()
			.from(pilot)
			.where(sql`lower(${pilot.callsign}) = ${callsign.toLowerCase()}`)
			.get() ?? null
	);
}

/** ¿Ya hay un piloto con ese distintivo? */
export function callsignTaken(db: Db, callsign: string): boolean {
	return findByCallsign(db, callsign) !== null;
}

/** Busca un piloto por correo, sin distinguir mayúsculas. */
export function findByEmail(db: Db, email: string): Pilot | null {
	return (
		db
			.select()
			.from(pilot)
			.where(sql`lower(${pilot.email}) = ${email.toLowerCase()}`)
			.get() ?? null
	);
}

/** ¿Ya hay un piloto con ese correo? */
export function emailTaken(db: Db, email: string): boolean {
	return findByEmail(db, email) !== null;
}

/**
 * Da de alta un piloto completo y lo devuelve.
 *
 * Completo quiere decir con todo lo que necesita para jugar desde el primer
 * minuto: sus habilidades iniciales según la profesión y la estación de partida
 * de su facción. Un piloto a medias no debería poder existir, así que las tres
 * escrituras van en una transacción.
 */
export async function createPilot(
	db: Db,
	callsign: string,
	email: string,
	password: string,
	profession: string,
	faction: string
): Promise<Pilot> {
	callsign = callsign.trim();
	email = email.trim();

	const problems = [validateCallsign(callsign), validateEmail(email), validatePassword(password)];
	for (const problem of problems) if (problem) throw new PilotError(problem);

	let chosenProfession;
	let chosenFaction;
	try {
		chosenProfession = getProfession(profession);
		chosenFaction = getFaction(faction);
	} catch {
		throw new PilotError('Elegí una profesión y una facción de la lista.');
	}

	if (callsignTaken(db, callsign)) throw new PilotError(`Ya hay un piloto llamado ${callsign}.`);
	if (emailTaken(db, email)) throw new PilotError('Ese correo ya está usado por otro piloto.');

	// La estación de partida tiene que existir en el universo sembrado; si no, el
	// error dice qué falta en vez de reventar por una clave foránea.
	let home;
	try {
		home = requireStation(db, chosenFaction.startingStation);
	} catch (error) {
		if (error instanceof UniverseError) throw new PilotError(error.message);
		throw error;
	}

	// El hash va antes de la transacción: es lo único lento de todo esto, y
	// mantenerlo afuera deja la escritura tan corta como puede ser.
	const passwordHash = await hashPassword(password);

	return db.transaction((tx) => {
		const created = tx
			.insert(pilot)
			.values({
				callsign,
				email,
				passwordHash,
				profession: chosenProfession.code,
				faction: chosenFaction.code,
				locationId: home.id
			})
			.returning()
			.get();

		const skills = Object.entries(startingXp(chosenProfession.code)).map(([skill, xp]) => ({
			pilotId: created.id,
			skill,
			xp
		}));
		if (skills.length) tx.insert(pilotSkill).values(skills).run();

		// Y su nave. Un piloto sin nave no puede hacer nada: sería un piloto a
		// medias, que es justo lo que este servicio se propuso no dejar existir.
		createStarterShip(tx, created.id);

		return created;
	});
}

/**
 * Devuelve el piloto si el distintivo y la contraseña coinciden.
 *
 * Devuelve `null` sin distinguir entre "no existe" y "la contraseña está mal":
 * decirlo revelaría qué distintivos están registrados.
 */
export async function authenticate(
	db: Db,
	callsign: string,
	password: string
): Promise<Pilot | null> {
	const found = findByCallsign(db, callsign.trim());
	if (found === null) {
		// Se hashea igual una contraseña descartable para que responder a un
		// distintivo inexistente tarde lo mismo que responder a uno real.
		await hashPassword(password);
		return null;
	}

	if (!(await verifyPassword(found.passwordHash, password))) return null;

	// Es el único momento en que tenemos la contraseña en claro para poder
	// rehacer un hash que quedó viejo.
	if (await needsRehash(found.passwordHash)) {
		const passwordHash = await hashPassword(password);
		return db.update(pilot).set({ passwordHash }).where(eq(pilot.id, found.id)).returning().get();
	}

	return found;
}

/**
 * Cambia la contraseña del piloto, verificando primero la actual.
 *
 * Pedir la actual —y no dejar cambiarla sólo por tener la sesión abierta— es lo
 * que impide que alguien que encuentra la sesión abierta en un piloto ajeno se
 * quede con la cuenta.
 */
export async function changePassword(
	db: Db,
	row: Pilot,
	currentPassword: string,
	newPassword: string,
	confirmation: string
): Promise<void> {
	if (!(await verifyPassword(row.passwordHash, currentPassword))) {
		throw new PilotError('La contraseña actual no es correcta.');
	}

	const problem = validatePassword(newPassword);
	if (problem) throw new PilotError(problem);
	if (newPassword !== confirmation) throw new PilotError('Las contraseñas nuevas no coinciden.');

	const passwordHash = await hashPassword(newPassword);
	db.update(pilot).set({ passwordHash }).where(eq(pilot.id, row.id)).run();
}

/**
 * Cuántos pilotos tiene cada facción.
 *
 * Se consulta agrupado y no una vez por facción: son tres hoy, pero la
 * diferencia importa el día que sean treinta.
 */
export function countByFaction(db: Db): Record<string, number> {
	const rows = db
		.select({ faction: pilot.faction, total: count(pilot.id) })
		.from(pilot)
		.groupBy(pilot.faction)
		.all();
	return Object.fromEntries(rows.map((row) => [row.faction, row.total]));
}

/** Experiencia acumulada del piloto, por código de habilidad. */
export function skillXp(db: Db, pilotId: number): Record<string, number> {
	const rows = db.select().from(pilotSkill).where(eq(pilotSkill.pilotId, pilotId)).all();
	return Object.fromEntries(rows.map((row) => [row.skill, row.xp]));
}

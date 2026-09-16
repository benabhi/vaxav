/**
 * Lo que un administrador le puede hacer a una cuenta ajena.
 *
 * Va aparte de `pilots.ts` porque son dos oficios con reglas distintas. Allá, un
 * piloto administra **lo suyo** y por eso cada operación le pide la contraseña:
 * es lo único que separa un clic mal dado de perder años de juego. Acá el que
 * opera no es el dueño, así que esa traba no existe y la que la reemplaza es el
 * permiso más el registro: **no hay forma de tocar una cuenta ajena sin que quede
 * escrito quién fue**.
 *
 * Lo que no está acá y no es un olvido: **los créditos no se escriben**. El saldo
 * lo escribe sólo `wallet.ts`, así que un ajuste es un asiento del libro mayor
 * como cualquier otro movimiento, con su motivo. La única diferencia es la razón
 * que queda anotada.
 *
 * Corresponde a docs/systems/ADMIN.md.
 */

import { eq } from 'drizzle-orm';
import {
	asteroidSurvey,
	authSession,
	body,
	container,
	creditEntry,
	fittedModule,
	itemEntry,
	itemStack,
	marketOrder,
	pilot,
	pilotAction,
	pilotLog,
	pilotPool,
	pilotRole,
	pilotSkill,
	sanction,
	ship,
	type Pilot
} from '../db/schema';
import { inArray } from 'drizzle-orm';
import type { Db } from '../db/types';
import { record } from './events';
import { hashPassword } from './passwords';
import { deletePortrait } from './portraits';
import { credit, debit } from './wallet';
import { ADMIN_ROLE, adminCount, rolesOf } from './roles';
import {
	callsignTaken,
	emailTaken,
	validateCallsign,
	validateEmail,
	validatePassword
} from './pilots';

/** No se pudo tocar la cuenta. El mensaje se le muestra a quien lo intentó. */
export class AccountError extends Error {}

/** Un piloto por su id, o `null`. */
export function pilotById(db: Db, pilotId: number): Pilot | null {
	return db.select().from(pilot).where(eq(pilot.id, pilotId)).get() ?? null;
}

/** Deja constancia de un cambio sobre una cuenta ajena. */
function anotar(db: Db, objetivo: Pilot, campo: string, actor: Pilot | null, extra = {}): void {
	record(db, {
		kind: 'account.edited',
		actorId: actor?.id ?? null,
		subject: { kind: 'pilot', id: objetivo.id },
		payload: { actor: actor?.callsign, callsign: objetivo.callsign, field: campo, ...extra }
	});
}

/**
 * Le cambia el distintivo.
 *
 * **Le cierra las sesiones**, y no por seguridad: un piloto que de golpe se llama
 * distinto sin haber hecho nada merece enterarse al volver a entrar, no descubrir
 * el cambio a mitad de una pantalla.
 */
export function renamePilot(db: Db, pilotId: number, callsign: string, actor: Pilot | null): void {
	const objetivo = pilotById(db, pilotId);
	if (!objetivo) throw new AccountError('Ese piloto no existe.');

	const limpio = callsign.trim();
	const problema = validateCallsign(limpio);
	if (problema) throw new AccountError(problema);
	if (limpio === objetivo.callsign) return;
	if (callsignTaken(db, limpio)) throw new AccountError(`Ya hay un piloto llamado ${limpio}.`);

	db.transaction((tx) => {
		tx.update(pilot).set({ callsign: limpio }).where(eq(pilot.id, pilotId)).run();
		tx.delete(authSession).where(eq(authSession.pilotId, pilotId)).run();

		anotar(tx, objetivo, 'el distintivo', actor, { to: limpio });
	});
}

/** Le cambia el correo. */
export function setEmail(db: Db, pilotId: number, email: string, actor: Pilot | null): void {
	const objetivo = pilotById(db, pilotId);
	if (!objetivo) throw new AccountError('Ese piloto no existe.');

	const limpio = email.trim();
	const problema = validateEmail(limpio);
	if (problema) throw new AccountError(problema);
	if (limpio === objetivo.email) return;
	if (emailTaken(db, limpio)) throw new AccountError('Ese correo ya está usado por otro piloto.');

	db.transaction((tx) => {
		tx.update(pilot).set({ email: limpio }).where(eq(pilot.id, pilotId)).run();
		anotar(tx, objetivo, 'el correo', actor);
	});
}

/**
 * Le pone una contraseña nueva **sin pedir la anterior**.
 *
 * Es la diferencia de fondo con `changePassword`: ahí el dueño demuestra que es
 * el dueño, y acá el administrador no puede. Por eso le cierra todas las sesiones
 * —incluida la del que la estuviera usando— y por eso queda anotado. Lo que no
 * queda anotada nunca, ni acá ni en ningún lado, es la contraseña.
 */
export async function resetPassword(
	db: Db,
	pilotId: number,
	password: string,
	actor: Pilot | null
): Promise<void> {
	const objetivo = pilotById(db, pilotId);
	if (!objetivo) throw new AccountError('Ese piloto no existe.');

	const problema = validatePassword(password);
	if (problema) throw new AccountError(problema);

	const passwordHash = await hashPassword(password);

	db.transaction((tx) => {
		tx.update(pilot).set({ passwordHash }).where(eq(pilot.id, pilotId)).run();
		tx.delete(authSession).where(eq(authSession.pilotId, pilotId)).run();

		anotar(tx, objetivo, 'la contraseña', actor);
	});
}

/**
 * Lo mueve a otro cuerpo del universo.
 *
 * Sirve para sacar a alguien de un lugar que dejó de existir, o de uno donde
 * quedó trabado. **No le cancela la orden en curso**: si estaba viajando, la
 * resolución lo va a mover igual a donde iba, que es lo que el jugador esperaba.
 */
export function movePilot(db: Db, pilotId: number, bodyId: number, actor: Pilot | null): void {
	const objetivo = pilotById(db, pilotId);
	if (!objetivo) throw new AccountError('Ese piloto no existe.');

	const destino = db.select().from(body).where(eq(body.id, bodyId)).get();
	if (!destino) throw new AccountError('Ese cuerpo no existe.');

	db.transaction((tx) => {
		tx.update(pilot).set({ locationId: bodyId }).where(eq(pilot.id, pilotId)).run();
		anotar(tx, objetivo, 'la ubicación', actor, { to: destino.name });
	});
}

/**
 * Le suma o le resta créditos, **con un asiento del libro mayor**.
 *
 * No escribe el saldo: llama a `wallet.ts` como cualquier otro movimiento del
 * juego, así que la auditoría del libro sigue cuadrando. Un ajuste que tocara
 * `pilot.credits` a mano rompería la única garantía que tiene la economía.
 */
export function adjustCredits(
	db: Db,
	pilotId: number,
	amount: number,
	reason: string,
	actor: Pilot | null
): void {
	const objetivo = pilotById(db, pilotId);
	if (!objetivo) throw new AccountError('Ese piloto no existe.');

	if (!Number.isInteger(amount) || amount === 0) {
		throw new AccountError('El ajuste es un número entero distinto de cero.');
	}
	if (!reason.trim()) throw new AccountError('Escribí el motivo del ajuste.');

	const memo = reason.trim();

	db.transaction((tx) => {
		if (amount > 0) credit(tx, pilotId, amount, { kind: 'adjustment', memo });
		else debit(tx, pilotId, -amount, { kind: 'adjustment', memo });

		record(tx, {
			kind: 'account.credited',
			actorId: actor?.id ?? null,
			subject: { kind: 'pilot', id: pilotId },
			payload: {
				actor: actor?.callsign,
				callsign: objetivo.callsign,
				amount,
				reason: memo
			}
		});
	});
}

/** Qué retiene a una cuenta, o vacío si se puede dar de baja. */
export function accountBlockers(
	db: Db,
	pilotId: number,
	actorId: number | null
): readonly string[] {
	const motivos: string[] = [];

	if (actorId !== null && pilotId === actorId) {
		motivos.push('Es tu propia cuenta: dala de baja desde Opciones.');
	}

	const suyos = rolesOf(db, pilotId);
	if (suyos.some((rol) => rol.code === ADMIN_ROLE) && adminCount(db) <= 1) {
		motivos.push('Es el único administrador: pasale el rol a otro primero.');
	}

	return motivos;
}

/**
 * Borra la cuenta y todo lo que colgaba de ella.
 *
 * Es la versión de administración de `deleteAccount`: el mismo orden de borrado
 * —de las hojas a la raíz, porque las claves foráneas están activas— **sin pedir
 * la contraseña**, que el administrador no tiene. Lo que la autoriza es el
 * permiso; lo que la hace revisable es el registro, que sobrevive a la fila
 * borrada porque no cuelga de ella.
 */
export function deletePilot(db: Db, pilotId: number, actor: Pilot | null): void {
	const objetivo = pilotById(db, pilotId);
	if (!objetivo) throw new AccountError('Ese piloto no existe.');

	const retienen = accountBlockers(db, pilotId, actor?.id ?? null);
	if (retienen.length > 0) {
		throw new AccountError(`No se puede dar de baja a ${objetivo.callsign}. ${retienen.join(' ')}`);
	}

	db.transaction((tx) => {
		const naves = tx.select().from(ship).where(eq(ship.pilotId, pilotId)).all();
		const propios = tx.select().from(container).where(eq(container.pilotId, pilotId)).all();
		const deNaves = naves.length
			? tx
					.select()
					.from(container)
					.where(
						inArray(
							container.shipId,
							naves.map((nave) => nave.id)
						)
					)
					.all()
			: [];
		const ids = [...new Set([...propios, ...deNaves].map((fila) => fila.id))];

		tx.delete(asteroidSurvey).where(eq(asteroidSurvey.pilotId, pilotId)).run();
		tx.delete(marketOrder).where(eq(marketOrder.pilotId, pilotId)).run();
		tx.delete(creditEntry).where(eq(creditEntry.pilotId, pilotId)).run();
		tx.delete(pilotLog).where(eq(pilotLog.pilotId, pilotId)).run();
		tx.delete(pilotAction).where(eq(pilotAction.pilotId, pilotId)).run();
		tx.delete(pilotPool).where(eq(pilotPool.pilotId, pilotId)).run();
		tx.delete(pilotSkill).where(eq(pilotSkill.pilotId, pilotId)).run();
		tx.delete(authSession).where(eq(authSession.pilotId, pilotId)).run();
		tx.delete(sanction).where(eq(sanction.pilotId, pilotId)).run();

		tx.delete(pilotRole).where(eq(pilotRole.pilotId, pilotId)).run();
		tx.update(pilotRole).set({ grantedBy: null }).where(eq(pilotRole.grantedBy, pilotId)).run();

		if (ids.length) {
			tx.delete(itemEntry).where(inArray(itemEntry.containerId, ids)).run();
			tx.delete(itemStack).where(inArray(itemStack.containerId, ids)).run();
			tx.delete(container).where(inArray(container.id, ids)).run();
		}

		for (const nave of naves) {
			tx.delete(fittedModule).where(eq(fittedModule.shipId, nave.id)).run();
		}
		tx.delete(ship).where(eq(ship.pilotId, pilotId)).run();

		tx.delete(pilot).where(eq(pilot.id, pilotId)).run();

		record(tx, {
			kind: 'account.deleted',
			actorId: actor?.id ?? null,
			subject: { kind: 'pilot', id: pilotId },
			payload: {
				actor: actor?.callsign,
				callsign: objetivo.callsign,
				faction: objetivo.faction
			}
		});
	});

	// El retrato es un archivo y no una fila, así que sale después de que la
	// transacción cerró: si el borrado se hubiera deshecho, sería una lástima
	// haberle tirado la foto a una cuenta que sigue existiendo.
	deletePortrait(pilotId);
}

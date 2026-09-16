/**
 * Moderación: sancionar una cuenta, levantarle la sanción y saber si puede entrar.
 *
 * Va aparte de `pilots.ts` porque es otro oficio. Aquél es el alta y la identidad
 * de un piloto —lo que el propio jugador administra— y esto es lo que se le hace
 * desde afuera. Mezclarlos pondría las dos cosas que más se miran en el mismo
 * módulo de quinientas líneas.
 *
 * **Tres reglas gobiernan lo de acá:**
 *
 * 1. **Toda sanción lleva motivo**, y queda. No se edita ni se borra: se levanta,
 *    y el levantamiento también queda escrito. Un historial de moderación que se
 *    puede retocar no sirve para lo único que sirve.
 * 2. **Sancionar cierra la puerta en el acto.** No alcanza con que el próximo
 *    ingreso rebote: las sesiones abiertas se cierran, o el baneado sigue jugando
 *    hasta que se le ocurra salir.
 * 3. **Nadie se sanciona a sí mismo, y el último administrador no se sanciona.**
 *    Lo primero es un accidente caro; lo segundo deja el juego sin cuartel.
 *
 * Corresponde a docs/systems/ADMIN.md.
 */

import { and, desc, eq, isNull } from 'drizzle-orm';
import { authSession, pilot, sanction, type Pilot, type Sanction } from '../db/schema';
import type { Db } from '../db/types';
import { record } from './events';
import { ADMIN_ROLE, adminCount, rolesOf } from './roles';
import {
	SANCTIONS,
	blockingSanction,
	isSanctionKind,
	sanctionLabel,
	sanctionProblem,
	type SanctionKind
} from '$lib/sanctions';

/** No se pudo moderar. El mensaje se le muestra a quien lo intentó. */
export class ModerationError extends Error {}

/** Lo que hace falta para poner una sanción. */
export interface SanctionDraft {
	readonly kind: SanctionKind;
	readonly reason: string;
	/** Hasta cuándo, sólo para una suspensión. */
	readonly until: Date | null;
}

/** Las sanciones de un piloto, de la más nueva a la más vieja. */
export function sanctionsOf(db: Db, pilotId: number): readonly Sanction[] {
	return db
		.select()
		.from(sanction)
		.where(eq(sanction.pilotId, pilotId))
		.orderBy(desc(sanction.createdAt), desc(sanction.id))
		.all();
}

/**
 * La sanción que le cierra la puerta ahora mismo, o `null` si puede entrar.
 *
 * Quién gana entre varias lo decide `blockingSanction`, que es pura y está
 * probada aparte: un baneo le gana a cualquier suspensión, y entre dos
 * suspensiones gana la que termina más tarde.
 */
export function blockedBy(db: Db, pilotId: number, now = new Date()): Sanction | null {
	return blockingSanction(sanctionsOf(db, pilotId), now);
}

/** Los avisos sin leer todavía no existen; esto es sólo para mostrar el último. */
export function lastWarning(db: Db, pilotId: number): Sanction | null {
	return (
		db
			.select()
			.from(sanction)
			.where(and(eq(sanction.pilotId, pilotId), eq(sanction.kind, 'warning')))
			.orderBy(desc(sanction.createdAt))
			.get() ?? null
	);
}

/** Cuántas sanciones tiene puestas cada piloto, por id. Una consulta y no una por fila. */
export function activeCounts(db: Db, now = new Date()): Readonly<Record<number, number>> {
	const conteo: Record<number, number> = {};

	for (const una of db.select().from(sanction).where(isNull(sanction.liftedAt)).all()) {
		if (una.until !== null && una.until.getTime() <= now.getTime()) continue;
		conteo[una.pilotId] = (conteo[una.pilotId] ?? 0) + 1;
	}

	return conteo;
}

/** Que el piloto al que se apunta se pueda tocar. */
function checkTarget(db: Db, target: Pilot, actorId: number | null, verbo: string): void {
	if (actorId !== null && target.id === actorId) {
		throw new ModerationError(`No podés ${verbo} tu propia cuenta.`);
	}

	// Sin esto, el último administrador se puede dejar afuera del cuartel y no
	// queda ninguna pantalla desde donde volver a entrar.
	const suyos = rolesOf(db, target.id);
	if (suyos.some((rol) => rol.code === ADMIN_ROLE) && adminCount(db) <= 1) {
		throw new ModerationError(
			`${target.callsign} es el único administrador: pasale el rol a otro antes de ${verbo}lo.`
		);
	}
}

/**
 * Sanciona una cuenta.
 *
 * Si la sanción cierra la puerta, **le cierra las sesiones en el momento**. Un
 * baneo que recién surte efecto en el próximo ingreso es un baneo que el baneado
 * decide cuándo empieza.
 */
export function punish(
	db: Db,
	pilotId: number,
	draft: SanctionDraft,
	actor: Pilot | null
): Sanction {
	const objetivo = db.select().from(pilot).where(eq(pilot.id, pilotId)).get();
	if (!objetivo) throw new ModerationError('Ese piloto no existe.');

	const problema = sanctionProblem(draft.kind, draft.reason, draft.until);
	if (problema) throw new ModerationError(problema);

	const spec = SANCTIONS[draft.kind];
	if (spec.blocks) checkTarget(db, objetivo, actor?.id ?? null, 'sancionar');

	if (draft.until !== null && draft.until.getTime() <= Date.now()) {
		throw new ModerationError('Esa fecha ya pasó: la suspensión nacería vencida.');
	}

	return db.transaction((tx) => {
		const puesta = tx
			.insert(sanction)
			.values({
				pilotId,
				kind: draft.kind,
				reason: draft.reason.trim(),
				until: draft.until,
				issuedBy: actor?.id ?? null,
				issuedByName: actor?.callsign ?? ''
			})
			.returning()
			.get();

		// La puerta se cierra ahora, no en el próximo ingreso.
		if (spec.blocks) tx.delete(authSession).where(eq(authSession.pilotId, pilotId)).run();

		record(tx, {
			kind: 'account.sanctioned',
			actorId: actor?.id ?? null,
			subject: { kind: 'pilot', id: pilotId },
			payload: {
				actor: actor?.callsign,
				callsign: objetivo.callsign,
				sanction: sanctionLabel(draft.kind),
				reason: puesta.reason,
				until: draft.until ? draft.until.toISOString() : ''
			}
		});

		return puesta;
	});
}

/**
 * Levanta una sanción.
 *
 * No la borra: le pone la fecha y la firma de quien la levantó. Una sanción
 * borrada es una cuenta que parece limpia, y la próxima vez que alguien la mire
 * no va a saber que hubo algo.
 */
export function lift(db: Db, sanctionId: number, reason: string, actor: Pilot | null): void {
	const puesta = db.select().from(sanction).where(eq(sanction.id, sanctionId)).get();
	if (!puesta) throw new ModerationError('Esa sanción no existe.');
	if (puesta.liftedAt !== null) throw new ModerationError('Esa sanción ya estaba levantada.');

	const objetivo = db.select().from(pilot).where(eq(pilot.id, puesta.pilotId)).get();

	db.transaction((tx) => {
		tx.update(sanction)
			.set({
				liftedAt: new Date(),
				liftedBy: actor?.id ?? null,
				liftedByName: actor?.callsign ?? ''
			})
			.where(eq(sanction.id, sanctionId))
			.run();

		record(tx, {
			kind: 'account.lifted',
			actorId: actor?.id ?? null,
			subject: { kind: 'pilot', id: puesta.pilotId },
			payload: {
				actor: actor?.callsign,
				callsign: objetivo?.callsign ?? '—',
				sanction: sanctionLabel(puesta.kind),
				reason: reason.trim()
			}
		});
	});
}

/**
 * Cómo se le explica a un piloto por qué no puede entrar.
 *
 * La frase la arma el servidor y no la pantalla porque la usan dos: la pantalla
 * de la cuenta suspendida y el error del ingreso. Dice **qué**, **por qué** y
 * **hasta cuándo**, que son las tres cosas que se preguntan; lo que no dice es
 * quién la puso, que no le corresponde saber.
 */
export function blockedMessage(fila: Sanction): string {
	const nombre = isSanctionKind(fila.kind) ? SANCTIONS[fila.kind].label.toLowerCase() : fila.kind;
	const hasta = fila.until
		? ` Vence el ${fila.until.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}.`
		: '';

	return `Tu cuenta tiene un ${nombre}: ${fila.reason}.${hasta}`;
}

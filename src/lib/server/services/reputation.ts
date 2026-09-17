/**
 * La reputación del piloto: el saldo con cada uno y el libro que lo explica.
 *
 * Misma regla que la billetera, y por el mismo motivo: **todo movimiento deja
 * asiento**, y el valor es la suma de los asientos y no un número que se edita.
 * Ver docs/systems/ARCHITECTURE.md §4. Acá la razón es todavía más directa que
 * con la plata: el jugador va a querer saber de dónde salieron esos doce puntos,
 * y el histórico que muestra la pantalla **es** este libro.
 *
 * Con la misma salvedad práctica: `standing.value` es el caché que se lee en cada
 * pantalla, y lo que se prohíbe es *editarlo*, no cachearlo. De ahí la regla dura:
 *
 * > **`reputation.ts` es el único lugar del repositorio que escribe `standing`.**
 *
 * Hay un test que lo verifica recorriendo el código. Para mover reputación desde
 * otro lado se llama a `award`, no se toca la tabla.
 *
 * Todo va en **milésimas enteras**: la escala y cuánto sube cada misión se
 * deciden en `src/lib/game/reputation.ts`. Corresponde a docs/systems/MISSIONS.md.
 */

import { and, count, desc, eq, sql } from 'drizzle-orm';
import { corporation, standing, standingEntry, type StandingEntry } from '../db/schema';
import type { Db } from '../db/types';
import { FACTIONS } from '$lib/game/factions';
import { MAX_REPUTATION_RAW, MIN_REPUTATION_RAW } from '$lib/game/reputation';

/** No se puede mover la reputación. El mensaje se le muestra al jugador. */
export class ReputationError extends Error {}

/**
 * Con quién se tiene reputación.
 *
 * Las dos que hoy abren trabajo. La del agente va a sumarse el día que haga algo
 * además de existir; el esquema ya le deja lugar, y declararla acá sin que nadie
 * la escriba sería prometer una mecánica que no hay.
 */
export const STANDING_KINDS = ['corporation', 'faction'] as const;
export type StandingKind = (typeof STANDING_KINDS)[number];

/** A quién le importa este número. */
export interface StandingSubject {
	readonly kind: StandingKind;
	readonly code: string;
}

/** Por qué se movió la reputación. Queda escrito en el asiento. */
export const REPUTATION_MOVES = [
	/** Una misión terminada, que es la fuente de verdad del sistema. */
	'mission',
	/** Un ajuste del cuartel general, o de la siembra. */
	'adjustment'
] as const;
export type ReputationMove = (typeof REPUTATION_MOVES)[number];

/** Lo que hace falta para escribir un asiento. */
export interface StandingNote {
	readonly kind: ReputationMove;
	readonly memo?: string;
}

/**
 * Todo lo que un piloto tiene, por código.
 *
 * Va como dos diccionarios y no como una lista porque quien lo consume pregunta
 * siempre por uno: «¿cuánto tengo con ésta?». **Lo que no está es cero**, así que
 * el que lee usa un valor por omisión en vez de asumir que la clave existe.
 */
export interface PilotStandings {
	readonly corporations: Readonly<Record<string, number>>;
	readonly factions: Readonly<Record<string, number>>;
}

/** Un piloto del que no se sabe nada todavía: todos los caminos en cero. */
export const NO_STANDINGS: PilotStandings = { corporations: {}, factions: {} };

/** Que el sujeto exista de verdad, para no dejar una fila huérfana. */
function requireSubject(db: Db, subject: StandingSubject): void {
	if (!subject.code) throw new ReputationError('Falta con quién.');

	if (subject.kind === 'faction') {
		if (!(subject.code in FACTIONS)) {
			throw new ReputationError(`No existe la facción ${subject.code}.`);
		}
		return;
	}

	const fila = db
		.select({ id: corporation.id })
		.from(corporation)
		.where(eq(corporation.code, subject.code))
		.get();
	if (!fila) throw new ReputationError(`No existe la corporación ${subject.code}.`);
}

/** Lo que el piloto tiene con ese sujeto. Sin fila es cero. */
export function standingOf(db: Db, pilotId: number, subject: StandingSubject): number {
	const fila = db
		.select({ value: standing.value })
		.from(standing)
		.where(
			and(
				eq(standing.pilotId, pilotId),
				eq(standing.subjectKind, subject.kind),
				eq(standing.subjectCode, subject.code)
			)
		)
		.get();
	return fila?.value ?? MIN_REPUTATION_RAW;
}

/**
 * Todo lo del piloto, de una sola consulta.
 *
 * De una y no de una por corporación: la ficha de una estación pregunta por
 * cuatro agentes de tres corporaciones distintas, y eso tiene que costar lo mismo
 * que preguntar por uno.
 */
export function pilotStandings(db: Db, pilotId: number): PilotStandings {
	const filas = db
		.select({ kind: standing.subjectKind, code: standing.subjectCode, value: standing.value })
		.from(standing)
		.where(eq(standing.pilotId, pilotId))
		.all();

	const corporations: Record<string, number> = {};
	const factions: Record<string, number> = {};
	for (const fila of filas) {
		if (fila.kind === 'faction') factions[fila.code] = fila.value;
		else corporations[fila.code] = fila.value;
	}
	return { corporations, factions };
}

/**
 * Mueve la reputación y lo asienta, en una sola transacción.
 *
 * `amount` va con signo y en milésimas. **Se recorta a la escala**: lo que
 * pasaría de cien o bajaría de cero se guarda ya recortado, así el asiento dice
 * lo que de verdad pasó y la suma del libro sigue dando el caché. Un asiento de
 * «+1,00» sobre un piloto que estaba a 0,30 del techo sería una mentira prolija.
 *
 * Que el piso sea cero y no un número negativo es una decisión abierta —ver «Por
 * decidir» en docs/systems/MISSIONS.md—: hoy nadie te odia, sólo no te conoce.
 */
export function award(
	db: Db,
	pilotId: number,
	subject: StandingSubject,
	amount: number,
	note: StandingNote
): StandingEntry {
	if (!Number.isInteger(amount)) throw new ReputationError('La reputación se mueve en enteros');
	requireSubject(db, subject);

	return db.transaction((tx) => {
		// Se relee adentro de la transacción: entre que la pantalla mostró el número
		// y llegó este pedido, el piloto pudo terminar otra misión.
		const antes = standingOf(tx, pilotId, subject);
		const despues = Math.min(MAX_REPUTATION_RAW, Math.max(MIN_REPUTATION_RAW, antes + amount));
		const movido = despues - antes;
		const cuando = new Date();

		tx.insert(standing)
			.values({
				pilotId,
				subjectKind: subject.kind,
				subjectCode: subject.code,
				value: despues,
				updatedAt: cuando
			})
			.onConflictDoUpdate({
				target: [standing.pilotId, standing.subjectKind, standing.subjectCode],
				set: { value: despues, updatedAt: cuando }
			})
			.run();

		return tx
			.insert(standingEntry)
			.values({
				pilotId,
				subjectKind: subject.kind,
				subjectCode: subject.code,
				amount: movido,
				valueAfter: despues,
				kind: note.kind,
				memo: note.memo ?? ''
			})
			.returning()
			.get();
	});
}

/** Cuántas filas por página tiene el histórico. */
export const STANDING_PAGE_SIZE = 12;

/** Una página del libro, con lo que hace falta para dibujar el paginador. */
export interface StandingPage {
	readonly entries: readonly StandingEntry[];
	readonly total: number;
	readonly page: number;
	readonly pages: number;
}

/**
 * El histórico del piloto, de lo más nuevo a lo más viejo.
 *
 * Se pagina **en la base** y no en memoria: el libro crece para siempre, y
 * traerse seis años de asientos para cortarlos acá es el error que no se nota con
 * veinte movimientos y tumba la pantalla con veinte mil.
 *
 * Con `subject` se mira la historia con uno solo, que es la pestaña de su ficha;
 * sin él, la del piloto entera.
 */
export function standingHistory(
	db: Db,
	pilotId: number,
	subject: StandingSubject | null = null,
	page = 1,
	size = STANDING_PAGE_SIZE
): StandingPage {
	const donde = subject
		? and(
				eq(standingEntry.pilotId, pilotId),
				eq(standingEntry.subjectKind, subject.kind),
				eq(standingEntry.subjectCode, subject.code)
			)
		: eq(standingEntry.pilotId, pilotId);

	const total = db.select({ n: count() }).from(standingEntry).where(donde).get()?.n ?? 0;

	// Con el libro vacío sigue habiendo una página: la que dice que no pasó nada.
	const pages = Math.max(1, Math.ceil(total / size));
	const actual = Math.min(Math.max(1, Math.trunc(page) || 1), pages);

	const entries = db
		.select()
		.from(standingEntry)
		.where(donde)
		// Por id y no sólo por fecha: dos asientos del mismo segundo tienen que
		// salir siempre en el mismo orden, o la paginación repite o saltea filas.
		.orderBy(desc(standingEntry.createdAt), desc(standingEntry.id))
		.limit(size)
		.offset((actual - 1) * size)
		.all();

	return { entries, total, page: actual, pages };
}

/**
 * Si el valor cacheado coincide con lo que dice el libro.
 *
 * Devuelve `null` cuando cierra. Es la contrapartida de haber cacheado: si alguna
 * vez se separan, esto lo encuentra sin tener que sospechar primero.
 */
export function auditStanding(
	db: Db,
	pilotId: number,
	subject: StandingSubject
): { stored: number; ledger: number } | null {
	const stored = standingOf(db, pilotId, subject);
	const fila = db
		.select({ total: sql<number>`coalesce(sum(${standingEntry.amount}), 0)` })
		.from(standingEntry)
		.where(
			and(
				eq(standingEntry.pilotId, pilotId),
				eq(standingEntry.subjectKind, subject.kind),
				eq(standingEntry.subjectCode, subject.code)
			)
		)
		.get();
	const ledger = fila?.total ?? 0;

	return stored === ledger ? null : { stored, ledger };
}

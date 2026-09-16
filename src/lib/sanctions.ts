/**
 * Las sanciones: qué se le puede poner a una cuenta y qué efecto tiene.
 *
 * Vive en `$lib` y no bajo `server/` por lo mismo que los permisos: lo necesitan
 * los dos lados. El servidor para decidir si deja entrar, y la pantalla para
 * decirle al piloto por qué no puede.
 *
 * **Son tres y se distinguen por lo que hacen, no por lo graves que suenan.** Un
 * aviso queda escrito y no impide nada; una suspensión cierra la puerta hasta una
 * fecha; un baneo la cierra sin fecha. Inventar cinco niveles que se traducen a
 * las mismas dos consecuencias es un menú que no decide nada.
 *
 * Corresponde a docs/systems/ADMIN.md.
 */

export const SANCTION_KINDS = ['warning', 'suspension', 'ban'] as const;
export type SanctionKind = (typeof SANCTION_KINDS)[number];

/** Una clase de sanción, con lo que implica. */
export interface SanctionSpec {
	readonly code: SanctionKind;
	readonly label: string;
	/** Qué significa, escrito para quien la está por poner. */
	readonly summary: string;
	/** Si cierra la puerta. Un aviso no la cierra. */
	readonly blocks: boolean;
	/**
	 * Si lleva fecha de vencimiento.
	 *
	 * La suspensión la exige —una suspensión sin fecha es un baneo con otro
	 * nombre— y el baneo no la admite, que es lo que lo hace un baneo.
	 */
	readonly dated: boolean;
}

export const SANCTIONS: Readonly<Record<SanctionKind, SanctionSpec>> = {
	warning: {
		code: 'warning',
		label: 'Aviso',
		summary: 'Queda escrito y el piloto lo ve al entrar. No le impide nada.',
		blocks: false,
		dated: false
	},
	suspension: {
		code: 'suspension',
		label: 'Suspensión',
		summary: 'No puede entrar hasta la fecha que se le ponga. Vence sola.',
		blocks: true,
		dated: true
	},
	ban: {
		code: 'ban',
		label: 'Baneo',
		summary: 'No puede entrar. No vence: hay que levantarlo a mano.',
		blocks: true,
		dated: false
	}
};

/** El orden en que se ofrecen: de lo más leve a lo más grave. */
export const SANCTION_ORDER: readonly SanctionKind[] = ['warning', 'suspension', 'ban'];

/** Si ese código es una sanción del catálogo. */
export function isSanctionKind(code: string): code is SanctionKind {
	return SANCTION_KINDS.includes(code as SanctionKind);
}

/** Cómo se llama una sanción en pantalla. */
export function sanctionLabel(kind: string): string {
	return isSanctionKind(kind) ? SANCTIONS[kind].label : kind;
}

/** Lo mínimo que hace falta saber de una sanción para decidir si pesa. */
export interface SanctionState {
	readonly kind: string;
	/** Hasta cuándo, o `null` si no vence. */
	readonly until: Date | null;
	/** Cuándo se la levantó a mano, o `null` si sigue puesta. */
	readonly liftedAt: Date | null;
}

/**
 * Si una sanción está vigente en ese instante.
 *
 * Tres formas de no estarlo, y las tres importan: **levantada** a mano,
 * **vencida** por su fecha, o de una clase que no cierra nada. Un aviso nunca
 * está «vigente» en este sentido, aunque esté puesto: lo que se pregunta acá es
 * si pesa, no si existe.
 */
export function isBlocking(sanction: SanctionState, now: Date): boolean {
	if (!isSanctionKind(sanction.kind) || !SANCTIONS[sanction.kind].blocks) return false;
	if (sanction.liftedAt !== null) return false;
	if (sanction.until !== null && sanction.until.getTime() <= now.getTime()) return false;
	return true;
}

/**
 * La que le cierra la puerta al piloto, o `null` si puede entrar.
 *
 * Con varias vigentes gana **la que termina más tarde**, y un baneo —que no
 * vence— gana siempre. Es lo que evita que levantar una suspensión vieja abra la
 * puerta que un baneo nuevo había cerrado.
 */
export function blockingSanction<T extends SanctionState>(
	sanctions: readonly T[],
	now: Date
): T | null {
	let peor: T | null = null;

	for (const una of sanctions) {
		if (!isBlocking(una, now)) continue;
		if (peor === null) {
			peor = una;
			continue;
		}
		// Sin fecha es para siempre: nada la supera.
		if (peor.until === null) continue;
		if (una.until === null || una.until.getTime() > peor.until.getTime()) peor = una;
	}

	return peor;
}

/** Qué problema tiene una sanción que se está por poner, o `null` si ninguno. */
export function sanctionProblem(kind: string, reason: string, until: Date | null): string | null {
	if (!isSanctionKind(kind)) return 'Esa clase de sanción no existe.';
	if (!reason.trim()) return 'Escribí el motivo: es lo primero que te van a reclamar.';

	const spec = SANCTIONS[kind];
	if (spec.dated && until === null) return 'Una suspensión necesita una fecha de vencimiento.';
	if (!spec.dated && until !== null) return `Un ${spec.label.toLowerCase()} no lleva vencimiento.`;

	return null;
}

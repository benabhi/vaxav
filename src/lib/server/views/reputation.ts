/**
 * La pestaña Reputación: la escalera con tu corporación y cómo llegaste ahí.
 *
 * Dos mitades que se explican entre sí. Arriba **dónde estás**: el escalón, lo
 * que falta para el próximo y qué abre. Abajo **cómo llegaste**: el libro, fila
 * por fila, con lo que dejó cada movimiento.
 *
 * El número solo no alcanza. Una barra que sube sin decir de dónde salió se
 * siente igual que el azar, que es justo lo que este juego no quiere ser.
 *
 * Corresponde a docs/systems/MISSIONS.md.
 */

import { eq } from 'drizzle-orm';
import { corporation, type Pilot } from '../db/schema';
import type { Db } from '../db/types';
import { standingHistory, type StandingKind } from '../services/reputation';
import { pilotStandings } from '../services/reputation';
import { buildReputacion } from './corporation';
import { FACTIONS } from '$lib/game/factions';
import { reputationLabel } from '$lib/format';
import type { IconName } from '$lib/icons';
import type { MovimientoReputacion, PaginaReputacion } from '$lib/tipos';

/**
 * Cómo se cuenta cada motivo.
 *
 * El rótulo y el ícono viven **acá y no en el servicio**: qué pasó es dato, cómo
 * se lo cuenta es presentación. Un motivo nuevo que todavía no esté en esta tabla
 * cae en el genérico en vez de dejar la celda vacía.
 */
const MOVES: Record<string, { label: string; icon: IconName }> = {
	mission: { label: 'Misión', icon: 'clipboard-text' },
	adjustment: { label: 'Ajuste', icon: 'gear-six' }
};

function moveOf(kind: string): { label: string; icon: IconName } {
	return MOVES[kind] ?? { label: 'Movimiento', icon: 'circles-three' };
}

/** Lo que se muestra cuando el piloto no responde a ninguna corporación. */
const SIN_NADA: PaginaReputacion = {
	belongs: false,
	name: 'Independiente',
	code: '',
	reputation: null,
	moves: [],
	page: 1,
	pages: 1,
	total: 0
};

/**
 * La escalera del piloto con su corporación, y el libro que la explica.
 *
 * **Sólo la de su corporación**, no el panorama entero: el panorama es otra
 * pantalla —del piloto y no de la corporación— y hoy sería una lista de una fila.
 */
export function buildPaginaReputacion(db: Db, row: Pilot, page = 1): PaginaReputacion {
	if (row.corporationId === null) return SIN_NADA;

	const suya = db.select().from(corporation).where(eq(corporation.id, row.corporationId)).get();
	if (!suya) return SIN_NADA;

	const suyas = pilotStandings(db, row.id);
	const bandera = FACTIONS[suya.faction as keyof typeof FACTIONS];
	const reputation = buildReputacion(
		suyas.corporations[suya.code] ?? 0,
		suya.faction ? (suyas.factions[suya.faction] ?? 0) : 0,
		bandera?.name ?? 'Sin bandera'
	);

	// El libro de **esta** corporación, paginado en la base.
	const libro = standingHistory(
		db,
		row.id,
		{ kind: 'corporation' as StandingKind, code: suya.code },
		page
	);

	const moves: MovimientoReputacion[] = libro.entries.map((asiento) => {
		const motivo = moveOf(asiento.kind);
		const positivo = asiento.amount >= 0;
		return {
			id: asiento.id,
			// El signo escrito y no sólo pintado: el color no llega a quien no lo ve.
			amount: `${positivo ? '+' : '−'}${reputationLabel(Math.abs(asiento.amount))}`,
			positive: positivo,
			valueAfter: reputationLabel(asiento.valueAfter),
			reason: motivo.label,
			icon: motivo.icon,
			memo: asiento.memo,
			at: asiento.createdAt.getTime()
		};
	});

	return {
		belongs: true,
		name: suya.name,
		code: suya.code,
		reputation,
		moves,
		page: libro.page,
		pages: libro.pages,
		total: libro.total
	};
}

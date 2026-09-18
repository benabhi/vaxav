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

import { asc, eq } from 'drizzle-orm';
import { corporation, type Pilot } from '../db/schema';
import type { Db } from '../db/types';
import { standingHistory, type StandingKind } from '../services/reputation';
import { pilotStandings } from '../services/reputation';
import { buildReputacion } from './corporation';
import { FACTIONS } from '$lib/game/factions';
import {
	MIN_REPUTATION_RAW,
	REPUTATION_SCALE,
	TIERS,
	effectiveMissionLevel,
	tierForRaw
} from '$lib/game/reputation';
import { reputationLabel, roman } from '$lib/format';
import type { IconName } from '$lib/icons';
import { paginate, readListing, sift, type Ordenes } from './listing';
import type {
	ConsultaPanorama,
	FilaPanorama,
	MovimientoReputacion,
	PaginaReputacion,
	PanoramaReputacion
} from '$lib/tipos';

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

/** Cuántas corporaciones entran en una página. El mismo número que el resto. */
export const PANORAMA_PER_PAGE = 25;

/**
 * Por qué columnas se puede ordenar el panorama.
 *
 * Una columna que no está acá no se ofrece como ordenable en la pantalla, así que
 * es imposible prometer un orden que el servidor no sabe hacer.
 */
export const PANORAMA_SORTS: Ordenes<FilaPanorama> = {
	nombre: (fila) => fila.name.toLocaleLowerCase('es'),
	reputacion: (fila) => fila.percent,
	bandera: (fila) => fila.factionName.toLocaleLowerCase('es'),
	nivel: (fila) => fila.opensLevel
};

/** Los recortes, cada uno con su pregunta. Se apilan: entra quien pasa todos. */
const PANORAMA_FILTERS: readonly ((fila: FilaPanorama, query: ConsultaPanorama) => boolean)[] = [
	(fila, query) =>
		!query.search ||
		fila.name.toLocaleLowerCase('es').includes(query.search.toLocaleLowerCase('es')),
	(fila, query) => !query.faction || fila.faction === query.faction
];

/** Lee la consulta del listado desde la URL, validada contra el catálogo. */
export function readPanoramaQuery(params: URLSearchParams): ConsultaPanorama {
	const bandera = params.get('bandera') ?? '';

	return {
		// Por reputación y de mayor a menor: la pregunta con la que uno abre esta
		// pantalla es «¿con quién vengo mejor?», no «¿quién empieza con A?».
		...readListing(params, PANORAMA_SORTS, 'reputacion'),
		dir: params.get('dir') === 'asc' ? 'asc' : 'desc',
		faction: bandera in FACTIONS ? bandera : ''
	};
}

/**
 * El panorama entero: quién te conoce en el sector, y cuánto.
 *
 * **Las banderas van todas, tengas número con ellas o no**, y sin recorte: son
 * cuatro contadas y son el marco del sector. Una bandera en cero no es una
 * ausencia, es un dato —«no te conocen»— y esconderla dejaría la pantalla en
 * blanco justo al empezar, que es cuando más falta hace entender qué se mide.
 *
 * **Y las corporaciones van todas**, no sólo las que te conocen: esto es un
 * directorio del sector antes que un resumen de lo tuyo. La reputación se gana
 * con cualquiera, así que una en cero no es ruido —es la que todavía no
 * trabajaste, y saber que existe y bajo qué bandera está es la mitad de la
 * decisión—. Por eso nacen con recorte, orden y paginado y no cuando molesten:
 * hay doce por bandera y van a ser más.
 *
 * Se pagina **en memoria y no en SQL**, que es la regla del proyecto para las
 * listas acotadas: por muchas que sean, no pasan de las corporaciones que existen.
 * El libro de movimientos sí crece para siempre y por eso ahí se pagina en SQL.
 *
 * **Y no hay lista de agentes**, aunque sea lo primero que uno busca acá. Un
 * agente no tiene un número propio con vos: quien decide si te atiende es el
 * mayor entre lo que tiene su corporación y lo que tiene su bandera. Esa es la
 * respuesta verdadera, y va dicha en cada fila —hasta qué nivel te abre— en vez
 * de en una tercera lista que estaría siempre vacía. El día que un agente lleve
 * número propio, entra acá como una tercera tabla con este mismo molde.
 */
export function buildPanorama(
	db: Db,
	row: Pilot,
	query = readPanoramaQuery(new URLSearchParams())
): PanoramaReputacion {
	const tiene = pilotStandings(db, row.id);

	const suya =
		row.corporationId === null
			? null
			: (db.select().from(corporation).where(eq(corporation.id, row.corporationId)).get() ?? null);

	/** Lo que hace falta para escribir una fila, sea de quien sea. */
	function fila(
		code: string,
		name: string,
		icon: IconName,
		color: string,
		faction: string,
		propio: number,
		bandera: number,
		mine = false
	): FilaPanorama {
		const escalon = tierForRaw(propio);
		// El nivel efectivo y no el propio: es el que de verdad abre la puerta.
		const abre = effectiveMissionLevel(propio, bandera);
		return {
			code,
			name,
			icon,
			color,
			faction,
			factionName: faction in FACTIONS ? FACTIONS[faction as keyof typeof FACTIONS].name : '',
			value: reputationLabel(propio),
			percent: propio / REPUTATION_SCALE,
			tier: escalon.name,
			reached: escalon.level,
			tiers: TIERS.length,
			opens: roman(abre),
			opensLevel: abre,
			mine
		};
	}

	const factions = Object.values(FACTIONS).map((bandera) => {
		const valor = tiene.factions[bandera.code] ?? MIN_REPUTATION_RAW;
		// Una bandera se abre a sí misma: no hay una segunda escalera por encima.
		// El escudo, que es con lo que el juego ya dibuja una bandera.
		return fila(
			bandera.code,
			bandera.name,
			'shield-chevron',
			bandera.color,
			bandera.code,
			valor,
			valor
		);
	});

	// **Todas las del sector, no sólo las que te conocen.** Es un directorio antes
	// que un resumen: la reputación se gana con cualquiera, así que lo primero que
	// uno quiere es ver con quiénes se puede empezar y dónde. Una en cero no es
	// ruido, es la que todavía no trabajaste.
	const todas = db.select().from(corporation).orderBy(asc(corporation.name)).all();

	const filas = todas.map((una) =>
		fila(
			una.code,
			una.name,
			'share-network',
			'',
			una.faction,
			tiene.corporations[una.code] ?? MIN_REPUTATION_RAW,
			tiene.factions[una.faction] ?? MIN_REPUTATION_RAW,
			suya?.code === una.code
		)
	);

	const pagina = paginate(
		sift(filas, query, PANORAMA_FILTERS),
		query,
		PANORAMA_SORTS,
		PANORAMA_PER_PAGE,
		// A igualdad de orden, la tuya primero y después por nombre: lo propio antes
		// que lo ajeno, y nunca dos filas empatadas cambiando de lugar entre cargas.
		(a, b) => Number(b.mine) - Number(a.mine) || a.name.localeCompare(b.name, 'es')
	);

	return {
		factions,
		corporations: pagina.rows,
		query,
		total: filas.length,
		found: pagina.found,
		page: pagina.page,
		pages: pagina.pages,
		flags: Object.values(FACTIONS).map((una) => ({ code: una.code, name: una.name })),
		// Cuántos te conocen de verdad: es lo que decide si la pantalla cuenta algo
		// o todavía está esperando a que existan las misiones.
		known: [...factions, ...filas].filter((uno) => uno.percent > 0).length
	};
}

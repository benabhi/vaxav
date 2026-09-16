/**
 * Las cuentas, como las ve quien administra.
 *
 * Donde `views/pilot.ts` arma la credencial que un piloto mira de sí mismo, ésta
 * arma lo que hace falta para moderar: quién es, qué tiene, qué sanciones lleva y
 * qué se le puede hacer. Son dos lecturas de la misma fila y no comparten
 * constructor porque casi no comparten campos.
 *
 * Corresponde a docs/systems/ADMIN.md.
 */

import { eq, like, or } from 'drizzle-orm';
import { body, constellation, pilot, pilotRole, region, system } from '../db/schema';
import type { Db } from '../db/types';
import { activeCounts, sanctionsOf, blockedBy, blockedMessage } from '../services/moderation';
import { accountBlockers } from '../services/accounts';
import { allRoles, permissionsOfRole } from '../services/roles';
import { balance } from '../services/wallet';
import { getFaction } from '$lib/game/factions';
import { getProfession } from '$lib/game/professions';
import {
	SANCTIONS,
	SANCTION_ORDER,
	isBlocking,
	isSanctionKind,
	sanctionLabel
} from '$lib/sanctions';
import { thousands } from '$lib/format';
import type {
	FichaPiloto,
	FilaPiloto,
	FilaRolPiloto,
	FilaSancion,
	OpcionConstructor,
	Pilotos
} from '$lib/tipos';

/** Cuántos pilotos entran en una página. */
export const PAGE_SIZE = 25;

/** Por qué estado se puede filtrar el listado. */
export const PILOT_STATES = ['', 'blocked', 'sanctioned', 'clean'] as const;

/** Cómo se lee cada estado. Vacío es «todos», que es lo normal. */
export const STATE_OPTIONS: readonly OpcionConstructor[] = [
	{ value: '', label: 'Todos' },
	{ value: 'blocked', label: 'Sin acceso' },
	{ value: 'sanctioned', label: 'Con sanciones' },
	{ value: 'clean', label: 'Sin sanciones' }
];

/** Cómo se llama una facción, o el código si el catálogo ya no la conoce. */
function factionName(code: string): string {
	try {
		return getFaction(code).name;
	} catch {
		return code;
	}
}

/** Ídem la profesión. */
function professionName(code: string): string {
	try {
		return getProfession(code).name;
	} catch {
		return code;
	}
}

/** El nombre de cada cuerpo, por id, con el sistema al que pertenece. */
function bodyNames(db: Db): Map<number, { name: string; system: string }> {
	const sistemas = new Map(
		db
			.select()
			.from(system)
			.all()
			.map((una) => [una.id, una.name])
	);

	return new Map(
		db
			.select()
			.from(body)
			.all()
			.map((fila) => [fila.id, { name: fila.name, system: sistemas.get(fila.systemId) ?? '' }])
	);
}

/**
 * El listado, filtrado y paginado.
 *
 * La búsqueda mira **distintivo y correo**: es lo que uno tiene a mano cuando
 * llega un reclamo, y buscar sólo por distintivo obligaría a adivinar con cuál de
 * los dos vino la queja.
 */
export function buildPilotos(
	db: Db,
	search: string,
	state: string,
	page = 1,
	size = PAGE_SIZE
): Pilotos {
	const texto = search.trim();
	const donde = texto
		? or(like(pilot.callsign, `%${texto}%`), like(pilot.email, `%${texto}%`))
		: undefined;

	const todos = db.select().from(pilot).where(donde).orderBy(pilot.callsign).all();
	const ahora = new Date();
	const conteo = activeCounts(db, ahora);
	const lugares = bodyNames(db);

	// Los roles de todos de una vez: preguntarlos por fila sería un N+1 en la
	// pantalla que más filas dibuja.
	const roles = new Map(allRoles(db).map((rol) => [rol.id, rol.name]));
	const porPiloto = new Map<number, string[]>();
	for (const fila of db.select().from(pilotRole).all()) {
		const nombre = roles.get(fila.roleId);
		if (!nombre) continue;
		porPiloto.set(fila.pilotId, [...(porPiloto.get(fila.pilotId) ?? []), nombre]);
	}

	const filas: FilaPiloto[] = todos.map((fila) => {
		const cerrada = blockedBy(db, fila.id, ahora);
		const lugar = lugares.get(fila.locationId);

		return {
			id: fila.id,
			callsign: fila.callsign,
			email: fila.email,
			faction: factionName(fila.faction),
			profession: professionName(fila.profession),
			credits: `${thousands(fila.credits)} cr`,
			location: lugar ? lugar.name : '—',
			createdAt: fila.createdAt.getTime(),
			sanctions: conteo[fila.id] ?? 0,
			blocked: cerrada ? sanctionLabel(cerrada.kind) : '',
			roles: porPiloto.get(fila.id) ?? []
		};
	});

	const filtradas = filas.filter((fila) => {
		if (state === 'blocked') return fila.blocked !== '';
		if (state === 'sanctioned') return fila.sanctions > 0;
		if (state === 'clean') return fila.sanctions === 0;
		return true;
	});

	// Con la lista vacía sigue habiendo una página: la que dice que no hay nadie.
	const pages = Math.max(1, Math.ceil(filtradas.length / size));
	const actual = Math.min(Math.max(1, Math.trunc(page) || 1), pages);

	return {
		rows: filtradas.slice((actual - 1) * size, actual * size),
		total: filtradas.length,
		page: actual,
		pages,
		search: texto,
		state,
		blocked: filas.filter((fila) => fila.blocked !== '').length
	};
}

/** Una sanción del historial, lista para dibujar. */
function buildSancion(fila: ReturnType<typeof sanctionsOf>[number], ahora: Date): FilaSancion {
	const activa = fila.liftedAt === null && (fila.until === null || fila.until > ahora);

	return {
		id: fila.id,
		kind: fila.kind,
		kindLabel: sanctionLabel(fila.kind),
		reason: fila.reason,
		issuedBy: fila.issuedByName || 'el sistema',
		at: fila.createdAt.getTime(),
		until: fila.until ? fila.until.getTime() : null,
		liftedAt: fila.liftedAt ? fila.liftedAt.getTime() : null,
		liftedBy: fila.liftedByName,
		active: activa,
		blocks: isBlocking(fila, ahora)
	};
}

/**
 * La ficha de un piloto, con todo lo que se le puede tocar.
 *
 * Trae también las opciones de los formularios —los cuerpos a los que se lo puede
 * mover, las clases de sanción— por lo mismo que el constructor del universo:
 * salen de catálogos del juego, y duplicarlas en un `<select>` sería tener dos
 * listas que se desincronizan.
 */
export function buildFicha(db: Db, pilotId: number, actorId: number | null): FichaPiloto | null {
	const fila = db.select().from(pilot).where(eq(pilot.id, pilotId)).get();
	if (!fila) return null;

	const ahora = new Date();
	const lugares = bodyNames(db);
	const lugar = lugares.get(fila.locationId);
	const cerrada = blockedBy(db, pilotId, ahora);

	// Los roles: los que tiene marcados, y todos los demás para poder dárselos.
	const suyos = new Map(
		db
			.select()
			.from(pilotRole)
			.where(eq(pilotRole.pilotId, pilotId))
			.all()
			.map((una) => [una.roleId, una])
	);
	const nombres = new Map(
		db
			.select()
			.from(pilot)
			.all()
			.map((uno) => [uno.id, uno.callsign])
	);

	const roles: FilaRolPiloto[] = allRoles(db).map((rol) => {
		const puesto = suyos.get(rol.id);
		return {
			id: rol.id,
			code: rol.code,
			name: rol.name,
			// Cuántas llaves abre, que es lo que decide si dárselo a alguien.
			description: rol.description || `${permissionsOfRole(db, rol.id).length} permisos`,
			held: puesto !== undefined,
			grantedBy: puesto?.grantedBy ? (nombres.get(puesto.grantedBy) ?? '—') : ''
		};
	});

	// Los cuerpos, agrupados por sistema: con dos sistemas ya es una lista larga,
	// y sin el grupo no se sabe a qué parte del universo se lo está mandando.
	const constelaciones = new Map(
		db
			.select()
			.from(constellation)
			.all()
			.map((una) => [una.id, una])
	);
	const regiones = new Map(
		db
			.select()
			.from(region)
			.all()
			.map((una) => [una.id, una.name])
	);
	const sistemas = new Map(
		db
			.select()
			.from(system)
			.all()
			.map((uno) => {
				const suConstelacion = constelaciones.get(uno.constellationId);
				const suRegion = suConstelacion ? (regiones.get(suConstelacion.regionId) ?? '') : '';
				return [uno.id, suRegion ? `${suRegion} · ${uno.name}` : uno.name];
			})
	);

	const bodies: OpcionConstructor[] = db
		.select()
		.from(body)
		.all()
		.map((uno) => ({
			value: String(uno.id),
			label: uno.name,
			group: sistemas.get(uno.systemId) ?? ''
		}))
		.sort((a, b) => (a.group ?? '').localeCompare(b.group ?? '') || a.label.localeCompare(b.label));

	return {
		id: fila.id,
		callsign: fila.callsign,
		email: fila.email,
		faction: factionName(fila.faction),
		factionCode: fila.faction,
		profession: professionName(fila.profession),
		credits: `${thousands(balance(db, fila.id))} cr`,
		creditsRaw: fila.credits,
		location: lugar ? lugar.name : '—',
		locationId: fila.locationId,
		system: lugar ? lugar.system : '',
		createdAt: fila.createdAt.getTime(),
		blockedMessage: cerrada ? blockedMessage(cerrada) : '',
		sanctions: sanctionsOf(db, pilotId).map((una) => buildSancion(una, ahora)),
		roles,
		blockers: accountBlockers(db, pilotId, actorId),
		bodies,
		sanctionKinds: SANCTION_ORDER.map((kind) => ({
			value: kind,
			label: `${SANCTIONS[kind].label} · ${SANCTIONS[kind].summary}`
		}))
	};
}

/** Si esa clase de sanción lleva fecha. Lo usa el formulario para pedirla o no. */
export function sanctionNeedsDate(kind: string): boolean {
	return isSanctionKind(kind) && SANCTIONS[kind].dated;
}

/**
 * Lo que se muestra en la ventana de una ficha.
 *
 * **Una sola puerta para todas las clases de ficha.** El layout del juego
 * pregunta una vez por request —«¿hay alguna ficha pedida?»— y acá se decide
 * qué armar. Sin esto, cada pantalla que quisiera ofrecer una ficha tendría que
 * saber armarla, y una ficha que sólo se puede abrir desde algunas pantallas es
 * media función.
 *
 * **No arma nada nuevo**: cada sección la construye el mismo constructor que
 * usa la pestaña del módulo, con un código de más. Dos maneras de describir una
 * corporación serían dos que un día dicen cosas distintas.
 *
 * Y arma **una sola sección por vez**, la que se está mirando: traer las cinco
 * para mostrar una sería cinco consultas por cada nombre que alguien aprieta.
 *
 * Corresponde a `docs/systems/INTERFACE.md`.
 */

import type { Pilot } from '../db/schema';
import type { Db } from '../db/types';
import { buildAgentes, readAgentsQuery } from './agents';
import { buildCorporacion, estacionesDe } from './corporation';
import { buildMiembros, readMembersQuery } from './members';
import { buildPaginaReputacion } from './reputation';
import { readFicha, sinPrefijo, type CorporationSection } from '$lib/fichas';
import type { Ficha } from '$lib/tipos';

/**
 * La ficha que pide la URL, ya armada. `null` si no pide ninguna.
 *
 * Devuelve `null` también cuando la pide mal —una clase que no existe, un código
 * que no está— en vez de fallar: una URL escrita a mano no tiene por qué tirar
 * abajo la pantalla que hay debajo de la ventana.
 */
export function buildFicha(db: Db, row: Pilot, params: URLSearchParams): Ficha | null {
	const pedida = readFicha(params);
	if (!pedida) return null;

	// Los parámetros del listado llegan con prefijo para no pisar los de la
	// pantalla de abajo; los lectores de consulta los esperan sin él.
	const propios = sinPrefijo(params);

	if (pedida.kind === 'corporacion')
		return corporacion(db, row, pedida.code, pedida.section, propios);

	// Las otras dos clases todavía no existen. Se devuelve `null` y la ventana no
	// se abre, que es mejor que abrir una vacía.
	return null;
}

/** La ficha de una corporación, con la sección que se esté mirando. */
function corporacion(
	db: Db,
	row: Pilot,
	code: string,
	section: string,
	propios: URLSearchParams
): Ficha | null {
	const ficha = buildCorporacion(db, row, code);
	// `belongs` en falso con código puesto quiere decir que no existe.
	if (!ficha.belongs) return null;

	const cual: CorporationSection = ['reputacion', 'ubicaciones', 'agentes', 'miembros'].includes(
		section
	)
		? (section as CorporationSection)
		: 'info';

	return {
		kind: 'corporacion',
		code: ficha.code,
		title: ficha.name,
		subtitle: ficha.kind,
		section: cual,
		corporation: ficha,
		reputation:
			cual === 'reputacion' ? buildPaginaReputacion(db, row, pagina(propios), code) : null,
		stations: cual === 'ubicaciones' ? estacionesDe(db, code) : null,
		agents: cual === 'agentes' ? buildAgentes(db, row, readAgentsQuery(propios), code) : null,
		members: cual === 'miembros' ? buildMiembros(db, row, readMembersQuery(propios), code) : null
	};
}

/** La página pedida, sin romperse con lo que venga escrito a mano. */
function pagina(params: URLSearchParams): number {
	return Math.max(1, Number.parseInt(params.get('pagina') ?? '1', 10) || 1);
}

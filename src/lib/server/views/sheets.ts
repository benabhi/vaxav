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
import { buildAgentes, buildFichaAgente, readAgentsQuery } from './agents';
import { buildCorporacion, estacionesDe } from './corporation';
import { buildMiembros, readMembersQuery } from './members';
import { buildPerfilPiloto } from './pilot';
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
	if (pedida.kind === 'piloto') return piloto(db, row, pedida.code);
	if (pedida.kind === 'agente') return agente(db, row, pedida.code);

	return null;
}

/**
 * La ficha de un piloto. **Una sola sección y sin pestañas**: lo público de una
 * persona entra en una pantalla, y un selector de una sola cosa es un adorno que
 * además promete que hay más.
 */
function piloto(db: Db, row: Pilot, callsign: string): Ficha | null {
	const perfil = buildPerfilPiloto(db, row, callsign);
	if (!perfil) return null;

	return {
		...VACIA,
		kind: 'piloto',
		code: perfil.callsign,
		title: perfil.callsign,
		// Cerrada, ni el oficio: el subtítulo también es un dato.
		subtitle: perfil.closed ? '' : perfil.profession,
		icon: 'identification-card',
		pilot: perfil
	};
}

/** La ficha de un agente, con la cuenta de por qué te atiende o por qué no. */
function agente(db: Db, row: Pilot, code: string): Ficha | null {
	const ficha = buildFichaAgente(db, row, code);
	if (!ficha) return null;

	return {
		...VACIA,
		kind: 'agente',
		code: ficha.agent.code,
		title: ficha.agent.name,
		subtitle: ficha.agent.corporation,
		icon: 'identification-badge',
		agent: ficha
	};
}

/**
 * Lo que toda ficha tiene vacío.
 *
 * Cada clase llena lo suyo y deja el resto en nulo, que es lo que la pantalla
 * pregunta para saber qué dibujar. Escribir los ocho campos en cada armador sería
 * garantizar que el día que aparezca el noveno falte en alguno.
 */
const VACIA = {
	section: '',
	corporation: null,
	reputation: null,
	stations: null,
	agents: null,
	members: null,
	pilot: null,
	agent: null
} as const;

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
		...VACIA,
		kind: 'corporacion',
		code: ficha.code,
		title: ficha.name,
		subtitle: ficha.kind,
		icon: 'share-network',
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

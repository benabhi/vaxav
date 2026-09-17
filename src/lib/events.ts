/**
 * El catálogo de eventos: qué cosas quedan registradas y cómo se leen.
 *
 * El registro guarda un **código y un JSON**, nunca la frase ya escrita. Es la
 * misma decisión que toma la bitácora del piloto y por la misma razón: cambiar
 * cómo se redacta un hecho no debería obligar a reescribir el pasado, y un
 * historial con dos redacciones del mismo hecho se lee como si fueran dos hechos
 * distintos. La frase se arma acá, al mostrarla.
 *
 * Vive en `$lib` y no bajo `server/` porque los dos lados lo necesitan: el
 * servicio para validar el código que escribe, y la pantalla para redactarlo.
 *
 * **No se registra todo lo que pasa.** Un registro que anota cada carga de
 * pantalla se vuelve ilegible, y lo ilegible no se audita. Entran los hechos que
 * alguien podría necesitar reconstruir después: altas y bajas de cuenta, cambios
 * de credenciales, reparto de poder, y —cuando existan— las creaciones y
 * borrados que haga un administrador.
 *
 * Corresponde a docs/systems/ADMIN.md.
 */

import type { IconName } from '$lib/icons';

/**
 * En qué se agrupan los eventos.
 *
 * Es el filtro grueso de la pantalla: quien busca "qué pasó con las cuentas" no
 * quiere marcar ocho códigos, quiere marcar uno.
 */
export const EVENT_CATEGORIES = ['accounts', 'roles', 'universe', 'economy'] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

/** Cómo se llama cada categoría en pantalla, y con qué ícono se la reconoce. */
export const CATEGORY_LABELS: Readonly<Record<EventCategory, string>> = {
	accounts: 'Cuentas',
	roles: 'Roles',
	universe: 'Universo',
	economy: 'Economía'
};

/**
 * El ícono es **de la categoría y no del evento**.
 *
 * Con un ícono por código haría falta inventar uno cada vez que se registra algo
 * nuevo, y a los cincuenta eventos ninguno se distinguiría del de al lado. La
 * categoría son cuatro formas que se aprenden de una vez.
 */
export const CATEGORY_ICONS: Readonly<Record<EventCategory, IconName>> = {
	accounts: 'identification-badge',
	roles: 'shield-chevron',
	universe: 'planet',
	economy: 'coins'
};

/**
 * Cuánto pesa el hecho.
 *
 * No cambia nada de lo que se guarda: es para que la pantalla pinte distinto lo
 * que no vuelve. Una baja de cuenta y un cambio de nombre no se leen igual, y en
 * una lista de doscientas filas el color es lo único que se ve de lejos.
 */
export type EventTone = 'neutral' | 'notable' | 'grave';

/** Los datos que acompañan a un evento, tal como salen del JSON guardado. */
export type EventPayload = Readonly<Record<string, unknown>>;

/**
 * Sobre qué es un evento.
 *
 * Se guarda como texto suelto junto al id y **sin clave foránea**: el registro
 * tiene que sobrevivir a lo que describe, y un evento que dice «se borró la
 * cuenta 7» apunta a una fila que ya no existe. Saber de qué tipo era es lo que
 * permite enlazarlo cuando todavía está.
 */
export const EVENT_SUBJECTS = [
	'pilot',
	'role',
	'system',
	'body',
	'station',
	'gate',
	'region',
	'constellation'
] as const;
export type EventSubject = (typeof EVENT_SUBJECTS)[number];

/** Un evento del catálogo. */
export interface EventKind {
	readonly code: string;
	readonly category: EventCategory;
	/** El título corto de la fila. */
	readonly label: string;
	readonly tone: EventTone;
	/** La frase, armada con los datos guardados. */
	readonly describe: (payload: EventPayload) => string;
}

/**
 * Un texto del JSON guardado, o un relleno si no está.
 *
 * El registro es viejo por definición: una fila escrita hace seis meses puede no
 * traer el campo que hoy se quiere mostrar. Devolver un relleno es lo que hace
 * que un evento incompleto se siga leyendo en vez de romper la pantalla entera.
 */
function texto(payload: EventPayload, key: string, fallback = '—'): string {
	const valor = payload[key];
	return typeof valor === 'string' && valor.trim() ? valor : fallback;
}

function define(
	code: string,
	category: EventCategory,
	label: string,
	tone: EventTone,
	describe: (payload: EventPayload) => string
): EventKind {
	return { code, category, label, tone, describe };
}

/**
 * Todos los eventos que se registran hoy.
 *
 * La lista crece con las herramientas: cada una que se construya agrega acá el
 * hecho que deja constancia de lo que hace. Un código que no esté en el catálogo
 * **igual se guarda** —ver `eventKind`—, porque perder un hecho es peor que
 * mostrarlo sin nombre.
 */
export const EVENT_KINDS: readonly EventKind[] = [
	define(
		'account.registered',
		'accounts',
		'Alta de piloto',
		'neutral',
		(payload) =>
			`Se registró ${texto(payload, 'callsign')}, de la facción ${texto(payload, 'faction')}.`
	),
	define(
		'account.deleted',
		'accounts',
		'Baja de piloto',
		'grave',
		(payload) => `Se dio de baja la cuenta de ${texto(payload, 'callsign')}.`
	),
	define(
		'account.password_changed',
		'accounts',
		'Cambio de contraseña',
		'notable',
		(payload) => `${texto(payload, 'callsign')} cambió su contraseña.`
	),

	define(
		'account.sanctioned',
		'accounts',
		'Sanción puesta',
		'grave',
		(payload) =>
			`${texto(payload, 'callsign')} recibió un ${texto(payload, 'sanction').toLowerCase()}: ${texto(payload, 'reason')}.`
	),
	define(
		'account.lifted',
		'accounts',
		'Sanción levantada',
		'notable',
		(payload) =>
			`A ${texto(payload, 'callsign')} le levantaron el ${texto(payload, 'sanction').toLowerCase()}.`
	),
	define(
		'account.edited',
		'accounts',
		'Cuenta editada',
		'notable',
		(payload) => `Se cambió ${texto(payload, 'field')} de ${texto(payload, 'callsign')}.`
	),
	define('account.credited', 'accounts', 'Ajuste de créditos', 'grave', (payload) => {
		const monto = payload.amount;
		const cifra = typeof monto === 'number' ? monto : 0;
		const verbo = cifra >= 0 ? 'Se le acreditaron' : 'Se le debitaron';
		return `${verbo} ${Math.abs(cifra)} cr a ${texto(payload, 'callsign')}: ${texto(payload, 'reason')}.`;
	}),

	define(
		'role.created',
		'roles',
		'Rol creado',
		'notable',
		(payload) => `Se creó el rol ${texto(payload, 'name')}.`
	),
	define('role.updated', 'roles', 'Rol modificado', 'notable', (payload) => {
		const permisos = payload.permissions;
		const cuantos = Array.isArray(permisos) ? permisos.length : 0;
		return `Se cambió el rol ${texto(payload, 'name')}: quedó con ${cuantos} permiso${cuantos === 1 ? '' : 's'}.`;
	}),
	define(
		'role.deleted',
		'roles',
		'Rol borrado',
		'grave',
		(payload) => `Se borró el rol ${texto(payload, 'name')}.`
	),
	define(
		'role.granted',
		'roles',
		'Rol otorgado',
		'grave',
		(payload) => `${texto(payload, 'callsign')} recibió el rol ${texto(payload, 'name')}.`
	),
	define(
		'role.revoked',
		'roles',
		'Rol retirado',
		'grave',
		(payload) => `A ${texto(payload, 'callsign')} le sacaron el rol ${texto(payload, 'name')}.`
	),

	define(
		'system.created',
		'universe',
		'Sistema creado',
		'notable',
		(payload) => `Se creó el sistema ${texto(payload, 'name')}.`
	),
	define(
		'system.updated',
		'universe',
		'Sistema modificado',
		'neutral',
		(payload) => `Se cambiaron los datos de ${texto(payload, 'name')}.`
	),
	define(
		'system.deleted',
		'universe',
		'Sistema borrado',
		'grave',
		(payload) => `Se borró el sistema ${texto(payload, 'name')} y todo lo que tenía.`
	),
	define(
		'body.created',
		'universe',
		'Cuerpo creado',
		'neutral',
		(payload) => `Se agregó ${texto(payload, 'name')} a ${texto(payload, 'system')}.`
	),
	define(
		'body.updated',
		'universe',
		'Cuerpo modificado',
		'neutral',
		(payload) => `Se cambiaron los datos de ${texto(payload, 'name')}.`
	),
	define(
		'body.deleted',
		'universe',
		'Cuerpo borrado',
		'grave',
		(payload) => `Se borró ${texto(payload, 'name')} de ${texto(payload, 'system')}.`
	),
	define(
		'gate.connected',
		'universe',
		'Puerta conectada',
		'notable',
		(payload) => `${texto(payload, 'name')} quedó unida a ${texto(payload, 'destination')}.`
	),
	define(
		'gate.disconnected',
		'universe',
		'Puerta desconectada',
		'notable',
		(payload) => `${texto(payload, 'name')} dejó de llevar a ${texto(payload, 'destination')}.`
	),
	define(
		'gate.closed',
		'universe',
		'Puerta cerrada',
		'grave',
		(payload) => `Se cerró el paso de ${texto(payload, 'name')} a ${texto(payload, 'destination')}.`
	),
	define(
		'gate.opened',
		'universe',
		'Puerta abierta',
		'notable',
		(payload) =>
			`Se reabrió el paso de ${texto(payload, 'name')} a ${texto(payload, 'destination')}.`
	),
	define(
		'region.created',
		'universe',
		'Región creada',
		'neutral',
		(payload) => `Se creó la región ${texto(payload, 'name')}.`
	),
	define(
		'constellation.created',
		'universe',
		'Constelación creada',
		'neutral',
		(payload) =>
			`Se creó la constelación ${texto(payload, 'name')}, en ${texto(payload, 'region')}.`
	),
	define('region.updated', 'universe', 'Región editada', 'neutral', (payload) =>
		texto(payload, 'before') === texto(payload, 'name')
			? `Se retocó ${texto(payload, 'name')}.`
			: `${texto(payload, 'before')} pasó a llamarse ${texto(payload, 'name')}.`
	),
	define('constellation.updated', 'universe', 'Constelación editada', 'neutral', (payload) =>
		texto(payload, 'before') === texto(payload, 'name')
			? `Se retocó ${texto(payload, 'name')}.`
			: `${texto(payload, 'before')} pasó a llamarse ${texto(payload, 'name')}.`
	)
];

/** El catálogo por código, para preguntar por uno. */
const BY_CODE = new Map(EVENT_KINDS.map((kind) => [kind.code, kind]));

/** Todos los códigos, que es lo que ofrece el filtro de la pantalla. */
export const ALL_EVENT_KINDS: readonly string[] = EVENT_KINDS.map((kind) => kind.code);

/**
 * Un evento del catálogo, o uno de relleno si el código no está.
 *
 * **Nunca devuelve `null` y eso es a propósito.** El registro es append-only y
 * sobrevive al código: una fila de hace un año puede llevar un código que ya
 * nadie escribe. Esconderla sería mentir sobre lo que pasó, así que se muestra
 * con su código a la vista y sin frase.
 */
export function eventKind(code: string): EventKind {
	return (
		BY_CODE.get(code) ??
		define(code, 'accounts', code, 'neutral', () => 'Un evento que el juego ya no sabe redactar.')
	);
}

/** Si ese código está en el catálogo. */
export function isEventKind(code: string): boolean {
	return BY_CODE.has(code);
}

/** Los eventos de una categoría, en el orden del catálogo. */
export function kindsOfCategory(category: EventCategory): readonly EventKind[] {
	return EVENT_KINDS.filter((kind) => kind.category === category);
}

/** La frase de un evento guardado, lista para mostrar. */
export function describeEvent(code: string, payload: EventPayload): string {
	return eventKind(code).describe(payload);
}

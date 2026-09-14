/**
 * En qué situación está un piloto, y qué le habilita.
 *
 * Existe porque hasta ahora **cada pantalla decidía por su cuenta** si podía o no
 * hacer algo: la de navegación miraba si había una orden en curso, la de la nave
 * miraba qué surtía la estación, y ninguna de las dos sabía de la otra. Con dos
 * lugares que deciden lo mismo, tarde o temprano deciden distinto.
 *
 * Acá está la respuesta única a «¿qué puede hacer este piloto ahora?», en reglas
 * puras: sin base de datos. Los servicios arman los datos, preguntan, y la
 * interfaz sólo muestra lo que se le responde.
 *
 * Corresponde a docs/systems/ACTIONS.md.
 */

import type { StationServiceKind } from './universe';

/**
 * Las tres situaciones en que puede estar un piloto.
 *
 * Son tres y no dos porque **estar quieto no alcanza para poder todo**: parado
 * en un cinturón se puede viajar, pero no reconfigurar la nave. Sin esa
 * distinción, el mapa deja de importar.
 */
export const PILOT_STATUSES = [
	/** Atracado en una estación. Es donde se hace todo lo que no es volar. */
	'docked',
	/** Quieto en un cuerpo que no es estación: un planeta, una luna, un cinturón. */
	'in_space',
	/** Yendo a algún lado. No se está en ninguna parte hasta llegar. */
	'in_transit',
	/**
	 * Ocupado **sin moverse**: minando en un cinturón, refinando en una estación.
	 *
	 * Es distinto de ir en camino aunque las dos cosas impidan dar otra orden. Sin
	 * esta distinción, minar diría que vas viajando y la pantalla de ubicación
	 * dejaría de describir el cinturón donde estás trabajando.
	 */
	'working'
] as const;

export type PilotStatus = (typeof PILOT_STATUSES)[number];

/**
 * La situación del piloto a partir de dónde está y qué está haciendo.
 *
 * **Viajar gana sobre dónde estás**: mientras se viaja no importa de qué estación
 * se salió, porque ya no se está ahí. Trabajar no: el que mina sigue estando en
 * el cinturón, y la pantalla tiene que poder describirlo.
 */
export function statusFor(atStation: boolean, busy: boolean, moving = true): PilotStatus {
	if (busy) return moving ? 'in_transit' : 'working';
	return atStation ? 'docked' : 'in_space';
}

/**
 * ¿Puede empezar una acción nueva?
 *
 * Una por vez, sin cola: es lo que fija ACTIONS.md, y lo que hace que decidir
 * qué hacer sea una decisión y no una lista de compras.
 */
export function canGiveOrders(status: PilotStatus): boolean {
	return status !== 'in_transit' && status !== 'working';
}

/**
 * ¿Puede cambiar los módulos de su nave?
 *
 * Hacen falta las dos cosas: estar **atracado** y que la estación tenga
 * **Equipamiento**. Una nave no se desarma a mitad de un viaje, y un puesto de
 * hielo no tiene con qué.
 */
export function canRefit(
	status: PilotStatus,
	services: Iterable<StationServiceKind> = []
): boolean {
	return status === 'docked' && [...services].includes('outfitting');
}

/**
 * Por qué no se puede equipar, o cadena vacía si sí se puede.
 *
 * Devuelve el motivo y no un booleano porque **un botón apagado sin explicación
 * es peor que un botón que no está**: el jugador tiene que poder saber qué le
 * falta para poder.
 */
export function refitBlockedReason(
	status: PilotStatus,
	services: Iterable<StationServiceKind> = [],
	place: string = ''
): string {
	if (canRefit(status, services)) return '';
	if (status === 'in_transit') return 'No se puede tocar la nave en pleno viaje.';
	if (status === 'working') return 'No se puede tocar la nave con un trabajo en curso.';
	if (status === 'in_space') {
		return `Hay que estar atracado en una estación, y ${place || 'acá'} no lo es.`;
	}
	return `${place || 'Esta estación'} no tiene Equipamiento.`;
}

/** Por qué no se puede dar una orden, o cadena vacía si sí se puede. */
export function orderBlockedReason(status: PilotStatus): string {
	if (canGiveOrders(status)) return '';
	return 'Ya hay una orden en curso.';
}

/** Si está ocupado, sea yendo a algún lado o trabajando donde está. */
export function isBusy(status: PilotStatus): boolean {
	return status === 'in_transit' || status === 'working';
}

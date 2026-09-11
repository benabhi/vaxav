/**
 * La nave del piloto, tal como sale de la base.
 *
 * Es el constructor más flaco de los tres, y a propósito: todo lo que la
 * pantalla de equipamiento muestra —la hoja de rendimiento, qué le entra a cada
 * ranura, cómo queda el anillo— sale de reglas puras que el navegador puede
 * calcular solo. Lo único que hay que ir a buscar es qué casco tiene, qué lleva
 * montado, cuánto sabe el piloto y dónde está parado.
 */

import type { Pilot } from '../db/schema';
import type { Db } from '../db/types';
import { activeShip, pilotSkillLevels, shipFit } from '../services/ships';
import { situation } from '../services/status';
import { STARTING_HULL } from '$lib/game/hulls';
import type { Nave } from '$lib/tipos';

/**
 * Sin nave se dibuja el casco inicial con su equipo de fábrica, que es lo que
 * hace el original: `canRefit` queda en falso, así que no se puede tocar nada.
 * Es teórico —el alta le da una nave a todo piloto— pero no puede reventar.
 */
function noShip(): Nave {
	return {
		hullCode: STARTING_HULL,
		fitted: [],
		pilotLevels: {},
		stationName: '',
		stationServices: [],
		canRefit: false,
		refitBlocked: ''
	};
}

/** Todo lo que la pestaña Ficha necesita de la base, en una sola pasada. */
export function buildShipView(db: Db, row: Pilot): Nave {
	const ship = activeShip(db, row.id);
	if (ship === null) return noShip();

	// Dónde está y qué le habilita eso sale de `situation`, que es el único
	// lugar que decide qué puede hacer un piloto. Preguntarlo acá por separado
	// sería tener la regla en dos lados, y dos lados que deciden lo mismo
	// terminan decidiendo distinto.
	const ahora = situation(db, row);

	return {
		hullCode: ship.hull,
		fitted: shipFit(db, ship).map((module) => module.code),
		pilotLevels: pilotSkillLevels(db, row.id),
		stationName: ahora.place,
		stationServices: [...ahora.services],
		canRefit: ahora.canRefit,
		refitBlocked: ahora.refitBlocked
	};
}

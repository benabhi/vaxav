/**
 * La portada del cuartel general.
 *
 * Contesta dos preguntas y ninguna más: **qué podés hacer vos** y **qué pasó
 * recién**. No hay contadores del juego ni gráficos de nada: las estadísticas
 * tienen su propia llave y van a tener su propia sección, y adelantar acá una
 * versión recortada sería un cartel de los que este proyecto no pone.
 *
 * Lo primero no es relleno. Un sistema de permisos granular tiene el problema de
 * que nadie sabe qué tiene: el que reparte cree que dio una cosa y el que recibe
 * descubre lo que puede a fuerza de chocarse con puertas. Mostrar las llaves con
 * su explicación al lado es lo que evita las dos sorpresas.
 *
 * Corresponde a docs/systems/ADMIN.md.
 */

import { AREA_LABELS, PERMISSION_AREAS, can, permissionsOfArea } from '$lib/permissions';
import type { AreaCuartel, Cuartel, RolPropio } from '$lib/tipos';
import { eventsPage } from '../services/events';
import { rolesOf } from '../services/roles';
import { buildFila } from './events';
import type { Db } from '../db/types';

/** Cuántos eventos se asoman en la portada. Los suficientes para saber si algo pasó. */
const RECENT = 6;

/**
 * Las áreas con las llaves que este piloto tiene.
 *
 * **Sólo las que tiene.** La lista completa con las suyas marcadas parecería un
 * catálogo de compras, y lo que hace falta acá es saber con qué se cuenta, no
 * qué falta pedir.
 */
function buildAreas(permissions: ReadonlySet<string>): readonly AreaCuartel[] {
	return PERMISSION_AREAS.map((area) => ({
		label: AREA_LABELS[area],
		keys: permissionsOfArea(area)
			.filter((permission) => permissions.has(permission.code))
			.map((permission) => ({
				label: permission.label,
				summary: permission.summary,
				dangerous: permission.dangerous
			}))
	})).filter((area) => area.keys.length > 0);
}

/** La portada, armada para un piloto y sus llaves. */
export function buildCuartel(db: Db, pilotId: number, permissions: ReadonlySet<string>): Cuartel {
	const roles: readonly RolPropio[] = rolesOf(db, pilotId).map((rol) => ({
		code: rol.code,
		name: rol.name,
		description: rol.description
	}));

	// El registro sólo se asoma si tiene con qué abrirlo. Es la misma
	// comprobación que hace el guardia de la sección, escrita una vez más porque
	// acá se está mostrando lo mismo por otra puerta.
	const puedeVer = can(permissions, 'events.read');
	const pagina = puedeVer ? eventsPage(db, {}, 1, RECENT) : null;

	return {
		roles,
		areas: buildAreas(permissions),
		recent: pagina ? pagina.rows.map(buildFila) : [],
		events: pagina?.total ?? 0
	};
}

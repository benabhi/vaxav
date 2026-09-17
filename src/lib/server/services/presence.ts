/**
 * Quién más está donde estás vos.
 *
 * **Es lo que convierte una estación en un lugar con gente** en vez de un
 * mostrador con módulos. Sin esto, dos jugadores pueden estar parados en el mismo
 * muelle durante una semana sin enterarse de que el otro existe, y un juego
 * multijugador donde nadie se cruza a nadie es un juego de un jugador con una
 * base compartida.
 *
 * **En un idle no hay conectado y desconectado.** El piloto está en el sector
 * aunque el jugador no esté mirando la pantalla, así que la presencia no es una
 * sesión abierta: es dónde está parado, que ya lo dice `pilot.locationId`. El
 * cuartel hace esta misma cuenta desde hace rato para saber cuántos hay en un
 * cuerpo; lo único que faltaba era mostrarlo del lado del jugador.
 *
 * **Y sólo en estaciones.** Una estación es un puerto: es pública, no se puede
 * atacar, y quien atraca acepta que lo vean. En espacio abierto la lista no
 * existe —habrá que escanear, y eso pide módulo, tiempo y va a poder fallar—, que
 * es lo que hace que esconderse signifique algo. Acá no se decide eso: acá sólo
 * se contesta quién hay, y quién puede preguntarlo lo decide la vista.
 *
 * Corresponde a `docs/systems/INTERFACE.md`.
 */

import { and, count, eq, isNotNull, ne, notInArray } from 'drizzle-orm';
import { corporation, pilot, pilotAction } from '../db/schema';
import type { Db } from '../db/types';

/**
 * Cuántos se listan como mucho.
 *
 * Un puerto principal puede juntar cientos y la columna no es una tabla: se
 * muestran los primeros y se dice cuántos quedan, que es lo mismo que hace la
 * ficha de una corporación con sus estaciones. El día que haga falta buscar entre
 * ellos, esto pasa a ser una tabla con filtro como la de agentes.
 */
export const PRESENCE_LIMIT = 40;

/** Un piloto parado en el mismo lugar, con lo justo para reconocerlo. */
export interface PilotoPresente {
	readonly id: number;
	readonly callsign: string;
	readonly faction: string;
	readonly profession: string;
	/** La corporación a la que responde, o vacío si vuela por su cuenta. */
	readonly corporation: string;
}

/** Quiénes están, y cuántos son en total. */
export interface Presencia {
	readonly pilots: readonly PilotoPresente[];
	readonly total: number;
}

/**
 * Los pilotos atracados en ese cuerpo, sin contar a uno.
 *
 * **El que está de viaje no cuenta.** Mientras la nave va en camino el piloto
 * sigue teniendo guardado el cuerpo del que salió —así la pantalla del mapa sabe
 * de dónde arrancó— y sin este filtro aparecería atracado en un lugar del que ya
 * se fue. Es la misma verdad que dice la pantalla de Ubicación: en tránsito no
 * estás en ningún lado.
 */
export function pilotsAt(db: Db, bodyId: number, exceptId: number): Presencia {
	// Los que tienen una orden con destino: ésos se están moviendo. Una orden sin
	// destino —minar, por ejemplo— ocurre donde el piloto está parado, así que ése
	// sigue estando acá.
	const viajando = db
		.select({ id: pilotAction.pilotId })
		.from(pilotAction)
		.where(isNotNull(pilotAction.destinationBodyId));

	// Las tres condiciones juntas: acá, que no seas vos, y que no esté viajando.
	const estan = and(
		eq(pilot.locationId, bodyId),
		ne(pilot.id, exceptId),
		notInArray(pilot.id, viajando)
	);

	const total = db.select({ n: count() }).from(pilot).where(estan).get()?.n ?? 0;

	const filas = db
		.select({
			id: pilot.id,
			callsign: pilot.callsign,
			faction: pilot.faction,
			profession: pilot.profession,
			corporation: corporation.name
		})
		.from(pilot)
		.leftJoin(corporation, eq(pilot.corporationId, corporation.id))
		.where(estan)
		// Por nombre y no por antigüedad: la lista se lee buscando a alguien, y para
		// eso el orden útil es el del alfabeto.
		.orderBy(pilot.callsign)
		.limit(PRESENCE_LIMIT)
		.all();

	return {
		pilots: filas.map((fila) => ({
			id: fila.id,
			callsign: fila.callsign,
			faction: fila.faction,
			profession: fila.profession,
			corporation: fila.corporation ?? ''
		})),
		total
	};
}

/**
 * La galaxia puesta en la grilla, lista para dibujar.
 *
 * **Una sola armada para dos pantallas.** El cuartel la mira para construir y el
 * piloto para navegar, pero la galaxia es la misma: los sistemas están donde
 * están y las puertas unen lo que unen. Lo que cambia es **quién la mira**, y eso
 * viaja aparte —en `PilotoEnElMapa`— sin tocar el mapa. Tenerla dos veces sería
 * tener dos galaxias que se van separando: un atajo que en una pantalla se dibuja
 * y en la otra no.
 *
 * **Se arma en el servidor y no en el navegador.** Lo que el lienzo recibe son
 * casillas y líneas, no filas de la base: el dibujo no tiene que saber qué es una
 * puerta gemela ni cómo se reconoce un ramal suelto. Es la misma división que
 * usan todas las vistas del proyecto, y acá pesa más que en ninguna porque el
 * mapa es la pantalla más cara que hay.
 *
 * Todo sale de **unas pocas consultas**, nunca de una por sistema: con cincuenta
 * sistemas un `N+1` acá son cincuenta idas a la base cada vez que alguien abre el
 * mapa.
 *
 * Corresponde a docs/systems/UNIVERSE.md.
 */

import {
	body,
	constellation,
	corporation,
	gate,
	region,
	station,
	stationService,
	system
} from '../db/schema';
import type { Db } from '../db/types';
import { ORIGIN, hexDistance, neighbourOf, sameHex } from '$lib/game/galaxy';
import { lightYears } from '$lib/game/jumps';
import { FACTION_LIST } from '$lib/game/factions';
import { SERVICE_ORDER, freeBearings, securityLevel } from '$lib/game/universe';
import { governmentLabel, securityLabel } from '$lib/format';
import type { CorporacionEnElMapa, EnlaceGalaxia, MapaGalaxia, NodoGalaxia } from '$lib/tipos';

/** Cómo se lee una facción, o «Espacio libre» si no hay ninguna. */
function factionLabel(code: string): string {
	if (!code) return 'Espacio libre';
	return FACTION_LIST.find((una) => una.code === code)?.name ?? code;
}

/**
 * Qué sistemas llegan caminando hasta la semilla.
 *
 * Un ramal armado aparte tiene casilla pero **no tiene lugar**: su posición no
 * significa nada hasta engancharlo. El cuartel lo dibuja para poder arreglarlo; al
 * piloto sencillamente no se le puede llegar.
 */
function reachableSystems(
	systems: readonly { readonly id: number }[],
	gates: readonly { readonly systemId: number; readonly destinationId: number | null }[],
	gateBySystem: ReadonlyMap<number, number>
): Set<number> {
	const enElMapa = new Set<number>();
	const semilla = [...systems].sort((a, b) => a.id - b.id)[0];
	if (!semilla) return enElMapa;

	const pendientes = [semilla.id];
	enElMapa.add(semilla.id);
	while (pendientes.length > 0) {
		const actual = pendientes.pop()!;
		for (const salida of gates.filter((una) => una.systemId === actual)) {
			if (salida.destinationId === null) continue;
			const suyo = gateBySystem.get(salida.destinationId);
			if (suyo === undefined || enElMapa.has(suyo)) continue;
			enElMapa.add(suyo);
			pendientes.push(suyo);
		}
	}
	return enElMapa;
}

/**
 * La galaxia entera, con cada sistema en su casilla y cada pasaje como una línea.
 *
 * **Devuelve todos los sistemas siempre.** Filtrar acá sería devolver un mapa con
 * agujeros, y un mapa con agujeros no se lee: el recorte apaga lo que no coincide,
 * y eso lo decide quien dibuja, no quien arma.
 */
export function buildGalaxyMap(db: Db): MapaGalaxia {
	const sistemas = db.select().from(system).orderBy(system.name).all();
	const puertas = db.select().from(gate).all();
	const cuerpos = db.select().from(body).all();
	const estaciones = db.select().from(station).all();
	const servicios = db.select().from(stationService).all();
	const corporaciones = new Map(
		db
			.select()
			.from(corporation)
			.all()
			.map((una) => [una.id, una])
	);
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
			.map((una) => [una.id, una])
	);

	const porSistema = new Map(sistemas.map((uno) => [uno.id, uno]));
	// De qué sistema es cada puerta, por el cuerpo donde está plantada: es lo que
	// convierte «esta salida lleva a esa puerta» en «esta salida lleva a ese
	// sistema», que es lo único que el mapa dibuja.
	const puertaEnCuerpo = new Map(puertas.map((una) => [una.bodyId, una]));
	const sistemaDeLaPuerta = new Map(puertas.map((una) => [una.bodyId, una.systemId]));
	const enElMapa = reachableSystems(sistemas, puertas, sistemaDeLaPuerta);

	// Cuántos cuerpos y estaciones tiene cada uno, contados de una sola pasada:
	// con sesenta sistemas, filtrar la lista entera por sistema son sesenta
	// recorridas de todo el universo.
	const cuerposPorSistema = new Map<number, number>();
	for (const cuerpo of cuerpos) {
		cuerposPorSistema.set(cuerpo.systemId, (cuerposPorSistema.get(cuerpo.systemId) ?? 0) + 1);
	}

	const sistemaDelCuerpo = new Map(cuerpos.map((uno) => [uno.id, uno.systemId]));
	const estacionesPorSistema = new Map<number, number>();
	// Qué servicios ofrece el sistema **entre todas sus estaciones**: al piloto le
	// alcanza con saber que en ese sistema hay refinería, no en cuál de sus tres
	// estaciones está. Eso se lo dice la pestaña Sistema una vez que llegó.
	const serviciosPorSistema = new Map<number, Set<string>>();
	const sistemaDeLaEstacion = new Map<number, number>();
	// Y quién opera en cada sistema, que es con lo que se contesta «¿dónde está la
	// mía?». Va en la misma pasada: recorrer las estaciones dos veces para contar
	// una vez y agrupar la otra es recorrerlas de más.
	const corporacionesPorSistema = new Map<number, Set<string>>();
	const conPuesto = new Map<string, CorporacionEnElMapa>();
	for (const una of estaciones) {
		const suyo = sistemaDelCuerpo.get(una.bodyId);
		if (suyo === undefined) continue;
		sistemaDeLaEstacion.set(una.id, suyo);
		estacionesPorSistema.set(suyo, (estacionesPorSistema.get(suyo) ?? 0) + 1);

		const suya = corporaciones.get(una.corporationId);
		if (!suya) continue;
		const suyas = corporacionesPorSistema.get(suyo) ?? new Set<string>();
		suyas.add(suya.code);
		corporacionesPorSistema.set(suyo, suyas);
		conPuesto.set(suya.code, { code: suya.code, name: suya.name });
	}
	for (const servicio of servicios) {
		const suyo = sistemaDeLaEstacion.get(servicio.stationId);
		if (suyo === undefined) continue;
		const suyos = serviciosPorSistema.get(suyo) ?? new Set<string>();
		suyos.add(servicio.service);
		serviciosPorSistema.set(suyo, suyos);
	}

	const nodos: NodoGalaxia[] = sistemas.map((uno) => {
		const suyas = puertas.filter((una) => una.systemId === uno.id);
		const suConstelacion = constelaciones.get(uno.constellationId);
		const suRegion = suConstelacion ? regiones.get(suConstelacion.regionId) : undefined;
		const suyos = serviciosPorSistema.get(uno.id) ?? new Set<string>();
		const suyasCorp = corporacionesPorSistema.get(uno.id) ?? new Set<string>();

		return {
			code: uno.code,
			name: uno.name,
			hex: { x: uno.x, y: uno.y, z: uno.z },
			government: governmentLabel(uno.government),
			security: uno.security,
			securityLevel: securityLabel(securityLevel(uno.security)),
			faction: uno.controllingFaction,
			factionName: factionLabel(uno.controllingFaction),
			region: suRegion?.name ?? '',
			constellation: suConstelacion?.name ?? '',
			regionColor: suRegion?.color ?? '',
			constellationColor: suConstelacion?.color ?? '',
			bodies: cuerposPorSistema.get(uno.id) ?? 0,
			stations: estacionesPorSistema.get(uno.id) ?? 0,
			// En el orden del catálogo y no en el que los devolvió la base: una lista de
			// servicios que cambia de orden entre dos sistemas no se puede comparar de
			// un vistazo, que es justo para lo que está.
			services: SERVICE_ORDER.filter((servicio) => suyos.has(servicio)),
			corporations: [...suyasCorp].sort(),
			gates: suyas.length,
			looseBearings: suyas.filter((una) => una.destinationId === null).map((una) => una.bearing),
			free: freeBearings(suyas.map((una) => una.bearing)),
			adrift: !enElMapa.has(uno.id)
		};
	});

	// Una línea por par y no una por puerta: las dos puntas describen el mismo
	// pasaje, y dibujarlas dos veces engrosaría cada conexión al doble.
	const vistos = new Set<number>();
	const enlaces: EnlaceGalaxia[] = [];
	for (const salida of puertas) {
		if (salida.destinationId === null || vistos.has(salida.id)) continue;
		const gemela = puertaEnCuerpo.get(salida.destinationId);
		if (!gemela) continue;
		vistos.add(salida.id);
		vistos.add(gemela.id);

		const aqui = porSistema.get(salida.systemId);
		const alla = porSistema.get(gemela.systemId);
		if (!aqui || !alla) continue;

		enlaces.push({
			from: aqui.code,
			to: alla.code,
			bearing: salida.bearing,
			distance: lightYears(salida.jumpDistance),
			closed: salida.closed,
			shortcut: !sameHex(neighbourOf({ x: aqui.x, y: aqui.y, z: aqui.z }, salida.bearing), {
				x: alla.x,
				y: alla.y,
				z: alla.z
			})
		});
	}

	// Cuán lejos del centro llega el mapa, para encuadrarlo sin medir en el cliente.
	const radio = nodos.reduce((mayor, nodo) => Math.max(mayor, hexDistance(ORIGIN, nodo.hex)), 0);

	return {
		systems: nodos,
		links: enlaces,
		corporations: [...conPuesto.values()].sort((a, b) => a.name.localeCompare(b.name, 'es')),
		radius: radio,
		adrift: nodos.filter((nodo) => nodo.adrift).length
	};
}

/**
 * Quién es vecino de quién, por código de sistema.
 *
 * Es el grafo que hace falta para contar saltos, y sale de los enlaces del mapa y
 * no de la base: el mapa ya resolvió cuál puerta lleva a cuál sistema, y volver a
 * deducirlo sería tener dos ideas de qué está conectado.
 *
 * **Un paso cerrado no es un vecino.** Contar saltos por un pasaje que nadie puede
 * cruzar daría una distancia que no existe, y lo que el jugador lee como «a dos
 * saltos» tiene que ser un camino que pueda hacer.
 */
export function neighbourhood(map: MapaGalaxia): Map<string, string[]> {
	const vecinos = new Map<string, string[]>();
	for (const nodo of map.systems) vecinos.set(nodo.code, []);

	for (const enlace of map.links) {
		if (enlace.closed) continue;
		vecinos.get(enlace.from)?.push(enlace.to);
		vecinos.get(enlace.to)?.push(enlace.from);
	}
	return vecinos;
}

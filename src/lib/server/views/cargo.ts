/**
 * La bodega de la nave, lista para dibujar.
 *
 * La pregunta de una bodega nunca es cuánto llevás: es **cuánto más entra**, y
 * por eso lo ocupado viaja siempre con el tope y con lo que queda libre. En un
 * juego donde la capacidad limitada es el pilar —todo lo que se lleva obliga a
 * dejar otra cosa—, un número suelto no alcanza para decidir nada.
 *
 * Tres decisiones de forma que valen más que el detalle:
 *
 * - **La barra de cada bahía está partida por lo que hay adentro.** Un medidor
 *   que sólo dice «78 % lleno» es un adorno; uno que muestra que el silicato se
 *   come la mitad y la veta iridiada una franja fina es lo que hace decidir qué
 *   se tira cuando no entra algo.
 * - **Las bahías son una lista, aunque hoy haya una sola.** Las barcazas van a
 *   tener bodega de mineral aparte y las cargueras su bahía de flota; dibujar N
 *   y dibujar una es el mismo trabajo, y migrar después es rehacer la pantalla.
 * - **La lista se recorta desde la URL**, como el resto de las tablas del juego:
 *   buscar, filtrar por tipo, ordenar y paginar quedan en el enlace.
 */

import { eq } from 'drizzle-orm';
import { ship, type Pilot } from '../db/schema';
import type { Db } from '../db/types';
import { cargoHold, shipContainer, stationContainer, type CargoHold } from '../services/containers';
import { shipReadout } from '../services/ships';
import { situation } from '../services/status';
import { ITEM_KINDS, baseValueOf, getItem } from '$lib/game/items';
import { floorDiv, roundHalfEven } from '$lib/game/math';
import { cubicMeters, itemIcon, itemKindLabel, thousands } from '$lib/format';
import { paginate, readListing, sift, type Ordenes } from './listing';
import type { Bahia, Bodega, ConsultaCarga, FilaCarga, TramoBahia, VistaCarga } from '$lib/tipos';

/** Cuántos montones entran en una página. */
export const CARGO_PER_PAGE = 24;

/**
 * Por qué se puede ordenar la carga.
 *
 * **La densidad es la que importa y la que no existe en ningún otro lado.** Con
 * la bodega llena, lo que decide qué se tira no es qué vale más sino qué vale más
 * *por el lugar que ocupa*, y es la cuenta que en EVE los mineros hacen a mano.
 */
export const CARGO_SORTS: Ordenes<FilaCarga> = {
	volumen: (fila) => fila.share,
	valor: (fila) => fila.rawValue,
	densidad: (fila) => fila.rawDensity,
	cantidad: (fila) => fila.quantity,
	nombre: (fila) => fila.name.toLocaleLowerCase('es')
};

/** Los filtros, cada uno con su pregunta. Se apilan: entra la que pasa todas. */
const CARGO_FILTERS: readonly ((fila: FilaCarga, query: ConsultaCarga) => boolean)[] = [
	(fila, query) => !query.kind || fila.kind === query.kind,
	(fila, query) =>
		!query.search ||
		fila.name.toLocaleLowerCase('es').includes(query.search.toLocaleLowerCase('es'))
];

/** Lo que la pantalla leyó de la URL. */
export function readCargoQuery(params: URLSearchParams): ConsultaCarga {
	const base = readListing(params, CARGO_SORTS, 'volumen');
	const kind = params.get('tipo') ?? '';
	const vista = params.get('vista');

	return {
		...base,
		kind: ITEM_KINDS.includes(kind as never) ? kind : '',
		// Baldosas por omisión: la carga se mira para ver **qué hay**, y una grilla
		// contesta eso de un vistazo. La lista es para comparar cifras, que es la
		// segunda pregunta.
		view: (vista === 'lista' ? 'lista' : 'baldosas') as VistaCarga
	};
}

/** Una bodega sin nave: el piloto todavía no tiene dónde guardar nada. */
const SIN_NAVE: Bodega = {
	shipName: '',
	bays: [],
	lines: [],
	total: 0,
	found: 0,
	page: 1,
	pages: 1,
	totalValue: '0',
	kinds: [],
	query: { search: '', kind: '', sort: 'volumen', dir: 'asc', page: 1, view: 'baldosas' },
	stationName: '',
	stationLines: [],
	stationValue: '0'
};

/**
 * Los colores con que se pinta la composición de una bahía.
 *
 * Se reparten por orden de tamaño y no por tipo de ítem: lo que la barra tiene
 * que contestar es **qué me está llenando la bodega**, y para eso el montón más
 * grande tiene que ser el más visible. Un color por tipo haría que dos montones
 * de mineral distinto se vieran iguales, que es justo lo que hay que distinguir.
 */
const SEGMENT_COLORS = [
	'var(--color-accent)',
	'var(--color-data)',
	'var(--color-accent-bright)',
	'var(--color-success)',
	'var(--color-warning)',
	'var(--color-accent-dim)'
];

/** Pasa lo que hay en una bodega a filas dibujables. */
function buildLines(hold: CargoHold): FilaCarga[] {
	return (
		hold.lines
			.map((line) => {
				const item = getItem(line.itemCode);
				const valor = baseValueOf(line.itemCode, line.quantity);
				return {
					itemCode: line.itemCode,
					name: item.name,
					kind: item.kind,
					kindLabel: itemKindLabel(item.kind),
					icon: itemIcon(item),
					quantity: line.quantity,
					volume: cubicMeters(line.volumeTenths),
					// Cuánto de lo ocupado se lleva este montón. Compara contra lo cargado
					// y no contra el tope: con la bodega a medio llenar, todas las barras
					// serían igual de cortas y no se distinguiría qué la está llenando.
					share:
						hold.usedTenths > 0 ? roundHalfEven((line.volumeTenths * 100) / hold.usedTenths) : 0,
					value: thousands(valor),
					rawValue: valor,
					// Créditos por metro cúbico, en enteros: el volumen viene en décimas,
					// así que multiplicar por diez antes de dividir da la cuenta justa sin
					// un solo decimal en el camino.
					rawDensity: line.volumeTenths > 0 ? floorDiv(valor * 10, line.volumeTenths) : 0,
					density: line.volumeTenths > 0 ? thousands(floorDiv(valor * 10, line.volumeTenths)) : '—'
				};
			})
			// De lo que más ocupa a lo que menos: es el orden en que uno decide qué
			// tirar cuando no entra algo.
			.sort((a, b) => b.share - a.share || a.name.localeCompare(b.name))
	);
}

/** La barra de una bahía, partida por los montones que tiene adentro. */
function buildSegments(hold: CargoHold, lines: readonly FilaCarga[]): TramoBahia[] {
	if (hold.capacityTenths <= 0) return [];

	return hold.lines
		.map((line) => ({
			itemCode: line.itemCode,
			tenths: line.volumeTenths
		}))
		.sort((a, b) => b.tenths - a.tenths)
		.map((line, indice) => ({
			itemCode: line.itemCode,
			name: lines.find((fila) => fila.itemCode === line.itemCode)?.name ?? line.itemCode,
			percent: roundHalfEven((line.tenths * 100) / hold.capacityTenths),
			color: SEGMENT_COLORS[indice % SEGMENT_COLORS.length]
		}));
}

/** Una bahía dibujable a partir de su contenido. */
function buildBay(code: string, name: string, hold: CargoHold, lines: readonly FilaCarga[]): Bahia {
	return {
		code,
		name,
		icon: code === 'general' ? 'package' : 'diamond',
		used: cubicMeters(hold.usedTenths),
		capacity: cubicMeters(hold.capacityTenths),
		free: cubicMeters(hold.freeTenths),
		percent:
			hold.capacityTenths > 0
				? Math.min(100, roundHalfEven((hold.usedTenths * 100) / hold.capacityTenths))
				: 0,
		segments: buildSegments(hold, lines)
	};
}

/** Lo que vale todo lo que hay en una bodega, a precio de referencia. */
function valueOf(hold: CargoHold): number {
	return hold.lines.reduce((total, line) => total + baseValueOf(line.itemCode, line.quantity), 0);
}

/** Todo lo que la pestaña Bodega necesita, en una sola pasada. */
export function buildCargoView(db: Db, row: Pilot, params: URLSearchParams): Bodega {
	const nave = db.select().from(ship).where(eq(ship.pilotId, row.id)).get();
	if (!nave) return SIN_NAVE;

	const query = readCargoQuery(params);

	// La capacidad sale de la hoja de rendimiento y no del casco: los módulos de
	// bodega y el bono de Ingeniería de bodega también cuentan, y tienen que
	// contar igual acá que en la ficha de la nave.
	const readout = shipReadout(db, row);
	const capacidad = readout?.cargo ?? 0;
	const hold = cargoHold(db, shipContainer(db, nave.id).id, capacidad);

	const todas = buildLines(hold);
	const encontradas = sift(todas, query, CARGO_FILTERS);
	const pagina = paginate(encontradas, query, CARGO_SORTS, CARGO_PER_PAGE, (a, b) =>
		a.name.localeCompare(b.name)
	);

	// Sólo los tipos que hay adentro: ofrecer un filtro que no encuentra nada es
	// hacer perder el tiempo.
	const presentes = new Set(todas.map((fila) => fila.kind));
	const kinds = [...presentes].sort().map((kind) => ({
		value: kind,
		label: itemKindLabel(kind as never)
	}));

	// Y lo que tenga guardado acá, si está atracado. La capacidad que se le pasa
	// es la propia carga: una bodega de estación no tiene tope todavía, y pasarle
	// cero haría que todas las barras salieran en cien.
	const ahora = situation(db, row);
	const hangar =
		ahora.stationId === null
			? null
			: cargoHold(db, stationContainer(db, row.id, ahora.stationId).id, 0);
	const stationLines = hangar ? buildLines({ ...hangar, capacityTenths: hangar.usedTenths }) : [];

	return {
		shipName: nave.name || readout?.hull.name || '',
		// Una sola bahía hoy: la general. El día que exista la de mineral se suma
		// acá y la pantalla no se entera.
		bays: [buildBay('general', 'Bodega general', hold, todas)],
		lines: pagina.rows,
		total: todas.length,
		found: encontradas.length,
		page: pagina.page,
		pages: pagina.pages,
		totalValue: thousands(valueOf(hold)),
		kinds,
		query,
		stationName: hangar ? ahora.place : '',
		stationLines,
		stationValue: thousands(hangar ? valueOf(hangar) : 0)
	};
}

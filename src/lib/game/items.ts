/**
 * Todo lo que ocupa lugar en una bodega.
 *
 * Un ítem es cualquier cosa que se pueda tener, mover, comprar o vender: mineral
 * en bruto, un módulo de repuesto, y mañana materiales refinados e inyecciones de
 * habilidad. Lo que los une es que **ocupan volumen y tienen un precio de
 * referencia**; lo que hagan después es problema de otro módulo.
 *
 * **Esto no es una lista de veinte entradas, es una lista de dos más una
 * derivación.** El catálogo declara los minerales a mano —son contenido, y cada
 * uno es una decisión de diseño— y **deriva** un ítem por cada módulo del
 * catálogo de naves. Así, agregar un módulo no obliga a acordarse de agregarlo
 * también acá, que es exactamente la clase de sincronización manual que se rompe
 * el día que hay cientos.
 *
 * Corresponde a docs/systems/SHIPS.md y docs/systems/UNIVERSE.md.
 */

import { indexByCode, lookup } from './catalog';
import { MODULES, type ShipModule } from './modules';

/**
 * El volumen se guarda en **décimas de metro cúbico, en enteros**.
 *
 * Es el mismo truco que `fitting` ya usa para el alcance de salto. Sin décimas
 * no existe un ítem que ocupe menos de un metro cúbico, y el día que refinar
 * tenga que premiar con material más compacto que su mineral, no habría con qué
 * expresarlo. **Nada de decimales en la cadena**: un flotante en un inventario es
 * una unidad que aparece o desaparece al sumar.
 */
export const TENTHS_PER_CUBIC_METER = 10;

/** Qué clase de cosa es. Define dónde se consigue y qué se hace con ella. */
export const ITEM_KINDS = ['ore', 'module'] as const;
export type ItemKind = (typeof ITEM_KINDS)[number];

/**
 * De qué es una bodega.
 *
 * La de una nave viaja con ella; la de una estación se queda ahí. El día que
 * exista la de una corporación o el hangar de naves guardadas, se suman acá y el
 * inventario no se entera.
 */
export const CONTAINER_KINDS = ['ship', 'station'] as const;
export type ContainerKind = (typeof CONTAINER_KINDS)[number];

/** Cualquier cosa que ocupe lugar en una bodega. */
export interface Item {
	readonly code: string;
	readonly name: string;
	readonly kind: ItemKind;
	/** Lo que ocupa una unidad, en décimas de m³. */
	readonly volumeTenths: number;
	/**
	 * Precio de referencia en créditos por unidad.
	 *
	 * Es el valor del que parten las estaciones; lo que cada una pague o cobre se
	 * calcula sobre éste. El día que los precios los muevan los jugadores, sigue
	 * sirviendo como ancla para arrancar un mercado vacío.
	 */
	readonly basePrice: number;
	readonly description: string;
}

/**
 * Un mineral, que además de ocupar y valer **cuesta tiempo sacarlo**.
 *
 * El ciclo es la dureza escrita en segundos: lo común se desprende rápido, lo
 * escaso hay que trabajarlo. Es la base de la que parte la duración de una orden
 * y **no depende del piloto**, que es lo que hace que un mineral difícil siga
 * siendo difícil por mucho que uno mejore.
 */
export interface Ore extends Item {
	readonly kind: 'ore';
	/** Lo que tarda un ciclo sobre este mineral, antes de cualquier bono. */
	readonly cycleSeconds: number;
}

/**
 * Los minerales que se sacan de un cinturón.
 *
 * Cuatro, en tres escalones de rareza, y repartidos de modo que **el Cinturón
 * Exterior valga el viaje**: está a 520 unidades de la estrella contra las 212 de
 * los Anillos, y lo único que compensa esa distancia es tener mineral que el otro
 * no tiene.
 *
 * El volumen baja con la rareza a propósito: lo valioso ocupa menos, así una
 * bodega chica no impide ir a buscar lo bueno —impide traer mucho de lo barato—.
 *
 * Los precios son de balance y se van a mover.
 */
const ORES = [
	{
		code: 'ferrous_silicate',
		name: 'Silicato ferroso',
		kind: 'ore',
		volumeTenths: 10,
		basePrice: 12,
		cycleSeconds: 60,
		description: 'Roca gris con vetas de hierro. El pan de todos los días en los Anillos.'
	},
	{
		code: 'carbon_chondrite',
		name: 'Condrita carbonácea',
		kind: 'ore',
		volumeTenths: 10,
		basePrice: 15,
		cycleSeconds: 60,
		description: 'Oscura y quebradiza. Más carbono que metal, y lo suficientemente común.'
	},
	{
		code: 'pyroxene',
		name: 'Piroxeno',
		kind: 'ore',
		volumeTenths: 8,
		basePrice: 44,
		cycleSeconds: 90,
		description: 'Cristal verdoso de los bordes fríos. Denso en silicio y difícil de encontrar.'
	},
	{
		code: 'iridium_vein',
		name: 'Veta iridiada',
		kind: 'ore',
		volumeTenths: 6,
		basePrice: 130,
		cycleSeconds: 150,
		description: 'Escaso y pesado. Aparece lejos y nunca en cantidad.'
	}
] as const satisfies readonly Ore[];

/**
 * Lo que ocupa un módulo suelto en la bodega, por clase.
 *
 * Se deriva del tamaño y no se declara módulo por módulo: llevar un repuesto de
 * clase 3 tiene que costar más lugar que uno de clase 1, y ésa es toda la regla.
 * Un valor propio por módulo sería cuarenta y siete números que nadie va a
 * mantener.
 */
export const MODULE_VOLUME_TENTHS_PER_CLASS = 50;

/**
 * Precio de referencia de un módulo, por clase y escalón.
 *
 * Sale de las dos cosas que lo definen: cuánto ocupa y qué tan arriba está en la
 * escalera. El multiplicador del escalón es lo que hace que subir un peldaño se
 * sienta en la billetera además de en los requisitos. Números de balance.
 */
const MODULE_PRICE_PER_CLASS = 800;
const TIER_PRICE_MULTIPLIER: Readonly<Record<string, number>> = {
	E: 1,
	D: 2,
	C: 3,
	B: 5,
	A: 8
};

/** El ítem que representa a un módulo guardado, no montado. */
function moduleItem(module: ShipModule): Item {
	return {
		code: module.code,
		name: module.name,
		kind: 'module',
		volumeTenths: MODULE_VOLUME_TENTHS_PER_CLASS * module.size,
		basePrice: MODULE_PRICE_PER_CLASS * module.size * (TIER_PRICE_MULTIPLIER[module.tier] ?? 1),
		description: module.description
	};
}

/**
 * El catálogo entero.
 *
 * La ranura vacía no es un ítem: se la reconoce por tener el código vacío, y un
 * inventario no puede guardar "nada".
 */
export const ITEMS: readonly Item[] = [
	...ORES,
	...MODULES.filter((module) => module.code !== '').map(moduleItem)
];

/** El catálogo indexado por código. */
const BY_CODE = indexByCode(ITEMS);

/** Busca un ítem por código, o falla diciendo cuál falta. */
export function getItem(code: string): Item {
	return lookup(BY_CODE, code, 'el ítem');
}

/** Si el catálogo conoce ese código. Para validar lo que llega de afuera. */
export function isItem(code: string): boolean {
	return code in BY_CODE;
}

/** Los minerales, en orden de rareza. Es el orden en que se muestran. */
export const ORE_LIST: readonly Ore[] = ORES;

/** El código de cualquier mineral del catálogo. */
export type OreCode = (typeof ORES)[number]['code'];

/** El catálogo de minerales indexado por código. */
const ORES_BY_CODE = indexByCode(ORES);

/** Busca un mineral por código, o falla diciendo cuál falta. */
export function getOre(code: string): Ore {
	return lookup(ORES_BY_CODE, code, 'el mineral');
}

/** Si ese código es de un mineral. Para validar lo que llega de afuera. */
export function isOre(code: string): boolean {
	return code in ORES_BY_CODE;
}

/**
 * Lo que ocupan `quantity` unidades de un ítem, en décimas de m³.
 *
 * Multiplicar antes de cualquier otra cosa mantiene todo en enteros: dividir
 * primero perdería fracciones que después no vuelven.
 */
export function volumeOf(code: string, quantity: number): number {
	if (quantity < 0) throw new RangeError('Una cantidad no puede ser negativa');
	return getItem(code).volumeTenths * quantity;
}

/** Lo que valen `quantity` unidades a precio de referencia. */
export function baseValueOf(code: string, quantity: number): number {
	if (quantity < 0) throw new RangeError('Una cantidad no puede ser negativa');
	return getItem(code).basePrice * quantity;
}

/**
 * La capacidad de una bodega en décimas, a partir de los m³ que dice la nave.
 *
 * La hoja de rendimiento habla en metros cúbicos enteros porque es lo que se
 * muestra; el inventario cuenta en décimas. La conversión vive acá y en un solo
 * lugar, para que no haya dos ideas de cuánto entra.
 */
export function capacityTenths(cubicMeters: number): number {
	return cubicMeters * TENTHS_PER_CUBIC_METER;
}

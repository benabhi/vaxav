/**
 * La descripción de un cuerpo y de un sistema, **derivada de lo que son**.
 *
 * Antes cada planeta, cinturón y estación traía su descripción escrita a mano en
 * el plano. Dos problemas, y el segundo es el grave:
 *
 * - **No escala.** Con doscientos sistemas hay que escribir mil textos, y
 *   escribirlos es exactamente el trabajo que nadie va a hacer.
 * - **Miente.** Una frase escrita a mano no se entera de que alguien cambió el
 *   dato: si mañana el Cinturón Exterior duplica su mineral, el texto sigue
 *   diciendo «disperso» y no hay nada que lo detecte. Una descripción derivada
 *   **no puede estar desactualizada**, y ése es el argumento de verdad.
 *
 * El texto que había no se tiró: se leyó como especificación. «Gigante gaseoso»
 * era una clase, «sin atmósfera» era un campo, «denso y bien surtido» eran los
 * depósitos y «sin vigilancia» era la seguridad del sistema. Escribir esta
 * función fue traducir esas frases a los datos que ya las causaban.
 *
 * ## Las tres reglas
 *
 * 1. **No repetir lo que ya está en una columna.** La distancia se muestra al
 *    lado en unidades; la prosa no dice el número, dice «en el borde del
 *    sistema», que es un juicio y no un dato repetido. Si una frase no agrega
 *    nada que el jugador no pueda ver, no se escribe.
 * 2. **La mayoría tienen que ser cortas.** Si todos los cuerpos sacan tres
 *    frases, ninguno es notable y a la tercera pantalla nadie lee. **El largo es
 *    la señal**: cuando algo se extiende, es porque tiene algo.
 * 3. **Se permite el silencio.** Una estación no devuelve ninguna frase, y está
 *    bien: su pantalla ya muestra servicios, dueño y agentes, y resumirlo arriba
 *    sería decir dos veces lo mismo. Que la mayoría callen es lo que hace que la
 *    que habla signifique algo.
 *
 * Devuelve **frases sueltas y no un párrafo** para que cada pantalla decida: el
 * árbol junta las primeras en un renglón, Ubicación las muestra todas.
 */

import {
	thermalBand,
	type Atmosphere,
	type BodyClass,
	type BodyKind,
	type StarClass,
	type ThermalBand
} from '$lib/game/universe';

/** Lo que el cuerpo es por sí mismo. Sale tal cual de la fila de la base. */
export interface BodyFacts {
	readonly kind: BodyKind;
	readonly bodyClass: BodyClass | '';
	readonly atmosphere: Atmosphere | '';
	readonly starClass: StarClass | '';
	readonly explored: boolean;
}

/**
 * Lo que hace falta saber **de alrededor** para describirlo.
 *
 * Nada de esto es del cuerpo: un planeta no sabe qué estrella lo calienta ni qué
 * tan lejos está del borde de su sistema. Lo arma quien tiene el árbol entero
 * delante, que ya lo trae en una sola consulta.
 */
export interface BodyContext {
	/** La clase de la estrella del sistema: de acá sale la banda térmica. */
	readonly starClass: StarClass | '';
	/** Distancia a la estrella, no al cuerpo que orbita. */
	readonly starDistance: number;
	/** La órbita más lejana del sistema: con eso se sabe qué es «el borde». */
	readonly edgeDistance: number;
	/** Si es cinturón: cuánto mineral aguanta en total. De acá sale su densidad. */
	readonly beltCapacity: number;
}

/** Un contexto vacío, para quien describe un cuerpo suelto. */
export const SIN_CONTEXTO: BodyContext = {
	starClass: '',
	starDistance: 0,
	edgeDistance: 0,
	beltCapacity: 0
};

const STAR_PROSE: Readonly<Record<StarClass, string>> = {
	O: 'Gigante azul de clase O.',
	B: 'Azul blanca de clase B.',
	A: 'Blanca de clase A.',
	F: 'Blanca amarillenta de clase F.',
	G: 'Enana amarilla de clase G.',
	K: 'Enana naranja de clase K.',
	M: 'Enana roja de clase M.'
};

/** Masculino para planetas, femenino para lunas. */
const CLASS_PROSE: Readonly<Record<BodyClass, readonly [string, string]>> = {
	rocky: ['Rocoso', 'Rocosa'],
	gas: ['Gigante gaseoso', 'Gaseosa'],
	ice: ['Helado', 'Helada'],
	ocean: ['Oceánico', 'Oceánica'],
	volcanic: ['Volcánico', 'Volcánica']
};

const BAND_PROSE: Readonly<Record<ThermalBand, readonly [string, string]>> = {
	scorched: ['abrasado', 'abrasada'],
	warm: ['cálido', 'cálida'],
	temperate: ['templado', 'templada'],
	cold: ['frío', 'fría'],
	frozen: ['helado', 'helada']
};

/**
 * Qué clima no agrega nada a una composición.
 *
 * Una luna helada ya es fría: decir «helada y fría» es decirlo dos veces con dos
 * palabras distintas, que es peor que repetir la misma. Lo mismo un mundo
 * volcánico cerca de su estrella.
 */
const CLIMA_REDUNDANTE: Readonly<Record<BodyClass, readonly ThermalBand[]>> = {
	rocky: [],
	gas: [],
	ice: ['cold', 'frozen'],
	ocean: [],
	volcanic: ['scorched', 'warm']
};

const ATMOSPHERE_PROSE: Readonly<Record<Atmosphere, string>> = {
	none: 'Sin atmósfera.',
	thin: 'Atmósfera fina.',
	breathable: 'Atmósfera respirable.',
	dense: 'Atmósfera densa.',
	toxic: 'Atmósfera tóxica.'
};

/**
 * Qué tan poblado de rocas está un cinturón, por el total que aguanta.
 *
 * Es una propiedad **física del campo**, no un juicio sobre lo que vale: qué
 * mineral tiene y cuánto paga no es descripción, es información de mercado, y
 * además la contesta el escáner roca por roca. La descripción dice qué es el
 * lugar; lo que rinde se averigua yendo.
 *
 * Los cortes están donde separan a los dos cinturones de Ánfora —cien mil contra
 * once mil— con lugar en el medio para los que vengan.
 */
function densityWord(capacity: number): string {
	if (capacity >= 50_000) return 'denso';
	if (capacity >= 15_000) return 'moderado';
	return 'disperso';
}

/**
 * Si está en el cuarto exterior de su sistema.
 *
 * **No es una frase, es un dato**: alimenta el aviso de riesgo y nada más. Que un
 * cinturón esté en el borde o en el interior no le dice al minero nada que no le
 * diga la columna de distancia que tiene al lado; lo que sí cambia es que ahí
 * afuera las patrullas no llegan, y eso se avisa en su propio renglón y con
 * todas las letras. Ver `threatLevel`.
 */
export function atEdge(context: BodyContext): boolean {
	// El último cuarto del sistema, en proporción y no en unidades: un sistema
	// chico y uno enorme tienen los dos su borde.
	return context.edgeDistance > 0 && context.starDistance * 4 >= context.edgeDistance * 3;
}

function capitalizar(palabra: string): string {
	return palabra.charAt(0).toUpperCase() + palabra.slice(1);
}

/** Junta clase y clima sin repetir la palabra: una luna helada y fría es helada. */
function natureSentence(facts: BodyFacts, context: BodyContext): string {
	const femenino = facts.kind === 'moon' ? 1 : 0;
	const clase = facts.bodyClass === '' ? '' : CLASS_PROSE[facts.bodyClass][femenino];
	const banda = thermalBand(context.starClass, context.starDistance);
	const sobra =
		banda !== '' && facts.bodyClass !== '' && CLIMA_REDUNDANTE[facts.bodyClass].includes(banda);
	const clima = banda === '' || sobra ? '' : BAND_PROSE[banda][femenino];

	if (clase === '') return clima === '' ? '' : capitalizar(clima) + '.';
	if (clima === '') return clase + '.';
	return clase + ' y ' + clima + '.';
}

/**
 * Las frases que describen un cuerpo, o ninguna.
 *
 * Lo que no se exploró no se describe: **el peligro de verdad de un piloto nuevo
 * no es el pirata, es salir a un lugar del que no sabe nada**, y contarle la
 * composición de un cinturón que nadie visitó sería regalarle lo que tendría que
 * ir a buscar.
 */
export function describeBody(facts: BodyFacts, context: BodyContext): readonly string[] {
	if (!facts.explored) return ['Sin explorar: no hay datos de lo que hay acá.'];

	switch (facts.kind) {
		case 'star':
			return facts.starClass === '' ? [] : [STAR_PROSE[facts.starClass]];

		case 'planet':
		case 'moon': {
			const frases = [natureSentence(facts, context)];
			if (facts.atmosphere !== '') frases.push(ATMOSPHERE_PROSE[facts.atmosphere]);
			return frases.filter((frase) => frase !== '');
		}

		// Qué tan poblado está el campo, y nada más. Dónde está lo dice la columna
		// de distancia, qué tan peligroso es lo dice el aviso de riesgo, y qué hay
		// adentro de cada roca lo dice el escáner.
		case 'belt':
			return ['Campo ' + densityWord(context.beltCapacity) + ' de asteroides.'];

		// Una estación ya muestra sus servicios, su dueño y sus agentes en la misma
		// pantalla, y una puerta dice a dónde va en su propio nombre. Resumir eso
		// arriba sería decirlo dos veces.
		case 'station':
		case 'gate':
			return [];
	}
}

/** Lo que hace falta saber de un sistema para describirlo. */
export interface SystemFacts {
	/** El nombre de la facción de la que es capital, ya resuelto, o vacío. */
	readonly capitalOf: string;
}

/**
 * Las frases que describen un sistema.
 *
 * Mismo criterio que los cuerpos: el nombre, la región y el número de seguridad
 * ya están arriba en la pantalla, así que acá va lo que esos datos **significan**
 * y no lo que dicen.
 */
export function describeSystem(facts: SystemFacts): readonly string[] {
	// Casi siempre calla, y está bien. Gobierno, seguridad, región, constelación y
	// quién lo controla ya están arriba en la pantalla, cada uno con su rótulo y su
	// valor; contarlos otra vez en prosa sería decir dos veces lo mismo, con peor
	// tipografía. Lo único que no es un rótulo es ser capital de alguien.
	return facts.capitalOf === '' ? [] : ['Es la capital ' + de(facts.capitalOf) + '.'];
}

/**
 * «de» y el nombre, con el artículo contraído.
 *
 * Las facciones se llaman «El Dominio» y «La Concordia», con artículo y todo,
 * porque así se nombran en pantalla. Pegarle «del» adelante sin mirar da «del El
 * Dominio», que es el clásico error de armar frases juntando pedazos.
 */
function de(nombre: string): string {
	if (nombre.startsWith('El ')) return 'del ' + nombre.slice(3);
	if (nombre.startsWith('La ')) return 'de la ' + nombre.slice(3);
	if (nombre.startsWith('Los ')) return 'de los ' + nombre.slice(4);
	if (nombre.startsWith('Las ')) return 'de las ' + nombre.slice(4);
	return 'de ' + nombre;
}

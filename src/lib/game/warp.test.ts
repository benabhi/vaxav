/**
 * Salir y cruzar son dos números distintos, y si alguna vez alguien los colapsa
 * en uno solo este archivo tiene que ser el que grite.
 *
 * Lo que se protege es **el modelo**, que es de lo que se trató el cambio: un
 * viaje dentro del sistema es alineación más crucero, la alineación sale de la
 * masa y de la inercia —y la divide Maniobra—, y la velocidad de warp es de la
 * clase del casco y no la entrena nadie. Un casco rápido no sale antes.
 *
 * **Los números de acá salen de docs/systems/SHIPS.md**, sección «Viajar es
 * alinearse y cruzar»: el cuadro de los cinco cascos, la constante de
 * calibración y el 5 % por nivel de Maniobra, que docs/systems/SKILLS.md fija
 * como el bono por omisión de toda habilidad. Están escritos a mano y no
 * calculados a partir del propio código: si alguien los mueve, tiene que mover
 * el documento en el mismo commit.
 */

import { describe, expect, it } from 'vitest';
import { HULLS, STARTING_HULL, getHull } from './hulls';
import { roundHalfEven } from './math';
import {
	AGILITY_PER_ALIGN_SECOND,
	MIN_ALIGN_SECONDS,
	agility,
	alignSeconds,
	warpSeconds
} from './warp';

/**
 * El cuadro de los cinco cascos de docs/systems/SHIPS.md, copiado a mano.
 *
 * Las dos primeras columnas se guardan en décimas —`60` son 6,0 ud/s y `18` son
 * 1,8— y las dos últimas son lo que la cuenta tiene que dar con ellas.
 */
const CUADRO = [
	{ code: 'vencejo', warp: 60, inertia: 18, agility: 495, align: 3 },
	{ code: 'pioner', warp: 50, inertia: 23, agility: 575, align: 4 },
	{ code: 'alabarda', warp: 35, inertia: 22, agility: 1287, align: 9 },
	{ code: 'percal', warp: 25, inertia: 32, agility: 1616, align: 11 },
	{ code: 'mula', warp: 20, inertia: 40, agility: 2180, align: 15 }
] as const;

/** La alineación de un casco recién salido del astillero, sin nadie entrenado. */
function alineacionDe(code: string): number {
	return alineacionCon(code, 0);
}

/** La alineación de un casco con un bono de agilidad ya sumado, en segundos. */
function alineacionCon(code: string, bonusPercent: number): number {
	const hull = getHull(code);
	return alignSeconds(agility(hull.mass, hull.inertia, bonusPercent));
}

describe('la agilidad', () => {
	it('es masa por inercia, con la inercia en décimas', () => {
		// La inercia llega en décimas porque así la guarda el casco, igual que la
		// distancia de salto: el juego no lleva decimales dando vueltas.
		expect(agility(100, 10)).toBe(100);
		expect(agility(200, 25)).toBe(500);
		expect(agility(500, 40)).toBe(2000);
	});

	it('empeora con la masa, que es lo que hace carguera a una carguera', () => {
		// Es el único número que el equipamiento arruina sin pedir permiso: toda
		// placa que se monte entra por acá.
		const creciendo = [100, 250, 500, 1000].map((masa) => agility(masa, 20));
		expect(creciendo).toEqual([...creciendo].sort((a, b) => a - b));
		expect(new Set(creciendo).size).toBe(creciendo.length);
	});

	it('empeora con la inercia a igual masa', () => {
		// Es la columna que lleva la diferencia de clase, porque las masas del juego
		// están comprimidas y no alcanzan para separarlas solas.
		expect(agility(300, 40)).toBeGreaterThan(agility(300, 18));
	});

	it('el bono divide, no multiplica ni resta', () => {
		// Mejorar la agilidad es **bajar** el número, así que el bono va de divisor,
		// como la eficiencia de combustible. Los dos valores de al lado son los que
		// daría equivocarse de operación, y son los que hay que no obtener.
		expect(agility(1000, 10, 25)).toBe(800);
		expect(agility(1000, 10, 25)).not.toBe(1250);
		expect(agility(1000, 10, 25)).not.toBe(750);
	});

	it('con Maniobra al cinco se queda con cuatro quintos', () => {
		// +5 % por nivel hasta +25 % en el nivel cinco, que es el bono por omisión de
		// toda habilidad según docs/systems/SKILLS.md. Dividir por 1,25 es quedarse
		// con el 80 %, y por eso la alineación baja un quinto y no un cuarto.
		const MANIOBRA_V = 5 * 5;
		expect(agility(2000, 10, MANIOBRA_V)).toBe(1600);
	});

	it('devuelve el valor exacto, sin redondearlo', () => {
		// **No redondea, y es lo contrario de lo que hace el resto de las reglas.**
		// Se redondeaba dos veces —acá la agilidad y después los segundos— y eso
		// movía un segundo en veintiocho de cada veintiún mil combinaciones, para
		// los dos lados: un jugador llegaba antes y otro después de lo que la ficha
		// le prometía, sin que nadie pudiera explicar por qué. La cuenta redondea
		// **donde termina**, que es el segundo que se muestra y se cobra.
		expect(agility(25, 1)).toBe(2.5);
		expect(agility(35, 1)).toBe(3.5);
		expect(agility(100, 3)).toBe(30);
	});

	it('y tampoco tiene piso: una nave sin masa tiene agilidad cero', () => {
		// El piso de un segundo es de la alineación y de nadie más. Ponerle uno acá
		// sería redondear en el medio otra vez, con otro nombre.
		expect(agility(0, 10)).toBe(0);
		expect(alignSeconds(agility(0, 10))).toBe(MIN_ALIGN_SECONDS);
	});

	it('y el redondeo del medio movía el segundo que se cobra', () => {
		// **El caso testigo del arreglo.** Masa 123, inercia 2,2 y Maniobra al cinco
		// dan 216,48 de agilidad, que son dos segundos de alineación. Redondeando la
		// agilidad primero quedarían 216, que es **uno**: la mitad del reloj de un
		// viaje corto, en el número que el jugador mira. Por eso `agility` entrega
		// el exacto y `alignSeconds` es la única que redondea.
		const exacta = agility(123, 22, 25);

		expect(exacta).toBeCloseTo(216.48, 6);
		expect(alignSeconds(exacta)).toBe(2);
		expect(alignSeconds(roundHalfEven(exacta))).toBe(1);
	});

	it('se niega con masa negativa', () => {
		expect(() => agility(-1, 10)).toThrow(RangeError);
	});

	it('se niega con un casco sin inercia', () => {
		// Cero y negativo son la misma clase de dato imposible: no hay chasis que
		// tome vector sin que le cueste nada.
		expect(() => agility(100, 0)).toThrow(RangeError);
		expect(() => agility(100, -5)).toThrow(RangeError);
	});
});

describe('la alineación', () => {
	it('crece con la agilidad, sin curvas raras', () => {
		const tiempos = [100, 500, 1000, 2000, 4000].map(alignSeconds);
		expect(tiempos).toEqual([...tiempos].sort((a, b) => a - b));
	});

	it('es proporcional: el doble de agilidad es el doble de espera', () => {
		// No saber cuál es la constante de calibración no impide probar la forma de
		// la curva. Lo único que se le perdona es el segundo que se lleva el
		// redondeo.
		for (const agilidad of [400, 900, 1500, 2600]) {
			const simple = alignSeconds(agilidad);
			expect(Math.abs(alignSeconds(2 * agilidad) - 2 * simple)).toBeLessThanOrEqual(1);
		}
	});

	it('nunca es menor que un segundo', () => {
		expect(MIN_ALIGN_SECONDS).toBe(1);
		expect(alignSeconds(0)).toBe(MIN_ALIGN_SECONDS);
		expect(alignSeconds(1)).toBe(MIN_ALIGN_SECONDS);
	});

	it('y por eso la nave más liviana imaginable igual tarda en salir', () => {
		// **El piso está acá y en ningún otro lado.** La agilidad puede dar cero
		// —no tiene piso ni redondeo— y aun así ninguna nave se teletransporta: el
		// segundo mínimo lo pone esta cuenta, que es la última de la cadena.
		expect(alignSeconds(agility(0, 10))).toBe(MIN_ALIGN_SECONDS);
	});

	it('se niega con agilidad negativa', () => {
		expect(() => alignSeconds(-1)).toThrow(RangeError);
	});
});

describe('el tramo en warp', () => {
	it('es la distancia sobre la velocidad, con la velocidad en décimas', () => {
		// Un 50 son cinco unidades de distancia por segundo, y se lee igual que en
		// EVE: cien unidades a 5,0 son veinte segundos.
		expect(warpSeconds(100, 50)).toBe(20);
		expect(warpSeconds(300, 60)).toBe(50);
		expect(warpSeconds(300, 20)).toBe(150);
	});

	it('escala lineal con la distancia', () => {
		// **Es la única parte del viaje que escala**, y por eso se prueba derecho: el
		// doble de camino es el doble de crucero, sin curvas que explicarle a nadie.
		expect(warpSeconds(100, 50)).toBe(20);
		expect(warpSeconds(200, 50)).toBe(40);
		expect(warpSeconds(400, 50)).toBe(80);
	});

	it('puede dar cero cuando el trayecto es casi nada', () => {
		// De una luna a su planeta es todo alineación y nada de crucero, como en EVE.
		// El piso de un segundo del viaje lo pone la alineación, no esto.
		expect(warpSeconds(0, 50)).toBe(0);
		expect(warpSeconds(1, 60)).toBe(0);
	});

	it('redondea al par y no para arriba', () => {
		expect(warpSeconds(5, 20)).toBe(2);
		expect(warpSeconds(7, 20)).toBe(4);
	});

	it('se niega con una distancia negativa', () => {
		expect(() => warpSeconds(-1, 50)).toThrow(RangeError);
	});

	it('se niega con una nave sin motor de warp', () => {
		expect(() => warpSeconds(100, 0)).toThrow(RangeError);
		expect(() => warpSeconds(100, -1)).toThrow(RangeError);
	});
});

describe('salir y cruzar, que no son el mismo número', () => {
	/*
	 * **El examen del cambio entero.** Hasta acá el viaje era una división y una
	 * sola palanca; ahora son dos cuentas que no se hablan, y todo el diseño se
	 * apoya en que sigan sin hablarse. Lo que estos casos impiden es la
	 * simplificación que en algún momento va a parecer razonable: sacar la
	 * alineación de la velocidad de warp y quedarse con un número por casco.
	 */
	it('un casco que cruza rápido igual puede salir tarde', () => {
		// La Alabarda cruza a más de la mitad de la velocidad del Vencejo y aun así
		// tarda más del doble en salir, porque pesa. Si la alineación saliera de la
		// velocidad de warp, las dos comparaciones tendrían que dar lo mismo.
		const vencejo = getHull('vencejo');
		const alabarda = getHull('alabarda');

		expect(alabarda.warpSpeed).toBeGreaterThan(vencejo.warpSpeed / 2);
		expect(alineacionDe('alabarda')).toBeGreaterThan(2 * alineacionDe('vencejo'));
	});

	it('y uno que cruza despacio no tiene por qué salir mucho más tarde', () => {
		// La otra mitad de la frase del documento: la Percal cruza bastante más
		// despacio que la Alabarda **sin ser mucho más torpe**. Las dos columnas se
		// abren distinto, y en este par se abren al revés.
		const alabarda = getHull('alabarda');
		const percal = getHull('percal');

		expect(percal.warpSpeed).toBeLessThan(alabarda.warpSpeed * 0.8);
		expect(alineacionDe('percal')).toBeLessThan(alineacionDe('alabarda') * 1.5);
	});

	it('la columna de la alineación separa más que la del warp', () => {
		// Dos columnas que fueran la misma cuenta disfrazada se abrirían igual. Ésta
		// se abre más, y eso es lo que hace que elegir casco decida dos cosas en vez
		// de una.
		const abanico = (valores: readonly number[]) => Math.max(...valores) / Math.min(...valores);

		const porWarp = abanico(HULLS.map((hull) => hull.warpSpeed));
		const porAlineacion = abanico(HULLS.map((hull) => alineacionDe(hull.code)));
		expect(porAlineacion).toBeGreaterThan(porWarp);
	});

	it('dos naves con el mismo warp salen en momentos distintos', () => {
		// Lo mismo desde adentro: con la velocidad clavada, la masa sigue decidiendo
		// cuándo arranca cada una.
		const liviana = agility(250, 20);
		const pesada = agility(900, 20);
		expect(alignSeconds(pesada)).toBeGreaterThan(alignSeconds(liviana));
	});

	it('ninguna de las dos cuentas puede mirar a la otra', () => {
		// La firma es la que lo impide, y es la forma más barata de impedirlo: la
		// alineación no recibe la velocidad de warp y el crucero no recibe la masa.
		// Si alguien colapsara los dos números tendría que ensanchar una de estas dos
		// firmas, y la revisión de tipos se quejaría acá primero.
		// @ts-expect-error la alineación no acepta la velocidad de warp
		alignSeconds(500, 60);
		// @ts-expect-error el crucero no acepta la masa
		warpSeconds(100, 50, 250);

		expect(alignSeconds.length).toBe(1);
		expect(warpSeconds.length).toBe(2);
	});
});

describe('la calibración contra el catálogo', () => {
	it('divide la agilidad por cien para sacar segundos', () => {
		// **La única constante que se movió al cambiar de modelo**, y está escrita
		// con nombre y número en docs/systems/SHIPS.md. EVE divide por 500 sobre
		// toneladas; con ése la lanzadera alinearía en menos de un segundo y el
		// sumando fijo no se notaría contra un viaje de medio minuto, que es justo
		// lo que el modelo nuevo viene a que se note.
		expect(AGILITY_PER_ALIGN_SECOND).toBe(100);
	});

	it('le da a cada casco la velocidad de warp y la inercia del documento', () => {
		// Las dos columnas nuevas, una por una. Si alguien las mueve sin mover el
		// cuadro de SHIPS.md, se entera acá.
		for (const fila of CUADRO) {
			const hull = getHull(fila.code);
			expect(hull.warpSpeed, hull.name).toBe(fila.warp);
			expect(hull.inertia, hull.name).toBe(fila.inertia);
		}
	});

	it('y saca de ellas la agilidad y la alineación que el documento promete', () => {
		// Acá se cierra la cadena entera: masa y inercia del catálogo, agilidad y
		// alineación del cuadro. La Pioner sale en cuatro segundos y la Mula en
		// quince, que es lo que se aprobó.
		for (const fila of CUADRO) {
			const hull = getHull(fila.code);
			expect(agility(hull.mass, hull.inertia), hull.name).toBe(fila.agility);
			expect(alineacionDe(fila.code), hull.name).toBe(fila.align);
		}
	});

	it('no deja ningún casco saliendo de golpe', () => {
		// La invariante sobre todo el catálogo, para el casco que todavía no existe:
		// ninguno alinea en el piso, porque el piso es para lo imposible y no para
		// una nave de verdad.
		for (const hull of HULLS) {
			expect(alineacionDe(hull.code), hull.name).toBeGreaterThan(MIN_ALIGN_SECONDS);
		}
	});

	it('cubre el catálogo entero, sin cascos que el cuadro no mire', () => {
		// Un casco nuevo que no entre en el cuadro se saltearía los dos casos de
		// arriba sin que nadie lo note, que es la forma en la que una tabla de casos
		// deja de proteger.
		expect(CUADRO.map((fila) => fila.code).sort()).toEqual(HULLS.map((hull) => hull.code).sort());
		expect(CUADRO.some((fila) => fila.code === STARTING_HULL)).toBe(true);
	});
});

describe('la mejora que se nota y la que no', () => {
	/*
	 * **Lo único que el jugador ve es el segundo redondeado**, así que un nivel de
	 * Maniobra que no lo baja es una mejora que no llega. La pantalla no la ofrece
	 * —no se promete lo que no va a pasar— y de estos números sale esa decisión:
	 * deciden desde qué nivel aparece la palanca de viajar en cada casco, y si
	 * alguno se mueve, lo que la pantalla ofrece cambia solo.
	 *
	 * Maniobra suma 5 % por nivel, de docs/systems/SKILLS.md, y divide la agilidad.
	 */
	it('a la carguera le paga desde el primer nivel', () => {
		expect(alineacionCon('mula', 0)).toBe(15);
		expect(alineacionCon('mula', 5)).toBe(14);
	});

	it('a la minera recién desde el segundo', () => {
		expect(alineacionCon('percal', 0)).toBe(11);
		expect(alineacionCon('percal', 5)).toBe(11);
		expect(alineacionCon('percal', 10)).toBe(10);
	});

	it('a la lanzadera recién desde el tercero', () => {
		// Es el casco que vuela todo el mundo en su primera hora, así que es el que
		// decide si la palanca se ve o no en la pantalla que más se mira.
		expect(alineacionCon('pioner', 0)).toBe(4);
		expect(alineacionCon('pioner', 5)).toBe(4);
		expect(alineacionCon('pioner', 10)).toBe(4);
		expect(alineacionCon('pioner', 15)).toBe(3);
	});

	it('y a la exploradora no le paga nunca', () => {
		// Sale casi instantáneamente de fábrica: entrenar Maniobra para volarla es
		// gastar experiencia en un segundo que no existe. Eso es información, y por
		// eso la pantalla se calla en vez de ofrecerlo.
		for (const bono of [0, 5, 10, 15, 20, 25]) {
			expect(alineacionCon('vencejo', bono), `bono ${bono} %`).toBe(3);
		}
	});

	it('y la que se nota nunca sube el reloj', () => {
		// La invariante sobre todo el catálogo: más Maniobra no puede tardar más. Un
		// bono que empeorara la alineación sería el signo dado vuelta, que es el
		// error clásico de un número donde menos es mejor.
		for (const hull of HULLS) {
			let anterior = alineacionCon(hull.code, 0);
			for (const bono of [5, 10, 15, 20, 25]) {
				const ahora = alineacionCon(hull.code, bono);
				expect(ahora, `${hull.name} con ${bono} %`).toBeLessThanOrEqual(anterior);
				anterior = ahora;
			}
		}
	});
});

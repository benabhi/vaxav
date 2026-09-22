/**
 * Las descripciones de todos los cuerpos de un sistema, de una sola pasada.
 *
 * `describeBody` es pura y no sabe de base de datos: pide un contexto —qué
 * estrella calienta el cuerpo, qué tan lejos está del borde, cuánto mineral
 * tiene el cinturón—. Armar ese contexto cuerpo por cuerpo sería un N+1 por fila
 * del árbol, que es exactamente la trampa que `bodyDistance` ya tiene y que no
 * vale la pena repetir.
 *
 * Así que se arma **el sistema entero de una vez**: dos consultas entre todo, y
 * después un mapa que las dos pantallas —el árbol y Ubicación— consultan por
 * identificador. Es también el único lugar donde se decide el contexto, así que
 * el árbol y la ficha no pueden describir el mismo cuerpo de dos maneras.
 */

import { eq, inArray } from 'drizzle-orm';
import { beltDeposit, body, system, type Body } from '../db/schema';
import { atEdge, describeBody, type BodyContext } from '$lib/descriptions';
import type { Db } from '../db/types';

/**
 * Lo que se sabe de un cuerpo mirando el sistema entero.
 *
 * Van juntos porque salen del mismo cálculo: para saber si algo está en el borde
 * hay que conocer la órbita más lejana, que es la misma cuenta que le da su
 * posición a la descripción. Separarlo en dos funciones sería recorrer el
 * sistema dos veces para contestar la misma pregunta.
 */
export interface Lectura {
	/** Las frases que lo describen. Puede estar vacío: una estación no dice nada. */
	readonly sentences: readonly string[];
	/**
	 * Si está en el cuarto exterior de su sistema.
	 *
	 * De acá sale el aviso de riesgo, junto con la seguridad del sistema: un
	 * cinturón del borde está menos cuidado que la estación de al lado de la
	 * estrella, aunque el número de seguridad sea el mismo para los dos.
	 */
	readonly atEdge: boolean;
}

/** Ninguna lectura, para cuando el sistema no existe. */
const VACIO: ReadonlyMap<number, Lectura> = new Map();

export function systemDescriptions(db: Db, systemId: number): ReadonlyMap<number, Lectura> {
	const suSistema = db.select().from(system).where(eq(system.id, systemId)).get();
	if (!suSistema) return VACIO;

	const filas = db.select().from(body).where(eq(body.systemId, systemId)).all();
	if (filas.length === 0) return VACIO;

	const porId = new Map(filas.map((fila) => [fila.id, fila]));
	const alcances = starReaches(filas, porId);

	// La órbita más lejana define qué es «el borde».
	//
	// **Las puertas no cuentan.** Se plantan a mano donde haga falta para que la
	// línea salga por el rumbo que corresponde en el mapa de la galaxia, así que
	// están más lejos que todo lo demás por construcción: en Ánfora, a 759 contra
	// las 520 del cinturón más externo. Medir el borde contra ellas dejaría a todo
	// el sistema en «el interior», que es justo lo contrario de lo que se ve.
	let borde = 0;
	for (const fila of filas) {
		if (fila.kind === 'gate') continue;
		borde = Math.max(borde, alcances.get(fila.id)?.distance ?? 0);
	}

	const capacidad = beltCapacities(db, filas);

	const salida = new Map<number, Lectura>();
	for (const fila of filas) {
		// El clima lo da **su** estrella: la raíz de su rama. En un sistema de un
		// solo sol es el de siempre, y en un binario es el que lo calienta a él y no
		// el que le tocó primero a la consulta.
		const alcance = alcances.get(fila.id);
		const suEstrella = alcance ? porId.get(alcance.starId) : undefined;
		const context: BodyContext = {
			starClass: suEstrella?.starClass ?? '',
			starDistance: alcance?.distance ?? 0,
			edgeDistance: borde,
			beltCapacity: capacidad.get(fila.id) ?? 0
		};
		salida.set(fila.id, { sentences: describeBody(fila, context), atEdge: atEdge(context) });
	}
	return salida;
}

/** De qué estrella cuelga un cuerpo, y cuánto hay hasta ella. */
interface StarReach {
	/** La raíz de su rama. En un binario, el sol que lo calienta a él. */
	readonly starId: number;
	/** Unidades hasta esa raíz, sumando el árbol. Cero en la raíz misma. */
	readonly distance: number;
}

/**
 * A qué distancia está cada cuerpo **de su estrella**, y de cuál.
 *
 * Una luna está a seis unidades de su planeta y a doscientas de la estrella, y la
 * que manda en el clima es la segunda. Se acumula hacia arriba y se recuerda: un
 * planeta con ocho lunas se calcula una vez.
 *
 * Vuelve también con **cuál** es esa estrella, que en un sistema de un solo sol
 * es la obvia y en un binario no: cada rama la calienta la suya, y preguntarle al
 * sistema «cuál es la estrella» devuelve una de las dos al azar. La raíz no se
 * suma a sí misma: su `orbitDistance` mide la separación del baricentro del
 * sistema, que no es distancia a ninguna estrella.
 */
function starReaches(
	filas: readonly Body[],
	porId: ReadonlyMap<number, Body>
): Map<number, StarReach> {
	const hecho = new Map<number, StarReach>();

	function subir(fila: Body): StarReach {
		const guardado = hecho.get(fila.id);
		if (guardado !== undefined) return guardado;
		// Se marca antes de subir: un ciclo en los padres sería un dato corrupto,
		// pero colgar la pantalla por eso sería peor.
		hecho.set(fila.id, { starId: fila.id, distance: 0 });

		const padre = fila.parentId === null ? undefined : porId.get(fila.parentId);
		const arriba = padre ? subir(padre) : null;
		const alcance: StarReach = arriba
			? { starId: arriba.starId, distance: fila.orbitDistance + arriba.distance }
			: { starId: fila.id, distance: 0 };

		hecho.set(fila.id, alcance);
		return alcance;
	}

	for (const fila of filas) subir(fila);
	return hecho;
}

/**
 * Cuántas unidades aguanta cada cinturón del sistema, sumando sus depósitos.
 *
 * Es lo único que la descripción necesita de un cinturón: **qué tan poblado está
 * el campo**, que es una propiedad física del lugar. Qué mineral tiene y cuánto
 * paga no es descripción —es información de mercado— y además la contesta el
 * escáner roca por roca, que es como corresponde que se averigüe.
 */
function beltCapacities(db: Db, filas: readonly Body[]): Map<number, number> {
	const capacidad = new Map<number, number>();

	const cinturones = filas.filter((fila) => fila.kind === 'belt').map((fila) => fila.id);
	if (cinturones.length === 0) return capacidad;

	for (const deposito of db
		.select()
		.from(beltDeposit)
		.where(inArray(beltDeposit.bodyId, cinturones))
		.all()) {
		capacidad.set(deposito.bodyId, (capacidad.get(deposito.bodyId) ?? 0) + deposito.capacity);
	}

	return capacidad;
}

/**
 * De dónde sale un verbo: qué aparato lo habilita y qué llaves lo mejoran.
 *
 * **El juego no puede explicar la cadena sólo cuando se rompe.** Escanear pide un
 * escáner montado y extraer pide un láser, y las dos cosas son invisibles
 * mientras el piloto las tenga: se entera de que hacían falta el día que no las
 * tiene. Eso es al revés de lo que sirve —el que ya las tiene es justo el que está
 * decidiendo qué comprar o entrenar después— y es lo que
 * [«la cadena se muestra»](../../docs/DESIGN.md) manda arreglar.
 *
 * Acá vive la parte pura: dado un casco, un equipamiento y unas habilidades,
 * **quién habilita qué**. El texto lo arma la vista; esto sólo contesta la
 * pregunta.
 *
 * Y la fuente son dos y no una: **el casco también habilita**. Los propulsores,
 * el motor de salto y el tanque dejaron de ser módulos y pasaron a ser atributos
 * del casco, así que preguntar sólo por las ranuras contesta que falta algo que
 * ninguna nave puede tener.
 *
 * La distinción que ordena todo el archivo son dos relaciones que no se parecen:
 *
 * - **La llave** habilita. Sin el escáner no existe el verbo «escanear».
 * - **La palanca** mejora. Con más Escaneo la lectura es mejor, pero sin Escaneo
 *   igual se escanea.
 *
 * Mostrarlas iguales fue lo que confundió desde el principio: una es un requisito
 * y la otra una recompensa.
 */

import { SKILL_BONUSES, type SkillLevels } from './fitting';
import type { BonusTarget, Hull } from './hulls';
import type { ShipModule } from './modules';
import { getSkill } from './skills';

/**
 * El campo del módulo que habilita un verbo.
 *
 * Es un subconjunto de lo que un módulo aporta, no todos: sólo los que hacen la
 * diferencia entre poder y no poder. Que sea una unión de nombres de campo y no
 * una tabla aparte evita el desfase clásico —agregar una capacidad y olvidarse de
 * registrarla—: si el campo no existe en `ShipModule`, esto no compila.
 */
export type Grant =
	| 'sensorRange'
	| 'miningYield'
	| 'jumpPower'
	/** El que habilita viajar: lo trae el casco y lo estiran los optimizadores. */
	| 'warpSpeed'
	/**
	 * El empuje, que **ya no habilita ningún verbo**: viajar pasó a mirar el warp
	 * cuando la duración se volvió alineación más warp. Queda en la unión porque
	 * es el que va a pedir maniobrar en combate, y porque sacarlo y volver a
	 * ponerlo es la misma línea dos veces.
	 */
	| 'thrust'
	| 'fuel'
	| 'cargo';

/**
 * Cuánto de lo que un verbo pide lo trae el casco **de fábrica**.
 *
 * Es la otra mitad de la pregunta «de dónde sale esto», y faltaba: desde que los
 * internos esenciales son atributos del casco, una nave de astillero tiene
 * propulsores, motor de salto y tanque sin llevar un solo módulo puesto.
 * Resolviendo la cadena sólo contra las ranuras, esa nave leía «Falta:
 * Propulsores» mientras se movía perfectamente.
 *
 * **Extraer es el único verbo cuyo aparato no trae ningún casco**: no hay nave
 * que venga con el láser puesto, y por eso `miningYield` contesta cero acá. El
 * resto —sensores, bodega, empuje, warp, salto y tanque— son columnas del casco,
 * así que la cuenta es leer la que corresponda.
 */
export function hullGrant(hull: Hull, grant: Grant): number {
	return grant === 'miningYield' ? 0 : hull[grant];
}

/**
 * Algo que un verbo necesita montado para existir.
 *
 * **Es una lista y no un módulo suelto** porque los verbos pisan más de una
 * pieza: extraer necesita el láser que pica la roca y la bodega donde cae lo que
 * sale —sin lugar libre no saca nada—, y mañana refinar va a sumarle la refinería
 * a esa misma bodega. Empezar con uno solo obligaría a reescribir el tipo, las
 * vistas y la pantalla el día que aparezca el segundo, que es siempre antes de lo
 * que parece.
 *
 * El rótulo va acá y no se saca del módulo encontrado por un motivo simple:
 * **cuando falta, no hay módulo del que sacarlo**, y «necesitás algo» es un aviso
 * que no dice nada. Vale lo mismo cuando lo que lo cumple es el casco: el aviso
 * dice «Propulsores» y al lado de qué salen, y el nombre de la pieza tiene que
 * existir antes de saber quién la pone.
 */
export interface Need {
	readonly grant: Grant;
	/** Cómo se llama lo que hace falta: «Motor de salto», «Tanque». */
	readonly label: string;
}

/** Lo que un verbo pide, resuelto contra lo que la nave lleva puesto. */
export interface Fitted {
	readonly need: Need;
	/** El módulo montado que lo cumple, o `null` si falta. */
	readonly module: ShipModule | null;
}

/**
 * El módulo montado que habilita algo, o `null` si ninguno lo hace.
 *
 * Devuelve **el que más aporta** cuando hay varios: con dos láseres, el que
 * decide qué se puede hacer es el mejor, y nombrar el peor sería mentir por
 * orden de ranura.
 */
export function grantingModule(fit: readonly ShipModule[], grant: Grant): ShipModule | null {
	let mejor: ShipModule | null = null;
	for (const module of fit) {
		if (module[grant] <= 0) continue;
		if (mejor === null || module[grant] > mejor[grant]) mejor = module;
	}
	return mejor;
}

/**
 * Resuelve todo lo que un verbo pide contra el equipamiento de la nave.
 *
 * Devuelve **la lista entera, cumplida o no**. Filtrar lo que falta sería quedarse
 * con la mitad inútil: lo que falta es lo que hay que comprar, y es el único
 * motivo por el que alguien abre este aviso cuando el botón está apagado.
 */
export function grantingModules(
	fit: readonly ShipModule[],
	needs: readonly Need[]
): readonly Fitted[] {
	return needs.map((need) => ({ need, module: grantingModule(fit, need.grant) }));
}

/** Una habilidad que mueve un número, con el nivel que el piloto tiene hoy. */
export interface Lever {
	readonly skill: string;
	readonly name: string;
	readonly level: number;
	/** Cuánto suma por nivel, en porcentaje entero. */
	readonly percentPerLevel: number;
}

/**
 * Las habilidades que mueven una magnitud, con el nivel que el piloto tiene.
 *
 * Sale de la misma tabla que usa la calculadora —`SKILL_BONUSES` y el bono de rol
 * del casco—, no de una lista escrita a mano al lado. Si mañana Estiba empieza a
 * mejorar la bodega, esta línea lo dice sola: una lista paralela sería una que se
 * desfasa el día que nadie mira.
 *
 * Las que el piloto no tiene salen igual, con nivel 0. Son la lista de compras, y
 * esconderlas deja al jugador sin saber qué entrenar.
 */
export function leversFor(target: BonusTarget, hull: Hull, skills: SkillLevels): Lever[] {
	const palancas: Lever[] = [];

	const fija = SKILL_BONUSES[target];
	if (fija) {
		palancas.push({
			skill: fija.skill,
			name: getSkill(fija.skill).name,
			level: skills[fija.skill] ?? 0,
			percentPerLevel: fija.percentPerLevel
		});
	}

	// El bono de rol del casco mueve lo mismo con otra habilidad, y es de las cosas
	// que hacen que elegir casco importe: si no se nombra, parece que la nave
	// rinde distinto porque sí. **Un casco puede no tener ninguno** —la lanzadera
	// inicial—, y entonces la única palanca es la de la tabla.
	const rol = hull.bonus;
	if (rol && rol.target === target && !palancas.some((p) => p.skill === rol.skill)) {
		palancas.push({
			skill: rol.skill,
			name: getSkill(rol.skill).name,
			level: skills[rol.skill] ?? 0,
			percentPerLevel: rol.percentPerLevel
		});
	}

	return palancas;
}

/**
 * Una palanca suelta, para las que no son un porcentaje.
 *
 * Prospección no mejora ningún número: cambia **qué se ve** en una lectura. Es una
 * llave de resultado y no de acceso, así que no está en `SKILL_BONUSES` ni podría
 * estarlo, pero para el jugador es exactamente lo mismo —una habilidad que hace
 * que la acción rinda más— y tiene que aparecer al lado de las otras.
 */
export function leverOf(skill: string, skills: SkillLevels): Lever {
	return {
		skill,
		name: getSkill(skill).name,
		level: skills[skill] ?? 0,
		percentPerLevel: 0
	};
}

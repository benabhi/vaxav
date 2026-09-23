/**
 * De dónde sale cada verbo.
 *
 * Lo que estos tests cuidan no es una cuenta: es que la pantalla y el servicio
 * digan **lo mismo**. El botón apagado y el rechazo del servidor salen de acá, y
 * el día que se separen el jugador va a apretar algo que rebota sin motivo.
 */

import { describe, expect, it } from 'vitest';
import { grantingModule, grantingModules, hullGrant, leverOf, leversFor } from './sourcing';
import { SKILL_BONUSES } from './fitting';
import { HULLS, STARTING_HULL, getHull, type Hull } from './hulls';
import { EMPTY, MODULES } from './modules';

describe('el módulo que habilita un verbo', () => {
	it('encuentra el que aporta la magnitud', () => {
		const laser = MODULES.find((module) => module.miningYield > 0)!;
		// La ranura vacía va en la lista a propósito: es lo que la nave real trae.
		const encontrado = grantingModule([EMPTY, laser], 'miningYield');

		expect(encontrado?.code).toBe(laser.code);
	});

	it('devuelve null si no hay ninguno montado', () => {
		// Es la diferencia entre «podés» y «no podés», y tiene que ser explícita:
		// un cero disfrazado de módulo dejaría minar sin láser.
		const sinLaser = MODULES.filter((module) => module.miningYield === 0).slice(0, 4);

		expect(grantingModule(sinLaser, 'miningYield')).toBeNull();
	});

	it('con dos, nombra el que más aporta', () => {
		const laseres = MODULES.filter((module) => module.miningYield > 0);
		if (laseres.length < 2) return;

		const [flojo, fuerte] = [...laseres].sort((a, b) => a.miningYield - b.miningYield);
		// En orden de ranura el flojo va primero: nombrarlo sería decidir por
		// posición en vez de por lo que la nave realmente puede hacer.
		const encontrado = grantingModule([flojo, fuerte], 'miningYield');

		expect(encontrado?.code).toBe(fuerte.code);
	});
});

/*
 * La otra mitad de «de dónde sale esto»: **lo que el casco trae de fábrica**.
 *
 * Es la que faltaba y la que produjo el aviso absurdo: resolviendo la cadena sólo
 * contra las ranuras, una nave de astillero leía «Falta: Propulsores» mientras se
 * movía perfectamente. Lo que estos tests cuidan es que cada columna del casco
 * conteste por su verbo y que **extraer siga siendo la excepción**.
 */
describe('lo que el casco aporta sin llevar nada montado', () => {
	it('contesta con su propia columna, una por verbo', () => {
		// Se prueba sobre la lanzadera inicial porque sus cinco columnas valen cinco
		// números distintos: una tabla cruzada —el tanque contestando la bodega—
		// pasaría inadvertida con un casco de números repetidos.
		const pioner = getHull(STARTING_HULL);

		expect(hullGrant(pioner, 'cargo')).toBe(pioner.cargo);
		expect(hullGrant(pioner, 'thrust')).toBe(pioner.thrust);
		expect(hullGrant(pioner, 'jumpPower')).toBe(pioner.jumpPower);
		expect(hullGrant(pioner, 'fuel')).toBe(pioner.fuel);
		expect(hullGrant(pioner, 'sensorRange')).toBe(pioner.sensorRange);

		// El warp es la columna que estrenó viajar cuando la duración pasó a ser
		// alineación más crucero. En la Pioner vale lo mismo que los sensores, así
		// que la cruzada de esta columna la descarta un casco donde no coincidan.
		expect(hullGrant(pioner, 'warpSpeed')).toBe(pioner.warpSpeed);
		const vencejo = getHull('vencejo');
		expect(hullGrant(vencejo, 'warpSpeed')).toBe(vencejo.warpSpeed);
	});

	/*
	 * **Ningún casco viene con el láser puesto**, y por eso extraer es el único
	 * verbo cuyo aparato hay que comprar. Si esto contestara el número del casco,
	 * la pantalla diría que se puede minar con una nave pelada.
	 */
	it('no aporta extracción en ningún casco del catálogo', () => {
		expect(HULLS.map((hull) => hullGrant(hull, 'miningYield'))).toEqual(HULLS.map(() => 0));
	});

	/*
	 * Y al revés: **el resto de los esenciales los trae todo casco**. Es lo que
	 * hace que una nave recién salida del astillero se mueva, salte, cargue y vea
	 * sin que el piloto monte una sola pieza.
	 */
	it('todo casco trae warp, propulsores, motor, tanque, bodega y sensores', () => {
		// **El warp es el que habilita viajar**, así que un cero acá no sería sólo un
		// número faltante: la pantalla leería «Falta: Motor de warp» y —lo caro— le
		// escondería al piloto los dos tiempos, porque los efectos sólo se prometen
		// con todo puesto.
		for (const hull of HULLS) {
			for (const grant of [
				'warpSpeed',
				'thrust',
				'jumpPower',
				'fuel',
				'cargo',
				'sensorRange'
			] as const) {
				expect(hullGrant(hull, grant)).toBeGreaterThan(0);
			}
		}
	});
});

describe('lo que un verbo pide, que puede ser más de una pieza', () => {
	it('devuelve la lista entera, cumplida o no', () => {
		const laser = MODULES.find((module) => module.miningYield > 0)!;
		const puestos = grantingModules(
			[laser],
			[
				{ grant: 'miningYield', label: 'Láser de extracción' },
				{ grant: 'fuel', label: 'Tanque' }
			]
		);

		// **La que falta sale igual.** Filtrarla dejaría el aviso contando lo que
		// tenés justo cuando lo que se busca es lo que te falta.
		expect(puestos).toHaveLength(2);
		expect(puestos[0].module?.code).toBe(laser.code);
		expect(puestos[1].module).toBeNull();
		expect(puestos[1].need.label).toBe('Tanque');
	});

	it('el rótulo sobrevive a que la pieza falte', () => {
		// Es el motivo por el que el rótulo viaja en la necesidad y no se saca del
		// módulo encontrado: cuando falta no hay módulo del que sacarlo, y
		// «necesitás algo» es un aviso que no dice nada.
		const [uno] = grantingModules([], [{ grant: 'jumpPower', label: 'Motor de salto' }]);

		expect(uno.module).toBeNull();
		expect(uno.need.label).toBe('Motor de salto');
	});
});

describe('las habilidades que mueven una magnitud', () => {
	it('salen de la misma tabla que usa la calculadora', () => {
		const palancas = leversFor('mining_yield', getHull(STARTING_HULL), { mining: 3 });
		const fija = palancas.find((lever) => lever.skill === SKILL_BONUSES.mining_yield.skill)!;

		expect(fija.level).toBe(3);
		expect(fija.percentPerLevel).toBe(SKILL_BONUSES.mining_yield.percentPerLevel);
	});

	it('las que el piloto no tiene salen igual, en cero', () => {
		// Son la lista de compras: esconderlas deja al jugador sin saber qué
		// entrenar, que es justamente lo que esta línea existe para decir.
		const palancas = leversFor('mining_yield', getHull(STARTING_HULL), {});

		expect(palancas).not.toHaveLength(0);
		expect(palancas.every((lever) => lever.level === 0)).toBe(true);
	});

	it('suma el bono de rol del casco, que es otra habilidad sobre lo mismo', () => {
		// Si no se nombra, la nave parece rendir distinto porque sí, y elegir casco
		// deja de significar algo.
		// **El casco se arma acá y no se elige del catálogo.** Desde que la Pioner se
		// quedó sin bono de rol, ninguno de los cinco tiene uno que apunte a una
		// habilidad distinta de la de la tabla, así que este camino se quedó sin caso
		// real. Se arma uno para que la cuenta siga probada hasta que entre el casco
		// que la use de verdad.
		const conRol: Hull = {
			...getHull('mula'),
			bonus: { target: 'cargo', skill: 'shuttle_handling', percentPerLevel: 3 }
		};

		const codigos = leversFor('cargo', conRol, {}).map((lever) => lever.skill);

		expect(codigos).toContain('shuttle_handling');
		expect(codigos).toContain(SKILL_BONUSES.cargo.skill);
	});

	it('y no inventa ninguna cuando el casco no tiene bono de rol', () => {
		// La lanzadera inicial no tiene: el casco que el astillero le entrega a
		// cualquiera no empuja al piloto hacia una especialidad. La lista tiene que
		// salir igual —con la habilidad de la tabla y nada más— y no romperse
		// leyendo un bono que no está.
		const pioner = getHull(STARTING_HULL);
		expect(pioner.bonus).toBeNull();

		const palancas = leversFor('agility', pioner, { maneuvering: 2 });

		expect(palancas.map((lever) => lever.skill)).toEqual([SKILL_BONUSES.agility.skill]);
		expect(palancas[0].level).toBe(2);
	});

	it('no repite la habilidad cuando el casco mejora lo mismo que la tabla', () => {
		const repetida = HULLS.find(
			(hull) => hull.bonus && SKILL_BONUSES[hull.bonus.target]?.skill === hull.bonus.skill
		);
		// La Mula es el caso: su bono de rol es la bodega, y la tabla la mueve con la
		// misma habilidad. Si un día ninguno lo hiciera, esto lo avisa en vez de
		// dejar el caso pasando de largo sin probar nada.
		expect(repetida?.bonus, 'ningún casco mejora lo mismo que la tabla').toBeDefined();
		if (!repetida?.bonus) return;

		const palancas = leversFor(repetida.bonus.target, repetida, {});
		const codigos = palancas.map((lever) => lever.skill);

		expect(new Set(codigos).size).toBe(codigos.length);
	});
});

describe('una palanca suelta', () => {
	it('sirve para las que no son un porcentaje', () => {
		// Prospección no mejora ningún número: cambia qué se ve. Para el jugador es
		// lo mismo —una habilidad que hace rendir más— y va al lado de las otras.
		const palanca = leverOf('prospecting', { prospecting: 2 });

		expect(palanca.level).toBe(2);
		expect(palanca.percentPerLevel).toBe(0);
		expect(palanca.name).not.toBe('');
	});
});

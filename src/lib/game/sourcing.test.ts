/**
 * De dónde sale cada verbo.
 *
 * Lo que estos tests cuidan no es una cuenta: es que la pantalla y el servicio
 * digan **lo mismo**. El botón apagado y el rechazo del servidor salen de acá, y
 * el día que se separen el jugador va a apretar algo que rebota sin motivo.
 */

import { describe, expect, it } from 'vitest';
import { grantingModule, grantingModules, leverOf, leversFor } from './sourcing';
import { SKILL_BONUSES } from './fitting';
import { HULLS, STARTING_HULL, getHull } from './hulls';
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
		const conRol = HULLS.find(
			(hull) => SKILL_BONUSES[hull.bonus.target]?.skill !== hull.bonus.skill
		);
		if (!conRol) return;

		const palancas = leversFor(conRol.bonus.target, conRol, {});

		expect(palancas.map((lever) => lever.skill)).toContain(conRol.bonus.skill);
	});

	it('no repite la habilidad cuando el casco mejora lo mismo que la tabla', () => {
		const repetida = HULLS.find(
			(hull) => SKILL_BONUSES[hull.bonus.target]?.skill === hull.bonus.skill
		);
		if (!repetida) return;

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

/**
 * La calculadora de equipamiento y el catálogo de cascos y módulos.
 *
 * Éstas son las cuentas que usan tanto la pantalla como el motor de acciones,
 * así que un error acá no se ve como un número raro: se ve como un jugador que
 * mina menos de lo que la ficha le prometió.
 */

import { describe, expect, it } from 'vitest';
import {
	MAX_SKILL_LEVEL,
	SKILL_BONUSES,
	bonusPercent,
	buildReadout,
	budget,
	defaultFit,
	fitFromCodes,
	maxedSkills
} from './fitting';
import { HULLS, SLOT_KINDS, STARTING_HULL, getHull, type Hull } from './hulls';
import { EMPTY, MODULES, TIERS, getModule, modulesForSlot, type ShipModule } from './modules';
import { SKILLS, getSkill } from './skills';
import { PLAYABLE_PROFESSIONS, startingLevels } from './professions';
import { TRAINABLE_FAMILIES } from './actions';

const inicial = getHull(STARTING_HULL);

describe('el catálogo de cascos', () => {
	it('tiene códigos únicos', () => {
		const codigos = HULLS.map((hull) => hull.code);
		expect(new Set(codigos).size).toBe(codigos.length);
	});

	it('incluye el casco inicial', () => {
		// Sin él, un piloto nuevo se queda sin nave.
		expect(getHull(STARTING_HULL)).toBeDefined();
	});

	it('tiene la ficha completa en todo casco', () => {
		for (const hull of HULLS) {
			expect(hull.name.trim()).not.toBe('');
			expect(hull.role.trim()).not.toBe('');
			expect(hull.description.trim()).not.toBe('');
			expect(hull.mass).toBeGreaterThan(0);
			expect(hull.structure).toBeGreaterThan(0);
			expect(hull.computing).toBeGreaterThan(0);
			expect(hull.fuel).toBeGreaterThan(0);
			expect(hull.sensorRange).toBeGreaterThan(0);
			expect(hull.signature).toBeGreaterThan(0);
		}
	});

	it('le da a todo casco las cuatro bandejas y algo en cada una', () => {
		// La terna es la personalidad del casco: si una bandeja queda en cero, el
		// casco no puede hacer algo entero —sin anclajes no trabaja, sin bastidor
		// no aguanta— y eso tiene que ser una decisión escrita, no un descuido.
		for (const hull of HULLS) {
			for (const kind of SLOT_KINDS) {
				const cuantas = hull.slots.filter((slot) => slot.kind === kind).length;
				expect(cuantas, `${hull.name}: ${kind}`).toBeGreaterThan(0);
			}
		}
	});

	it('le da a todo casco los presupuestos que antes traían los internos', () => {
		// Son atributos del casco y no módulos: una nave *tiene* planta de energía.
		// Un cero acá sería una nave que no se mueve o que no alimenta nada.
		for (const hull of HULLS) {
			expect(hull.power, hull.name).toBeGreaterThan(0);
			expect(hull.thrust, hull.name).toBeGreaterThan(0);
			expect(hull.jumpPower, hull.name).toBeGreaterThan(0);
			expect(hull.capacitor, hull.name).toBeGreaterThan(0);
			expect(hull.capacitorRecharge, hull.name).toBeGreaterThan(0);
			expect(hull.calibration, hull.name).toBeGreaterThan(0);
		}
	});

	it('le da a todo casco con qué cruzar y con qué salir', () => {
		// Las dos columnas que son suyas y de nadie más. Un cero en cualquiera de
		// las dos es una nave que no viaja: sin velocidad de warp la cuenta del
		// crucero se niega a dividir, y sin inercia no hay agilidad de la que sacar
		// la alineación. Hoy son cinco cascos; el día que entre el sexto y a alguien
		// se le olvide una de las dos, esto lo atrapa antes que el jugador.
		for (const hull of HULLS) {
			expect(hull.warpSpeed, hull.name).toBeGreaterThan(0);
			expect(hull.inertia, hull.name).toBeGreaterThan(0);
		}
	});

	it('da a toda ranura una clase válida', () => {
		for (const hull of HULLS) {
			for (const slot of hull.slots) {
				expect(slot.size, hull.name).toBeGreaterThanOrEqual(1);
				expect(slot.size, hull.name).toBeLessThanOrEqual(8);
			}
		}
	});

	it('apunta a habilidades que existen', () => {
		// Un bono o un requisito sobre una habilidad inventada no haría nada.
		for (const hull of HULLS) {
			expect(Object.hasOwn(SKILLS, hull.bonus.skill), hull.name).toBe(true);
			for (const requisito of hull.requirements) {
				expect(Object.hasOwn(SKILLS, requisito.skill), hull.name).toBe(true);
			}
		}
	});

	it('el casco de partida no pide nada', () => {
		// Es el que el astillero le entrega a cualquiera que se dé de alta: pedirle
		// una habilidad sería empezar la partida con una nave que no despega.
		expect(getHull(STARTING_HULL).requirements).toEqual([]);
	});

	it('el que pide una rama sin fuente todavía no se puede conseguir', () => {
		// La salvaguarda que no es negociable: **nada que el piloto pueda tener se
		// gatea con una habilidad que no puede entrenar**. La experiencia se
		// deposita por rama, y pedir una de Ingeniería o de Combate sería cerrar la
		// puerta con la llave adentro.
		//
		// La Mula pide Ingeniería de bodega y la Alabarda Puntería, y las dos
		// cumplen la regla por una razón temporal: no hay astillero, así que el único
		// casco que alguien puede tener es el de partida. Este test es el
		// recordatorio: el día que se puedan comprar, o su rama tiene fuente o el
		// requisito cambia.
		for (const hull of HULLS) {
			const entrenable = hull.requirements.every((requisito) =>
				TRAINABLE_FAMILIES.includes(getSkill(requisito.skill).family)
			);
			if (!entrenable) {
				expect(hull.code, `${hull.name} pide algo que nadie puede entrenar`).not.toBe(
					STARTING_HULL
				);
			}
		}
	});

	it('ningún módulo pide una habilidad que no se pueda entrenar', () => {
		// Los módulos sí se consiguen hoy: el mercado los vende todos. Acá la regla
		// no tiene excusa temporal que valga.
		for (const module of MODULES) {
			for (const requisito of module.requirements) {
				expect(TRAINABLE_FAMILIES, `${module.name} pide ${requisito.skill}`).toContain(
					getSkill(requisito.skill).family
				);
			}
		}
	});

	it('hace a cada casco bueno en algo distinto', () => {
		// Dos cascos con el mismo bono serían el mismo casco con otro nombre.
		const objetivos = HULLS.map((hull) => hull.bonus.target);
		expect(new Set(objetivos).size).toBe(objetivos.length);
	});

	it('falla claro si el casco no existe', () => {
		expect(() => getHull('inventado')).toThrow();
	});

	it('le da a la lanzadera inicial la terna más chica de todas', () => {
		// Es el casco que no se especializa: si tuviera tantas ranuras como otro,
		// no habría razón para cambiarla.
		const suyas = inicial.slots.length;
		for (const hull of HULLS) {
			if (hull.code === inicial.code) continue;
			expect(hull.slots.length, hull.name).toBeGreaterThan(suyas);
		}
	});
});

describe('el catálogo de módulos', () => {
	it('tiene códigos únicos', () => {
		const codigos = MODULES.map((module) => module.code);
		expect(new Set(codigos).size).toBe(codigos.length);
	});

	it('le da a todo módulo nombre, clase y calificación', () => {
		for (const module of MODULES) {
			expect(module.name.trim(), module.code).not.toBe('');
			expect(module.size, module.code).toBeGreaterThanOrEqual(1);
			expect(module.size, module.code).toBeLessThanOrEqual(8);
			expect(TIERS, module.code).toContain(module.tier);
			expect(module.description.trim(), module.code).not.toBe('');
		}
	});

	it('pone cada módulo en una bandeja que existe', () => {
		for (const module of MODULES) {
			expect(SLOT_KINDS, module.code).toContain(module.kind);
		}
	});

	it('le da ciclo y costo a todo módulo activo', () => {
		// Un módulo que produce sin gastar acumulador rompería el presupuesto.
		for (const module of MODULES) {
			const produce = module.miningYield || module.kinetic || module.ionic || module.thermal;
			if (produce) {
				expect(module.cycleSeconds, module.code).toBeGreaterThan(0);
				expect(module.activationCost, module.code).toBeGreaterThan(0);
			}
		}
	});

	it('tiene algo que montarle a toda ranura de todo casco', () => {
		// Una ranura sin opciones sería un hueco muerto en la pantalla. Los
		// refuerzos son la excepción de hoy: la bandeja existe y el catálogo
		// todavía no.
		for (const hull of HULLS) {
			for (const slot of hull.slots) {
				if (slot.kind === 'rig') continue;
				expect(
					modulesForSlot(slot.kind, slot.size).length,
					`${hull.name}: ${slot.kind} clase ${slot.size}`
				).toBeGreaterThan(0);
			}
		}
	});

	it('no deja entrar un módulo más grande que la ranura', () => {
		// En una de clase 1 entra un módulo de clase 1, nunca uno de clase 2.
		const opciones = modulesForSlot('high', 1);
		expect(opciones.length).toBeGreaterThan(0);
		expect(opciones.every((module) => module.size <= 1)).toBe(true);
	});

	it('deja los módulos chicos en una ranura grande', () => {
		const chicas = modulesForSlot('high', 1).map((m) => m.code);
		const grandes = new Set(modulesForSlot('high', 2).map((m) => m.code));
		expect(chicas.every((code) => grandes.has(code))).toBe(true);
	});

	it('no declara un módulo imposible de alimentar', () => {
		// Un módulo que ninguna planta puede sostener es contenido muerto.
		const maxima = Math.max(...MODULES.map((module) => module.powerOutput));
		for (const module of MODULES) {
			expect(module.powerDraw, module.code).toBeLessThanOrEqual(maxima);
		}
	});

	it('sube la escalera del escalón entre los dos optimizadores de warp', () => {
		// **Lo que los separa es el escalón, y tiene que separarlos en todo.** El II
		// rinde más y aprieta más en las cuatro cosas que un equipamiento reparte
		// —ranura, presupuesto, bodega y habilidad—, que es la regla de
		// docs/systems/SHIPS.md §«El escalón: I y II». Si una sola de las cuatro se
		// invirtiera, uno de los dos sería estrictamente peor y elegir dejaría de
		// decidir algo.
		const chico = getModule('warp_optimizer_i2');
		const grande = getModule('warp_optimizer_ii3');

		expect(chico.warpSpeed).toBe(3);
		expect(grande.warpSpeed).toBe(5);

		expect(grande.size).toBeGreaterThan(chico.size);
		expect(grande.powerDraw).toBeGreaterThan(chico.powerDraw);
		expect(grande.computingDraw).toBeGreaterThan(chico.computingDraw);
		expect(-grande.cargo).toBeGreaterThan(-chico.cargo);

		const navegacion = (module: ShipModule) =>
			module.requirements.find((requisito) => requisito.skill === 'navigation')?.level ?? 0;
		expect(navegacion(grande)).toBeGreaterThan(navegacion(chico));
	});

	it('y le cobra en una divisa que algún verbo lea', () => {
		// **Cobrar en firma es no cobrar.** La firma, el blindaje, el escudo y el
		// daño no los mira ningún verbo todavía —están marcados como «Combate»—, así
		// que un optimizador que pagara ahí saldría gratis en la práctica. La bodega
		// sí se lee: la llena el mineral y la vacía la venta.
		const conWarp = MODULES.filter((module) => module.warpSpeed > 0);
		expect(conWarp.length).toBeGreaterThan(0);

		for (const module of conWarp) {
			expect(module.cargo, module.code).toBeLessThan(0);
		}
	});

	it('y presupuesto, que es lo que limita cuántos entran', () => {
		// **El cierre del agujero que encontró la auditoría.** La ranura sola no
		// alcanzaba: las bajas sobran justo en los cascos grandes, así que una nave
		// podía llevar cinco y comprarse el warp de una clase que no es la suya. Lo
		// que lo limita es el presupuesto —cómputo y potencia—, que es como lo
		// resuelve EVE. Un optimizador que no gastara ninguno de los dos volvería a
		// abrirlo.
		for (const module of MODULES.filter((uno) => uno.warpSpeed > 0)) {
			expect(module.computingDraw, module.code).toBeGreaterThan(0);
			expect(module.powerDraw, module.code).toBeGreaterThan(0);
		}
	});
});

describe('la configuración de fábrica', () => {
	it('sale vacía, y esa es la decisión', () => {
		// Antes venía con los siete internos esenciales puestos porque sin
		// propulsores no se movía. Ahora el casco los trae de fábrica, así que una
		// nave de astillero vuela pelada y **todas** sus ranuras son del piloto.
		for (const hull of HULLS) {
			const fit = defaultFit(hull);
			expect(fit.length, hull.name).toBe(hull.slots.length);
			for (const module of fit) expect(module, hull.name).toBe(EMPTY);
		}
	});

	it('se puede volar en todo casco, sabiendo volar ese casco', () => {
		// Si la configuración de fábrica no cierra, el catálogo está mal. Los
		// requisitos del casco se dan por cumplidos —quien lo tiene sabe volarlo— y
		// lo que se prueba es que **la nave de astillero no venga con módulos que su
		// dueño no pueda usar**: el escalón de fábrica es el E, que no pide nada.
		for (const hull of HULLS) {
			const skills = Object.fromEntries(
				hull.requirements.map((requisito) => [requisito.skill, requisito.level])
			);
			const readout = buildReadout(hull, defaultFit(hull), skills);
			expect(readout.flyable, `${hull.name}: ${readout.problems.join(' · ')}`).toBe(true);
		}
	});

	it('y un piloto recién hecho vuela la suya sin entrenar nada', () => {
		// La prueba que de verdad importa: el alta termina con una nave que despega.
		// Si esto se rompe, el juego empieza con el piloto en tierra y sin saber por
		// qué, que es la peor primera pantalla posible.
		for (const profession of PLAYABLE_PROFESSIONS) {
			const readout = buildReadout(inicial, defaultFit(inicial), startingLevels(profession.code));
			expect(readout.flyable, `${profession.name}: ${readout.problems.join(' · ')}`).toBe(true);
		}
	});

	it('se reconstruye desde sus códigos', () => {
		const fit = defaultFit(inicial);
		const codigos = fit.map((module) => module.code);
		expect(fitFromCodes(inicial, codigos)).toEqual(fit);
	});

	it('no se reconstruye con la cantidad equivocada de ranuras', () => {
		expect(() => fitFromCodes(inicial, ['mining_laser_i1'])).toThrow();
	});
});

describe('los presupuestos', () => {
	it('saben si se pasaron', () => {
		expect(budget(10, 20).over).toBe(false);
		expect(budget(21, 20).over).toBe(true);
		expect(budget(21, 20).free).toBe(-1);
	});

	it('no pasan de cien en la barra', () => {
		expect(budget(200, 100).percent).toBe(100);
	});

	it('dejan la nave en tierra al pasarse de cómputo', () => {
		// Y hay que decir cuánto falta, no sólo que no se puede.
		// Lo más caro en cómputo que entre, en cada ranura que lo acepte.
		const fit = inicial.slots.map((slot) => {
			const opciones = modulesForSlot(slot.kind, slot.size);
			if (opciones.length === 0) return EMPTY;
			return opciones.reduce((peor, module) =>
				module.computingDraw > peor.computingDraw ? module : peor
			);
		});

		const readout = buildReadout(inicial, fit);
		expect(readout.computing.over).toBe(true);
		expect(readout.computing.free).toBeLessThan(0);
		expect(readout.problems.some((p) => p.includes('cómputo'))).toBe(true);
		expect(readout.flyable).toBe(false);
	});

	it('hacen del cómputo un límite de verdad en todo casco', () => {
		// Si ningún casco pudiera pasarse, el segundo presupuesto sería decorativo.
		for (const hull of HULLS) {
			const electronico = hull.slots.reduce((total, slot) => {
				const opciones = modulesForSlot(slot.kind, slot.size);
				const mayor = opciones.length
					? Math.max(...opciones.map((module) => module.computingDraw))
					: 0;
				return total + mayor;
			}, 0);
			expect(electronico, hull.name).toBeGreaterThan(hull.computing);
		}
	});

	it('dicen con el número cuánta potencia falta', () => {
		const hull = getHull('percal');
		const fit = [...defaultFit(hull)];
		fit[0] = getModule('mining_laser_i2');
		fit[1] = getModule('mining_laser_i2');
		hull.slots.forEach((slot, i) => {
			if (slot.kind === 'mid' && slot.size >= 2) fit[i] = getModule('shield_gen_i2');
		});

		const readout = buildReadout(hull, fit);
		expect(readout.power.over).toBe(true);
		expect(readout.problems.some((p) => p.includes('MW'))).toBe(true);
	});
});

describe('lo que se divide por la masa', () => {
	it('suma el casco y todo lo montado', () => {
		const fit = defaultFit(inicial);
		const esperado = inicial.mass + fit.reduce((total, module) => total + module.mass, 0);
		expect(buildReadout(inicial, fit).mass).toBe(esperado);
	});

	it('frena la nave con un módulo pesado aunque no consuma', () => {
		// Es la regla que hace que toda decisión de equipamiento cueste tiempo.
		const liviana = defaultFit(inicial);
		const cargada = [...liviana];
		inicial.slots.forEach((slot, i) => {
			// La placa de blindaje no pide energía: sólo pesa.
			if (slot.kind === 'low') cargada[i] = getModule('armor_plate_i1');
		});

		const antes = buildReadout(inicial, liviana);
		const despues = buildReadout(inicial, cargada);
		expect(despues.mass).toBeGreaterThan(antes.mass);
		expect(despues.speed).toBeLessThan(antes.speed);
		expect(despues.jumpRange).toBeLessThan(antes.jumpRange);
	});

	it('mueve una nave pelada, porque el empuje es del casco', () => {
		// Es la diferencia con antes: sin propulsores montados la nave **igual
		// vuela**, porque los propulsores son parte del casco. Lo que se monta es
		// la mejora.
		const readout = buildReadout(inicial, defaultFit(inicial));
		expect(readout.speed).toBeGreaterThan(0);
		expect(readout.flyable).toBe(true);
	});
});

describe('lo que cuesta salir y lo que cuesta cruzar', () => {
	/*
	 * El reloj de un viaje son dos sumandos que no se parecen, y la hoja de la nave
	 * los lleva por separado a propósito. Lo que se protege acá es que cada cosa
	 * entre por su puerta: la masa empeora la alineación y **no toca** la velocidad
	 * de warp, un optimizador estira el warp y **no acorta** la alineación, y el
	 * equipamiento no puede comprar ninguna de las dos sin pagarla en otra divisa.
	 */
	const carguera = getHull('mula');

	/** La misma configuración, con todas las ranuras bajas llenas de lo que se pida. */
	function conLasBajasLlenas(hull: Hull, code: string) {
		const fit = [...defaultFit(hull)];
		hull.slots.forEach((slot, i) => {
			if (slot.kind === 'low') fit[i] = getModule(code);
		});
		return fit;
	}

	/** La configuración de fábrica con un módulo en la primera ranura baja. */
	function conUnaBaja(hull: Hull, code: string) {
		const fit = [...defaultFit(hull)];
		fit[hull.slots.findIndex((slot) => slot.kind === 'low')] = getModule(code);
		return fit;
	}

	/**
	 * El warp más alto que un casco alcanza con un equipamiento que **igual vuela**.
	 *
	 * Prueba todas las combinaciones de optimizadores en las ranuras bajas y se
	 * queda con la mejor que no se pasa de presupuesto, con todo entrenado. Son
	 * pocas —tres opciones por ranura baja— y la fuerza bruta dice mucho más que un
	 * número escrito a mano: si mañana entra un optimizador nuevo o un casco con
	 * más bajas, esto lo tiene en cuenta solo.
	 */
	function mejorWarp(hull: Hull): number {
		const optimizadores = MODULES.filter((module) => module.warpSpeed > 0);
		const bajas = hull.slots.flatMap((slot, i) => (slot.kind === 'low' ? [i] : []));
		const skills = maxedSkills();

		let mejor = hull.warpSpeed;
		const probar = (cual: number, fit: readonly ShipModule[]) => {
			if (cual === bajas.length) {
				const readout = buildReadout(hull, fit, skills);
				if (readout.flyable) mejor = Math.max(mejor, readout.warpSpeed);
				return;
			}
			const ranura = hull.slots[bajas[cual]];
			for (const module of [EMPTY, ...optimizadores]) {
				if (module !== EMPTY && module.size > ranura.size) continue;
				const siguiente = [...fit];
				siguiente[bajas[cual]] = module;
				probar(cual + 1, siguiente);
			}
		};
		probar(0, defaultFit(hull));

		return mejor;
	}

	it('sube la agilidad, y con ella la alineación', () => {
		// La placa de blindaje no pide energía: sólo pesa. Y pesar ahora también es
		// salir más tarde, no sólo llegar más tarde. Es la segunda puerta por la que
		// entra la masa, y es la que se paga hasta en el viaje más corto del sistema.
		const pelada = buildReadout(carguera, defaultFit(carguera));
		const cargada = buildReadout(carguera, conLasBajasLlenas(carguera, 'armor_plate_i1'));

		expect(cargada.mass).toBeGreaterThan(pelada.mass);
		expect(cargada.agility).toBeGreaterThan(pelada.agility);
		expect(cargada.alignSeconds).toBeGreaterThan(pelada.alignSeconds);
	});

	it('y deja la velocidad de warp donde estaba', () => {
		// **La otra mitad del reloj no se entera de lo que pesa la nave.** Es lo que
		// hace que la carguera cruce igual de lento vacía que llena, y lo que separa
		// este número de la velocidad sub-warp, que sí se hunde con cada tonelada.
		const pelada = buildReadout(carguera, defaultFit(carguera));
		const cargada = buildReadout(carguera, conLasBajasLlenas(carguera, 'armor_plate_i1'));

		expect(cargada.warpSpeed).toBe(carguera.warpSpeed);
		expect(cargada.speed).toBeLessThan(pelada.speed);
	});

	it('el optimizador chico estira el warp y lo saca de la bodega', () => {
		// El que quiere llegar antes carga menos, y en una lanzadera de treinta metros
		// cúbicos quince son la mitad del viaje: la decisión se siente en la primera
		// hora. Cobrarlo en velocidad sería cobrar dos veces lo mismo, y cobrarlo en
		// firma sería no cobrarlo, porque hoy no la lee ningún verbo.
		const pelada = buildReadout(inicial, defaultFit(inicial));
		const con = buildReadout(inicial, conUnaBaja(inicial, 'warp_optimizer_i2'));

		expect(con.warpSpeed).toBe(pelada.warpSpeed + 3);
		expect(con.cargo).toBe(pelada.cargo - 15);
		expect(con.signature).toBe(pelada.signature);
	});

	it('y el grande estira más y cobra más, en la misma bodega', () => {
		// La misma divisa y más caro por décima: lo que lo justifica es que da más en
		// una sola ranura, y eso vale en un casco al que le sobran bajos.
		const pelada = buildReadout(carguera, defaultFit(carguera));
		const con = buildReadout(carguera, conUnaBaja(carguera, 'warp_optimizer_ii3'));

		expect(con.warpSpeed).toBe(pelada.warpSpeed + 5);
		expect(con.cargo).toBe(pelada.cargo - 40);
		expect(con.signature).toBe(pelada.signature);
	});

	it('y ninguno de los dos acorta la alineación', () => {
		// Lo que se compra es el tramo que escala. El arranque no se compra: se
		// entrena. Y como además pesan, si mueven la alineación es para arriba.
		const pelada = buildReadout(inicial, defaultFit(inicial));
		const con = buildReadout(inicial, conUnaBaja(inicial, 'warp_optimizer_i2'));

		expect(con.alignSeconds).toBeGreaterThanOrEqual(pelada.alignSeconds);
	});

	/*
	 * **El agujero que encontró la auditoría, y el caso que lo mantiene cerrado.**
	 *
	 * Nada limitaba cuántos optimizadores llevaba una nave: una Mula con las cinco
	 * bajas llenas pasaba de 2,0 a 3,5 de warp —más rápida que una Alabarda de
	 * fábrica— por ocho mil créditos y sin pedir ninguna habilidad, y el abanico de
	 * warp del catálogo se comprimía de 3,0× a 1,47×. Cuando cualquiera puede
	 * comprar la velocidad de la clase de arriba, elegir casco deja de decidir.
	 *
	 * Lo que se fija acá **no es cuántos entran** —ése es un número de balance que
	 * se va a mover— sino la consecuencia: que la jerarquía de cascos no se compre.
	 */
	it('no deja llenar la nave de optimizadores', () => {
		const carguera = getHull('mula');
		const llena = buildReadout(
			carguera,
			conLasBajasLlenas(carguera, 'warp_optimizer_i2'),
			maxedSkills()
		);

		// Ni con todo entrenado: lo que la frena es el presupuesto, no la habilidad.
		expect(llena.flyable).toBe(false);
	});

	it('y no deja comprar la clase de un casco que no es el tuyo', () => {
		// El mejor equipamiento **que igual vuela** no llega al warp de fábrica del
		// casco de combate. La carguera sigue siendo la carguera.
		const carguera = getHull('mula');

		// Algo sí se puede montar, y decirlo importa: si no entrara ninguno, el
		// caso pasaría por no encontrar fit y no por el límite que viene a cuidar.
		expect(mejorWarp(carguera)).toBeGreaterThan(carguera.warpSpeed);
		expect(mejorWarp(carguera)).toBeLessThan(getHull('alabarda').warpSpeed);
	});

	it('y deja el abanico del catálogo abierto, no aplastado', () => {
		// La medida entera, que es la que importa: de fábrica hay 3,0× entre el
		// casco más rápido y el más lento. Con todo lo comprable montado tiene que
		// seguir siendo un abanico; el exploit lo dejaba en 1,47×.
		const mejores = HULLS.map((hull) => mejorWarp(hull));
		expect(Math.max(...mejores) / Math.min(...mejores)).toBeGreaterThan(2);
	});

	it('ninguna habilidad mueve la velocidad de warp', () => {
		// Es de la clase del casco, como en EVE: **con todo entrenado sigue siendo la
		// misma**. Es lo que hace que elegir casco siga decidiendo algo cuando el
		// piloto ya lo entrenó todo, y lo primero que se rompería si a alguien se le
		// ocurriera darle una habilidad.
		for (const hull of HULLS) {
			const readout = buildReadout(hull, defaultFit(hull), maxedSkills());
			expect(readout.warpSpeed, hull.name).toBe(hull.warpSpeed);
		}
	});
});

describe('Maniobra, lo único del reloj que el piloto entrena', () => {
	const carguera = getHull('mula');

	it('baja la alineación de la hoja, y en cuánto lo dice el documento', () => {
		// Estrena verbo con el modelo nuevo: prometía «tiempo de alineación antes de
		// salir» desde que existe el catálogo y no movía nada. Los dos números salen
		// de docs/systems/SHIPS.md, «Qué mueve el piloto, y qué no»: al nivel V la
		// Pioner pasa de 4 a 3 segundos y la Mula de 15 a 12.
		expect(buildReadout(inicial, defaultFit(inicial)).alignSeconds).toBe(4);
		expect(
			buildReadout(inicial, defaultFit(inicial), { maneuvering: MAX_SKILL_LEVEL }).alignSeconds
		).toBe(3);

		expect(buildReadout(carguera, defaultFit(carguera)).alignSeconds).toBe(15);
		expect(
			buildReadout(carguera, defaultFit(carguera), { maneuvering: MAX_SKILL_LEVEL }).alignSeconds
		).toBe(12);
	});

	it('divide la agilidad, no se la resta', () => {
		// +5 % por nivel hasta +25 % en el cinco, que es el bono por omisión de
		// docs/systems/SKILLS.md. La Mula tiene 2.180 de agilidad en el cuadro de
		// SHIPS.md: dividida por 1,25 da 1.744, que es el 80 %. Restarle el 25 %
		// daría 1.635, que es el otro número y es el que no tiene que salir.
		// Mejorar la agilidad es bajarla, como la eficiencia de combustible.
		const sinEntrenar = buildReadout(carguera, defaultFit(carguera));
		const entrenado = buildReadout(carguera, defaultFit(carguera), {
			maneuvering: MAX_SKILL_LEVEL
		});

		expect(sinEntrenar.agility).toBe(2180);
		expect(entrenado.agility).toBe(1744);
		expect(entrenado.agility).not.toBe(1635);
	});

	it('sale de la tabla de bonos, y con el porcentaje del documento', () => {
		// La habilidad y el porcentaje, dichos una sola vez: 5 % por nivel, que es el
		// bono por omisión de docs/systems/SKILLS.md y lo que SHIPS.md repite en «Qué
		// mueve el piloto, y qué no».
		expect(SKILL_BONUSES.agility.skill).toBe('maneuvering');
		expect(SKILL_BONUSES.agility.percentPerLevel).toBe(5);

		const nivel = 3;
		expect(bonusPercent('agility', carguera, { maneuvering: nivel })).toBe(nivel * 5);
	});

	it('y es la única habilidad que toca la agilidad de la hoja', () => {
		// **La agilidad tiene un solo sumando del lado del piloto.** Con todo
		// entrenado, la carguera queda en el mismo número que con Maniobra sola: si
		// otra habilidad se colara en la misma bolsa, se vería acá. El día que un
		// casco estrene un bono de rol de agilidad va a haber dos fuentes, y lo que
		// hay que probar entonces es que **se sumen antes de dividir** y no que se
		// apliquen una tras otra, como ya prueba «se suman entre habilidad y casco».
		const soloManiobra = buildReadout(carguera, defaultFit(carguera), {
			maneuvering: MAX_SKILL_LEVEL
		});
		const todo = buildReadout(carguera, defaultFit(carguera), maxedSkills());

		expect(todo.agility).toBe(soloManiobra.agility);
	});
});

describe('los bonos', () => {
	it('no dan nada sin habilidades', () => {
		expect(bonusPercent('cargo', inicial, {})).toBe(0);
	});

	it('se suman entre habilidad y casco', () => {
		// Se suman y no se multiplican, como fija ACTIONS.md. La minera es el caso
		// testigo desde que la lanzadera no tiene bono de rol: es de los cascos que
		// sí lo tienen, así que acá el bono no puede ser nulo.
		const hull = getHull('percal');
		const rol = hull.bonus!;
		expect(rol.target).toBe('mining_yield');

		const { skill, percentPerLevel } = SKILL_BONUSES.mining_yield;
		expect(skill).toBe(rol.skill); // la minera premia a quien sabe minar

		const nivel = 3;
		const esperado = nivel * percentPerLevel + nivel * rol.percentPerLevel;
		expect(bonusPercent('mining_yield', hull, { [skill]: nivel })).toBe(esperado);
	});

	it('aumentan el rendimiento al entrenar minería', () => {
		const hull = getHull('percal');
		const fit = [...defaultFit(hull)];
		fit[0] = getModule('mining_laser_i1');

		const sinEntrenar = buildReadout(hull, fit);
		const entrenado = buildReadout(hull, fit, { mining: 5 });
		expect(entrenado.miningPerHour).toBeGreaterThan(sinEntrenar.miningPerHour);
	});

	it('cubren todas las habilidades de nave en el modo "con todo entrenado"', () => {
		const maximas = maxedSkills();
		for (const [objetivo, bonus] of Object.entries(SKILL_BONUSES)) {
			expect(maximas[bonus.skill], objetivo).toBe(MAX_SKILL_LEVEL);
		}
		for (const hull of HULLS) {
			expect(maximas[hull.bonus.skill]).toBe(MAX_SKILL_LEVEL);
		}
	});

	it('apuntan a habilidades que existen', () => {
		for (const bonus of Object.values(SKILL_BONUSES)) {
			expect(Object.hasOwn(SKILLS, bonus.skill)).toBe(true);
		}
	});
});

describe('el acumulador', () => {
	it('deja estable una nave sin nada encendido', () => {
		const readout = buildReadout(inicial, defaultFit(inicial));
		expect(readout.stable).toBe(true);
		expect(readout.drainPerHour).toBe(0);
	});

	it('se declara estable sólo si la recarga alcanza', () => {
		const hull = getHull('percal');
		const fit = [...defaultFit(hull)];
		fit[0] = getModule('mining_laser_i2');
		fit[1] = getModule('mining_laser_i2');

		const readout = buildReadout(hull, fit);
		expect(readout.stable).toBe(readout.drainPerHour <= readout.rechargePerHour);
	});

	it('hace rendir menos el trabajo si no lo sostiene', () => {
		// Es la traducción del manejo en vivo de EVE a una sola cuenta.
		const hull = getHull('percal');
		const modesto = [...defaultFit(hull)];
		modesto[0] = getModule('mining_laser_i2');
		modesto[1] = getModule('mining_laser_i2');

		// La mejora ahora cuesta una ranura: la batería va en una consola.
		const mejor = [...modesto];
		const consola = hull.slots.findIndex((slot) => slot.kind === 'mid' && slot.size >= 2);
		mejor[consola] = getModule('capacitor_battery_i2');

		const conPoco = buildReadout(hull, modesto);
		const conMucho = buildReadout(hull, mejor);

		expect(conPoco.stable).toBe(false);
		expect(conMucho.stable).toBe(true);
		expect(conMucho.miningPerHour).toBeGreaterThan(conPoco.miningPerHour);
	});
});

/*
 * El tanque y la autonomía, que **hoy no las gasta nadie**.
 *
 * Cruzar una puerta es gratis, así que el consumo quedó dormido esperando al
 * motor de salto de las capitales. La ficha sigue calculando las dos cifras, y
 * ése es justamente el riesgo: una cuenta que nadie mira se rompe en silencio y
 * se descubre el día que vuelva a decidir algo. Estos tests la mantienen viva.
 */
describe('el tanque y la autonomía', () => {
	/** La lanzadera inicial con un depósito auxiliar en su ranura baja grande. */
	function conDeposito() {
		const fit = [...defaultFit(inicial)];
		const baja = inicial.slots.findIndex((slot) => slot.kind === 'low' && slot.size >= 2);
		fit[baja] = getModule('fuel_tank_i2');
		return fit;
	}

	it('un depósito auxiliar agranda el tanque y da más saltos', () => {
		const pelada = buildReadout(inicial, defaultFit(inicial));
		const conTanque = buildReadout(inicial, conDeposito());

		expect(conTanque.fuel).toBeGreaterThan(pelada.fuel);
		expect(conTanque.jumps).toBeGreaterThan(pelada.jumps);
	});

	/*
	 * El número sale de SKILLS.md: **+5 % por nivel** es el bono por omisión, y
	 * Eficiencia de combustible no tiene ninguna razón documentada para moverse de
	 * ahí. Si alguien lo cambia, tiene que cambiar el documento en el mismo commit.
	 */
	it('Eficiencia de combustible al cinco son veinticinco puntos', () => {
		const readout = buildReadout(inicial, defaultFit(inicial), {
			fuel_efficiency: MAX_SKILL_LEVEL
		});

		expect(readout.fuelEfficiency).toBe(25);
	});

	it('y esos puntos estiran la autonomía que muestra la ficha', () => {
		// La cifra sale de la misma función que cobraría el salto, así que probar
		// que la habilidad la mueve es probar que la palanca sigue conectada.
		const sinEntrenar = buildReadout(inicial, defaultFit(inicial));
		const entrenado = buildReadout(inicial, defaultFit(inicial), {
			fuel_efficiency: MAX_SKILL_LEVEL
		});

		expect(entrenado.jumps).toBeGreaterThan(sinEntrenar.jumps);
	});

	it('una nave sin entrenar nada llega a alguna parte', () => {
		// Cero saltos con el tanque lleno sería una autonomía que no existe: la
		// ficha estaría prometiendo un cero.
		expect(buildReadout(inicial, defaultFit(inicial)).jumps).toBeGreaterThan(0);
	});
});

describe('la supervivencia y el daño', () => {
	it('no da escudo sin generador', () => {
		// El escudo es el único que no viene con el casco.
		expect(buildReadout(inicial, defaultFit(inicial)).shield).toBe(0);
	});

	it('da escudo al montar un generador', () => {
		const hull = getHull('percal');
		const fit = [...defaultFit(hull)];
		const indice = hull.slots.findIndex((slot) => slot.kind === 'mid' && slot.size >= 2);
		fit[indice] = getModule('shield_gen_i2');
		expect(buildReadout(hull, fit).shield).toBeGreaterThan(0);
	});

	it('cambia los puntos efectivos según el tipo de daño', () => {
		// Si no cambiaran, los tipos de daño no servirían para nada.
		const readout = buildReadout(getHull('alabarda'), defaultFit(getHull('alabarda')));
		expect(new Set(Object.values(readout.effectiveHp)).size).toBeGreaterThan(1);
	});

	it('no hace daño con una nave sin armas', () => {
		expect(buildReadout(inicial, defaultFit(inicial)).totalDps).toBe(0);
	});

	it('da daño de su tipo y sólo de ése al montar un arma', () => {
		const hull = getHull('alabarda');
		const fit = [...defaultFit(hull)];
		fit[0] = getModule('ion_emitter_i1');

		const readout = buildReadout(hull, fit);
		expect(readout.dps.ionic).toBeGreaterThan(0);
		expect(readout.dps.kinetic).toBe(0);
		expect(readout.dps.thermal).toBe(0);
	});

	it('aumenta el daño al entrenar puntería', () => {
		const hull = getHull('alabarda');
		const fit = [...defaultFit(hull)];
		fit[0] = getModule('mass_cannon_i2');

		const sinEntrenar = buildReadout(hull, fit);
		const entrenado = buildReadout(hull, fit, { gunnery: 5 });
		expect(entrenado.totalDps).toBeGreaterThan(sinEntrenar.totalDps);
	});

	it('hace pegar menos al arma térmica que a la especializada', () => {
		// Su ventaja es que nunca le rebota del todo, no la cifra cruda.
		const hull = getHull('alabarda');
		const dps = (code: string) => {
			const fit = [...defaultFit(hull)];
			fit[0] = getModule(code);
			return buildReadout(hull, fit).totalDps;
		};
		expect(dps('thermal_lance_i2')).toBeLessThan(dps('mass_cannon_i2'));
	});
});

describe('la consistencia general', () => {
	it('rechaza una configuración con ranuras de más', () => {
		expect(() => buildReadout(inicial, [...defaultFit(inicial), EMPTY])).toThrow();
	});

	it('hace que cada casco gane en lo suyo', () => {
		// La minera mina más, la carguera carga más, la exploradora salta más lejos.
		const lecturas = Object.fromEntries(
			HULLS.map((hull) => [hull.code, buildReadout(hull, defaultFit(hull))])
		);
		const todas = Object.values(lecturas);

		expect(lecturas.mula.cargo).toBe(Math.max(...todas.map((r) => r.cargo)));
		expect(lecturas.vencejo.jumpRange).toBe(Math.max(...todas.map((r) => r.jumpRange)));
		expect(lecturas.vencejo.speed).toBe(Math.max(...todas.map((r) => r.speed)));
		expect(lecturas.alabarda.armor).toBe(Math.max(...todas.map((r) => r.armor)));
		expect(lecturas.vencejo.signature).toBe(Math.min(...todas.map((r) => r.signature)));
	});
});

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
import { HULLS, SLOT_KINDS, STARTING_HULL, getHull } from './hulls';
import { EMPTY, MODULES, TIERS, getModule, modulesForSlot } from './modules';
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
		const opciones = modulesForSlot('hardpoint', 1);
		expect(opciones.length).toBeGreaterThan(0);
		expect(opciones.every((module) => module.size <= 1)).toBe(true);
	});

	it('deja los módulos chicos en una ranura grande', () => {
		const chicas = modulesForSlot('hardpoint', 1).map((m) => m.code);
		const grandes = new Set(modulesForSlot('hardpoint', 2).map((m) => m.code));
		expect(chicas.every((code) => grandes.has(code))).toBe(true);
	});

	it('no declara un módulo imposible de alimentar', () => {
		// Un módulo que ninguna planta puede sostener es contenido muerto.
		const maxima = Math.max(...MODULES.map((module) => module.powerOutput));
		for (const module of MODULES) {
			expect(module.powerDraw, module.code).toBeLessThanOrEqual(maxima);
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
			if (slot.kind === 'console' && slot.size >= 2) fit[i] = getModule('shield_gen_i2');
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
			if (slot.kind === 'chassis') cargada[i] = getModule('armor_plate_i1');
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

describe('los bonos', () => {
	it('no dan nada sin habilidades', () => {
		expect(bonusPercent('cargo', inicial, {})).toBe(0);
	});

	it('se suman entre habilidad y casco', () => {
		// Se suman y no se multiplican, como fija ACTIONS.md.
		const hull = getHull('percal');
		expect(hull.bonus.target).toBe('mining_yield');

		const { skill, percentPerLevel } = SKILL_BONUSES.mining_yield;
		expect(skill).toBe(hull.bonus.skill); // la minera premia a quien sabe minar

		const nivel = 3;
		const esperado = nivel * percentPerLevel + nivel * hull.bonus.percentPerLevel;
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
		const consola = hull.slots.findIndex((slot) => slot.kind === 'console' && slot.size >= 2);
		mejor[consola] = getModule('capacitor_battery_i2');

		const conPoco = buildReadout(hull, modesto);
		const conMucho = buildReadout(hull, mejor);

		expect(conPoco.stable).toBe(false);
		expect(conMucho.stable).toBe(true);
		expect(conMucho.miningPerHour).toBeGreaterThan(conPoco.miningPerHour);
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
		const indice = hull.slots.findIndex((slot) => slot.kind === 'console' && slot.size >= 2);
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

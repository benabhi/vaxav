/**
 * El catálogo de habilidades es un árbol consistente y transitable.
 *
 * Estos tests no prueban código: prueban el **diseño**. Un requisito hacia una
 * habilidad que no existe, un ciclo, o una habilidad de entrada con requisitos
 * son errores que sólo se descubrirían jugando, y acá se descubren al guardar.
 */

import { describe, expect, it } from 'vitest';
import { MAX_LEVEL } from './progression';
import {
	MAX_DIFFICULTY,
	MIN_DIFFICULTY,
	SKILLS,
	SKILL_FAMILIES,
	canTrain,
	entrySkills,
	getSkill,
	skillsByFamily,
	unmetRequirements
} from './skills';

const CATALOG = Object.values(SKILLS);

describe('el catálogo', () => {
	it('tiene códigos únicos que coinciden con la clave', () => {
		for (const [code, skill] of Object.entries(SKILLS)) {
			expect(skill.code).toBe(code);
		}
	});

	it('declara dificultades en rango', () => {
		for (const skill of CATALOG) {
			expect(skill.difficulty).toBeGreaterThanOrEqual(MIN_DIFFICULTY);
			expect(skill.difficulty).toBeLessThanOrEqual(MAX_DIFFICULTY);
		}
	});

	it('apunta todo requisito a una habilidad que existe', () => {
		for (const skill of CATALOG) {
			for (const requirement of skill.requirements) {
				expect(
					Object.hasOwn(SKILLS, requirement.skill),
					`${skill.code} exige ${requirement.skill}, que no está en el catálogo`
				).toBe(true);
			}
		}
	});

	it('pide niveles alcanzables', () => {
		for (const skill of CATALOG) {
			for (const requirement of skill.requirements) {
				expect(requirement.level).toBeGreaterThanOrEqual(1);
				expect(requirement.level).toBeLessThanOrEqual(MAX_LEVEL);
			}
		}
	});

	it('no deja que una habilidad se exija a sí misma', () => {
		for (const skill of CATALOG) {
			expect(skill.requirements.some((r) => r.skill === skill.code)).toBe(false);
		}
	});

	it('tiene habilidades de entrada que no piden nada', () => {
		// Un piloto nuevo nunca puede quedar frente a un catálogo cerrado.
		expect(
			entrySkills().length,
			'Sin habilidades de entrada no se puede empezar a jugar'
		).toBeGreaterThan(0);
	});

	it('llena todas las familias', () => {
		const grouped = skillsByFamily();
		for (const family of SKILL_FAMILIES) {
			expect(grouped[family].length, `La familia ${family} quedó vacía`).toBeGreaterThan(0);
		}
	});

	it('no tiene ciclos', () => {
		// Toda habilidad se puede alcanzar entrenando en algún orden. Se resuelve
		// por capas: se parte de las que no piden nada y se van sumando las que ya
		// tienen todos sus requisitos cubiertos. Si queda alguna afuera, es porque
		// hay un ciclo o una dependencia imposible.
		const reachable = new Set(entrySkills().map((skill) => skill.code));
		const pending = new Set(Object.keys(SKILLS).filter((code) => !reachable.has(code)));

		let progressed = true;
		while (pending.size > 0 && progressed) {
			progressed = false;
			for (const code of [...pending].sort()) {
				if (getSkill(code).requirements.every((r) => reachable.has(r.skill))) {
					reachable.add(code);
					pending.delete(code);
					progressed = true;
				}
			}
		}

		expect([...pending].sort(), 'Habilidades inalcanzables (¿ciclo?)').toEqual([]);
	});

	it('falla con el nombre si la habilidad no existe', () => {
		expect(() => getSkill('ansible')).toThrow(/ansible/);
	});
});

describe('poder entrenar', () => {
	it('siempre deja entrenar una habilidad sin requisitos', () => {
		expect(canTrain('mining', {})).toBe(true);
	});

	it('informa con detalle los requisitos que faltan', () => {
		const faltantes = unmetRequirements('prospecting', { mining: 1 });
		expect(faltantes.map((r) => [r.skill, r.level])).toEqual([['mining', 3]]);
	});

	it('deja entrenar con los requisitos cumplidos', () => {
		expect(canTrain('prospecting', { mining: 3 })).toBe(true);
		expect(canTrain('prospecting', { mining: 5 })).toBe(true);
	});

	it('exige las dos ramas cuando la habilidad pide dos', () => {
		// Las habilidades profundas piden dos ramas: tener una sola no alcanza.
		expect(canTrain('cartography', { scanning: 5 })).toBe(false);
		expect(canTrain('cartography', { astrogation: 5 })).toBe(false);
		expect(canTrain('cartography', { scanning: 3, astrogation: 2 })).toBe(true);
	});
});

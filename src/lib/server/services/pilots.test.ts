/** El alta de un piloto lo deja listo para jugar, o no lo deja existir. */

import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { body } from '../db/schema';
import { crearPiloto, seededDb } from '../db/testing';
import { getFaction } from '$lib/game/factions';
import { startingLevels, startingXp } from '$lib/game/professions';
import { levelFromXp } from '$lib/game/progression';
import { getSkill } from '$lib/game/skills';
import {
	PilotError,
	authenticate,
	callsignTaken,
	createPilot,
	emailTaken,
	skillXp,
	validateCallsign,
	validateCredentials,
	validateEmail,
	validatePassword
} from './pilots';

describe('las validaciones, sin tocar la base', () => {
	it('no le objeta nada a un distintivo correcto', () => {
		expect(validateCallsign('Halcon_7')).toBeNull();
	});

	it.each(['', 'ab', 'x'.repeat(21), 'con espacio', 'eñe', 'a@b'])(
		'explica el motivo del distintivo %j',
		(callsign) => {
			const problema = validateCallsign(callsign);
			expect(problema).not.toBeNull();
			expect(problema!.endsWith('.')).toBe(true);
		}
	);

	it('no le objeta nada a un correo correcto', () => {
		expect(validateEmail('piloto@ejemplo.com')).toBeNull();
	});

	it.each(['', 'sinarroba', 'sin@punto', 'con espacio@a.com'])(
		'explica el motivo del correo %j',
		(email) => {
			const problema = validateEmail(email);
			expect(problema).not.toBeNull();
			expect(problema!.endsWith('.')).toBe(true);
		}
	);

	it('le exige un largo mínimo a la contraseña', () => {
		expect(validatePassword('x'.repeat(8))).toBeNull();
		expect(validatePassword('corta')).not.toBeNull();
	});
});

describe('el alta', () => {
	it('deja al piloto en la estación de su facción', async () => {
		// La ubicación es un cuerpo real del universo, no un código suelto.
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const lugar = db.select().from(body).where(eq(body.id, piloto.locationId)).get()!;
		expect(lugar.code).toBe(getFaction('dominion').startingStation);
	});

	it('entrega las habilidades de la profesión', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		expect(skillXp(db, piloto.id)).toEqual(startingXp('miner'));
	});

	it('deja esas habilidades en los niveles prometidos', async () => {
		// Lo que promete la profesión es lo que el piloto tiene al entrar.
		const db = seededDb();
		const piloto = await crearPiloto(db);
		const niveles = Object.fromEntries(
			Object.entries(skillXp(db, piloto.id)).map(([skill, xp]) => [
				skill,
				levelFromXp(xp, getSkill(skill).difficulty)
			])
		);
		expect(niveles).toEqual(startingLevels('miner'));
	});

	it('no guarda la contraseña en claro', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		expect(piloto.passwordHash).not.toContain('contrasena-larga');
	});

	it('no deja dos pilotos con el mismo distintivo', async () => {
		const db = seededDb();
		await crearPiloto(db, 'Halcon');
		await expect(
			createPilot(db, 'Halcon', 'otro@ejemplo.com', 'contrasena-larga', 'miner', 'dominion')
		).rejects.toThrow(/Halcon/);
	});

	it('reserva el distintivo sin importar las mayúsculas', async () => {
		// Halcon y halcon son el mismo piloto, no dos parecidos.
		const db = seededDb();
		await crearPiloto(db, 'Halcon');
		expect(callsignTaken(db, 'HALCON')).toBe(true);
		await expect(
			createPilot(db, 'halcon', 'otro@ejemplo.com', 'contrasena-larga', 'miner', 'dominion')
		).rejects.toThrow(PilotError);
	});

	it('no deja dos pilotos con el mismo correo', async () => {
		// Una persona no debería juntar cuentas sin darse cuenta.
		const db = seededDb();
		await createPilot(db, 'Halcon', 'mismo@ejemplo.com', 'contrasena-larga', 'miner', 'dominion');
		await expect(
			createPilot(db, 'Otro', 'MISMO@ejemplo.com', 'contrasena-larga', 'miner', 'dominion')
		).rejects.toThrow(/correo/);
	});

	it('reserva el correo sin importar las mayúsculas', async () => {
		const db = seededDb();
		await createPilot(db, 'Halcon', 'mismo@ejemplo.com', 'contrasena-larga', 'miner', 'dominion');
		expect(emailTaken(db, 'Mismo@Ejemplo.com')).toBe(true);
	});

	it('no crea nada con un correo inválido', async () => {
		const db = seededDb();
		await expect(
			createPilot(db, 'Halcon', 'sinarroba', 'contrasena-larga', 'miner', 'dominion')
		).rejects.toThrow(PilotError);
		expect(callsignTaken(db, 'Halcon')).toBe(false);
	});

	it('no crea nada con una profesión inexistente', async () => {
		const db = seededDb();
		await expect(
			createPilot(db, 'Halcon', 'h@ejemplo.com', 'contrasena-larga', 'pirata', 'dominion')
		).rejects.toThrow(PilotError);
		expect(callsignTaken(db, 'Halcon')).toBe(false);
	});

	it('no crea nada con una facción inexistente', async () => {
		const db = seededDb();
		await expect(
			createPilot(db, 'Halcon', 'h@ejemplo.com', 'contrasena-larga', 'miner', 'imperio')
		).rejects.toThrow(PilotError);
		expect(callsignTaken(db, 'Halcon')).toBe(false);
	});

	it('no crea nada con una contraseña corta', async () => {
		const db = seededDb();
		await expect(
			createPilot(db, 'Halcon', 'h@ejemplo.com', 'corta', 'miner', 'dominion')
		).rejects.toThrow(PilotError);
		expect(callsignTaken(db, 'Halcon')).toBe(false);
	});

	it('guarda el distintivo sin espacios al borde', async () => {
		const db = seededDb();
		const piloto = await createPilot(
			db,
			'  Halcon  ',
			'h@ejemplo.com',
			'contrasena-larga',
			'miner',
			'dominion'
		);
		expect(piloto.callsign).toBe('Halcon');
	});
});

describe('la autenticación', () => {
	it('deja entrar con su contraseña', async () => {
		const db = seededDb();
		const piloto = await crearPiloto(db);
		expect((await authenticate(db, 'Halcon', 'contrasena-larga'))?.id).toBe(piloto.id);
	});

	it('no distingue mayúsculas en el distintivo', async () => {
		const db = seededDb();
		await crearPiloto(db, 'Halcon');
		expect(await authenticate(db, 'halcon', 'contrasena-larga')).not.toBeNull();
	});

	it('no deja entrar con la contraseña equivocada', async () => {
		const db = seededDb();
		await crearPiloto(db);
		expect(await authenticate(db, 'Halcon', 'otra-contrasena')).toBeNull();
	});

	it('no deja entrar a un distintivo inexistente', async () => {
		const db = seededDb();
		expect(await authenticate(db, 'Nadie', 'contrasena-larga')).toBeNull();
	});
});

describe('la validación conjunta de la cuenta', () => {
	it('no le objeta nada a una cuenta completa', () => {
		expect(validateCredentials('Halcon', 'h@ejemplo.com', 'contrasena', 'contrasena')).toBeNull();
	});

	it('exige que las contraseñas coincidan', () => {
		expect(validateCredentials('Halcon', 'h@ejemplo.com', 'contrasena', 'otra')).toBe(
			'Las contraseñas no coinciden.'
		);
	});

	it('informa el primer problema que encuentra', () => {
		// El distintivo se valida antes que el correo, y el correo antes que la clave.
		expect(validateCredentials('ab', 'malo', 'corta', 'corta')).toContain('distintivo');
		expect(validateCredentials('Halcon', 'malo', 'corta', 'corta')).toContain('correo');
		expect(validateCredentials('Halcon', 'h@ejemplo.com', 'corta', 'corta')).toContain(
			'contraseña'
		);
	});
});

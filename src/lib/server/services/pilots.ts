/**
 * Alta y consulta de pilotos.
 *
 * Es la capa que junta las reglas del juego con las tablas. Todas las funciones
 * reciben la base como primer argumento en vez de abrirla adentro: así se las
 * puede probar contra una base en memoria y quien llama controla la
 * transacción.
 */

import { count, eq, inArray, sql } from 'drizzle-orm';
import {
	asteroidSurvey,
	authSession,
	container,
	corporation,
	creditEntry,
	fittedModule,
	itemEntry,
	itemStack,
	marketOrder,
	pilot,
	pilotAction,
	pilotLog,
	pilotPool,
	pilotRole,
	pilotSkill,
	ship,
	type Pilot
} from '../db/schema';
import type { Db } from '../db/types';
import { getFaction } from '$lib/game/factions';
import { getCorporation } from '$lib/game/corporations';
import { placeInFreeSlot } from '$lib/game/fitting';
import { getModule } from '$lib/game/modules';
import { getProfession, startingKit, startingXp } from '$lib/game/professions';
import { hashPassword, needsRehash, verifyPassword } from './passwords';
import { moveItem, shipContainer } from './containers';
import { credit } from './wallet';
import { createStarterShip, saveFit, shipFit, shipHull } from './ships';
import { UniverseError, requireStation } from './universe';
import { deletePortrait } from './portraits';
import { record } from './events';
import { ADMIN_ROLE, adminCount, rolesOf } from './roles';

export const CALLSIGN_MIN_LENGTH = 3;
export const CALLSIGN_MAX_LENGTH = 20;
/**
 * Letras, números, guion y guion bajo. Sin espacios: el distintivo se escribe
 * para entrar, y un espacio de más es un problema que no vale la pena tener.
 */
const CALLSIGN_PATTERN = /^[A-Za-z0-9_-]+$/;

export const PASSWORD_MIN_LENGTH = 8;

export const EMAIL_MAX_LENGTH = 254;
/**
 * No se valida el correo con una expresión exhaustiva a propósito: la única
 * prueba real de que un correo existe es mandarle algo. Acá sólo se descartan
 * los que seguro no sirven.
 */
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Algo impide crear o autenticar al piloto. El mensaje se le muestra al jugador. */
export class PilotError extends Error {}

/** Devuelve el motivo por el que un distintivo no sirve, o `null` si sirve. */
export function validateCallsign(callsign: string): string | null {
	if (!callsign) return 'Elegí un distintivo.';
	if (callsign.length < CALLSIGN_MIN_LENGTH) {
		return `El distintivo necesita al menos ${CALLSIGN_MIN_LENGTH} caracteres.`;
	}
	if (callsign.length > CALLSIGN_MAX_LENGTH) {
		return `El distintivo no puede pasar de ${CALLSIGN_MAX_LENGTH} caracteres.`;
	}
	if (!CALLSIGN_PATTERN.test(callsign)) {
		return 'El distintivo sólo admite letras, números, guion y guion bajo.';
	}
	return null;
}

/** Devuelve el motivo por el que un correo no sirve, o `null` si sirve. */
export function validateEmail(email: string): string | null {
	if (!email) return 'Escribí un correo.';
	if (email.length > EMAIL_MAX_LENGTH) return 'Ese correo es demasiado largo.';
	if (!EMAIL_PATTERN.test(email)) return 'Ese correo no parece un correo.';
	return null;
}

/** Devuelve el motivo por el que una contraseña no sirve, o `null` si sirve. */
export function validatePassword(password: string): string | null {
	if (password.length < PASSWORD_MIN_LENGTH) {
		return `La contraseña necesita al menos ${PASSWORD_MIN_LENGTH} caracteres.`;
	}
	return null;
}

/**
 * Valida los datos de la cuenta, sin tocar la base.
 *
 * Junta las tres validaciones sueltas más la repetición de la contraseña, que es
 * lo que necesita cualquier formulario de alta. Que sea una función pura la hace
 * probable sin levantar nada.
 */
export function validateCredentials(
	callsign: string,
	email: string,
	password: string,
	confirmation: string
): string | null {
	const problems = [
		validateCallsign(callsign.trim()),
		validateEmail(email.trim()),
		validatePassword(password)
	];
	for (const problem of problems) if (problem) return problem;
	if (password !== confirmation) return 'Las contraseñas no coinciden.';
	return null;
}

/**
 * Busca un piloto por distintivo, sin distinguir mayúsculas.
 *
 * Que `Halcon` y `halcon` sean el mismo piloto evita el clásico registro gemelo
 * que sólo se diferencia por una mayúscula.
 */
export function findByCallsign(db: Db, callsign: string): Pilot | null {
	return (
		db
			.select()
			.from(pilot)
			.where(sql`lower(${pilot.callsign}) = ${callsign.toLowerCase()}`)
			.get() ?? null
	);
}

/** ¿Ya hay un piloto con ese distintivo? */
export function callsignTaken(db: Db, callsign: string): boolean {
	return findByCallsign(db, callsign) !== null;
}

/** Busca un piloto por correo, sin distinguir mayúsculas. */
export function findByEmail(db: Db, email: string): Pilot | null {
	return (
		db
			.select()
			.from(pilot)
			.where(sql`lower(${pilot.email}) = ${email.toLowerCase()}`)
			.get() ?? null
	);
}

/** ¿Ya hay un piloto con ese correo? */
export function emailTaken(db: Db, email: string): boolean {
	return findByEmail(db, email) !== null;
}

/**
 * Da de alta un piloto completo y lo devuelve.
 *
 * Completo quiere decir con todo lo que necesita para jugar desde el primer
 * minuto: sus habilidades iniciales según la profesión y la estación de partida
 * de su facción. Un piloto a medias no debería poder existir, así que las tres
 * escrituras van en una transacción.
 */
export async function createPilot(
	db: Db,
	callsign: string,
	email: string,
	password: string,
	profession: string,
	faction: string,
	corporationCode = ''
): Promise<Pilot> {
	callsign = callsign.trim();
	email = email.trim();

	const problems = [validateCallsign(callsign), validateEmail(email), validatePassword(password)];
	for (const problem of problems) if (problem) throw new PilotError(problem);

	let chosenProfession;
	let chosenFaction;
	try {
		chosenProfession = getProfession(profession);
		chosenFaction = getFaction(faction);
	} catch {
		throw new PilotError('Elegí una profesión y una facción de la lista.');
	}

	// No alcanza con que exista: tiene que estar ofrecida. La pantalla ya dibuja
	// sólo las jugables, pero el servicio no confía en eso — un pedido armado a
	// mano no puede abrir una profesión que todavía no tiene nada que hacer.
	if (!chosenProfession.playable) {
		throw new PilotError('Esa profesión todavía no está disponible.');
	}

	// **La corporación tiene que ser de la facción que eligió.** Alistarse en una
	// del Dominio habiendo nacido en el Pacto no es una elección interesante: es una
	// contradicción, y la pantalla ya ofrece nada más que las suyas.
	let suCorporacion = null;
	if (corporationCode) {
		const elegida = getCorporation(corporationCode);
		if (!elegida || elegida.faction !== chosenFaction.code) {
			throw new PilotError('Esa corporación no recibe pilotos de tu origen.');
		}
		suCorporacion = elegida;
	}

	if (callsignTaken(db, callsign)) throw new PilotError(`Ya hay un piloto llamado ${callsign}.`);
	if (emailTaken(db, email)) throw new PilotError('Ese correo ya está usado por otro piloto.');

	// La estación de partida tiene que existir en el universo sembrado; si no, el
	// error dice qué falta en vez de reventar por una clave foránea.
	let home;
	try {
		home = requireStation(db, chosenFaction.startingStation);
	} catch (error) {
		if (error instanceof UniverseError) throw new PilotError(error.message);
		throw error;
	}

	// El hash va antes de la transacción: es lo único lento de todo esto, y
	// mantenerlo afuera deja la escritura tan corta como puede ser.
	const passwordHash = await hashPassword(password);

	return db.transaction((tx) => {
		// La fila de la corporación se busca adentro de la transacción: el catálogo
		// dice cuál es, pero el identificador es de la base y puede no estar sembrada.
		const suya = suCorporacion
			? (tx.select().from(corporation).where(eq(corporation.code, suCorporacion.code)).get() ??
				null)
			: null;

		const created = tx
			.insert(pilot)
			.values({
				callsign,
				email,
				passwordHash,
				profession: chosenProfession.code,
				faction: chosenFaction.code,
				corporationId: suya?.id ?? null,
				locationId: home.id
			})
			.returning()
			.get();

		const skills = Object.entries(startingXp(chosenProfession.code)).map(([skill, xp]) => ({
			pilotId: created.id,
			skill,
			xp
		}));
		if (skills.length) tx.insert(pilotSkill).values(skills).run();

		// Y su nave. Un piloto sin nave no puede hacer nada: sería un piloto a
		// medias, que es justo lo que este servicio se propuso no dejar existir.
		const nave = createStarterShip(tx, created.id);

		// Con lo que le dio el oficio. Va acá y no en `ships` porque es contenido de
		// la profesión, y la nave no tiene por qué saber de oficios.
		//
		// Lo montado se monta y lo demás va a la bodega: un minero sale con su
		// equipo armado, no con las piezas en una caja. En qué ranura entra cada
		// cosa lo decide el casco, no el oficio.
		const bodega = shipContainer(tx, nave.id);
		const hull = shipHull(nave);
		let codes = shipFit(tx, nave).map((module) => module.code);

		for (const entrada of startingKit(chosenProfession.code)) {
			if (!entrada.fitted) {
				moveItem(tx, bodega.id, entrada.item, entrada.quantity, 'granted');
				continue;
			}

			for (let puestos = 0; puestos < entrada.quantity; puestos++) {
				const conEso = placeInFreeSlot(hull, codes, getModule(entrada.item));
				// Si no entra, va a la bodega en vez de perderse. Un casco sin ranura
				// libre es un problema de balance del kit, no del piloto que se anota.
				if (conEso === null) {
					moveItem(tx, bodega.id, entrada.item, 1, 'granted');
					continue;
				}
				codes = conEso;
			}
		}

		saveFit(tx, nave, codes);

		// Dentro de la transacción: si el alta se deshace, no queda constancia de
		// un piloto que no existe. Se anota a sí mismo como actor porque nadie más
		// lo dio de alta.
		record(tx, {
			kind: 'account.registered',
			actorId: created.id,
			subject: { kind: 'pilot', id: created.id },
			payload: {
				actor: created.callsign,
				callsign: created.callsign,
				faction: chosenFaction.name,
				profession: chosenProfession.name
			}
		});

		return created;
	});
}

/**
 * Devuelve el piloto si el distintivo y la contraseña coinciden.
 *
 * Devuelve `null` sin distinguir entre "no existe" y "la contraseña está mal":
 * decirlo revelaría qué distintivos están registrados.
 */
export async function authenticate(
	db: Db,
	callsign: string,
	password: string
): Promise<Pilot | null> {
	const found = findByCallsign(db, callsign.trim());
	if (found === null) {
		// Se hashea igual una contraseña descartable para que responder a un
		// distintivo inexistente tarde lo mismo que responder a uno real.
		await hashPassword(password);
		return null;
	}

	if (!(await verifyPassword(found.passwordHash, password))) return null;

	// Es el único momento en que tenemos la contraseña en claro para poder
	// rehacer un hash que quedó viejo.
	if (await needsRehash(found.passwordHash)) {
		const passwordHash = await hashPassword(password);
		return db.update(pilot).set({ passwordHash }).where(eq(pilot.id, found.id)).returning().get();
	}

	return found;
}

/**
 * Cambia la contraseña del piloto, verificando primero la actual.
 *
 * Pedir la actual —y no dejar cambiarla sólo por tener la sesión abierta— es lo
 * que impide que alguien que encuentra la sesión abierta en un piloto ajeno se
 * quede con la cuenta.
 */
export async function changePassword(
	db: Db,
	row: Pilot,
	currentPassword: string,
	newPassword: string,
	confirmation: string
): Promise<void> {
	if (!(await verifyPassword(row.passwordHash, currentPassword))) {
		throw new PilotError('La contraseña actual no es correcta.');
	}

	const problem = validatePassword(newPassword);
	if (problem) throw new PilotError(problem);
	if (newPassword !== confirmation) throw new PilotError('Las contraseñas nuevas no coinciden.');

	const passwordHash = await hashPassword(newPassword);

	db.transaction((tx) => {
		tx.update(pilot).set({ passwordHash }).where(eq(pilot.id, row.id)).run();

		// Queda constancia del cambio, **no de la contraseña**. El registro sirve
		// para reconstruir qué pasó con una cuenta, y que le cambiaron la clave es
		// justo el dato que se busca cuando alguien dice que perdió la suya.
		record(tx, {
			kind: 'account.password_changed',
			actorId: row.id,
			subject: { kind: 'pilot', id: row.id },
			payload: { actor: row.callsign, callsign: row.callsign }
		});
	});
}

/**
 * Borra la cuenta del piloto y todo lo que colgaba de ella.
 *
 * **Pide la contraseña.** No es burocracia: es lo único que separa un clic mal
 * dado —o una sesión abierta en una máquina ajena— de perder años de juego. La
 * pantalla además hace escribir el distintivo, pero eso es una traba para el
 * dedo apurado; esto es la que de verdad autoriza.
 *
 * El orden de borrado es **de las hojas a la raíz**, porque las claves foráneas
 * están activas y al revés falla. Ese orden es conocimiento del esquema, así que
 * vive acá y no en la pantalla que aprieta el botón.
 *
 * Va todo en una transacción: una cuenta borrada a medias —sin piloto pero con
 * sus órdenes vivas en el mercado— sería peor que no haberla borrado.
 */
export async function deleteAccount(db: Db, row: Pilot, password: string): Promise<void> {
	if (!(await verifyPassword(row.passwordHash, password))) {
		throw new PilotError('La contraseña no es correcta.');
	}

	// El último administrador no se puede ir. No es por cuidarlo a él: sin
	// ninguno no queda nadie que pueda crear otro, y el juego se queda sin
	// cuartel para siempre. Pasarle el rol a alguien antes cuesta un minuto;
	// recuperarlo después de esto es meterse en la base a mano.
	const suyos = rolesOf(db, row.id);
	if (suyos.some((rol) => rol.code === ADMIN_ROLE) && adminCount(db) <= 1) {
		throw new PilotError(
			'Sos el único administrador: pasale el rol a otro piloto antes de darte de baja.'
		);
	}

	db.transaction((tx) => {
		const naves = tx.select().from(ship).where(eq(ship.pilotId, row.id)).all();
		const contenedores = tx.select().from(container).where(eq(container.pilotId, row.id)).all();
		const deNaves = naves.length
			? tx
					.select()
					.from(container)
					.where(
						inArray(
							container.shipId,
							naves.map((nave) => nave.id)
						)
					)
					.all()
			: [];
		const ids = [...new Set([...contenedores, ...deNaves].map((fila) => fila.id))];

		// Lo que cuelga del piloto por su cuenta.
		tx.delete(asteroidSurvey).where(eq(asteroidSurvey.pilotId, row.id)).run();
		tx.delete(marketOrder).where(eq(marketOrder.pilotId, row.id)).run();
		tx.delete(creditEntry).where(eq(creditEntry.pilotId, row.id)).run();
		tx.delete(pilotLog).where(eq(pilotLog.pilotId, row.id)).run();
		tx.delete(pilotAction).where(eq(pilotAction.pilotId, row.id)).run();
		tx.delete(pilotPool).where(eq(pilotPool.pilotId, row.id)).run();
		tx.delete(pilotSkill).where(eq(pilotSkill.pilotId, row.id)).run();
		tx.delete(authSession).where(eq(authSession.pilotId, row.id)).run();

		// Sus roles se van con él, y los que él repartió pierden el padrino pero no
		// el rol: quien recibió un permiso lo sigue teniendo aunque quien se lo dio
		// ya no esté.
		tx.delete(pilotRole).where(eq(pilotRole.pilotId, row.id)).run();
		tx.update(pilotRole).set({ grantedBy: null }).where(eq(pilotRole.grantedBy, row.id)).run();

		// Lo que cuelga de sus contenedores, y después ellos.
		if (ids.length) {
			tx.delete(itemEntry).where(inArray(itemEntry.containerId, ids)).run();
			tx.delete(itemStack).where(inArray(itemStack.containerId, ids)).run();
			tx.delete(container).where(inArray(container.id, ids)).run();
		}

		// Y sus naves, con lo que tenían montado.
		for (const nave of naves) {
			tx.delete(fittedModule).where(eq(fittedModule.shipId, nave.id)).run();
		}
		tx.delete(ship).where(eq(ship.pilotId, row.id)).run();

		tx.delete(pilot).where(eq(pilot.id, row.id)).run();

		// El registro se escribe **después** de que la fila dejó de existir, y sobre
		// todo sobrevive a ella: es la única tabla que no cuelga del piloto, y por
		// eso es la única que puede contar que la cuenta existió.
		record(tx, {
			kind: 'account.deleted',
			actorId: row.id,
			subject: { kind: 'pilot', id: row.id },
			payload: { actor: row.callsign, callsign: row.callsign, faction: row.faction }
		});
	});

	// El retrato es un archivo y no una fila, así que sale después de que la
	// transacción cerró: si el borrado se hubiera deshecho, la cuenta seguiría
	// existiendo y sería una lástima haberle tirado la foto.
	deletePortrait(row.id);
}

/**
 * Cuántos pilotos tiene cada facción.
 *
 * Se consulta agrupado y no una vez por facción: son tres hoy, pero la
 * diferencia importa el día que sean treinta.
 */
export function countByFaction(db: Db): Record<string, number> {
	const rows = db
		.select({ faction: pilot.faction, total: count(pilot.id) })
		.from(pilot)
		.groupBy(pilot.faction)
		.all();
	return Object.fromEntries(rows.map((row) => [row.faction, row.total]));
}

/** Experiencia acumulada del piloto, por código de habilidad. */
export function skillXp(db: Db, pilotId: number): Record<string, number> {
	const rows = db.select().from(pilotSkill).where(eq(pilotSkill.pilotId, pilotId)).all();
	return Object.fromEntries(rows.map((row) => [row.skill, row.xp]));
}

/**
 * Los pilotos que la semilla deja siempre disponibles.
 *
 * No son contenido del juego: son las herramientas con las que se lo mira.
 * Entrar a revisar una pantalla no puede costar pasar por el alta de cuatro
 * pasos cada vez que se borra la base, y hacerlo a mano en la consola es la
 * clase de paso no escrito que termina siendo folclore.
 *
 * Son **dos y no uno** porque hay dos pares de ojos: uno es el del dueño del
 * proyecto y el otro el que usa la asistencia para revisar lo que construye.
 * Con una sola cuenta compartida, cada uno le pisa al otro dónde estaba parado.
 *
 * Arrancan con un colchón de créditos a propósito. Sale de un asiento del libro
 * mayor como cualquier otro movimiento —nadie escribe el saldo a mano, ni
 * siquiera acá— y está para poder mirar el mercado del lado del que compra sin
 * tener que minar primero.
 */
export interface SeedPilot {
	readonly callsign: string;
	readonly email: string;
	readonly password: string;
	readonly profession: string;
	readonly faction: string;
	/**
	 * En cuál se alistan. El alta hace elegir una y estos dos no son la excepción:
	 * un piloto de siembra sin corporación deja la pestaña Corporación mostrando
	 * «Independiente», que es un estado legítimo del juego pero el que menos
	 * enseña —ni estaciones, ni agentes, ni los otros miembros—.
	 */
	readonly corporation: string;
	readonly credits: number;
}

/** El colchón con el que arrancan, igual para los dos. */
const SEED_CREDITS = 250_000;

export const SEED_PILOTS: readonly SeedPilot[] = [
	{
		callsign: 'benabhi',
		email: 'benabhi@vaxav.test',
		password: '31860933',
		profession: 'miner',
		faction: 'dominion',
		// La casa que opera Puerto Ánfora, que es justo donde empieza parado: su
		// corporación y su estación de partida son la misma, como le pasa a
		// cualquiera que se aliste en el mundo del Dominio.
		corporation: 'casa_verlan',
		credits: SEED_CREDITS
	},
	// De otra facción a propósito: con las dos cuentas en la misma, nada de lo
	// que depende de la facción —la estación de partida, los precios de su
	// corporación— se ve nunca desde el otro lado.
	{
		callsign: 'Prueba',
		email: 'prueba@vaxav.test',
		password: 'vaxav-desarrollo',
		profession: 'miner',
		faction: 'concord',
		// Del otro lado y de otro rubro a propósito: una extractora con más agentes
		// que puestos, contra una casa de comercio con más puestos que agentes. Las
		// dos formas que puede tomar la pantalla se miran sin cambiar de cuenta.
		corporation: 'extractora_anillo',
		credits: SEED_CREDITS
	}
];

/**
 * Los deja creados, **sin tocar los que ya existen**.
 *
 * Es idempotente como el resto de la siembra: volver a sembrar no le devuelve
 * los créditos a nadie ni le borra lo que juntó probando. La contrapartida es
 * que a un piloto que ya existe **no se le cambia la contraseña**: si hace falta
 * la de esta lista, hay que dar de baja la cuenta y volver a sembrar.
 *
 * Devuelve cuántos creó.
 */
export async function ensureSeedPilots(db: Db): Promise<number> {
	let creados = 0;

	for (const spec of SEED_PILOTS) {
		if (callsignTaken(db, spec.callsign) || emailTaken(db, spec.email)) continue;

		const creado = await createPilot(
			db,
			spec.callsign,
			spec.email,
			spec.password,
			spec.profession,
			spec.faction,
			spec.corporation
		);
		credit(db, creado.id, spec.credits, { kind: 'adjustment', memo: 'Fondo de prueba' });
		creados++;
	}

	return creados;
}

/**
 * Arrancar y resolver la acción en curso de un piloto.
 *
 * Mismo patrón que el resto de los servicios: cada función recibe la base como
 * primer argumento, y junta las reglas puras de `../game/actions` y
 * `../game/progression` con las tablas.
 *
 * La resolución es perezosa: no hay ningún proceso corriendo en segundo plano.
 * `resolveIfDue` se llama al consultar —típicamente al cargar una pantalla— y
 * sólo entonces se aplica lo que ya venció.
 *
 * **Resolver es un despachador, no un procedimiento.** Lo que toda acción
 * comparte —quedarse con la fila, depositar en un pozo, escribir el informe—
 * vive una sola vez acá; lo que cada una hace de propio vive en su resolvedor.
 * Antes esto estaba cableado a viajar, y una acción que no se mueve de lugar
 * habría teletransportado al piloto sin que nada fallara.
 */

import { and, eq } from 'drizzle-orm';
import {
	body,
	gate,
	marketOrder,
	pilot,
	pilotAction,
	type Body,
	type Pilot,
	type PilotAction
} from '../db/schema';
import type { Db } from '../db/types';
import {
	MINE_KIND,
	TRAVEL_FAMILY,
	JUMP_KIND,
	TRAVEL_KIND,
	PUBLISH_KIND,
	SURVEY_KIND,
	TRADE_FAMILY,
	travelDurationSeconds,
	type ActionKind
} from '$lib/game/actions';
import { getOre, type ContainerKind } from '$lib/game/items';
import { floorDiv } from '$lib/game/math';
import { jumpProblem, jumpSeconds } from '$lib/game/jumps';
import { MINING_FAMILY, cycleSeconds, yieldPerCycleTenths } from '$lib/game/mining';
import { PUBLISH_SECONDS, dealFactorTenths } from '$lib/game/market';
import { SURVEY_DIFFICULTY, SURVEY_FAMILY } from '$lib/game/prospecting';
import { actionXpPool } from '$lib/game/progression';
import type { SkillFamily } from '$lib/game/skills';
import { skillFamilyLabel } from '$lib/format';
import { cargoHold, fitsUnits, moveItem, shipContainer } from './containers';
import { getAsteroid, takeFromAsteroid } from './asteroids';
import { isBelt, miningPlan } from './mining';
import { placeBuyOrder, placeSellOrder } from './orders';
import { hasFreshSurvey, recordSurvey, surveyPlan } from './prospecting';
import { deposit } from './pools';
import { recordEntry, type PoolDeposit } from './log';
import { activeShip, shipReadout } from './ships';
import { situation } from './status';
import { bodyDistance, getBodyById } from './universe';

export { MINE_KIND, TRAVEL_KIND };

/** La acción no se puede iniciar. El mensaje se le muestra al jugador. */
export class ActionError extends Error {}

/**
 * Lo que pasó al resolverse una acción.
 *
 * Es a la vez lo que se le muestra al jugador en el acto y lo que queda escrito
 * en la bitácora: el mismo informe en dos lugares, porque es el mismo hecho. El
 * `id` es el de la fila del registro, para poder enlazarla.
 */
export interface ActionReport {
	readonly id: number;
	readonly kind: string;
	readonly originName: string;
	readonly destinationName: string;
	readonly durationSeconds: number;
	/** Lo que la acción depositó en el pozo de su rama. */
	readonly deposit: PoolDeposit;
}

/**
 * Lo que un resolvedor decide, y lo único que decide.
 *
 * Todo lo demás —reclamar la fila, escribir el informe, no cobrar dos veces— lo
 * hace el despachador, así que una acción nueva no puede olvidarse de ninguna de
 * esas tres cosas.
 */
interface Resolution {
	/** A qué rama le paga esta acción. */
	readonly family: SkillFamily;
	/** Cuánta experiencia deja. */
	readonly xp: number;
	/**
	 * Dónde termina el piloto, o `null` si **no se mueve**. Minar y refinar
	 * ocurren donde estás parado, y la diferencia tiene que poder decirse.
	 */
	readonly movesTo: number | null;
	/**
	 * Lo que la acción produjo, para que el informe pueda contarlo.
	 *
	 * Viajar no produce nada y lo deja vacío; minar deja lo que trajo. Va como
	 * dato y no como texto armado: el informe lo dibuja la capa de vista, que es
	 * la que sabe cómo se escriben las cosas en pantalla.
	 */
	readonly result?: ActionResult;
}

/** Lo que una acción produjo, tal como se guarda en el informe. */
export interface ActionResult {
	readonly mined?: { readonly ore: string; readonly units: number; readonly cycles: number };
	/** El trato que quedó acordado: qué se publicó, cuánto y a cuánto. */
	readonly deal?: {
		readonly kind: string;
		readonly item: string;
		readonly units: number;
		readonly price: number;
	};
	/** La lectura que quedó del cinturón, con qué tan fina salió. */
	readonly survey?: { readonly depth: number };
	/**
	 * Qué distancia se cruzó. **Cruzar no cuesta nada más que el rato.**
	 *
	 * El combustible salió de acá con el cobro y el campo no vuelve: los informes
	 * viejos lo tienen guardado en su JSON y la bitácora los sigue leyendo, que es
	 * lo correcto —contaron lo que pasó el día que pasó—.
	 */
	readonly jump?: { readonly tenths: number };
}

/** Cómo se resuelve una clase de acción, una vez que la fila ya es nuestra. */
type Resolver = (tx: Db, row: Pilot, claimed: PilotAction) => Resolution;

/**
 * Viajar: el piloto queda en el destino y la experiencia va a Pilotaje.
 *
 * La experiencia va al **pozo de la rama** y no a la habilidad que se usó. Es lo
 * que convierte especializarse en una decisión: el que viaja junta Pilotaje y
 * después elige si lo gasta en Navegación o en abrir otra cosa. Ver
 * docs/systems/SKILLS.md.
 */
const resolveTravel: Resolver = (_tx, _row, claimed) => ({
	family: TRAVEL_FAMILY,
	xp: actionXpPool(claimed.durationSeconds / 60),
	movesTo: claimed.destinationBodyId
});

/**
 * Saltar: el piloto aparece del otro lado y la experiencia va a Pilotaje.
 *
 * **Cruzar no cuesta nada.** La puerta hace el trabajo: no se quema combustible,
 * no se pide alcance y nada puede fallar al resolver por falta de insumo. Antes
 * se cobraba acá y no al encargar —porque entre la orden y su vencimiento la nave
 * podía cambiar de masa—, y con el cobro se fue también ese cuidado.
 *
 * Lo único que sigue pudiendo devolver al piloto donde estaba es que la nave o el
 * destino ya no existan, que no es una regla sino una defensa.
 */
const resolveJump: Resolver = (tx, row, claimed) => {
	const quieto = { family: TRAVEL_FAMILY, xp: 0, movesTo: null };
	if (claimed.destinationBodyId === null) return quieto;

	const origen = getBodyById(tx, claimed.originBodyId ?? row.locationId);
	const destino = getBodyById(tx, claimed.destinationBodyId);
	if (!origen || !destino) return quieto;

	const puerta = tx.select().from(gate).where(eq(gate.bodyId, origen.id)).get();

	return {
		family: TRAVEL_FAMILY,
		xp: actionXpPool(claimed.durationSeconds / 60),
		movesTo: destino.id,
		result: { jump: { tenths: puerta?.jumpDistance ?? 0 } }
	};
};

/**
 * Minar: el piloto no se mueve, la carga entra a la bodega y la experiencia va a
 * Extracción.
 *
 * **Lo que sale se recalcula al resolver**, no se guarda al encargar. Entre que
 * la orden se dio y venció, otro piloto pudo llevarse lo que quedaba y la bodega
 * pudo cambiar de tamaño: el botín es lo que el cinturón puede dar hoy, acotado
 * por lo que los ciclos trabajados alcanzan a sacar. Prometer al encargar lo que
 * el mundo no puede cumplir al entregar es peor que traer menos.
 */
const resolveMine: Resolver = (tx, row, claimed) => {
	const readout = shipReadout(tx, row);
	const nave = activeShip(tx, row.id);
	const vacio = { family: MINING_FAMILY, xp: 0, movesTo: null };
	if (!readout || !nave) return vacio;

	const roca = claimed.asteroidId === null ? null : getAsteroid(tx, claimed.asteroidId);
	if (!roca) return vacio;

	const ore = getOre(roca.oreCode);
	const bodega = shipContainer(tx, nave.id);
	const hold = cargoHold(tx, bodega.id, readout.cargo);

	// Lo que los ciclos trabajados alcanzan a sacar, contra lo que entra y lo que
	// queda: el mínimo de los tres es lo que el piloto se lleva de verdad.
	const seconds = Math.max(1, cycleSeconds(ore));
	const cycles = Math.max(1, floorDiv(claimed.durationSeconds, seconds));
	const porCiclo = Math.max(
		1,
		floorDiv(yieldPerCycleTenths(readout.miningPerHour), ore.volumeTenths)
	);

	const posible = Math.min(cycles * porCiclo, fitsUnits(hold.freeTenths, ore.code));
	const units = takeFromAsteroid(tx, roca.id, posible);
	if (units > 0) moveItem(tx, bodega.id, ore.code, units, 'mined');

	return {
		family: MINING_FAMILY,
		xp: actionXpPool(claimed.durationSeconds / 60),
		movesTo: null,
		result: { mined: { ore: ore.code, units, cycles } }
	};
};

/**
 * El registro de resolvedores, uno por clase de acción.
 *
 * Está tipado contra `ActionKind`, así que agregar una clase sin su resolvedor
 * no compila. Es la única forma de que el despachador no se olvide de nada.
 */
/**
 * Acordar una orden: no se mueve nada, la orden abre sola y la experiencia va a
 * Comercio.
 *
 * **La orden ya existe y ya abrió** cuando esto corre: se escribió al encargar,
 * con su garantía tomada y su fecha de apertura puesta, y el reloj la hizo
 * visible. Acá sólo se cobra lo que el trato enseñó.
 *
 * Si la orden no está, es porque el piloto la canceló mientras se acordaba. No es
 * un error: es que se arrepintió, y entonces no hay nada que aprender.
 */
const resolvePublish: Resolver = (tx, _row, claimed) => {
	const vacio = { family: TRADE_FAMILY, xp: 0, movesTo: null };
	if (claimed.orderId === null) return vacio;

	const orden = tx.select().from(marketOrder).where(eq(marketOrder.id, claimed.orderId)).get();
	if (!orden) return vacio;

	const valor = orden.price * orden.initialQuantity;
	return {
		family: TRADE_FAMILY,
		xp: actionXpPool(claimed.durationSeconds / 60, dealFactorTenths(valor) / 10),
		movesTo: null,
		result: {
			deal: {
				kind: orden.kind,
				item: orden.itemCode,
				units: orden.initialQuantity,
				price: orden.price
			}
		}
	};
};

/**
 * Escanear: el piloto no se mueve, queda una lectura del cinturón y la
 * experiencia va a Ciencias.
 *
 * **La profundidad se recalcula al resolver**, no se guarda al encargar: entre
 * que se dio la orden y terminó, el piloto pudo subir Escaneo, y lo que queda
 * escrito tiene que ser lo que se vio de verdad.
 */
const resolveSurvey: Resolver = (tx, row, claimed) => {
	const vacio = { family: SURVEY_FAMILY, xp: 0, movesTo: null };
	if (claimed.asteroidId === null) return vacio;

	const plan = surveyPlan(tx, row);
	recordSurvey(tx, row.id, claimed.asteroidId, plan.depth);

	return {
		family: SURVEY_FAMILY,
		xp: actionXpPool(claimed.durationSeconds / 60, SURVEY_DIFFICULTY),
		movesTo: null,
		result: { survey: { depth: plan.depth } }
	};
};

const RESOLVERS: Readonly<Record<ActionKind, Resolver>> = {
	travel: resolveTravel,
	jump: resolveJump,
	mine: resolveMine,
	publish: resolvePublish,
	survey: resolveSurvey
};

/** La acción en curso del piloto, o `null` si no tiene ninguna. */
export function currentAction(db: Db, pilotId: number): PilotAction | null {
	return db.select().from(pilotAction).where(eq(pilotAction.pilotId, pilotId)).get() ?? null;
}

/**
 * Ordena viajar a `destination`. Falla si ya hay una orden en curso.
 *
 * Defensa en profundidad: la interfaz ya bloquea el botón sin nave, pero el
 * servicio no confía sólo en eso — nadie más que él escribe en la base.
 */
export function startTravel(db: Db, row: Pilot, destination: Body): PilotAction {
	// Quién puede dar una orden lo decide un solo lugar, y no cada pantalla por
	// su cuenta: ver ../game/status.
	const now = situation(db, row);
	if (!now.canOrder) throw new ActionError(now.orderBlocked);

	// La hoja de rendimiento de su nave: de ahí salen la velocidad de warp y la
	// alineación, y de paso dice si tiene nave. Es la misma calculadora que
	// muestra la pantalla, así que el viaje tarda exactamente lo que la ficha
	// promete.
	const readout = shipReadout(db, row);
	if (readout === null) throw new ActionError('Necesitás una nave para viajar.');
	if (!readout.flyable) throw new ActionError('Tu nave no está en condiciones de volar.');
	if (destination.id === row.locationId) throw new ActionError('Ya estás ahí.');

	// Viajar es dentro del sistema; entre sistemas se salta por una puerta. Sin
	// esta guarda, un pedido armado a mano con un cuerpo de otro sistema hace
	// estallar `bodyDistance` con un error que el form action no atrapa, y al
	// jugador le sale un 500 en vez de un motivo.
	const origin = getBodyById(db, row.locationId);
	if (origin && destination.systemId !== origin.systemId) {
		throw new ActionError('Ese cuerpo está en otro sistema.');
	}

	const distance = bodyDistance(db, row.locationId, destination.id);
	// La hoja entera entra como nave de viaje: trae los dos números que la
	// duración necesita y ninguno se copia por el camino.
	const duration = travelDurationSeconds(distance, readout);

	return db
		.insert(pilotAction)
		.values({
			pilotId: row.id,
			kind: TRAVEL_KIND,
			durationSeconds: duration,
			originBodyId: row.locationId,
			destinationBodyId: destination.id
		})
		.returning()
		.get();
}

/**
 * Ordena cruzar la puerta donde está parado el piloto.
 *
 * **Se salta desde la puerta**, no desde cualquier lado: hay que haber viajado
 * hasta ella primero. Eso es lo que hace que su distancia orbital importe —una
 * puerta lejos de la estrella cuesta un viaje largo antes del salto— y lo que
 * ata el mapa de adentro del sistema con el de la galaxia.
 *
 * Todo lo que impide saltar lo decide `jumpProblem`, que es puro y lo comparte la
 * pantalla: así el botón que se apaga y el servicio que rechaza dicen exactamente
 * lo mismo, y el jugador nunca aprieta algo que va a rebotar.
 */
export function startJump(db: Db, row: Pilot): PilotAction {
	const now = situation(db, row);
	if (!now.canOrder) throw new ActionError(now.orderBlocked);

	const origen = getBodyById(db, row.locationId);
	if (!origen || origen.kind !== 'gate') {
		throw new ActionError('Para saltar hay que estar en una puerta estelar.');
	}

	const readout = shipReadout(db, row);
	const nave = activeShip(db, row.id);
	if (readout === null || nave === null) throw new ActionError('Necesitás una nave para saltar.');

	const puerta = db.select().from(gate).where(eq(gate.bodyId, origen.id)).get();
	const destino =
		puerta && puerta.destinationId !== null ? getBodyById(db, puerta.destinationId) : null;

	const problema = jumpProblem(
		{ flyable: readout.flyable },
		destino && puerta ? puerta.jumpDistance : null,
		puerta?.closed ?? false
	);
	if (problema) throw new ActionError(problema);

	return db
		.insert(pilotAction)
		.values({
			pilotId: row.id,
			kind: JUMP_KIND,
			// Lo que tarda es cosa de la puerta: la misma puerta tarda lo mismo para
			// todos, y montar un calibrador no la acorta.
			durationSeconds: jumpSeconds(puerta!.jumpDistance),
			originBodyId: origen.id,
			destinationBodyId: destino!.id
		})
		.returning()
		.get();
}

/**
 * Ordena extraer un mineral en el cinturón donde está el piloto.
 *
 * La duración sale del plan, que mira la nave, la bodega y lo que queda en el
 * cinturón. Así la orden tarda exactamente lo que la pantalla prometió, que es la
 * misma regla que ya cumple viajar.
 */
export function startMining(db: Db, row: Pilot, asteroidId: number): PilotAction {
	const now = situation(db, row);
	if (!now.canOrder) throw new ActionError(now.orderBlocked);
	if (!isBelt(db, row.locationId)) throw new ActionError('Acá no hay nada que extraer.');

	const readout = shipReadout(db, row);
	if (readout === null) throw new ActionError('Necesitás una nave para extraer.');
	if (!readout.flyable) throw new ActionError('Tu nave no está en condiciones de trabajar.');

	const roca = getAsteroid(db, asteroidId);
	if (!roca || roca.bodyId !== row.locationId) {
		throw new ActionError('Esa roca no está acá.');
	}
	// **Hay que haberla leído.** Sin lectura vigente no se sabe de qué es ni cuánto
	// tiene, y encenderle el láser a una piedra desconocida es apostar. Es lo que
	// le da trabajo al escáner.
	if (!hasFreshSurvey(db, row.id, asteroidId)) {
		throw new ActionError(
			'Hay que escanear la roca antes de extraer: sin lectura no se sabe qué contiene.'
		);
	}

	const plan = miningPlan(db, row, asteroidId);
	if (plan.blocked) throw new ActionError(plan.blocked);

	return db
		.insert(pilotAction)
		.values({
			pilotId: row.id,
			kind: MINE_KIND,
			durationSeconds: plan.durationSeconds,
			originBodyId: row.locationId,
			// Minar no se mueve de lugar: por eso el destino queda nulo.
			destinationBodyId: null,
			targetCode: plan.ore,
			asteroidId
		})
		.returning()
		.get();
}

/**
 * Hace que la orden en curso venza ahora mismo. **Herramienta de pruebas.**
 *
 * **No resuelve nada**, y ahí está toda la gracia: le corre el arranque hacia
 * atrás lo que dura, y después la resuelve `resolveIfDue` por el camino de
 * siempre. Así el resultado es **idéntico** al de haber esperado —el mismo
 * informe, la misma experiencia, el mismo movimiento— en vez de ser un segundo
 * camino que hay que mantener al día y que un día va a dar otra cosa.
 *
 * Devuelve la orden que quedó vencida, o `null` si no había ninguna. Quien
 * llama se encarga de comprobar que tenga la llave: acá no se sabe de permisos.
 */
export function rushAction(db: Db, row: Pilot): PilotAction | null {
	const pending = currentAction(db, row.id);
	if (pending === null) return null;

	return db
		.update(pilotAction)
		.set({ startedAt: new Date(Date.now() - pending.durationSeconds * 1000) })
		.where(and(eq(pilotAction.id, pending.id), eq(pilotAction.pilotId, row.id)))
		.returning()
		.get();
}

/**
 * Si la orden en curso ya venció, la aplica y la borra.
 *
 * Aplicar el resultado, depositar la experiencia, escribir el informe y borrar la
 * fila pasa en la misma transacción: a mitad de camino dejaría una orden fantasma
 * o un piloto que terminó sin haber cobrado nada.
 *
 * **Se resuelve exactamente una vez.** La transacción empieza por quedarse con la
 * fila —un borrado condicional que devuelve lo que borró— y sólo el que se la
 * lleva reparte el botín. Dos consultas simultáneas entregarían el premio dos
 * veces si primero leyeran y después borraran.
 */
export function resolveIfDue(db: Db, row: Pilot): ActionReport | null {
	const pending = currentAction(db, row.id);
	if (pending === null) return null;

	const due = new Date(pending.startedAt.getTime() + pending.durationSeconds * 1000);
	if (new Date() < due) return null;

	// Se busca el resolvedor **antes** de reclamar la fila. Un `kind` que este
	// código no conoce es una orden de una versión más nueva, y perderla sería
	// peor que dejarla esperando: el piloto queda trabado hasta que el juego sepa
	// resolverla, pero no se le borra nada.
	const resolve = RESOLVERS[pending.kind as ActionKind];
	if (!resolve) return null;

	return db.transaction((tx) => {
		// Quedarse con la fila es lo primero: si otro llegó antes, no hay nada que
		// aplicar y la respuesta correcta es que ya estaba resuelta.
		const claimed = tx
			.delete(pilotAction)
			.where(and(eq(pilotAction.id, pending.id), eq(pilotAction.pilotId, row.id)))
			.returning()
			.get();
		if (!claimed) return null;

		const outcome = resolve(tx, row, claimed);

		// Sólo se mueve el que se mueve. Minar ocurre donde estás parado.
		if (outcome.movesTo !== null) {
			tx.update(pilot).set({ locationId: outcome.movesTo }).where(eq(pilot.id, row.id)).run();
		}

		const { before, after } = deposit(tx, row.id, outcome.family, outcome.xp);
		const depositado: PoolDeposit = {
			family: outcome.family,
			familyName: skillFamilyLabel(outcome.family),
			xp: outcome.xp,
			before,
			after
		};

		const origin = tx.select().from(body).where(eq(body.id, claimed.originBodyId)).get();
		// Puede no haberlo: minar y refinar ocurren donde estás parado.
		const destination =
			claimed.destinationBodyId === null
				? undefined
				: tx.select().from(body).where(eq(body.id, claimed.destinationBodyId)).get();

		// El informe va en la misma transacción que el resultado: si se aplicó la
		// acción y se depositó la experiencia, la bitácora tiene que decirlo. Un
		// informe perdido es una acción que el jugador no sabe que ocurrió.
		const recorded = recordEntry(tx, row.id, {
			kind: claimed.kind,
			durationSeconds: claimed.durationSeconds,
			originBodyId: claimed.originBodyId,
			destinationBodyId: claimed.destinationBodyId,
			deposit: depositado,
			result: outcome.result ?? {}
		});

		return {
			id: recorded.id,
			kind: claimed.kind,
			originName: origin?.name ?? '',
			destinationName: destination?.name ?? '',
			durationSeconds: claimed.durationSeconds,
			deposit: depositado
		};
	});
}

/**
 * Encarga acordar una orden del mercado.
 *
 * La orden se escribe **ahora** —con su garantía tomada y su fecha de apertura
 * puesta más adelante— y la acción sólo la acompaña. Es al revés de lo que
 * parece: si la orden se creara al resolver, la plata o la mercadería quedarían
 * libres mientras se negocia y el piloto podría comprometerlas dos veces.
 *
 * Cancelar la orden mientras se acuerda cancela también la acción: retirarse de
 * un trato no es una negociación, es decir que no.
 */
export function startPublish(
	db: Db,
	row: Pilot,
	spec: {
		kind: 'buy' | 'sell';
		itemCode: string;
		quantity: number;
		price: number;
		stationId: number;
		days?: number;
		rangeRegions?: number;
		from?: ContainerKind;
	}
): PilotAction {
	const now = situation(db, row);
	if (!now.canOrder) throw new ActionError(now.orderBlocked);
	if (now.stationId === null)
		throw new ActionError('Hay que estar atracado para acordar una orden.');

	return db.transaction((tx) => {
		const orden =
			spec.kind === 'sell'
				? placeSellOrder(tx, row, { ...spec, delaySeconds: PUBLISH_SECONDS })
				: placeBuyOrder(tx, row, { ...spec, delaySeconds: PUBLISH_SECONDS });

		return tx
			.insert(pilotAction)
			.values({
				pilotId: row.id,
				kind: PUBLISH_KIND,
				durationSeconds: PUBLISH_SECONDS,
				originBodyId: row.locationId,
				// Acordar no mueve al piloto de lugar.
				destinationBodyId: null,
				targetCode: spec.itemCode,
				orderId: orden.id
			})
			.returning()
			.get();
	});
}

/**
 * Encarga leer el cinturón donde está el piloto.
 *
 * Es corta y no mueve nada, pero ocupa el turno igual que cualquier otra: mirar
 * también lleva tiempo, y que compita con extraer es lo que hace que explorar sea
 * una decisión y no un botón gratis.
 */
export function startSurvey(db: Db, row: Pilot, asteroidId: number): PilotAction {
	const now = situation(db, row);
	if (!now.canOrder) throw new ActionError(now.orderBlocked);
	if (!isBelt(db, row.locationId)) throw new ActionError('Acá no hay nada que escanear.');

	const roca = getAsteroid(db, asteroidId);
	if (!roca || roca.bodyId !== row.locationId) {
		throw new ActionError('Esa roca no está acá.');
	}

	const plan = surveyPlan(db, row);
	if (plan.blocked) throw new ActionError(plan.blocked);

	return db
		.insert(pilotAction)
		.values({
			pilotId: row.id,
			kind: SURVEY_KIND,
			durationSeconds: plan.durationSeconds,
			originBodyId: row.locationId,
			// Escanear ocurre donde estás parado: por eso el destino queda nulo.
			destinationBodyId: null,
			targetCode: null,
			asteroidId
		})
		.returning()
		.get();
}

/**
 * Lo que la pestaña Ubicación necesita saber del lugar donde está el piloto.
 *
 * Igual que el constructor de la ficha del piloto: recibe lo que hay en la base
 * y devuelve lo que la pantalla dibuja. Las tres piezas —el mosaico, los agentes
 * y la ficha— se arman por separado para poder probarlas por separado.
 */

import { eq } from 'drizzle-orm';
import { body, gate, system as systemTable, type Body, type Pilot } from '../db/schema';
import { railsFor } from '$lib/tree';
import { describeSystem } from '$lib/descriptions';
import { systemDescriptions } from './descriptions';
import type { Db } from '../db/types';
import { currentAction } from '../services/actions';
import { beltDeposits, miningPlan, miningSource } from '../services/mining';
import { asteroidsAt } from '../services/asteroids';
import { surveyPlan, surveysOf } from '../services/prospecting';
import { activeShip, pilotSkillLevels, shipFit, shipReadout } from '../services/ships';
import { situation } from '../services/status';
import { NADIE, pilotsAt } from '../services/presence';
import { SURVEY_REFINE_SKILL, SURVEY_SKILL, depthLabel, surveyAge } from '$lib/game/prospecting';
import {
	grantingModules,
	hullGrant,
	leversFor,
	type Fitted,
	type Lever,
	type Need
} from '$lib/game/sourcing';
import { getSkill } from '$lib/game/skills';
import { getProfession } from '$lib/game/professions';
import type { SkillLevels } from '$lib/game/fitting';
import type { BonusTarget, Hull } from '$lib/game/hulls';
import {
	bodyDetail,
	bodyDistance,
	getBodyById,
	systemOverview,
	systemTree,
	type AgentInfo,
	type BodyDetail,
	type SystemNode
} from '../services/universe';
import {
	JUMP_KIND,
	REFERENCE_SHIP,
	travelDurationSeconds,
	type TravelShip
} from '$lib/game/actions';
import { hopsFrom } from '$lib/game/galaxy';
import { buildGalaxyMap, neighbourhood } from './galaxy';
import { FREE_SPACE } from '$lib/filters';
import { FACTIONS } from '$lib/game/factions';
import { baseValueOf, getOre } from '$lib/game/items';
import { roundHalfEven } from '$lib/game/math';
import { MAX_LEVEL } from '$lib/game/progression';
import { jumpProblem, jumpSeconds, lightYears } from '$lib/game/jumps';
import { canBeHired, requiredReputation } from '$lib/game/reputation';
import { NO_STANDINGS, pilotStandings, type PilotStandings } from '../services/reputation';
import {
	SECURITY_LEVELS,
	SERVICES,
	SERVICE_ORDER,
	securityLevel,
	threatLevel,
	type SecurityLevel,
	type StationServiceKind
} from '$lib/game/universe';
import {
	actionIcon,
	actionLabel,
	bearingLabel,
	bodyKindIcon,
	bodyKindLabel,
	threatLabel,
	threatNote,
	corporationKindLabel,
	cubicMeters,
	explorationIcon,
	explorationLabel,
	governmentLabel,
	itemIcon,
	missionKindIcon,
	missionKindLabel,
	remainingLabel,
	roman,
	securityLabel,
	serviceIcon,
	serviceLabel,
	thousands
} from '$lib/format';
import type {
	Aparato,
	ConsultaGalaxia,
	Galaxia,
	NodoGalaxia,
	Orbita,
	PilotoEnElMapa,
	SalidaGalaxia,
	Lectura,
	Palanca,
	Procedencia,
	PuntaTramo,
	SalidaPuerta,
	Tramo,
	BaldosaModulo,
	FilaAgente,
	FilaCuerpo,
	CampoRocas,
	Riesgo,
	Roca,
	Sistema,
	Ubicacion
} from '$lib/tipos';

/** En qué sistema está ese cuerpo, por código. Vacío si no se lo encuentra. */
function sistemaDelCuerpo(db: Db, bodyId: number): string | null {
	const cuerpo = db.select().from(body).where(eq(body.id, bodyId)).get();
	if (!cuerpo) return null;
	return (
		db.select().from(systemTable).where(eq(systemTable.id, cuerpo.systemId)).get()?.code ?? null
	);
}

/** Nombre de la facción dueña, o el rótulo de las que no tienen bandera. */
function factionName(code: string): string {
	return FACTIONS[code as keyof typeof FACTIONS]?.name ?? 'Sin bandera';
}

/**
 * Los ocho módulos posibles, marcando cuáles tiene esta estación.
 *
 * Se muestran también los que faltan: es lo que deja leer de un vistazo qué
 * clase de estación es ésta.
 */
export function buildModuleTiles(
	services: readonly StationServiceKind[]
): readonly BaldosaModulo[] {
	const instalados = new Set(services);
	return Object.entries(SERVICES).map(([code, spec]) => ({
		code,
		name: spec.name,
		icon: serviceIcon(code as StationServiceKind),
		summary: spec.summary,
		available: instalados.has(code as StationServiceKind)
	}));
}

/**
 * Los agentes de la estación, con lo que hace falta para que atiendan.
 *
 * Los que todavía no atienden también salen: son la escalera que el piloto tiene
 * por delante, y esconderlos sería más prolijo y mucho peor.
 */
export function buildAgentRows(
	agents: readonly AgentInfo[],
	reputation: PilotStandings = NO_STANDINGS
): readonly FilaAgente[] {
	return agents.map(({ agent, corporation }) => {
		const faction = corporation.faction;
		const name = faction ? factionName(faction) : 'Sin bandera';
		const needed = requiredReputation(agent.level, faction);
		// Las dos escaleras que pueden abrirlo: la suya y la de su bandera.
		const suya = reputation.corporations[corporation.code] ?? 0;
		const deLaBandera = faction ? (reputation.factions[faction] ?? 0) : 0;
		return {
			code: agent.code,
			name: agent.name,
			corporation: corporation.name,
			// Para poder abrir su ficha desde la tarjeta: de quién es un agente es la
			// mitad de lo que hace falta saber antes de pedirle trabajo.
			corporationCode: corporation.code,
			faction: name,
			kind: missionKindLabel(agent.missionKind),
			kindIcon: missionKindIcon(agent.missionKind),
			level: roman(agent.level),
			description: agent.description,
			open: canBeHired(agent.level, faction, suya, deLaBandera),
			// Las dos puertas, dichas: con la corporación alcanza para los suyos, y
			// con la bandera se abren los de todas las corporaciones que la llevan.
			requirement: `Requiere ${needed} de reputación con ${corporation.name} o con ${name}`
		};
	});
}

/**
 * Una punta del tramo, con el sistema donde está.
 *
 * El sistema viaja en las dos puntas porque en un salto son distintos, y ésa es
 * toda la gracia del salto. Va con bandera, gobierno y ley porque mientras la
 * nave está en camino **no hay ninguna otra pantalla que lo diga**: la ficha del
 * lugar se apaga en tránsito, y justo ahí es cuando uno quiere saber a qué está
 * entrando.
 */
function punta(db: Db, cuerpo: Body | null): PuntaTramo {
	if (!cuerpo) {
		return {
			name: '',
			kindLabel: '',
			icon: 'map-pin',
			system: '',
			faction: '',
			security: '',
			government: ''
		};
	}

	const suyo = db.select().from(systemTable).where(eq(systemTable.id, cuerpo.systemId)).get();

	return {
		name: cuerpo.name,
		kindLabel: bodyKindLabel(cuerpo.kind),
		icon: bodyKindIcon(cuerpo.kind),
		system: suyo?.name ?? '',
		faction: suyo
			? suyo.controllingFaction
				? factionName(suyo.controllingFaction)
				: 'Sin bandera'
			: '',
		security: suyo ? `${securityLabel(securityLevel(suyo.security))} ${suyo.security}` : '',
		government: suyo ? governmentLabel(suyo.government) : ''
	};
}

/**
 * Lo que muestra la pestaña mientras la nave está en camino.
 *
 * **Dice de dónde a dónde y cuánto falta.** No puede decir dónde está —no está en
 * ningún lado— pero un cartel que sólo dice «esperá» es una pantalla que no sirve
 * para nada, y el viaje es justo el momento en que uno la mira para ver cuánto
 * queda.
 */
function transit(db: Db, row: Pilot): Ubicacion {
	const orden = currentAction(db, row.id);
	const origen = orden?.originBodyId ? getBodyById(db, orden.originBodyId) : null;
	const destino = orden?.destinationBodyId ? getBodyById(db, orden.destinationBodyId) : null;

	// La distancia sólo existe si esto es un salto: la de un viaje dentro del
	// sistema ya la dice el árbol. Se vuelve a leer acá en vez de guardarse en la
	// orden porque es un dato de la puerta y no del viaje, y guardarlo sería tener
	// dos copias que pueden desfasarse.
	const puerta =
		orden?.kind === JUMP_KIND && origen
			? db.select().from(gate).where(eq(gate.bodyId, origen.id)).get()
			: undefined;

	const leg: Tramo | null = orden
		? {
				kind: orden.kind,
				kindLabel: actionLabel(orden.kind),
				icon: actionIcon(orden.kind),
				origin: punta(db, origen),
				destination: punta(db, destino),
				startedAt: orden.startedAt.getTime(),
				durationSeconds: orden.durationSeconds,
				duration: remainingLabel(orden.durationSeconds),
				distance: puerta ? lightYears(puerta.jumpDistance) : ''
			}
		: null;

	return {
		name: destino ? `Rumbo a ${destino.name}` : 'En tránsito',
		kind: leg?.kindLabel ?? 'Viaje',
		icon: leg?.icon ?? 'rocket-launch',
		description: [
			'La nave está en camino. Cuando llegue vas a poder atracar, reconfigurarla y volver a ' +
				'dar órdenes.'
		],
		risk: null,
		parent: '',
		system: '',
		systemCode: '',
		distance: '',
		exploration: '',
		isStation: false,
		inTransit: true,
		corporation: '',
		corporationCode: '',
		corporationKind: '',
		owner: '',
		modules: [],
		moduleCount: '',
		agents: [],
		agentCount: '',
		pilots: [],
		pilotCount: '',
		pilotsBeyond: 0,
		field: SIN_CAMPO,
		asteroids: [],
		gate: null,
		orbit: null,
		leg
	};
}

/**
 * Lo que muestra la pestaña cuando el piloto no está parado en ningún lado.
 *
 * Ya no se arma copiando la de tránsito: aquélla pasó a leer la orden en curso, y
 * acá no hay ninguna. Son dos vacíos distintos —ir en camino y no estar en
 * ningún lado— y uno no puede definirse como el otro.
 */
function nowhere(): Ubicacion {
	return {
		name: 'Sin ubicación',
		kind: '',
		icon: 'map-pin',
		description: [
			'No hay un cuerpo asignado a este piloto. Puede que la base no tenga universo cargado.'
		],
		risk: null,
		parent: '',
		system: '',
		systemCode: '',
		distance: '',
		exploration: '',
		isStation: false,
		inTransit: false,
		corporation: '',
		corporationCode: '',
		corporationKind: '',
		owner: '',
		modules: [],
		moduleCount: '',
		agents: [],
		agentCount: '',
		pilots: [],
		pilotCount: '',
		pilotsBeyond: 0,
		field: SIN_CAMPO,
		asteroids: [],
		gate: null,
		orbit: null,
		leg: null
	};
}

/**
 * Todo lo que la pestaña Ubicación necesita, en una sola pasada.
 *
 * Si el piloto va en camino la pestaña **no describe la estación que ya dejó
 * atrás**: describe el viaje. Mostrar el origen como si se estuviera ahí es la
 * clase de mentira que hace dudar de todo lo demás.
 */
export function buildLocationView(db: Db, row: Pilot): Ubicacion {
	const ahora = situation(db, row);
	// **Sólo viajar esconde el lugar.** Minar ocurre en el cinturón donde estás:
	// tapar la pantalla mientras trabajás sería decir que no estás en ningún lado,
	// que es falso. Lo que sí corresponde es apagar las acciones, y de eso se
	// encarga el motivo de bloqueo que viaja con cada veta.
	if (ahora.inTransit) return transit(db, row);

	const place = db.select().from(body).where(eq(body.id, row.locationId)).get();
	const detail = place ? bodyDetail(db, place.code) : null;
	if (detail === null) return nowhere();

	// El mosaico y los agentes son de la estación: en un cinturón o una luna no
	// hay ninguno de los dos, y armarlos sería mandarle al navegador ocho
	// baldosas apagadas que la pantalla no va a dibujar.
	const isStation = detail.station !== null;
	// Las rocas son del cinturón: en cualquier otro cuerpo no hay ninguna, y
	// armarlas sería consultar la base para mandar una lista vacía.
	const cinturon =
		detail.body.kind === 'belt'
			? buildBelt(db, row, ahora.orderBlocked)
			: { field: SIN_CAMPO, asteroids: [] };
	// Lo que las corporaciones de esta estación piensan del piloto, de una sola
	// consulta: es lo que decide qué agente atiende y qué agente todavía no.
	const agents = isStation ? buildAgentRows(detail.agents, pilotStandings(db, row.id)) : [];
	const abiertos = agents.filter((agent) => agent.open).length;

	// Quién más está atracado acá. **Sólo en estaciones**: en espacio abierto no hay
	// lista, hay que escanear, y eso es lo que hace que esconderse signifique algo.
	const presentes = isStation ? pilotsAt(db, detail.body.id, row.id) : NADIE;

	const lectura = systemDescriptions(db, detail.system.id).get(detail.body.id);

	return {
		name: detail.body.name,
		kind: bodyKindLabel(detail.body.kind),
		icon: bodyKindIcon(detail.body.kind),
		description: lectura?.sentences ?? [],
		risk: riskOf(detail.system.security, lectura?.atEdge ?? false, isStation),
		parent: detail.parent?.name ?? '',
		system: detail.system.name,
		systemCode: detail.system.code,
		distance: detail.body.orbitDistance ? `${detail.body.orbitDistance} ud` : '',
		exploration: explorationLabel(detail.body.explored),
		isStation,
		inTransit: false,
		corporation: detail.corporation?.name ?? '',
		corporationCode: detail.corporation?.code ?? '',
		corporationKind: detail.corporation ? corporationKindLabel(detail.corporation.kind) : '',
		owner: detail.corporation ? factionName(detail.corporation.faction) : '',
		modules: isStation ? buildModuleTiles(detail.services) : [],
		moduleCount: isStation ? `${detail.services.length} de ${Object.keys(SERVICES).length}` : '',
		agents,
		agentCount: isStation ? `${abiertos} de ${agents.length}` : '',
		pilots: presentes.pilots.map((uno) => ({
			callsign: uno.callsign,
			faction: factionName(uno.faction),
			factionColor:
				FACTIONS[uno.faction as keyof typeof FACTIONS]?.color ?? 'var(--color-text-muted)',
			profession: getProfession(uno.profession).name,
			corporation: uno.corporation
		})),
		pilotCount: isStation
			? presentes.total === 1
				? '1 piloto'
				: `${presentes.total} pilotos`
			: '',
		pilotsBeyond: Math.max(0, presentes.total - presentes.pilots.length),
		field: cinturon.field,
		asteroids: cinturon.asteroids,
		gate: buildSalida(db, row, detail.body),
		orbit: buildOrbita(db, detail),
		leg: null
	};
}

/**
 * El vecindario de un cuerpo: alrededor de qué da vueltas y qué le da vueltas.
 *
 * **Sólo para los que orbitan.** Una puerta tiene su aro, un cinturón su campo y
 * una estación su mosaico de módulos; los que no tenían nada eran justamente el
 * planeta, la luna y la estrella, que no tienen verbos: lo único que tienen para
 * decir de sí mismos es **el lugar** que ocupan.
 *
 * Una sola cuenta para los tres casos, porque son el mismo mirado desde otra
 * altura: el centro es el padre —la estrella de un planeta, el planeta de una
 * luna— y el anillo son sus hijos. Una estrella no tiene padre, así que el centro
 * es ella misma y el anillo son sus planetas: parado en una estrella, estás en el
 * centro, y el dibujo lo dice sin una palabra.
 */
function buildOrbita(db: Db, detail: BodyDetail): Orbita | null {
	const cuerpo = detail.body;
	if (cuerpo.kind !== 'planet' && cuerpo.kind !== 'moon' && cuerpo.kind !== 'star') return null;

	// Todo el sistema de una consulta: el anillo y los satélites salen los dos de
	// acá, y pedirlos por separado sería ir dos veces a buscar lo mismo.
	const todos = db.select().from(body).where(eq(body.systemId, cuerpo.systemId)).all();

	const centro = detail.parent ?? cuerpo;
	const vecino = (fila: Body) => ({
		name: fila.name,
		icon: bodyKindIcon(fila.kind),
		here: fila.id === cuerpo.id
	});

	// Por distancia y no por nombre: el anillo **es** el orden en que están, y
	// ordenarlo de otra manera dibujaría un sistema que no existe.
	const porDistancia = (a: Body, b: Body) => a.orbitDistance - b.orbitDistance;

	return {
		center: centro.name,
		centerIcon: bodyKindIcon(centro.kind),
		centerIsHere: centro.id === cuerpo.id,
		ring: todos
			.filter((fila) => fila.parentId === centro.id)
			.sort(porDistancia)
			.map(vecino),
		// Lo que te cuelga a vos. Vacío si sos el centro: ahí tus hijos ya son el
		// anillo, y dibujarlos dos veces sería contar el sistema dos veces.
		satellites:
			centro.id === cuerpo.id
				? []
				: todos
						.filter((fila) => fila.parentId === cuerpo.id)
						.sort(porDistancia)
						.map(vecino)
	};
}

/**
 * El aviso de riesgo del lugar, o ninguno.
 *
 * **Atracado no lo lleva nadie**: adentro de una estación no te ataca nadie, y
 * ponerle un cartel de peligro a un hangar sería el tipo de advertencia que
 * enseña a ignorar las advertencias. Sale sólo a cielo abierto, que es donde
 * significa algo.
 *
 * Va en su propio renglón y no adentro de la descripción: una advertencia
 * escondida en un párrafo de ambientación no la lee nadie.
 */
function riskOf(security: number, atEdge: boolean, isStation: boolean): Riesgo | null {
	if (isStation) return null;
	const nivel = threatLevel(security, atEdge);
	return { level: nivel, label: threatLabel(nivel), note: threatNote(nivel) };
}

/** Un campo apagado: acá no hay rocas ni nada que escanear. */
const SIN_VERBO: Procedencia = {
	verb: '',
	blockers: [],
	modules: [],
	levers: [],
	effects: [],
	next: []
};

const SIN_CAMPO: CampoRocas = {
	scannable: false,
	count: '',
	depthLabel: '',
	duration: '',
	regen: '',
	blocked: '',
	scanSource: SIN_VERBO,
	mineSource: SIN_VERBO
};

/**
 * Aplana el árbol en filas.
 *
 * Las guías las calcula `railsFor`, que es el mismo cálculo que usa el
 * constructor del universo: vive aparte porque es de los que se re-deducen mal.
 *
 * De paso, cada fila que no sea la del piloto lleva **su distancia desde donde
 * está el piloto** y cuánto tardaría llegar. La distancia al cuerpo que se
 * orbita no sirve para decidir nada: lo que un piloto necesita saber es cuán
 * lejos está *de él*, y ese número es además el que explica el tiempo de viaje
 * que ve al lado.
 */
export function buildBodyRows(
	db: Db,
	nodes: readonly SystemNode[],
	here: string,
	originId: number | null,
	/** La nave del piloto, de la que salen la alineación y el warp de cada fila. */
	ship: TravelShip,
	/** El cuerpo al que va la nave, si va a alguno de este sistema. */
	destinationId: number | null = null
): readonly FilaCuerpo[] {
	const filas: FilaCuerpo[] = [];
	const guias = railsFor(nodes);

	// Todas las descripciones del sistema de una vez: armarlas fila por fila sería
	// un N+1 por cuerpo, y el árbol ya se trae entero en una consulta.
	const descripciones =
		nodes.length > 0 ? systemDescriptions(db, nodes[0].body.systemId) : new Map();

	for (const [indice, node] of nodes.entries()) {
		const esAqui = node.body.code === here;

		let distance = '';
		let travelLabel = '';
		if (!esAqui && originId !== null) {
			const unidades = bodyDistance(db, originId, node.body.id);
			distance = `${thousands(unidades)} ud`;
			// Con el mismo formato que el resto del juego: «2 m 48 s» y no «168s». Es
			// el mismo número que el cartel de confirmación muestra al lado, y dos
			// formatos para el mismo dato se leen como dos datos distintos.
			travelLabel = remainingLabel(travelDurationSeconds(unidades, ship));
		}

		filas.push({
			code: node.body.code,
			name: node.body.name,
			kind: bodyKindLabel(node.body.kind),
			icon: bodyKindIcon(node.body.kind),
			depth: node.depth,
			rails: guias[indice],
			isLast: node.isLast,
			hasChildren: node.hasChildren,
			explored: node.body.explored,
			exploration: explorationLabel(node.body.explored),
			explorationIcon: explorationIcon(node.body.explored),
			distance,
			travelLabel,
			description: descripciones.get(node.body.id)?.sentences ?? [],
			isStation: node.station !== null,
			corporation: node.corporation?.name ?? '',
			corporationKind: node.corporation ? corporationKindLabel(node.corporation.kind) : '',
			owner: node.corporation ? factionName(node.corporation.faction) : '',
			services: node.services.map(serviceLabel).sort(),
			isHere: esAqui,
			isDestination: destinationId !== null && node.body.id === destinationId
		});
	}

	return filas;
}

/**
 * Lo que hay del otro lado de una puerta, cuánto tarda y si se puede cruzar.
 *
 * **Todo se calcula antes de apretar.** Cruzar no cuesta nada ni pide alcance
 * —la puerta hace el trabajo y tarda lo mismo para cualquier nave—, así que lo
 * que hay para saber antes es adónde lleva, cuánto lleva y por qué no se puede.
 * El motivo sale de `jumpProblem`, que es puro y lo comparte el servicio: el
 * botón apagado y el rechazo del servidor dicen exactamente lo mismo.
 */
function buildSalida(db: Db, row: Pilot, cuerpo: Body): SalidaPuerta | null {
	if (cuerpo.kind !== 'gate') return null;

	const puerta = db.select().from(gate).where(eq(gate.bodyId, cuerpo.id)).get();
	if (!puerta) return null;

	const gemela = puerta.destinationId === null ? null : getBodyById(db, puerta.destinationId);
	const suSistema = gemela
		? db.select().from(systemTable).where(eq(systemTable.id, gemela.systemId)).get()
		: null;

	const readout = shipReadout(db, row);

	const tenths = gemela ? puerta.jumpDistance : null;

	const problema =
		readout === null
			? 'Necesitás una nave para saltar.'
			: jumpProblem({ flyable: readout.flyable }, tenths, puerta.closed);

	// El tiempo se muestra **aunque no se pueda cruzar**: es lo que dice si vale la
	// pena arreglar lo que falta, y un panel en blanco con un «no podés» no dice
	// nada. Sale de la distancia de la puerta y de nada más.
	const segundos = tenths === null ? 0 : jumpSeconds(tenths);

	return {
		bearing: puerta.bearing,
		bearingLabel: bearingLabel(puerta.bearing),
		closed: puerta.closed,
		destination: suSistema?.name ?? '',
		arrival: gemela?.name ?? '',
		distance: tenths === null ? '' : lightYears(tenths),
		seconds: segundos,
		duration: segundos > 0 ? remainingLabel(segundos) : '',
		blocked: problema ?? '',
		source: fuenteDeLaPuerta(problema)
	};
}

/**
 * De dónde sale cruzar una puerta: de la puerta.
 *
 * **No usa `fuenteDeVerbo` porque no hay nada que ese constructor pueda contar.**
 * Cruzar no pide ningún módulo montado —la puerta hace el trabajo— y ninguna
 * habilidad lo mejora: no hay aparato, no hay llave y no hay palanca. Un aviso
 * que igual nombrara el motor de salto o Astrogación estaría mandando a comprar
 * y a entrenar cosas que no cambian nada de este verbo, que es peor que no decir
 * nada.
 *
 * Lo que sí queda es la mitad que importa cuando el botón está apagado: **por qué
 * no se puede**.
 */
function fuenteDeLaPuerta(problema: string | null): Procedencia {
	return {
		verb: 'Saltar',
		blockers: problema ? [problema] : [],
		modules: [],
		levers: [],
		effects: [],
		next: []
	};
}

/** Lo que muestra la pestaña Sistema cuando no hay universo sembrado. */
function uncharted(): Sistema {
	return {
		name: 'Sin cartografiar',
		description: ['La base no tiene universo cargado. Corré `npm run db:seed` para sembrarlo.'],
		region: '',
		constellation: '',
		controlledBy: '',
		government: '',
		security: '',
		coordinates: '',
		bodyCount: '',
		stationCount: '',
		exploredCount: '',
		bodies: [],
		hasShip: false,
		actionInProgress: false,
		travelSource: SIN_VERBO
	};
}

/**
 * Lo que pide viajar, en un solo lugar.
 *
 * Está acá arriba y no escrito en cada constructor porque **las dos pantallas que
 * ofrecen el verbo tienen que pedir lo mismo**: el árbol del sistema y el mapa.
 * Dos copias de una lista de requisitos son dos que se desfasan, y la que se
 * desfasa miente en una sola de las dos pantallas, que es la forma más cara de
 * mentir.
 *
 * No es un requisito duro: los propulsores son un atributo del casco desde que
 * los internos esenciales dejaron de ser módulos. Sigue declarado porque **la
 * cadena se muestra igual cuando está completa**: el aviso dice de dónde sale el
 * número y qué auxiliar lo mejora, que es lo que el piloto mira antes de comprar.
 *
 * Saltar no tiene lista: cruzar una puerta no pide ninguna pieza montada. Lo
 * suyo lo arma `fuenteDeLaPuerta`.
 */
const NEEDS_TRAVEL: readonly Need[] = [{ grant: 'thrust', label: 'Propulsores' }];

/**
 * Lo que un verbo pide, escrito: qué pieza, de dónde sale y qué la mejora.
 *
 * **Lo que el casco trae de fábrica no es una carencia.** Mientras esto resolvía
 * los requisitos sólo contra los módulos montados, una nave recién salida del
 * astillero leía «Falta: Propulsores» y —peor— se le escondían la velocidad y el
 * alcance, porque los efectos sólo se prometen con todo puesto. Ahora la pieza
 * dice de dónde sale: del casco, de un módulo, o de ninguno de los dos.
 *
 * El auxiliar viaja **aparte del casco** y no pisándolo: el propulsor auxiliar
 * suma encima de los propulsores de fábrica, no los reemplaza, y decir sólo el
 * módulo dejaría al piloto creyendo que sin él la nave no se mueve.
 */
function aparatos(hull: Hull, fitted: readonly Fitted[]): Aparato[] {
	return fitted.map((uno) => {
		const montado = uno.module?.name ?? '';
		// Del casco: el módulo que haya, si hay alguno, es la mejora y no la fuente.
		if (hullGrant(hull, uno.need.grant) > 0) {
			return {
				requirement: uno.need.label,
				source: 'hull' as const,
				name: hull.name,
				upgrade: montado,
				fitted: true
			};
		}
		return aparatoDeModulo(uno.need.label, montado);
	});
}

/**
 * Una pieza que sólo puede venir de un módulo montado: el escáner, el láser.
 *
 * Ningún casco viene con uno puesto, así que acá sí «falta» quiere decir que hay
 * que comprarlo. Es el caso contrario al de los propulsores y por eso se escribe
 * aparte: mezclarlos en una función con un `if` de dos modos sería juntar dos
 * reglas distintas en un archivo, y el que llegue después tendría que entender
 * las dos para tocar una.
 */
function aparatoDeModulo(requirement: string, name: string): Aparato {
	return {
		requirement,
		source: name === '' ? 'missing' : 'module',
		name,
		upgrade: '',
		fitted: name !== ''
	};
}

/**
 * Las habilidades de un verbo, escritas: nombre, nivel y si se tiene.
 *
 * **Las que faltan salen igual, con un guion.** Mostrar sólo las entrenadas
 * convertiría la línea en un adorno: la que no está es justamente la que dice qué
 * entrenar, y es la mitad útil del renglón.
 */
function palancas(levers: readonly Lever[]): Palanca[] {
	return levers.map((lever) => ({
		name: lever.name,
		level: lever.level > 0 ? roman(lever.level) : '',
		known: lever.level > 0
	}));
}

/**
 * Qué daría el próximo nivel de cada palanca, de la más floja a la más alta.
 *
 * Sirve para cualquier verbo movido por porcentajes y por eso no vive dentro de
 * ninguno. **Devuelve todas y no la mejor**: con dos habilidades sobre la misma
 * magnitud, quedarse con una esconde media decisión, y el orden ya dice cuál
 * rinde más entrenar.
 */
function siguientePalanca(levers: readonly Lever[]): string[] {
	return levers
		.filter((lever) => lever.percentPerLevel > 0 && lever.level < MAX_LEVEL)
		.sort((a, b) => a.level - b.level)
		.map((lever) => `${lever.name} ${roman(lever.level + 1)} → +${lever.percentPerLevel} %`);
}

/**
 * Qué daría cada escalón siguiente de la lectura, o vacía si ya está al tope.
 *
 * Es lo que convierte el rótulo en una decisión. «Lectura: con cantidades» informa
 * y se queda ahí; «Prospección I → lectura completa» es un motivo para entrenar, y
 * ésa es toda la diferencia entre mostrar la cadena y sólo tenerla.
 */
function siguienteLectura(levels: SkillLevels): string[] {
	const pasos: string[] = [];
	if ((levels[SURVEY_SKILL] ?? 0) < 1) {
		pasos.push(`${getSkill(SURVEY_SKILL).name} I → lectura con cantidades`);
	}
	if ((levels[SURVEY_REFINE_SKILL] ?? 0) < 1) {
		pasos.push(`${getSkill(SURVEY_REFINE_SKILL).name} I → lectura completa`);
	}
	return pasos;
}

/**
 * De dónde sale un verbo movido por un módulo y unos porcentajes.
 *
 * Es el caso corriente —viajar, saltar— y por eso se arma una vez: el módulo que
 * lo habilita, las habilidades que lo mueven y qué daría la siguiente. Escanear y
 * extraer no lo usan porque tienen efectos que no son un porcentaje; todo lo
 * demás debería entrar acá, y si no entra conviene preguntarse por qué antes de
 * escribir otro constructor.
 */
function fuenteDeVerbo(
	db: Db,
	row: Pilot,
	verb: string,
	needs: readonly Need[],
	target: BonusTarget,
	effects: readonly Lectura[],
	blockers: readonly string[]
): Procedencia {
	const nave = activeShip(db, row.id);
	const readout = shipReadout(db, row);
	if (!nave || !readout) {
		return {
			verb,
			blockers: ['Necesitás una nave.'],
			// Sin nave no hay casco del que puedan salir: todo falta.
			modules: needs.map((need) => aparatoDeModulo(need.label, '')),
			levers: [],
			effects: [],
			next: []
		};
	}

	const llaves = leversFor(target, readout.hull, pilotSkillLevels(db, row.id));
	const piezas = aparatos(readout.hull, grantingModules(shipFit(db, nave), needs));

	return {
		verb,
		blockers,
		modules: piezas,
		levers: palancas(llaves),
		// Lo que rinde sólo se promete si hay con qué, venga del casco o de un
		// módulo: una nave a la que le falta el láser no extrae, y decir su
		// rendimiento sería prometer una extracción.
		effects: piezas.every((pieza) => pieza.fitted) ? effects : [],
		next: siguientePalanca(llaves)
	};
}

/**
 * Las rocas del cinturón, cada una con lo que el piloto sabe de ella.
 *
 * Una roca sin lectura vigente sale **sin identificar**: se ve el bulto pero no
 * de qué es ni cuánto tiene. Eso es lo que le da trabajo al escáner, y lo que
 * convierte llegar a un cinturón desconocido en algo que hacer en vez de una
 * lista que ya venía escrita.
 *
 * Cada roca identificada trae ya resuelto **cuánto traería y cuánto tardaría con
 * esta nave y esta bodega**, y no sólo cuánto queda en la piedra: "quedan 4.800
 * unidades" no dice nada; "traés 225 y tardás 38 minutos" dice si vale la pena.
 */
function buildBelt(
	db: Db,
	row: Pilot,
	orderBlocked: string
): { field: CampoRocas; asteroids: readonly Roca[] } {
	const plan = surveyPlan(db, row);
	const fuente = miningSource(db, row);
	const niveles = pilotSkillLevels(db, row.id);
	const rocas = asteroidsAt(db, row.locationId);
	const lecturas = surveysOf(
		db,
		row.id,
		rocas.map((roca) => roca.id)
	);

	const asteroids = rocas
		.map((roca) => {
			const lectura = lecturas.get(roca.id) ?? null;
			const edad = lectura ? surveyAge(lectura.takenAt.getTime()) : null;
			const identificada = edad !== null && !edad.stale;
			const ore = getOre(roca.oreCode);
			// Qué tan fina fue la lectura decide qué se ve. Una superficial dice de qué
			// es la roca, no cuánto tiene.
			const conCantidad = identificada && (lectura?.depth ?? 0) >= 1;
			const orden = identificada ? miningPlan(db, row, roca.id) : null;

			return {
				id: roca.id,
				identified: identificada,
				// Sin lectura vigente no se dice de qué es: ése es el punto del escáner.
				name: identificada ? ore.name : 'Roca sin identificar',
				icon: identificada ? itemIcon(ore) : ('circles-three' as const),
				description: identificada
					? ore.description
					: 'Un bulto en el radar. Habría que apuntarle el escáner.',
				remaining: conCantidad ? thousands(roca.units) : '',
				// Contra lo que traía al aparecer: es lo que dice cuán picada está.
				share:
					conCantidad && roca.initialUnits > 0
						? Math.min(100, roundHalfEven((roca.units * 100) / roca.initialUnits))
						: 0,
				units: orden?.units ?? 0,
				volume: orden ? cubicMeters(orden.units * ore.volumeTenths) : '',
				value: orden ? thousands(baseValueOf(ore.code, orden.units)) : '',
				duration: orden ? remainingLabel(orden.durationSeconds) : '',
				// Una lectura vieja no se esconde: se muestra con su antigüedad, y el
				// piloto decide si le alcanza para volver a mirarla.
				age: edad === null ? '' : edad.hours < 1 ? 'recién' : `hace ${edad.hours} h`,
				stale: edad !== null && edad.stale,
				// El motivo de más arriba gana: con una orden en curso da igual que la
				// bodega esté vacía, y "ya hay una orden" es lo que el jugador necesita
				// leer para saber qué hacer.
				blocked: identificada
					? orderBlocked || orden?.blocked || ''
					: 'Hay que escanearla antes de extraer: sin lectura no se sabe qué contiene.',
				scanBlocked: orderBlocked || plan.blocked
			};
		})
		// Lo identificado primero y lo más grande arriba: es el orden en que uno
		// elige a cuál apuntarle el láser.
		.sort((a, b) => Number(b.identified) - Number(a.identified) || b.units - a.units);

	const identificadas = asteroids.filter((roca) => roca.identified).length;
	// El ritmo de reposición es del cinturón, no de una piedra: se aprende mirando
	// cualquiera de sus rocas con una lectura completa, y se dice una sola vez.
	const completa = [...lecturas.values()].some(
		(fila) => fila.depth >= 2 && !surveyAge(fila.takenAt.getTime()).stale
	);
	const ritmo = completa
		? beltDeposits(db, row.locationId).reduce((suma, plano) => suma + plano.regenPerHour, 0)
		: 0;

	return {
		field: {
			scannable: true,
			count: `${identificadas} de ${rocas.length} identificadas`,
			depthLabel: depthLabel(plan.depth),
			duration: remainingLabel(plan.durationSeconds),
			regen: ritmo > 0 ? `${thousands(ritmo)} u/h` : '',
			blocked: orderBlocked || plan.blocked,
			// Los dos verbos del cinturón dicen de dónde salen, una sola vez arriba:
			// repetirlo debajo de cada piedra sería decir ocho veces lo mismo, y el
			// escáner y el láser son de la nave, no de la roca.
			scanSource: {
				verb: 'Escanear',
				blockers: [orderBlocked, plan.blocked].filter(Boolean),
				modules: [aparatoDeModulo('Escáner', plan.module)],
				levers: palancas(plan.levers),
				effects: [{ label: 'Lectura', value: depthLabel(plan.depth) }],
				next: siguienteLectura(niveles)
			},
			mineSource: {
				verb: 'Extraer',
				// Sólo lo que es de la nave: por qué **esta** roca no se puede picar lo
				// dice la fila, que es donde vive esa razón.
				blockers: [orderBlocked].filter(Boolean),
				modules: [aparatoDeModulo('Láser de extracción', fuente.module)],
				levers: palancas(fuente.levers),
				effects:
					fuente.perHour > 0
						? [{ label: 'Rinde', value: `${cubicMeters(fuente.perHour)} m³/h` }]
						: [],
				next: siguientePalanca(fuente.levers)
			}
		},
		asteroids
	};
}

/**
 * El sistema actual y todos sus cuerpos, en una sola pasada.
 *
 * La velocidad sale de la hoja de rendimiento de su nave, que ya trae adentro el
 * bono de Navegación y el del casco: la duración que se muestra en cada fila es
 * exactamente la que se va a cobrar.
 */
export function buildSystemView(db: Db, row: Pilot): Sistema {
	// **El sistema sale de dónde está parado el piloto**, no de una constante.
	// Con un sistema fijo, el día que alguien esté en otro, el árbol se dibuja con
	// los cuerpos del sistema equivocado y el cálculo de distancia no encuentra
	// ancestro común: la pantalla revienta y el piloto queda encerrado sin forma
	// de volver.
	const here = db.select().from(body).where(eq(body.id, row.locationId)).get();
	const donde = here
		? db.select().from(systemTable).where(eq(systemTable.id, here.systemId)).get()
		: undefined;

	const overview = donde ? systemOverview(db, donde.code) : null;
	// Sin universo sembrado no hay nada que dibujar, y decirlo es mejor que
	// mostrar una pantalla vacía sin explicación.
	if (overview === null) return uncharted();

	const system = overview.system;
	const readout = shipReadout(db, row);

	return {
		name: system.name,
		description: describeSystem({
			capitalOf: system.capitalOf ? factionName(system.capitalOf) : ''
		}),
		region: overview.region.name,
		constellation: overview.constellation.name,
		controlledBy: system.controllingFaction
			? factionName(system.controllingFaction)
			: 'Espacio libre',
		government: governmentLabel(system.government),
		// El cajón y el número: «Alta» se lee de un vistazo y el 78 dice cuánto.
		security: `${securityLabel(overview.securityLevel)} · ${overview.security}`,
		coordinates: `${system.x} · ${system.y} · ${system.z}`,
		bodyCount: String(overview.bodyCount),
		stationCount: String(overview.stationCount),
		exploredCount: `${overview.exploredCount} de ${overview.bodyCount}`,
		bodies: buildBodyRows(
			db,
			systemTree(db, system.code),
			here?.code ?? '',
			row.locationId,
			readout ?? REFERENCE_SHIP,
			// Adónde va la nave, para que el árbol lo marque. Sale de la orden en
			// curso: el árbol es la pantalla en la que uno mira adónde está yendo, y
			// hasta acá el destino vivía solamente en la barra de arriba.
			currentAction(db, row.id)?.destinationBodyId ?? null
		),
		hasShip: activeShip(db, row.id) !== null,
		actionInProgress: currentAction(db, row.id) !== null,
		// Uno solo para todo el árbol: los propulsores son de la nave, no del cuerpo
		// al que se va. La duración de cada fila ya sale de esta misma velocidad.
		travelSource: fuenteDeVerbo(
			db,
			row,
			'Viajar',
			NEEDS_TRAVEL,
			'speed',
			[{ label: 'Velocidad', value: `${thousands(readout?.speed ?? 0)} ud/h` }],
			situation(db, row).orderBlocked ? [situation(db, row).orderBlocked] : []
		)
	};
}

// --- La galaxia --------------------------------------------------------------

/**
 * Por qué criterio puede pintar el mapa el piloto.
 *
 * **Tres y no los cuatro del cuartel.** El gobierno se queda afuera porque a un
 * piloto le dice menos que la seguridad, que es el mismo eje contado en el número
 * que le importa: cuánta ley hay donde va a entrar.
 */
export const GALAXY_PAINTS = ['faccion', 'region', 'seguridad'] as const;

/**
 * Qué territorio puede dibujar por debajo de todo.
 *
 * Las constelaciones **se pintan pero no se filtran**, y la diferencia no es un
 * descuido: pintadas dibujan el terreno —dónde termina un grupo de sistemas y
 * empieza otro— y eso se lee sin saber cómo se llaman. Filtrar por constelación
 * pide conocer el nombre de antemano, que es vocabulario del constructor.
 */
export const GALAXY_TERRITORIES = ['region', 'constelacion'] as const;

/**
 * Lee la consulta del mapa desde la URL, validada contra los catálogos.
 *
 * Nada de confiar en el parámetro: un servicio inventado o una banda de seguridad
 * que no existe entran igual de fácil que los buenos, y el borde es acá.
 */
export function readGalaxyQuery(params: URLSearchParams): ConsultaGalaxia {
	const seguridad = params.get('seguridad') ?? '';
	const servicio = params.get('servicio') ?? '';
	const pintar = params.get('pintar') ?? '';
	const territorio = params.get('territorio') ?? '';

	return {
		search: (params.get('buscar') ?? '').trim().slice(0, 60),
		faction: params.get('faccion') ?? '',
		region: params.get('region') ?? '',
		corporation: params.get('corporacion') ?? '',
		security: SECURITY_LEVELS.includes(seguridad as SecurityLevel) ? seguridad : '',
		service: SERVICE_ORDER.includes(servicio as StationServiceKind) ? servicio : '',
		paint: GALAXY_PAINTS.includes(pintar as (typeof GALAXY_PAINTS)[number]) ? pintar : '',
		territory: GALAXY_TERRITORIES.includes(territorio as (typeof GALAXY_TERRITORIES)[number])
			? territorio
			: ''
	};
}

/**
 * Los filtros del mapa, cada uno con su propia pregunta.
 *
 * **Se apilan**: un sistema entra si pasa todos. Agregar «los que tienen taller»
 * o «los que están en guerra» el día que eso exista es agregar una fila acá y un
 * desplegable en la pantalla, sin tocar nada más.
 *
 * Son **los del piloto y no los del constructor**: buscar, bandera, región,
 * cuánta ley hay, qué servicios ofrece y quién tiene puesto ahí. Ninguno
 * pregunta por algo que no se pueda mirar desde la cabina.
 *
 * El de la corporación entra por la puerta de al lado: lo pone el botón «ver en
 * el mapa» de la pestaña Corporación, que es el único lugar donde la pregunta
 * «¿dónde está la mía?» ya está hecha.
 */
const GALAXY_FILTERS: readonly ((nodo: NodoGalaxia, query: ConsultaGalaxia) => boolean)[] = [
	(nodo, query) =>
		!query.search ||
		nodo.name.toLocaleLowerCase('es').includes(query.search.toLocaleLowerCase('es')),
	(nodo, query) =>
		!query.faction ||
		(query.faction === FREE_SPACE ? nodo.faction === '' : nodo.faction === query.faction),
	(nodo, query) => !query.region || nodo.region === query.region,
	(nodo, query) => !query.security || securityLevel(nodo.security) === query.security,
	(nodo, query) => !query.service || nodo.services.includes(query.service),
	(nodo, query) => !query.corporation || nodo.corporations.includes(query.corporation)
];

/**
 * Las salidas del sistema donde está el piloto, con lo que cuesta cada una.
 *
 * **Todo se calcula antes de moverse.** Cuánto mide el salto, cuánto tarda, qué
 * quema y por qué no se puede: un piloto tiene que poder decidir adónde va sin
 * viajar hasta la puerta para enterarse de que no le alcanza el tanque. El motivo
 * sale de `jumpProblem`, la misma función pura que apaga el botón en Ubicación y
 * que usa el servicio para rechazar la orden.
 *
 * Sale de **dos consultas** y no de una por puerta: son seis como mucho, pero el
 * patrón importa más que el número.
 */
function buildSalidas(db: Db, row: Pilot, here: Body): readonly SalidaGalaxia[] {
	const puertas = db.select().from(gate).all();
	const cuerpos = db.select().from(body).where(eq(body.systemId, here.systemId)).all();
	const porCuerpo = new Map(puertas.map((una) => [una.bodyId, una]));
	const nombres = new Map(cuerpos.map((uno) => [uno.id, uno]));

	const readout = shipReadout(db, row);
	const nave = readout ?? REFERENCE_SHIP;

	const salidas: SalidaGalaxia[] = [];
	for (const salida of puertas) {
		if (salida.systemId !== here.systemId || salida.destinationId === null) continue;
		const gemela = porCuerpo.get(salida.destinationId);
		if (!gemela) continue;

		const alla = db.select().from(systemTable).where(eq(systemTable.id, gemela.systemId)).get();
		const cuerpo = nombres.get(salida.bodyId);
		if (!alla || !cuerpo) continue;

		const problema =
			readout === null
				? 'Necesitás una nave para saltar.'
				: jumpProblem({ flyable: readout.flyable }, salida.jumpDistance, salida.closed);

		const segundos = jumpSeconds(salida.jumpDistance);
		// Cuánto hay hasta la puerta, que es el viaje que esta pantalla sí ordena. La
		// cuenta es la misma que la del árbol del sistema, con la misma velocidad, así
		// que las dos pantallas no pueden prometer duraciones distintas.
		const hasta = bodyDistance(db, row.locationId, salida.bodyId);

		salidas.push({
			code: alla.code,
			name: alla.name,
			gate: cuerpo.name,
			gateCode: cuerpo.code,
			bearing: bearingLabel(salida.bearing),
			travelDistance: `${thousands(hasta)} ud`,
			travelDuration: remainingLabel(travelDurationSeconds(hasta, nave)),
			distance: lightYears(salida.jumpDistance),
			// El tiempo se muestra **aunque no se pueda cruzar**: un renglón en blanco
			// con un «no podés» no dice nada.
			duration: segundos > 0 ? remainingLabel(segundos) : '',
			standingThere: row.locationId === salida.bodyId,
			blocked: problema ?? ''
		});
	}

	return salidas.sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

/**
 * La pestaña Galaxia: el mapa, dónde estás y adónde podés ir.
 *
 * Es el tercer nivel de acercamiento de Navegación —cuerpo, sistema, galaxia— y
 * **contesta lo que los otros dos no pueden**: dónde queda esto que estoy mirando
 * y qué hay alrededor.
 *
 * El mapa es el mismo que arma el cuartel. Lo que cambia es lo que viaja al lado:
 * dónde está parado el piloto, a cuántos saltos le queda cada sistema y por qué
 * no puede cruzar tal puerta. **La deuda de obra no viaja**: un sistema a la
 * deriva no es un lugar misterioso, es uno que nadie terminó de conectar, y para
 * el piloto sencillamente no se puede llegar.
 */
export function buildGalaxia(
	db: Db,
	row: Pilot,
	query = readGalaxyQuery(new URLSearchParams())
): Galaxia {
	const map = buildGalaxyMap(db);

	// **El sistema sale de dónde está parado**, igual que la pestaña Sistema. En
	// tránsito sigue siendo el de origen: la nave no está en ningún lado, pero el
	// mapa tiene que seguir diciendo de dónde salió.
	const cuerpo = db.select().from(body).where(eq(body.id, row.locationId)).get();
	const suyo = cuerpo
		? db.select().from(systemTable).where(eq(systemTable.id, cuerpo.systemId)).get()
		: undefined;
	const here = map.systems.find((nodo) => nodo.code === suyo?.code) ?? null;

	const exits = cuerpo ? buildSalidas(db, row, cuerpo) : [];

	// El salto en curso, para que el mapa pueda dibujar por dónde va la nave. Sólo
	// un salto: un viaje adentro del sistema no cruza ninguna línea del mapa.
	const orden = currentAction(db, row.id);
	const salto = orden?.kind === JUMP_KIND ? orden : null;
	const desde = salto?.originBodyId ? sistemaDelCuerpo(db, salto.originBodyId) : null;
	const hasta = salto?.destinationBodyId ? sistemaDelCuerpo(db, salto.destinationBodyId) : null;

	const pilot: PilotoEnElMapa = {
		system: here?.code ?? '',
		// Los saltos se cuentan sobre el grafo de puertas abiertas: «a dos saltos»
		// tiene que ser un camino que el piloto pueda hacer, no uno que exista en el
		// plano. Lo que no aparece **no se puede alcanzar**, que no es lo mismo que
		// estar lejos.
		jumps: here ? Object.fromEntries(hopsFrom(neighbourhood(map), here.code)) : {},
		reach: Object.fromEntries(exits.map((salida) => [salida.code, salida.blocked])),
		route:
			salto && desde && hasta && desde !== hasta
				? {
						from: desde,
						to: hasta,
						startedAt: salto.startedAt.getTime(),
						durationSeconds: salto.durationSeconds
					}
				: null
	};

	const pasan = map.systems.filter((nodo) => GALAXY_FILTERS.every((cumple) => cumple(nodo, query)));

	// Una sola lectura de la situación para los dos verbos: los dos preguntan lo
	// mismo y consultarla por separado sería pedirle a la base tres veces lo que ya
	// contestó.
	const ahora = situation(db, row);

	return {
		map,
		pilot,
		here,
		exits,
		// El mapa recibe la galaxia entera igual: lo que el filtro hace es **apagar**
		// el resto, no borrarlo, porque un mapa que sólo dibuja lo filtrado pierde la
		// forma del conjunto y deja de servir para ubicarse.
		matches: pasan.map((nodo) => nodo.code),
		query,
		total: map.systems.length,
		found: pasan.length,
		// Desde el mapa no se salta: `startJump` exige estar parado en la puerta. Lo
		// que el mapa ofrece es **viajar hasta la puerta**, que es una orden que ya
		// existe, y por eso la fuente que se muestra es la de viajar.
		travelSource: fuenteDeVerbo(
			db,
			row,
			'Viajar',
			NEEDS_TRAVEL,
			'speed',
			[{ label: 'Velocidad', value: `${thousands(shipReadout(db, row)?.speed ?? 0)} ud/h` }],
			ahora.orderBlocked ? [ahora.orderBlocked] : []
		),
		// Y la de **saltar**, para cuando ya estás parado en la puerta. Desde acá no
		// se cruza —el mapa manda a Ubicación, que es la pantalla del lugar— pero
		// con una orden en curso aquella pantalla muestra el viaje y no la puerta:
		// el camino no lleva a ninguna parte y hay que decirlo acá.
		//
		// La orden en curso primero: es lo que hay que leer para saber qué hacer, y
		// es el mismo criterio que el del cinturón.
		jumpSource: fuenteDeLaPuerta(
			[ahora.orderBlocked, exits.find((una) => una.standingThere)?.blocked ?? ''].filter(
				Boolean
			)[0] ?? null
		)
	};
}

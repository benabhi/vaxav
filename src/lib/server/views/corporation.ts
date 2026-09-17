/**
 * La pestaña Corporación: a quién le rinde cuentas el piloto.
 *
 * Contesta tres cosas y ninguna más, porque hoy no hay más: **quién es**, **dónde
 * se la encuentra** y **quiénes son los otros**. Cuando existan la billetera
 * compartida, los roles y los contratos, cada uno va a sumar su bloque acá; lo que
 * no va a cambiar es que la pantalla arranque diciendo a qué pertenecés.
 *
 * **Un piloto sin corporación no es un error**: es un independiente, y la pantalla
 * lo dice así en vez de mostrar un hueco. Va a ser el estado normal el día que se
 * pueda renunciar.
 *
 * Corresponde a docs/systems/CORPORATIONS.md.
 */

import { eq } from 'drizzle-orm';
import {
	agent,
	body,
	corporation,
	pilot,
	station,
	stationService,
	system as systemTable,
	type Pilot
} from '../db/schema';
import type { Db } from '../db/types';
import { FACTIONS } from '$lib/game/factions';
import { SERVICE_ORDER, type StationServiceKind } from '$lib/game/universe';
import {
	corporationKindIcon,
	corporationKindLabel,
	reputationLabel,
	roman,
	serviceLabel
} from '$lib/format';
import { getCorporation, type CorporationKind } from '$lib/game/corporations';
import { REPUTATION_SCALE, TIERS, effectiveMissionLevel, tierForRaw } from '$lib/game/reputation';
import { pilotStandings } from '../services/reputation';
import type { Corporacion, EscalonReputacion, ReputacionCorporacion } from '$lib/tipos';
import type { EstacionCorporacion } from '$lib/tipos';

/**
 * Cuántas estaciones entran en el panel de la ficha.
 *
 * Suficientes para leer de qué tamaño es la corporación, pocas para que el panel
 * no se vuelva una lista que hay que recorrer. Lo que no entra lo dice el
 * contador, y verlas todas es el mapa.
 */
const ESTACIONES_EN_LA_FICHA = 5;

/** Lo que se muestra cuando el piloto no pertenece a ninguna. */
const INDEPENDIENTE: Corporacion = {
	belongs: false,
	name: 'Independiente',
	code: '',
	kind: '',
	kindIcon: 'users',
	origin: '',
	faction: '',
	factionCode: '',
	description:
		'No respondés a ninguna corporación. Volás por tu cuenta, cobrás para vos y ' +
		'no le debés explicaciones a nadie.',
	members: '',
	stations: [],
	moreStations: 0,
	stationCount: '',
	agentCount: '',
	reputation: null
};

/**
 * La escalera del piloto con una corporación, escrita para la pantalla.
 *
 * Las **dos** escaleras juntas, y no sólo la de la corporación: la de la bandera
 * abre ese mismo nivel en todas las que la llevan, así que mostrar una sin la
 * otra dejaría sin explicación a un agente que atiende cuando no debería.
 */
export function buildReputacion(
	corporationRaw: number,
	factionRaw: number,
	factionName: string
): ReputacionCorporacion {
	const escalon = tierForRaw(corporationRaw);
	const siguiente = TIERS.find((uno) => uno.level === escalon.level + 1);

	const ladder: EscalonReputacion[] = TIERS.map((uno) => ({
		name: uno.name,
		at: uno.reputation,
		level: roman(uno.level),
		reached: corporationRaw >= uno.reputation * REPUTATION_SCALE
	}));

	return {
		value: reputationLabel(corporationRaw),
		percent: corporationRaw / REPUTATION_SCALE,
		tier: escalon.name,
		reached: escalon.level,
		tiers: TIERS.length,
		// Lo que falta y **para qué**: un umbral sin su premio es un número más.
		next: siguiente
			? `${siguiente.name} a ${reputationLabel(siguiente.reputation * REPUTATION_SCALE)} · abre agentes de nivel ${roman(siguiente.level)}`
			: '',
		faction: factionName,
		factionValue: reputationLabel(factionRaw),
		factionPercent: factionRaw / REPUTATION_SCALE,
		factionTier: tierForRaw(factionRaw).name,
		level: roman(effectiveMissionLevel(corporationRaw, factionRaw)),
		ladder
	};
}

/**
 * La corporación del piloto, con lo que hace falta para reconocerla.
 *
 * Todo sale de **cuatro consultas**, no de una por estación: una corporación con
 * seis puestos no puede costar seis viajes a la base cada vez que alguien abre su
 * ficha.
 */
export function buildCorporacion(db: Db, row: Pilot): Corporacion {
	if (row.corporationId === null) return INDEPENDIENTE;

	const suya = db.select().from(corporation).where(eq(corporation.id, row.corporationId)).get();
	if (!suya) return INDEPENDIENTE;

	// Las estaciones que opera, con el sistema donde están y qué ofrecen. El
	// piloto necesita saber **adónde ir**, y una estación sin su sistema es un
	// nombre que no lleva a ninguna parte.
	const puestos = db.select().from(station).where(eq(station.corporationId, suya.id)).all();
	const cuerpos = new Map(
		db
			.select()
			.from(body)
			.all()
			.map((uno) => [uno.id, uno])
	);
	const sistemas = new Map(
		db
			.select()
			.from(systemTable)
			.all()
			.map((uno) => [uno.id, uno])
	);
	const servicios = db.select().from(stationService).all();

	const stations: EstacionCorporacion[] = puestos
		.map((puesto) => {
			const cuerpo = cuerpos.get(puesto.bodyId);
			const suyos = new Set(
				servicios.filter((uno) => uno.stationId === puesto.id).map((uno) => uno.service)
			);
			return {
				code: cuerpo?.code ?? '',
				name: cuerpo?.name ?? '',
				system: cuerpo ? (sistemas.get(cuerpo.systemId)?.name ?? '') : '',
				// En el orden del catálogo, como en el mapa: dos listas de servicios que
				// se ordenan distinto no se pueden comparar de un vistazo.
				services: SERVICE_ORDER.filter((servicio) => suyos.has(servicio)).map((servicio) =>
					serviceLabel(servicio as StationServiceKind)
				)
			};
		})
		.filter((una) => una.name !== '')
		.sort((a, b) => a.name.localeCompare(b.name, 'es'));

	// Cuánta gente reparte trabajo. **Sólo la cuenta**: la lista con sus columnas
	// —nivel, clase, si te atiende— vive en su propia pestaña, que es donde se la
	// puede recortar y ordenar.
	const cuantosAgentes = db
		.select()
		.from(agent)
		.where(eq(agent.corporationId, suya.id))
		.all().length;

	const cuantos = db.select().from(pilot).where(eq(pilot.corporationId, suya.id)).all().length;

	const bandera = FACTIONS[suya.faction as keyof typeof FACTIONS];

	// Las dos escaleras, de la misma consulta que ya trae todo lo del piloto.
	const suyas = pilotStandings(db, row.id);
	const reputation = buildReputacion(
		suyas.corporations[suya.code] ?? 0,
		suya.faction ? (suyas.factions[suya.faction] ?? 0) : 0,
		bandera?.name ?? 'Sin bandera'
	);

	return {
		belongs: true,
		name: suya.name,
		code: suya.code,
		kind: corporationKindLabel(suya.kind as CorporationKind),
		kindIcon: corporationKindIcon(suya.kind as CorporationKind),
		// Del catálogo y no de una columna: las del mundo son exactamente las que
		// están ahí. El día que se puedan fundar, las de jugadores no van a estar y
		// la cuenta sigue dando sin migrar nada.
		origin: getCorporation(suya.code) ? 'NPC' : 'De jugadores',
		faction: bandera?.name ?? 'Sin bandera',
		factionCode: suya.faction,
		description: suya.description,
		members: cuantos === 1 ? '1 piloto' : `${cuantos} pilotos`,
		// **Una muestra y no la lista entera.** Una corporación grande puede operar
		// cientos de puestos, y el panel de una ficha no es el lugar para leerlos: lo
		// que contesta acá es de qué tamaño es y por dónde anda. El resto lo contesta
		// el mapa, que para eso ya recorta por corporación.
		stations: stations.slice(0, ESTACIONES_EN_LA_FICHA),
		moreStations: Math.max(0, stations.length - ESTACIONES_EN_LA_FICHA),
		stationCount: stations.length === 1 ? '1 estación' : `${stations.length} estaciones`,
		agentCount: cuantosAgentes === 1 ? '1 agente' : `${cuantosAgentes} agentes`,
		reputation
	};
}

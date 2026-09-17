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
import { corporationKindIcon, corporationKindLabel, serviceLabel } from '$lib/format';
import type { CorporationKind } from '$lib/game/corporations';
import type { Corporacion, EstacionCorporacion } from '$lib/tipos';

/** Lo que se muestra cuando el piloto no pertenece a ninguna. */
const INDEPENDIENTE: Corporacion = {
	belongs: false,
	name: 'Independiente',
	code: '',
	kind: '',
	kindIcon: 'users',
	faction: '',
	factionCode: '',
	description:
		'No respondés a ninguna corporación. Volás por tu cuenta, cobrás para vos y ' +
		'no le debés explicaciones a nadie.',
	members: '',
	stations: [],
	agents: []
};

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

	// Dónde tiene gente sentada, que no es lo mismo que dónde opera: una
	// corporación puede repartir trabajo desde una estación ajena.
	const suyosAgentes = db.select().from(agent).where(eq(agent.corporationId, suya.id)).all();
	const puestosPorId = new Map(
		db
			.select()
			.from(station)
			.all()
			.map((uno) => [uno.id, uno])
	);

	const agents = suyosAgentes
		.map((uno) => {
			const puesto = puestosPorId.get(uno.stationId);
			const cuerpo = puesto ? cuerpos.get(puesto.bodyId) : undefined;
			return {
				code: uno.code,
				name: uno.name,
				station: cuerpo?.name ?? '',
				system: cuerpo ? (sistemas.get(cuerpo.systemId)?.name ?? '') : ''
			};
		})
		.sort((a, b) => a.name.localeCompare(b.name, 'es'));

	const cuantos = db.select().from(pilot).where(eq(pilot.corporationId, suya.id)).all().length;

	const bandera = FACTIONS[suya.faction as keyof typeof FACTIONS];

	return {
		belongs: true,
		name: suya.name,
		code: suya.code,
		kind: corporationKindLabel(suya.kind as CorporationKind),
		kindIcon: corporationKindIcon(suya.kind as CorporationKind),
		faction: bandera?.name ?? 'Sin bandera',
		factionCode: suya.faction,
		description: suya.description,
		members: cuantos === 1 ? '1 piloto' : `${cuantos} pilotos`,
		stations,
		agents
	};
}

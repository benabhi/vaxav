/**
 * Las corporaciones del mundo: quién opera las cosas y quién reparte trabajo.
 *
 * **Archivo propio, como facciones, oficios y habilidades.** Es un catálogo de
 * contenido y va a seguir creciendo: hoy son cuarenta, mañana van a ser
 * doscientas, y mezclarlas con las reglas del universo convierte ese archivo en
 * un depósito. Acá viven para poder leerse de corrido y para que la data inicial
 * que se genere más adelante salga de un lugar que no se mueve.
 *
 * **Doce por facción y cuatro sin bandera.** Con tres o cuatro, elegir a cuál
 * alistarse no sería elegir; con esta cantidad, el sector empieza a tener adentro
 * gente que no se lleva bien entre sí.
 *
 * Cada una declara **un rubro**, y los doce de cada facción cubren los seis **de
 * a dos**. Eso no es prolijidad: el rubro es lo que va a decidir qué contratos
 * publica y qué compra, así que una facción a la que le falte un rubro sería una
 * facción donde media profesión no encuentra trabajo, y con uno solo por rubro
 * elegir sería aceptar al único que hace lo que uno quiere hacer. Que sean doce y
 * no once también le da a la pantalla del alta una grilla pareja, sin una última
 * fila coja.
 *
 * **La mayoría no opera ninguna estación**, y está bien: una corporación puede
 * existir sólo como gente. La Vigilia Ánfora es una capitana sentada en Puerto
 * Ánfora repartiendo trabajo, y eso ya la hace existir.
 *
 * Corresponde a docs/systems/CORPORATIONS.md.
 */

/** A qué se dedica una corporación. */
export const CORPORATION_KINDS = [
	'mining',
	'industry',
	'trade',
	'exploration',
	'security',
	'logistics'
] as const;
export type CorporationKind = (typeof CORPORATION_KINDS)[number];

/**
 * Una corporación del mundo.
 *
 * Las estaciones pertenecen a corporaciones, y **las corporaciones responden a
 * una facción o a ninguna**. La facción de una estación se deriva de ahí, así
 * que no se guarda dos veces y no puede contradecirse.
 */
export interface CorporationBlueprint {
	readonly code: string;
	readonly name: string;
	readonly kind: CorporationKind;
	/** Código de facción, o vacío si no responde a ninguna. */
	readonly faction: string;
	readonly description: string;
}

export const CORPORATIONS: readonly CorporationBlueprint[] = [
	// --- El Dominio: linaje, protocolo y una idea muy clara de quién manda ------
	{
		code: 'casa_verlan',
		name: 'Casa Verlan',
		kind: 'trade',
		faction: 'dominion',
		description:
			'Casa comercial con carta del Dominio. Administra Puerto Ánfora ' +
			'desde hace tres generaciones y lo trata como propiedad ' +
			'familiar, que en los papeles casi lo es.'
	},
	{
		code: 'casa_oriol',
		name: 'Casa Oriol',
		kind: 'trade',
		faction: 'dominion',
		description:
			'La segunda casa comercial del sector, y la primera en decirlo en voz ' +
			'alta. Compra lo que Verlan desprecia y lo vende dos sistemas más allá, ' +
			'donde nadie sabe de quién era.'
	},
	{
		code: 'astilleros_kaldera',
		name: 'Astilleros Káldera',
		kind: 'industry',
		faction: 'dominion',
		description:
			'Arma cascos para las casas desde antes de que el Dominio se llamara ' +
			'así. La lista de espera se hereda junto con el título, y saltearla ' +
			'cuesta más que la nave.'
	},
	{
		code: 'fundicion_arganza',
		name: 'Fundición Argánza',
		kind: 'industry',
		faction: 'dominion',
		description:
			'Refina para los astilleros y para nadie más. Lo que sale de sus hornos ' +
			'ya tiene dueño antes de enfriarse.'
	},
	{
		code: 'mineria_baronal',
		name: 'Minería Baronal',
		kind: 'mining',
		faction: 'dominion',
		description:
			'Las vetas son de la corona y ella las trabaja por concesión. Paga bien, ' +
			'exige el doble y lleva registro de cada tonelada.'
	},
	{
		code: 'socavon_de_hierro',
		name: 'Socavón de Hierro',
		kind: 'mining',
		faction: 'dominion',
		description:
			'Explota los cinturones que las casas grandes consideran agotados. Le ' +
			'sigue saliendo mineral, y eso incomoda a más de uno.'
	},
	{
		code: 'heraldos_del_confin',
		name: 'Heraldos del Confín',
		kind: 'exploration',
		faction: 'dominion',
		description:
			'Cartografía por encargo de las casas. Lo que encuentra no se publica: ' +
			'se entrega, y la copia que queda es la del encargante.'
	},
	{
		code: 'orden_del_astrolabio',
		name: 'Orden del Astrolabio',
		kind: 'exploration',
		faction: 'dominion',
		description:
			'Mitad gremio de navegantes, mitad archivo. Guarda cartas de ruta que ' +
			'nadie más tiene y las presta a quien jure devolverlas.'
	},
	{
		code: 'vigilia_anfora',
		name: 'Vigilia Ánfora',
		kind: 'security',
		faction: 'dominion',
		description:
			'Seguridad contratada. El Dominio le paga por patrullar el ' +
			'sistema y ella subcontrata a quien esté dispuesto, que suele ' +
			'ser un piloto con la nave a nombre de otro.'
	},
	{
		code: 'lanzas_de_ceniza',
		name: 'Lanzas de Ceniza',
		kind: 'security',
		faction: 'dominion',
		description:
			'Compañía de armas con carta real. Cobra por adelantado y no discute ' +
			'órdenes, que es exactamente lo que le compran.'
	},
	{
		code: 'traslados_imperiales',
		name: 'Traslados Imperiales',
		kind: 'logistics',
		faction: 'dominion',
		description:
			'Mueve carga con escolta y sello. Cuesta el doble que cualquier otra y ' +
			'llega, que en este sector no es poco.'
	},
	{
		code: 'acarreos_ivarre',
		name: 'Acarreos Ivarre',
		kind: 'logistics',
		faction: 'dominion',
		description:
			'Casa menor que acarrea para las mayores, de a poco y entre puestos del ' +
			'Dominio. Cobra barato porque el pago de verdad es que la dejen figurar.'
	},

	// --- La Concordia: todo se vota, y por eso todo tarda ----------------------
	{
		code: 'extractora_anillo',
		name: 'Extractora Anillo',
		kind: 'mining',
		faction: 'concord',
		description:
			'Cooperativa de mineros que creció hasta volverse empresa. ' +
			'Sigue votando sus decisiones en asamblea, aunque ahora la ' +
			'asamblea sean cuatro mil personas.'
	},
	{
		code: 'cooperativa_del_borde',
		name: 'Cooperativa del Borde',
		kind: 'mining',
		faction: 'concord',
		description:
			'Reparte turnos de extracción por sorteo entre sus socios. Es lento, es ' +
			'justo, y nadie propuso todavía nada mejor que aguante una votación.'
	},
	{
		code: 'hidros_escarcha',
		name: 'Hidros Escarcha',
		kind: 'industry',
		faction: 'concord',
		description:
			'Saca agua y combustible del hielo de la luna. Trabajo ' +
			'monótono, turnos largos y una clientela que no puede ir a otro ' +
			'lado.'
	},
	{
		code: 'talleres_federados',
		name: 'Talleres Federados',
		kind: 'industry',
		faction: 'concord',
		description:
			'Catorce talleres chicos que se unieron para poder cotizar contratos ' +
			'grandes. Cada uno sigue haciendo lo suyo y discutiendo el resto.'
	},
	{
		code: 'camara_federada',
		name: 'Cámara Federada',
		kind: 'trade',
		faction: 'concord',
		description:
			'Fija los precios de referencia del espacio concorde. No obliga a nadie, ' +
			'pero quien se aparta mucho de su tabla deja de recibir invitaciones.'
	},
	{
		code: 'consorcio_aldaba',
		name: 'Consorcio Aldaba',
		kind: 'trade',
		faction: 'concord',
		description:
			'Compra en bloque para sus asociados y negocia como si fuera uno solo. ' +
			'Entrar cuesta una cuota; salir, bastante más.'
	},
	{
		code: 'prospeccion_federada',
		name: 'Prospección Federada',
		kind: 'exploration',
		faction: 'concord',
		description:
			'Releva cinturones y publica lo que encuentra, porque el estatuto la ' +
			'obliga. Sus informes llegan tarde y completos.'
	},
	{
		code: 'sondas_concordes',
		name: 'Sondas Concordes',
		kind: 'exploration',
		faction: 'concord',
		description:
			'Siembra sondas y espera. La mitad no vuelve, y con la otra mitad arma ' +
			'las cartas que después todos usan.'
	},
	{
		code: 'guardia_federada',
		name: 'Guardia Federada',
		kind: 'security',
		faction: 'concord',
		description:
			'Es la flota, pero contesta a un comité. Llega cuando el comité termina ' +
			'de discutir si corresponde llegar.'
	},
	{
		code: 'mutual_del_casco',
		name: 'Mutual del Casco',
		kind: 'security',
		faction: 'concord',
		description:
			'Seguro de casco que paga escolta en vez de indemnización: sale más ' +
			'barato llegar que reponer. Cubre al que está al día, y sólo a ése.'
	},
	{
		code: 'rutas_unidas',
		name: 'Rutas Unidas',
		kind: 'logistics',
		faction: 'concord',
		description:
			'Mantiene las líneas regulares entre estaciones concordes. Horarios ' +
			'publicados, precios votados y ni un desvío sin acta.'
	},
	{
		code: 'transportes_asamblea',
		name: 'Transportes Asamblea',
		kind: 'logistics',
		faction: 'concord',
		description:
			'Carga a granel para quien la contrate, socio o no. Es la parte de la ' +
			'Concordia que menos pregunta y más mueve.'
	},

	// --- El Pacto: sin capital y sin flota; lo que hay son acuerdos ------------
	{
		code: 'comuna_talo',
		name: 'Comuna Talo',
		kind: 'mining',
		faction: 'pact',
		description:
			'Nació como el hábitat que excavó el asteroide y nunca dejó de ' +
			'ser eso: la gente que vive ahí es la que la dirige.'
	},
	{
		code: 'cavadores_de_brea',
		name: 'Cavadores de Brea',
		kind: 'mining',
		faction: 'pact',
		description:
			'Pica las rocas sucias que nadie quiere y les saca lo que tienen. ' +
			'Trabajo feo, reparto parejo y ninguna deuda con nadie.'
	},
	{
		code: 'taller_del_acuerdo',
		name: 'Taller del Acuerdo',
		kind: 'industry',
		faction: 'pact',
		description:
			'Fabrica con lo que llega y repara lo que otros descartan. Su catálogo ' +
			'cambia según qué pasó por el muelle esa semana.'
	},
	{
		code: 'fundicion_comunal',
		name: 'Fundición Comunal',
		kind: 'industry',
		faction: 'pact',
		description:
			'Refina para las comunas firmantes al costo. Los excedentes se venden ' +
			'afuera y lo que entra se reparte en la siguiente reunión.'
	},
	{
		code: 'feria_del_pacto',
		name: 'Feria del Pacto',
		kind: 'trade',
		faction: 'pact',
		description:
			'Menos una empresa que un mercado con reglas. Cobra por puesto y ' +
			'garantiza que lo pactado en su piso se cumple.'
	},
	{
		code: 'trueque_libre',
		name: 'Trueque Libre',
		kind: 'trade',
		faction: 'pact',
		description:
			'Cambia mercadería por mercadería y créditos sólo cuando no queda otra. ' +
			'Sus tablas de equivalencia son el documento más consultado del Pacto.'
	},
	{
		code: 'caminantes_del_borde',
		name: 'Caminantes del Borde',
		kind: 'exploration',
		faction: 'pact',
		description:
			'Vive de encontrar lugares donde valga la pena firmar algo. Cada ruta ' +
			'nueva que abre termina en un acuerdo o en nada.'
	},
	{
		code: 'cartografos_del_acuerdo',
		name: 'Cartógrafos del Acuerdo',
		kind: 'exploration',
		faction: 'pact',
		description:
			'Levanta las cartas que el Pacto no le quiere comprar a nadie. Las ' +
			'reparte entre los firmantes y no las vende afuera.'
	},
	{
		code: 'hermandad_de_escoltas',
		name: 'Hermandad de Escoltas',
		kind: 'security',
		faction: 'pact',
		description:
			'Pilotos que se cubren entre sí por palabra y por turno. No tiene flota: ' +
			'tiene una lista de quién le debe un viaje a quién.'
	},
	{
		code: 'guardia_de_palabra',
		name: 'Guardia de Palabra',
		kind: 'security',
		faction: 'pact',
		description:
			'Hace cumplir lo firmado, con la fuerza que haga falta. Es lo más ' +
			'parecido a una ley que tiene el Pacto, y lo sabe.'
	},
	{
		code: 'correo_del_pacto',
		name: 'Correo del Pacto',
		kind: 'logistics',
		faction: 'pact',
		description:
			'Lleva carga y mensajes entre comunas que no tienen línea regular. ' +
			'Tarda lo que tarda y nunca abrió un contenedor ajeno.'
	},
	{
		code: 'remolques_comunales',
		name: 'Remolques Comunales',
		kind: 'logistics',
		faction: 'pact',
		description:
			'Los remolcadores viejos de las comunas, alquilados por viaje y con ' +
			'tripulación. Cobran por lo que pesa y no por lo que vale.'
	},

	// --- Sin bandera: y con eso alcanza para tener clientes --------------------
	{
		code: 'libre_amarre',
		name: 'Libre Amarre',
		kind: 'logistics',
		faction: '',
		description:
			'Sin bandera y con eso alcanza para tener clientes. Mueve lo ' +
			'que haya que mover y no pregunta de quién es.'
	},
	{
		code: 'taller_sin_nombre',
		name: 'Taller Sin Nombre',
		kind: 'industry',
		faction: '',
		description:
			'Monta y desmonta lo que le traigan sin anotar el número de casco. ' +
			'Cobra en efectivo y cierra temprano.'
	},
	{
		code: 'sondas_grises',
		name: 'Sondas Grises',
		kind: 'exploration',
		faction: '',
		description:
			'Vende la misma carta a las tres facciones y a ninguna le avisa. ' +
			'Mientras el dato sirva, nadie le pregunta de dónde salió.'
	},
	{
		code: 'contrato_abierto',
		name: 'Contrato Abierto',
		kind: 'security',
		faction: '',
		description:
			'Una mesa, una lista y gente dispuesta. Quien paga elige, y la ' +
			'corporación se queda con su parte sin preguntar para qué.'
	}
];

/** La corporación de ese código, o `null` si no existe ninguna. */
export function getCorporation(code: string): CorporationBlueprint | null {
	return CORPORATIONS.find((una) => una.code === code) ?? null;
}

/**
 * Las que responden a una facción, en el orden del catálogo.
 *
 * Con la cadena vacía devuelve las que no responden a nadie, que es un caso real
 * y no un descuido: el Amarre Franco no le rinde cuentas a ninguna de las tres, y
 * eso es exactamente su atractivo.
 */
export function corporationsOf(faction: string): readonly CorporationBlueprint[] {
	return CORPORATIONS.filter((una) => una.faction === faction);
}

/** Las que se dedican a un rubro, sin importar de quién sean. */
export function corporationsByKind(kind: CorporationKind): readonly CorporationBlueprint[] {
	return CORPORATIONS.filter((una) => una.kind === kind);
}

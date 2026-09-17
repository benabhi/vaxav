<!--
	Pestaña Galaxia: dónde estás en el conjunto, y adónde podés ir.

	Es el tercer acercamiento de Navegación —el cuerpo, el sistema, la galaxia— y
	contesta lo que los otros dos no pueden: **dónde queda esto que estoy mirando**.
	Por eso abre centrada en tu sistema y no encuadrando todo: la primera pregunta
	de un piloto es dónde está, no cómo es la galaxia. Encuadrar está al lado, para
	la segunda.

	**Es el mismo mapa que usa el cuartel**, con otras piezas alrededor: acá no se
	pinta gobierno ni se muestran las puertas sin terminar, porque un ramal a medio
	construir no es un lugar misterioso, es trabajo pendiente de otro. Lo que sí
	agrega es lo que sólo el piloto ve: dónde está parado, a cuántos saltos le queda
	cada sistema y cuál de sus salidas puede cruzar hoy.

	**Sin tabla de sistemas**, a diferencia del cuartel. Una lista de sesenta
	nombres sin nada que decidir es una lista; el día que haya mercados por sistema
	o servicios que valgan un viaje, va a haber algo que ordenar y entonces la
	tabla se gana el lugar.
-->
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import HudButton from '$lib/components/buttons/HudButton.svelte';
	import HudLink from '$lib/components/buttons/HudLink.svelte';
	import ActionSource from '$lib/components/game/ActionSource.svelte';
	import ConfirmAction from '$lib/components/game/ConfirmAction.svelte';
	import GalaxyMap from '$lib/components/game/GalaxyMap.svelte';
	import GalaxyStage from '$lib/components/game/GalaxyStage.svelte';
	import GalaxyLegend from '$lib/components/game/GalaxyLegend.svelte';
	import ErrorCallout from '$lib/components/forms/ErrorCallout.svelte';
	import SelectField from '$lib/components/forms/SelectField.svelte';
	import TextField from '$lib/components/forms/TextField.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import CardTitle from '$lib/components/typography/CardTitle.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import Label from '$lib/components/typography/Label.svelte';
	import { FREE_SPACE } from '$lib/filters';
	import { getFaction } from '$lib/game/factions';
	import { SECURITY_LEVELS, SERVICE_ORDER, type StationServiceKind } from '$lib/game/universe';
	import { securityLabel, serviceIcon, serviceLabel } from '$lib/format';
	import { colorFor } from '$lib/palette';
	import type { NodoGalaxia, SalidaGalaxia } from '$lib/tipos';
	import type { Camara } from '$lib/camera';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let galaxia = $derived(data.galaxia);
	let consulta = $derived(galaxia.query);

	/**
	 * El sistema que describe la ficha.
	 *
	 * **Mientras nadie elija otra cosa es el tuyo**: es el que el mapa está
	 * mostrando al abrirse, y una ficha vacía al lado de un sistema resaltado es una
	 * pantalla que no contesta lo que ya está preguntando. Se guarda la elección y
	 * no el resultado para que, al mover la nave, la ficha siga a donde estás si
	 * nunca tocaste el mapa —y se quede donde la dejaste si sí—.
	 */
	let elegidoAMano = $state('');
	let elegido = $derived(elegidoAMano || galaxia.pilot.system);

	let mapa = $state<GalaxyMap>();

	/**
	 * Dónde está mirando el mapa, y si ya se acomodó.
	 *
	 * **Vive acá y no adentro del mapa** porque agrandar lo saca del panel y lo pone
	 * en una capa propia, y eso lo vuelve a montar: con la vista adentro, cada vez
	 * que se agranda volverías al encuadre inicial en vez de seguir mirando lo que
	 * estabas mirando.
	 */
	let camara = $state<Camara | null>(null);
	let encuadrado = $state(false);
	let agrandado = $state(false);
	let filtrosAbiertos = $state(true);

	/**
	 * Y la ficha también se pliega, pero **abre desplegada**.
	 *
	 * Al revés que los filtros: uno agranda el mapa para mirar la galaxia, y los
	 * filtros no hacen falta hasta que se los busca; la ficha, en cambio, es la que
	 * dice adónde se puede ir desde acá, que es para lo que se abrió el mapa.
	 */
	let fichaAbierta = $state(true);

	function alternarAgrandado() {
		agrandado = !agrandado;
		// Plegados al agrandar, abiertos al volver: agrandar es para mirar el mapa.
		filtrosAbiertos = !agrandado;
		// Y se vuelve a acomodar en el tamaño nuevo, otra vez sobre tu sistema: un
		// encuadre hecho para un recuadro chico deja la galaxia corrida en una
		// pantalla entera.
		encuadrado = false;
	}

	/** Escape cierra, como todo lo que tapa la pantalla en este juego. */
	function alTeclear(evento: KeyboardEvent) {
		if (evento.key === 'Escape' && agrandado) alternarAgrandado();
	}

	/**
	 * Elegir de un desplegable filtra solo.
	 *
	 * Apretar «Filtrar» después de cada elección es un paso que no decide nada: ya
	 * se decidió al elegir. El botón queda para el buscador —que sí necesita saber
	 * cuándo terminaste de escribir— y para quien llega con el teclado.
	 */
	function alCambiar(evento: Event & { currentTarget: HTMLSelectElement }) {
		evento.currentTarget.form?.requestSubmit();
	}

	/**
	 * Los filtros del piloto.
	 *
	 * **No son los del constructor.** Acá no se filtra por constelación ni por
	 * gobierno: son vocabulario de quien arma la galaxia. Un piloto busca por
	 * nombre, por bandera, por cuánta ley hay y —sobre todo— por qué se puede hacer
	 * ahí, que es lo único de esta barra que contesta «¿me conviene ir?».
	 */
	let opcionesFaccion = $derived([
		{ value: '', label: 'Todas' },
		{ value: FREE_SPACE, label: 'Espacio libre' },
		...[...new Set(galaxia.map.systems.map((uno) => uno.faction))]
			.filter(Boolean)
			.map((code) => ({ value: code, label: getFaction(code).name }))
			.sort((a, b) => a.label.localeCompare(b.label, 'es'))
	]);

	/**
	 * Sólo las que operan algún puesto, y ya ordenadas por nombre desde el
	 * servidor: el mapa no puede decir nada de una corporación que no tiene dónde
	 * aparecer.
	 */
	let opcionesCorporacion = $derived([
		{ value: '', label: 'Todas' },
		...galaxia.map.corporations.map((una) => ({ value: una.code, label: una.name }))
	]);

	let opcionesRegion = $derived([
		{ value: '', label: 'Todas' },
		...[...new Set(galaxia.map.systems.map((uno) => uno.region))]
			.filter(Boolean)
			.sort((a, b) => a.localeCompare(b, 'es'))
			.map((nombre) => ({ value: nombre, label: nombre }))
	]);

	/** De la más alta a la más baja: es el orden en que uno piensa la ley. */
	const OPCIONES_SEGURIDAD = [
		{ value: '', label: 'Toda' },
		...[...SECURITY_LEVELS].reverse().map((level) => ({
			value: level,
			label: securityLabel(level)
		}))
	];

	/**
	 * Los servicios, del catálogo entero y no de los que hay sembrados.
	 *
	 * Es la lista que crece sola: agregar un servicio al juego lo agrega al filtro
	 * sin tocar esta pantalla.
	 */
	const OPCIONES_SERVICIO = [
		{ value: '', label: 'Todos' },
		...SERVICE_ORDER.map((code) => ({ value: code, label: serviceLabel(code) }))
	];

	const PINTAR = [
		{ value: '', label: 'Nada' },
		{ value: 'faccion', label: 'Facción' },
		{ value: 'region', label: 'Región' },
		{ value: 'seguridad', label: 'Seguridad' }
	];

	const TERRITORIOS = [
		{ value: '', label: 'Ninguno' },
		{ value: 'region', label: 'Regiones' },
		{ value: 'constelacion', label: 'Constelaciones' }
	];

	/**
	 * Con qué color pinta el mapa cada sistema.
	 *
	 * **Un solo criterio a la vez, y es el que tiene leyenda.** Si el color dijera
	 * bandera y el tamaño estaciones y el halo servicios, el mapa dejaría de leerse.
	 */
	const CRITERIOS: Record<string, (nodo: NodoGalaxia) => string> = {
		// El color de una facción es suyo y está en el catálogo: rojo el Dominio, azul
		// la Concordia y verde el Pacto, en todo el juego.
		faccion: (nodo) => (nodo.faction ? getFaction(nodo.faction).color : 'var(--color-text-muted)'),
		region: (nodo) => colorFor(nodo.region, nodo.regionColor),
		// La seguridad no es una categoría sino una escala, así que va con los colores
		// que el juego ya usa para decir cuánta ley hay.
		seguridad: (nodo) =>
			nodo.security >= 55
				? 'var(--color-success)'
				: nodo.security >= 25
					? 'var(--color-warning)'
					: 'var(--color-danger)'
	};

	let pintar = $derived(consulta.paint ? CRITERIOS[consulta.paint] : undefined);

	let territorio = $derived(
		consulta.territory === 'region'
			? {
					key: (nodo: NodoGalaxia) => nodo.region,
					color: (nodo: NodoGalaxia) => colorFor(nodo.region, nodo.regionColor),
					label: (nodo: NodoGalaxia) => nodo.region
				}
			: consulta.territory === 'constelacion'
				? {
						key: (nodo: NodoGalaxia) => nodo.constellation,
						color: (nodo: NodoGalaxia) => colorFor(nodo.constellation, nodo.constellationColor),
						label: (nodo: NodoGalaxia) => nodo.constellation
					}
				: undefined
	);

	/**
	 * Qué significa cada color cuando el mapa está pintado.
	 *
	 * Sale de los sistemas que hay y no de una lista escrita al lado: así nombra
	 * exactamente las banderas y regiones que existen.
	 */
	let leyendaPintura = $derived.by(() => {
		const pinta = pintar;
		if (!pinta) return [];

		const vistos: Record<string, string> = {};
		for (const nodo of galaxia.map.systems) {
			const etiqueta =
				consulta.paint === 'faccion'
					? nodo.factionName
					: consulta.paint === 'region'
						? nodo.region
						: nodo.securityLevel;
			if (etiqueta && !(etiqueta in vistos)) vistos[etiqueta] = pinta(nodo);
		}
		return Object.entries(vistos).map(([label, color]) => ({ label, color }));
	});

	/**
	 * Qué significa cada trazo.
	 *
	 * **Es más corta que la del cuartel**, y a propósito: el piloto no ve puertas
	 * sin conectar ni sistemas a la deriva, así que nombrarlos sería explicar algo
	 * que no está en pantalla. Lo que sí lleva —y el cuartel no— es la diferencia
	 * entre la salida que podés cruzar y la que no.
	 */
	const LEYENDA = [
		{ label: 'Podés cruzarla', color: 'var(--color-accent)' },
		{ label: 'Salida del elegido', color: 'var(--color-accent-bright)' },
		{ label: 'Otra conexión', color: 'var(--color-accent-dim)' },
		{ label: 'Atajo', color: 'var(--color-data)' },
		{ label: 'Paso cerrado', color: 'var(--color-danger)' }
	];

	let hayFiltro = $derived(
		Boolean(
			consulta.search ||
			consulta.faction ||
			consulta.region ||
			consulta.security ||
			consulta.service ||
			consulta.corporation ||
			consulta.paint ||
			consulta.territory
		)
	);

	/** Cuántos recortes quitan sistemas de la vista, para decirlo al lado. */
	let cuantosFiltros = $derived(
		[
			consulta.search,
			consulta.faction,
			consulta.region,
			consulta.security,
			consulta.service,
			consulta.corporation
		].filter(Boolean).length
	);

	let visibles = $derived(new Set(galaxia.matches));

	/**
	 * Si se puede dar la orden de viajar.
	 *
	 * Sale de la misma fuente que explica el verbo, así que **el botón apagado y el
	 * cartel que dice por qué no pueden contradecirse**: los dos leen el mismo
	 * motivo.
	 */
	let puedeViajar = $derived(galaxia.travelSource.blockers.length === 0);

	let elegidoNodo = $derived(galaxia.map.systems.find((uno) => uno.code === elegido) ?? null);

	/** Si lo elegido es donde estás parado. */
	let esAqui = $derived(elegido !== '' && elegido === galaxia.pilot.system);

	/** La salida que lleva a lo elegido, si hay una puerta directa desde acá. */
	let salidaElegida = $derived(galaxia.exits.find((una) => una.code === elegido) ?? null);

	/**
	 * A cuántos saltos queda lo elegido, escrito.
	 *
	 * **Que no esté en la lista no es que esté lejos: es que no se llega.** Un
	 * número grande diría que hay camino, y a veces no lo hay —ni por una puerta
	 * cerrada ni por un ramal que nadie conectó—.
	 */
	let saltos = $derived.by(() => {
		if (!elegidoNodo) return '';
		if (esAqui) return 'Estás acá';
		const cuantos = galaxia.pilot.jumps[elegidoNodo.code];
		if (cuantos === undefined) return 'Sin ruta conocida';
		return cuantos === 1 ? 'A 1 salto' : `A ${cuantos} saltos`;
	});

	/** Lleva el mapa hasta un sistema y lo deja elegido. */
	function mostrarEnMapa(code: string) {
		elegidoAMano = code;
		mapa?.centrar(code);
	}

	let detalleMapa = $derived(
		cuantosFiltros > 0
			? `${galaxia.found} de ${galaxia.total}`
			: `${galaxia.total} sistemas conocidos`
	);
</script>

<svelte:window onkeydown={alTeclear} />

<!-- Un rótulo y su valor, que la ficha repite varias veces. -->
{#snippet lectura(titulo: string, valor: string)}
	<Label>{titulo}</Label>
	<span class="text-1 text-text-body">{valor}</span>
{/snippet}

<!--
	Una salida, con las dos mitades de lo que cuesta usarla: el viaje hasta la
	puerta —que es lo que este botón ordena— y el salto que viene después.

	**El salto se muestra aunque no se pueda dar.** Saber que faltan doce de
	combustible antes de cruzar medio sistema es la diferencia entre planear y
	descubrir; enterarse recién al llegar a la puerta es un viaje perdido.
-->
{#snippet filaSalida(salida: SalidaGalaxia)}
	<div class="flex w-full flex-col gap-1 border-t border-border-soft pt-2">
		<div class="flex w-full flex-wrap items-baseline gap-x-2">
			<span class="font-display text-[0.62rem] tracking-label text-accent-dim uppercase">
				{salida.bearing}
			</span>
			<button
				type="button"
				class="min-w-0 cursor-pointer truncate border-0 bg-transparent p-0 text-left text-1
					text-text-body hover:text-accent-bright"
				onclick={() => mostrarEnMapa(salida.code)}
			>
				{salida.name}
			</button>
			<span class="font-mono text-[0.7rem] text-data">{salida.distance}</span>
		</div>

		<span class="text-[0.7rem] text-text-muted">
			Por {salida.gate} · {salida.travelDistance} · {salida.travelDuration}
		</span>

		<span class="font-mono text-[0.68rem] text-text-muted">
			Salto {salida.duration} · {salida.fuel}
		</span>

		{#if salida.blocked}
			<span class="text-[0.7rem] text-warning">{salida.blocked}</span>
		{/if}

		{#if salida.standingThere}
			<!--
				Ya estás en la puerta: lo que falta es el salto, y el salto se da desde
				Ubicación, que es la pantalla del lugar donde estás parado. Mandar ahí es
				más honesto que repetir el botón acá y que diga lo mismo.
			-->
			<HudLink href="/navegacion" variant="primary" size="1" class="mt-1">
				<Icon name="rocket-launch" weight="bold" size="0.7rem" />
				Estás en la puerta: saltar
			</HudLink>
		{:else}
			<ConfirmAction
				formAction="?/viajar"
				title="Viajar a {salida.gate}"
				icon="rocket-launch"
				confirmLabel="Viajar"
				disabled={!puedeViajar}
				readings={[
					{ label: 'Distancia', value: salida.travelDistance },
					{ label: 'Duración', value: salida.travelDuration },
					{ label: 'Del otro lado', value: salida.name }
				]}
				note="Mientras dure el viaje no vas a poder dar otra orden. El salto se da al llegar."
				source={galaxia.travelSource}
			>
				{#snippet trigger(abrir)}
					<ActionSource source={galaxia.travelSource}>
						<HudButton
							type="button"
							variant="outline"
							size="1"
							disabled={!puedeViajar}
							onclick={abrir}
							class="mt-1 {puedeViajar ? '' : 'cursor-not-allowed opacity-45'}"
						>
							<Icon name="rocket-launch" weight="bold" size="0.7rem" />
							Viajar a {salida.gate}
						</HudButton>
					</ActionSource>
				{/snippet}
				{#snippet fields()}
					<input type="hidden" name="destino" value={salida.gateCode} />
				{/snippet}
			</ConfirmAction>
		{/if}
	</div>
{/snippet}

<svelte:head><title>Galaxia · Navegación · Vaxav</title></svelte:head>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Navegación</Eyebrow>
	<DisplayTitle>Galaxia</DisplayTitle>
</div>

<ErrorCallout message={form?.error} />

{#snippet camposDeFiltro()}
	<div class="flex w-full flex-wrap items-end gap-3">
		<div class="w-full min-w-0 xs:w-[11rem]">
			<TextField
				label="Buscar"
				name="buscar"
				size="1"
				value={consulta.search}
				placeholder="Nombre"
			/>
		</div>

		<div class="w-full min-w-0 xs:w-[9.5rem]">
			<SelectField
				label="Bandera"
				name="faccion"
				size="1"
				onchange={alCambiar}
				value={consulta.faction}
				options={opcionesFaccion}
			/>
		</div>

		<div class="w-full min-w-0 xs:w-[9.5rem]">
			<SelectField
				label="Región"
				name="region"
				size="1"
				onchange={alCambiar}
				value={consulta.region}
				options={opcionesRegion}
			/>
		</div>

		<div class="w-full min-w-0 xs:w-[9.5rem]">
			<SelectField
				label="Seguridad"
				name="seguridad"
				size="1"
				onchange={alCambiar}
				value={consulta.security}
				options={OPCIONES_SEGURIDAD}
			/>
		</div>

		<!--
			El único filtro que contesta «¿me conviene ir?» en vez de «¿cómo es ese
			lugar?». Por eso está, aunque hoy casi todos los sistemas tengan lo mismo:
			es el que va a decidir viajes cuando los servicios se repartan.
		-->
		<div class="w-full min-w-0 xs:w-[9.5rem]">
			<SelectField
				label="Servicio"
				name="servicio"
				size="1"
				onchange={alCambiar}
				value={consulta.service}
				options={OPCIONES_SERVICIO}
			/>
		</div>

		<!--
			Dónde tiene puestos una corporación. Lo enciende el botón «ver en el mapa»
			de la pestaña Corporación, y está acá para poder verlo puesto y sacarlo:
			un recorte que llega por la URL y no tiene control es un mapa al que le
			faltan sistemas sin que nada diga por qué.
		-->
		<div class="w-full min-w-0 xs:w-[9.5rem]">
			<SelectField
				label="Corporación"
				name="corporacion"
				size="1"
				onchange={alCambiar}
				value={consulta.corporation}
				options={opcionesCorporacion}
			/>
		</div>
	</div>

	<div class="flex w-full flex-wrap items-end gap-3 border-t border-border-soft/60 pt-[0.6rem]">
		<!--
			Cómo se mira el mapa, no qué se muestra. Van con los filtros porque son la
			misma clase de decisión —qué recorte de la galaxia estoy viendo— pero en la
			fila de las acciones, separadas de lo que apaga sistemas.
		-->
		<div class="w-full min-w-0 xs:w-[9.5rem]">
			<SelectField
				label="Pintar por"
				name="pintar"
				size="1"
				onchange={alCambiar}
				value={consulta.paint}
				options={PINTAR}
			/>
		</div>

		<div class="w-full min-w-0 xs:w-[9.5rem]">
			<SelectField
				label="Territorios"
				name="territorio"
				size="1"
				onchange={alCambiar}
				value={consulta.territory}
				options={TERRITORIOS}
			/>
		</div>

		<HudButton type="submit" size="1" variant="primary">
			<Icon name="magnifying-glass" weight="bold" size="0.7rem" />
			Filtrar
		</HudButton>

		{#if hayFiltro}
			<HudLink href="?" size="1" variant="outline">
				<Icon name="x" weight="bold" size="0.7rem" />
				Quitar filtros
			</HudLink>
		{/if}
	</div>
{/snippet}

{#snippet accionesDeFiltro()}
	{#if hayFiltro}
		<HudLink href="?" size="1" variant="outline">
			<Icon name="x" weight="bold" size="0.7rem" />
			Quitar
		</HudLink>
	{/if}
	<span
		class="border border-border-soft bg-well px-[0.45rem] py-[0.3rem] font-mono text-[0.68rem]
			whitespace-nowrap text-text-muted"
	>
		{galaxia.found} de {galaxia.total}
	</span>
{/snippet}

{#snippet lienzoDelMapa()}
	<GalaxyMap
		bind:this={mapa}
		bind:camera={camara}
		bind:fitted={encuadrado}
		map={galaxia.map}
		pilot={galaxia.pilot}
		focus={galaxia.pilot.system}
		debt={false}
		selected={elegido}
		visible={visibles}
		paint={pintar}
		territory={territorio}
		expanded={agrandado}
		onToggleExpand={alternarAgrandado}
		onSelect={(code) => (elegidoAMano = code)}
	/>
{/snippet}

{#snippet leyendasDelMapa()}
	<GalaxyLegend paint={leyendaPintura} strokes={LEYENDA} />
{/snippet}

{#snippet fichaDelMapa()}
	{#if elegidoNodo}
		<!--
			Mide lo mismo que el lienzo y desborda hacia adentro: una ficha que crece
			con el contenido corre el resto de la pantalla cada vez que se elige un
			sistema con más salidas que el anterior.
		-->
		<div
			class="flex w-full flex-col gap-3 overflow-y-auto border border-border-soft bg-surface
				p-[0.9rem] lg:h-full"
		>
			<div class="flex flex-col items-start gap-1">
				<Label>{elegidoNodo.region} · {elegidoNodo.constellation}</Label>
				<CardTitle>{elegidoNodo.name}</CardTitle>
				<!--
					Lo primero después del nombre, y no un dato más de la grilla: «a cuántos
					saltos» es lo que convierte un punto del mapa en una decisión.
				-->
				<span
					class="font-display text-[0.7rem] tracking-label uppercase
						{esAqui ? 'text-data' : saltos === 'Sin ruta conocida' ? 'text-warning' : 'text-accent'}"
				>
					{saltos}
				</span>
			</div>

			<div class="grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-[0.3rem]">
				{@render lectura('Bandera', elegidoNodo.factionName)}
				{@render lectura('Seguridad', `${elegidoNodo.securityLevel} ${elegidoNodo.security}`)}
				{@render lectura('Gobierno', elegidoNodo.government)}
			</div>

			<!--
				Los servicios, que es lo accionable de un sistema ajeno: dice si vale la
				pena ir. La casilla y el contenido crudo se quedan en el cuartel, que es
				donde significan algo.
			-->
			<div class="flex w-full flex-col gap-1 border-t border-border-soft pt-2">
				<Label>Servicios</Label>
				{#if elegidoNodo.services.length > 0}
					<div class="flex flex-wrap items-center gap-x-3 gap-y-1">
						{#each elegidoNodo.services as servicio (servicio)}
							<span class="flex items-center gap-[0.35rem] text-1 text-text-body">
								<Icon
									name={serviceIcon(servicio as StationServiceKind)}
									weight="bold"
									size="0.75rem"
									class="text-accent"
								/>
								{serviceLabel(servicio as StationServiceKind)}
							</span>
						{/each}
					</div>
				{:else}
					<span class="text-1 text-text-muted">
						{elegidoNodo.stations > 0
							? 'Tiene estaciones, pero ninguna presta servicios.'
							: 'Sin estaciones: no hay dónde atracar.'}
					</span>
				{/if}
			</div>

			<!--
				Desde acá se sale por estas puertas. Cuando lo elegido es otro sistema, se
				muestra sólo la que lleva ahí: el resto no contesta la pregunta que se
				acaba de hacer.
			-->
			{#if esAqui}
				{#if galaxia.exits.length > 0}
					<Label>Salidas</Label>
					{#each galaxia.exits as salida (salida.gateCode)}
						{@render filaSalida(salida)}
					{/each}
				{:else}
					<p class="border-t border-border-soft pt-2 text-1 text-text-muted">
						No hay ninguna puerta terminada en este sistema. Por ahora no se sale de acá.
					</p>
				{/if}
			{:else if salidaElegida}
				{@render filaSalida(salidaElegida)}
			{:else}
				<p class="border-t border-border-soft pt-2 text-1 text-text-muted">
					No hay puerta directa desde donde estás. Habría que llegar saltando de sistema en sistema.
				</p>
			{/if}
		</div>
	{:else}
		<div
			class="flex w-full flex-col gap-2 overflow-y-auto border border-dead-border p-[0.9rem]
				lg:h-full"
		>
			<CardTitle>Nada elegido</CardTitle>
			<BodyText>
				Tocá un sistema del mapa para ver qué hay y cómo llegar. Se arrastra para moverlo y la rueda
				acerca.
			</BodyText>
		</div>
	{/if}
{/snippet}

<GalaxyStage
	bind:filtersOpen={filtrosAbiertos}
	bind:cardOpen={fichaAbierta}
	cardLabel={elegidoNodo?.name ?? 'Sistema'}
	title="Mapa de la galaxia"
	detail={detalleMapa}
	expanded={agrandado}
	showCard={elegidoNodo !== null}
	map={lienzoDelMapa}
	filters={camposDeFiltro}
	filterActions={accionesDeFiltro}
	card={fichaDelMapa}
	legend={leyendasDelMapa}
/>

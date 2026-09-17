<!--
	El universo: qué sistemas hay y de dónde salen los nuevos.

	La tabla va ordenada por sistema y no agrupada por región, aunque la región
	esté ahí. Agrupar parece lo natural y es peor para lo que uno hace acá: buscar
	un sistema por nombre. Con encabezados de grupo, encontrar «Vela» obliga a
	acordarse primero en qué región cayó.

	**Las puertas sueltas se cuentan aparte y se destacan.** Es el único dato de la
	tabla que señala trabajo a medio hacer: una salida plantada que todavía no
	lleva a ninguna parte. Un universo sano tiene cero, y por eso la cifra se
	enciende cuando no lo es.
-->
<script lang="ts">
	import { submitting } from '$lib/forms.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import GalaxyMap from '$lib/components/admin/GalaxyMap.svelte';
	import SelectField from '$lib/components/admin/SelectField.svelte';
	import HudLink from '$lib/components/buttons/HudLink.svelte';
	import HudButton from '$lib/components/buttons/HudButton.svelte';
	import Panel from '$lib/components/cards/Panel.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import ErrorCallout from '$lib/components/forms/ErrorCallout.svelte';
	import SuccessCallout from '$lib/components/forms/SuccessCallout.svelte';
	import TextField from '$lib/components/forms/TextField.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import CardTitle from '$lib/components/typography/CardTitle.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import Label from '$lib/components/typography/Label.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Paginator from '$lib/components/ui/Paginator.svelte';
	import HudTable, { type Columna } from '$lib/components/ui/HudTable.svelte';
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { ADMIN_ROUTE } from '$lib/admin';
	import { FREE_SPACE } from '$lib/admin';
	import { bearingLabel } from '$lib/format';
	import { oppositeBearing, type GateBearing } from '$lib/game/universe';
	import type { NodoGalaxia } from '$lib/tipos';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	/**
	 * Un solo control de envío para toda la pantalla.
	 *
	 * Compartido a propósito: son formularios que escriben sobre la misma fila,
	 * y dos envíos en paralelo pueden pisarse. Mientras uno viaja, los demás
	 * botones se apagan.
	 */
	const envio = submitting();

	let universo = $derived(data.universo);
	let opciones = $derived(universo.options);

	let abierto = $state(false);

	/** Lo que el formulario tiene cargado ahora mismo. */
	let constellationId = $state('');
	let government = $state('corporate');
	let faction = $state('');

	/** El gobierno elegido, con su banda. */
	let banda = $derived(
		opciones.governments.find((uno) => uno.value === government) ?? opciones.governments[0]
	);

	/**
	 * Hasta dónde puede llegar la seguridad con lo que hay elegido.
	 *
	 * Se acota **en el control** además de en el servidor: el servidor es quien
	 * decide, pero un control que deja elegir un número que va a rebotar hace
	 * perder el formulario entero para nada.
	 */
	let minimo = $derived(faction ? banda.min : banda.freeMin);
	let maximo = $derived(faction ? banda.max : banda.freeMax);

	/**
	 * El número propuesto, que se puede pisar moviendo el deslizador.
	 *
	 * Es un `$derived` **escribible**, que es justo la forma de «esto se propone
	 * solo hasta que alguien lo toca»: mientras nadie lo mueva sigue al medio de
	 * la banda, y al cambiar de gobierno o de dueño vuelve a proponerse en vez de
	 * quedar con un valor que el servidor va a rechazar.
	 */
	let security = $derived(Math.floor((minimo + maximo) / 2));

	let nuevaRegion = $state(false);
	let nuevaConstelacion = $state(false);

	let consulta = $derived(universo.query);

	/**
	 * Las opciones de los filtros.
	 *
	 * **No se reusan las del alta de sistema.** Ahí el valor vacío significa
	 * «espacio libre» —un sistema que no controla nadie— y en un filtro significa
	 * «todas». Son dos cosas distintas con la misma cadena, así que el espacio libre
	 * se pide con un centinela y el vacío queda para no filtrar.
	 */
	let opcionesFaccion = $derived([
		{ value: '', label: 'Todas' },
		{ value: FREE_SPACE, label: 'Espacio libre' },
		...universo.options.factions.filter((una) => una.value !== '')
	]);

	/**
	 * Las regiones, con el nombre como valor.
	 *
	 * La fila del listado guarda el nombre de la región y no su código, así que el
	 * filtro compara nombres. Se quitan las repetidas por las dudas: dos regiones
	 * con el mismo nombre dejarían dos opciones con la misma clave, y una lista con
	 * claves repetidas no se dibuja.
	 */
	let opcionesRegion = $derived([
		{ value: '', label: 'Todas' },
		...[...new Set(universo.options.regions.map((una) => una.label))].map((nombre) => ({
			value: nombre,
			label: nombre
		}))
	]);

	let opcionesGobierno = $derived([
		{ value: '', label: 'Todos' },
		...universo.options.governments.map((una) => ({ value: una.value, label: una.label }))
	]);

	/** Por que criterio se puede pintar el mapa. Otra tabla que crece con una fila. */
	const PINTAR = [
		{ value: '', label: 'Nada' },
		{ value: 'faccion', label: 'Facción' },
		{ value: 'region', label: 'Región' },
		{ value: 'gobierno', label: 'Gobierno' },
		{ value: 'seguridad', label: 'Seguridad' }
	];

	/** Si hay algun recorte puesto, para ofrecer limpiarlo y decir cuantos quedan. */
	let hayFiltro = $derived(
		Boolean(consulta.search || consulta.faction || consulta.region || consulta.government)
	);

	/** Los que pasan el filtro, para que el mapa apague el resto. */
	let visibles = $derived(new Set(universo.matches));

	/**
	 * Con qué color pinta el mapa cada sistema.
	 *
	 * **Un solo criterio a la vez, y es el que tiene leyenda.** Si el color dijera
	 * facción y el tamaño estaciones y el halo servicios, el mapa dejaría de leerse.
	 * Agregar un criterio nuevo es agregar una entrada acá y una opción en el
	 * select: por eso es una tabla y no un `if`.
	 */
	const PALETA = ['#ff7a1a', '#4fd2ee', '#5bd46b', '#ffc14d', '#ff4a3d', '#b48ce8', '#e88ca8'];

	/** El mismo valor recibe el mismo color en cada carga, que es lo que hace que el
	 * mapa se pueda comparar consigo mismo de un día al otro. */
	function tono(clave: string): string {
		if (!clave) return 'var(--color-text-muted)';
		let suma = 0;
		for (const letra of clave) suma = (suma * 31 + letra.charCodeAt(0)) % 100000;
		return PALETA[suma % PALETA.length];
	}

	const CRITERIOS: Record<string, (nodo: NodoGalaxia) => string> = {
		faccion: (nodo) => tono(nodo.faction),
		region: (nodo) => tono(nodo.region),
		gobierno: (nodo) => tono(nodo.government),
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

	/** La URL con un parámetro cambiado, conservando todo lo demás. */
	function conParametro(cambios: Record<string, string>): string {
		// Una copia efímera que se lee y se tira en la misma línea: no es estado, así
		// que no hace falta la versión reactiva.
		const params = new SvelteURLSearchParams(page.url.searchParams);
		for (const [clave, valor] of Object.entries(cambios)) {
			if (valor) params.set(clave, valor);
			else params.delete(clave);
		}
		// Cambiar cualquier cosa vuelve a la primera página: quedarse en la siete de
		// un listado que ahora tiene dos es una pantalla vacía sin explicación.
		if (!('pagina' in cambios)) params.delete('pagina');
		const texto = params.toString();
		return texto ? `?${texto}` : '?';
	}

	/** El enlace de un encabezado: ordena por esa columna, y la segunda vez al revés. */
	function ordenPor(columna: string): string {
		const mismo = consulta.sort === columna;
		return conParametro({ orden: columna, dir: mismo && consulta.dir === 'asc' ? 'desc' : 'asc' });
	}

	/** Las columnas del listado, con la misma clave de orden que usa el servidor. */
	const COLUMNAS: Columna[] = [
		{ key: 'nombre', label: 'Sistema', width: '12rem' },
		{ key: 'donde', label: 'Dónde', width: '12rem', from: 'md' },
		{ key: 'gobierno', label: 'Gobierno', width: '9rem' },
		{ key: 'seguridad', label: 'Seguridad', width: '7rem', class: 'text-right' },
		{ key: 'controla', label: 'Controla', width: '10rem' },
		{ key: 'contenido', label: 'Contenido', width: '9.5rem', class: 'text-right' },
		{ label: '', width: '3rem' }
	];

	/**
	 * Lleva el mapa hasta un sistema y lo deja elegido.
	 *
	 * También sube la pantalla hasta el mapa: el botón vive en la tabla, que está
	 * abajo, y centrar algo que el que lo apretó no puede ver es no hacer nada.
	 */
	function mostrarEnMapa(code: string) {
		elegido = code;
		mapa?.centrar(code);
		panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	/** El rumbo, escrito. Viene como código del servidor y se lee como palabra. */
	const rumbo = (code: string) => bearingLabel(code as GateBearing);

	/** El sistema elegido en el mapa, que la barra lateral describe. */
	let elegido = $state('');
	let mapa = $state<GalaxyMap>();
	let panel = $state<HTMLDivElement>();

	let elegidoNodo = $derived(universo.map.systems.find((uno) => uno.code === elegido) ?? null);
	/** Los nombres de los sistemas, para leer un enlace sin volver a buscarlo. */
	let nombres = $derived(new Map(universo.map.systems.map((uno) => [uno.code, uno.name])));

	/**
	 * Las salidas del sistema elegido, ya resueltas.
	 *
	 * Los enlaces del mapa van en un solo sentido por par —una linea por pasaje, no
	 * dos— asi que hay que mirar las dos puntas para juntar las de un sistema.
	 */
	let salidas = $derived(
		elegidoNodo
			? universo.map.links
					.filter((uno) => uno.from === elegidoNodo.code || uno.to === elegidoNodo.code)
					.map((uno) => {
						const suyo = uno.from === elegidoNodo.code;
						return {
							code: suyo ? uno.to : uno.from,
							name: nombres.get(suyo ? uno.to : uno.from) ?? '',
							// El rumbo guardado es el de la punta `from`: desde la otra se sale
							// por el de enfrente.
							bearing: suyo ? uno.bearing : oppositeBearing(uno.bearing as GateBearing),
							distance: uno.distance,
							closed: uno.closed,
							shortcut: uno.shortcut
						};
					})
			: []
	);

	let detalleMapa = $derived(
		universo.map.adrift > 0
			? `${universo.map.adrift} fuera del mapa`
			: `${universo.map.systems.length} sistemas`
	);

	/**
	 * Qué significa cada trazo. Los colores salen de las variables del tema, igual
	 * que en el lienzo: una leyenda que no pinta lo mismo que el mapa es peor que
	 * no tener leyenda.
	 */
	const LEYENDA = [
		{ label: 'Conexión', color: 'var(--color-accent-dim)' },
		{ label: 'Atajo', color: 'var(--color-data)' },
		{ label: 'Paso cerrado', color: 'var(--color-danger)' },
		{ label: 'Puerta sin conectar', color: 'var(--color-warning)' }
	];
</script>

<!-- Un rótulo y su valor, que la ficha del mapa repite seis veces. -->
{#snippet lectura(titulo: string, valor: string)}
	<Label>{titulo}</Label>
	<span class="text-1 text-text-body">{valor}</span>
{/snippet}

<svelte:head><title>Universo · Cuartel general · Vaxav</title></svelte:head>

<div class="flex w-full flex-wrap items-end justify-between gap-4">
	<div class="flex flex-col items-start gap-1">
		<Eyebrow>Cuartel general</Eyebrow>
		<DisplayTitle>Universo</DisplayTitle>
	</div>
	<HudButton variant="primary" onclick={() => (abierto = true)}>
		<Icon name="planet" weight="bold" size="0.8rem" />
		Crear sistema
	</HudButton>
</div>

<!--
	Que algo se borró hay que decirlo **en la pantalla a la que se vuelve**. Sin
	esto, el sistema desaparece de la lista y quien lo borró no sabe si pasó por
	haberlo apretado o porque estaba mirando mal.
-->
<SuccessCallout message={data.aviso} />

<div class="flex w-full flex-wrap items-start gap-x-6 gap-y-3">
	<div class="flex flex-col items-start gap-1">
		<Label>Sistemas</Label>
		<!--
			El total del universo, no el de la página. Estos cuatro números dicen cómo
			está la galaxia; el recorte lo cuenta la barra de filtros, al lado de
			«Limpiar». Mezclarlos haría que filtrar parezca haber borrado sistemas.
		-->
		<span class="font-mono text-3 text-text-body">{universo.total}</span>
	</div>
	<div class="flex flex-col items-start gap-1">
		<Label>Cuerpos</Label>
		<span class="font-mono text-3 text-text-body">{universo.totalBodies}</span>
	</div>
	<div class="flex flex-col items-start gap-1">
		<Label>Puertas</Label>
		<span class="font-mono text-3 text-text-body">{universo.totalGates}</span>
	</div>
	<div class="flex flex-col items-start gap-1">
		<Label>Sin conectar</Label>
		<span class="font-mono text-3 {universo.totalLoose > 0 ? 'text-warning' : 'text-text-muted'}">
			{universo.totalLoose}
		</span>
	</div>
</div>

{#if universo.systems.length === 0}
	<Panel class="w-full">
		<div class="flex flex-col items-start gap-2">
			<CardTitle>Todavía no hay ningún sistema</CardTitle>
			<BodyText>
				Un sistema nace con su estrella y un lugar en una constelación. Después se le cuelgan
				planetas, lunas, cinturones, estaciones y las puertas que lo unen con sus vecinos.
			</BodyText>
		</div>
	</Panel>
{:else}
	<!--
		El mapa: la figura de esta pantalla.

		Contesta lo que ninguna tabla contesta —la forma del conjunto, dónde quedó el
		agujero, qué ramal no llega a ninguna parte— y por eso convive con la tabla de
		abajo en vez de reemplazarla. Para «llevame a Omega» una tabla ordenable es
		más rápida que buscar un punto; para «¿dónde está el hueco de mi galaxia?»
		sólo sirve el mapa.
	-->
	<!--
		Los filtros, arriba del mapa y de la tabla porque valen para los dos: el mismo
		recorte apaga sistemas en el mapa y quita filas de la lista. Dos filtros
		separados serían dos pantallas que no se hablan.

		Es un formulario `GET`: los filtros viajan en la URL, así que un recorte se
		puede compartir, se vuelve con el botón de atrás y se recarga sin perderlo.
	-->
	<form
		method="GET"
		class="flex w-full flex-wrap items-end gap-3 border border-border-soft bg-surface
			px-[0.9rem] py-[0.7rem]"
	>
		<div class="w-full min-w-0 xs:w-[12rem]">
			<TextField
				label="Buscar"
				name="buscar"
				size="1"
				value={consulta.search}
				placeholder="Nombre"
			/>
		</div>

		<div class="w-full min-w-0 xs:w-[10rem]">
			<SelectField
				label="Facción"
				name="faccion"
				size="1"
				value={consulta.faction}
				options={opcionesFaccion}
			/>
		</div>

		<div class="w-full min-w-0 xs:w-[10rem]">
			<SelectField
				label="Región"
				name="region"
				size="1"
				value={consulta.region}
				options={opcionesRegion}
			/>
		</div>

		<div class="w-full min-w-0 xs:w-[10rem]">
			<SelectField
				label="Gobierno"
				name="gobierno"
				size="1"
				value={consulta.government}
				options={opcionesGobierno}
			/>
		</div>

		<!--
			De que color pinta el mapa. Va con los filtros y no adentro del mapa porque
			es la misma clase de decision: que recorte de la galaxia estoy mirando.
		-->
		<div class="w-full min-w-0 xs:w-[10rem]">
			<SelectField
				label="Pintar por"
				name="pintar"
				size="1"
				value={consulta.paint}
				options={PINTAR}
			/>
		</div>

		<!-- El orden viaja en la URL: sin esto, filtrar lo perderia. -->
		<input type="hidden" name="orden" value={consulta.sort} />
		<input type="hidden" name="dir" value={consulta.dir} />

		<HudButton type="submit" size="1" variant="primary">
			<Icon name="magnifying-glass" weight="bold" size="0.7rem" />
			Filtrar
		</HudButton>

		{#if hayFiltro}
			<HudLink href="?" size="1" variant="ghost">Limpiar</HudLink>
			<span class="font-mono text-[0.72rem] text-text-muted">
				{universo.found} de {universo.total}
			</span>
		{/if}
	</form>

	<div bind:this={panel} class="w-full scroll-mt-4">
		<TitledPanel title="Mapa de la galaxia" detail={detalleMapa} class="w-full">
			<div class="flex w-full flex-col items-start gap-[1.25rem] lg:h-[28rem] lg:flex-row">
				<div class="flex h-[26rem] w-full min-w-0 flex-col gap-2 lg:h-full lg:flex-[3_1_0]">
					<GalaxyMap
						bind:this={mapa}
						map={universo.map}
						selected={elegido}
						visible={visibles}
						paint={pintar}
						onSelect={(code) => (elegido = elegido === code ? '' : code)}
					/>

					<!--
					La leyenda. Un mapa que codifica cinco cosas en el trazo y no dice
					cuáles es un mapa que hay que adivinar.
				-->
					<div class="flex w-full flex-wrap items-center gap-x-4 gap-y-2">
						{#each LEYENDA as entrada (entrada.label)}
							<span class="flex items-center gap-[0.4rem]">
								<span
									class="inline-block h-[2px] w-[1.1rem] shrink-0"
									style="background: {entrada.color}"
								></span>
								<span class="text-[0.62rem] tracking-label text-text-muted uppercase">
									{entrada.label}
								</span>
							</span>
						{/each}
						<div class="grow"></div>
						<HudButton size="1" variant="ghost" onclick={() => mapa?.encuadrar()}>
							<Icon name="arrows-out" weight="bold" size="0.7rem" />
							Encuadrar
						</HudButton>
					</div>
				</div>

				<!--
				La barra lateral y no un globo flotante: lo que va a crecer acá son
				acciones —ir al constructor, plantar una puerta, cerrar un paso— y un
				globo con seis botones es un menú disfrazado. Además tapa el mapa justo
				donde uno está mirando.
			-->
				<div class="w-full min-w-0 lg:h-full lg:flex-[1_1_0]">
					{#if elegidoNodo}
						<!--
						Mide lo mismo que el lienzo y desborda hacia adentro. Una ficha que
						crece con el contenido corre el resto de la pantalla cada vez que se
						elige un sistema con más salidas que el anterior.
					-->
						<div
							class="flex w-full flex-col gap-3 overflow-y-auto border border-border-soft bg-surface
							p-[0.9rem] lg:h-full"
						>
							<div class="flex flex-col items-start gap-1">
								<Label>{elegidoNodo.region} · {elegidoNodo.constellation}</Label>
								<CardTitle>{elegidoNodo.name}</CardTitle>
							</div>

							{#if elegidoNodo.adrift}
								<p class="text-1 text-danger">
									No llega caminando hasta el sistema inicial: su casilla todavía no significa nada.
									Conectale una puerta a algo que sí esté en el mapa.
								</p>
							{/if}

							<div class="grid grid-cols-[auto_1fr] items-baseline gap-x-3 gap-y-[0.3rem]">
								{@render lectura('Gobierno', elegidoNodo.government)}
								{@render lectura(
									'Seguridad',
									`${elegidoNodo.securityLevel} ${elegidoNodo.security}`
								)}
								{@render lectura('Facción', elegidoNodo.factionName)}
								{@render lectura(
									'Casilla',
									`${elegidoNodo.hex.x} · ${elegidoNodo.hex.y} · ${elegidoNodo.hex.z}`
								)}
								{@render lectura(
									'Contenido',
									`${elegidoNodo.bodies} cuerpos · ${elegidoNodo.stations} estaciones`
								)}
								{@render lectura('Salidas', `${elegidoNodo.gates} de 6`)}
								{#if elegidoNodo.looseBearings.length > 0}
									{@render lectura(
										'Sin conectar',
										elegidoNodo.looseBearings.map(rumbo).join(' · ')
									)}
								{/if}
								{#if elegidoNodo.free.length > 0}
									{@render lectura('Rumbos libres', elegidoNodo.free.map(rumbo).join(' · '))}
								{/if}
							</div>

							<!--
							Las salidas, una por una. Es lo que convierte la ficha en algo que se
							usa: el mapa dice que hay tres puertas, y esto dice adonde va cada una,
							cuanto mide el salto y cual esta cerrada. Sin esto hay que abrir el
							constructor para saber algo que el servidor ya mando.
						-->
							{#if salidas.length > 0}
								<div class="flex w-full flex-col gap-1 border-t border-border-soft pt-2">
									<Label>Salidas</Label>
									{#each salidas as salida (salida.bearing)}
										<div class="flex w-full flex-wrap items-baseline gap-x-2">
											<span
												class="w-[4.5rem] shrink-0 font-display text-[0.62rem] tracking-label
												text-accent-dim uppercase"
											>
												{rumbo(salida.bearing)}
											</span>
											<button
												type="button"
												class="min-w-0 cursor-pointer truncate border-0 bg-transparent p-0 text-left
												text-1 text-text-body hover:text-accent-bright"
												onclick={() => mostrarEnMapa(salida.code)}
											>
												{salida.name}
											</button>
											<span class="font-mono text-[0.7rem] text-data">{salida.distance}</span>
											{#if salida.closed}
												<span class="text-[0.6rem] tracking-label text-danger uppercase"
													>Cerrada</span
												>
											{/if}
											{#if salida.shortcut}
												<span class="text-[0.6rem] tracking-label text-data uppercase">Atajo</span>
											{/if}
										</div>
									{/each}
								</div>
							{/if}

							<div class="grow"></div>

							<HudLink href="{ADMIN_ROUTE}/universo/{elegidoNodo.code}" variant="primary" size="1">
								<Icon name="wrench" weight="bold" size="0.7rem" />
								Abrir en el constructor
							</HudLink>
						</div>
					{:else}
						<div
							class="flex w-full flex-col gap-2 overflow-y-auto border border-dead-border p-[0.9rem]
							lg:h-full"
						>
							<CardTitle>Nada elegido</CardTitle>
							<BodyText>
								Tocá un sistema del mapa para ver su ficha y abrirlo en el constructor. Se arrastra
								para moverlo y la rueda acerca.
							</BodyText>
						</div>
					{/if}
				</div>
			</div>
		</TitledPanel>
	</div>

	<TitledPanel
		title="Sistemas"
		detail={universo.found === 1 ? '1 sistema' : `${universo.found} sistemas`}
		class="w-full"
	>
		<HudTable
			columns={COLUMNAS}
			minWidth="46rem"
			sort={consulta.sort}
			dir={consulta.dir}
			sortHref={ordenPor}
		>
			{#each universo.systems as sistema (sistema.id)}
				<tr class="border-b border-border-soft/40 last:border-0 hover:bg-surface-hover">
					<td class="py-[0.45rem] pr-3">
						<a
							href="{ADMIN_ROUTE}/universo/{sistema.code}"
							class="flex min-w-0 items-center gap-2 no-underline"
						>
							<Icon name="sun" weight="duotone" size="0.9rem" class="shrink-0 text-accent" />
							<span
								class="truncate font-display text-[0.8rem] font-bold tracking-display
										text-text-strong uppercase hover:text-accent-bright"
							>
								{sistema.name}
							</span>
							<!--
									La capital lleva corona: es el único sistema de su facción que
									la tiene, y se busca de un vistazo.
								-->
							{#if sistema.capitalOf}
								<span class="flex shrink-0" title="Capital de {sistema.capitalOf}">
									<Icon name="crown-simple" weight="fill" size="0.7rem" class="text-warning" />
								</span>
							{/if}
						</a>
					</td>
					<td class="hidden py-[0.45rem] pr-3 text-1 text-text-muted md:table-cell">
						<span class="block truncate">{sistema.region} · {sistema.constellation}</span>
					</td>
					<td class="py-[0.45rem] pr-3 text-1 text-text-body">{sistema.government}</td>
					<td class="py-[0.45rem] pr-3 text-right">
						<span class="font-mono text-[0.8rem] text-data">{sistema.security}</span>
						<span class="block text-[0.6rem] tracking-label text-text-muted uppercase">
							{sistema.securityLevel}
						</span>
					</td>
					<td class="py-[0.45rem] pr-3 text-1 text-text-body">
						<span class="block truncate">{sistema.controlledBy}</span>
					</td>
					<td
						class="py-[0.45rem] text-right font-mono text-[0.72rem] whitespace-nowrap
							text-text-muted"
					>
						{sistema.bodies} cuerpos
						{#if sistema.loose > 0}
							<span class="block text-warning">{sistema.loose} sin conectar</span>
						{:else if sistema.gates > 0}
							<span class="block">{sistema.gates} puertas</span>
						{/if}
					</td>
					<td class="py-[0.45rem] text-right">
						<!--
								**El puente entre la tabla y el mapa.** Se busca un sistema en la
								lista, que es donde se busca bien, y el mapa lo muestra en su lugar
								del conjunto. Sin esto son dos pantallas que no se hablan.
							-->
						<button
							type="button"
							class="cursor-pointer border-0 bg-transparent p-1 text-text-muted
									transition-colors hover:text-accent-bright"
							title="Centrar en el mapa"
							aria-label="Centrar {sistema.name} en el mapa"
							onclick={() => mostrarEnMapa(sistema.code)}
						>
							<Icon name="crosshair" weight="bold" size="0.85rem" />
						</button>
					</td>
				</tr>
			{/each}
		</HudTable>

		{#if universo.found === 0}
			<p class="mt-3 text-1 text-text-muted">
				Ningún sistema pasa el filtro. Probá con menos condiciones.
			</p>
		{/if}

		<Paginator
			page={consulta.page}
			pages={universo.pages}
			href={(numero) => conParametro({ pagina: String(numero) })}
			class="mt-3"
		/>
	</TitledPanel>
{/if}

<!--
	El alta va en un modal y no en una pantalla propia: es un formulario corto que
	termina llevándote a otro lado, y una pantalla intermedia sólo agregaría un
	paso de ida y vuelta.
-->
<Modal bind:open={abierto} title="Crear un sistema" icon="planet" size="lg">
	<div class="flex w-full flex-col gap-5">
		<ErrorCallout message={form?.error} />

		<!--
			Región y constelación se crean sin salir de acá. Son formularios propios
			—van al servidor por su cuenta— porque crear el contenedor y crear el
			sistema son dos escrituras, y anidarlas sería inventar una transacción que
			el navegador no puede sostener.
		-->
		<div class="flex w-full flex-col gap-3 border-b border-border-soft pb-5">
			<div class="flex w-full items-end gap-3">
				<SelectField
					label="Constelación"
					name="constellationId"
					options={opciones.constellations}
					bind:value={constellationId}
					hint="Agrupa sistemas. Por ahora no cambia ninguna mecánica."
					form="sistema"
				/>
				<HudButton
					size="2"
					class="mb-[1.6rem] shrink-0"
					onclick={() => (nuevaConstelacion = !nuevaConstelacion)}
				>
					<Icon name={nuevaConstelacion ? 'x' : 'check'} weight="bold" size="0.7rem" />
					Nueva
				</HudButton>
			</div>

			{#if nuevaConstelacion}
				<form
					method="POST"
					action="?/constelacion"
					use:envio.enhance
					class="flex w-full items-end gap-3"
				>
					<SelectField label="En la región" name="regionId" options={opciones.regions} />
					<TextField label="Nombre" name="name" placeholder="Cadena Rota" required />
					<HudButton type="submit" busy={envio.busy} variant="primary" class="mb-[0.1rem] shrink-0"
						>Crear</HudButton
					>
				</form>

				<div class="flex w-full items-end gap-3">
					<HudButton size="1" variant="ghost" onclick={() => (nuevaRegion = !nuevaRegion)}>
						<Icon name="map-trifold" weight="bold" size="0.65rem" />
						{nuevaRegion ? 'No hace falta otra región' : '¿Tampoco existe la región?'}
					</HudButton>
				</div>

				{#if nuevaRegion}
					<form
						method="POST"
						action="?/region"
						use:envio.enhance
						class="flex w-full items-end gap-3"
					>
						<TextField label="Región nueva" name="name" placeholder="Borde de Hierro" required />
						<HudButton
							type="submit"
							busy={envio.busy}
							variant="primary"
							class="mb-[0.1rem] shrink-0"
						>
							Crear
						</HudButton>
					</form>
				{/if}
			{/if}
		</div>

		<form
			method="POST"
			action="?/sistema"
			id="sistema"
			use:envio.enhance
			class="flex w-full flex-col gap-5"
		>
			<TextField
				label="Nombre"
				name="name"
				placeholder="Vela"
				required
				hint="De acá salen el código del sistema y los nombres de sus cuerpos: Vela I, Vela III-a."
			/>

			<div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
				<SelectField
					label="Facción que lo controla"
					name="controllingFaction"
					options={opciones.factions}
					bind:value={faction}
					hint="Sin facción es espacio libre: nadie paga las patrullas."
				/>
				<SelectField
					label="Gobierno"
					name="government"
					options={opciones.governments.map((uno) => ({ value: uno.value, label: uno.label }))}
					bind:value={government}
				/>
			</div>

			<!--
				La seguridad es un deslizador y no un campo de texto porque lo que
				importa no es el número exacto sino dónde cae dentro de lo que el
				gobierno permite. Los topes se mueven solos al cambiar el gobierno.
			-->
			<div class="flex w-full flex-col items-start gap-2">
				<label
					for="security"
					class="font-display text-1 font-medium tracking-label text-accent uppercase"
				>
					Seguridad
				</label>
				<div class="flex w-full items-center gap-4">
					<input
						id="security"
						name="security"
						type="range"
						min={minimo}
						max={maximo}
						bind:value={security}
						class="h-[2.15rem] w-full cursor-pointer accent-[var(--color-accent)]"
					/>
					<span class="w-[3rem] shrink-0 text-right font-mono text-3 text-data">{security}</span>
				</div>
				<p class="text-1 text-text-muted">
					{#if faction}
						Con ese gobierno va de {minimo} a {maximo}.
					{:else}
						Sin dueño, de {minimo} a {maximo}: el piso del gobierno no lo sostiene nadie.
					{/if}
				</p>
			</div>

			{#if faction}
				<label class="flex w-full cursor-pointer items-start gap-3">
					<input
						type="checkbox"
						name="capital"
						class="mt-[0.2rem] h-4 w-4 shrink-0 accent-[var(--color-accent)]"
					/>
					<span class="flex flex-col gap-1">
						<span
							class="font-display text-[0.75rem] font-semibold tracking-display text-text-strong uppercase"
						>
							Es el sistema principal de la facción
						</span>
						<span class="text-1 text-text-muted">
							Una facción tiene una sola capital. Si ya tiene otra, hay que sacársela primero.
						</span>
					</span>
				</label>
			{/if}

			<TextField label="Descripción" name="description" placeholder="Opcional" />

			<div class="grid w-full grid-cols-3 gap-3"></div>

			<div class="flex w-full items-center justify-end gap-3">
				<HudButton variant="ghost" onclick={() => (abierto = false)}>Cancelar</HudButton>
				<HudButton type="submit" busy={envio.busy} variant="primary">Crear el sistema</HudButton>
			</div>
		</form>
	</div>
</Modal>

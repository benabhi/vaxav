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
	import { ADMIN_ROUTE } from '$lib/admin';
	import { bearingLabel } from '$lib/format';
	import type { GateBearing } from '$lib/game/universe';
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

	/** El rumbo, escrito. Viene como código del servidor y se lee como palabra. */
	const rumbo = (code: string) => bearingLabel(code as GateBearing);

	/** El sistema elegido en el mapa, que la barra lateral describe. */
	let elegido = $state('');
	let mapa = $state<GalaxyMap>();

	let elegidoNodo = $derived(universo.map.systems.find((uno) => uno.code === elegido) ?? null);

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
		<span class="font-mono text-3 text-text-body">{universo.systems.length}</span>
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
	<TitledPanel title="Mapa de la galaxia" detail={detalleMapa} class="w-full">
		<div class="flex w-full flex-col items-start gap-[1.25rem] lg:h-[28rem] lg:flex-row">
			<div class="flex h-[26rem] w-full min-w-0 flex-col gap-2 lg:h-full lg:flex-[3_1_0]">
				<GalaxyMap
					bind:this={mapa}
					map={universo.map}
					selected={elegido}
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
							{@render lectura('Seguridad', `${elegidoNodo.securityLevel} ${elegidoNodo.security}`)}
							{@render lectura('Controla', elegidoNodo.factionName)}
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
								{@render lectura('Sin conectar', elegidoNodo.looseBearings.map(rumbo).join(' · '))}
							{/if}
							{#if elegidoNodo.free.length > 0}
								{@render lectura('Rumbos libres', elegidoNodo.free.map(rumbo).join(' · '))}
							{/if}
						</div>

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

	<TitledPanel
		title="Sistemas"
		detail={universo.systems.length === 1 ? '1 sistema' : `${universo.systems.length} sistemas`}
		class="w-full"
	>
		<div class="w-full overflow-x-auto">
			<table
				class="w-full min-w-[46rem] table-fixed border-collapse text-left
					[&_:is(th,td):first-child]:pl-2 [&_:is(th,td):last-child]:pr-2"
			>
				<colgroup>
					<col class="w-[12rem]" />
					<col class="hidden md:table-column md:w-[12rem]" />
					<col class="w-[9rem]" />
					<col class="w-[7rem]" />
					<col class="w-[10rem]" />
					<col class="w-[8rem]" />
				</colgroup>
				<thead class="sticky top-0 z-10 bg-well">
					<tr class="border-b border-border-soft">
						{#each [{ label: 'Sistema', class: '' }, { label: 'Dónde', class: 'hidden md:table-cell' }, { label: 'Gobierno', class: '' }, { label: 'Seguridad', class: 'text-right' }, { label: 'Controla', class: '' }, { label: 'Contenido', class: 'text-right' }] as columna (columna.label)}
							<th
								class="py-2 pr-3 font-display text-1 tracking-label text-accent-dim uppercase
									{columna.class}"
							>
								{columna.label}
							</th>
						{/each}
					</tr>
				</thead>
				<tbody>
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
								<span class="truncate">{sistema.region} · {sistema.constellation}</span>
							</td>
							<td class="py-[0.45rem] pr-3 text-1 text-text-body">{sistema.government}</td>
							<td class="py-[0.45rem] pr-3 text-right">
								<span class="font-mono text-[0.8rem] text-data">{sistema.security}</span>
								<span class="block text-[0.6rem] tracking-label text-text-muted uppercase">
									{sistema.securityLevel}
								</span>
							</td>
							<td class="py-[0.45rem] pr-3 text-1 text-text-body">
								<span class="truncate">{sistema.controlledBy}</span>
							</td>
							<td class="py-[0.45rem] text-right font-mono text-[0.72rem] text-text-muted">
								{sistema.bodies} cuerpos
								{#if sistema.loose > 0}
									<span class="block text-warning">{sistema.loose} sin conectar</span>
								{:else if sistema.gates > 0}
									<span class="block">{sistema.gates} puertas</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
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

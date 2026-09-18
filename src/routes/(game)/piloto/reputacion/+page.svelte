<!--
	Pestaña Reputación del piloto: el sector entero, y lo que cada uno piensa de vos.

	**Va en Piloto y no en Corporación** porque es del piloto: sobrevive a
	renunciar, y casi nada de lo que muestra es de tu corporación. La de
	Corporación contesta otra cosa —cómo vas con la tuya, y cómo llegaste ahí— con
	el libro de movimientos al lado.

	Y es **un directorio antes que un resumen**: van todas las banderas, todas las
	corporaciones y todos los agentes, te conozcan o no. La reputación se gana con
	cualquiera, así que uno en cero no es ruido: es el que todavía no trabajaste, y
	saber que existe y dónde está es la mitad de la decisión.

	La figura es **la rosa de banderas**: el largo de cada brazo es lo que esa
	facción piensa de vos. No dibuja tres cifras, dibuja **qué clase de piloto
	sos** —un brazo largo con dos muñones es una lealtad, tres iguales es un
	oportunista—. Al lado van las cifras exactas, como manda la regla de las
	figuras.

	Las dos listas largas van **una por vez**: apiladas, la página era inmensa y
	para llegar a la segunda había que pasar por toda la primera.
-->
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Panel from '$lib/components/cards/Panel.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import HudButton from '$lib/components/buttons/HudButton.svelte';
	import HudLink from '$lib/components/buttons/HudLink.svelte';
	import SelectField from '$lib/components/forms/SelectField.svelte';
	import TextField from '$lib/components/forms/TextField.svelte';
	import FactionRose from '$lib/components/game/FactionRose.svelte';
	import SegmentBar from '$lib/components/meters/SegmentBar.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import CardTitle from '$lib/components/typography/CardTitle.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import Label from '$lib/components/typography/Label.svelte';
	import HudTable, { type Columna } from '$lib/components/ui/HudTable.svelte';
	import PanelTabs, { type Solapa } from '$lib/components/ui/PanelTabs.svelte';
	import Paginator from '$lib/components/ui/Paginator.svelte';
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import { hrefFicha } from '$lib/fichas';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let panorama = $derived(data.panorama);
	let agentes = $derived(data.agentes);
	let lista = $derived(data.lista);
	let consulta = $derived(panorama.query);

	/** Las dos listas, con su cuenta al lado para no tener que abrirlas para saber. */
	let solapas = $derived<Solapa[]>([
		{
			code: 'corporaciones',
			label: 'Corporaciones',
			detail: String(panorama.total),
			href: '?lista=corporaciones'
		},
		{
			code: 'agentes',
			label: 'Agentes',
			detail: String(agentes.total),
			href: '?lista=agentes'
		}
	]);

	/** Las columnas, con la misma clave de orden que usa el servidor. */
	const COLUMNAS_CORP: Columna[] = [
		{ key: 'nombre', label: 'Corporación', width: '14rem' },
		{ key: 'bandera', label: 'Bandera', width: '9rem', from: 'md' },
		{ key: 'reputacion', label: 'Reputación' },
		{ key: 'nivel', label: 'Abre agentes', width: '8rem', class: 'text-right' }
	];

	const COLUMNAS_AGENTES: Columna[] = [
		{ key: 'nombre', label: 'Agente', width: '13rem' },
		{ key: 'corporacion', label: 'Corporación', width: '11rem' },
		{ key: 'sistema', label: 'Dónde', width: '11rem', from: 'md' },
		{ key: 'nivel', label: 'Nivel', width: '5rem' },
		{ label: 'Atiende', width: '7rem', class: 'text-right' }
	];

	let opcionesBandera = $derived([
		{ value: '', label: 'Todas' },
		...panorama.flags.map((una) => ({ value: una.code, label: una.name }))
	]);

	let opcionesClase = $derived([{ value: '', label: 'Todas' }, ...agentes.kinds]);

	/** La URL con un parámetro cambiado, conservando todo lo demás. */
	function conParametro(cambios: Record<string, string>): string {
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
		const actual = lista === 'corporaciones' ? consulta : agentes.query;
		const mismo = actual.sort === columna;
		return conParametro({ orden: columna, dir: mismo && actual.dir === 'asc' ? 'desc' : 'asc' });
	}

	/** Elegir de un desplegable filtra solo: apretar «Filtrar» no decide nada más. */
	function alCambiar(evento: Event & { currentTarget: HTMLSelectElement }) {
		evento.currentTarget.form?.requestSubmit();
	}

	/**
	 * El enlace que abre la ficha de una corporación.
	 *
	 * **Ventana y no pantalla**: llevar a `/corporacion` con otra puesta se lee como
	 * si fuera la tuya, con el Neocom marcando tu módulo y tus pestañas al lado. Y
	 * **enlace y no botón** porque la ventana vive en la URL: así se abre en otra
	 * pestaña, se comparte por mensaje y se cierra con el botón de atrás.
	 */
	let fichaDe = $derived((code: string) => hrefFicha(page.url, 'corporacion', code));

	let hayFiltroCorp = $derived(Boolean(consulta.search || consulta.faction));
	let hayFiltroAgentes = $derived(
		Boolean(agentes.query.search || agentes.query.kind || agentes.query.onlyOpen)
	);
</script>

<svelte:head><title>Reputación · Piloto · Vaxav</title></svelte:head>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Piloto</Eyebrow>
	<DisplayTitle>Reputación</DisplayTitle>
</div>

<!--
	La figura con sus banderas al lado. Apiladas en un teléfono, con el dibujo
	primero: es lo que dice de un vistazo con quién estás parado.

	Las banderas no se paginan ni se recortan: son cuatro contadas y son el marco
	del sector. Ponerles buscador sería un formulario para encontrar una de cuatro.
-->
<TitledPanel title="Las banderas" detail="qué piensa de vos cada una" class="w-full">
	<div class="flex w-full flex-col items-center gap-5 lg:flex-row lg:items-center lg:gap-6">
		<div class="flex w-full justify-center lg:w-auto lg:shrink-0">
			<FactionRose factions={panorama.factions} />
		</div>

		<div class="flex w-full min-w-0 flex-col">
			{#each panorama.factions as bandera (bandera.code)}
				<div
					class="flex w-full min-w-0 flex-wrap items-center gap-x-4 gap-y-2
						border-b border-border-soft/40 py-[0.7rem] last:border-0"
				>
					<!--
						El color de una bandera es suyo y sale del catálogo, no de la paleta
						del HUD: por eso viaja en el estilo del envoltorio y el ícono lo hereda.
					-->
					<span class="flex shrink-0 items-center" style="color: {bandera.color}">
						<Icon name={bandera.icon} weight="bold" size="0.9rem" />
					</span>

					<span
						class="min-w-0 flex-[1_1_7rem] truncate font-display text-2 tracking-display
							text-text-strong uppercase"
					>
						{bandera.name}
					</span>

					<span class="flex shrink-0 items-center gap-3">
						<SegmentBar filled={bandera.reached} total={bandera.tiers} class="w-20" />
						<span class="flex flex-col items-start gap-[0.1rem]">
							<span class="font-display text-1 tracking-display text-accent-bright uppercase">
								{bandera.tier}
							</span>
							<span class="font-mono text-[0.72rem] text-data">{bandera.value}</span>
						</span>
					</span>

					<div class="grow"></div>

					<span class="flex shrink-0 items-baseline gap-2">
						<Label>Abre</Label>
						<span class="font-mono text-[0.78rem] text-text-body">{bandera.opens}</span>
					</span>
				</div>
			{/each}
		</div>
	</div>
</TitledPanel>

<!--
	Las dos listas del sector, una por vez.

	**Apiladas la página era inmensa**: dos tablas paginadas con sus dos barras de
	recorte, y para llegar a la segunda había que pasar por toda la primera. El
	selector deja una sola a la vista y de paso resuelve que las dos quieran los
	mismos parámetros: como se dibuja una por vez, `lista` decide quién los
	interpreta.

	Va en la URL y no en el navegador porque **es un recorte**, como todo lo demás
	de esta pantalla. Cambiar de lista limpia lo demás a propósito: un orden por
	bandera no significa nada en la lista de agentes.
-->
<Panel class="w-full">
	<PanelTabs tabs={solapas} active={lista} />

	<div class="w-full pt-4">
		{#if lista === 'corporaciones'}
			<form
				method="GET"
				class="mb-4 flex w-full flex-wrap items-end gap-3 border border-border-soft bg-surface
					px-[0.9rem] py-[0.7rem]"
			>
				<input type="hidden" name="lista" value="corporaciones" />
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
						label="Bandera"
						name="bandera"
						size="1"
						onchange={alCambiar}
						value={consulta.faction}
						options={opcionesBandera}
					/>
				</div>

				<HudButton type="submit" size="1" variant="primary">
					<Icon name="magnifying-glass" weight="bold" size="0.7rem" />
					Filtrar
				</HudButton>

				{#if hayFiltroCorp}
					<HudLink href="?lista=corporaciones" size="1" variant="outline">Limpiar</HudLink>
				{/if}
			</form>

			<HudTable
				columns={COLUMNAS_CORP}
				minWidth="34rem"
				sort={consulta.sort}
				dir={consulta.dir}
				sortHref={ordenPor}
			>
				{#each panorama.corporations as una (una.code)}
					<tr
						class="border-b border-border-soft/40 transition-colors last:border-0
							hover:bg-surface-hover"
					>
						<td class="py-[0.5rem] pr-3">
							<span class="flex min-w-0 items-center gap-2">
								<Icon name={una.icon} weight="bold" size="0.75rem" class="shrink-0 text-accent" />
								<span class="flex min-w-0 flex-col items-start">
									<!--
										El nombre abre **su ficha**, no el mapa: ahí está qué es, quién la
										opera, dónde tiene puestos, quién reparte trabajo y qué piensa de
										vos, y desde ahí sale el enlace al mapa. Saltar directo al mapa
										contesta una sola de esas preguntas y se saltea las otras cuatro.
									-->
									<a
										href={fichaDe(una.code)}
										class="truncate text-1 text-text-strong no-underline hover:text-accent-bright"
									>
										{una.name}
									</a>
									{#if una.mine}
										<Label>Respondés a ella</Label>
									{/if}
								</span>
							</span>
						</td>
						<td class="hidden py-[0.5rem] pr-3 text-1 text-text-muted md:table-cell">
							{una.factionName}
						</td>
						<td class="py-[0.5rem] pr-3">
							<span class="flex flex-wrap items-center gap-x-3 gap-y-1">
								<SegmentBar filled={una.reached} total={una.tiers} class="w-20" />
								<span class="font-display text-1 tracking-display text-accent-bright uppercase">
									{una.tier}
								</span>
								<span class="font-mono text-[0.72rem] text-data">{una.value}</span>
							</span>
						</td>
						<td class="py-[0.5rem] text-right font-mono text-[0.78rem] text-text-body">
							{una.opens}
						</td>
					</tr>
				{/each}
			</HudTable>

			{#if panorama.found === 0}
				<p class="w-full pt-3 text-1 text-text-muted">Ninguna corporación pasa ese recorte.</p>
			{/if}

			<Paginator
				page={panorama.page}
				pages={panorama.pages}
				href={(n) => conParametro({ pagina: String(n) })}
				class="mt-3"
			/>
		{:else}
			<form
				method="GET"
				class="mb-4 flex w-full flex-wrap items-end gap-3 border border-border-soft bg-surface
					px-[0.9rem] py-[0.7rem]"
			>
				<input type="hidden" name="lista" value="agentes" />
				<div class="w-full min-w-0 xs:w-[12rem]">
					<TextField
						label="Buscar"
						name="buscar"
						size="1"
						value={agentes.query.search}
						placeholder="Nombre, corporación o sistema"
					/>
				</div>

				<div class="w-full min-w-0 xs:w-[10rem]">
					<SelectField
						label="Reparte"
						name="clase"
						size="1"
						onchange={alCambiar}
						value={agentes.query.kind}
						options={opcionesClase}
					/>
				</div>

				<HudButton type="submit" size="1" variant="primary">
					<Icon name="magnifying-glass" weight="bold" size="0.7rem" />
					Filtrar
				</HudButton>

				<!--
					El recorte que vuelve útil la lista en cuanto la reputación se mueve: de
					cien agentes, saber cuáles te reciben hoy es la única pregunta que
					importa antes de salir a buscar trabajo.
				-->
				<HudLink
					href={conParametro({ atienden: agentes.query.onlyOpen ? '' : '1' })}
					size="1"
					variant={agentes.query.onlyOpen ? 'primary' : 'outline'}
				>
					<Icon
						name={agentes.query.onlyOpen ? 'check' : 'users-three'}
						weight="bold"
						size="0.7rem"
					/>
					Disponibles
				</HudLink>

				{#if hayFiltroAgentes}
					<HudLink href="?lista=agentes" size="1" variant="outline">Limpiar</HudLink>
				{/if}
			</form>

			<HudTable
				columns={COLUMNAS_AGENTES}
				minWidth="42rem"
				sort={agentes.query.sort}
				dir={agentes.query.dir}
				sortHref={ordenPor}
			>
				{#each agentes.agents as uno (uno.code)}
					<tr
						class="border-b border-border-soft/40 transition-colors last:border-0
							hover:bg-surface-hover"
					>
						<td class="py-[0.5rem] pr-3">
							<span class="flex min-w-0 items-center gap-2">
								<Icon
									name={uno.kindIcon}
									weight="bold"
									size="0.75rem"
									class="shrink-0 {uno.open ? 'text-accent' : 'text-text-muted'}"
								/>
								<span class="flex min-w-0 flex-col items-start">
									<span class="truncate text-1 {uno.open ? 'text-text-strong' : 'text-text-muted'}">
										{uno.name}
									</span>
									<Label>{uno.kind}</Label>
								</span>
							</span>
						</td>
						<td class="py-[0.5rem] pr-3">
							<a
								href={fichaDe(uno.corporationCode)}
								class="block truncate text-1 text-text-body no-underline hover:text-accent-bright"
							>
								{uno.corporation}
							</a>
						</td>
						<td class="hidden py-[0.5rem] pr-3 md:table-cell">
							<!-- El sistema lleva al mapa, con él elegido. -->
							<a
								href="/navegacion/galaxia?sistema={uno.systemCode}"
								class="block truncate text-1 text-text-body no-underline hover:text-accent-bright"
							>
								{uno.system}
							</a>
							<span class="block truncate text-[0.68rem] text-text-muted">{uno.station}</span>
						</td>
						<td class="py-[0.5rem] pr-3 font-mono text-[0.78rem] text-text-body">{uno.level}</td>
						<td class="py-[0.5rem] text-right">
							{#if uno.open}
								<span class="font-display text-1 tracking-label text-accent-bright uppercase">
									Te atiende
								</span>
							{:else}
								<span class="text-[0.68rem] text-text-muted" title={uno.requirement}>
									Todavía no
								</span>
							{/if}
						</td>
					</tr>
				{/each}
			</HudTable>

			{#if agentes.found === 0}
				<p class="w-full pt-3 text-1 text-text-muted">Ningún agente pasa ese recorte.</p>
			{/if}

			<Paginator
				page={agentes.query.page}
				pages={agentes.pages}
				href={(n) => conParametro({ pagina: String(n) })}
				class="mt-3"
			/>
		{/if}
	</div>
</Panel>

<!--
	El pie explica **de dónde sale el número** y **por qué los agentes no tienen uno
	propio**, que son las dos preguntas que esta pantalla despierta. Va abajo y no
	arriba: quien ya entendió no tiene que leerlo dos veces.
-->
<Panel class="w-full">
	<div class="flex w-full flex-col items-start gap-3">
		<CardTitle>De dónde sale esto</CardTitle>
		<BodyText>
			{panorama.known === 0 ? 'Todavía no te conoce nadie. ' : ''}La reputación se gana trabajando:
			cada trabajo terminado mueve el número de quien te lo dio y, un poco, el de su bandera.
		</BodyText>
		<BodyText>
			<strong class="text-text-strong">Los agentes no llevan un número propio con vos.</strong> Te atiende
			el que esté a la altura del mayor entre lo que tiene su corporación y lo que tiene su bandera, y
			por eso subir con una bandera abre ese nivel en todas las corporaciones que la llevan de una sola
			vez.
		</BodyText>
	</div>
</Panel>

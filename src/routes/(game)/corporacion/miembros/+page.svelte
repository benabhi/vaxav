<!--
	Pestaña Miembros: quiénes son los otros.

	Una tabla y no una grilla de tarjetas: lo que uno hace acá es buscar a alguien,
	y para buscar sirve una lista ordenable. Las tarjetas se ven mejor con doce y
	peor con mil, y esto va a tener mil.

	Por eso nace ya con **recorte, orden y paginado**, como todo listado del juego:
	la lista de una corporación grande sin filtros es una lista que no se usa. Los
	tres viajan en la URL, así que un recorte se comparte, se vuelve con el botón de
	atrás y se recarga sin perderlo.

	Cada fila lleva **el sello del distintivo**, que es lo que la vuelve recorrible
	de un vistazo: un nombre entre cien es texto, un nombre con su emblema al lado
	se encuentra sin leer.
-->
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import HudButton from '$lib/components/buttons/HudButton.svelte';
	import HudLink from '$lib/components/buttons/HudLink.svelte';
	import Identicon from '$lib/components/game/Identicon.svelte';
	import SelectField from '$lib/components/forms/SelectField.svelte';
	import TextField from '$lib/components/forms/TextField.svelte';
	import Panel from '$lib/components/cards/Panel.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import HudTable, { type Columna } from '$lib/components/ui/HudTable.svelte';
	import Paginator from '$lib/components/ui/Paginator.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import CardTitle from '$lib/components/typography/CardTitle.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let miembros = $derived(data.miembros);
	let consulta = $derived(miembros.query);

	/** Las columnas, con la misma clave de orden que usa el servidor. */
	const COLUMNAS: Columna[] = [
		{ key: 'distintivo', label: 'Piloto', width: '14rem' },
		{ key: 'oficio', label: 'Oficio', width: '10rem' },
		{ key: 'bandera', label: 'Bandera', width: '10rem', from: 'md' },
		{ key: 'antiguedad', label: 'Vuela desde', width: '9rem', class: 'text-right' }
	];

	let opcionesOficio = $derived([{ value: '', label: 'Todos' }, ...miembros.professions]);

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
		const mismo = consulta.sort === columna;
		return conParametro({ orden: columna, dir: mismo && consulta.dir === 'asc' ? 'desc' : 'asc' });
	}

	/** Elegir de un desplegable filtra solo: apretar «Filtrar» no decide nada más. */
	function alCambiar(evento: Event & { currentTarget: HTMLSelectElement }) {
		evento.currentTarget.form?.requestSubmit();
	}

	/**
	 * Los campos vacíos no viajan en la URL.
	 *
	 * Un formulario `GET` manda todo, incluso lo que no se llenó, y la barra queda
	 * con `?buscar=&oficio=` colgando: no rompe nada, pero una URL que se comparte
	 * tiene que poder leerse.
	 */
	function alEnviar(evento: SubmitEvent & { currentTarget: HTMLFormElement }) {
		const vacios = [...evento.currentTarget.elements].filter(
			(campo): campo is HTMLInputElement | HTMLSelectElement =>
				(campo instanceof HTMLInputElement || campo instanceof HTMLSelectElement) &&
				campo.value === ''
		);
		for (const campo of vacios) campo.disabled = true;
		setTimeout(() => {
			for (const campo of vacios) campo.disabled = false;
		});
	}

	let hayFiltro = $derived(
		Boolean(
			consulta.search ||
			consulta.profession ||
			consulta.page > 1 ||
			consulta.sort !== 'antiguedad' ||
			consulta.dir !== 'asc'
		)
	);

	/** Cuántos recortes quitan gente de la lista, para decirlo al lado. */
	let cuantosFiltros = $derived([consulta.search, consulta.profession].filter(Boolean).length);

	/** La fecha, escrita por el navegador: el servidor manda el instante en UTC. */
	const fecha = (ms: number) =>
		new Date(ms).toLocaleDateString('es', { year: 'numeric', month: 'short', day: 'numeric' });
</script>

<svelte:head><title>Miembros · Corporación · Vaxav</title></svelte:head>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Corporación</Eyebrow>
	<DisplayTitle>Miembros</DisplayTitle>
</div>

{#if !miembros.belongs}
	<Panel class="w-full">
		<div class="flex flex-col items-start gap-2">
			<CardTitle>No respondés a nadie</CardTitle>
			<BodyText>
				Sin corporación no hay lista de miembros. Volás por tu cuenta, que también es una forma de
				andar por el sector.
			</BodyText>
		</div>
	</Panel>
{:else}
	<form
		method="GET"
		onsubmit={alEnviar}
		class="flex w-full flex-wrap items-end gap-3 border border-border-soft bg-surface px-[0.9rem]
			py-[0.7rem]"
	>
		<div class="w-full min-w-0 xs:w-[12rem]">
			<TextField
				label="Buscar"
				name="buscar"
				size="1"
				value={consulta.search}
				placeholder="Distintivo"
			/>
		</div>

		<!--
			El filtro que va a importar el día que se armen operaciones: hacen falta
			tres mineros y un escolta, y eso no se contesta leyendo mil nombres.
		-->
		<div class="w-full min-w-0 xs:w-[10rem]">
			<SelectField
				label="Oficio"
				name="oficio"
				size="1"
				onchange={alCambiar}
				value={consulta.profession}
				options={opcionesOficio}
			/>
		</div>

		<!-- El orden viaja en la URL: sin esto, filtrar lo perdería. -->
		<input type="hidden" name="orden" value={consulta.sort} />
		<input type="hidden" name="dir" value={consulta.dir} />

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

		<div class="grow"></div>

		<span class="font-mono text-[0.72rem] whitespace-nowrap text-text-muted">
			{#if cuantosFiltros > 0}
				{miembros.found} de {miembros.total}
			{:else}
				{miembros.count}
			{/if}
		</span>
	</form>

	<TitledPanel
		title="Pilotos"
		detail={miembros.found === 1 ? '1 piloto' : `${miembros.found} pilotos`}
		class="w-full"
	>
		<HudTable
			columns={COLUMNAS}
			minWidth="38rem"
			sort={consulta.sort}
			dir={consulta.dir}
			sortHref={ordenPor}
		>
			{#each miembros.members as uno (uno.callsign)}
				<tr
					class="border-b border-border-soft/40 last:border-0 hover:bg-surface-hover
						{uno.isYou ? 'bg-surface' : ''}"
				>
					<td class="py-[0.45rem] pr-3">
						<span class="flex min-w-0 items-center gap-2">
							<Identicon
								name={uno.callsign}
								family="piloto"
								size="1.6rem"
								title="Sello de {uno.callsign}"
							/>
							<span
								class="truncate font-display text-[0.8rem] font-bold tracking-display
									text-text-strong uppercase"
							>
								{uno.callsign}
							</span>
							{#if uno.isYou}
								<!-- La fila propia se encuentra sin leer: es la que uno busca primero. -->
								<span class="flex shrink-0" title="Sos vos">
									<Icon name="crosshair" weight="bold" size="0.7rem" class="text-accent" />
								</span>
							{/if}
						</span>
					</td>
					<td class="py-[0.45rem] pr-3 text-1 text-text-body">{uno.profession}</td>
					<td class="hidden py-[0.45rem] pr-3 text-1 text-text-muted md:table-cell">
						{uno.faction}
					</td>
					<td class="py-[0.45rem] text-right font-mono text-[0.72rem] whitespace-nowrap text-data">
						{fecha(uno.since)}
					</td>
				</tr>
			{/each}
		</HudTable>

		{#if miembros.found === 0}
			<p class="w-full pt-3 text-1 text-text-muted">
				Ningún piloto de la corporación coincide con ese recorte.
			</p>
		{/if}

		<Paginator
			page={consulta.page}
			pages={miembros.pages}
			href={(n) => conParametro({ pagina: String(n) })}
			class="mt-3"
		/>
	</TitledPanel>
{/if}

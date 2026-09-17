<!--
	Pestaña Agentes: a quién le podés pedir trabajo.

	Una tabla y no una grilla de tarjetas, por lo mismo que los miembros: lo que uno
	hace acá es **buscar a alguien que le dé trabajo**, y para buscar sirve una lista
	ordenable. Nace con recorte, orden y paginado, que viajan en la URL.

	**Los que todavía no atienden salen igual, apagados y con lo que les falta.** Es
	la escalera que el piloto tiene por delante, el mismo criterio de la ficha del
	lugar: esconder lo que falta sería más prolijo y mucho peor.

	Y ordena por nivel de entrada, no alfabético: el de nivel uno atiende a
	cualquiera y el de nivel cinco es la meta, así que leer de arriba hacia abajo es
	leer el camino.
-->
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Identicon from '$lib/components/game/Identicon.svelte';
	import HudButton from '$lib/components/buttons/HudButton.svelte';
	import HudLink from '$lib/components/buttons/HudLink.svelte';
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

	let agentes = $derived(data.agentes);
	let consulta = $derived(agentes.query);

	/** Las columnas, con la misma clave de orden que usa el servidor. */
	const COLUMNAS: Columna[] = [
		{ key: 'nombre', label: 'Agente', width: '14rem' },
		{ key: 'nivel', label: 'Nivel', width: '5rem' },
		{ key: 'clase', label: 'Reparte', width: '10rem' },
		{ key: 'estacion', label: 'Estación', from: 'md' },
		{ label: 'Atiende', width: '11rem', class: 'text-right' }
	];

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
		const mismo = consulta.sort === columna;
		return conParametro({ orden: columna, dir: mismo && consulta.dir === 'asc' ? 'desc' : 'asc' });
	}

	/** Elegir de un desplegable filtra solo: apretar «Filtrar» no decide nada más. */
	function alCambiar(evento: Event & { currentTarget: HTMLSelectElement }) {
		evento.currentTarget.form?.requestSubmit();
	}

	let hayFiltro = $derived(Boolean(consulta.search || consulta.kind || consulta.onlyOpen));
</script>

<svelte:head><title>Agentes · Corporación · Vaxav</title></svelte:head>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Agentes</Eyebrow>
	<DisplayTitle>{agentes.name}</DisplayTitle>
</div>

{#if !agentes.belongs}
	<Panel class="w-full">
		<div class="flex flex-col items-start gap-3">
			<CardTitle>No respondés a nadie</CardTitle>
			<BodyText>
				Los agentes reparten trabajo en nombre de una corporación. Alistate en alguna y acá vas a
				ver a los suyos.
			</BodyText>
			<HudLink href="/corporacion" variant="outline" size="1">
				<Icon name="share-network" weight="bold" size="0.7rem" />
				Ir a la ficha
			</HudLink>
		</div>
	</Panel>
{:else}
	<!--
		La barra de recorte, con el mismo aspecto que la del listado de miembros y la
		del mapa: buscar por nombre, la clase de misión, y el interruptor que deja
		sólo los que ya te reciben.
	-->
	<form
		method="GET"
		class="flex w-full flex-wrap items-end gap-3 border border-border-soft bg-surface px-[0.9rem]
			py-[0.7rem]"
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
				label="Reparte"
				name="clase"
				size="1"
				onchange={alCambiar}
				value={consulta.kind}
				options={opcionesClase}
			/>
		</div>

		<!--
			El recorte que vuelve útil la lista en cuanto la reputación se mueve: de
			veinte agentes, saber cuáles te reciben hoy es la única pregunta que
			importa antes de salir a buscar trabajo. Va como enlace y no como casilla
			porque es un recorte más, y los recortes de este juego viven en la URL.
		-->
		<HudLink
			href={conParametro({ atienden: consulta.onlyOpen ? '' : '1' })}
			size="1"
			variant={consulta.onlyOpen ? 'primary' : 'outline'}
		>
			<Icon name={consulta.onlyOpen ? 'check' : 'users-three'} weight="bold" size="0.7rem" />
			Disponibles
		</HudLink>

		<!-- Conservan el orden al filtrar: sin esto, buscar lo perdería. -->
		<input type="hidden" name="orden" value={consulta.sort} />
		<input type="hidden" name="dir" value={consulta.dir} />
		{#if consulta.onlyOpen}
			<input type="hidden" name="atienden" value="1" />
		{/if}

		<HudButton type="submit" variant="primary" size="1">
			<Icon name="magnifying-glass" weight="bold" size="0.7rem" />
			Filtrar
		</HudButton>

		{#if hayFiltro}
			<HudLink href="?" variant="outline" size="1">
				<Icon name="x" weight="bold" size="0.7rem" />
				Quitar
			</HudLink>
		{/if}

		<div class="grow"></div>
		<span class="font-mono text-[0.72rem] text-text-muted">
			{agentes.open} de {agentes.total} disponibles
		</span>
	</form>

	<TitledPanel title="Agentes" detail={agentes.count} class="w-full">
		<HudTable
			columns={COLUMNAS}
			minWidth="42rem"
			sort={consulta.sort}
			dir={consulta.dir}
			sortHref={ordenPor}
		>
			{#each agentes.agents as uno (uno.code)}
				<tr
					class="border-b border-border-soft/40 last:border-0 hover:bg-surface-hover
						{uno.open ? '' : 'opacity-60'}"
				>
					<td class="py-2">
						<span class="flex items-center gap-2">
							<!--
								Con su sello, igual que el listado de miembros lleva el del piloto:
								un nombre entre cincuenta es texto, un nombre con su emblema al lado
								se encuentra sin leer.
							-->
							<Identicon
								name={uno.name}
								family="agente"
								size="1.6rem"
								class={uno.open ? '' : 'opacity-50 saturate-[0.35]'}
							/>
							<span
								class="truncate font-display text-1 tracking-display text-text-strong uppercase"
							>
								{uno.name}
							</span>
						</span>
					</td>
					<td class="py-2 font-display text-1 tracking-display text-accent-bright">{uno.level}</td>
					<td class="py-2">
						<span class="flex items-center gap-2">
							<Icon
								name={uno.kindIcon}
								weight="bold"
								size="0.75rem"
								class="shrink-0 text-accent-dim"
							/>
							<span class="truncate text-1 text-text-body">{uno.kind}</span>
						</span>
					</td>
					<td class="py-2">
						<span class="flex items-baseline gap-2">
							<span class="truncate text-1 text-text-body">{uno.station}</span>
							<span class="truncate text-[0.7rem] text-text-muted">{uno.system}</span>
						</span>
					</td>
					<td class="py-2 text-right">
						{#if uno.open}
							<span class="font-display text-1 tracking-label text-data uppercase">Sí</span>
						{:else}
							<!--
								Lo que falta, no un «no» pelado: un agente cerrado sin motivo se lee
								como un error del juego y no como un escalón por subir.
							-->
							<span class="text-[0.7rem] text-text-muted">{uno.requirement}</span>
						{/if}
					</td>
				</tr>
			{/each}
		</HudTable>

		{#if agentes.found === 0}
			<p class="w-full pt-3 text-1 text-text-muted">
				{#if agentes.total === 0}
					Esta corporación no tiene a nadie repartiendo trabajo.
				{:else}
					Ningún agente pasa ese recorte.
				{/if}
			</p>
		{/if}

		<Paginator
			page={consulta.page}
			pages={agentes.pages}
			href={(n) => conParametro({ pagina: String(n) })}
			class="mt-3"
		/>
	</TitledPanel>
{/if}

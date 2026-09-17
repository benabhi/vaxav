<!--
	Pestaña Miembros: quiénes son los otros.

	Una tabla y no una grilla de tarjetas: lo que uno hace acá es buscar a alguien,
	y para buscar sirve una lista ordenable. Las tarjetas se ven mejor con doce y
	peor con mil, y esto va a tener mil.

	Cada fila lleva **el sello del distintivo**, que es lo que la vuelve recorrible
	de un vistazo: un nombre entre cien es texto, un nombre con su emblema al lado
	se encuentra sin leer.
-->
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Identicon from '$lib/components/game/Identicon.svelte';
	import Panel from '$lib/components/cards/Panel.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import HudTable, { type Columna } from '$lib/components/ui/HudTable.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import CardTitle from '$lib/components/typography/CardTitle.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let miembros = $derived(data.miembros);

	/**
	 * Las columnas. Sin orden por ahora: el listado viene por antigüedad, que es
	 * como una corporación se cuenta a sí misma, y con una sola página no hay nada
	 * que reordenar todavía.
	 */
	const COLUMNAS: Columna[] = [
		{ label: 'Piloto', width: '14rem' },
		{ label: 'Oficio', width: '10rem' },
		{ label: 'Bandera', width: '10rem', from: 'md' },
		{ label: 'Vuela desde', width: '9rem', class: 'text-right' }
	];

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
	<TitledPanel title="Pilotos" detail={miembros.count} class="w-full">
		<HudTable columns={COLUMNAS} minWidth="38rem">
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
	</TitledPanel>
{/if}

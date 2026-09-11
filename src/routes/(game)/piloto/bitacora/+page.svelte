<!--
	Pestaña Bitácora: el registro de todo lo que el piloto resolvió.

	En un juego donde las cosas pasan mientras no estás, la bitácora no es un
	adorno: es el relato de tu partida, y lo primero que se lee al volver. Ver
	docs/systems/ACTIONS.md.

	Los informes que todavía no se habían visto se dibujan encendidos en cian, el
	mismo color con el que avisaron desde el Neocom. Es la única vez que se los va
	a ver así: entrar acá ya los dio por leídos.
-->
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Panel from '$lib/components/cards/Panel.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import ActionReport from '$lib/components/game/ActionReport.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import CardTitle from '$lib/components/typography/CardTitle.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let bitacora = $derived(data.bitacora);

	/** "12 informes" o "1 informe": una lista de uno no se anuncia en plural. */
	let cuenta = $derived(bitacora.total === 1 ? '1 informe' : `${bitacora.total} informes`);
</script>

<svelte:head><title>Bitácora · Piloto · Vaxav</title></svelte:head>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Bitácora</Eyebrow>
	<DisplayTitle>{data.pilot.callsign}</DisplayTitle>
</div>

{#if bitacora.total === 0}
	<Panel class="w-full">
		<div class="flex flex-col items-start gap-2">
			<CardTitle>Todavía no hay nada que contar</CardTitle>
			<BodyText>
				Acá va a quedar el informe de cada acción que resuelvas: qué hiciste, dónde, cuánto tardó y
				cuánta experiencia dejó. Dale una orden a tu nave y volvé.
			</BodyText>
		</div>
	</Panel>
{:else}
	<TitledPanel
		title="Informes"
		detail={bitacora.pages > 1
			? `${cuenta} · página ${bitacora.page} de ${bitacora.pages}`
			: cuenta}
		class="w-full"
	>
		<div class="flex w-full flex-col gap-3">
			{#each bitacora.entries as informe (informe.id)}
				<div
					class="w-full border border-l-[3px] p-[0.9rem]
						{informe.unread
						? 'border-border-soft border-l-data bg-surface-strong shadow-data-glow'
						: 'border-border-soft border-l-border-soft bg-surface'}"
				>
					<ActionReport report={informe} />
				</div>
			{/each}
		</div>

		<!--
			El paginador son enlaces y no botones: cada página de la bitácora es una
			URL distinta, así que se puede compartir, volver con el botón de atrás y
			recargar sin perder dónde estabas.
		-->
		{#if bitacora.pages > 1}
			<div class="mt-4 flex w-full items-center gap-3 border-t border-border-soft pt-3">
				{#if bitacora.page > 1}
					<a href="?pagina={bitacora.page - 1}" class="paginador">
						<Icon name="caret-left" weight="bold" size="0.7rem" />
						Anterior
					</a>
				{/if}
				<div class="grow"></div>
				<span class="font-mono text-[0.72rem] whitespace-nowrap text-text-muted">
					{bitacora.page} / {bitacora.pages}
				</span>
				<div class="grow"></div>
				{#if bitacora.page < bitacora.pages}
					<a href="?pagina={bitacora.page + 1}" class="paginador">
						Siguiente
						<Icon name="caret-right" weight="bold" size="0.7rem" />
					</a>
				{/if}
			</div>
		{/if}
	</TitledPanel>
{/if}

<style>
	/*
	 * El mismo lenguaje que el resto de los controles chicos del HUD: contorno
	 * fino, mayúsculas espaciadas, y se llena al señalarlo.
	 */
	.paginador {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		gap: 0.35rem;
		border: 1px solid var(--color-border-soft);
		padding: 0.25rem 0.6rem;
		font-family: var(--font-display);
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		text-decoration: none;
		white-space: nowrap;
		color: var(--color-accent-bright);
		transition:
			background-color var(--default-transition-duration) var(--ease-hud),
			color var(--default-transition-duration) var(--ease-hud);
	}

	.paginador:hover {
		background-color: var(--color-accent);
		color: var(--color-on-accent);
	}
</style>

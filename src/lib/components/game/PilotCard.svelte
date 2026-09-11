<!--
	Ficha de vuelo de un piloto: quién es, de dónde viene y dónde está.

	Reutilizable para el propio perfil y, más adelante, para ver el de cualquier
	otro piloto que se cruce en la misma estación: el componente no sabe de dónde
	salen los datos, sólo los muestra.

	Lo que en el juego lleva a otra cosa se ve distinto: facción, ubicación y
	corporación son la puerta a esa otra ficha, y por eso se leen en naranja con
	una flecha, no en el tono apagado de un dato fijo como la profesión.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import FloatingPanel from '../cards/FloatingPanel.svelte';
	import TitledPanel from '../cards/TitledPanel.svelte';
	import DataValue from '../typography/DataValue.svelte';
	import HudValue from '../typography/HudValue.svelte';
	import Label from '../typography/Label.svelte';
	import Popover from '../ui/Popover.svelte';

	interface Props {
		profession: string;
		factionName: string;
		factionArchetype: string;
		factionGovernment: string;
		factionMotto: string;
		location: string;
		locationLink: string;
		creditsLabel: string;
		/** Reemplaza a los créditos cuando la ficha es la de un NPC. */
		corporation?: string | null;
		corporationLink?: string | null;
	}

	let {
		profession,
		factionName,
		factionArchetype,
		factionGovernment,
		factionMotto,
		location,
		locationLink,
		creditsLabel,
		corporation = null,
		corporationLink = null
	}: Props = $props();
</script>

{#snippet lectura(name: string, valor: import('svelte').Snippet)}
	<div class="flex min-w-0 flex-col items-start gap-1">
		<Label>{name}</Label>
		{@render valor()}
	</div>
{/snippet}

{#snippet flecha(text: string)}
	<span class="flex items-center gap-1">
		<HudValue>{text}</HudValue>
		<Icon name="caret-right" weight="bold" size="0.8rem" />
	</span>
{/snippet}

<TitledPanel title="Ficha de vuelo" class="w-full">
	<div class="grid w-full grid-cols-2 gap-4 md:grid-cols-4">
		{#snippet valorProfesion()}<HudValue>{profession}</HudValue>{/snippet}
		{@render lectura('Profesión', valorProfesion)}

		{#snippet valorFaccion()}
			<Popover label="Ver la facción">
				{#snippet trigger()}
					<span
						class="flex items-center gap-1 text-accent-bright transition-colors hover:text-accent"
					>
						{@render flecha(factionName)}
					</span>
				{/snippet}
				<FloatingPanel class="p-4">
					<!-- La ficha resumida de una facción: lo justo para reconocerla. -->
					<div class="flex w-64 flex-col items-start gap-1">
						<p class="font-display text-4 font-bold tracking-title text-text-strong uppercase">
							{factionName}
						</p>
						<p
							class="font-display text-2 font-medium tracking-label text-accent uppercase text-shadow-glow"
						>
							{factionArchetype}
						</p>
						<p class="text-1 text-text-muted italic">«{factionMotto}»</p>
						<div class="mt-2 w-full border-t border-border-soft pt-3">
							{#snippet valorGobierno()}<HudValue>{factionGovernment}</HudValue>{/snippet}
							{@render lectura('Gobierno', valorGobierno)}
						</div>
					</div>
				</FloatingPanel>
			</Popover>
		{/snippet}
		{@render lectura('Facción', valorFaccion)}

		{#snippet valorUbicacion()}
			<a
				href={locationLink}
				class="text-accent-bright no-underline transition-colors hover:text-accent"
			>
				{@render flecha(location)}
			</a>
		{/snippet}
		{@render lectura('Ubicación', valorUbicacion)}

		{#if corporation !== null}
			{#snippet valorCorporacion()}
				{#if corporationLink}
					<a
						href={corporationLink}
						class="text-accent-bright no-underline transition-colors hover:text-accent"
					>
						{@render flecha(corporation)}
					</a>
				{:else}
					<HudValue>{corporation}</HudValue>
				{/if}
			{/snippet}
			{@render lectura('Corporación', valorCorporacion)}
		{:else}
			{#snippet valorCreditos()}<DataValue>{creditsLabel}</DataValue>{/snippet}
			{@render lectura('Créditos', valorCreditos)}
		{/if}
	</div>
</TitledPanel>

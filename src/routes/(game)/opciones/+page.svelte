<!--
	Pestaña Perfil: lo que el piloto muestra.

	Es la primera de Opciones porque es la única que cambia algo que ven los demás.
	Hoy es el retrato; el día que haya biografía, lema propio o un color de
	corporación, entran acá y no en Seguridad, que es de puertas y llaves.
-->
<script lang="ts">
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import PortraitPicker from '$lib/components/game/PortraitPicker.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import { PORTRAIT_HEIGHT, PORTRAIT_WIDTH } from '$lib/game/portraits';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Perfil · Opciones · Vaxav</title></svelte:head>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Opciones</Eyebrow>
	<DisplayTitle>Perfil</DisplayTitle>
</div>

<TitledPanel title="Retrato" class="w-full max-w-[34rem]">
	<div class="flex w-full flex-col items-start gap-4 xs:flex-row xs:items-start">
		<!--
			La misma proporción que en la credencial, y la misma foto: verla acá al
			tamaño del carnet es lo que evita subir una y descubrir después que el
			recorte dejó afuera media cara.
		-->
		<div
			class="relative w-[8rem] shrink-0 overflow-hidden border border-border bg-well"
			style="aspect-ratio: {PORTRAIT_WIDTH} / {PORTRAIT_HEIGHT}"
		>
			{#if data.pilot.portrait}
				<img src={data.pilot.portrait} alt="Tu retrato" class="h-full w-full object-cover" />
			{:else}
				<div class="flex h-full w-full items-center justify-center">
					<span class="font-display text-1 tracking-label text-text-muted uppercase">Sin foto</span>
				</div>
			{/if}
		</div>

		<div class="flex min-w-0 flex-col items-start gap-3">
			<BodyText>
				La foto de tu credencial. Se recorta a proporción de carnet y se guarda a {PORTRAIT_WIDTH}×{PORTRAIT_HEIGHT},
				así que no hace falta que la prepares: lo que elijas se ajusta solo.
			</BodyText>
			<PortraitPicker hasPortrait={data.pilot.portrait !== ''} size="2" />
		</div>
	</div>
</TitledPanel>

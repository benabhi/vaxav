<!-- Pestaña Habilidades: lo que el piloto sabe hacer. -->
<script lang="ts">
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import StarRating from '$lib/components/meters/StarRating.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import Label from '$lib/components/typography/Label.svelte';
	import { skillFamilyLabel } from '$lib/format';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Habilidades · Piloto · Vaxav</title></svelte:head>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Habilidades</Eyebrow>
	<DisplayTitle>{data.pilot.callsign}</DisplayTitle>
</div>

<TitledPanel title="Entrenadas" detail="Nivel 0 a 5" class="w-full">
	<div class="pb-3">
		<BodyText>
			Con esto arrancaste según tu profesión. De acá en más, la experiencia sale de resolver
			acciones.
		</BodyText>
	</div>
	<div class="flex w-full flex-col">
		{#each data.pilot.skills as skill (skill.code)}
			<!-- Una habilidad entrenada: nombre, familia, estrellas y experiencia. -->
			<div class="flex w-full flex-wrap items-center gap-3 border-b border-border-soft py-[0.6rem]">
				<div class="flex min-w-0 flex-col items-start gap-1">
					<span class="font-display text-2 font-medium tracking-display text-text-strong uppercase">
						{skill.name}
					</span>
					<Label>{skillFamilyLabel(skill.family)}</Label>
				</div>
				<div class="grow"></div>
				<div class="flex items-center gap-3">
					<StarRating states={skill.stars} />
					<p class="min-w-[4.5rem] text-right font-mono text-1 font-medium text-data">
						{skill.xp} XP
					</p>
				</div>
			</div>
		{/each}
	</div>
</TitledPanel>

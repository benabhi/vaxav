<!-- Pestaña Información: la ficha del piloto. -->
<script lang="ts">
	import PilotCard from '$lib/components/game/PilotCard.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import { NAVIGATION_ROUTE } from '$lib/routes';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Piloto · Vaxav</title></svelte:head>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Información</Eyebrow>
	<DisplayTitle>{data.pilot.callsign}</DisplayTitle>
</div>

<PilotCard
	profession={data.pilot.professionName}
	factionName={data.pilot.factionName}
	factionArchetype={data.pilot.factionArchetype}
	factionGovernment={data.pilot.factionGovernment}
	factionMotto={data.pilot.factionMotto}
	location={data.pilot.locationLabel}
	locationLink={NAVIGATION_ROUTE}
	creditsLabel={data.pilot.creditsLabel}
/>

<!-- Pestaña Información: la ficha del piloto. -->
<script lang="ts">
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import FamilyXpPanel from '$lib/components/game/FamilyXpPanel.svelte';
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

<!--
	Por dónde fue este piloto. Va en la ficha y no en Habilidades porque es un
	resumen, no un detalle: lo que se lee acá es a qué se dedicó, y el detalle de
	cada habilidad está a una pestaña de distancia.
-->
<TitledPanel title="Experiencia por rama" detail="Acumulada" class="w-full">
	<FamilyXpPanel families={data.pilot.families} />
</TitledPanel>

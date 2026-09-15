<!--
	Pestaña Información: la credencial del piloto y lo que cuelga de ella.

	Es la pantalla de identidad, y su figura es **la credencial**, como Nave tiene
	el anillo y Sistema el árbol. La tarjeta contesta las dos preguntas que definen
	a un piloto —quién sos y en qué te convertiste— con la foto de un lado y el
	hexágono de ramas del otro; lo de abajo son las notas al pie: las cifras
	exactas de cada rama y lo último que pasó.

	**Está armada para ir creciendo.** A medida que el juego sume corporaciones,
	rango, hangar o reputación, cada cosa entra como una celda más de la credencial
	o un panel más acá abajo, sin rediseñar la pantalla.
-->
<script lang="ts">
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import FamilyXpPanel from '$lib/components/game/FamilyXpPanel.svelte';
	import ActionReport from '$lib/components/game/ActionReport.svelte';
	import PilotCredential from '$lib/components/game/PilotCredential.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import HudLink from '$lib/components/buttons/HudLink.svelte';
	import { LOG_TAB } from '$lib/navigation';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Piloto · Vaxav</title></svelte:head>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Información</Eyebrow>
	<DisplayTitle>{data.pilot.callsign}</DisplayTitle>
</div>

<PilotCredential pilot={data.pilot} serial={data.serial} />

<!--
	Las notas al pie de la credencial. A la izquierda las cifras exactas de cada
	rama —el hexágono dice bien *qué forma* tiene el piloto y mal *cuánto*, y esta
	lista al revés: las dos leen las mismas dos métricas—, a la derecha lo último
	que pasó. En teléfono se apilan.
-->
<div class="flex w-full flex-col items-start gap-4 lg:flex-row">
	<div class="w-full min-w-0 flex-[3_1_0]">
		<TitledPanel title="Experiencia por rama" detail="Invertida y en pozo" class="w-full">
			<FamilyXpPanel families={data.pilot.families} />
		</TitledPanel>
	</div>

	<!--
		Lo último que pasó. Va en el resumen porque es la pregunta con la que uno
		entra en un juego donde las cosas ocurren mientras no estás; el archivo
		entero está a una pestaña de distancia.
	-->
	<div class="flex w-full min-w-0 flex-[2_1_0] flex-col gap-4">
		<TitledPanel
			title="Último informe"
			detail={data.logTotal > 0 ? `de ${data.logTotal}` : ''}
			class="w-full"
		>
			{#if data.lastReport}
				<div class="flex w-full flex-col items-start gap-3">
					<ActionReport report={data.lastReport} />
					<HudLink href={LOG_TAB} variant="outline" size="1">Ver la bitácora</HudLink>
				</div>
			{:else}
				<BodyText>
					Todavía no resolviste ninguna acción. Dale una orden a tu nave y acá va a quedar el
					informe.
				</BodyText>
			{/if}
		</TitledPanel>
	</div>
</div>

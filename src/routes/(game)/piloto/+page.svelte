<!--
	Pestaña Información: el resumen del piloto.

	Es la pantalla de identidad, y por eso tiene figura propia —la credencial—
	como Nave tiene el anillo y Sistema el árbol. Lo primero es quién sos; después,
	por dónde fuiste.

	**Está armada para ir creciendo.** Hoy responde quién, dónde y con qué; a
	medida que el juego sume corporaciones, rango, hangar o reputación, cada cosa
	entra como una celda más de la credencial o un panel más acá abajo, sin
	rediseñar la pantalla.
-->
<script lang="ts">
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import FamilyXpPanel from '$lib/components/game/FamilyXpPanel.svelte';
	import ActionReport from '$lib/components/game/ActionReport.svelte';
	import PilotCredential from '$lib/components/game/PilotCredential.svelte';
	import SkillHexagon from '$lib/components/game/SkillHexagon.svelte';
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

<PilotCredential pilot={data.pilot} />

<!--
	Dos columnas en escritorio: a la izquierda por dónde fue el piloto, a la
	derecha lo que la facción dice de sí misma. En teléfono se apilan.
-->
<div class="flex w-full flex-col items-start gap-4 lg:flex-row">
	<!--
		La figura y la lista, como en Nave: el hexágono dice bien **qué forma tiene**
		este piloto y mal cuánto exactamente; la lista al revés. Las dos leen las
		mismas dos métricas de cada rama —lo invertido y lo que espera en el pozo—,
		que es lo que hace que la figura no sea un adorno.
	-->
	<div class="w-full min-w-0 flex-[3_1_0]">
		<TitledPanel title="Experiencia por rama" detail="Invertida y en pozo" class="w-full">
			<div class="flex w-full flex-wrap items-start gap-[1.25rem]">
				<div class="min-w-0 flex-[1_1_16rem]">
					<SkillHexagon families={data.pilot.families} />
				</div>
				<div class="min-w-0 flex-[1_1_14rem]">
					<FamilyXpPanel families={data.pilot.families} />
				</div>
			</div>
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

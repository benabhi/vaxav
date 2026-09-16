<!--
	Pestaña Bitácora: el registro de todo lo que el piloto resolvió.

	En un juego donde las cosas pasan mientras no estás, la bitácora no es un
	adorno: es el relato de tu partida, y lo primero que se lee al volver. Ver
	docs/systems/ACTIONS.md.

	Los informes que todavía no se habían visto se dibujan encendidos en cian, el
	mismo color con el que avisaron desde el Neocom, y con el halo **hacia
	adentro**: lo que se enciende es el borde que avisa y el pedazo de panel pegado
	a él. Un aura alrededor de todo desdibuja el contorno y compite con el naranja
	de lo seleccionado. Es la única vez que se los va a ver así: entrar acá ya los
	dio por leídos.
-->
<script lang="ts">
	import Panel from '$lib/components/cards/Panel.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import Paginator from '$lib/components/ui/Paginator.svelte';
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
			<!--
				Lo no leído se marca **con color, no con brillo**. Encender el relleno de
				la fila entera convertía un aviso en una baliza: la lista se leía como
				si lo nuevo fuera urgente, cuando lo único que hace falta es poder
				encontrarlo de un vistazo. La señal es la línea cian del borde y el halo
				que entra desde ella; el fondo queda igual que el de una entrada leída.
			-->
			{#each bitacora.entries as informe (informe.id)}
				<div
					class="w-full border border-l-[3px] bg-surface p-[0.9rem]
						{informe.unread
						? 'aviso-panel border-border-soft border-l-data'
						: 'border-border-soft border-l-border-soft'}"
				>
					<ActionReport report={informe} />
				</div>
			{/each}
		</div>

		<Paginator
			page={bitacora.page}
			pages={bitacora.pages}
			href={(pagina) => `?pagina=${pagina}`}
			class="mt-4"
		/>
	</TitledPanel>
{/if}

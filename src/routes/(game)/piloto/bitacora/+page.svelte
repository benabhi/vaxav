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

	**Un renglón por informe, no un bloque.** El informe completo ocupa media
	pantalla, y con veinte en una página la bitácora dejaba de ser un archivo para
	ser un muro: para encontrar el de ayer había que pasar cuatro pantallas. Ahora
	cada uno entra en una línea —qué fue, dónde, qué trajo y cuándo— y se abre acá
	mismo si hace falta el detalle.

	Y además se puede abrir **en una ventana**, que es otra pregunta: desplegar es
	para comparar dos seguidos sin perder el lugar en la lista; la ventana es para
	leer uno solo sin nada alrededor. El día que un informe traiga la crónica de un
	combate por turnos, ésa va a ser la forma de leerla.
-->
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Panel from '$lib/components/cards/Panel.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import Paginator from '$lib/components/ui/Paginator.svelte';
	import ActionReport from '$lib/components/game/ActionReport.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import CardTitle from '$lib/components/typography/CardTitle.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import { thousands } from '$lib/format';
	import type { Informe } from '$lib/tipos';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let bitacora = $derived(data.bitacora);

	/** "12 informes" o "1 informe": una lista de uno no se anuncia en plural. */
	let cuenta = $derived(bitacora.total === 1 ? '1 informe' : `${bitacora.total} informes`);

	/**
	 * Qué renglón está desplegado, o cero si ninguno.
	 *
	 * **Uno por vez.** Con varios abiertos vuelve el muro que el renglón vino a
	 * resolver, y comparar dos informes es justamente ir de uno al otro.
	 */
	let abierto = $state(0);

	/**
	 * El informe que está en la ventana, y si la ventana está abierta.
	 *
	 * Van separados porque el diálogo se cierra solo —con la cruz o con Escape— y
	 * para eso necesita un valor que pueda escribir. El informe se queda puesto
	 * mientras tanto: no molesta a nadie y evita que la ventana parpadee vacía
	 * mientras se va.
	 */
	let enVentana = $state<Informe | null>(null);
	let ventanaAbierta = $state(false);

	/**
	 * El resumen de un informe en una línea: lo que trajo y lo que dejó.
	 *
	 * Son los dos números que uno busca al volver —cuánto saqué y cuánto aprendí—,
	 * y son los que deciden si vale la pena abrir el detalle.
	 */
	function resumen(informe: Informe): string {
		const partes: string[] = [];
		if (informe.loot) partes.push(`${thousands(informe.loot.units)} u`);
		if (informe.loot) partes.push(`${informe.loot.value} CR`);
		if (informe.deposit) partes.push(`+${thousands(informe.deposit.xp)} XP`);
		else if (informe.xpTotal > 0) partes.push(`+${thousands(informe.xpTotal)} XP`);
		return partes.join(' · ');
	}

	/** La fecha corta del renglón. La hora completa la dice el informe abierto. */
	function fecha(at: number): string {
		return new Date(at).toLocaleString('es-AR', {
			day: '2-digit',
			month: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
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
		<div class="flex w-full flex-col">
			{#each bitacora.entries as informe (informe.id)}
				{@const desplegado = abierto === informe.id}
				<div
					class="w-full border-b border-l-[3px] border-b-border-soft/40 last:border-b-0
						{informe.unread ? 'aviso-panel border-l-data bg-surface' : 'border-l-transparent bg-transparent'}"
				>
					<!--
						El renglón. Tocarlo despliega el informe acá mismo; la lupa lo abre en
						una ventana. Son dos gestos porque son dos preguntas distintas.
					-->
					<div class="flex w-full items-center gap-2 pr-[0.4rem] hover:bg-surface-hover">
						<button
							type="button"
							onclick={() => (abierto = desplegado ? 0 : informe.id)}
							aria-expanded={desplegado}
							class="flex min-w-0 grow cursor-pointer flex-wrap items-center gap-x-3 gap-y-1
								border-0 bg-transparent px-[0.6rem] py-[0.55rem] text-left"
						>
							<Icon
								name={desplegado ? 'caret-down' : 'caret-right'}
								weight="bold"
								size="0.6rem"
								class="shrink-0 text-accent-dim"
							/>
							<Icon
								name={informe.icon}
								weight="duotone"
								size="0.9rem"
								class="shrink-0 text-accent"
							/>

							<span
								class="shrink-0 font-display text-[0.74rem] font-bold tracking-label
									text-text-strong uppercase"
							>
								{informe.kindLabel}
							</span>

							{#if informe.place}
								<span class="min-w-0 truncate text-1 text-text-muted">{informe.place}</span>
							{/if}

							<div class="grow"></div>

							{#if resumen(informe)}
								<span class="shrink-0 font-mono text-[0.72rem] whitespace-nowrap text-data">
									{resumen(informe)}
								</span>
							{/if}

							<span
								class="hidden shrink-0 font-mono text-[0.68rem] whitespace-nowrap text-text-muted
									xs:inline"
							>
								{fecha(informe.at)}
							</span>
						</button>

						<button
							type="button"
							onclick={() => {
								enVentana = informe;
								ventanaAbierta = true;
							}}
							title="Abrir en una ventana"
							aria-label="Abrir el informe en una ventana"
							class="flex shrink-0 cursor-pointer items-center border-0 bg-transparent p-[0.35rem]
								text-text-muted transition-colors hover:text-accent-bright"
						>
							<Icon name="arrows-out" weight="bold" size="0.75rem" />
						</button>
					</div>

					{#if desplegado}
						<div class="w-full border-t border-border-soft/40 bg-surface px-[0.9rem] py-[0.8rem]">
							<ActionReport report={informe} />
						</div>
					{/if}
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

	<!--
		El informe solo, sin la lista alrededor. Se le pasa una copia del que se
		abrió y no un identificador: la ventana muestra lo que se abrió, y que la
		lista cambie de página debajo no tiene por qué cambiar lo que se está
		leyendo.
	-->
	<Modal
		bind:open={ventanaAbierta}
		title={enVentana ? enVentana.kindLabel : 'Informe'}
		icon={enVentana ? enVentana.icon : 'clipboard-text'}
		detail={enVentana ? enVentana.place : ''}
		size="lg"
	>
		{#if enVentana}
			<ActionReport report={enVentana} />
		{/if}
	</Modal>
{/if}

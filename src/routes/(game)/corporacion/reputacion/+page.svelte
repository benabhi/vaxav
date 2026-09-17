<!--
	Pestaña Reputación: cuánto confía en vos tu corporación, y de dónde salió.

	**La figura de esta pantalla es la escalera.** No dibuja sólo cuánto llevás:
	dibuja que los escalones no están repartidos parejo —diez puntos hasta el
	segundo, treinta hasta el último—, que es lo que hay que entender antes de
	empezar a subir. Al lado van las cifras exactas, como manda la regla de las
	figuras.

	Y debajo, el libro. El número solo no alcanza: una barra que sube sin decir de
	dónde salió se siente igual que el azar.
-->
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Panel from '$lib/components/cards/Panel.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import HudLink from '$lib/components/buttons/HudLink.svelte';
	import ReputationLadder from '$lib/components/game/ReputationLadder.svelte';
	import SegmentBar from '$lib/components/meters/SegmentBar.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import CardTitle from '$lib/components/typography/CardTitle.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import Label from '$lib/components/typography/Label.svelte';
	import HudTable, { type Columna } from '$lib/components/ui/HudTable.svelte';
	import Paginator from '$lib/components/ui/Paginator.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let pagina = $derived(data.reputacion);

	/**
	 * La fecha de un asiento, en la hora del jugador y no en la del servidor.
	 *
	 * Misma forma que el libro de la billetera: 24 horas, sin «a. m.», porque el
	 * juego lleva reloj UTC de 24 en la barra de estado.
	 */
	function fecha(at: number): string {
		return new Date(at).toLocaleString('es-AR', {
			day: '2-digit',
			month: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		});
	}

	/** Las columnas del libro, con anchos declarados como en toda tabla del juego. */
	const COLUMNAS: Columna[] = [
		{ label: 'Fecha', width: '7.5rem' },
		{ label: 'Motivo', width: '9rem' },
		{ label: 'Detalle', from: 'md' },
		{ label: 'Movimiento', width: '7rem', class: 'text-right' },
		{ label: 'Quedó', width: '7rem', class: 'text-right' }
	];
</script>

<svelte:head><title>Reputación · Corporación · Vaxav</title></svelte:head>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Reputación</Eyebrow>
	<DisplayTitle>{pagina.name}</DisplayTitle>
</div>

{#if !pagina.belongs || !pagina.reputation}
	<Panel class="w-full">
		<div class="flex flex-col items-start gap-3">
			<CardTitle>No respondés a nadie</CardTitle>
			<BodyText>
				La reputación se gana con alguien. Alistate en una corporación y esta pantalla va a empezar
				a contar la historia entre ustedes.
			</BodyText>
			<HudLink href="/corporacion" variant="outline" size="1">
				<Icon name="share-network" weight="bold" size="0.7rem" />
				Ir a la ficha
			</HudLink>
		</div>
	</Panel>
{:else}
	<!--
		Las lecturas arriba y la figura debajo, a todo el ancho. La escalera es una
		banda: puesta de costado contra una columna de tres lecturas dejaba media
		panel en blanco, y estirada a lo largo se lee de un vistazo cuánto falta.
	-->
	<TitledPanel title="Progreso" detail={pagina.reputation.tier} class="w-full">
		<div class="flex w-full flex-col gap-5">
			<div class="grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:gap-0">
				<div class="flex flex-col items-start gap-1 md:pr-5">
					<Label>Corporación</Label>
					<span class="font-mono text-6 text-data">{pagina.reputation.value}</span>
					<SegmentBar
						filled={pagina.reputation.reached}
						total={pagina.reputation.tiers}
						class="w-[7rem]"
					/>
				</div>

				<!--
							La otra escalera. No es un dato de más: la de la bandera abre ese
							mismo nivel en todas las corporaciones que la llevan, así que sin
							ella no se entiende por qué atiende un agente que debería estar
							cerrado.
						-->
				<div
					class="flex flex-col items-start gap-1 border-t border-border-soft pt-3 md:border-t-0
								md:border-l md:px-5 md:pt-0"
				>
					<Label>Facción</Label>
					<span class="flex items-baseline gap-2">
						<span class="font-mono text-4 text-data">{pagina.reputation.factionValue}</span>
						<span class="font-display text-1 tracking-display text-text-muted uppercase">
							{pagina.reputation.factionTier}
						</span>
					</span>
					<span class="text-[0.7rem] text-text-muted">
						Abre ese nivel en todas las corporaciones de su bandera, y por eso cuesta bastante más.
					</span>
				</div>

				<div
					class="flex flex-col items-start gap-1 border-t border-border-soft pt-3 md:border-t-0
								md:border-l md:pt-0 md:pl-5"
				>
					<Label>Agentes</Label>
					<span class="font-display text-3 tracking-display text-accent-bright uppercase">
						Agentes de nivel {pagina.reputation.level}
					</span>
					{#if pagina.reputation.next}
						<span class="text-[0.7rem] text-text-muted">{pagina.reputation.next}</span>
					{/if}
				</div>
			</div>

			<div class="w-full border-t border-border-soft pt-4">
				<ReputationLadder ladder={pagina.reputation.ladder} percent={pagina.reputation.percent} />
			</div>
		</div>
	</TitledPanel>

	<TitledPanel
		title="Historial"
		detail={pagina.total === 1 ? '1 movimiento' : `${pagina.total} movimientos`}
		class="w-full"
	>
		<HudTable columns={COLUMNAS} minWidth="38rem">
			{#each pagina.moves as movimiento (movimiento.id)}
				<tr class="border-b border-border-soft/40 last:border-0 hover:bg-surface-hover">
					<td class="py-2 font-mono text-[0.72rem] text-text-muted">{fecha(movimiento.at)}</td>
					<td class="py-2">
						<span class="flex items-center gap-2">
							<Icon
								name={movimiento.icon}
								weight="bold"
								size="0.75rem"
								class="shrink-0 text-accent"
							/>
							<span class="truncate text-1 text-text-body">{movimiento.reason}</span>
						</span>
					</td>
					<td class="py-2 text-1 text-text-muted">{movimiento.memo}</td>
					<td
						class="py-2 text-right font-mono text-1 {movimiento.positive
							? 'text-data'
							: 'text-accent-bright'}"
					>
						{movimiento.amount}
					</td>
					<td class="py-2 text-right font-mono text-1 text-text-body">{movimiento.valueAfter}</td>
				</tr>
			{/each}
		</HudTable>

		{#if pagina.total === 0}
			<!--
				El estado vacío va afuera de la tabla, como en toda lista del juego. Y
				dice de qué se va a llenar, no sólo que está vacía.
			-->
			<p class="w-full pt-3 text-1 text-text-muted">
				Todavía no pasó nada entre ustedes. Acá va a quedar cada misión que termines para ellos, con
				lo que sumó y el número que dejó.
			</p>
		{/if}

		<Paginator page={pagina.page} pages={pagina.pages} href={(n) => `?pagina=${n}`} class="mt-3" />
	</TitledPanel>
{/if}

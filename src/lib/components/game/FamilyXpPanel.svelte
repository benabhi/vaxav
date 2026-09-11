<!--
	La experiencia del piloto repartida por rama del árbol: la lista que acompaña
	al hexágono.

	La figura dice bien *cuál* y mal *cuánto*; esto dice las cifras exactas. Es la
	regla de toda figura del proyecto —siempre va con su lista al lado, leyendo los
	mismos datos— y por eso las dos métricas de acá son las dos del hexágono: lo
	invertido en naranja, el pozo en cian.

	Las seis ramas salen siempre, incluso en cero: una rama vacía también informa
	—dice por dónde *no* fue— y una lista que cambia de largo según el piloto no se
	puede comparar de un vistazo.

	Ver docs/systems/SKILLS.md.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import ProgressBar from '../meters/ProgressBar.svelte';
	import { thousands } from '$lib/format';
	import type { RamaXp } from '$lib/tipos';

	interface Props {
		families: readonly RamaXp[];
	}

	let { families }: Props = $props();

	/**
	 * De más a menos: el orden dice a qué se dedica el piloto. Desempata el pozo,
	 * porque entre dos ramas sin invertir importa cuál está a punto de moverse.
	 */
	let ordenadas = $derived([...families].sort((a, b) => b.xp - a.xp || b.pool - a.pool));
	let total = $derived(families.reduce((suma, rama) => suma + rama.xp, 0));
	let guardado = $derived(families.reduce((suma, rama) => suma + rama.pool, 0));
</script>

<div class="flex w-full flex-col gap-3">
	{#each ordenadas as rama (rama.family)}
		<div class="flex w-full flex-col gap-1">
			<div class="flex w-full flex-wrap items-baseline gap-x-2 gap-y-[0.15rem]">
				<Icon
					name={rama.icon}
					weight={rama.xp > 0 || rama.pool > 0 ? 'duotone' : 'thin'}
					size="0.9rem"
					class={rama.xp > 0 || rama.pool > 0 ? 'text-accent' : 'text-text-muted'}
				/>
				<span
					class="min-w-0 overflow-hidden font-display text-[0.76rem] font-bold tracking-display
						text-ellipsis whitespace-nowrap uppercase
						{rama.xp > 0 || rama.pool > 0 ? 'text-text-strong' : 'text-text-muted'}"
				>
					{rama.name}
				</span>
				<div class="grow"></div>
				<!--
					Las tres cifras van juntas y en un solo grupo: si la fila no entra,
					bajan las tres de una y no queda un "+440" suelto en su propio
					renglón. Lo invertido en naranja y el pozo en cian, los mismos dos
					colores con los que el hexágono dibuja las mismas dos cosas.
				-->
				<span class="flex shrink-0 items-baseline gap-2">
					<span class="font-mono text-[0.68rem] whitespace-nowrap text-text-muted">
						{rama.trained} / {rama.total}
					</span>
					<span
						class="w-[3.5rem] text-right font-mono text-[0.78rem]
							{rama.xp > 0 ? 'text-accent-bright' : 'text-text-muted'}"
					>
						{thousands(rama.xp)}
					</span>
					<!-- El pozo sólo aparece si hay algo: un "+0" seis veces es ruido. -->
					<span class="w-[3.5rem] text-right font-mono text-[0.78rem] text-data">
						{rama.pool > 0 ? `+${thousands(rama.pool)}` : ''}
					</span>
				</span>
			</div>

			<ProgressBar percent={rama.share} />
			{#if rama.pool > 0}
				<ProgressBar percent={rama.poolShare} color="var(--color-data)" />
			{/if}
		</div>
	{/each}

	<div class="flex w-full flex-wrap items-center gap-x-3 gap-y-1 border-t border-border-soft pt-2">
		<span class="font-display text-[0.68rem] tracking-label text-accent-dim uppercase">
			Total invertido
		</span>
		<span class="font-mono text-[0.82rem] text-accent-bright">{thousands(total)} XP</span>
		<div class="grow"></div>
		<span class="font-display text-[0.68rem] tracking-label text-accent-dim uppercase">
			Sin invertir
		</span>
		<span class="font-mono text-[0.82rem] text-data">{thousands(guardado)} XP</span>
	</div>
</div>

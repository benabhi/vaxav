<!--
	La experiencia del piloto repartida por rama del árbol.

	Contesta de un vistazo la pregunta que la lista de habilidades contesta mal:
	**por dónde fue este piloto**. Seis renglones ordenados por peso dicen si es un
	minero, un transportista o alguien que todavía no se decidió; treinta
	habilidades con sus estrellas, no.

	Las seis salen siempre, incluso en cero: una rama vacía también informa —dice
	por dónde *no* fue— y una lista que cambia de largo según el piloto no se puede
	comparar de un vistazo.

	**Esto es la antesala del pozo por familia** (docs/systems/SKILLS.md, decidido
	y sin implementar). Hoy el número es lo acumulado en las habilidades de la
	rama; mañana es el pozo que la rama tiene para gastar. Mismo lugar, misma
	forma, otro significado.
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

	/** De más a menos: el orden dice a qué se dedica el piloto. */
	let ordenadas = $derived([...families].sort((a, b) => b.xp - a.xp));
	let total = $derived(families.reduce((suma, rama) => suma + rama.xp, 0));
</script>

<div class="flex w-full flex-col gap-3">
	{#each ordenadas as rama (rama.family)}
		<div class="flex w-full flex-col gap-1">
			<div class="flex w-full flex-wrap items-baseline gap-2">
				<Icon
					name={rama.icon}
					weight={rama.xp > 0 ? 'duotone' : 'thin'}
					size="0.9rem"
					class={rama.xp > 0 ? 'text-accent' : 'text-text-muted'}
				/>
				<span
					class="font-display text-[0.76rem] font-bold tracking-display uppercase
						{rama.xp > 0 ? 'text-text-strong' : 'text-text-muted'}"
				>
					{rama.name}
				</span>
				<div class="grow"></div>
				<span class="shrink-0 font-mono text-[0.68rem] whitespace-nowrap text-text-muted">
					{rama.trained} / {rama.total}
				</span>
				<span
					class="w-[4.5rem] shrink-0 text-right font-mono text-[0.78rem]
						{rama.xp > 0 ? 'text-data' : 'text-text-muted'}"
				>
					{thousands(rama.xp)}
				</span>
			</div>
			<ProgressBar percent={rama.share} />
		</div>
	{/each}

	<div class="flex w-full items-center gap-3 border-t border-border-soft pt-2">
		<span class="font-display text-[0.68rem] tracking-label text-accent-dim uppercase">
			Total acumulado
		</span>
		<div class="grow"></div>
		<span class="font-mono text-[0.82rem] text-data">{thousands(total)} XP</span>
	</div>
</div>

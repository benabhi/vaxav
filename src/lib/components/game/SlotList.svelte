<!--
	Las ranuras de la nave: **el banco de trabajo** de la pantalla de equipamiento.

	Empezó siendo un índice del anillo y terminó siendo donde se trabaja, y eso no
	es un accidente de diseño sino una consecuencia de la geometría. Un anillo dice
	muy bien *dónde* está cada cosa y muy mal *qué* es cada una; y sobre todo, sus
	elementos están repartidos en trescientos sesenta grados, así que **un panel que
	sirva a una ranura no tiene ningún lado natural donde abrirse**. Abajo obliga a
	bajar, al costado achica el anillo, flotando tapa algo — siempre. Un círculo no
	tiene un costado.

	La lista sí lo tiene: cada fila se abre **en su lugar**, empujando sólo lo que
	tiene debajo. Es el mismo gesto que el árbol de habilidades, que ya funciona
	así, y por eso no hay nada nuevo que aprender.

	El anillo no se va: se queda con el oficio que sí hace bien, que es ser la
	figura de la pantalla. Los dos leen las mismas filas y comparten la ranura
	elegida, así que tocar en cualquiera de los dos prende los dos.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../Icon.svelte';
	import type { GrupoRanuras } from '$lib/tipos';

	interface Props {
		groups: readonly GrupoRanuras[];
		onChoose: (index: number) => void;
		/**
		 * Qué se dibuja debajo de la ranura abierta.
		 *
		 * Llega como snippet y no como datos porque lo que va ahí —las opciones, sus
		 * formularios, el aviso de por qué no se puede tocar la nave— es de la
		 * pantalla y no de la lista. La lista sabe **dónde** va el detalle; qué dice,
		 * no es asunto suyo.
		 */
		detail?: Snippet;
		class?: string;
	}

	let { groups, onChoose, detail, class: extra = '' }: Props = $props();
</script>

<div class="flex w-full min-w-0 flex-col items-start gap-3 {extra}">
	{#each groups as group (group.label)}
		<div class="flex w-full flex-col gap-1">
			<div
				class="flex w-full items-center gap-[0.35rem] border-b border-border-soft pb-1 text-accent-dim"
			>
				<Icon name={group.icon} weight="bold" size="0.7rem" />
				<span
					class="font-display text-[0.62rem] font-bold tracking-label whitespace-nowrap uppercase"
				>
					{group.label}
				</span>
			</div>
			{#each group.rows as slot (slot.index)}
				<button
					type="button"
					onclick={() => onChoose(slot.index)}
					title={slot.title}
					aria-expanded={slot.selected}
					class="flex w-full cursor-pointer items-center gap-[0.45rem] border-l-[2px] px-[0.45rem]
						py-[0.3rem] text-left transition-[background-color,color]
						{slot.selected
						? 'border-l-accent-bright bg-accent text-on-accent hover:bg-accent'
						: slot.filled
							? 'border-l-transparent bg-transparent text-text-strong hover:bg-surface-hover'
							: 'border-l-transparent bg-transparent text-text-muted hover:bg-surface-hover'}"
				>
					<Icon name={slot.icon} weight={slot.filled ? 'fill' : 'light'} size="0.85rem" />
					<span
						class="min-w-0 flex-[1_1_0] overflow-hidden font-display text-[0.72rem] font-semibold
							tracking-display text-ellipsis whitespace-nowrap uppercase"
					>
						{slot.moduleName}
					</span>
					<span class="shrink-0 font-mono text-[0.68rem]">{slot.badge}</span>
					<!--
						La flecha dice que la fila se abre. Sin ella, una lista donde algunas
						filas esconden cosas y otras no es una lotería.
					-->
					<Icon
						name={slot.selected ? 'caret-up' : 'caret-down'}
						weight="bold"
						size="0.6rem"
						class="shrink-0 opacity-70"
					/>
				</button>

				<!--
					El detalle, debajo de su propia fila. Va sangrado y con una línea al
					costado: es lo que dice "esto pertenece a la ranura de arriba" sin
					escribirlo.
				-->
				{#if slot.selected && detail}
					<div class="w-full border-l-[2px] border-l-accent-dim pt-1 pb-2 pl-[0.45rem]">
						{@render detail()}
					</div>
				{/if}
			{/each}
		</div>
	{/each}
</div>

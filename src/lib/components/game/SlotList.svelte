<!--
	La lista de ranuras que acompaña al anillo de equipamiento.

	Es un **índice del anillo, no una segunda interfaz**: lee las mismas filas y
	comparte la ranura elegida, así que señalar en cualquiera de los dos prende
	los dos.

	Existe porque un anillo dice bien *dónde* está cada cosa y mal *qué* es cada
	una: once círculos ordenados alrededor se recorren con el ojo, pero una lista
	con encabezados se lee de arriba abajo. Y en un teléfono, donde apuntarle a un
	círculo de cuarenta píxeles es incómodo, la lista es lo que termina usándose.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import type { GrupoRanuras } from '$lib/tipos';

	interface Props {
		groups: readonly GrupoRanuras[];
		onChoose: (index: number) => void;
		class?: string;
	}

	let { groups, onChoose, class: extra = '' }: Props = $props();
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
					aria-pressed={slot.selected}
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
				</button>
			{/each}
		</div>
	{/each}
</div>

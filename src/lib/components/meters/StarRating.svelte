<!--
	Las cinco estrellas de una habilidad.

	Recibe los estados ya resueltos —el cálculo vive en `$lib/format`— para que la
	interfaz sólo dibuje y la regla se pueda probar sin levantar nada.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import type { StarState } from '$lib/format';

	interface Props {
		states: readonly StarState[];
		size?: string;
	}

	let { states, size = '1rem' }: Props = $props();
</script>

<div class="flex shrink-0 items-center gap-1">
	{#each states as state, i (i)}
		{#if state === 'full'}
			<Icon
				name="star"
				weight="fill"
				{size}
				class="text-accent [filter:drop-shadow(0_0_6px_rgba(255,122,26,0.55))]"
			/>
		{:else if state === 'half'}
			<Icon name="star-half" weight="fill" {size} class="text-accent-bright" />
		{:else}
			<Icon name="star" weight="light" {size} class="text-accent-dim" />
		{/if}
	{/each}
</div>

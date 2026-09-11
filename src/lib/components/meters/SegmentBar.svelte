<!-- Barra de segmentos al estilo del HUD: bloques llenos y bloques vacíos. -->
<script lang="ts">
	interface Props {
		filled: number;
		total?: number;
		class?: string;
	}

	let { filled, total = 5, class: extra = 'w-28' }: Props = $props();
</script>

<div class="flex items-center gap-1 {extra}">
	{#each { length: total } as _, index (index)}
		<div
			class="h-2 grow border border-border-soft transition-[background-color] {filled > index
				? 'bg-accent'
				: 'bg-surface-strong'}"
		></div>
	{/each}
</div>

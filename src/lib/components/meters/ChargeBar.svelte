<!--
	Barra de carga segmentada, al estilo del salto FSD de Elite Dangerous.

	Es un intermedio entre `SegmentBar` —discreta, pensada para una escala fija
	como la reputación— y `ProgressBar` —continua, una sola barra lisa—: acá el
	porcentaje es continuo, pero se dibuja como muchas barras angostas y contiguas
	en vez de una superficie, así se lee como carga y no como un simple avance.
-->
<script lang="ts">
	interface Props {
		percent: number;
		segments?: number;
		class?: string;
	}

	let { percent, segments = 24, class: extra = 'w-full' }: Props = $props();

	let filled = $derived(Math.floor((percent * segments) / 100));
</script>

<div class="flex items-center gap-1 {extra}">
	{#each { length: segments } as _, index (index)}
		<div
			class="h-[0.6rem] grow transition-[background-color,box-shadow] {filled > index
				? 'bg-accent shadow-glow'
				: 'bg-surface-strong'}"
		></div>
	{/each}
</div>

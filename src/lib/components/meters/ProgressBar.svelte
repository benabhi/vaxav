<!--
	Barra continua, para lo que sí es un porcentaje: un temporizador, una carga.

	`color` por omisión es el naranja del HUD, pero se puede pisar: la ficha de
	nave la usa en cian para el escudo y en otros tonos para blindaje y casco, una
	barra por capa como en EVE.
-->
<script lang="ts">
	interface Props {
		percent: number;
		/** Un color CSS, normalmente una variable del tema. */
		color?: string;
		class?: string;
	}

	let { percent, color = 'var(--color-accent)', class: extra = '' }: Props = $props();

	let ancho = $derived(Math.min(100, Math.max(0, percent)));
</script>

<div class="h-[0.35rem] w-full border border-border-soft bg-surface-strong {extra}">
	<div
		class="h-full transition-[width,background-color]"
		style="width: {ancho}%; background-color: {color}; box-shadow: 0 0 16px {color}"
	></div>
</div>

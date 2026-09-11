<!--
	Marco sin cabecera ni pie, para pantallas que se llevan la vista entera.

	Lo usa la portada: una intro de juego no tiene barra de navegación encima.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="relative min-h-dvh w-full overflow-hidden">
	{@render children()}
</div>

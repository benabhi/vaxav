<!-- Logotipo tipográfico: un planeta y el nombre del juego. -->
<script lang="ts">
	import Icon from '../Icon.svelte';

	interface Props {
		/** La clase de tamaño del nombre, de la escala de texto. */
		size?: string;
		iconSize?: string;
	}

	let { size = 'text-4', iconSize = '1.1rem' }: Props = $props();
</script>

<div class="flex items-center gap-3">
	<Icon name="planet" weight="duotone" size={iconSize} class="text-accent" />
	<span class="{size} font-display font-bold tracking-wordmark text-text-strong text-shadow-glow">
		VAXAV
	</span>
</div>

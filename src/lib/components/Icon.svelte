<!--
	Un ícono de Phosphor, servido desde el proyecto y teñido por el tema.

	Se pinta con `mask` y no con `<img>`: así toma el color del texto que lo
	rodea y encaja solo en botones, enlaces y filas encendidas, sin que quien lo
	usa tenga que repetir el color.
-->
<script lang="ts">
	import type { IconName, IconWeight } from '$lib/icons';

	interface Props {
		name: IconName;
		/** El peso da jerarquía sin agregar un color. */
		weight?: IconWeight;
		size?: string;
		class?: string;
	}

	let { name, weight = 'regular', size = '1.25rem', class: extra = '' }: Props = $props();
</script>

<span
	class="icon {extra}"
	style="--icon-source: url('/icons/{weight}/{name}.svg'); --icon-size: {size}"
	aria-hidden="true"
></span>

<style>
	.icon {
		display: block;
		flex-shrink: 0;
		width: var(--icon-size);
		height: var(--icon-size);
		background-color: currentColor;
		mask: var(--icon-source) center / contain no-repeat;
	}
</style>

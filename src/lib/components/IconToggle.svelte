<!--
	El mismo ícono en dos pesos según esté activo o no.

	Es la forma de mostrar una selección sin recurrir a un color chillón: el
	ícono gana cuerpo cuando se lo elige.
-->
<script lang="ts">
	import Icon from './Icon.svelte';
	import type { IconName } from '$lib/icons';

	interface Props {
		name: IconName;
		active: boolean;
		size?: string;
		class?: string;
	}

	let { name, active, size = '1.5rem', class: extra = '' }: Props = $props();
</script>

<Icon {name} weight={active ? 'duotone' : 'light'} {size} class={extra} />

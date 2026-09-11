<!-- La etiqueta de un dato: apagada, para que el valor se lleve la atención. -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		class?: string;
	}

	let { children, class: extra = '' }: Props = $props();
</script>

<p class="font-display text-1 tracking-display text-accent-dim uppercase {extra}">
	{@render children()}
</p>

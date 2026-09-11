<!-- Cifra o lectura del HUD: monoespaciada y en el color reservado a datos. -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		class?: string;
	}

	let { children, class: extra = '' }: Props = $props();
</script>

<p class="font-mono text-2 font-medium text-data {extra}">{@render children()}</p>

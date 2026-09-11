<!-- Párrafo de entrada: el que explica de qué se trata la pantalla. -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		class?: string;
	}

	let { children, class: extra = '' }: Props = $props();
</script>

<p class="text-3 leading-[1.7] text-text-body sm:text-4 {extra}">{@render children()}</p>

<!-- Título de una tarjeta o de un bloque chico. -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		class?: string;
	}

	let { children, class: extra = '' }: Props = $props();
</script>

<h3 class="font-display text-3 font-bold tracking-display text-text-strong uppercase {extra}">
	{@render children()}
</h3>

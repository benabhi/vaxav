<!-- Título de una sección dentro de la página. -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		class?: string;
	}

	let { children, class: extra = '' }: Props = $props();
</script>

<h2
	class="font-display text-5 font-bold tracking-title text-text-strong uppercase md:text-6 {extra}"
>
	{@render children()}
</h2>

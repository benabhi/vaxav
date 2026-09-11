<!-- Título principal de una pantalla. Uno solo por página. -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		class?: string;
	}

	let { children, class: extra = '' }: Props = $props();
</script>

<h1
	class="font-display text-7 leading-[1.1] font-bold tracking-title text-text-strong uppercase text-shadow-glow md:text-8 {extra}"
>
	{@render children()}
</h1>

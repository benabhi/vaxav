<!-- Texto corriente. -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		class?: string;
	}

	let { children, class: extra = '' }: Props = $props();
</script>

<p class="text-2 leading-[1.65] text-text-body {extra}">{@render children()}</p>

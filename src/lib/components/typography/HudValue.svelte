<!-- Valor de un dato en la voz del HUD: naranja claro y en mayúsculas. -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		class?: string;
	}

	let { children, class: extra = '' }: Props = $props();
</script>

<p class="font-display text-2 font-medium tracking-display text-accent-bright uppercase {extra}">
	{@render children()}
</p>

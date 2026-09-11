<!-- Etiqueta breve que encabeza una sección. Es la voz del HUD. -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		class?: string;
	}

	let { children, class: extra = '' }: Props = $props();
</script>

<p
	class="font-display text-1 font-medium tracking-label text-accent uppercase text-shadow-glow {extra}"
>
	{@render children()}
</p>

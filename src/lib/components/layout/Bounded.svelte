<!-- Centra un bloque y lo limita al ancho de contenido del sitio. -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		/** Una clase de ancho máximo; por omisión, el del sitio. */
		width?: string;
		class?: string;
	}

	let { children, width = 'max-w-content', class: extra = '' }: Props = $props();
</script>

<div class="mx-auto w-full px-[1.25rem] xs:px-5 sm:px-6 {width} {extra}">
	{@render children()}
</div>

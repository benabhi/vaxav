<!-- La grilla del mosaico: una columna en teléfono, tres en escritorio. -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="grid w-full grid-cols-1 gap-3 xs:grid-cols-2 lg:grid-cols-3">
	{@render children()}
</div>

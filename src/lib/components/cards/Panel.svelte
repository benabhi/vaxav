<!-- Panel base: relleno translúcido, borde fino y esquinas rectas. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
		class?: string;
	}

	let { children, class: extra = '', ...rest }: Props = $props();
</script>

<div class="border border-border-soft bg-surface p-4 xs:p-[1.25rem] {extra}" {...rest}>
	{@render children()}
</div>

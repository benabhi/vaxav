<!--
	El contenido de un panel flotante: el mismo panel del HUD, pero opaco.

	Lo que flota sobre la pantalla no puede ser translúcido como un panel
	corriente: se leería el contenido de abajo a través del texto.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
		class?: string;
	}

	let { children, class: extra = '', ...rest }: Props = $props();
</script>

<div
	class="w-fit overflow-hidden border border-border bg-surface-overlay px-[0.85rem] py-[0.6rem] shadow-glow backdrop-blur-[10px] {extra}"
	{...rest}
>
	{@render children()}
</div>

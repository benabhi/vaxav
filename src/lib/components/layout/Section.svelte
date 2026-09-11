<!--
	Bloque vertical de una página, con el aire estándar entre secciones.

	El primer bloque de una pantalla se arma con `topSpacing={false}`: ya lo separa
	del encabezado el propio marco.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
		topSpacing?: boolean;
		class?: string;
	}

	let { children, topSpacing = true, class: extra = '' }: Props = $props();
</script>

<div
	class="flex w-full flex-col items-start gap-5 {topSpacing
		? 'pt-8 xs:pt-9 sm:pt-[5rem]'
		: ''} {extra}"
>
	{@render children()}
</div>

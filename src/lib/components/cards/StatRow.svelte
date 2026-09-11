<!--
	Una fila de dato: etiqueta apagada a la izquierda, valor a la derecha.

	Es la unidad con la que el juego muestra cualquier ficha, y por eso conviene
	que exista una sola vez.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Label from '../typography/Label.svelte';

	interface Props {
		name: string;
		children: Snippet;
		class?: string;
	}

	let { name, children, class: extra = '' }: Props = $props();
</script>

<div class="flex w-full items-center gap-3 border-b border-border-soft py-[0.4rem] {extra}">
	<Label>{name}</Label>
	<div class="grow"></div>
	{@render children()}
</div>

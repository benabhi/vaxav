<!--
	Barra de título de un panel: nombre a la izquierda, lectura a la derecha.

	La línea naranja debajo del título es la firma del HUD del juego.
-->
<script lang="ts">
	import CardTitle from '../typography/CardTitle.svelte';
	import Label from '../typography/Label.svelte';

	interface Props {
		title: string;
		detail?: string;
		class?: string;
	}

	let { title, detail = '', class: extra = '' }: Props = $props();
</script>

<div class="mb-[0.85rem] flex w-full items-center border-b border-border pb-2 {extra}">
	<CardTitle>{title}</CardTitle>
	<div class="grow"></div>
	{#if detail}
		<Label>{detail}</Label>
	{/if}
</div>

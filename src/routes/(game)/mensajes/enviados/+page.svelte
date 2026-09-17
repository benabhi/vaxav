<!--
	Pestaña Enviados: copia de lo que mandaste.

	Misma pieza que Recibidos y a propósito: ver `Mailbox`.
-->
<script lang="ts">
	import Mailbox from '$lib/components/game/Mailbox.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>Enviados · Mensajes · Vaxav</title></svelte:head>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Mensajes</Eyebrow>
	<DisplayTitle>Enviados</DisplayTitle>
</div>

<Mailbox bandeja={data.bandeja} />

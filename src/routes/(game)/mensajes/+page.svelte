<!--
	Pestaña Recibidos: lo que te escribieron.

	La pantalla entera es `Mailbox`, que sirve a las dos bandejas: son la misma
	lista mirada desde el otro lado, y lo que cambia llega ya resuelto en el dato.
-->
<script lang="ts">
	import Mailbox from '$lib/components/game/Mailbox.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head><title>Recibidos · Mensajes · Vaxav</title></svelte:head>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Mensajes</Eyebrow>
	<DisplayTitle>Recibidos</DisplayTitle>
</div>

<Mailbox bandeja={data.bandeja} error={form?.error ?? ''} />

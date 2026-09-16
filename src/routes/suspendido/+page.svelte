<!--
	Lo que ve un piloto al que le cerraron la puerta.

	Dice **qué tiene, por qué y hasta cuándo**, que son las tres preguntas, y nada
	más. No dice quién se la puso: eso queda en el registro del cuartel y no es
	asunto suyo — nombrar al administrador sólo abre una discusión que esta
	pantalla no puede resolver.

	Va sobre el marco público y no sobre el del juego: no está jugando.
-->
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import HudButton from '$lib/components/buttons/HudButton.svelte';
	import Panel from '$lib/components/cards/Panel.svelte';
	import PageShell from '$lib/components/layout/PageShell.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import Label from '$lib/components/typography/Label.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	/** Una fecha larga: acá no hay tabla que proteger y la fecha es lo que se lee. */
	function fecha(at: number): string {
		return new Date(at).toLocaleString('es-AR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		});
	}
</script>

<svelte:head><title>Cuenta suspendida · Vaxav</title></svelte:head>

<PageShell>
	<div class="flex w-full max-w-[42rem] flex-col items-start gap-6">
		<div class="flex flex-col items-start gap-1">
			<Eyebrow>{data.callsign}</Eyebrow>
			<DisplayTitle>{data.kind}</DisplayTitle>
		</div>

		<Panel class="w-full border-danger bg-danger-wash">
			<div class="flex w-full items-start gap-3">
				<Icon name="warning" weight="fill" size="1.2rem" class="mt-[0.1rem] shrink-0 text-danger" />
				<BodyText>{data.message}</BodyText>
			</div>
		</Panel>

		<div class="flex w-full flex-wrap items-start gap-x-6 gap-y-3">
			<div class="flex flex-col items-start gap-1">
				<Label>Desde</Label>
				<span class="font-mono text-[0.85rem] text-text-body">{fecha(data.since)}</span>
			</div>
			<div class="flex flex-col items-start gap-1">
				<Label>Hasta</Label>
				<span class="font-mono text-[0.85rem] text-text-body">
					{data.until === null ? 'Sin vencimiento' : fecha(data.until)}
				</span>
			</div>
		</div>

		<BodyText>
			Si creés que es un error, respondé al correo con el que te registraste. Mientras tanto la
			cuenta queda como está: no se borra nada.
		</BodyText>

		<form method="POST" action="/salir">
			<HudButton type="submit" variant="outline">
				<Icon name="sign-out" weight="bold" size="0.8rem" />
				Salir
			</HudButton>
		</form>
	</div>
</PageShell>

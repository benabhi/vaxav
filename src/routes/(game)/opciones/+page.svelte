<!--
	Pestaña Cuenta: la única que hay hoy en Opciones.

	El formulario se manda sin `use:enhance` a propósito. Es un envío entero de
	página, así que los tres campos vuelven vacíos solos —que es el
	`reset_on_submit` del original— y, al ser contraseñas, es justamente lo que
	uno quiere que pase.
-->
<script lang="ts">
	import HudButton from '$lib/components/buttons/HudButton.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import ErrorCallout from '$lib/components/forms/ErrorCallout.svelte';
	import SuccessCallout from '$lib/components/forms/SuccessCallout.svelte';
	import TextField from '$lib/components/forms/TextField.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<svelte:head><title>Cuenta · Opciones · Vaxav</title></svelte:head>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Opciones</Eyebrow>
	<DisplayTitle>Cuenta</DisplayTitle>
</div>

<TitledPanel title="Cambiar contraseña" class="w-full max-w-[28rem]">
	<form method="POST" class="w-full">
		<div class="flex w-full flex-col items-start gap-4">
			<TextField
				label="Contraseña actual"
				name="current_password"
				type="password"
				autocomplete="current-password"
			/>
			<TextField
				label="Contraseña nueva"
				name="new_password"
				type="password"
				autocomplete="new-password"
			/>
			<TextField
				label="Repetir contraseña nueva"
				name="new_password_confirmation"
				type="password"
				autocomplete="new-password"
			/>
			<ErrorCallout message={form?.error} />
			<SuccessCallout message={form?.success} />
			<HudButton variant="primary" size="3" type="submit">Guardar</HudButton>
		</div>
	</form>
</TitledPanel>

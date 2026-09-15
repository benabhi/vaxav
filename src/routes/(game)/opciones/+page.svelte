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
	import PortraitPicker from '$lib/components/game/PortraitPicker.svelte';
	import { PORTRAIT_HEIGHT, PORTRAIT_WIDTH } from '$lib/game/portraits';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
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

<!--
	El retrato también se cambia desde acá y no sólo desde la credencial: es un dato
	de la cuenta, y quien viene a Opciones a cambiar la contraseña espera encontrar
	su foto en la misma pantalla. El control es el mismo componente, así que las dos
	puertas hacen exactamente lo mismo.
-->
<TitledPanel title="Retrato" class="w-full max-w-[28rem]">
	<div class="flex w-full flex-col items-start gap-4">
		<BodyText>
			La foto de tu credencial. Se recorta a proporción de carnet y se guarda a {PORTRAIT_WIDTH}×{PORTRAIT_HEIGHT};
			lo que elijas se ajusta solo, así que no hace falta que la prepares.
		</BodyText>
		<PortraitPicker hasPortrait={data.pilot.portrait !== ''} size="2" />
	</div>
</TitledPanel>

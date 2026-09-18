<!--
	Pestaña Cuenta: la llave para entrar y la puerta para irse.

	Las dos son de la cuenta, así que van en **una sola pestaña**: partirlas sería
	inventar categorías donde hay una. Las pestañas llegan cuando haya opciones que
	no sean de la cuenta —la interfaz, los avisos—, y entonces cada una va a
	nombrar algo distinto de verdad.

	**Quién puede mirarte va primero**: es lo único de la pantalla que cambia lo que
	otros ven, y lo demás son llaves y puertas.

	**El retrato no está acá**, y es a propósito. Se cambia desde la credencial del
	piloto, que es donde se lo ve: ahí la foto muestra el resultado exacto al
	tamaño en que va a quedar, y la chapita de cámara dice que se puede tocar.
	Tenerlo en los dos lados era una segunda puerta a lo mismo sin nada que
	agregar.

	La zona de peligro va **al fondo y enmarcada en rojo**, que es donde va siempre:
	se llega a ella bajando a propósito, no de paso, y el marco avisa antes de que
	se lea una palabra. El formulario de la contraseña se manda sin `use:enhance` a
	propósito: es un envío entero de página, así que los campos vuelven vacíos
	solos y, al ser contraseñas, es justo lo que uno quiere.
-->
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import HudButton from '$lib/components/buttons/HudButton.svelte';
	import HudLink from '$lib/components/buttons/HudLink.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import ErrorCallout from '$lib/components/forms/ErrorCallout.svelte';
	import SuccessCallout from '$lib/components/forms/SuccessCallout.svelte';
	import TextField from '$lib/components/forms/TextField.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import Label from '$lib/components/typography/Label.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import { page } from '$app/state';
	import { hrefFicha } from '$lib/fichas';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	/**
	 * Lo que el jugador escribió como confirmación de la baja.
	 *
	 * Vive en el navegador porque el botón se enciende con ella: mandar el
	 * formulario para que el servidor conteste "escribí bien el distintivo" sería
	 * hacerle dar la vuelta entera por algo que se puede mirar acá. El servidor lo
	 * repite igual, porque no confía en la pantalla.
	 */
	let confirmacion = $state('');

	let coincide = $derived(confirmacion.trim() === data.pilot.callsign);

	/** El enlace que abre tu propia ficha, para ver lo que ven los demás. */
	let miFicha = $derived(hrefFicha(page.url, 'piloto', data.pilot.callsign));
</script>

<svelte:head><title>Cuenta · Opciones · Vaxav</title></svelte:head>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Opciones</Eyebrow>
	<DisplayTitle>Cuenta</DisplayTitle>
</div>

<div class="flex w-full max-w-[34rem] flex-col items-start gap-4">
	<!--
		**Quién puede mirarte**, arriba de la contraseña: es lo único de esta pantalla
		que cambia lo que otros ven, así que es lo que uno viene a buscar. Y lleva al
		lado el enlace a la propia ficha, porque una preferencia sobre cómo te ven se
		decide mirando cómo te ven.
	-->
	<TitledPanel title="Tu ficha" detail="Quién puede mirarte" class="w-full">
		<div class="flex w-full flex-col items-start gap-4">
			<BodyText>
				Cualquiera puede abrir tu ficha apretando tu distintivo: de dónde venís, a quién le
				respondés, desde cuándo volás y tu IPP. Dónde estás parado no sale nunca.
			</BodyText>

			<div class="flex w-full flex-wrap items-center gap-3">
				<Label>Ahora está</Label>
				<span class="font-display text-1 tracking-display text-accent-bright uppercase">
					{data.pilot.privateProfile ? 'Cerrada' : 'Abierta'}
				</span>
				<div class="grow"></div>
				<HudLink href={miFicha} variant="outline" size="1">
					<Icon name="identification-card" weight="bold" size="0.7rem" />
					Ver cómo te ven
				</HudLink>
			</div>

			{#if form?.scope === 'privacy'}
				<ErrorCallout message={form?.error} />
				<SuccessCallout message={form?.success} />
			{/if}

			<form method="POST" action="?/ficha">
				<input type="hidden" name="cerrada" value={data.pilot.privateProfile ? '0' : '1'} />
				<HudButton
					variant={data.pilot.privateProfile ? 'primary' : 'outline'}
					size="3"
					type="submit"
				>
					<Icon
						name={data.pilot.privateProfile ? 'identification-card' : 'eye-slash'}
						weight="bold"
						size="0.8rem"
					/>
					{data.pilot.privateProfile ? 'Abrir mi ficha' : 'Cerrar mi ficha'}
				</HudButton>
			</form>
		</div>
	</TitledPanel>

	<TitledPanel title="Contraseña" detail="La llave para entrar" class="w-full">
		<form method="POST" action="?/contrasena" class="w-full">
			<div class="flex w-full max-w-[24rem] flex-col items-start gap-4">
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
				<!--
					Los avisos llevan el nombre del formulario que los produjo: los dos
					comparten el mismo `form`, y sin eso un error de la baja aparecería
					arriba, en el de la contraseña.
				-->
				{#if form?.scope === 'password'}
					<ErrorCallout message={form?.error} />
					<SuccessCallout message={form?.success} />
				{/if}
				<HudButton variant="primary" size="3" type="submit">Guardar</HudButton>
			</div>
		</form>
	</TitledPanel>

	<!--
		La zona de peligro. El borde rojo de un solo lado es el mismo lenguaje que
		usa el resto del juego para lo que sale mal.
	-->
	<div class="mt-2 w-full border border-l-[3px] border-border-soft border-l-danger bg-surface">
		<div
			class="flex w-full items-center gap-2 border-b border-border-soft bg-danger-wash px-4 py-[0.45rem]"
		>
			<Icon name="warning" weight="fill" size="0.9rem" class="text-danger" />
			<span class="font-display text-1 tracking-label text-danger uppercase">Zona de peligro</span>
		</div>

		<div class="flex w-full flex-col items-start gap-4 p-4">
			<div class="flex w-full flex-col items-start gap-2">
				<span class="font-display text-3 font-bold tracking-display text-text-strong uppercase">
					Eliminar la cuenta
				</span>
				<BodyText>
					Se borra tu piloto y todo lo que colgaba de él: la nave con lo que tenga montado, la
					carga, el saldo y su libro entero, las órdenes que tengas publicadas, la bitácora, la
					experiencia de todas las ramas y tu retrato.
				</BodyText>
				<!--
					Lo que de verdad hay que entender, separado de la lista y dicho sin
					rodeos: no hay papelera, no hay soporte que lo devuelva.
				-->
				<span class="text-2 font-bold text-danger">
					No se puede deshacer. No hay copia ni forma de recuperarlo.
				</span>
				<BodyText>Tu distintivo queda libre y otro piloto va a poder tomarlo.</BodyText>
			</div>

			<form
				method="POST"
				action="?/eliminar"
				class="flex w-full max-w-[24rem] flex-col items-start gap-4"
			>
				<TextField
					label="Escribí «{data.pilot.callsign}» para confirmar"
					name="callsign"
					autocomplete="off"
					bind:value={confirmacion}
				/>
				<TextField
					label="Tu contraseña"
					name="password"
					type="password"
					autocomplete="current-password"
				/>

				{#if form?.scope === 'delete'}
					<ErrorCallout message={form?.error} />
				{/if}

				<!--
					Apagado hasta que el distintivo coincida. No es la validación —ésa la
					hace el servidor— sino la traba que hay que cruzar a propósito.
				-->
				<HudButton variant="danger" size="3" type="submit" disabled={!coincide}>
					Eliminar mi cuenta para siempre
				</HudButton>
			</form>
		</div>
	</div>
</div>

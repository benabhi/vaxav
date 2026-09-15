<!--
	Pestaña Cuenta: lo que no se puede deshacer.

	Va en su propia pestaña y no al pie de otra por una razón: **nadie tiene que
	pasar por acá para hacer otra cosa**. Un botón de borrar debajo del formulario
	de la contraseña es un botón que alguien va a ver mil veces mientras hace algo
	inofensivo, y la mano se acostumbra a lo que ve seguido.

	El panel se dibuja con el rojo del sistema y de un solo lado, como los avisos
	de peligro del resto del juego, y **dice qué se pierde antes de pedir nada**. La
	confirmación son dos cosas distintas y cada una frena algo distinto: escribir el
	distintivo frena al dedo apurado; la contraseña frena a quien se sentó en una
	sesión ajena.
-->
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import HudButton from '$lib/components/buttons/HudButton.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import ErrorCallout from '$lib/components/forms/ErrorCallout.svelte';
	import TextField from '$lib/components/forms/TextField.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	/**
	 * Lo que el jugador escribió como confirmación.
	 *
	 * Vive en el navegador porque el botón se enciende con ella: mandar el
	 * formulario para que el servidor diga "escribí bien el distintivo" sería
	 * hacerle dar la vuelta entera para una comprobación que se puede hacer acá.
	 * El servidor la repite igual, porque no confía en la pantalla.
	 */
	let confirmacion = $state('');

	let coincide = $derived(confirmacion.trim() === data.pilot.callsign);
</script>

<svelte:head><title>Cuenta · Opciones · Vaxav</title></svelte:head>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Opciones</Eyebrow>
	<DisplayTitle>Cuenta</DisplayTitle>
</div>

<div class="flex w-full max-w-[34rem] flex-col items-start gap-4">
	<TitledPanel title="Tu cuenta" class="w-full">
		<div class="flex w-full flex-col items-start gap-2">
			<span class="flex items-baseline gap-2">
				<span class="font-display text-1 tracking-label text-accent-dim uppercase">Distintivo</span>
				<span class="font-display text-3 font-bold tracking-display text-text-strong uppercase">
					{data.pilot.callsign}
				</span>
			</span>
			<BodyText>
				Tu distintivo es único en la galaxia y no se puede cambiar: es con lo que te conocen los
				demás pilotos y con lo que firmás cada orden del mercado.
			</BodyText>
		</div>
	</TitledPanel>

	<!--
		La zona de peligro. El borde rojo de un solo lado es el mismo lenguaje que
		usa el resto del juego para lo que sale mal.
	-->
	<div class="w-full border border-l-[3px] border-border-soft border-l-danger bg-surface">
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

			<form method="POST" class="flex w-full flex-col items-start gap-4">
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

				<ErrorCallout message={form?.error} />

				<!--
					Apagado hasta que el distintivo coincida. No es la validación —ésa la
					hace el servidor— sino la traba que hace falta cruzar a propósito.
				-->
				<HudButton variant="danger" size="3" type="submit" disabled={!coincide}>
					Eliminar mi cuenta para siempre
				</HudButton>
			</form>
		</div>
	</div>
</div>

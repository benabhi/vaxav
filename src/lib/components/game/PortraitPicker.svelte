<!--
	Cambiar el retrato: elegir un archivo, recortarlo y subirlo.

	**Todo el trabajo pesado pasa en el navegador.** El archivo que elige el
	jugador puede ser un JPG de ocho megas de una cámara; lo que sube es un WebP de
	480×640 de unos cuarenta kilobytes, ya recortado a la proporción de la
	credencial. Así el servidor no necesita una librería de imágenes —que en este
	proyecto sería una dependencia nativa por una sola pantalla— y nadie espera a
	que se suban ocho megas para que le digan que no.

	El recorte es el `cover` hecho a mano por `game/portraits.ts`: se guarda ya
	recortado para que el retrato se vea **igual en todas partes**. Si se guardara
	entero y lo recortara cada pantalla, sería una cara en la credencial y otra en
	la lista.

	Es un componente y no el cuerpo de una pantalla porque lo usan dos: la
	credencial del piloto y Opciones. Una sola pieza es lo que evita que un día
	sólo una de las dos comprima antes de subir.
-->
<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Icon from '../Icon.svelte';
	import HudButton from '../buttons/HudButton.svelte';
	import {
		PORTRAIT_ACCEPT,
		PORTRAIT_HEIGHT,
		PORTRAIT_QUALITY,
		PORTRAIT_TYPE,
		PORTRAIT_WIDTH,
		coverBox
	} from '$lib/game/portraits';

	interface Props {
		/** Si ya tiene uno, para poder ofrecer sacarlo. */
		hasPortrait: boolean;
		/** Cómo se dibuja el disparador: un botón, o el hueco entero del retrato. */
		variant?: 'button' | 'overlay';
		size?: '1' | '2' | '3';
	}

	let { hasPortrait, variant = 'button', size = '1' }: Props = $props();

	let input = $state<HTMLInputElement>();
	let working = $state(false);
	let problem = $state('');

	/**
	 * Recorta y recodifica el archivo elegido.
	 *
	 * `createImageBitmap` decodifica fuera del hilo principal, así que una foto
	 * grande no congela la pantalla mientras se abre.
	 */
	async function normalizar(file: File): Promise<Blob> {
		const bitmap = await createImageBitmap(file);
		try {
			const recorte = coverBox(bitmap.width, bitmap.height);
			const lienzo = document.createElement('canvas');
			lienzo.width = PORTRAIT_WIDTH;
			lienzo.height = PORTRAIT_HEIGHT;

			const pincel = lienzo.getContext('2d');
			if (!pincel) throw new Error('Este navegador no puede procesar la imagen.');
			// Suavizado alto: una foto que se achica a la mitad sin él queda con los
			// bordes dentados, y esto se dibuja grande en la credencial.
			pincel.imageSmoothingQuality = 'high';
			pincel.drawImage(
				bitmap,
				recorte.x,
				recorte.y,
				recorte.width,
				recorte.height,
				0,
				0,
				PORTRAIT_WIDTH,
				PORTRAIT_HEIGHT
			);

			const blob = await new Promise<Blob | null>((listo) =>
				lienzo.toBlob(listo, PORTRAIT_TYPE, PORTRAIT_QUALITY)
			);
			if (!blob) throw new Error('No se pudo convertir la imagen.');
			return blob;
		} finally {
			// Libera la memoria del decodificado sin esperar al recolector: una foto
			// de doce megapíxeles son cuarenta y ocho megas en crudo.
			bitmap.close();
		}
	}

	async function elegido(evento: Event) {
		const file = (evento.currentTarget as HTMLInputElement).files?.[0];
		if (!file) return;

		problem = '';
		working = true;
		try {
			const blob = await normalizar(file);
			const respuesta = await fetch('/retratos', {
				method: 'POST',
				headers: { 'content-type': PORTRAIT_TYPE },
				body: blob
			});
			if (!respuesta.ok) {
				problem = (await respuesta.text()) || 'No se pudo guardar el retrato.';
				return;
			}
			await invalidateAll();
		} catch (error) {
			problem = error instanceof Error ? error.message : 'No se pudo leer esa imagen.';
		} finally {
			working = false;
			// Se limpia el input o elegir el mismo archivo dos veces no dispara nada.
			if (input) input.value = '';
		}
	}

	async function quitar() {
		working = true;
		problem = '';
		try {
			const respuesta = await fetch('/retratos', { method: 'DELETE' });
			if (!respuesta.ok) {
				problem = (await respuesta.text()) || 'No se pudo quitar el retrato.';
				return;
			}
			await invalidateAll();
		} finally {
			working = false;
		}
	}
</script>

<!--
	El input va escondido y no oculto con `hidden`: tiene que seguir existiendo
	para el teclado y para que el botón pueda abrirlo.
-->
<input
	bind:this={input}
	type="file"
	accept={PORTRAIT_ACCEPT}
	onchange={elegido}
	class="sr-only"
	aria-label="Elegir un retrato"
/>

{#if variant === 'overlay'}
	<!--
		Sobre el hueco del retrato.

		Lleva **dos capas y por dos razones distintas**. La chapita de la esquina está
		siempre visible: sin ella la foto parecía una imagen y nada más, y nadie
		descubre que se puede tocar algo que no se anuncia. El velo con el texto
		aparece al señalar o con el foco del teclado, que es cuando ya se sabe que
		hay algo ahí y sólo falta decir qué.

		Mientras sube, el velo se queda encendido con el aro girando: una subida sin
		señal parece una que no pasó, y el jugador vuelve a apretar.
	-->
	<button
		type="button"
		onclick={() => input?.click()}
		disabled={working}
		aria-label={hasPortrait ? 'Cambiar el retrato' : 'Subir un retrato'}
		class="group absolute inset-0 z-[2] cursor-pointer focus-visible:outline-none
			disabled:cursor-wait"
	>
		<span
			class="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-well/85
				transition-opacity {working
				? 'opacity-100'
				: 'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100'}"
		>
			<Icon
				name={working ? 'circle-notch' : 'camera'}
				weight="duotone"
				size="1.5rem"
				class={working ? 'animate-spin text-data' : 'text-accent'}
			/>
			<span class="font-display text-1 tracking-label text-accent-bright uppercase">
				{working ? 'Subiendo' : hasPortrait ? 'Cambiar' : 'Subir'}
			</span>
		</span>

		<!--
			La chapita: el único adorno que está siempre. Se apaga mientras el velo
			está arriba para no quedar pegada encima del texto.
		-->
		<span
			class="absolute right-[0.3rem] bottom-[0.3rem] flex items-center border border-border-soft
				bg-well/85 p-[0.2rem] transition-opacity group-hover:opacity-0
				{working ? 'opacity-0' : 'opacity-100'}"
		>
			<Icon name="camera" weight="fill" size="0.7rem" class="text-accent-bright" />
		</span>
	</button>
{:else}
	<div class="flex flex-wrap items-center gap-3">
		<HudButton {size} variant="primary" onclick={() => input?.click()} disabled={working}>
			{#if working}
				<Icon name="circle-notch" weight="bold" size="0.8rem" class="animate-spin" />
			{/if}
			{working ? 'Subiendo…' : hasPortrait ? 'Cambiar retrato' : 'Subir retrato'}
		</HudButton>
		{#if hasPortrait}
			<HudButton {size} variant="ghost" onclick={quitar} disabled={working}>Quitar</HudButton>
		{/if}
	</div>
{/if}

{#if problem}
	<p class="mt-2 w-full text-1 text-danger">{problem}</p>
{/if}

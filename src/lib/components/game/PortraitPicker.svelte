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

	Se dibuja **sobre el hueco del retrato y en ningún otro lado**: cambiar la foto
	se hace donde se la ve, porque ahí el resultado está a la vista al tamaño exacto
	en que va a quedar. Una segunda puerta en Opciones no agregaba nada y era otro
	lugar donde mantener lo mismo.
-->
<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import Icon from '../Icon.svelte';
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
	}

	let { hasPortrait }: Props = $props();

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

<!--
		Sobre el hueco del retrato.

		Lleva **dos capas y por dos razones distintas**. La chapita de la esquina está
		siempre visible: sin ella la foto parecía una imagen y nada más, y nadie
		descubre que se puede tocar algo que no se anuncia. El velo con las acciones
		aparece al señalar o con el foco del teclado, que es cuando ya se sabe que hay
		algo ahí y sólo falta decir qué se puede hacer.

		Son **dos acciones y no una**: poner una foto tiene que poder deshacerse con
		la misma facilidad con que se hizo, o subirla es una decisión irreversible por
		accidente. Quitar borra el archivo del servidor, no lo esconde.

		Mientras trabaja, el velo se queda encendido con el aro girando: una subida
		sin señal parece una que no pasó, y el jugador vuelve a apretar.
	-->
<div class="group absolute inset-0 z-[2]">
	<div
		class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-well/85
				transition-opacity {working
			? 'opacity-100'
			: 'opacity-0 group-focus-within:opacity-100 group-hover:opacity-100'}"
	>
		{#if working}
			<Icon name="circle-notch" weight="duotone" size="1.5rem" class="animate-spin text-data" />
			<span class="font-display text-1 tracking-label text-accent-bright uppercase">
				Un momento
			</span>
		{:else}
			<button
				type="button"
				onclick={() => input?.click()}
				class="flex cursor-pointer flex-col items-center gap-[0.15rem] px-2 py-1
						transition-colors hover:text-accent-bright focus-visible:text-accent-bright
						focus-visible:outline-none"
				aria-label={hasPortrait ? 'Cambiar el retrato' : 'Subir un retrato'}
			>
				<Icon name="camera" weight="duotone" size="1.35rem" class="text-accent" />
				<span class="font-display text-1 tracking-label text-accent-bright uppercase">
					{hasPortrait ? 'Cambiar' : 'Subir'}
				</span>
			</button>

			{#if hasPortrait}
				<button
					type="button"
					onclick={quitar}
					class="flex cursor-pointer items-center gap-1 border border-border-soft px-2
							py-[0.1rem] transition-colors hover:border-danger hover:text-danger
							focus-visible:border-danger focus-visible:outline-none"
					aria-label="Quitar el retrato"
				>
					<Icon name="x" weight="bold" size="0.6rem" />
					<span class="font-display text-[0.62rem] tracking-label uppercase">Quitar</span>
				</button>
			{/if}
		{/if}
	</div>

	<!--
			La chapita: el único adorno que está siempre. Se apaga mientras el velo
			está arriba para no quedar pegada encima de las acciones.
		-->
	<span
		class="pointer-events-none absolute right-[0.3rem] bottom-[0.3rem] flex items-center border
				border-border-soft bg-well/85 p-[0.2rem] transition-opacity group-hover:opacity-0
				{working ? 'opacity-0' : 'opacity-100'}"
	>
		<Icon name="camera" weight="fill" size="0.7rem" class="text-accent-bright" />
	</span>
</div>
{#if problem}
	<p class="mt-2 w-full text-1 text-danger">{problem}</p>
{/if}

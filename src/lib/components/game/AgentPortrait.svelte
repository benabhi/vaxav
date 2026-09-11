<!--
	El hueco del retrato, con la imagen si la hay y una silueta si no.

	La imagen la resuelve `$lib/server/portraits` recorriendo `static/portraits/`:
	la ficha no sabe cómo está ordenada esa carpeta ni tiene por qué. Dejar
	imágenes ahí alcanza para que aparezcan acá.

	Sin imagen queda la silueta, que es mejor que un rectángulo vacío: dice que
	ahí falta algo y no que ahí no hay nada.

	El ancho es fijo y el alto no: **toma el de la ficha entera**, pegado al borde
	de arriba. Así la cara se ve grande sin robarle ancho al texto, que es lo que
	hace la columna de retratos de un tablero de misiones.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';

	interface Props {
		/** Si el agente atiende a este piloto. */
		open: boolean;
		portrait?: string;
	}

	let { open, portrait = '' }: Props = $props();
</script>

<div
	class="relative flex w-[5.5rem] shrink-0 items-center justify-center self-stretch overflow-hidden
		{open ? 'border-r border-border bg-surface' : 'border-r border-dead-edge bg-transparent'}"
>
	{#if portrait}
		<!--
			Absoluta y no en el flujo: un elemento estirado no le da alto definido a
			un hijo con alto 100 %, y la imagen quedaría chica.
		-->
		<img
			src={portrait}
			alt=""
			class="absolute top-0 left-0 h-full w-full object-cover
				{open ? '' : 'brightness-[0.55] saturate-[0.3]'}"
		/>
	{:else}
		<Icon
			name="identification-card"
			weight="thin"
			size="2.5rem"
			class={open ? 'text-accent-dim' : 'text-text-muted'}
		/>
	{/if}
</div>

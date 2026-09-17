<!--
	El hueco del retrato de un agente: su sello.

	**Ya no es una foto.** Había dos imágenes para todos los agentes del juego, así
	que dos caras repetidas por cada estación; el sello sale del nombre y por lo
	tanto **todo agente tiene una cara propia desde el segundo en que existe**, que
	era el problema que había que resolver y no el de conseguir más fotos.

	Su familia es el **triángulo**, que no se confunde con el hexágono de una
	corporación ni con el disco de un piloto ni de reojo. Ver `$lib/identicon.ts`.

	El que no atiende va apagado, igual que el resto de su ficha: lo que no está a
	tu alcance pierde el color, que es lo que lo separa de lo disponible.

	El ancho es fijo y el alto no: **toma el de la ficha entera**, pegado al borde
	de arriba. Así la cara se ve grande sin robarle ancho al texto, que es lo que
	hace la columna de retratos de un tablero de misiones.
-->
<script lang="ts">
	import Identicon from './Identicon.svelte';

	interface Props {
		/** De quién es el sello. */
		name: string;
		/** Si el agente atiende a este piloto. */
		open: boolean;
	}

	let { name, open }: Props = $props();
</script>

<div
	class="relative flex w-[5.5rem] shrink-0 items-center justify-center self-stretch overflow-hidden
		p-2 {open ? 'border-r border-border bg-surface' : 'border-r border-dead-edge bg-transparent'}"
>
	<Identicon
		{name}
		family="agente"
		size="100%"
		title="Sello de {name}"
		class={open ? '' : 'opacity-45 saturate-[0.35]'}
	/>
</div>

<!--
	De dónde sale un verbo: el módulo que lo habilita y las habilidades que lo
	mejoran, al señalar el botón que lo dispara.

	**Va en toda acción del juego, no sólo en ésta.** La regla está escrita en «La
	cadena se muestra» —`docs/DESIGN.md`—: el juego no puede explicar lo que hace
	falta sólo cuando falta. Un piloto con el escáner montado jamás se entera de
	que el escáner es lo que le permite mirar una roca, ni de que su lectura es
	completa por dos habilidades que entrenó; se entera el día que le falta algo, y
	ése es el día en que ya no sirve saberlo.

	**Envuelve al botón, no se pone al lado.** Un ícono de ayuda aparte es una
	segunda cosa que tocar, y encima ambigua cuando hay dos botones seguidos: no se
	sabe de cuál habla. Señalar el botón mismo no tiene esa duda ni ocupa lugar.

	Lo que el mouse no resuelve **lo resuelve el cartel de confirmación**, que
	muestra el mismo bloque: en un teléfono no hay con qué señalar, y el cartel es
	la puerta por la que pasa toda acción igual. Entre los dos no queda nadie sin
	la explicación —ni el que señala, ni el que toca, ni el que llega con el
	teclado, porque `HoverCard` también abre con el foco—.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import HoverCard from '../ui/HoverCard.svelte';
	import FloatingPanel from '../cards/FloatingPanel.svelte';
	import ActionSourceDetail from './ActionSourceDetail.svelte';
	import type { Procedencia } from '$lib/tipos';

	interface Props {
		source: Procedencia;
		/** El botón que dispara el verbo. */
		children: Snippet;
	}

	let { source, children }: Props = $props();
</script>

<HoverCard interactive>
	{#snippet trigger()}
		{@render children()}
	{/snippet}

	<!--
		**Con techo y scroll propio.** Hoy son tres filas, pero un verbo puede pedir
		cuatro módulos y mover cinco habilidades, y un aviso que crece sin límite
		termina más alto que la ventana: se le corta la mitad y no hay forma de
		llegar al resto. El techo es en `vh` y no en píxeles para que en un teléfono
		acotado siga entrando.
	-->
	<FloatingPanel class="max-h-[60vh] max-w-[20rem] overflow-y-auto p-3">
		<ActionSourceDetail {source} />
	</FloatingPanel>
</HoverCard>

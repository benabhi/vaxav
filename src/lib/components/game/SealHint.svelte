<!--
	El «?» que explica de dónde salió un sello.

	**Un dibujo que aparece solo y no se puede tocar necesita decir de dónde vino.**
	Sin esto, el jugador se queda buscando dónde cambiar el suyo y no entiende por
	qué la corporación de al lado tiene otro emblema sin que nadie lo haya dibujado.

	Va en la esquina del recuadro que ocupa el sello, chiquito y apagado hasta que
	se lo señala: es una aclaración, no un control. Por eso el texto es uno solo
	para las tres familias —lo que cambia entre ellas es la silueta, y justamente
	eso es lo que el globo explica—.

	El rótulo del globo es **«Identicon»** y no una frase: un rótulo nombra, no
	explica. Que sea una palabra de afuera del juego es el mismo caso que «NPC»: se
	entiende, y el texto de abajo está justamente para eso.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import FloatingPanel from '../cards/FloatingPanel.svelte';
	import Popover from '../ui/Popover.svelte';
	import BodyText from '../typography/BodyText.svelte';

	interface Props {
		/** Dónde se planta dentro del recuadro. Por omisión, arriba a la derecha. */
		class?: string;
	}

	let { class: extra = 'top-[0.3rem] right-[0.3rem]' }: Props = $props();
</script>

<span class="absolute z-[2] {extra}">
	<Popover label="Qué es este emblema">
		{#snippet trigger()}
			<Icon
				name="question"
				weight="bold"
				size="0.7rem"
				class="text-text-muted transition-colors hover:text-accent-bright"
			/>
		{/snippet}
		<FloatingPanel class="flex max-w-[20rem] flex-col gap-1 p-3">
			<span class="font-display text-1 tracking-label text-accent-dim uppercase"> Identicon </span>
			<BodyText>
				Un emblema que la máquina calcula a partir del nombre: mismo nombre, mismo emblema, siempre
				y en cualquier pantalla. No lo dibujó nadie y no se puede cambiar. La silueta dice de qué se
				trata: un hexágono es una corporación, un disco un piloto y un triángulo un agente.
			</BodyText>
		</FloatingPanel>
	</Popover>
</span>

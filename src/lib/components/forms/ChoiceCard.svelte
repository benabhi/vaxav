<!--
	Tarjeta seleccionable, para elegir oficio u origen.

	Se usa una tarjeta y no una lista desplegable porque la elección es parte de
	la creación del piloto: hay que poder comparar las opciones de un vistazo.
	Al elegirla se enciende como una fila del tablero de misiones: barra naranja
	a la izquierda, relleno más fuerte y halo.

	Es un `<button>` y no una caja con un clic encima: elegir una opción es una
	acción, y así se llega con el tabulador y se activa con la barra espaciadora
	sin que haya que reponer nada a mano.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import IconToggle from '../IconToggle.svelte';
	import BodyText from '../typography/BodyText.svelte';
	import CardTitle from '../typography/CardTitle.svelte';
	import type { IconName } from '$lib/icons';

	interface Props {
		name: string;
		description: string;
		detail: string;
		selected: boolean;
		icon?: IconName;
		onChoose: () => void;
	}

	let { name, description, detail, selected, icon, onChoose }: Props = $props();
</script>

<button
	type="button"
	onclick={onChoose}
	aria-pressed={selected}
	class="h-full w-full cursor-pointer border border-l-[3px] border-border-soft p-4 text-left
		transition-[background-color,border-color,box-shadow] hover:bg-surface-hover xs:p-[1.25rem]
		{selected ? 'border-l-accent bg-surface-strong shadow-glow' : 'border-l-border-soft bg-surface'}"
>
	<div class="flex h-full flex-col items-start gap-2">
		<div class="flex w-full items-center gap-3">
			{#if icon}
				<IconToggle name={icon} active={selected} />
			{/if}
			<CardTitle>{name}</CardTitle>
			<div class="grow"></div>
			{#if selected}
				<Icon name="check" weight="bold" size="1rem" class="text-accent" />
			{/if}
		</div>
		<BodyText>{description}</BodyText>
		<p class="font-mono text-1 text-data">{detail}</p>
	</div>
</button>

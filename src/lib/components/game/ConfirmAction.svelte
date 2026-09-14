<!--
	Pide confirmación antes de encargar una acción.

	**Una orden compromete tiempo real**, y el tiempo es el recurso del juego: un
	viaje de veinte minutos dado sin querer no se cancela sin costo, y mientras
	corre no se puede hacer otra cosa. Un click de más antes de eso vale mucho más
	barato que un click de menos después.

	No es un diálogo genérico de "¿seguro?": muestra **lo que la orden va a costar
	y a traer** —cuánto tarda, qué deja— para que confirmar sea una decisión
	informada y no un trámite. Un aviso que sólo pregunta se aprende a apretar sin
	leer.

	Envuelve el formulario en vez de reemplazarlo: el botón que dispara y el que
	confirma mandan lo mismo, así que si el navegador no llegara a ejecutar nada la
	acción sigue siendo un `POST` común.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { enhance } from '$app/forms';
	import Icon from '../Icon.svelte';
	import HudButton from '../buttons/HudButton.svelte';
	import FloatingPanel from '../cards/FloatingPanel.svelte';
	import CardTitle from '../typography/CardTitle.svelte';
	import Label from '../typography/Label.svelte';
	import type { IconName } from '$lib/icons';

	interface Props {
		/** Qué se va a hacer, en imperativo: «Viajar a Ánfora III». */
		title: string;
		icon?: IconName;
		/** Las lecturas de la orden: cuánto tarda, qué trae. */
		readings?: readonly { label: string; value: string }[];
		/** Una línea de contexto, si hace falta. */
		note?: string;
		confirmLabel?: string;
		disabled?: boolean;
		/** El botón que abre el diálogo. */
		trigger: Snippet<[() => void]>;
		/** Los campos ocultos del formulario, que se mandan al confirmar. */
		fields: Snippet;
		/** El `action` del formulario: `?/viajar`, `?/minar`. */
		formAction: string;
	}

	let {
		title,
		icon = 'warning',
		readings = [],
		note = '',
		confirmLabel = 'Confirmar',
		disabled = false,
		trigger,
		fields,
		formAction
	}: Props = $props();

	let abierto = $state(false);
	/** El diálogo nativo: se encarga del foco, del fondo y de la tecla Escape. */
	let dialogo = $state<HTMLDialogElement | null>(null);

	function abrir() {
		if (disabled) return;
		abierto = true;
	}

	function cerrar() {
		abierto = false;
	}

	/**
	 * Abrir y cerrar el diálogo nativo cuando cambia el estado.
	 *
	 * `showModal` es lo que trae gratis el foco atrapado, el fondo inerte y el
	 * cierre con Escape. Escribir eso a mano sería reimplementar peor algo que el
	 * navegador ya hace bien, que es la misma razón por la que `Popover` y
	 * `HoverCard` son propios pero se apoyan en la plataforma.
	 */
	$effect(() => {
		if (!dialogo) return;
		if (abierto && !dialogo.open) dialogo.showModal();
		if (!abierto && dialogo.open) dialogo.close();
	});
</script>

{@render trigger(abrir)}

<dialog
	bind:this={dialogo}
	onclose={cerrar}
	class="vaxav-dialogo m-auto bg-transparent p-0 text-text-body backdrop:bg-[rgb(3_5_8/0.72)]
		backdrop:backdrop-blur-[2px]"
>
	<FloatingPanel class="w-[min(26rem,92vw)] p-5">
		<div class="flex w-full flex-col items-start gap-4">
			<div class="flex w-full flex-wrap items-center gap-2">
				<Icon name={icon} weight="duotone" size="1.1rem" class="text-accent" />
				<CardTitle>{title}</CardTitle>
			</div>

			{#if readings.length > 0}
				<!--
					Lo que la orden cuesta y trae. Confirmar sin esto es un trámite; con
					esto es una decisión.
				-->
				<div class="flex w-full flex-col gap-1 border-y border-border-soft py-3">
					{#each readings as lectura (lectura.label)}
						<div class="flex w-full items-baseline gap-3">
							<span class="w-[6.5rem] shrink-0"><Label>{lectura.label}</Label></span>
							<span class="min-w-0 font-mono text-[0.82rem] text-accent-bright">
								{lectura.value}
							</span>
						</div>
					{/each}
				</div>
			{/if}

			{#if note}
				<p class="text-1 text-text-muted">{note}</p>
			{/if}

			<div class="flex w-full flex-wrap items-center justify-end gap-3">
				<HudButton type="button" variant="ghost" size="1" onclick={cerrar}>Cancelar</HudButton>
				<!--
					Con `enhance` para no recargar la pantalla entera: el indicador de la
					barra de estado y el árbol se actualizan solos. El diálogo se cierra
					al mandar, porque lo que sigue es esperar.
				-->
				<form
					method="POST"
					action={formAction}
					use:enhance={() => {
						cerrar();
						return async ({ update }) => update();
					}}
				>
					{@render fields()}
					<HudButton type="submit" variant="primary" size="1">
						<Icon name="check" weight="bold" size="0.75rem" />
						{confirmLabel}
					</HudButton>
				</form>
			</div>
		</div>
	</FloatingPanel>
</dialog>

<style>
	/*
	 * El diálogo nativo trae margen y borde propios del navegador. Se los saca
	 * acá y no con utilidades porque `::backdrop` no se puede alcanzar de otra
	 * forma, y los dos tienen que viajar juntos.
	 */
	.vaxav-dialogo {
		border: 0;
		max-width: none;
		max-height: none;
	}
</style>

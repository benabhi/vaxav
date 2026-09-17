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

	La ventana en sí es `Modal`, que es la que se ocupa del diálogo nativo. Acá
	queda sólo lo que hace a **confirmar una orden**: las lecturas, los campos y el
	envío.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { enhance } from '$app/forms';
	import Icon from '../Icon.svelte';
	import HudButton from '../buttons/HudButton.svelte';
	import Modal from '../ui/Modal.svelte';
	import Label from '../typography/Label.svelte';
	import ActionSourceDetail from './ActionSourceDetail.svelte';
	import type { IconName } from '$lib/icons';
	import type { Procedencia } from '$lib/tipos';

	interface Props {
		/** Qué se va a hacer, en imperativo: «Viajar a Ánfora III». */
		title: string;
		icon?: IconName;
		/** Las lecturas de la orden: cuánto tarda, qué trae. */
		readings?: readonly { label: string; value: string }[];
		/** Una línea de contexto, si hace falta. */
		note?: string;
		/**
		 * De dónde sale el verbo: el módulo que lo habilita y las habilidades.
		 *
		 * Es lo mismo que muestra `ActionSource` al señalar el botón, y va también
		 * acá porque **en un teléfono no hay con qué señalar**. El cartel es la
		 * puerta por la que pasa toda acción igual, así que entre los dos no queda
		 * nadie sin la explicación.
		 */
		source?: Procedencia | null;
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
		source = null,
		confirmLabel = 'Confirmar',
		disabled = false,
		trigger,
		fields,
		formAction
	}: Props = $props();

	let abierto = $state(false);

	function abrir() {
		if (disabled) return;
		abierto = true;
	}

	function cerrar() {
		abierto = false;
	}
</script>

{@render trigger(abrir)}

<Modal bind:open={abierto} {title} {icon}>
	<div class="flex w-full flex-col items-start gap-4">
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

		{#if source}
			<ActionSourceDetail {source} heading={false} />
		{/if}

		{#if note}
			<p class="text-1 text-text-muted">{note}</p>
		{/if}

		<div class="flex w-full flex-wrap items-center justify-end gap-3">
			<HudButton type="button" variant="ghost" size="1" onclick={cerrar}>Cancelar</HudButton>
			<!--
				Con `enhance` para no recargar la pantalla entera: el indicador de la
				barra de estado y el árbol se actualizan solos. El diálogo se cierra al
				mandar, porque lo que sigue es esperar.
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
</Modal>

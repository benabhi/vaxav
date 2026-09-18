<!--
	Una ventana modal del HUD, sobre el `<dialog>` del navegador.

	Se apoya en la plataforma en vez de reimplementarla: `showModal` trae gratis el
	foco atrapado, el fondo inerte y el cierre con Escape. Escribir eso a mano sería
	hacer peor algo que el navegador ya hace bien, que es la misma razón por la que
	`Popover` y `HoverCard` son propios pero se apoyan en la API nativa.

	El estado vive **afuera**, enlazado: quien la abre suele necesitar saber si está
	abierta —para cargar lo que va adentro, o para no cargarlo dos veces—, y un
	componente que se abre solo obliga a adivinarlo.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../Icon.svelte';
	import FloatingPanel from '../cards/FloatingPanel.svelte';
	import CardTitle from '../typography/CardTitle.svelte';
	import type { IconName } from '$lib/icons';

	interface Props {
		open?: boolean;
		title: string;
		icon?: IconName;
		/** Una línea de contexto al lado del título. */
		detail?: string;
		/**
		 * El ancho. `sm` es para confirmar algo, `lg` para una ventana de trabajo
		 * —un libro de órdenes, una ficha— que necesita tablas adentro.
		 */
		size?: 'sm' | 'lg';
		children: Snippet;
	}

	let {
		open = $bindable(false),
		title,
		icon = 'warning',
		detail = '',
		size = 'sm',
		children
	}: Props = $props();

	let dialogo = $state<HTMLDialogElement | null>(null);

	/** Abrir y cerrar el diálogo nativo cuando cambia el estado. */
	$effect(() => {
		if (!dialogo) return;
		if (open && !dialogo.open) dialogo.showModal();
		if (!open && dialogo.open) dialogo.close();
	});
</script>

<dialog
	bind:this={dialogo}
	onclose={() => (open = false)}
	class="vaxav-modal m-auto bg-transparent p-0 text-text-body backdrop:bg-[rgb(3_5_8/0.72)]
		backdrop:backdrop-blur-[2px]"
>
	<!--
		El ancho va en `min-width` y `max-width`, nunca en `width`, y no es un
		capricho: el panel flotante trae `w-fit` de fábrica —lo necesita para los
		globos, que miden lo que mide su texto— y entre dos utilidades de ancho gana
		la que Tailwind haya puesto última en la hoja, no la que uno escribió
		después. Así que el ancho declarado acá se perdía y la ventana se encogía al
		contenido. Los dos límites en el mismo valor no compiten con `w-fit`: lo
		encierran.

		Con contenido ancho —una tabla, una grilla— no se notaba. Con un formulario
		se nota de golpe: los campos son `w-full` de un padre que mide lo que miden
		los campos, la cuenta se muerde la cola y la ventana sale como una ranura.

		Y la grande es **de ancho fijo y no de ancho mínimo**: una ventana de trabajo
		cambia de contenido sin cambiar de ventana —una ficha pasa de cuatro datos a
		una tabla de cinco columnas— y si el marco se estira con cada sección, lo que
		se siente no es una ventana con pestañas sino cinco ventanas distintas.
		Adentro, lo ancho se desplaza en su propio contenedor, que es la regla de
		siempre.
	-->
	<FloatingPanel
		class="flex max-h-[88vh] flex-col p-5 {size === 'lg'
			? 'max-w-[min(58rem,94vw)] min-w-[min(58rem,94vw)]'
			: 'max-w-[92vw] min-w-[min(26rem,92vw)]'}"
	>
		<div class="flex w-full shrink-0 flex-wrap items-center gap-2 pb-4">
			<Icon name={icon} weight="duotone" size="1.1rem" class="text-accent" />
			<CardTitle>{title}</CardTitle>
			{#if detail}
				<span class="font-mono text-[0.72rem] text-text-muted">{detail}</span>
			{/if}
			<div class="grow"></div>
			<!--
				La cruz existe además de Escape porque en un teléfono no hay Escape, y
				una ventana de la que no se sabe salir es una trampa.
			-->
			<button
				type="button"
				onclick={() => (open = false)}
				aria-label="Cerrar"
				class="flex h-7 w-7 cursor-pointer items-center justify-center border border-transparent
					text-text-muted transition-colors hover:border-border-soft hover:text-accent-bright"
			>
				<Icon name="x" weight="bold" size="0.8rem" />
			</button>
		</div>

		<!--
			El contenido se desplaza solo. Una ventana que crece hasta empujar la
			página es exactamente el problema que una ventana viene a resolver.
		-->
		<div class="min-h-0 w-full flex-1 overflow-y-auto">
			{@render children()}
		</div>
	</FloatingPanel>
</dialog>

<style>
	/*
	 * El diálogo nativo trae margen, borde y tope de tamaño propios del navegador.
	 * Se los saca acá y no con utilidades porque `::backdrop` no se puede alcanzar
	 * de otra forma, y los dos tienen que viajar juntos.
	 */
	.vaxav-modal {
		border: 0;
		max-width: none;
		max-height: none;
	}
</style>

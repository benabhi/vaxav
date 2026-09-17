<!--
	El marco del mapa de la galaxia: panel o pantalla completa.

	**Existe porque el mapa se mira de dos maneras** y las dos tienen que convivir
	con lo mismo alrededor: los filtros, la ficha del sistema elegido y la leyenda.
	Metido en su panel, eso se acomoda en columnas; a pantalla completa, flota
	encima del lienzo y se pliega, porque agrandar el mapa es para mirar el mapa.

	Es el mismo marco en el cuartel y en la cabina. Lo que cambia son las piezas
	—el constructor filtra por gobierno y ofrece abrir el sistema; el piloto filtra
	por servicios y ofrece viajar—, así que entran como snippets y el marco no sabe
	qué son. Lo que **no** cambia es dónde va cada una, y ésa es justo la parte que
	no conviene escribir dos veces: dos marcos se van separando solos, y un botón de
	agrandar que en una pantalla deja la ficha adentro y en la otra afuera es una
	interfaz que hay que volver a aprender.

	**Se dibuja una sola de las dos versiones, nunca las dos.** Dejar la de abajo
	escondida repetiría los identificadores de cada campo del filtro, y dos
	controles con el mismo `id` rompen las etiquetas de los dos. Por eso la cámara
	del mapa vive en la pantalla que lo usa y no adentro del mapa: cambiar de
	versión lo vuelve a montar.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../Icon.svelte';
	import HudButton from '../buttons/HudButton.svelte';
	import TitledPanel from '../cards/TitledPanel.svelte';

	interface Props {
		/** El título del panel, cuando el mapa no ocupa la pantalla. */
		title: string;
		detail?: string;
		expanded: boolean;
		/**
		 * Si la barra de filtros está desplegada sobre el mapa a pantalla completa.
		 *
		 * Viaja hacia afuera porque la decide quien agranda: plegados al agrandar,
		 * abiertos al volver. Ahí el lugar es del mapa.
		 */
		filtersOpen?: boolean;
		/** Si hay algo que mostrar en la ficha del costado. */
		showCard?: boolean;
		/** El lienzo. */
		map: Snippet;
		/** Los campos del recorte, sin su formulario: lo pone el marco. */
		filters?: Snippet;
		/** Lo que acompaña al botón de filtros: cuántos hay, cómo se quitan. */
		filterActions?: Snippet;
		/** La ficha de lo que esté elegido. */
		card?: Snippet;
		/** Qué significa cada trazo, y el botón de encuadrar. */
		legend?: Snippet;
	}

	let {
		title,
		detail = '',
		expanded,
		filtersOpen = $bindable(true),
		showCard = true,
		map,
		filters,
		filterActions,
		card,
		legend
	}: Props = $props();

	/** El panel, para poder traer la pantalla hasta acá desde una tabla de abajo. */
	let caja = $state<HTMLDivElement>();

	/**
	 * Trae la pantalla hasta el mapa.
	 *
	 * La usa quien tiene una lista debajo: centrar un sistema para alguien que no
	 * está viendo el mapa es no hacer nada.
	 */
	export function scrollIntoView() {
		caja?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	/**
	 * Los campos vacíos no viajan en la URL.
	 *
	 * Un formulario `GET` manda todo, incluso lo que no se llenó, y la barra queda
	 * con `?buscar=&faccion=&region=&pintar=` colgando. No rompe nada —el servidor
	 * lee el vacío como «sin filtro»— pero una URL que se comparte tiene que poder
	 * leerse, y ahí el recorte real se pierde entre la paja.
	 *
	 * Se apagan antes de mandar y se vuelven a prender enseguida, porque la página
	 * no se recarga entera: sin eso quedarían deshabilitados en pantalla.
	 */
	function alEnviar(evento: SubmitEvent & { currentTarget: HTMLFormElement }) {
		const vacios = [...evento.currentTarget.elements].filter(
			(campo): campo is HTMLInputElement | HTMLSelectElement =>
				(campo instanceof HTMLInputElement || campo instanceof HTMLSelectElement) &&
				campo.value === ''
		);
		for (const campo of vacios) campo.disabled = true;
		setTimeout(() => {
			for (const campo of vacios) campo.disabled = false;
		});
	}
</script>

{#if expanded}
	<div class="fixed inset-0 z-50 bg-background">
		<div class="absolute inset-0">
			{@render map()}
		</div>

		{#if filters}
			<div class="absolute top-2 left-2 z-10 flex flex-col items-start gap-2">
				<div class="flex flex-wrap items-center gap-2">
					<HudButton
						type="button"
						size="1"
						variant={filtersOpen ? 'primary' : 'outline'}
						onclick={() => (filtersOpen = !filtersOpen)}
					>
						<Icon name="magnifying-glass" weight="bold" size="0.7rem" />
						Filtros
					</HudButton>
					{@render filterActions?.()}
				</div>

				{#if filtersOpen}
					<form
						method="GET"
						onsubmit={alEnviar}
						class="flex w-[min(21rem,calc(100vw-2rem))] flex-col gap-3 border border-border-soft
							bg-well p-[0.8rem]"
					>
						{@render filters()}
					</form>
				{/if}
			</div>
		{/if}

		{#if card && showCard}
			<!--
				Debajo del botón de filtros y por encima de la leyenda: la ficha se mete
				entre los dos en vez de taparlos, que es lo que pasaría con una capa que
				ocupe todo el alto.
			-->
			<div
				class="absolute top-2 right-2 bottom-[4.5rem] z-10 flex w-[min(20rem,calc(100vw-2rem))]
					flex-col pt-9"
			>
				{@render card()}
			</div>
		{/if}

		{#if legend}
			<div
				class="absolute right-2 bottom-2 left-2 z-10 flex flex-col gap-2 border border-border-soft
					bg-well px-[0.7rem] py-[0.5rem]"
			>
				{@render legend()}
			</div>
		{/if}
	</div>
{:else}
	{#if filters}
		<!--
			El recorte, arriba del mapa y de lo que haya debajo, porque vale para los
			dos: el mismo filtro apaga sistemas en el mapa y quita filas de la lista.
			Dos filtros separados serían dos pantallas que no se hablan.

			Es un formulario `GET`: los filtros viajan en la URL, así que un recorte se
			puede compartir, se vuelve con el botón de atrás y se recarga sin perderlo.
		-->
		<form
			method="GET"
			onsubmit={alEnviar}
			class="flex w-full flex-col gap-3 border border-border-soft bg-surface px-[0.9rem]
				py-[0.7rem]"
		>
			{@render filters()}
		</form>
	{/if}

	<div bind:this={caja} class="w-full scroll-mt-4">
		<TitledPanel {title} {detail} class="w-full">
			<div class="flex w-full flex-col items-start gap-[1.25rem] lg:h-[28rem] lg:flex-row">
				<div class="flex h-[26rem] w-full min-w-0 flex-col gap-2 lg:h-full lg:flex-[3_1_0]">
					{@render map()}
					{@render legend?.()}
				</div>

				<!--
					La barra lateral y no un globo flotante: lo que crece acá son acciones
					—abrir el constructor, viajar a una puerta— y un globo con seis botones
					es un menú disfrazado.
				-->
				{#if card}
					<div class="w-full min-w-0 lg:h-full lg:flex-[1_1_0]">
						{@render card()}
					</div>
				{/if}
			</div>
		</TitledPanel>
	</div>
{/if}

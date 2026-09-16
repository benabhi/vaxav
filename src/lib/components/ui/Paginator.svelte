<!--
	El paginador de una lista larga.

	**Son enlaces y no botones.** Cada página es una URL distinta, así que se puede
	compartir, volver con el botón de atrás y recargar sin perder dónde estabas. Un
	paginador hecho con estado del navegador pierde las tres cosas.

	La URL la arma quien lo usa, con `href`: la bitácora sólo lleva el número, y el
	registro del cuartel tiene que conservar los filtros que ya estaban puestos. El
	paginador no sabe —ni tiene por qué— qué otros parámetros hay en juego.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';

	interface Props {
		page: number;
		pages: number;
		/** A dónde lleva cada número de página. */
		href: (page: number) => string;
		class?: string;
	}

	let { page, pages, href, class: extra = '' }: Props = $props();
</script>

{#if pages > 1}
	<div class="flex w-full items-center gap-3 border-t border-border-soft pt-3 {extra}">
		{#if page > 1}
			<a href={href(page - 1)} class="paginador">
				<Icon name="caret-left" weight="bold" size="0.7rem" />
				Anterior
			</a>
		{/if}
		<div class="grow"></div>
		<span class="font-mono text-[0.72rem] whitespace-nowrap text-text-muted">
			{page} / {pages}
		</span>
		<div class="grow"></div>
		{#if page < pages}
			<a href={href(page + 1)} class="paginador">
				Siguiente
				<Icon name="caret-right" weight="bold" size="0.7rem" />
			</a>
		{/if}
	</div>
{/if}

<style>
	/*
	 * El mismo lenguaje que el resto de los controles chicos del HUD: contorno
	 * fino, mayúsculas espaciadas, y se llena al señalarlo.
	 */
	.paginador {
		display: flex;
		flex-shrink: 0;
		align-items: center;
		gap: 0.35rem;
		border: 1px solid var(--color-border-soft);
		padding: 0.25rem 0.6rem;
		font-family: var(--font-display);
		font-size: 0.68rem;
		font-weight: 600;
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		text-decoration: none;
		white-space: nowrap;
		color: var(--color-accent-bright);
		transition:
			background-color var(--default-transition-duration) var(--ease-hud),
			color var(--default-transition-duration) var(--ease-hud);
	}

	.paginador:hover {
		background-color: var(--color-accent);
		color: var(--color-on-accent);
	}
</style>

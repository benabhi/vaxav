<!--
	Pestaña Miembros: quiénes son los otros.

	Una tabla y no una grilla de tarjetas: lo que uno hace acá es buscar a alguien,
	y para buscar sirve una lista ordenable. Las tarjetas se ven mejor con doce y
	peor con mil, y esto va a tener mil.

	Por eso nace ya con **recorte, orden y paginado**, como todo listado del juego:
	la lista de una corporación grande sin filtros es una lista que no se usa. Los
	tres viajan en la URL, así que un recorte se comparte, se vuelve con el botón de
	atrás y se recarga sin perderlo.

	Cada fila lleva **el sello del distintivo**, que es lo que la vuelve recorrible
	de un vistazo: un nombre entre cien es texto, un nombre con su emblema al lado
	se encuentra sin leer.
-->
<script lang="ts">
	import MemberList from '$lib/components/game/MemberList.svelte';
	import Panel from '$lib/components/cards/Panel.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import CardTitle from '$lib/components/typography/CardTitle.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let miembros = $derived(data.miembros);

	/** La URL con un parámetro cambiado, conservando todo lo demás. */
	function conParametro(cambios: Record<string, string>): string {
		const params = new SvelteURLSearchParams(page.url.searchParams);
		for (const [clave, valor] of Object.entries(cambios)) {
			if (valor) params.set(clave, valor);
			else params.delete(clave);
		}
		// Cambiar cualquier cosa vuelve a la primera página: quedarse en la siete de
		// un listado que ahora tiene dos es una pantalla vacía sin explicación.
		if (!('pagina' in cambios)) params.delete('pagina');
		const texto = params.toString();
		return texto ? `?${texto}` : '?';
	}
</script>

<svelte:head><title>Miembros · Corporación · Vaxav</title></svelte:head>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Corporación</Eyebrow>
	<DisplayTitle>Miembros</DisplayTitle>
</div>

{#if !miembros.belongs}
	<Panel class="w-full">
		<div class="flex flex-col items-start gap-2">
			<CardTitle>No respondés a nadie</CardTitle>
			<BodyText>
				Sin corporación no hay lista de miembros. Volás por tu cuenta, que también es una forma de
				andar por el sector.
			</BodyText>
		</div>
	</Panel>
{:else}
	<!--
		La lista, en su propia pieza: la piden esta pestaña y la ventana de una ficha
		ajena, y es la misma tabla con los mismos filtros. Ver `MemberList`.
	-->
	<TitledPanel title="Pilotos" detail={miembros.count} class="w-full">
		<MemberList {miembros} hrefFor={conParametro} />
	</TitledPanel>
{/if}

<!--
	Pestaña Ubicaciones: dónde se encuentra a la corporación.

	**Es una pestaña y no un panel de la ficha.** Estuvo en la columna angosta,
	mostrando cinco puestos y contando el resto con un «y N más»: alcanzaba mientras
	las corporaciones tuvieran dos, y dejaba de alcanzar exactamente cuando la lista
	empezaba a importar. Con veinte estaciones, «y quince más» no contesta ninguna de
	las preguntas que uno le hace a esa lista.

	Una tabla y no una grilla de tarjetas, por lo mismo que los agentes y los
	miembros: lo que uno hace acá es **buscar dónde** —cuál queda cerca, cuál tiene
	refinería—, y para buscar sirve una lista ordenable. Nace con recorte, orden y
	paginado, que viajan en la URL.

	El botón de ver en el mapa cierra la pantalla, como cierra la ficha: la pregunta
	«¿dónde está metida?» no la contesta un nombre a la vez, la contesta la forma del
	conjunto.
-->
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import StationList from '$lib/components/game/StationList.svelte';
	import HudLink from '$lib/components/buttons/HudLink.svelte';
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

	let ubicaciones = $derived(data.ubicaciones);

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

<svelte:head><title>Ubicaciones · Corporación · Vaxav</title></svelte:head>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Ubicaciones</Eyebrow>
	<DisplayTitle>{ubicaciones.name}</DisplayTitle>
</div>

{#if !ubicaciones.belongs}
	<Panel class="w-full">
		<div class="flex flex-col items-start gap-3">
			<CardTitle>No respondés a nadie</CardTitle>
			<BodyText>
				Acá van los puestos de tu corporación: dónde atracar sabiendo que estás en casa. Alistate en
				alguna y vas a ver los suyos.
			</BodyText>
			<HudLink href="/corporacion" variant="outline" size="1">
				<Icon name="share-network" weight="bold" size="0.7rem" />
				Ir a la ficha
			</HudLink>
		</div>
	</Panel>
{:else}
	<!--
		La lista, en su propia pieza: la piden esta pestaña y la ventana de una ficha
		ajena, y es la misma tabla con los mismos filtros. Ver `StationList`.
	-->
	<TitledPanel title="Puestos" detail={ubicaciones.count} class="w-full">
		<StationList {ubicaciones} hrefFor={conParametro} />
	</TitledPanel>

	<Panel class="w-full">
		<div class="flex w-full flex-wrap items-center gap-3">
			<Icon name="map-trifold" weight="duotone" size="1.1rem" class="shrink-0 text-accent" />
			<BodyText>
				Dónde está metida no lo contesta un nombre a la vez: lo contesta la forma del conjunto.
			</BodyText>
			<div class="grow"></div>
			<!--
				Va con el recorte puesto: sin él la galaxia se abre entera y el botón
				promete «ver esto» para mostrar todo lo demás.
			-->
			<HudLink href="/navegacion/galaxia?corporacion={ubicaciones.code}" variant="outline" size="1">
				<Icon name="map-trifold" weight="bold" size="0.7rem" />
				Verlas en el mapa
			</HudLink>
		</div>
	</Panel>
{/if}

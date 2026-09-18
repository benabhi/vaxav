<!--
	Pestaña Agentes: a quién le podés pedir trabajo.

	Una tabla y no una grilla de tarjetas, por lo mismo que los miembros: lo que uno
	hace acá es **buscar a alguien que le dé trabajo**, y para buscar sirve una lista
	ordenable. Nace con recorte, orden y paginado, que viajan en la URL.

	**Los que todavía no atienden salen igual, apagados y con lo que les falta.** Es
	la escalera que el piloto tiene por delante, el mismo criterio de la ficha del
	lugar: esconder lo que falta sería más prolijo y mucho peor.

	Y ordena por nivel de entrada, no alfabético: el de nivel uno atiende a
	cualquiera y el de nivel cinco es la meta, así que leer de arriba hacia abajo es
	leer el camino.
-->
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import AgentList from '$lib/components/game/AgentList.svelte';
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

	let agentes = $derived(data.agentes);

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

<svelte:head><title>Agentes · Corporación · Vaxav</title></svelte:head>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Agentes</Eyebrow>
	<DisplayTitle>{agentes.name}</DisplayTitle>
</div>

{#if !agentes.belongs}
	<Panel class="w-full">
		<div class="flex flex-col items-start gap-3">
			<CardTitle>No respondés a nadie</CardTitle>
			<BodyText>
				Los agentes reparten trabajo en nombre de una corporación. Alistate en alguna y acá vas a
				ver a los suyos.
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
		ajena, y es la misma tabla con los mismos filtros. Ver `AgentList`.
	-->
	<TitledPanel title="Agentes" detail={agentes.count} class="w-full">
		<AgentList {agentes} hrefFor={conParametro} />
	</TitledPanel>
{/if}

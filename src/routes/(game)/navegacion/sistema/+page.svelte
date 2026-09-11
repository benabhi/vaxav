<!--
	Pestaña Sistema: el sistema actual y todos sus cuerpos.

	Misma forma que Ubicación —lo grande a la izquierda, la ficha al costado—,
	porque son la misma pregunta a dos escalas: qué hay acá y qué es esto.

	**Plegar es del navegador.** Se guarda lo plegado y no lo desplegado porque el
	estado natural es "todo abierto": así un sistema nuevo se ve entero sin que
	nadie tenga que abrirlo.
-->
<script lang="ts">
	import { tick } from 'svelte';
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/Icon.svelte';
	import HudButton from '$lib/components/buttons/HudButton.svelte';
	import FloatingPanel from '$lib/components/cards/FloatingPanel.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import ErrorCallout from '$lib/components/forms/ErrorCallout.svelte';
	import BodyRow from '$lib/components/game/BodyRow.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import Label from '$lib/components/typography/Label.svelte';
	import HoverCard from '$lib/components/ui/HoverCard.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import type { FilaCuerpo } from '$lib/tipos';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let system = $derived(data.system);

	/**
	 * Los cuerpos plegados, por código. Estado de pantalla: plegar una rama no es
	 * una escritura y no tiene por qué viajar.
	 */
	let collapsed = $state<string[]>([]);

	/**
	 * Las filas que se ven: se saltan las que cuelgan de algo plegado.
	 *
	 * La lista viene en orden de árbol, así que alcanza con recordar a qué
	 * profundidad se plegó: todo lo que siga más adentro que eso está tapado,
	 * hasta que aparezca algo al mismo nivel o más afuera.
	 */
	let visible = $derived.by(() => {
		const filas: { body: FilaCuerpo; expanded: boolean }[] = [];
		let tapando: number | null = null;

		for (const body of system.bodies) {
			if (tapando !== null) {
				if (body.depth > tapando) continue;
				tapando = null;
			}
			const expanded = !collapsed.includes(body.code);
			filas.push({ body, expanded });
			if (body.hasChildren && !expanded) tapando = body.depth;
		}
		return filas;
	});

	let plegables = $derived(system.bodies.filter((body) => body.hasChildren).map((b) => b.code));
	let allCollapsed = $derived(
		plegables.length > 0 && plegables.every((code) => collapsed.includes(code))
	);

	/** Pliega o despliega un cuerpo. Los que no tienen hijos no hacen nada. */
	function toggleBody(code: string) {
		if (!plegables.includes(code)) return;
		collapsed = collapsed.includes(code)
			? collapsed.filter((c) => c !== code)
			: [...collapsed, code];
	}

	/** Pliega todo el árbol, o lo abre entero si ya estaba plegado. */
	function toggleAll() {
		collapsed = allCollapsed ? [] : plegables;
	}

	/**
	 * Los códigos de todo lo que contiene a esa fila, de adentro hacia afuera.
	 *
	 * Se leen hacia atrás en la lista: el primer cuerpo menos profundo que
	 * aparece es el padre, el siguiente menos profundo es el abuelo, y así.
	 */
	function ancestors(index: number): string[] {
		const codigos: string[] = [];
		let profundidad = system.bodies[index].depth;
		for (let i = index - 1; i >= 0; i--) {
			const fila = system.bodies[i];
			if (fila.depth < profundidad) {
				codigos.push(fila.code);
				profundidad = fila.depth;
				if (profundidad === 0) break;
			}
		}
		return codigos;
	}

	/**
	 * Abre el camino hasta el piloto y lleva la vista hasta ahí.
	 *
	 * Dos cosas, porque una sin la otra no sirve: si el cuerpo está tapado por una
	 * rama plegada, desplazarse hasta él no lo haría aparecer.
	 *
	 * El destello dura un segundo y medio y no es algo que nadie tenga que
	 * recordar, así que se hace tocando la clase y no con una variable.
	 */
	async function showLocation() {
		const indice = system.bodies.findIndex((body) => body.isHere);
		if (indice === -1) return;

		const tapando = new Set(ancestors(indice));
		collapsed = collapsed.filter((code) => !tapando.has(code));

		// `tick` y no un cuadro de animación: la fila puede estar tapada por una
		// rama que se acaba de abrir, y hasta que Svelte no dibuje esa rama la
		// fila no existe en el documento.
		await tick();

		const fila = document.getElementById('vaxav-aqui');
		if (!fila) return;
		fila.scrollIntoView({ behavior: 'smooth', block: 'center' });
		// Se saca y se vuelve a poner, forzando un reflujo en el medio: sin eso,
		// dos clics seguidos no reinician la animación.
		fila.classList.remove('vaxav-flash');
		void fila.offsetWidth;
		fila.classList.add('vaxav-flash');
		setTimeout(() => fila.classList.remove('vaxav-flash'), 1800);
	}

	/** Por qué el botón de viajar está bloqueado, o para qué sirve si no lo está. */
	let travelTooltip = $derived(
		!system.hasShip
			? 'Necesitás una nave para viajar'
			: system.actionInProgress
				? 'Ya hay una orden en curso'
				: 'Viajar hasta acá'
	);
	let canTravel = $derived(system.hasShip && !system.actionInProgress);
</script>

<svelte:head><title>Sistema · Navegación · Vaxav</title></svelte:head>

<!-- Una lectura de la ficha: etiqueta arriba, valor abajo. -->
{#snippet reading(name: string, value: string, mono = false)}
	<div class="flex w-full min-w-0 flex-col items-start gap-1">
		<Label>{name}</Label>
		<p
			class="w-full overflow-hidden text-2 font-medium text-ellipsis whitespace-nowrap
				{mono ? 'font-mono text-data' : 'font-display text-accent-bright'}"
		>
			{value}
		</p>
	</div>
{/snippet}

<!--
	La marca de dónde está el piloto: una mira que abre un aviso. Sólo la dibuja
	la fila del piloto, así que nunca hay más de una en toda la pantalla.
-->
{#snippet hereMarker()}
	<span
		role="none"
		onclick={(evento) => evento.stopPropagation()}
		onkeydown={(evento) => evento.stopPropagation()}
	>
		<Popover label="Estás aquí">
			{#snippet trigger()}
				<Icon name="crosshair" weight="fill" size="1rem" class="text-accent" />
			{/snippet}
			<FloatingPanel class="px-[0.7rem] py-[0.4rem]">
				<span
					class="font-display text-[0.7rem] font-bold tracking-label whitespace-nowrap text-accent-bright uppercase"
				>
					Estás aquí
				</span>
			</FloatingPanel>
		</Popover>
	</span>
{/snippet}

<!--
	Las acciones de una fila. Hoy sólo viajar, y no sobre la propia fila del
	piloto. Bloqueada por un requisito que falta, se ve igual pero atenuada y con
	el motivo en el aviso: nunca desaparece en silencio.
-->
{#snippet actions(body: FilaCuerpo)}
	{#if !body.isHere}
		<span
			role="none"
			onclick={(evento) => evento.stopPropagation()}
			onkeydown={(evento) => evento.stopPropagation()}
		>
			<HoverCard>
				{#snippet trigger()}
					<form method="POST" action="?/viajar" use:enhance>
						<input type="hidden" name="destino" value={body.code} />
						<HudButton
							type="submit"
							variant="outline"
							size="1"
							disabled={!canTravel}
							class="w-[4.5rem] {canTravel ? '' : 'cursor-not-allowed opacity-45'}"
						>
							<Icon name="rocket-launch" weight="bold" size="0.75rem" />
							<span class="overflow-hidden text-[0.7rem] text-ellipsis whitespace-nowrap">
								{body.travelLabel}
							</span>
						</HudButton>
					</form>
				{/snippet}
				<FloatingPanel class="px-[0.7rem] py-[0.4rem]">
					<span
						class="font-display text-[0.7rem] font-bold tracking-label whitespace-nowrap text-accent-bright uppercase"
					>
						{travelTooltip}
					</span>
				</FloatingPanel>
			</HoverCard>
		</span>
	{/if}
{/snippet}

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Navegación</Eyebrow>
	<DisplayTitle>{system.name}</DisplayTitle>
</div>

<div class="flex w-full flex-col items-start gap-[1.25rem] lg:flex-row">
	<div class="w-full min-w-0 flex-[2_1_0]">
		<TitledPanel title="Cuerpos del sistema" detail="Distancias en unidades" class="w-full">
			<!-- Plegar o desplegar el árbol entero, arriba de la lista. -->
			<div class="flex w-full items-center pb-[0.6rem]">
				<div class="grow"></div>
				<button
					type="button"
					onclick={toggleAll}
					class="flex cursor-pointer items-center gap-[0.35rem] border border-border-soft px-2
						py-1 text-accent-bright transition-[background-color,color] hover:bg-surface-hover hover:text-accent"
				>
					<Icon name={allCollapsed ? 'caret-down' : 'caret-up'} weight="bold" size="0.72rem" />
					<span
						class="font-display text-[0.65rem] font-semibold tracking-label whitespace-nowrap uppercase"
					>
						{allCollapsed ? 'Desplegar todo' : 'Plegar todo'}
					</span>
				</button>
			</div>

			<ErrorCallout message={form?.error} />

			<!--
				En pantalla angosta el árbol **se desliza** en lugar de romperse, igual
				que la barra de pestañas. Las cuatro columnas de la derecha son de ancho
				fijo y suman casi diecisiete rem: comprimirlas desalinearía todo, que es
				justo lo que esta pantalla no puede permitirse. Que se desplace deja el
				resto de la página quieta.
			-->
			<div class="w-full overflow-x-auto overscroll-x-contain">
				<div class="flex w-full min-w-[34rem] flex-col">
					{#each visible as fila (fila.body.code)}
						<BodyRow
							body={fila.body}
							expanded={fila.expanded}
							onToggle={toggleBody}
							{actions}
							{hereMarker}
						/>
					{/each}
				</div>
			</div>
		</TitledPanel>
	</div>

	<div class="w-full min-w-0 flex-[1_1_0]">
		<div class="flex w-full min-w-0 flex-col gap-4">
			<!--
				Abre la rama y lleva la vista. Es una baldosa de acción y no un botón
				corriente: el mismo lenguaje del mosaico, sin inventar una pieza nueva.
			-->
			<button
				type="button"
				onclick={showLocation}
				class="relative flex w-full cursor-pointer items-center gap-[0.7rem] overflow-hidden
					border border-t-[2px] border-border-soft border-t-border bg-surface px-[0.85rem] py-[0.7rem]
					text-accent-bright transition-[background-color,color,box-shadow]
					hover:bg-surface-strong hover:shadow-glow active:bg-accent active:text-on-accent"
			>
				<span class="pointer-events-none absolute -right-[1.5rem] -bottom-[1.75rem] opacity-[0.07]">
					<Icon name="map-pin" weight="fill" size="4.5rem" />
				</span>
				<Icon name="map-pin" weight="duotone" size="1.35rem" class="relative z-[1]" />
				<div class="relative z-[1] flex w-full min-w-0 flex-col items-start">
					<span
						class="w-full overflow-hidden font-display text-[0.8rem] font-bold tracking-display
							text-ellipsis whitespace-nowrap uppercase"
					>
						Mostrar ubicación
					</span>
					<span class="text-1 text-text-muted">Abre la rama y lleva la vista</span>
				</div>
			</button>

			<TitledPanel title="Ficha del sistema" class="w-full">
				<div class="flex w-full flex-col items-start gap-4">
					<BodyText>{system.description}</BodyText>
					<div class="grid w-full grid-cols-2 gap-4">
						{@render reading('Región', system.region)}
						{@render reading('Constelación', system.constellation)}
						{@render reading('Controlado por', system.controlledBy)}
						{@render reading('Gobierno', system.government)}
					</div>
				</div>
			</TitledPanel>

			<TitledPanel title="Lecturas" class="w-full">
				<div class="grid w-full grid-cols-2 gap-4">
					{@render reading('Seguridad', system.security)}
					{@render reading('Coordenadas', system.coordinates, true)}
					{@render reading('Cuerpos', system.bodyCount, true)}
					{@render reading('Estaciones', system.stationCount, true)}
					{@render reading('Explorados', system.exploredCount, true)}
				</div>
			</TitledPanel>
		</div>
	</div>
</div>

<!--
	El Neocom: la barra lateral que lleva a todas las secciones del juego.

	Toma el nombre y la idea de Elite Dangerous y EVE: una columna fija a la
	izquierda, siempre presente, desde la que se llega a cualquier parte sin volver
	a ninguna portada. Arriba, el bloque naranja con el nombre del juego; abajo,
	separado del resto, lo que no es jugar: plegar la barra, la cuenta y la salida.

	**Se pliega a íconos.** Desplegada muestra ícono y nombre; plegada, sólo el
	ícono. En teléfonos y tabletas angostas queda siempre plegada aunque el jugador
	la haya dejado abierta: ahí el ancho es del contenido, y el nombre de la
	sección ya está en el título de la pantalla. Esa parte la decide el CSS, no el
	estado, porque es una cuestión de ancho de pantalla y no una preferencia.

	**Aguanta que la lista no entre.** La barra tiene tres zonas: la marca arriba y
	las acciones abajo quedan fijas, y sólo la lista de módulos se desplaza. En una
	pantalla baja —un portátil, un teléfono acostado— "plegar" y "salir" siguen a
	la vista, que son justo las dos que siempre tienen que estar a mano.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import type { IconName } from '$lib/icons';
	import {
		MODULES,
		OPTIONS_MODULE,
		moduleHasNotice,
		moduleRoute,
		type Module
	} from '$lib/navigation';
	import { PILOT_ROUTE } from '$lib/routes';

	interface Props {
		expanded: boolean;
		activeModule: string;
		onToggle: () => void;
		/** Las rutas que tienen algo sin leer. El módulo que las contenga titila. */
		notices?: readonly string[];
	}

	let { expanded, activeModule, onToggle, notices = [] }: Props = $props();

	/** Lo que comparten todas las filas: alto, cursor y el movimiento del HUD. */
	const FILA =
		'flex h-11 w-full cursor-pointer items-center border-l-[3px] transition-[background-color,color,border-color]';

	/** La activa se llena de naranja con el texto casi negro. */
	function estado(active: boolean): string {
		return active
			? 'bg-accent text-on-accent border-l-accent-bright'
			: 'text-accent-bright hover:bg-surface-hover hover:text-accent border-l-transparent bg-transparent';
	}
</script>

{#snippet rail(icon: IconName, active: boolean, size = '1.15rem')}
	<span class="neocom-rail flex items-center justify-center">
		<Icon name={icon} weight={active ? 'fill' : 'light'} {size} />
	</span>
{/snippet}

{#snippet nombre(text: string, extra = '')}
	<span
		class="neocom-label overflow-hidden pr-3 font-display text-[0.8rem] font-semibold tracking-display text-ellipsis whitespace-nowrap uppercase {extra}"
	>
		{text}
	</span>
{/snippet}

{#snippet enlace(module: Module)}
	{@const active = activeModule === module.code}
	<!--
		El aviso pisa el borde de la fila, no se suma al lado: es el mismo borde
		izquierdo que marca la sección abierta, y por eso se lee sin explicación. En
		la sección que ya estás mirando no hace falta, porque ya llegaste.
	-->
	{@const avisa = !active && moduleHasNotice(module, notices)}
	<a
		href={moduleRoute(module)}
		title={avisa ? `${module.label} · hay algo sin leer` : module.label}
		class="{FILA} {estado(active)} no-underline {avisa ? 'aviso-izquierda' : ''}"
	>
		{@render rail(module.icon, active)}
		{@render nombre(module.label)}
	</a>
{/snippet}

<nav class="neocom {expanded ? 'is-expanded' : ''}">
	<!--
		El bloque naranja con el nombre del juego, arriba de todo. Mismo alto que la
		barra de estado, así los dos terminan sobre la misma línea y el trazo del
		HUD cruza la pantalla sin un escalón.

		La costura de abajo es oscura y no naranja: la lista se apoya contra ella, y
		cuando el ítem activo es el primero los dos bloques encendidos necesitan
		algo que los separe. Un borde naranja ahí sería invisible.
	-->
	<div class="neocom-fixed w-full">
		<a
			href={PILOT_ROUTE}
			title="Vaxav"
			class="flex h-topbar w-full items-center border-b border-b-background bg-accent text-on-accent no-underline shadow-glow"
		>
			{@render rail('planet', true, '1.3rem')}
			{@render nombre('VAXAV', 'text-[1.05rem] font-bold tracking-brand')}
		</a>
	</div>

	<!--
		Sin aire arriba: la lista se apoya en la línea de la marca, como los paneles
		apilados del juego. Nada flota.
	-->
	<div class="neocom-scroll flex w-full flex-col pb-2">
		{#each MODULES as module (module.code)}
			{@render enlace(module)}
		{/each}
	</div>

	<div class="neocom-fixed flex w-full flex-col border-t border-border bg-surface-overlay pb-2">
		<button type="button" class="{FILA} {estado(false)}" onclick={onToggle}>
			{@render rail('sidebar-simple', false)}
			{@render nombre('Plegar')}
		</button>
		{@render enlace(OPTIONS_MODULE)}
		<form method="POST" action="/salir" class="w-full">
			<button
				type="submit"
				class="{FILA} border-l-transparent bg-transparent text-text-muted hover:bg-surface-hover hover:text-danger"
			>
				{@render rail('sign-out', false)}
				{@render nombre('Salir')}
			</button>
		</form>
	</div>
</nav>

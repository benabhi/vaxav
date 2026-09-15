<!--
	La barra de pestañas de un módulo.

	Elite Dangerous encabeza sus pantallas con una fila de pestañas donde la activa
	va rellena de naranja con el texto casi negro. Es la misma regla de "lo
	seleccionado se llena" que usa el resto del proyecto.

	En pantallas angostas la fila **se desliza** en vez de partirse en dos
	renglones: así la pantalla se ve igual en el teléfono y en el monitor. El
	desplazamiento y los degradados de los bordes están en app.css.

	El aspecto vive en `pestanas.ts` y lo comparte con `TabStrip`, que hace lo mismo
	sin navegar a ningún lado.
-->
<script lang="ts">
	import type { Tab } from '$lib/navigation';
	import { tabClasses } from './pestanas';

	interface Props {
		tabs: readonly Tab[];
		activeRoute: string;
		/** Las rutas que tienen algo sin leer. La pestaña que sea una de ellas titila. */
		notices?: readonly string[];
	}

	let { tabs, activeRoute, notices = [] }: Props = $props();
</script>

<div class="tab-bar w-full border-b border-border">
	<div class="flex w-max min-w-full items-center gap-1">
		{#each tabs as tab (tab.route)}
			{@const active = tab.route === activeRoute}
			<!--
				Abajo y no a la izquierda como en el Neocom: una fila de pestañas se
				subraya, no se marca de costado. En la pestaña abierta no hace falta.
			-->
			{@const avisa = !active && notices.includes(tab.route)}
			<a
				href={tab.route}
				title={avisa ? `${tab.label} · hay algo sin leer` : undefined}
				class={tabClasses(active, avisa)}
			>
				{tab.label}
			</a>
		{/each}
	</div>
</div>

<!--
	La barra de pestañas de un módulo.

	Elite Dangerous encabeza sus pantallas con una fila de pestañas donde la activa
	va rellena de naranja con el texto casi negro. Es la misma regla de "lo
	seleccionado se llena" que usa el resto del proyecto.

	En pantallas angostas la fila **se desliza** en vez de partirse en dos
	renglones: así la pantalla se ve igual en el teléfono y en el monitor. El
	desplazamiento y los degradados de los bordes están en app.css.
-->
<script lang="ts">
	import type { Tab } from '$lib/navigation';

	interface Props {
		tabs: readonly Tab[];
		activeRoute: string;
	}

	let { tabs, activeRoute }: Props = $props();
</script>

<div class="tab-bar w-full border-b border-border">
	<div class="flex w-max min-w-full items-center gap-1">
		{#each tabs as tab (tab.route)}
			{@const active = tab.route === activeRoute}
			<a
				href={tab.route}
				class="flex h-[2.25rem] shrink-0 items-center px-4 font-display text-[0.78rem] font-semibold tracking-label whitespace-nowrap uppercase no-underline transition-[background-color,color]
					{active
					? 'bg-accent text-on-accent shadow-glow'
					: 'bg-transparent text-accent-dim hover:bg-surface-hover hover:text-accent-bright'}"
			>
				{tab.label}
			</a>
		{/each}
	</div>
</div>

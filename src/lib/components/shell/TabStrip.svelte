<!--
	Pestañas que no navegan: cambian lo que se mira dentro de la misma pantalla.

	Hermana de `TabBar`, y se ven igual porque comparten `pestanas.ts`. Lo que
	cambia es qué son: aquélla es una fila de enlaces —cada pestaña es una URL del
	módulo— y ésta una fila de botones, porque **elegir qué panel mirar es estado
	de interfaz** y eso vive en el navegador, no en el servidor.

	En pantallas angostas la fila se desliza en vez de partirse en dos renglones,
	igual que la del módulo.
-->
<script lang="ts">
	import { tabClasses } from './pestanas';

	interface Props {
		/** Las pestañas, en el orden en que se leen. */
		tabs: readonly { code: string; label: string; count?: number }[];
		/** La que está abierta. */
		active: string;
		onSelect: (code: string) => void;
		label?: string;
	}

	let { tabs, active, onSelect, label = 'Secciones' }: Props = $props();
</script>

<div class="tab-bar w-full border-b border-border" role="tablist" aria-label={label}>
	<div class="flex w-max min-w-full items-center gap-1">
		{#each tabs as tab (tab.code)}
			{@const abierta = tab.code === active}
			<button
				type="button"
				role="tab"
				aria-selected={abierta}
				onclick={() => onSelect(tab.code)}
				class={tabClasses(abierta)}
			>
				{tab.label}
				<!--
					La cuenta al lado del nombre: con dos números en la barra se sabe de
					qué lado hay trabajo sin abrir ninguna de las dos.
				-->
				{#if tab.count !== undefined}
					<span class="ml-2 font-mono text-[0.68rem] opacity-70">{tab.count}</span>
				{/if}
			</button>
		{/each}
	</div>
</div>

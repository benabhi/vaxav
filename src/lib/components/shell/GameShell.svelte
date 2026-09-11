<!--
	Envuelve una pantalla del juego con el Neocom y la barra de estado.

	`tabs` es opcional: un módulo de una sola pantalla no dibuja barra. Cuando la
	hay, va entre la barra de estado y el contenido, igual que en el juego, y el
	título de la pantalla queda debajo.

	El chat cuelga del pie en todas las pantallas: no es una sección, es algo que
	está encendido mientras se juega.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Tab } from '$lib/navigation';
	import type { AccionEnCurso } from '$lib/tipos';
	import ChatDock from './ChatDock.svelte';
	import Neocom from './Neocom.svelte';
	import StatusBar from './StatusBar.svelte';
	import TabBar from './TabBar.svelte';

	interface Props {
		children: Snippet;
		tabs?: readonly Tab[];
		activeModule: string;
		activeTab: string;
		action: AccionEnCurso | null;
		systemName: string;
	}

	let { children, tabs = [], activeModule, activeTab, action, systemName }: Props = $props();

	/** La clave con la que el navegador recuerda si la barra quedó desplegada. */
	const CLAVE = 'vaxav_neocom';

	/**
	 * Que la barra esté desplegada es una **preferencia**, así que vive en el
	 * navegador y sobrevive a la recarga. Que en un teléfono quede plegada igual
	 * es otra cosa, y la decide el CSS.
	 */
	let expanded = $state(true);

	$effect(() => {
		try {
			expanded = localStorage.getItem(CLAVE) !== '0';
		} catch {
			// Un navegador que no deja guardar nada no es motivo para no jugar.
		}
	});

	function alternar() {
		expanded = !expanded;
		try {
			localStorage.setItem(CLAVE, expanded ? '1' : '0');
		} catch {
			// Ídem: la preferencia se pierde al recargar y nada más.
		}
	}
</script>

<Neocom {expanded} {activeModule} onToggle={alternar} />

<!--
	El chat va acá adentro y no suelto: así el CSS lo corre junto con el contenido
	cuando el Neocom se pliega.
-->
<div class="neocom-content min-h-dvh">
	<StatusBar {action} />
	{#if tabs.length > 1}
		<TabBar {tabs} activeRoute={activeTab} />
	{/if}
	<div
		class="mx-auto w-full max-w-content px-[0.9rem] py-[1.25rem] xs:px-[1.1rem] xs:py-5 sm:px-6 sm:py-6"
	>
		<div class="flex w-full flex-col items-start gap-6">
			{@render children()}
		</div>
	</div>
	<ChatDock {systemName} />
</div>

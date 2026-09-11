<!-- Pantalla anunciada y todavía sin construir. Todo sale del árbol de navegación. -->
<script lang="ts">
	import PendingScreen from '$lib/components/game/PendingScreen.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head><title>{data.title}</title></svelte:head>

<PendingScreen {...data.screen} />

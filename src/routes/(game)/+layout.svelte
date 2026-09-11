<!-- El marco de todas las pantallas del juego. -->
<script lang="ts">
	import GameShell from '$lib/components/shell/GameShell.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<GameShell
	tabs={data.tabs}
	activeModule={data.activeModule}
	activeTab={data.activeTab}
	action={data.action}
	systemName={data.pilot.system}
>
	{@render children()}
</GameShell>

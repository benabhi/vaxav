<!-- El marco de todas las pantallas del cuartel general. -->
<script lang="ts">
	import AdminShell from '$lib/components/shell/AdminShell.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<AdminShell sections={data.sections} activeSection={data.activeSection} callsign={data.callsign}>
	{@render children()}
</AdminShell>

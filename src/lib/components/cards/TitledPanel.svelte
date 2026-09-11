<!-- Panel con su barra de título ya puesta. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Panel from './Panel.svelte';
	import PanelHeader from './PanelHeader.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
		title: string;
		detail?: string;
		class?: string;
	}

	let { children, title, detail = '', class: extra = '', ...rest }: Props = $props();
</script>

<Panel class={extra} {...rest}>
	<PanelHeader {title} {detail} />
	{@render children()}
</Panel>

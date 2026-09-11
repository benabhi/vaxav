<!-- El logotipo como enlace a la portada, para la cabecera. -->
<script lang="ts">
	import { INDEX_ROUTE } from '$lib/routes';
	import Wordmark from './Wordmark.svelte';

	interface Props {
		size?: string;
		iconSize?: string;
	}

	let { size, iconSize }: Props = $props();
</script>

<a href={INDEX_ROUTE} class="no-underline transition-opacity hover:opacity-85">
	<Wordmark {size} {iconSize} />
</a>

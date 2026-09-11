<!-- Marco de las pantallas de acceso: título, bajada y contenido. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import BodyText from '../typography/BodyText.svelte';
	import SectionTitle from '../typography/SectionTitle.svelte';

	interface Props {
		title: string;
		subtitle: string;
		children: Snippet;
	}

	let { title, subtitle, children }: Props = $props();
</script>

<div class="flex w-full flex-col items-start gap-3">
	<SectionTitle>{title}</SectionTitle>
	<BodyText>{subtitle}</BodyText>
	<div class="w-full pt-2">
		{@render children()}
	</div>
</div>

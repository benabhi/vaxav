<!-- Paso numerado, para explicar un proceso en orden. -->
<script lang="ts">
	import BodyText from '../typography/BodyText.svelte';
	import CardTitle from '../typography/CardTitle.svelte';

	interface Props {
		number: string;
		title: string;
		description: string;
	}

	let { number, title, description }: Props = $props();
</script>

<div class="flex h-full flex-col items-start gap-3 border-t border-border pt-4">
	<p class="font-mono text-2 font-bold text-accent text-shadow-glow">{number}</p>
	<CardTitle>{title}</CardTitle>
	<BodyText>{description}</BodyText>
</div>

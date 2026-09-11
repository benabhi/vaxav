<!-- Tarjeta de una forma de jugar: ícono, título y una explicación breve. -->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import type { IconName } from '$lib/icons';
	import BodyText from '../typography/BodyText.svelte';
	import CardTitle from '../typography/CardTitle.svelte';
	import Panel from './Panel.svelte';

	interface Props {
		icon: IconName;
		title: string;
		description: string;
	}

	let { icon, title, description }: Props = $props();
</script>

<Panel
	class="h-full border-t-2 border-t-border-strong transition-[background-color,box-shadow] hover:bg-surface-hover hover:shadow-glow"
>
	<div class="flex h-full flex-col items-start gap-3">
		<Icon name={icon} weight="duotone" size="1.75rem" class="text-accent" />
		<CardTitle>{title}</CardTitle>
		<BodyText>{description}</BodyText>
	</div>
</Panel>

<!-- Aviso de éxito, hermano de `ErrorCallout`. No ocupa lugar vacío. -->
<script lang="ts">
	import Icon from '../Icon.svelte';

	interface Props {
		message?: string | null;
	}

	let { message = '' }: Props = $props();
</script>

{#if message}
	<div
		class="flex w-full items-center gap-3 border border-success bg-success-wash px-[0.9rem] py-[0.7rem]"
	>
		<Icon name="check" weight="bold" size="1rem" class="text-success" />
		<p class="text-2 text-text-strong">{message}</p>
	</div>
{/if}

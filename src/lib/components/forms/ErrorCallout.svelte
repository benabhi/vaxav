<!-- Aviso de error. No ocupa lugar mientras no haya nada que decir. -->
<script lang="ts">
	import Icon from '../Icon.svelte';

	interface Props {
		message?: string | null;
	}

	let { message = '' }: Props = $props();
</script>

{#if message}
	<div
		class="flex w-full items-center gap-3 border border-danger bg-danger-wash px-[0.9rem] py-[0.7rem]"
	>
		<Icon name="warning" weight="fill" size="1rem" class="text-danger" />
		<p class="text-2 text-text-strong">{message}</p>
	</div>
{/if}

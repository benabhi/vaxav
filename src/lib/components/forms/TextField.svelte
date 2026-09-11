<!--
	Campo de texto con su etiqueta y, si hace falta, una aclaración debajo.

	Sigue el HUD: fondo casi transparente, borde fino, esquinas rectas y un halo
	naranja al enfocarlo. El anillo interior claro y la sangría de once píxeles
	vienen del campo original y se conservan para que no se mueva nada.
-->
<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		label: string;
		name: string;
		hint?: string;
	}

	let { label, name, hint = '', ...rest }: Props = $props();
</script>

<div class="flex w-full flex-col items-start gap-2">
	<label for={name} class="font-display text-1 font-medium tracking-label text-accent uppercase">
		{label}
	</label>
	<input
		id={name}
		{name}
		class="text-base h-10 w-full border border-border-soft
			bg-field p-px indent-[11px] font-body leading-6 text-text-strong shadow-[inset_0_0_0_1px_rgb(255_251_237/0.235)]
			transition-[border-color,box-shadow] placeholder:text-text-muted hover:border-border focus:border-accent
			focus:shadow-glow focus:outline-none"
		{...rest}
	/>
	{#if hint}
		<p class="text-1 text-text-muted">{hint}</p>
	{/if}
</div>

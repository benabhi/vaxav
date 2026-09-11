<!--
	Indicador de pasos, con la forma de las solapas del HUD.

	Elite Dangerous encadena sus pantallas con solapas en punta de flecha —
	`OUTFITTING › HARDPOINTS › LARGE HARDPOINT` —, donde la actual va encendida y
	las anteriores quedan apagadas. Un formulario partido en pasos necesita
	responder exactamente eso: dónde estoy, qué ya resolví y cuánto falta.

	Las etiquetas se esconden en pantallas chicas: ahí alcanzan los números, y el
	título del paso ya está debajo, en grande.
-->
<script lang="ts">
	interface Props {
		labels: readonly string[];
		current: number;
	}

	let { labels, current }: Props = $props();

	/** Hecha, actual o pendiente: cada estado tiene su relleno y su color. */
	function state(index: number): string {
		if (index === current) return 'bg-accent text-on-accent shadow-glow';
		if (index < current) return 'bg-surface-strong text-accent-bright';
		return 'bg-surface text-text-muted';
	}
</script>

<div class="flex w-full items-center border-b border-border pb-[0.4rem]">
	{#each labels as label, index (label)}
		<div
			class="tab flex h-[2.25rem] min-w-0 flex-1 items-center justify-center gap-2 px-2
				transition-[background-color,color] xs:px-3 sm:px-4
				{index === 0 ? '' : 'tab-notched -ml-[0.7rem]'} {state(index)}"
			aria-current={index === current ? 'step' : undefined}
		>
			<span class="font-mono text-[0.7rem] opacity-75">{String(index + 1).padStart(2, '0')}</span>
			<span
				class="hidden font-display text-[0.78rem] font-semibold tracking-label whitespace-nowrap
					uppercase sm:block"
			>
				{label}
			</span>
		</div>
	{/each}
</div>

<style>
	/*
	 * La punta de flecha de cada solapa. El primer paso arranca recto para que la
	 * fila apoye contra el borde izquierdo del panel; los demás llevan la muesca
	 * que encastra con la punta del anterior.
	 */
	.tab {
		clip-path: polygon(0 0, calc(100% - 0.75rem) 0, 100% 50%, calc(100% - 0.75rem) 100%, 0 100%);
	}

	.tab-notched {
		clip-path: polygon(
			0 0,
			calc(100% - 0.75rem) 0,
			100% 50%,
			calc(100% - 0.75rem) 100%,
			0 100%,
			0.75rem 50%
		);
	}
</style>

<!--
	El informe de una acción resuelta: qué se hizo, dónde, cuánto tardó y cuánta
	experiencia dejó a cada habilidad.

	Es **la misma pieza en dos lugares**: el aviso que salta al volver y cada fila
	de la bitácora. Que sea una sola es lo que garantiza que digan exactamente lo
	mismo, y que agregar un dato al informe lo agregue en los dos.

	La forma sale de docs/systems/ACTIONS.md: titular arriba con la hora a la
	derecha, el lugar debajo, después las lecturas y al final la experiencia, con
	el nivel al que quedó cada habilidad. Un "+120 XP" suelto no dice nada; "+120
	XP, nivel II al 61 %" sí.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import Label from '../typography/Label.svelte';
	import { thousands } from '$lib/format';
	import type { Informe } from '$lib/tipos';

	interface Props {
		report: Informe;
		/** El aviso no repite la fecha; la bitácora sí, porque es un archivo. */
		showDate?: boolean;
	}

	let { report, showDate = true }: Props = $props();

	/**
	 * Cuánto hace. Lo calcula el navegador y no el servidor por la misma razón
	 * que la cuenta regresiva de la barra de estado: es la hora del jugador, y
	 * una fecha rendida en el servidor queda vieja apenas se dibuja.
	 */
	function hace(at: number): string {
		const segundos = Math.max(0, Math.round((Date.now() - at) / 1000));
		if (segundos < 60) return 'recién';
		const minutos = Math.floor(segundos / 60);
		if (minutos < 60) return `hace ${minutos} min`;
		const horas = Math.floor(minutos / 60);
		if (horas < 24) return `hace ${horas} h`;
		const dias = Math.floor(horas / 24);
		return `hace ${dias} d`;
	}

	let cuando = $derived(hace(report.at));
	let fecha = $derived(
		new Date(report.at).toLocaleString('es-AR', {
			day: '2-digit',
			month: '2-digit',
			hour: '2-digit',
			minute: '2-digit'
		})
	);
</script>

<div class="flex w-full flex-col items-start gap-3">
	<!--
		El titular es el mismo para toda acción y lo específico va al lado: al volver
		la pregunta es siempre "¿terminó lo que pedí?", y recién después "¿qué era?".
	-->
	<div class="flex w-full flex-wrap items-center gap-2">
		<Icon name={report.icon} weight="duotone" size="1.1rem" class="text-accent" />
		<span class="font-display text-[0.82rem] font-bold tracking-label text-text-strong uppercase">
			{report.title}
		</span>
		<span class="font-display text-[0.82rem] font-bold tracking-label text-accent uppercase">
			· {report.kindLabel}
		</span>
		<div class="grow"></div>
		<span class="font-mono text-[0.68rem] whitespace-nowrap text-text-muted">
			{showDate ? `${fecha} · ${cuando}` : cuando}
		</span>
	</div>

	{#if report.place}
		<span class="font-display text-3 font-bold tracking-display text-accent-bright uppercase">
			{report.place}
		</span>
	{/if}

	{#if report.details.length}
		<div class="flex w-full flex-col gap-1">
			{#each report.details as detail (detail.label)}
				<div class="flex w-full items-center gap-3">
					<span class="w-[5.5rem] shrink-0"><Label>{detail.label}</Label></span>
					<span class="min-w-0 text-2 text-text-body">{detail.value}</span>
				</div>
			{/each}
		</div>
	{/if}

	{#if report.xp.length}
		<div class="flex w-full flex-col gap-1 border-t border-border-soft pt-2">
			{#each report.xp as ganancia (ganancia.skill)}
				<div class="flex w-full flex-wrap items-center gap-2">
					<span
						class="min-w-0 flex-[1_1_auto] overflow-hidden font-display text-[0.72rem] font-semibold
							tracking-display text-ellipsis whitespace-nowrap text-text-strong uppercase"
					>
						{ganancia.name}
					</span>
					<span class="shrink-0 font-mono text-[0.75rem] text-data">
						+{thousands(ganancia.xp)} XP
					</span>
					<span class="shrink-0 font-mono text-[0.68rem] whitespace-nowrap text-text-muted">
						nivel {ganancia.level} · {ganancia.progress} %
					</span>
				</div>
			{/each}
		</div>
	{/if}
</div>

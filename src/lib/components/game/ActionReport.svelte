<!--
	El informe de una acción resuelta: qué se hizo, dónde, cuánto tardó y cuánto
	dejó en el pozo de su rama.

	Es **la misma pieza en dos lugares**: el aviso que salta al volver y cada fila
	de la bitácora. Que sea una sola es lo que garantiza que digan exactamente lo
	mismo, y que agregar un dato al informe lo agregue en los dos.

	La forma sale de docs/systems/ACTIONS.md: titular arriba con la hora a la
	derecha, el lugar debajo, después las lecturas y al final la experiencia. El
	titular es genérico —van a ser muchas acciones— y lo que cambia es cuál fue.

	**La experiencia se cuenta entera**, que es el punto: cuánto dio, a qué rama
	fue y cuánto quedó en ese pozo para gastar. Un "+120 XP" suelto no dice nada.

	El bloque por habilidad de más abajo es para los informes **anteriores al pozo
	por familia**, cuando una acción le pagaba derecho a la habilidad que usó. No
	se escriben más, pero los que hay tienen que seguir leyéndose.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import ProgressBar from '../meters/ProgressBar.svelte';
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
		return `hace ${Math.floor(horas / 24)} d`;
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

	<!--
		El depósito al pozo de la rama, que es lo que una acción paga hoy.

		Se cuenta entero y no como un "+26 XP" suelto: a qué rama fue —porque el
		pozo sólo sirve para habilidades de esa rama—, cuánto había y **cuánto quedó
		para gastar**, que es la pregunta que sigue a "gané 26". Y se dice dónde se
		gasta, porque una moneda que no se sabe dónde usar no es una recompensa.
	-->
	{#if report.deposit}
		{@const pozo = report.deposit}
		<div class="flex w-full flex-col gap-2 border-t border-border-soft pt-2">
			<div class="flex w-full items-center gap-3">
				<Label>Experiencia</Label>
				<div class="grow"></div>
				<span class="font-mono text-[0.72rem] text-data">+{thousands(pozo.xp)} XP</span>
			</div>

			<div class="flex w-full flex-wrap items-center gap-2">
				<Icon name={pozo.icon} weight="duotone" size="0.9rem" class="text-accent" />
				<span
					class="font-display text-[0.74rem] font-semibold tracking-display text-text-strong uppercase"
				>
					Pozo de {pozo.name}
				</span>
				<div class="grow"></div>
				<span class="shrink-0 font-mono text-[0.7rem] whitespace-nowrap text-text-muted">
					{thousands(pozo.before)} →
				</span>
				<span class="shrink-0 font-mono text-[0.82rem] whitespace-nowrap text-data">
					{thousands(pozo.after)}
				</span>
			</div>

			<span class="font-mono text-[0.62rem] text-text-muted">
				Tenés {thousands(pozo.after)} XP para invertir en habilidades de {pozo.name}.
			</span>
		</div>
	{/if}

	{#if report.xp.length}
		<div class="flex w-full flex-col gap-2 border-t border-border-soft pt-2">
			<div class="flex w-full items-center gap-3">
				<Label>Experiencia</Label>
				<div class="grow"></div>
				<span class="font-mono text-[0.72rem] text-data">+{thousands(report.xpTotal)} XP</span>
			</div>

			{#each report.xp as ganancia (ganancia.skill)}
				<div class="flex w-full flex-col gap-1">
					<div class="flex w-full flex-wrap items-baseline gap-2">
						<span
							class="min-w-0 overflow-hidden font-display text-[0.74rem] font-semibold tracking-display
								text-ellipsis whitespace-nowrap text-text-strong uppercase"
						>
							{ganancia.name}
						</span>
						<span class="font-display text-[0.6rem] tracking-label text-accent-dim uppercase">
							{ganancia.family}
						</span>
						<div class="grow"></div>
						<span class="shrink-0 font-mono text-[0.75rem] text-data">
							+{thousands(ganancia.xp)} XP
						</span>
					</div>

					<div class="flex w-full items-center gap-2">
						<div class="min-w-0 flex-[1_1_0]">
							<ProgressBar
								percent={ganancia.progress}
								color={ganancia.leveledUp ? 'var(--color-data)' : 'var(--color-accent)'}
							/>
						</div>
						<!--
							Subir de nivel es lo único que el jugador estaba esperando, así que
							se dice con todas las letras y no escondido en un porcentaje.
						-->
						{#if ganancia.leveledUp}
							<span
								class="flex shrink-0 items-center gap-1 border border-data px-[0.35rem] py-[0.05rem]
									font-display text-[0.6rem] font-bold tracking-label whitespace-nowrap text-data uppercase"
							>
								<Icon name="star" weight="fill" size="0.55rem" />
								Nivel {ganancia.level}
							</span>
						{:else}
							<span class="shrink-0 font-mono text-[0.66rem] whitespace-nowrap text-text-muted">
								nivel {ganancia.level} · {ganancia.progress} %
							</span>
						{/if}
					</div>

					<span class="font-mono text-[0.62rem] text-text-muted">
						{thousands(ganancia.after)} XP
						{#if ganancia.toNext > 0}
							· faltan {thousands(ganancia.toNext)} para el nivel siguiente
						{:else}
							· al tope
						{/if}
					</span>
				</div>
			{/each}
		</div>
	{/if}
</div>

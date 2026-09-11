<!--
	El aviso que salta cuando una acción se resolvió mientras no estabas.

	Es lo primero que se ve al volver, así que **no se cierra solo**: en un juego
	de sesiones cortas, un aviso que se desvanece a los tres segundos es un aviso
	que se pierde justo cuando el jugador todavía está leyendo el resto de la
	pantalla. Se cierra a mano, y de todos modos queda en la bitácora.

	Va abajo a la derecha, apoyado sobre el chat, que es la esquina donde el juego
	pone lo que está encendido y no es una sección.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import { LOG_TAB } from '$lib/navigation';
	import type { Informe } from '$lib/tipos';
	import ActionReport from './ActionReport.svelte';

	interface Props {
		report: Informe;
	}

	let { report }: Props = $props();

	let abierto = $state(true);
</script>

{#if abierto}
	<div class="action-notice w-[min(24rem,calc(100vw-1.5rem))]">
		<div
			class="flex w-full flex-col gap-3 border border-l-[3px] border-data border-l-data
				bg-surface-overlay p-4 shadow-data-glow backdrop-blur-[10px]"
		>
			<ActionReport {report} showDate={false} />

			<div class="flex w-full items-center gap-3 border-t border-border-soft pt-3">
				<a
					href={LOG_TAB}
					class="font-display text-[0.68rem] font-semibold tracking-label text-accent-bright
						uppercase no-underline transition-colors hover:text-accent"
				>
					Ver la bitácora
				</a>
				<div class="grow"></div>
				<button
					type="button"
					onclick={() => (abierto = false)}
					aria-label="Cerrar el aviso"
					class="flex cursor-pointer items-center gap-1 text-text-muted transition-colors hover:text-accent"
				>
					<Icon name="x" weight="bold" size="0.7rem" />
					<span class="font-display text-[0.68rem] font-semibold tracking-label uppercase">
						Cerrar
					</span>
				</button>
			</div>
		</div>
	</div>
{/if}

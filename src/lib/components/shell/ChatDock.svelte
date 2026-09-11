<!--
	La ventana de chat y el botón que la abre, abajo a la derecha.

	Es la ventana flotante de siempre —la de EVE, la de cualquier juego con
	gente—: un botón discreto en la esquina, y al apretarlo un panel con las salas
	arriba, el historial en el medio y la lista de conectados al costado.

	Vive en el pie del marco de juego y no dentro de una sección, porque el chat
	**no es una pantalla**: es algo que está encendido mientras se juega, se mire
	lo que se mire.

	Hoy muestra contenido de maqueta. La forma es la definitiva; lo que falta es
	que las líneas sean de verdad, y eso llega con el chat en tiempo real.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import Label from '../typography/Label.svelte';
	import { GLOBAL_ROOM, SYSTEM_ROOM, chatLines, chatMembers, type ChatRoom } from '$lib/chat';

	interface Props {
		/** El nombre del sistema donde está el piloto, para la sala local. */
		systemName: string;
	}

	let { systemName }: Props = $props();

	let abierto = $state(false);
	let sala = $state<ChatRoom>(GLOBAL_ROOM);

	/**
	 * El genérico cubre el instante entre que carga la página y llega el piloto:
	 * una pestaña vacía se vería como un error.
	 */
	let nombreLocal = $derived(systemName || 'Sistema');
	let lineas = $derived(chatLines(sala));
	let presentes = $derived(chatMembers(sala));
</script>

<div class="chat-dock flex flex-col items-end">
	{#if abierto}
		<!-- La ventana completa: salas, historial, conectados y el campo de escribir. -->
		<div
			class="flex h-[23rem] max-h-[calc(100dvh-8rem)] w-[27rem] max-w-[calc(100vw-4.5rem)] flex-col overflow-hidden border border-border bg-surface-overlay shadow-glow-strong backdrop-blur-[12px]"
		>
			<!-- Título, cuántos hay conectados y el cierre. -->
			<div class="flex h-topbar w-full shrink-0 items-center gap-2 bg-accent px-3 text-on-accent">
				<Icon name="chat-teardrop-dots" weight="fill" size="0.95rem" />
				<span class="font-display text-[0.8rem] font-bold tracking-label uppercase">Chat</span>
				<!--
					Se dice que es una maqueta acá y no en una nota al pie: quien la abre
					tiene que saber que lo que lee no es de verdad.
				-->
				<span class="font-mono text-[0.6rem] uppercase opacity-70">maqueta</span>
				<div class="grow"></div>
				<div class="flex items-center gap-[0.3rem]">
					<Icon name="users" weight="fill" size="0.8rem" />
					<span class="font-mono text-[0.72rem]">{presentes.length}</span>
				</div>
				<button
					type="button"
					title="Cerrar"
					class="cursor-pointer p-1"
					onclick={() => (abierto = false)}
				>
					<Icon name="x" weight="bold" size="0.9rem" />
				</button>
			</div>

			<div class="flex w-full shrink-0 border-b border-border">
				{#each [{ id: GLOBAL_ROOM, nombre: 'Global' }, { id: SYSTEM_ROOM, nombre: nombreLocal }] as opcion (opcion.id)}
					{@const activa = sala === opcion.id}
					<button
						type="button"
						class="flex h-8 min-w-0 flex-[1_1_0] cursor-pointer items-center justify-center border-b-2 px-[0.6rem] transition-[background-color,color]
							{activa
							? 'border-b-accent-bright bg-accent text-on-accent'
							: 'border-b-transparent bg-transparent text-accent-bright hover:bg-surface-hover'}"
						onclick={() => (sala = opcion.id as ChatRoom)}
					>
						<span
							class="truncate font-display text-[0.72rem] font-semibold tracking-display uppercase"
						>
							{opcion.nombre}
						</span>
					</button>
				{/each}
			</div>

			<div class="flex min-h-0 w-full flex-[1_1_auto]">
				<!-- El historial se desplaza solo; la lista de al lado no se mueve. -->
				<div class="h-full min-w-0 flex-[1_1_0] overflow-y-auto px-3 py-[0.6rem]">
					<div class="flex w-full flex-col">
						{#each lineas as linea, i (i)}
							<div class="flex w-full flex-wrap items-baseline gap-[0.45rem] py-[0.2rem]">
								<span class="shrink-0 font-mono text-[0.68rem] text-text-muted">
									{linea.time}
								</span>
								<span
									class="shrink-0 font-display text-[0.75rem] font-semibold tracking-display whitespace-nowrap text-accent"
								>
									{linea.author}
								</span>
								<span class="min-w-0 text-1 text-text-body">{linea.text}</span>
							</div>
						{/each}
					</div>
				</div>

				<!--
					En una ventana angosta no hay lugar para la lista: el número de
					conectados ya está en la cabecera.
				-->
				<div
					class="hidden h-full w-36 shrink-0 overflow-y-auto border-l border-border-soft bg-surface px-[0.6rem] py-[0.6rem] sm:block"
				>
					<div class="flex w-full flex-col gap-1">
						<Label>Presentes</Label>
						{#each presentes as persona (persona.callsign)}
							<div class="flex w-full flex-col items-start py-1">
								<span
									class="w-full truncate font-display text-[0.72rem] font-semibold tracking-display text-text-strong"
								>
									{persona.callsign}
								</span>
								<span class="w-full truncate text-[0.6rem] text-text-muted">
									{persona.detail}
								</span>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<div class="w-full shrink-0 border-t border-border-soft px-[0.6rem] py-2">
				<input
					disabled
					placeholder="El chat en vivo llega con la gente (F9)"
					class="h-8 w-full border border-border-soft bg-field indent-[9px] font-body text-[0.875rem] text-text-strong placeholder:text-text-muted"
				/>
			</div>
		</div>
	{/if}

	<!-- El botón de la esquina. Se llena cuando la ventana está abierta. -->
	<button
		type="button"
		class="flex h-[2.25rem] cursor-pointer items-center gap-2 border border-b-0 border-border px-[0.85rem] shadow-glow backdrop-blur-[10px] transition-[background-color,color]
			{abierto
			? 'bg-accent text-on-accent'
			: 'bg-surface-overlay text-accent-bright hover:bg-surface-strong'}"
		onclick={() => (abierto = !abierto)}
	>
		<Icon name="chat-teardrop-dots" weight={abierto ? 'fill' : 'duotone'} size="1.2rem" />
		<span class="font-display text-[0.78rem] font-bold tracking-display uppercase">Chat</span>
	</button>
</div>

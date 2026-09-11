<!--
	La ficha de un agente: el NPC que reparte trabajo en una estación.

	Sigue el mismo criterio que la ficha de facción —un hueco de imagen a la
	izquierda y los datos a la derecha—, porque es la misma clase de cosa: alguien
	a quien se le pone cara antes que nombre.

	El agente al que todavía no se le puede pedir trabajo **se muestra igual pero
	apagado**, con lo que hace falta para que atienda. Esconderlo sería más
	prolijo y mucho peor: lo que se ve es la escalera que el jugador tiene por
	delante.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import Label from '../typography/Label.svelte';
	import type { FilaAgente } from '$lib/tipos';
	import AgentPortrait from './AgentPortrait.svelte';

	interface Props {
		agent: FilaAgente;
	}

	let { agent }: Props = $props();
</script>

<div
	class="w-full border-l-[3px]
		{agent.open
		? 'border border-border-soft border-l-accent bg-surface'
		: 'border border-dead-border border-l-dead-rail bg-transparent'}"
>
	<div class="flex w-full items-stretch gap-[0.9rem]">
		<AgentPortrait open={agent.open} portrait={agent.portrait} />

		<div class="flex w-full min-w-0 flex-col items-start gap-2 py-[0.85rem] pr-[0.85rem]">
			<div class="flex w-full items-center gap-[0.6rem]">
				<p
					class="min-w-0 overflow-hidden font-display text-[0.95rem] font-bold tracking-display
						text-ellipsis whitespace-nowrap uppercase
						{agent.open ? 'text-text-strong' : 'text-text-muted'}"
				>
					{agent.name}
				</p>
				<div class="grow"></div>
				<!--
					El nivel de las misiones que reparte, en romanos. Es el dato que
					ordena todo lo demás: de él depende si el agente atiende.
				-->
				<div
					class="flex shrink-0 items-center gap-[0.4rem] px-[0.45rem] py-[0.1rem]
						{agent.open
						? 'border border-transparent bg-accent text-on-accent'
						: 'border border-dead-line bg-transparent text-text-muted'}"
				>
					<span class="font-display text-[0.6rem] font-semibold tracking-label uppercase">
						Nivel
					</span>
					<span class="font-display text-[0.85rem] font-bold tracking-display">{agent.level}</span>
				</div>
			</div>

			<!-- Para quién trabaja, a quién responde y de qué reparte trabajo. -->
			<div class="flex flex-wrap items-center gap-[0.4rem]">
				<Icon
					name={agent.kindIcon}
					weight="bold"
					size="0.85rem"
					class={agent.open ? 'text-accent' : 'text-text-muted'}
				/>
				<Label>{agent.kind}</Label>
				<span class="text-accent-dim">·</span>
				<Label>{agent.corporation}</Label>
				<span class="text-accent-dim">·</span>
				<Label>{agent.faction}</Label>
			</div>

			<p class="text-1 leading-[1.65] text-text-muted">{agent.description}</p>

			{#if !agent.open}
				<div class="flex flex-wrap items-center gap-[0.4rem]">
					<Icon name="warning" weight="fill" size="0.8rem" class="text-text-muted" />
					<p class="font-mono text-1 text-text-muted">{agent.requirement}</p>
				</div>
			{/if}
		</div>
	</div>
</div>

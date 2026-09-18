<!--
	La tarjeta de un agente: el NPC que reparte trabajo en una estación.

	**Es una entrada de listado y no una ficha**, y ahí está todo lo que decide su
	forma. Una columna angosta lleva cuatro o cinco, y lo que uno hace con ellas es
	recorrerlas buscando a quién pedirle trabajo: hacen falta el sello para
	reconocer al que ya conoce, el nombre, el nivel —del que depende si atiende— y
	de quién es. Nada más entra en esa pregunta.

	Por eso **quién es cada uno vive en su ficha**, a un clic del nombre. Esa línea
	de personalidad se lee una vez; repetida cuatro veces en la columna son cuatro
	tarjetas que ya no entran juntas en la pantalla, y la lista deja de poder
	recorrerse de un vistazo, que era su único trabajo.

	El sello va **pegado al filo izquierdo y de alto completo**, sin nada alrededor:
	es el costado de la tarjeta y no un dibujo apoyado adentro. Con la tarjeta
	compacta el alto que toma son dos renglones, que es exactamente lo que el sello
	necesita para reconocerse de un vistazo.

	El agente al que todavía no se le puede pedir trabajo **se muestra igual pero
	apagado**, con lo que le falta en su propia franja abajo. Esconderlo sería más
	prolijo y mucho peor: lo que se ve es la escalera que el jugador tiene por
	delante.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import Label from '../typography/Label.svelte';
	import { page } from '$app/state';
	import { hrefFicha } from '$lib/fichas';
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
	<div class="flex w-full items-stretch gap-[0.7rem]">
		<AgentPortrait name={agent.name} open={agent.open} />

		<div
			class="flex min-w-0 grow flex-col items-start justify-center gap-[0.25rem] py-[0.55rem]
				pr-[0.7rem]"
		>
			<div class="flex w-full items-center gap-[0.5rem]">
				<!--
					El nombre abre su ficha: quién es, de quién es, dónde para y cuál de las
					dos escaleras le falta para recibirte. Acá entra el nombre y poco más, y
					con eso no se sabe qué hacer.
				-->
				<a
					href={hrefFicha(page.url, 'agente', agent.code)}
					class="min-w-0 overflow-hidden font-display text-[0.9rem] font-bold tracking-display
						text-ellipsis whitespace-nowrap uppercase no-underline hover:text-accent-bright
						{agent.open ? 'text-text-strong' : 'text-text-muted'}"
				>
					{agent.name}
				</a>

				<div class="grow"></div>

				<!--
					El nivel de las misiones que reparte, en romanos. Es el dato que ordena
					todo lo demás: de él depende si el agente atiende.
				-->
				<div
					class="flex shrink-0 items-center gap-[0.35rem] px-[0.4rem] py-[0.05rem]
						{agent.open
						? 'border border-transparent bg-accent text-on-accent'
						: 'border border-dead-line bg-transparent text-text-muted'}"
				>
					<span class="font-display text-[0.58rem] font-semibold tracking-label uppercase">
						Nivel
					</span>
					<span class="font-display text-[0.8rem] font-bold tracking-display">{agent.level}</span>
				</div>
			</div>

			<!-- De qué reparte trabajo, de quién es y bajo qué bandera. -->
			<div class="flex flex-wrap items-center gap-x-[0.4rem] gap-y-[0.1rem]">
				<Icon
					name={agent.kindIcon}
					weight="bold"
					size="0.8rem"
					class={agent.open ? 'text-accent' : 'text-text-muted'}
				/>
				<Label>{agent.kind}</Label>
				<span class="text-accent-dim">·</span>
				<!--
					De quién es, **y se nota que se puede apretar**: subrayado punteado y en el
					naranja vivo. En una tarjeta donde todo lo demás es rótulo apagado, un
					enlace que se ve igual que un rótulo no se aprieta nunca.
				-->
				<a
					href={hrefFicha(page.url, 'corporacion', agent.corporationCode)}
					class="font-display text-1 tracking-display text-accent uppercase underline
						decoration-dotted underline-offset-[0.2rem] hover:text-accent-bright"
				>
					{agent.corporation}
				</a>
				<span class="text-accent-dim">·</span>
				<Label>{agent.faction}</Label>
			</div>
		</div>
	</div>

	<!--
		Lo que le falta, en su propia franja: es de otra clase que lo de arriba —una
		condición y no una identidad— y mezclado en la misma caja hacía que la tarjeta
		del que no atiende se leyera como un párrafo suelto.
	-->
	{#if !agent.open}
		<div
			class="flex w-full items-start gap-[0.4rem] border-t border-dead-line px-[0.6rem]
				py-[0.4rem]"
		>
			<Icon
				name="warning"
				weight="fill"
				size="0.75rem"
				class="mt-[0.1rem] shrink-0 text-text-muted"
			/>
			<p class="font-mono text-[0.7rem] leading-[1.45] text-text-muted">{agent.requirement}</p>
		</div>
	{/if}
</div>

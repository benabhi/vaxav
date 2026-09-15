<!--
	La ayuda que dice **qué habilidad mueve este número**.

	Un juego de progresión que muestra "alcance: 1 región" sin decir qué lo sube
	esconde justamente lo que hay que decidir. El jugador ve el número, entiende
	que se puede mejorar, y no tiene forma de saber adónde ir: termina probando el
	árbol de habilidades a ciegas o leyendo una wiki que no existe.

	Va en un **`Popover` y no en un `HoverCard`** a propósito: en un teléfono no hay
	mouse, y una ayuda que sólo existe para quien señala con el cursor es una ayuda
	que la mitad de la gente no lee nunca.

	Lo que muestra sale del **catálogo de habilidades**, no de un texto escrito acá:
	cada habilidad ya declara qué gobierna, y repetirlo sería dos verdades para
	mantener en pareja. También dice **de qué rama es**, que no es un adorno: la
	experiencia se deposita por rama, así que saber que Contabilidad es de Comercio
	es saber que hay que comerciar para subirla.
-->
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Popover from '$lib/components/ui/Popover.svelte';
	import FloatingPanel from '$lib/components/cards/FloatingPanel.svelte';
	import { skillFamilyLabel } from '$lib/format';
	import { getSkill } from '$lib/game/skills';

	interface Props {
		/** Qué decide este número, en una línea: «Cuántas regiones ves». */
		what: string;
		/** Los códigos de las habilidades que intervienen, en orden de peso. */
		skills: readonly string[];
		/**
		 * Los niveles del piloto, si la pantalla los tiene a mano.
		 *
		 * Es opcional porque no toda pantalla los recibe, y una ayuda que sólo
		 * funciona donde llegaron los niveles no se podría poner en todas partes.
		 * Con ellos dice además en cuánto está; sin ellos, igual dice adónde ir.
		 */
		levels?: Readonly<Record<string, number>>;
	}

	let { what, skills, levels }: Props = $props();

	const ROMAN = ['—', 'I', 'II', 'III', 'IV', 'V'];
</script>

<Popover label="Qué habilidad mueve esto">
	{#snippet trigger()}
		<Icon
			name="question"
			weight="bold"
			size="0.7rem"
			class="text-text-muted transition-colors hover:text-accent-bright"
		/>
	{/snippet}

	<FloatingPanel class="flex max-w-[18rem] flex-col gap-2 p-3">
		<span class="font-display text-1 tracking-label text-accent-dim uppercase">{what}</span>

		<div class="flex flex-col gap-2">
			{#each skills as code (code)}
				{@const skill = getSkill(code)}
				<div class="flex flex-col gap-[0.15rem]">
					<div class="flex items-baseline gap-2">
						<span class="text-2 font-bold text-text-strong">{skill.name}</span>
						{#if levels}
							<span class="font-mono text-[0.72rem] text-data">
								{ROMAN[levels[code] ?? 0] ?? levels[code]}
							</span>
						{/if}
						<div class="grow"></div>
						<!--
							La rama, porque la experiencia se deposita por rama: saber que es de
							Comercio es saber que hay que comerciar para subirla.
						-->
						<span class="font-mono text-[0.64rem] text-text-muted">
							{skillFamilyLabel(skill.family)}
						</span>
					</div>
					<span class="text-1 text-text-muted">{skill.governs}</span>
				</div>
			{/each}
		</div>
	</FloatingPanel>
</Popover>

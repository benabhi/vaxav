<!--
	La pantalla de lo que todavía no existe.

	Casi todas las pestañas del juego están anunciadas y sin construir, así que
	esta pantalla se ve mucho más que cualquier otra por ahora. Por eso **se diseña
	como una pantalla más y no como un cartel de disculpa**: la misma baldosa del
	mosaico de módulos —barra naranja sólida arriba, ícono enorme al fondo— y el
	texto que dice qué va a haber ahí y en qué fase llega.

	Recorrida entera, la navegación funciona como índice de lo que falta.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import Panel from '../cards/Panel.svelte';
	import BodyText from '../typography/BodyText.svelte';
	import DisplayTitle from '../typography/DisplayTitle.svelte';
	import Eyebrow from '../typography/Eyebrow.svelte';
	import type { IconName } from '$lib/icons';

	interface Props {
		moduleLabel: string;
		moduleIcon: IconName;
		tabLabel: string;
		pending: string;
		phase: string;
	}

	let { moduleLabel, moduleIcon, tabLabel, pending, phase }: Props = $props();
</script>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>{moduleLabel}</Eyebrow>
	<DisplayTitle>{tabLabel}</DisplayTitle>
</div>

<div class="w-full">
	<!--
		La barra naranja sólida: qué es esto y cuándo deja de serlo. Sólida y no un
		borde: es la misma inversión con la que el juego marca lo elegido —naranja
		lleno, texto casi negro—, y hace que la pantalla se lea como una pieza del
		HUD y no como un hueco.
	-->
	<div
		class="flex min-h-10 w-full items-center gap-2 bg-accent px-[0.9rem] text-on-accent shadow-glow"
	>
		<Icon name="warning" weight="fill" size="0.95rem" />
		<span class="font-display text-[0.78rem] font-bold tracking-label uppercase">
			En construcción
		</span>
		<div class="grow"></div>
		<span class="font-mono text-[0.72rem] whitespace-nowrap">
			{phase ? `Llega en ${phase}` : 'Sin fase asignada'}
		</span>
	</div>

	<Panel class="relative w-full overflow-hidden border-t-0 p-[1.25rem] xs:p-[1.75rem]">
		<!--
			El ícono enorme y apagado del fondo, el mismo recurso que usan las
			baldosas del mosaico y la ficha de facción.
		-->
		<div class="pointer-events-none absolute right-[-2.5rem] bottom-[-3.5rem] opacity-[0.06]">
			<Icon name={moduleIcon} weight="fill" size="13rem" />
		</div>
		<div class="relative z-1 flex w-full flex-col items-start gap-6 sm:flex-row sm:items-center">
			<Icon name={moduleIcon} weight="duotone" size="3rem" class="text-accent" />
			<div class="min-w-0">
				<BodyText class="max-w-[38rem]">{pending}</BodyText>
			</div>
		</div>
	</Panel>
</div>

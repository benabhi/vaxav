<!--
	La credencial del piloto: quién sos, de dónde venís y con qué volás.

	Es **la figura propia de esta pantalla**, como el anillo lo es de Nave y el
	árbol de Sistema. El resto del juego son paneles rectangulares apilados; acá el
	escudo enorme de la facción y el hueco del retrato le dan una forma que se
	reconoce antes de leer una palabra.

	Está armada para ir creciendo. Las lecturas del pie son una fila de celdas
	iguales: sumar corporación, rango o naves en hangar es agregar otra celda, sin
	rediseñar nada. Las que todavía no existen se muestran igual, apagadas y
	diciendo qué falta, porque un hueco anunciado explica el juego y un hueco
	escondido lo hace parecer más chico de lo que es.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import Label from '../typography/Label.svelte';
	import { factionCrest } from '$lib/format';
	import type { PilotoConectado } from '$lib/tipos';

	interface Props {
		pilot: PilotoConectado;
	}

	let { pilot }: Props = $props();

	let crest = $derived(factionCrest(pilot.factionCode));

	/** Desde cuándo vuela. La fecha corta alcanza: el día exacto no decide nada. */
	let desde = $derived(
		new Date(pilot.since).toLocaleDateString('es-AR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		})
	);
</script>

<!--
	Una lectura del pie. `pending` la dibuja apagada: el dato todavía no existe en
	el juego y el renglón está reservando su lugar.
-->
{#snippet lectura(name: string, value: string, pending = false)}
	<div class="flex min-w-0 flex-col items-start gap-1">
		<Label>{name}</Label>
		<span
			class="w-full overflow-hidden font-display text-[0.82rem] font-semibold tracking-display
				text-ellipsis whitespace-nowrap uppercase
				{pending ? 'text-text-muted' : 'text-accent-bright'}"
		>
			{value}
		</span>
	</div>
{/snippet}

<div
	class="relative w-full overflow-hidden border border-l-[3px] border-border-soft border-l-accent
		bg-surface p-4 xs:p-[1.25rem]"
>
	<!-- El escudo enorme y apagado del fondo, que es la firma del panel. -->
	{#if crest}
		<img
			src={crest}
			alt=""
			class="pointer-events-none absolute -right-[4rem] -bottom-[5rem] h-[18rem] w-[18rem]
				opacity-[0.08] mix-blend-screen saturate-[0.6]"
		/>
	{/if}

	<div class="relative z-[1] flex w-full flex-col gap-4">
		<div class="flex w-full items-start gap-4">
			<!--
				El hueco del retrato. Todavía no hay caras de piloto —las que hay son de
				los agentes—, así que va la silueta: dice que ahí falta algo, que es más
				honesto que un rectángulo vacío o una foto genérica repetida.
			-->
			<div
				class="flex h-[5.5rem] w-[5.5rem] shrink-0 items-center justify-center border
					border-border bg-well"
			>
				<Icon name="identification-badge" weight="thin" size="2.75rem" class="text-accent-dim" />
			</div>

			<div class="flex w-full min-w-0 flex-col items-start gap-1">
				<div class="flex w-full flex-wrap items-center gap-2">
					<h2
						class="font-display text-6 leading-title-5 font-bold tracking-title text-text-strong
							uppercase"
					>
						{pilot.callsign}
					</h2>
					<div class="grow"></div>
					<!--
						Qué está haciendo. En tránsito se enciende en cian porque es un
						estado que pasa; atracado es el reposo y va apagado.
					-->
					<span
						class="flex shrink-0 items-center gap-[0.35rem] border px-[0.45rem] py-[0.1rem]
							font-display text-[0.62rem] font-bold tracking-label whitespace-nowrap uppercase
							{pilot.inTransit ? 'border-data text-data shadow-data-glow' : 'border-border-soft text-text-muted'}"
					>
						<Icon name={pilot.inTransit ? 'rocket-launch' : 'anchor'} weight="fill" size="0.6rem" />
						{pilot.statusLabel}
					</span>
				</div>

				<span
					class="font-display text-2 font-medium tracking-label text-accent uppercase text-shadow-glow"
				>
					{pilot.professionName} · {pilot.factionArchetype}
				</span>
				<span class="text-1 text-text-muted italic">«{pilot.factionMotto}»</span>
			</div>
		</div>

		<!--
			Las lecturas. Cuatro columnas en escritorio y dos en teléfono: son celdas
			iguales, así que sumar una el día que haya rango o naves en hangar no
			mueve nada de lo demás.
		-->
		<div
			class="grid w-full grid-cols-2 gap-4 border-t border-border-soft pt-[0.85rem] sm:grid-cols-4"
		>
			{@render lectura('Facción', pilot.factionName)}
			{@render lectura('Corporación', pilot.corporation || 'Independiente', !pilot.corporation)}
			{@render lectura('Ubicación', pilot.station || '—')}
			{@render lectura('Créditos', pilot.creditsLabel)}
			{@render lectura('Sistema', pilot.system || '—')}
			{@render lectura('Gobierno', pilot.factionGovernment)}
			{@render lectura('Nave', pilot.ship?.name ?? 'Sin nave', !pilot.ship)}
			{@render lectura('Piloto desde', desde)}
		</div>

		<!--
			La nave, en una línea: el rol y las tres capas, en el mismo orden en que
			se las come el daño. El detalle entero está a una pestaña de distancia.
		-->
		{#if pilot.ship}
			<div
				class="flex w-full flex-wrap items-center gap-x-4 gap-y-2 border-t border-border-soft pt-[0.85rem]"
			>
				<span class="flex items-center gap-2">
					<Icon name="rocket" weight="duotone" size="1rem" class="text-accent" />
					<span
						class="font-display text-[0.78rem] font-bold tracking-display text-text-strong uppercase"
					>
						{pilot.ship.name}
					</span>
					<span class="font-display text-[0.62rem] tracking-label text-accent-dim uppercase">
						{pilot.ship.role}
					</span>
				</span>

				<div class="grow"></div>

				<span class="flex items-center gap-3">
					<span class="flex items-baseline gap-1">
						<Label>Escudo</Label>
						<span class="font-mono text-[0.78rem] text-data">{pilot.ship.shield}</span>
					</span>
					<span class="flex items-baseline gap-1">
						<Label>Blindaje</Label>
						<span class="font-mono text-[0.78rem] text-accent-bright">{pilot.ship.armor}</span>
					</span>
					<span class="flex items-baseline gap-1">
						<Label>Casco</Label>
						<span class="font-mono text-[0.78rem] text-text-strong">{pilot.ship.structure}</span>
					</span>
				</span>

				{#if !pilot.ship.flyable}
					<span
						class="flex shrink-0 items-center gap-1 border border-danger px-[0.4rem] py-[0.05rem]
							font-display text-[0.62rem] font-bold tracking-label whitespace-nowrap text-danger uppercase"
					>
						<Icon name="warning" weight="fill" size="0.6rem" />
						No se puede volar
					</span>
				{/if}
			</div>
		{/if}
	</div>
</div>

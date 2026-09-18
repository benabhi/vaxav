<!--
	Una bandeja de ranuras: su rótulo y las ranuras que tiene.

	**El largo de la fila es la terna del casco.** La Mula tiene la de bajos
	larguísima y el Vencejo la de medios, así que dos naves se distinguen por la
	forma del bloque sin que haya que dibujar ninguna figura. Es lo único que el
	anillo que había antes hacía mejor, y se conserva.

	Antes esto era una lista vertical al costado de ese anillo, y los dos decían las
	mismas ranuras. No era duplicación por descuido: un círculo tiene sus elementos
	repartidos en trescientos sesenta grados, así que **no tiene ningún costado
	donde abrir el panel de una ranura** —abajo obliga a bajar, al lado lo achica,
	flotando tapa algo—, y hacía falta una lista para poder trabajar. En filas el
	problema no existe.

	El catálogo de la ranura abierta **no vive acá**: tiene su propia columna. Si se
	abriera debajo de la bandeja, elegir una ranura empujaría todo lo que tiene
	abajo y la pantalla se movería en cada clic, justo cuando uno está comparando
	dos módulos y necesita que las cifras se queden quietas.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import type { GrupoRanuras } from '$lib/tipos';

	interface Props {
		group: GrupoRanuras;
		onChoose: (index: number) => void;
	}

	let { group, onChoose }: Props = $props();
</script>

<div class="flex w-full min-w-0 flex-col gap-[0.35rem]">
	<div class="flex w-full items-baseline gap-[0.45rem] border-b border-border-soft pb-[0.2rem]">
		<Icon name={group.icon} weight="bold" size="0.7rem" class="shrink-0 text-accent-dim" />
		<span
			class="font-display text-[0.64rem] font-bold tracking-label whitespace-nowrap text-accent-dim
				uppercase"
		>
			{group.label}
		</span>
		<span class="font-mono text-[0.66rem] text-text-muted">{group.rows.length}</span>
		<!--
			Qué entra acá, porque el nombre dejó de decirlo. Se esconde en pantalla
			angosta: es una ayuda de la primera vez, no un dato, y en un teléfono el
			renglón lo necesita entero para el rótulo.
		-->
		<span
			class="ml-auto hidden truncate font-display text-[0.6rem] tracking-label text-text-muted
				uppercase sm:inline"
		>
			{group.hint}
		</span>
	</div>

	<!--
		Las ranuras, en un renglón que envuelve. Cada una mide lo mismo y crece hasta
		llenar el ancho disponible, así que en un monitor entran cuatro y en un
		teléfono una, sin un solo punto de corte escrito.
	-->
	<div class="flex w-full flex-wrap gap-[0.35rem]">
		{#each group.rows as slot (slot.index)}
			<button
				type="button"
				onclick={() => onChoose(slot.index)}
				title="{slot.title} · clase {slot.size}"
				aria-expanded={slot.selected}
				class="flex min-w-0 flex-[1_1_11rem] cursor-pointer items-center gap-[0.45rem]
					border-l-[3px] px-[0.5rem] py-[0.4rem] text-left transition-[background-color,color]
					{slot.selected
					? 'border-l-accent-bright bg-accent text-on-accent'
					: slot.filled
						? 'border-l-accent-dim bg-surface text-text-strong hover:bg-surface-hover'
						: 'border-l-transparent bg-transparent text-text-muted hover:bg-surface-hover'}"
			>
				<Icon name={slot.icon} weight={slot.filled ? 'fill' : 'light'} size="0.9rem" />
				<span
					class="min-w-0 flex-[1_1_0] truncate font-display text-[0.72rem] font-semibold
						tracking-display uppercase"
				>
					{slot.moduleName}
				</span>
				<span class="shrink-0 font-mono text-[0.66rem] opacity-70">{slot.badge}</span>
			</button>
		{/each}
	</div>
</div>

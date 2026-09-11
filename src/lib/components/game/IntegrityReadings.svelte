<!--
	Las tres capas escritas, en el mismo orden que sus anillos.

	Van **debajo** del anillo y no adentro: el borde de abajo del cuadro es donde
	caen las ranuras, y un número encima de una ranura tapa justo lo que hay que
	poder tocar.
-->
<script lang="ts">
	interface Props {
		shield: string;
		armor: string;
		structure: string;
	}

	let { shield, armor, structure }: Props = $props();

	let capas = $derived([
		{ name: 'Escudo', value: shield, color: 'text-data' },
		{ name: 'Blindaje', value: armor, color: 'text-accent-bright' },
		{ name: 'Casco', value: structure, color: 'text-text-strong' }
	]);
</script>

<div class="flex w-full items-end justify-center gap-8">
	{#each capas as capa (capa.name)}
		<div class="flex flex-col items-center">
			<span
				class="font-display text-[0.55rem] font-semibold tracking-label text-text-muted uppercase"
			>
				{capa.name}
			</span>
			<span class="font-mono text-[0.8rem] {capa.color}">{capa.value}</span>
		</div>
	{/each}
</div>

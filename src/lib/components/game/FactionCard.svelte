<!--
	La ficha de una facción, al estilo del panel de facciones del juego.

	Elite Dangerous presenta una facción con el nombre grande, una línea que dice
	qué clase de poder es —`FEDERACIÓN | DEMOCRACIA`—, una cita, y debajo una
	tabla de lecturas. Detrás de todo, el emblema enorme y casi apagado, que es lo
	que le da peso al panel sin robarle lugar al texto.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import BodyText from '../typography/BodyText.svelte';
	import Label from '../typography/Label.svelte';
	import type { Faction } from '$lib/game/factions';

	interface Props {
		faction: Faction;
		selected: boolean;
		/** Cuántos pilotos eligieron esta facción, para que la elección no sea a ciegas. */
		pilots?: number;
		systems?: number;
		onChoose: () => void;
	}

	let { faction, selected, pilots = 0, systems = 1, onChoose }: Props = $props();

	/**
	 * El escudo de cada facción. Vienen sobre negro, así que se los funde con
	 * `screen`: el negro desaparece y queda el emblema apoyado sobre el panel.
	 *
	 * Cada uno trae su propio color —rojo, azul y verde—, y es la única excepción
	 * a la regla del acento único: un escudo es identidad, no interfaz. Alrededor
	 * todo sigue siendo naranja.
	 */
	const CRESTS: Record<string, string> = {
		dominion: '/factions/dominion.webp',
		concord: '/factions/concord.webp',
		pact: '/factions/pact.webp'
	};

	let crest = $derived(CRESTS[faction.code]);
</script>

<!--
	Una lectura: etiqueta arriba, valor abajo.

	Apilada y no en una fila de dos columnas: un nombre como "Muelle de los
	Anillos" no entra al lado de su etiqueta en una ficha angosta, y partirlo en
	dos renglones desalinea toda la tabla. Así el valor se lleva el ancho entero
	de su columna.

	El valor va en caja normal y no en mayúsculas: las mayúsculas con interletrado
	ancho son lindas para una etiqueta de dos palabras y ocupan el doble en un
	nombre largo. Las mayúsculas quedan para las etiquetas.
-->
{#snippet reading(name: string, value: string, mono = false)}
	<div class="flex w-full min-w-0 flex-col items-start gap-1">
		<Label>{name}</Label>
		<!-- Red de seguridad para un nombre desmedido: antes de desbordar la ficha,
			 se corta con puntos suspensivos. -->
		<p
			title={value}
			class="w-full overflow-hidden text-2 font-medium text-ellipsis whitespace-nowrap
				{mono ? 'font-mono text-data' : 'font-display text-accent-bright'}"
		>
			{value}
		</p>
	</div>
{/snippet}

<button
	type="button"
	onclick={onChoose}
	aria-pressed={selected}
	class="relative h-full w-full cursor-pointer overflow-hidden border border-l-[3px] border-border-soft
		p-4 text-left transition-[background-color,border-color,box-shadow] hover:bg-surface-hover
		xs:p-[1.25rem]
		{selected ? 'border-l-accent bg-surface-strong shadow-glow' : 'border-l-border-soft bg-surface'}"
>
	<!-- El escudo enorme y apagado del fondo, que es la firma del panel. -->
	<img
		src={crest}
		alt=""
		class="pointer-events-none absolute -right-[3.5rem] -bottom-[4rem] h-[14rem] w-[14rem]
			opacity-10 mix-blend-screen saturate-[0.5]"
	/>

	<div class="relative z-[1] flex h-full w-full flex-col items-start gap-4">
		<div class="flex w-full items-start gap-4">
			<!--
				El hueco del escudo: cuadrado, con borde y su propio resplandor. Sin
				elegir va apagado y casi sin color, para que no compita con el naranja
				de la interfaz. Al elegirlo recupera su color y se enciende, que es la
				forma más directa de decir "ésta es la tuya".
			-->
			<div
				class="flex h-[5.5rem] w-[5.5rem] shrink-0 items-center justify-center border p-1
					transition-[border-color,box-shadow]
					{selected ? 'border-border-strong shadow-glow' : 'border-border-soft'}"
			>
				<img
					src={crest}
					alt=""
					class="h-full w-full mix-blend-screen transition-[filter]
						{selected ? 'brightness-[1.05] saturate-[1]' : 'brightness-[0.65] saturate-[0.4]'}"
				/>
			</div>
			<div class="flex w-full min-w-0 flex-col items-start gap-1">
				<div class="flex w-full items-center gap-3">
					<h3
						class="font-display text-5 leading-title-5 font-bold tracking-title text-text-strong
							uppercase"
					>
						{faction.name}
					</h3>
					<div class="grow"></div>
					{#if selected}
						<Icon name="check" weight="bold" size="1.1rem" class="text-accent" />
					{/if}
				</div>
				<!--
					En el juego acá va FEDERACIÓN | DEMOCRACIA. Sólo entra la primera
					mitad: en una ficha angosta, mayúsculas con interletrado ancho ocupan
					muchísimo. El gobierno pasa a las lecturas, donde tiene el ancho entero.
				-->
				<p
					class="font-display text-2 font-medium tracking-label whitespace-nowrap text-accent
						uppercase text-shadow-glow"
				>
					{faction.archetype}
				</p>
				<p class="text-1 text-text-muted italic">«{faction.motto}»</p>
			</div>
		</div>

		<!--
			La descripción se estira para ocupar lo que sobre: así la tabla de lecturas
			queda pegada al pie y las tres fichas la muestran a la misma altura, sin
			importar cuánto texto tenga cada facción.
		-->
		<div class="w-full grow">
			<BodyText>{faction.description}</BodyText>
		</div>

		<!-- Los valores largos se llevan el ancho entero; los cortos comparten
			 renglón. Así ninguno se parte en dos. -->
		<div class="flex w-full flex-col gap-3 border-t border-border-soft pt-[0.85rem]">
			{@render reading('Gobierno', faction.government)}
			{@render reading('Estación de partida', faction.startingStationName)}
			<div class="grid w-full grid-cols-3 gap-3">
				{@render reading('Sistema', faction.startingSystem)}
				{@render reading('Sistemas', String(systems), true)}
				{@render reading('Pilotos', String(pilots), true)}
			</div>
		</div>
	</div>
</button>

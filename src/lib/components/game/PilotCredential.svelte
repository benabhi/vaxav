<!--
	La credencial del piloto: quién sos, de dónde venís y en qué te convertiste.

	Es **la figura propia de esta pantalla**, como el anillo lo es de Nave y el
	árbol de Sistema, y por eso no está armada como un panel más. Un carnet se
	reconoce por su forma antes de que uno lea una palabra, y eso son tres cosas
	concretas: una **banda de cabecera** que lo nombra y le pone número de serie,
	una **foto de proporción de carnet pegada al borde** que ocupa el alto entero
	de la fila, y una **marca de agua** —el escudo de la facción— que la atraviesa.
	Las esquinas de la foto llevan escuadras, como el visor de una cámara: es lo
	que dice "esto es un registro" y no "esto es una imagen decorativa".

	El hexágono de ramas va **adentro** y no en un panel aparte a propósito. Una
	credencial dice quién sos, y en un juego de progresión eso no es el nombre: es
	la silueta de aquello a lo que le dedicaste el tiempo. Puesto al lado de la
	foto, la tarjeta contesta las dos preguntas de un vistazo —quién y en qué te
	convertiste—, que es exactamente lo que un carnet hace.

	Está armada para ir creciendo. Las lecturas son una grilla de celdas iguales:
	sumar rango o naves en hangar es agregar otra celda. Las que todavía no existen
	se muestran apagadas y diciendo qué falta, porque un hueco anunciado explica el
	juego y un hueco escondido lo hace parecer más chico de lo que es.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import FamilyXpPanel from './FamilyXpPanel.svelte';
	import Modal from '../ui/Modal.svelte';
	import Label from '../typography/Label.svelte';
	import Identicon from './Identicon.svelte';
	import PortraitPicker from './PortraitPicker.svelte';
	import SkillHexagon from './SkillHexagon.svelte';
	import { factionCrest } from '$lib/format';
	import { PORTRAIT_ASPECT } from '$lib/game/portraits';
	import type { PilotoConectado } from '$lib/tipos';

	interface Props {
		pilot: PilotoConectado;
		/** El número de cuenta, que es lo que va impreso en la tarjeta. */
		serial: string;
	}

	let { pilot, serial }: Props = $props();

	let crest = $derived(factionCrest(pilot.factionCode));

	/**
	 * Si está abierta la vista grande del hexágono.
	 *
	 * En la credencial la figura entra chica —es una celda del carnet— y ahí dice
	 * bien la forma pero mal las cifras. La ventana muestra las dos cosas juntas y
	 * en grande, que es el panorama completo: la silueta y, al lado, cuánto hay en
	 * cada rama. Es estado de pantalla, así que vive en el navegador.
	 */
	let ampliado = $state(false);

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
	Una lectura de la grilla. `pending` la dibuja apagada: el dato todavía no existe
	en el juego y el renglón está reservando su lugar.
-->
{#snippet lectura(name: string, value: string, pending = false)}
	<div class="flex min-w-0 flex-col items-start gap-[0.15rem]">
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

<!-- Una escuadra de esquina del visor. `rota` la gira a su cuadrante. -->
{#snippet escuadra(posicion: string)}
	<span class="pointer-events-none absolute z-[2] h-[0.9rem] w-[0.9rem] border-accent {posicion}"
	></span>
{/snippet}

<div
	class="relative w-full overflow-hidden border border-l-[3px] border-border-soft border-l-accent
		bg-surface"
>
	<!--
		La banda de cabecera: lo que convierte un panel en una tarjeta. Lleva qué es,
		su número y qué está haciendo el piloto ahora mismo.
	-->
	<div
		class="relative z-[1] flex w-full flex-wrap items-center gap-x-3 gap-y-2 border-b
			border-border-soft bg-well/60 px-4 py-[0.45rem]"
	>
		<Icon name="identification-card" weight="duotone" size="0.95rem" class="text-accent" />
		<span class="font-display text-1 tracking-label text-accent-dim uppercase">
			Credencial de piloto
		</span>
		<span class="font-mono text-[0.72rem] text-text-muted">{serial}</span>

		<div class="grow"></div>

		<!--
			Qué está haciendo. En tránsito se enciende en cian porque es un estado que
			pasa; atracado es el reposo y va apagado.
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

	<!--
		El cuerpo: foto · identidad · hexágono.

		En teléfono se apila y la foto se queda arriba, porque una credencial sin
		cara arriba no se lee como credencial. En escritorio las tres columnas van
		estiradas al mismo alto, que es lo que hace que la foto ocupe la fila entera.
	-->
	<div class="relative z-[1] flex w-full flex-col items-stretch gap-4 p-4 md:flex-row md:gap-5">
		<!--
			La foto. Proporción de carnet y `cover`, que es la misma con la que se
			guarda: recortada una vez, al subirla, para que se vea igual en todas
			partes.
		-->
		<div class="relative shrink-0 self-center md:self-stretch">
			<div
				class="relative h-full w-[9rem] overflow-hidden border border-border bg-well xs:w-[11rem]
					md:w-[10rem] lg:w-[11.5rem]"
				style="aspect-ratio: {PORTRAIT_ASPECT}"
			>
				{#if pilot.portrait}
					<img
						src={pilot.portrait}
						alt="Retrato de {pilot.callsign}"
						class="h-full w-full object-cover"
					/>
				{:else}
					<!--
						Sin foto va **su sello**, no una silueta gris.

						La silueta decía «acá falta algo» y no decía nada más: todas iguales, la
						del piloto y la de los otros mil. El sello sale del distintivo, así que
						desde el primer segundo la credencial muestra algo que es suyo y de
						nadie más, y el que no quiera subir foto no queda con un hueco.
					-->
					<div class="flex h-full w-full items-center justify-center">
						<Identicon
							name={pilot.callsign}
							family="piloto"
							size="100%"
							title="Sello de {pilot.callsign}"
						/>
					</div>
				{/if}

				<PortraitPicker hasPortrait={pilot.portrait !== ''} />
			</div>

			<!-- Las escuadras del visor, fuera del recorte para que se vean enteras. -->
			{@render escuadra('top-[-2px] left-[-2px] border-t-2 border-l-2')}
			{@render escuadra('top-[-2px] right-[-2px] border-t-2 border-r-2')}
			{@render escuadra('bottom-[-2px] left-[-2px] border-b-2 border-l-2')}
			{@render escuadra('bottom-[-2px] right-[-2px] border-b-2 border-r-2')}
		</div>

		<!--
			La identidad y las lecturas, con el escudo de la facción atravesándolas.

			El escudo va **acá y no detrás de la tarjeta entera**: puesto al fondo se le
			metía debajo al hexágono, y una figura que informa por su forma no puede
			tener otra forma encima. Sobre un bloque de texto, en cambio, una marca de
			agua al siete por ciento es exactamente lo que es en un carnet de verdad.
		-->
		<div class="relative flex min-w-0 flex-[1_1_0] flex-col gap-3 overflow-hidden">
			{#if crest}
				<img
					src={crest}
					alt=""
					class="pointer-events-none absolute -right-[3rem] -bottom-[4rem] z-0 h-[16rem] w-[16rem]
						opacity-[0.07] mix-blend-screen saturate-[0.6]"
				/>
			{/if}

			<div class="relative z-[1] flex w-full min-w-0 flex-col items-start gap-[0.15rem]">
				<h2
					class="font-display text-6 leading-title-5 font-bold tracking-title text-text-strong
						uppercase"
				>
					{pilot.callsign}
				</h2>
				<span
					class="font-display text-2 font-medium tracking-label text-accent uppercase text-shadow-glow"
				>
					{pilot.professionName} · {pilot.factionArchetype}
				</span>
				<span class="text-1 text-text-muted italic">«{pilot.factionMotto}»</span>
			</div>

			<div
				class="relative z-[1] grid w-full grid-cols-2 gap-x-4 gap-y-3 border-t border-border-soft
					pt-3 sm:grid-cols-3"
			>
				{@render lectura('Facción', pilot.factionName)}
				{@render lectura('Gobierno', pilot.factionGovernment)}
				{@render lectura('Corporación', pilot.corporation || 'Independiente', !pilot.corporation)}
				{@render lectura('Ubicación', pilot.station || '—')}
				{@render lectura('Sistema', pilot.system || '—')}
				{@render lectura('Créditos', pilot.creditsLabel)}
				{@render lectura('Nave', pilot.ship?.name ?? 'Sin nave', !pilot.ship)}
				{@render lectura('Piloto desde', desde)}
			</div>

			<!--
				La nave, en una línea: el rol, el tanque y las tres capas, en el mismo
				orden en que se las come el daño. El detalle entero está a una pestaña de
				distancia; el combustible viene acá igual porque es el único de estos
				números que **se gasta**, y el que decide si el próximo salto se puede
				dar. Un dato así no puede costar dos pestañas mirarlo.
			-->
			{#if pilot.ship}
				<div
					class="relative z-[1] flex w-full flex-wrap items-center gap-x-4 gap-y-2 border-t
						border-border-soft pt-3"
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

					<span class="flex flex-wrap items-center gap-3">
						<span class="flex items-baseline gap-1">
							<Label>Combustible</Label>
							<span class="font-mono text-[0.78rem] whitespace-nowrap text-data">
								{pilot.ship.fuel}
							</span>
						</span>
						<span class="flex items-baseline gap-1">
							<Label>Saltos</Label>
							<span class="font-mono text-[0.78rem] text-accent-bright">{pilot.ship.jumps}</span>
						</span>
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

		<!--
			El hexágono: la otra mitad de quién sos. Va separado por una línea, como el
			chip de un carnet, y con su etiqueta para que no se lea como un adorno. La
			silueta de un minero y la de un artillero son dos formas distintas, y eso
			es lo que dice de un vistazo a qué se dedicó este piloto.
		-->
		<div
			class="flex shrink-0 flex-col items-center gap-1 border-t border-border-soft pt-3 md:w-[13rem]
				md:border-t-0 md:border-l md:pt-0 md:pl-5 lg:w-[15rem]"
		>
			<div class="flex w-full items-center justify-center gap-2">
				<Label>Habilidades</Label>
				<!--
					Ampliar. Acá la figura entra chica y dice bien la forma pero mal las
					cifras; la ventana pone las dos cosas juntas y en grande.
				-->
				<button
					type="button"
					onclick={() => (ampliado = true)}
					aria-label="Ver el hexágono en grande"
					class="cursor-pointer text-text-muted transition-colors hover:text-accent-bright"
				>
					<Icon name="arrows-out" weight="bold" size="0.75rem" />
				</button>
			</div>
			<div class="w-full max-w-[15rem]">
				<SkillHexagon families={pilot.families} />
			</div>
		</div>
	</div>
</div>

<!--
	El panorama completo: la figura grande y sus cifras al lado.

	Las dos leen los mismos dos números de cada rama —lo invertido y lo que espera
	en el pozo—, y por eso no se pisan: el hexágono contesta "¿qué forma tiene este
	piloto?" y la lista "¿cuánto exactamente?". Juntas y en grande es la vista que
	uno quiere cuando está decidiendo en qué gastar el próximo pozo.
-->
<Modal bind:open={ampliado} title="Habilidades" detail={pilot.callsign} icon="atom" size="lg">
	<div class="flex w-full flex-col items-start gap-5 lg:flex-row">
		<div class="w-full min-w-0 flex-[1_1_0]">
			<SkillHexagon families={pilot.families} />
		</div>
		<div class="w-full min-w-0 flex-[1_1_0]">
			<FamilyXpPanel families={pilot.families} />
		</div>
	</div>
</Modal>

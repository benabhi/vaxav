<!--
	Pestaña Ubicación: el lugar exacto donde está el piloto.

	Es la primera del módulo a propósito. Hoy describe el lugar y sus módulos,
	pero es donde van a vivir las acciones —atracar, minar, refinar, poner
	rumbo—, así que va a ser de las pantallas más visitadas del juego.

	**Se dibuja distinta del resto a propósito.** Parado en una estación, la
	pantalla es el mosaico de módulos con la ficha al costado; parado en un
	cinturón o una luna, no hay mosaico y la ficha ocupa todo. La forma la decide
	el contenido, no una plantilla.
-->
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import Panel from '$lib/components/cards/Panel.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import PanelTabs, { type Solapa } from '$lib/components/ui/PanelTabs.svelte';
	import Identicon from '$lib/components/game/Identicon.svelte';
	import HudLink from '$lib/components/buttons/HudLink.svelte';
	import TransitTrack from '$lib/components/game/TransitTrack.svelte';
	import GateRing from '$lib/components/game/GateRing.svelte';
	import BeltField from '$lib/components/game/BeltField.svelte';
	import BodyOrbit from '$lib/components/game/BodyOrbit.svelte';
	import ActionSource from '$lib/components/game/ActionSource.svelte';
	import AgentCard from '$lib/components/game/AgentCard.svelte';
	import ConfirmAction from '$lib/components/game/ConfirmAction.svelte';
	import HudButton from '$lib/components/buttons/HudButton.svelte';
	import ProgressBar from '$lib/components/meters/ProgressBar.svelte';
	import ModuleGrid from '$lib/components/game/ModuleGrid.svelte';
	import ModuleTile from '$lib/components/game/ModuleTile.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import CardTitle from '$lib/components/typography/CardTitle.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import HudValue from '$lib/components/typography/HudValue.svelte';
	import Label from '$lib/components/typography/Label.svelte';
	import { page } from '$app/state';
	import { hrefFicha } from '$lib/fichas';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let place = $derived(data.location);

	/**
	 * El color del aviso de riesgo, por nivel.
	 *
	 * Las clases van enteras y escritas a mano porque Tailwind lee el código
	 * fuente: una clase armada por concatenación no existe en la hoja de estilos.
	 */
	const RIESGO_TONO: Record<string, string> = {
		calm: 'border-l-border bg-surface text-text-muted',
		watched: 'border-l-warning bg-warning-wash text-warning',
		exposed: 'border-l-warning bg-warning-wash text-warning',
		hostile: 'border-l-danger bg-danger-wash text-danger'
	};

	/**
	 * El módulo abierto debajo del mosaico. Arranca vacío: primero se ve el
	 * conjunto, después se elige. Es estado de pantalla, así que vive acá y no
	 * viaja al servidor.
	 */
	let selected = $state('');

	/**
	 * Al cambiar de lugar el detalle se cierra solo: el módulo que estaba abierto
	 * era de la estación anterior. Se compara contra el último lugar visto porque
	 * navegar a la misma ruta reusa el componente y el estado sobrevive.
	 */
	let lastPlace = $state('');
	$effect(() => {
		if (lastPlace !== place.name) {
			lastPlace = place.name;
			selected = '';
			solapa = 'ficha';
		}
	});

	/**
	 * Qué solapa de la columna angosta está abierta.
	 *
	 * Arranca en la ficha: lo primero que uno quiere de un lugar es qué es. Se
	 * reinicia al cambiar de lugar por lo mismo que el módulo elegido —abajo—, y
	 * vive acá y no en el servidor porque cambiar de solapa no cambia la partida.
	 */
	let solapa = $state('ficha');

	/** Las tres, con su cuenta al lado para no tener que abrirlas para saber. */
	let solapas = $derived<Solapa[]>([
		{ code: 'ficha', label: 'Información' },
		{ code: 'agentes', label: 'Agentes', detail: place.agentCount },
		{ code: 'pilotos', label: 'Pilotos', detail: String(place.pilots.length + place.pilotsBeyond) }
	]);

	let chosen = $derived(
		place.modules.find((module) => module.code === selected && module.available)
	);

	function choose(code: string, available: boolean) {
		// Un módulo que la estación no tiene no abre nada.
		selected = available ? code : '';
	}
</script>

<svelte:head><title>Ubicación · Navegación · Vaxav</title></svelte:head>

<!--
	Una lectura de la ficha: etiqueta arriba, valor abajo. Mismo formato que las
	fichas de facción, por la misma razón: apilado, el valor se lleva el ancho de
	su columna y no se parte en dos renglones.
-->
{#snippet reading(name: string, value: string, mono = false)}
	<div class="flex w-full min-w-0 flex-col items-start gap-1">
		<Label>{name}</Label>
		<p
			class="w-full overflow-hidden text-2 font-medium text-ellipsis whitespace-nowrap
				{mono ? 'font-mono text-data' : 'font-display text-accent-bright'}"
		>
			{value}
		</p>
	</div>
{/snippet}

<!--
	Qué es este lugar, dónde está y en qué estado. Escrita una sola vez porque la
	piden dos: la solapa de una estación y el panel suelto de todo lo demás.
-->
{#snippet ficha()}
	<div class="flex w-full min-w-0 flex-col items-start gap-4">
		<div class="flex w-full items-start gap-[0.9rem]">
			<Icon name={place.icon} weight="thin" size="3rem" class="text-accent-dim" />
			<div class="flex min-w-0 flex-col gap-1">
				{#each place.description as frase (frase)}
					<BodyText>{frase}</BodyText>
				{/each}
			</div>
		</div>

		<!--
			Si acá te pueden atacar, se dice acá y no adentro del párrafo de arriba.
			Una advertencia escondida en un texto de ambientación no la lee nadie: a
			la tercera pantalla el párrafo se saltea entero.

			No sale en una estación: atracado no te ataca nadie, y ponerle un cartel
			de peligro a un hangar enseña a ignorar los carteles de peligro.
		-->
		{#if place.risk}
			<div
				class="flex w-full items-center gap-[0.6rem] border-l-[3px] px-3 py-[0.5rem] {RIESGO_TONO[
					place.risk.level
				] ?? RIESGO_TONO.calm}"
			>
				<Icon
					name={place.risk.level === 'calm' ? 'shield-check' : 'warning'}
					weight="duotone"
					size="1rem"
					class="shrink-0"
				/>
				<span class="font-display text-[0.72rem] font-bold tracking-label uppercase">
					{place.risk.label}
				</span>
				<span class="min-w-0 text-1 text-text-body">{place.risk.note}</span>
			</div>
		{/if}
		<div class="grid w-full grid-cols-2 gap-4">
			{@render reading('Tipo', place.kind)}
			{@render reading('Sistema', place.system)}
			{@render reading('Orbita a', place.parent)}
			{@render reading('Distancia', place.distance, true)}
			{@render reading('Estado', place.exploration)}
		</div>

		<!--
			**Dónde queda esto**, que es la pregunta que la ficha de un lugar deja
			abierta: dice el nombre del sistema y ahí termina. Es el mismo botón con el
			que cierra la ficha de una corporación, y por la misma razón: un nombre que
			no lleva a ninguna parte no sirve de nada.

			Va como botón al pie y no como enlace en la lectura «Sistema» porque no es
			un dato más de la lista, es lo único que se puede **hacer** desde acá.
		-->
		{#if place.systemCode}
			<div class="flex w-full justify-end border-t border-border-soft pt-3">
				<HudLink href="/navegacion/galaxia?sistema={place.systemCode}" variant="outline" size="1">
					<Icon name="map-trifold" weight="bold" size="0.7rem" />
					Ver en el mapa
				</HudLink>
			</div>
		{/if}
	</div>
{/snippet}

<div class="flex flex-col items-start gap-1">
	<Eyebrow>{place.inTransit ? 'Vas' : 'Estás en'}</Eyebrow>
	<DisplayTitle>{place.name}</DisplayTitle>
</div>

<!--
	Una punta del tramo: el cuerpo arriba y su sistema abajo.

	El sistema se dibuja en las dos puntas, no sólo en la de llegada, porque en un
	salto son distintos y ésa es toda la gracia del salto. Con bandera, gobierno y
	ley, porque mientras la nave vuela **la ficha del lugar está apagada** y no hay
	ninguna otra pantalla donde mirar a qué se está entrando.
-->
<!--
	El tramo en curso, mientras la nave está en camino.

	Es lo único que se puede decir con verdad ahí —no está en ningún lado— y es
	justo el momento en que uno abre esta pestaña: para ver cuánto falta. Antes
	decía «la nave está en camino» y nada más, que es un cartel, no una pantalla.

	La cuenta la lleva `ActionIndicator` en la barra de estado; acá va **de dónde a
	dónde**, con qué hay de cada lado, que es lo que la barra no tiene lugar para
	decir.
-->
{#if place.leg}
	<TitledPanel
		title={place.leg.kindLabel}
		detail={place.leg.destination.system}
		class="mb-[1.25rem] w-full"
	>
		<div class="flex w-full flex-col gap-5">
			<!--
				El viaje dibujado, a todo el ancho: mientras se espera, la pantalla tiene
				que mostrar que algo se mueve. Las cifras exactas van debajo, como manda
				la regla de las figuras.
			-->
			<TransitTrack
				origin={place.leg.origin}
				destination={place.leg.destination}
				startedAt={place.leg.startedAt}
				durationSeconds={place.leg.durationSeconds}
			/>

			<!--
				Lo que cuesta el tramo. La distancia y el combustible sólo aparecen
				cuando hay un salto detrás: un viaje dentro del sistema no quema nada, y
				una fila en blanco miente más que una fila que no está.
			-->
			<div class="flex flex-wrap items-start gap-x-6 gap-y-3 border-t border-border-soft pt-4">
				{#if place.leg.distance}
					<div class="flex flex-col items-start gap-1">
						<Label>Distancia</Label>
						<span class="font-mono text-[0.88rem] whitespace-nowrap text-data">
							{place.leg.distance}
						</span>
					</div>
				{/if}

				{#if place.leg.fuel}
					<div class="flex flex-col items-start gap-1">
						<Label>Combustible</Label>
						<span class="font-mono text-[0.88rem] whitespace-nowrap text-data">
							{place.leg.fuel}
						</span>
					</div>
				{/if}

				<div class="flex flex-col items-start gap-1">
					<Label>Duración</Label>
					<span class="font-mono text-[0.88rem] whitespace-nowrap text-accent-bright">
						{place.leg.duration}
					</span>
				</div>
			</div>
		</div>

		<p class="mt-4 text-1 text-text-muted">
			Mientras la nave esté en camino no se pueden dar otras órdenes. Cuando llegue vas a poder
			atracar y reconfigurarla.
		</p>
	</TitledPanel>
{/if}

<!--
	Apilado, los dos bloques se llevan el ancho entero; recién en pantalla grande
	se ponen lado a lado y ahí manda el `flex`. Sin el `w-full`, `items-start` los
	dimensiona por contenido y el mosaico desborda en un teléfono.
-->
<div class="flex w-full flex-col items-start gap-[1.25rem] lg:flex-row">
	{#if place.isStation}
		<div class="w-full min-w-0 flex-[2_1_0]">
			<div class="flex w-full flex-col gap-4">
				<TitledPanel title="Módulos de la estación" detail={place.moduleCount} class="w-full">
					<ModuleGrid>
						{#each place.modules as module (module.code)}
							<ModuleTile
								icon={module.icon}
								name={module.name}
								summary={module.available ? module.summary : 'No disponible'}
								available={module.available}
								selected={selected === module.code}
								onChoose={() => choose(module.code, module.available)}
							/>
						{/each}
					</ModuleGrid>

					<!--
						El detalle del módulo elegido. Es lo que hace que el mosaico sea
						interactivo desde hoy en vez de una fila de botones muertos: se puede
						ver qué ofrece cada módulo y cuáles tiene esta estación.
					-->
					{#if chosen}
						<div
							class="mt-[0.9rem] w-full border-l-[3px] border-l-accent bg-surface-strong p-[0.9rem]"
						>
							<div class="flex w-full items-start gap-[0.9rem]">
								<Icon name={chosen.icon} weight="duotone" size="2rem" class="text-accent" />
								<div class="flex w-full min-w-0 flex-col items-start gap-2">
									<div class="flex w-full flex-wrap items-center gap-2">
										<CardTitle>{chosen.name}</CardTitle>
										<div class="grow"></div>
										<Label>{chosen.available ? 'Instalado' : 'No instalado'}</Label>
									</div>
									<BodyText>{chosen.summary}</BodyText>
								</div>
							</div>
						</div>
					{:else}
						<p class="mt-[0.9rem] text-1 text-text-muted">Elegí un módulo para ver qué ofrece.</p>
					{/if}
				</TitledPanel>
			</div>
		</div>
	{/if}

	<!--
		El campo de rocas. Va en esta pantalla y no en el árbol del sistema porque
		**se trabaja donde estás parado**: el árbol dice adónde ir, esto dice qué
		hacer una vez que llegaste.

		Una roca sin lectura vigente se dibuja **apagada y sin nombre**: se ve el
		bulto y nada más. Es lo que le da trabajo al escáner, y lo que hace que
		llegar a un cinturón desconocido sea algo que hacer en vez de una lista que
		ya venía escrita.
	-->
	<!--
		La puerta: adónde lleva y qué cuesta, **antes** de apretar.

		Un salto que se cobra después de ordenarlo es un salto que nadie puede
		planear, y planear es la mitad de lo que se hace en un juego de naves. Por
		eso el tiempo y el combustible se muestran siempre, incluso cuando no se
		puede cruzar: saber que faltan doce unidades es lo que dice qué hacer, y un
		"no podés" sin cifras no dice nada.
	-->
	{#if place.gate}
		<div class="w-full min-w-0 flex-[2_1_0]">
			<TitledPanel
				title="Puerta estelar"
				detail={place.gate.destination || 'sin conectar'}
				class="w-full"
			>
				<div class="flex w-full flex-col gap-4">
					<!--
						La figura y su lista: el aro a la izquierda y lo que cuesta cruzarlo a
						la derecha. Apiladas en un teléfono —con el dibujo arriba, que es lo
						que dice de un vistazo dónde estás parado— y lado a lado recién
						cuando hay ancho, como todas las figuras del juego.
					-->
					<div class="flex w-full flex-col items-center gap-5 lg:flex-row lg:items-center lg:gap-6">
						<div class="flex w-full justify-center lg:w-auto lg:shrink-0">
							<GateRing
								bearing={place.gate.bearing}
								destination={place.gate.destination}
								closed={place.gate.closed}
								reachable={place.gate.blocked === ''}
							/>
						</div>

						<div class="flex w-full min-w-0 flex-col gap-4">
							<!--
						La ambientación de la puerta, acá adentro y no en una ficha aparte: en
						una puerta no hay nada más que contar del lugar, y lo que importa es el
						salto que sigue.
					-->
							<!-- Sin descripción no se dibuja el bloque: un ícono solo no dice nada. -->
							{#if place.description.length > 0}
								<div class="flex w-full items-start gap-[0.9rem]">
									<Icon
										name={place.icon}
										weight="thin"
										size="2.25rem"
										class="shrink-0 text-accent-dim"
									/>
									<div class="flex min-w-0 flex-col gap-1">
										{#each place.description as frase (frase)}
											<BodyText>{frase}</BodyText>
										{/each}
									</div>
								</div>
							{/if}

							{#if place.gate.destination}
								<div
									class="flex w-full flex-wrap items-center gap-3 border-t border-border-soft pt-4"
								>
									<Icon
										name="arrow-circle-right"
										weight="duotone"
										size="1.3rem"
										class="text-accent"
									/>
									<div class="flex min-w-0 flex-col gap-[0.1rem]">
										<HudValue class="text-[0.9rem]">{place.gate.destination}</HudValue>
										<Label>llegás a {place.gate.arrival}</Label>
									</div>
								</div>

								<div class="flex w-full flex-wrap items-start gap-x-6 gap-y-3">
									<div class="flex flex-col items-start gap-1">
										<Label>Rumbo</Label>
										<span class="text-[0.85rem] text-text-body">{place.gate.bearingLabel}</span>
									</div>
									<div class="flex flex-col items-start gap-1">
										<Label>Distancia</Label>
										<span class="font-mono text-[0.85rem] text-data">{place.gate.distance}</span>
									</div>
									<div class="flex flex-col items-start gap-1">
										<Label>Alcance</Label>
										<span class="font-mono text-[0.85rem] text-text-body">{place.gate.range}</span>
									</div>
									<div class="flex flex-col items-start gap-1">
										<Label>Duración</Label>
										<span class="font-mono text-[0.85rem] text-accent-bright">
											{place.gate.duration}
										</span>
									</div>
									<div class="flex flex-col items-start gap-1">
										<Label>Combustible</Label>
										<!--
									Lo que cuesta sobre lo que hay: la resta es la pregunta, y
									hacerla de memoria entre dos pantallas es lo que hace que un
									juego se sienta incómodo.
								-->
										<span
											class="font-mono text-[0.85rem] {place.gate.fuel > place.gate.fuelInTank
												? 'text-danger'
												: 'text-data'}"
										>
											{place.gate.fuel} de {place.gate.fuelInTank} u
										</span>
									</div>
								</div>
							{:else}
								<BodyText>
									Esta puerta todavía no lleva a ninguna parte. Alguien la plantó y nadie la conectó
									del otro lado.
								</BodyText>
							{/if}
							<!--
								El motivo, salvo cuando ya lo dijo el párrafo de arriba: una puerta sin
								conectar lo explica mejor y con más palabras, y repetirlo en rojo dos
								renglones más abajo es decir dos veces lo mismo.
							-->
							{#if place.gate.blocked && place.gate.destination}
								<p class="text-2 text-danger">{place.gate.blocked}</p>
							{/if}

							<!--
						Con confirmación, como toda orden: un salto compromete tiempo real y
						además **gasta combustible que no vuelve**. El diálogo repite lo que
						cuesta en vez de preguntar a secas, porque un aviso que sólo pregunta
						se aprende a apretar sin leer.
					-->
							<ConfirmAction
								formAction="?/saltar"
								title="Saltar a {place.gate.destination}"
								icon="arrow-circle-right"
								confirmLabel="Saltar"
								disabled={Boolean(place.gate.blocked)}
								readings={[
									{ label: 'Llegás a', value: place.gate.arrival },
									{ label: 'Distancia', value: place.gate.distance },
									{ label: 'Duración', value: place.gate.duration },
									{
										label: 'Combustible',
										value: `${place.gate.fuel} de ${place.gate.fuelInTank} u`
									}
								]}
								note="El combustible se gasta al llegar y no vuelve. Mientras dure el salto no vas a poder dar otra orden."
								source={place.gate.source}
							>
								{#snippet trigger(abrir)}
									<ActionSource source={place.gate!.source}>
										<HudButton
											type="button"
											variant="primary"
											disabled={Boolean(place.gate?.blocked)}
											onclick={abrir}
										>
											<Icon name="arrow-circle-right" weight="bold" size="0.85rem" />
											Saltar
										</HudButton>
									</ActionSource>
								{/snippet}
								{#snippet fields()}{/snippet}
							</ConfirmAction>
						</div>
					</div>
				</div>
			</TitledPanel>
		</div>
	{/if}

	<!--
		El vecindario, para los cuerpos que orbitan: planeta, luna y estrella.

		**Ocupa la columna ancha**, que hasta acá quedaba vacía. Una estación tiene
		su mosaico, una puerta su aro y un cinturón su campo; parado en un planeta no
		había nada del lado ancho y la pantalla era una ficha angosta con dos tercios
		de pantalla en negro al lado. No era que le faltara un dibujo: le faltaba
		tener algo que decir, y lo que un planeta tiene para decir es su lugar.
	-->
	{#if place.orbit}
		<div class="w-full min-w-0 flex-[2_1_0]">
			<TitledPanel title="En órbita" detail={place.orbit.center} class="w-full">
				<div class="flex w-full flex-col items-center gap-5 lg:flex-row lg:items-center lg:gap-6">
					<div class="flex w-full justify-center lg:w-auto lg:shrink-0">
						<BodyOrbit orbit={place.orbit} />
					</div>

					<!-- Y su lista al lado, como toda figura del juego. -->
					<div class="flex w-full min-w-0 flex-col gap-4">
						<div class="flex w-full flex-col items-start gap-1">
							<Label>{place.orbit.centerIsHere ? 'Sos el centro' : 'Gira alrededor de'}</Label>
							<span class="flex items-center gap-2">
								<Icon
									name={place.orbit.centerIcon}
									weight="duotone"
									size="1rem"
									class="text-accent"
								/>
								<HudValue>{place.orbit.center}</HudValue>
							</span>
						</div>

						<div class="flex w-full flex-col items-start gap-2">
							<Label>
								{place.orbit.centerIsHere ? 'Le dan vueltas' : 'En el mismo anillo'}
							</Label>
							<div class="grid w-full grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
								{#each place.orbit.ring as vecino (vecino.name)}
									<span class="flex min-w-0 items-center gap-2">
										<Icon
											name={vecino.icon}
											weight="bold"
											size="0.7rem"
											class="shrink-0 {vecino.here ? 'text-accent-bright' : 'text-accent-dim'}"
										/>
										<span
											class="truncate text-1 {vecino.here
												? 'text-accent-bright'
												: 'text-text-body'}"
										>
											{vecino.name}
										</span>
									</span>
								{/each}
							</div>
						</div>

						<!-- Lo que te cuelga. Sin nada colgando, el bloque no se dibuja. -->
						{#if place.orbit.satellites.length}
							<div class="flex w-full flex-col items-start gap-2">
								<Label>Te orbitan</Label>
								<div class="flex w-full flex-wrap items-center gap-x-4 gap-y-1">
									{#each place.orbit.satellites as satelite (satelite.name)}
										<span class="flex min-w-0 items-center gap-2">
											<Icon
												name={satelite.icon}
												weight="bold"
												size="0.7rem"
												class="shrink-0 text-text-muted"
											/>
											<span class="truncate text-1 text-text-body">{satelite.name}</span>
										</span>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</div>
			</TitledPanel>
		</div>
	{/if}

	{#if place.field.scannable}
		<div class="w-full min-w-0 flex-[2_1_0]">
			<TitledPanel title="Campo de rocas" detail={place.name} class="w-full">
				<!--
					**La figura de esta pantalla, arriba de todo.** La lista de abajo dice
					qué tiene cada piedra; el dibujo dice cómo es el campo —cuántas hay,
					qué les queda y cuánto conocés—, que es la pregunta que uno se hace al
					llegar: si vale la pena quedarse.
				-->
				<div class="mb-3 w-full border-b border-border-soft pb-3">
					<BeltField asteroids={place.asteroids} />
				</div>

				<!--
					El instrumento y el campo, una sola vez arriba: cuántas rocas hay, qué
					lectura sacaría el escáner montado y cuánto tarda. Repetirlo en cada
					piedra sería decir ocho veces lo mismo.
				-->
				<div
					class="mb-3 flex w-full flex-wrap items-center gap-x-3 gap-y-2 border-b border-border-soft pb-3"
				>
					<Icon
						name="binoculars"
						weight="duotone"
						size="1rem"
						class={place.field.blocked ? 'text-text-muted' : 'text-accent'}
					/>
					<span class="font-mono text-[0.78rem] text-data">{place.field.count}</span>
					<span class="flex items-baseline gap-2">
						<Label>Lectura</Label>
						<span class="font-display text-1 tracking-label text-accent-dim uppercase">
							{place.field.depthLabel}
						</span>
					</span>
					<span class="flex items-baseline gap-2">
						<Label>Duración</Label>
						<span class="font-mono text-[0.78rem] text-accent-bright">{place.field.duration}</span>
					</span>
					{#if place.field.regen}
						<span class="flex items-baseline gap-2">
							<Label>Reposición</Label>
							<span class="font-mono text-[0.78rem] text-data">{place.field.regen}</span>
						</span>
					{/if}

					<div class="grow"></div>

					{#if place.field.blocked}
						<span class="text-1 text-text-muted">{place.field.blocked}</span>
					{/if}
				</div>

				{#if form?.error}
					<div
						class="mb-3 flex w-full flex-wrap items-center gap-[0.4rem] border border-danger
							bg-danger-wash px-[0.6rem] py-2"
					>
						<Icon name="warning" weight="fill" size="0.85rem" class="text-danger" />
						<span class="text-1 text-danger">{form.error}</span>
					</div>
				{/if}

				<div class="flex w-full flex-col gap-3">
					{#each place.asteroids as roca (roca.id)}
						<div
							class="flex w-full flex-col gap-2 border border-l-[3px] px-[0.7rem] py-[0.7rem]
								{roca.blocked
								? 'border-border-soft border-l-border-soft bg-transparent'
								: 'border-border-soft border-l-data bg-surface'}"
						>
							<div class="flex w-full flex-wrap items-baseline gap-x-3 gap-y-1">
								<Icon
									name={roca.icon}
									weight={roca.identified ? 'duotone' : 'thin'}
									size="0.95rem"
									class={roca.identified ? 'text-accent' : 'text-text-muted'}
								/>
								<span
									class="font-display text-[0.84rem] font-bold tracking-display uppercase
										{roca.identified ? 'text-text-strong' : 'text-text-muted'}"
								>
									{roca.name}
								</span>
								{#if roca.age}
									<span
										class="font-mono text-[0.75rem] {roca.stale ? 'text-warning' : 'text-data'}"
									>
										{roca.stale ? `lectura vieja · ${roca.age}` : roca.age}
									</span>
								{/if}
								<div class="grow"></div>
								{#if roca.remaining}
									<span class="flex shrink-0 items-baseline gap-2">
										<Label>Restante</Label>
										<span class="font-mono text-[0.78rem] text-accent-bright">{roca.remaining}</span
										>
									</span>
								{/if}
							</div>

							<!-- Cuánto le queda de lo que traía: dice cuán picada está. -->
							{#if roca.remaining}
								<ProgressBar percent={roca.share} />
							{/if}

							<p class="text-1 text-text-muted">{roca.description}</p>

							<div class="flex w-full flex-wrap items-center gap-x-4 gap-y-2">
								{#if roca.blocked}
									<span class="text-1 text-warning">{roca.blocked}</span>
								{:else}
									<span class="flex items-baseline gap-2">
										<Label>Extracción</Label>
										<span class="font-mono text-[0.8rem] text-data">
											{roca.units} u · {roca.volume} m³
										</span>
									</span>
									<span class="flex items-baseline gap-2">
										<Label>Duración</Label>
										<span class="font-mono text-[0.8rem] text-accent-bright">{roca.duration}</span>
									</span>
									<span class="flex items-baseline gap-2">
										<Label>Valor</Label>
										<span class="font-mono text-[0.8rem] text-data">{roca.value} CR</span>
									</span>
								{/if}

								<div class="grow"></div>

								<!--
									Escanear sigue disponible aunque la roca ya esté identificada: el
									campo es de todos y se agota entre todos, así que volver a mirarla
									antes de encender el láser es una decisión válida.
								-->
								<!--
									El aviso **envuelve al botón**: señalarlo dice qué módulo lo permite,
									qué habilidades lo mejoran y qué daría la siguiente. Un ícono de ayuda
									al lado sería otra cosa que tocar, y con dos botones seguidos ni
									siquiera se sabría de cuál habla.

									Lo mismo va adentro del cartel de confirmación, por `source`: en un
									teléfono no hay con qué señalar, y el cartel es la puerta por la que
									pasa toda acción igual.
								-->
								{#if !roca.scanBlocked}
									<ConfirmAction
										formAction="?/escanear"
										title="Escanear {roca.name}"
										icon="binoculars"
										confirmLabel="Escanear"
										readings={[
											{ label: 'Duración', value: place.field.duration },
											{ label: 'Lectura', value: place.field.depthLabel }
										]}
										note="Mientras dure no vas a poder dar otra orden. La lectura deja experiencia de Ciencias."
										source={place.field.scanSource}
									>
										{#snippet trigger(abrir)}
											<ActionSource source={place.field.scanSource}>
												<HudButton type="button" size="1" onclick={abrir}>
													<Icon name="binoculars" weight="bold" size="0.75rem" />
													{roca.age ? 'Volver a escanear' : 'Escanear'}
												</HudButton>
											</ActionSource>
										{/snippet}
										{#snippet fields()}
											<input type="hidden" name="roca" value={roca.id} />
										{/snippet}
									</ConfirmAction>
								{/if}

								{#if !roca.blocked}
									<ConfirmAction
										formAction="?/minar"
										title="Extraer {roca.name}"
										icon="diamond"
										confirmLabel="Empezar"
										readings={[
											{ label: 'Extraés', value: `${roca.units} u · ${roca.volume} m³` },
											{ label: 'Duración', value: roca.duration },
											{ label: 'Vale', value: `${roca.value} CR` }
										]}
										note="Mientras dure la extracción no vas a poder dar otra orden."
										source={place.field.mineSource}
									>
										{#snippet trigger(abrir)}
											<ActionSource source={place.field.mineSource}>
												<HudButton type="button" size="1" onclick={abrir}>
													<Icon name="diamond" weight="bold" size="0.75rem" />
													Extraer
												</HudButton>
											</ActionSource>
										{/snippet}
										{#snippet fields()}
											<input type="hidden" name="roca" value={roca.id} />
										{/snippet}
									</ConfirmAction>
								{/if}
							</div>
						</div>
					{:else}
						<p class="text-1 text-text-muted">
							El campo está pelado: alguien se llevó hasta la última roca. Van a aparecer otras,
							pero hay que darle tiempo.
						</p>
					{/each}
				</div>
			</TitledPanel>
		</div>
	{/if}

	<!--
		La ficha del lugar: qué es, dónde está y quién lo opera. En la columna
		angosta las lecturas van apiladas: es la misma pieza que en la pestaña
		Sistema, pero acá tiene un tercio del ancho.

		**En tránsito no se dibuja.** No hay lugar del que dar ficha, así que sus
		cinco lecturas salen vacías y el panel queda diciendo «Órbita a: nada,
		Distancia: nada». El tramo de arriba ya cuenta todo lo que hay para contar.

		**En una puerta tampoco.** Una puerta no es un lugar donde se hace algo: es
		el salto que sigue, y eso lo cuenta entero el panel de al lado. Describirla
		como a cualquier cuerpo —tipo, órbita, distancia al sol— es contestar una
		pregunta que nadie hizo mientras se tapa la que sí.
	-->
	{#if !place.inTransit && !place.gate}
		<div class="w-full min-w-0 flex-[1_1_0]">
			{#if place.isStation}
				<!--
					**Una estación contesta tres preguntas y no una**, y las tres son listas
					largas que no entran juntas en una columna fina: qué es este lugar,
					quién atiende acá y quién más está parado acá. Apiladas, la ficha
					quedaba arriba de todo y a los pilotos había que buscarlos scrolleando.

					Los agentes se mudaron acá desde la columna ancha por lo mismo: son una
					lista de gente, igual que los pilotos, y estaban del otro lado de la
					pantalla que sus pares.
				-->
				<Panel class="w-full">
					<PanelTabs tabs={solapas} bind:active={solapa} />

					<div class="w-full pt-4">
						{#if solapa === 'ficha'}
							{@render ficha()}

							<div class="mt-4 w-full border-t border-border-soft pt-4">
								<Label>Operador</Label>
								<div class="mt-2 flex w-full flex-col items-start gap-2">
									<!--
										Y quién opera el puerto abre su ficha: qué es, qué piensa de vos y
										qué otros puestos tiene. Estar parado en una estación es el momento
										exacto en que eso importa.
									-->
									{#if place.corporationCode}
										<a
											href={hrefFicha(page.url, 'corporacion', place.corporationCode)}
											class="underline decoration-dotted underline-offset-[0.2rem]
												hover:text-accent-bright"
										>
											<HudValue>{place.corporation}</HudValue>
										</a>
									{:else}
										<HudValue>{place.corporation}</HudValue>
									{/if}
									<div class="flex flex-wrap items-center gap-[0.4rem]">
										<Label>{place.corporationKind}</Label>
										<span class="text-accent-dim">·</span>
										<Label>{place.owner}</Label>
									</div>
								</div>
							</div>
						{:else if solapa === 'agentes'}
							{#if place.agents.length}
								<div class="flex w-full flex-col gap-3">
									{#each place.agents as agent (agent.code)}
										<AgentCard {agent} />
									{/each}
								</div>
							{:else}
								<!-- Hacen falta Contactos para recibir a alguien. -->
								<p class="text-1 text-text-muted">
									Acá no atiende nadie. Esta estación no tiene Contactos, que es el módulo que hace
									falta para alojar agentes.
								</p>
							{/if}
						{:else if place.pilots.length}
							<!--
								Quién más está atracado. **Un puerto es público**: quien atraca
								acepta que lo vean, y de eso vive un hub. En espacio abierto esta
								lista no existe y va a haber que escanear.
							-->
							<div class="flex w-full flex-col gap-3">
								{#each place.pilots as piloto (piloto.callsign)}
									<div
										class="flex w-full min-w-0 items-center gap-3 border border-border-soft
											bg-surface p-[0.6rem]"
									>
										<Identicon
											name={piloto.callsign}
											family="piloto"
											size="2.25rem"
											title="Sello de {piloto.callsign}"
											class="shrink-0"
										/>
										<div class="flex min-w-0 flex-col items-start gap-[0.15rem]">
											<!-- El distintivo abre su ficha: quién es el que está parado al lado. -->
											<a
												href={hrefFicha(page.url, 'piloto', piloto.callsign)}
												class="truncate font-display text-2 tracking-display text-text-strong
													no-underline hover:text-accent-bright"
											>
												{piloto.callsign}
											</a>
											<span class="truncate text-[0.68rem] text-text-muted">
												{piloto.corporation || 'Independiente'}
											</span>
											<span
												class="truncate text-[0.62rem] tracking-label uppercase"
												style="color: {piloto.factionColor}"
											>
												{piloto.faction}
											</span>
										</div>
										<div class="grow"></div>
										<!--
											Lo único que se puede hacer hoy con alguien que está al lado.
											Agregarlo a contactos y comerciar llegan cuando existan; un
											botón que no hace nada es peor que no ofrecerlo.
										-->
										<HudLink
											href="/mensajes?para={encodeURIComponent(piloto.callsign)}"
											variant="outline"
											size="1"
											class="shrink-0"
										>
											<Icon name="envelope-simple" weight="bold" size="0.7rem" />
											<span class="hidden xs:inline">Escribirle</span>
										</HudLink>
									</div>
								{/each}

								{#if place.pilotsBeyond > 0}
									<p class="text-1 text-text-muted">y {place.pilotsBeyond} más.</p>
								{/if}
							</div>
						{:else}
							<p class="text-1 text-text-muted">
								No hay nadie más atracado acá. Los puertos grandes juntan gente; éste, por ahora, es
								todo tuyo.
							</p>
						{/if}
					</div>
				</Panel>
			{:else}
				<TitledPanel title="Ficha del lugar" class="w-full">
					{@render ficha()}
				</TitledPanel>
			{/if}
		</div>
	{/if}
</div>

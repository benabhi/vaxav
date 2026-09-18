<!--
	El constructor de un sistema.

	La forma sale de lo que ya se aprendió en la vista de la nave: **dos columnas
	de alto fijo y una fila abajo**. A la izquierda el árbol, que es la figura de
	la pantalla y lo que se mira todo el tiempo; a la derecha el banco de trabajo,
	que cambia según qué se haya elegido; abajo las puertas, que son del sistema
	entero y no de ningún cuerpo en particular.

	El alto fijo no es capricho: sin él, elegir una estación con siete módulos
	estira la columna derecha al doble que la izquierda y el árbol —que es lo que
	se estaba mirando— se va de la pantalla. Cada columna se desplaza por dentro.

	El árbol es **el mismo `TreeBranch`** que dibuja la vista de sistema del juego.
	Lo que cambia es qué dice cada fila: ahí, a qué distancia está y cuánto tarda
	llegar; acá, de qué cuelga y qué lo retiene.
-->
<script lang="ts">
	import { submitting } from '$lib/forms.svelte';
	import Icon from '$lib/components/Icon.svelte';
	import GateRose from '$lib/components/admin/GateRose.svelte';
	import SelectField from '$lib/components/forms/SelectField.svelte';
	import HudButton from '$lib/components/buttons/HudButton.svelte';
	import Panel from '$lib/components/cards/Panel.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import ErrorCallout from '$lib/components/forms/ErrorCallout.svelte';
	import TextField from '$lib/components/forms/TextField.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import Label from '$lib/components/typography/Label.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import TreeBranch from '$lib/components/ui/TreeBranch.svelte';
	import { ADMIN_ROUTE } from '$lib/admin';
	import {
		ATMOSPHERES,
		BODY_CLASSES,
		STAR_CLASSES,
		suggestedBodyName,
		type BodyKind
	} from '$lib/game/universe';
	import { atmosphereLabel, bodyClassLabel, starClassLabel } from '$lib/format';
	import type { FilaConstruccion } from '$lib/tipos';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	/**
	 * Un solo control de envío para toda la pantalla.
	 *
	 * Compartido a propósito: son formularios que escriben sobre la misma fila,
	 * y dos envíos en paralelo pueden pisarse. Mientras uno viaja, los demás
	 * botones se apagan.
	 */
	const envio = submitting();

	let sistema = $derived(data.constructor);
	let opciones = $derived(sistema.options);

	/**
	 * Qué se está tocando: un cuerpo del árbol, o el sistema mismo.
	 *
	 * Vive en el navegador y no en la URL porque es estado de interfaz: elegir una
	 * fila no cambia la partida ni es algo que uno quiera citar con un enlace.
	 */
	let elegido = $state<number | null>(null);
	let cuerpo = $derived(sistema.bodies.find((uno) => uno.id === elegido) ?? null);

	// Al recargar después de guardar, el cuerpo elegido puede haber desaparecido.
	$effect(() => {
		if (elegido !== null && !sistema.bodies.some((uno) => uno.id === elegido)) elegido = null;
	});

	/**
	 * Qué formulario está abierto en la columna derecha.
	 *
	 * `raiz` es el alta de otra estrella: un sistema binario tiene dos soles y cada
	 * uno cuelga lo suyo. Va aparte de `agregar` porque lo nuevo no orbita nada, y
	 * mezclarlas obligaría a un «de qué cuelga: de nada» que no se entiende.
	 */
	let modo = $state<'ficha' | 'agregar' | 'raiz' | 'sistema'>('ficha');

	/** Lo que el formulario de alta tiene cargado. */
	let nuevoTipo = $state('planet');
	let nuevoRumbo = $state('n');
	let nuevoNombre = $state('');
	/** Si alguien ya escribió en el nombre: desde ahí, la sugerencia no lo pisa. */
	let nombreTocado = $state(false);

	/** Los rumbos que todavía están libres. */
	let libres = $derived(sistema.bearings.filter((uno) => !uno.taken));

	/** De qué cuerpo colgaría lo nuevo: de lo elegido, o de la estrella. */
	let padre = $derived(cuerpo ?? sistema.bodies[0] ?? null);

	/** Qué puede colgar de ahí. En la raíz, lo que se planta sin orbitar nada. */
	let admitidos = $derived(modo === 'raiz' ? sistema.rootKinds : (padre?.accepts ?? []));

	// El tipo elegido tiene que ser uno de los que el padre admite: al cambiar de
	// fila, el que estaba puesto puede dejar de tener sentido.
	$effect(() => {
		if (admitidos.length > 0 && !admitidos.some((uno) => uno.value === nuevoTipo)) {
			nuevoTipo = admitidos[0].value;
		}
	});

	/**
	 * El nombre que le tocaría a lo que se está por crear.
	 *
	 * Es **una sugerencia y no una imposición**: sale de la nomenclatura del
	 * sistema —`Ánfora III`, `Ánfora III-a`, `Anillos de Ánfora III`— y se pisa
	 * escribiendo encima. Una estación no recibe ninguna: lleva nombre propio,
	 * porque la construyó alguien y la bautizó.
	 *
	 * Los hermanos se cuentan **por tipo**: las lunas se numeran entre lunas, así
	 * que un planeta con un cinturón y dos lunas propone `-c` para la tercera.
	 */
	let sugerido = $derived.by(() => {
		const enRaiz = modo === 'raiz';
		if (!enRaiz && !padre) return '';

		const hermanos = sistema.bodies.filter(
			(uno) =>
				uno.kind === nuevoTipo && (enRaiz ? uno.parentId === null : uno.parentId === padre?.id)
		).length;

		return suggestedBodyName(nuevoTipo as BodyKind, {
			systemName: sistema.name,
			parentName: enRaiz ? undefined : padre?.name,
			siblings: hermanos,
			bearingName: sistema.bearings.find((uno) => uno.value === nuevoRumbo)?.label
		});
	});

	// Mientras nadie haya escrito, el campo sigue a la sugerencia: cambiar el tipo
	// de «planeta» a «luna» tiene que cambiar el nombre propuesto.
	$effect(() => {
		if (!nombreTocado) nuevoNombre = sugerido;
	});

	let borrarSistema = $state(false);
	let vecinoDe = $state<number | null>(null);

	/**
	 * Los tres campos del sistema que se leen entre sí.
	 *
	 * Son `$derived` **escribibles**: arrancan en lo que hay guardado y se pisan
	 * al tocarlos. Es lo que hace que abrir la ficha muestre el sistema de verdad
	 * y no lo que quedó de la última vez que se la abrió, sin un efecto que copie
	 * valores a mano.
	 */
	let government = $derived(sistema.government);
	let faction = $derived(sistema.controllingFaction);

	let banda = $derived(
		opciones.governments.find((uno) => uno.value === government) ?? opciones.governments[0]
	);
	let minimo = $derived(faction ? banda.min : banda.freeMin);
	let maximo = $derived(faction ? banda.max : banda.freeMax);

	/**
	 * La seguridad, acotada a la banda que dejan el gobierno y el dueño elegidos.
	 *
	 * Al mover cualquiera de los dos, el número puede quedar afuera; se lo trae al
	 * borde más cercano en vez de resetearlo, así lo que se pretendía —«lo más
	 * seguro posible»— se conserva.
	 */
	let security = $derived(Math.min(Math.max(sistema.security, minimo), maximo));

	/**
	 * Los dos estados en que puede estar un cuerpo para el mundo.
	 *
	 * Lo normal va primero porque es lo que se elige casi siempre: un sistema se
	 * arma con lo que se ve, y lo escondido es la excepción que alguien pone a
	 * propósito.
	 */
	const CONOCIMIENTO = [
		{ value: 'si', label: 'Ya descubierto' },
		{ value: 'no', label: 'Hay que explorarlo' }
	];

	/**
	 * Los atributos que reemplazaron a la descripción escrita a mano.
	 *
	 * El constructor ya no pide un párrafo: pide **de qué está hecho** el cuerpo,
	 * y la frase que ve el jugador se arma sola con eso. Un campo de texto libre
	 * significaba escribir mil descripciones para doscientos sistemas, y que cada
	 * una quedara vieja en cuanto alguien tocara un número.
	 *
	 * Cada lista empieza con «sin definir» porque no siempre corresponde: un
	 * cinturón no tiene composición y una estrella no tiene atmósfera.
	 */
	const SIN_DEFINIR = { value: '', label: 'Sin definir' };
	const COMPOSICION = [
		SIN_DEFINIR,
		...BODY_CLASSES.map((una) => ({ value: una, label: bodyClassLabel(una) }))
	];
	const ATMOSFERA = [
		SIN_DEFINIR,
		...ATMOSPHERES.map((una) => ({ value: una, label: atmosphereLabel(una) }))
	];
	const ESPECTRO = [
		SIN_DEFINIR,
		...STAR_CLASSES.map((una) => ({ value: una, label: starClassLabel(una) }))
	];

	/** Sólo un planeta o una luna tienen de qué estar hechos. */
	function esMundo(kind: string): boolean {
		return kind === 'planet' || kind === 'moon';
	}

	/** Elegir una fila abre su ficha: es lo que uno quiere el noventa por ciento de las veces. */
	function elegir(uno: FilaConstruccion) {
		elegido = elegido === uno.id ? null : uno.id;
		modo = 'ficha';
	}
</script>

<svelte:head><title>{sistema.name} · Universo · Vaxav</title></svelte:head>

<div class="flex w-full flex-wrap items-end justify-between gap-4">
	<div class="flex flex-col items-start gap-1">
		<a
			href="{ADMIN_ROUTE}/universo"
			class="flex items-center gap-2 text-accent-dim no-underline hover:text-accent-bright"
		>
			<Icon name="caret-left" weight="bold" size="0.6rem" />
			<Eyebrow>{sistema.region} · {sistema.constellation}</Eyebrow>
		</a>
		<DisplayTitle>{sistema.name}</DisplayTitle>
	</div>

	<div class="flex flex-wrap items-center gap-3">
		<HudButton onclick={() => (modo = modo === 'sistema' ? 'ficha' : 'sistema')}>
			<Icon name="gear-six" weight="bold" size="0.75rem" />
			Datos del sistema
		</HudButton>
		<HudButton
			variant="danger"
			disabled={sistema.blockers.length > 0}
			title={sistema.blockers.join(' ')}
			onclick={() => (borrarSistema = true)}
		>
			<Icon name="warning" weight="bold" size="0.75rem" />
			Borrar
		</HudButton>
	</div>
</div>

<div class="flex w-full flex-wrap items-start gap-x-6 gap-y-3">
	<div class="flex flex-col items-start gap-1">
		<Label>Gobierno</Label>
		<span class="font-display text-[0.8rem] text-text-strong">{sistema.governmentLabel}</span>
	</div>
	<div class="flex flex-col items-start gap-1">
		<Label>Seguridad</Label>
		<span class="font-mono text-[0.9rem] text-data">
			{sistema.security} · {sistema.securityLevel}
		</span>
	</div>
	<div class="flex flex-col items-start gap-1">
		<Label>Control</Label>
		<span class="flex items-center gap-2 font-display text-[0.8rem] text-text-strong">
			{sistema.controlledBy}
			{#if sistema.capitalOf}
				<span class="flex" title="Capital de la facción">
					<Icon name="crown-simple" weight="fill" size="0.7rem" class="text-warning" />
				</span>
			{/if}
		</span>
	</div>
	<div class="grow"></div>
	<div class="flex flex-col items-start gap-1">
		<Label>Coordenadas</Label>
		<span class="font-mono text-[0.9rem] text-text-body">
			{sistema.x} · {sistema.y} · {sistema.z}
		</span>
	</div>
</div>

<ErrorCallout message={form?.error} />

<!--
	Las dos columnas. El alto se fija recién en `md` —992 px—: más abajo hay una
	sola columna y encerrar el árbol en 28 rem sería quitarle la pantalla entera
	para ganar nada.
-->
<div class="flex w-full flex-col gap-5 md:h-[34rem] md:flex-row md:items-stretch">
	<!--
		Las dos columnas miden lo mismo. No es simetría por gusto: son las dos cosas
		que uno mira alternando —qué hay y qué le estoy cambiando— y una más ancha
		que la otra dice que una importa más, que acá no es cierto. Además el árbol
		crece con la profundidad —cada nivel come dos rem de sangría— así que le
		viene bien todo el ancho que pueda tener.
	-->
	<div class="flex w-full min-w-0 flex-1 flex-col md:h-full">
		<TitledPanel
			title="Cuerpos"
			detail="distancia a lo que orbitan"
			class="flex min-h-0 w-full flex-col md:h-full"
		>
			<div class="min-h-0 w-full grow overflow-y-auto">
				{#each sistema.bodies as fila (fila.id)}
					<!--
						La fila entera es un botón y no un `div` que escucha clics: acá no hay
						flecha de plegar ni ninguna otra cosa que se pueda enfocar, así que
						elegir un cuerpo es **la única** acción de la fila. Con un `div` no se
						llega con el teclado y un lector de pantalla no la anuncia.
					-->
					<button
						type="button"
						aria-pressed={elegido === fila.id}
						class="relative block w-full cursor-pointer border-l-[3px] px-[0.5rem] py-0 text-left
							transition-[background-color,border-color]
							{elegido === fila.id
							? 'border-l-accent bg-surface-strong'
							: 'border-l-transparent bg-transparent hover:border-l-border hover:bg-surface-hover'}"
						onclick={() => elegir(fila)}
					>
						<TreeBranch
							depth={fila.depth}
							rails={fila.rails}
							isLast={fila.isLast}
							hasChildren={fila.hasChildren}
							expanded={true}
							icon={fila.icon}
							filled={elegido === fila.id}
						>
							<div class="flex min-h-[2.25rem] w-full flex-nowrap items-center gap-2">
								<!--
									Crece y cede al final, al revés que en la vista del juego: allá hay
									cuatro columnas de datos que proteger y el nombre cede primero;
									acá la única columna es la distancia, así que lo que sobra es del
									nombre. «Anillos de Ánfora III» no entra en cinco rem y es
									justamente el que uno está leyendo.
								-->
								<span
									class="min-w-0 flex-1 overflow-hidden font-display text-[0.85rem] font-bold
										tracking-display text-ellipsis whitespace-nowrap uppercase
										{elegido === fila.id ? 'text-accent-bright' : 'text-text-strong'}"
									title={fila.name}
								>
									{fila.name}
								</span>

								<!--
									La puerta dice adónde va acá mismo y no en su ficha: es el dato
									que uno recorre cuando revisa si el sistema quedó bien atado.
								-->
								{#if fila.gate}
									<span
										class="flex shrink-0 items-center gap-1 border px-[0.35rem] py-[0.1rem]
											{fila.gate.destination ? 'border-border-soft text-accent-dim' : 'border-warning text-warning'}"
									>
										<Icon name="arrow-circle-right" weight="bold" size="0.6rem" />
										<span class="font-mono text-[0.6rem] whitespace-nowrap">
											{fila.gate.bearingLabel}{fila.gate.destinationSystem
												? ` → ${fila.gate.destinationSystem}`
												: ' · suelta'}
										</span>
									</span>
								{/if}

								<!--
									Sin columna de tipo: el ícono ya lo dice, y la etiqueta le comía
									cuatro rem y medio al nombre en una columna de veintiséis. El tipo
									se lee igual al abrir la ficha.
								-->
								<!--
									El número es la **distancia a lo que orbita**, que es el dato
									guardado. Lleva su unidad porque un número pelado acá se confunde
									con la distancia que muestra el juego, que se mide desde donde está
									parado el piloto y es otra cosa.
								-->
								<span
									class="ml-auto w-[4.5rem] shrink-0 text-right font-mono text-[0.7rem] text-data"
									title="Distancia a {fila.parentId === null
										? 'la raíz del sistema'
										: 'lo que orbita'}"
								>
									{fila.orbitDistance > 0 ? `${fila.orbitDistance} ud` : ''}
								</span>
							</div>
						</TreeBranch>
					</button>
				{/each}
			</div>

			<div class="mt-3 flex shrink-0 flex-wrap items-center gap-2">
				<HudButton
					variant="primary"
					disabled={(padre?.accepts ?? []).length === 0}
					onclick={() => {
						modo = 'agregar';
						nombreTocado = false;
					}}
				>
					<Icon name="check" weight="bold" size="0.75rem" />
					{padre && padre.id === elegido ? `Colgar de ${padre.name}` : 'Agregar un cuerpo'}
				</HudButton>

				<!--
					Otra estrella, en la raíz. Un sistema binario tiene dos soles y de cada
					uno cuelga lo suyo; el árbol ya sabía dibujar varias raíces desde el
					principio, lo que faltaba era poder crearlas.
				-->
				<HudButton
					onclick={() => {
						modo = 'raiz';
						nuevoTipo = 'star';
						nombreTocado = false;
					}}
				>
					<Icon name="sun" weight="bold" size="0.75rem" />
					Otra estrella
				</HudButton>
			</div>
		</TitledPanel>
	</div>

	<!-- El banco de trabajo: lo que se pueda hacer con lo que esté elegido. -->
	<div class="flex w-full min-w-0 flex-1 flex-col md:h-full">
		<TitledPanel
			title={modo === 'sistema'
				? 'Datos del sistema'
				: modo === 'raiz'
					? 'Agregar una estrella'
					: modo === 'agregar'
						? 'Agregar un cuerpo'
						: (cuerpo?.name ?? 'Nada elegido')}
			detail={modo === 'ficha' && cuerpo ? cuerpo.kindLabel : ''}
			class="flex min-h-0 w-full flex-col md:h-full"
		>
			<div class="min-h-0 w-full grow overflow-y-auto pr-1">
				{#if modo === 'sistema'}
					<form
						method="POST"
						action="?/sistema"
						use:envio.enhance
						class="flex w-full flex-col gap-5"
					>
						<TextField label="Nombre" name="name" value={sistema.name} required />
						<SelectField
							label="Constelación"
							name="constellationId"
							options={opciones.constellations}
							value={String(sistema.constellationId)}
						/>

						<div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
							<SelectField
								label="Facción"
								name="controllingFaction"
								options={opciones.factions}
								bind:value={faction}
							/>
							<SelectField
								label="Gobierno"
								name="government"
								options={opciones.governments.map((uno) => ({
									value: uno.value,
									label: uno.label
								}))}
								bind:value={government}
							/>
						</div>

						<div class="flex w-full flex-col items-start gap-2">
							<Label>Seguridad</Label>
							<div class="flex w-full items-center gap-4">
								<input
									name="security"
									type="range"
									min={minimo}
									max={maximo}
									bind:value={security}
									class="h-[2.15rem] w-full cursor-pointer accent-[var(--color-accent)]"
								/>
								<span class="w-[3rem] shrink-0 text-right font-mono text-3 text-data">
									{security}
								</span>
							</div>
							<p class="text-1 text-text-muted">
								{faction
									? `Con ese gobierno va de ${minimo} a ${maximo}.`
									: `Sin dueño, de ${minimo} a ${maximo}: el piso del gobierno no lo sostiene nadie.`}
							</p>
						</div>

						{#if faction}
							<label class="flex w-full cursor-pointer items-center gap-3">
								<input
									type="checkbox"
									name="capital"
									checked={Boolean(sistema.capitalOf)}
									class="h-4 w-4 shrink-0 accent-[var(--color-accent)]"
								/>
								<span
									class="font-display text-[0.75rem] font-semibold tracking-display text-text-strong uppercase"
								>
									Es el sistema principal de la facción
								</span>
							</label>
						{/if}

						<div class="grid w-full grid-cols-3 gap-3"></div>

						<HudButton type="submit" busy={envio.busy} variant="primary">Guardar</HudButton>
					</form>
				{:else if (modo === 'agregar' && padre) || modo === 'raiz'}
					<form
						method="POST"
						action="?/cuerpo"
						use:envio.enhance
						class="flex w-full flex-col gap-5"
					>
						<input type="hidden" name="parentId" value={modo === 'raiz' ? 0 : (padre?.id ?? 0)} />

						<p class="text-1 text-text-muted">
							{#if modo === 'raiz'}
								Va en la raíz del sistema, sin orbitar nada. De ella pueden colgar planetas,
								cinturones, estaciones y puertas.
							{:else}
								Va a orbitar <span class="text-accent-bright">{padre?.name}</span>.
							{/if}
						</p>

						<SelectField label="Qué es" name="kind" options={admitidos} bind:value={nuevoTipo} />

						<!--
							El rumbo sólo aparece para una puerta, y sólo ofrece los libres: la
							base no deja dos salidas del mismo lado, y ofrecerlas sería
							ofrecer un error.
						-->
						{#if nuevoTipo === 'gate'}
							{#if libres.length === 0}
								<BodyText>
									Los ocho rumbos están ocupados. Para agregar otra salida hay que sacar una.
								</BodyText>
							{:else}
								<SelectField
									label="Por qué lado sale"
									name="bearing"
									options={libres.map((uno) => ({ value: uno.value, label: uno.label }))}
									bind:value={nuevoRumbo}
									hint="Es lo que va a decidir por qué borde sale la línea en el mapa de la galaxia."
								/>
							{/if}
						{/if}

						<TextField
							label="Nombre"
							name="name"
							bind:value={nuevoNombre}
							oninput={() => (nombreTocado = true)}
							required
							placeholder={nuevoTipo === 'station' ? 'Muelle Largo' : ''}
							hint={nuevoTipo === 'station'
								? 'Las estaciones llevan nombre propio: la construyó alguien y la bautizó.'
								: 'Viene propuesto con la nomenclatura del sistema. Escribí encima para cambiarlo.'}
						/>

						<TextField
							label="Distancia orbital"
							name="orbitDistance"
							type="number"
							min="0"
							value="0"
							hint="En unidades del juego, desde lo que orbita. De acá sale el tiempo de viaje."
						/>

						<!--
							De qué está hecho, que es lo que arma su descripción. Sólo aparece lo
							que corresponde al tipo: ofrecerle atmósfera a un cinturón sería
							ofrecer un dato imposible, y el servicio lo rechaza igual.
						-->
						{#if esMundo(nuevoTipo)}
							<SelectField label="Composición" name="bodyClass" options={COMPOSICION} />
							<SelectField label="Atmósfera" name="atmosphere" options={ATMOSFERA} />
						{:else if nuevoTipo === 'star'}
							<SelectField
								label="Clase espectral"
								name="starClass"
								options={ESPECTRO}
								hint="De acá sale el clima de todo el sistema: la zona templada de una enana roja está mucho más cerca que la de una amarilla."
							/>
						{/if}

						<SelectField label="Descubrimiento" name="explored" options={CONOCIMIENTO} />

						<div class="flex items-center gap-3">
							<HudButton
								type="submit"
								busy={envio.busy}
								variant="primary"
								disabled={nuevoTipo === 'gate' && libres.length === 0}
							>
								Agregar
							</HudButton>
							<HudButton variant="ghost" onclick={() => (modo = 'ficha')}>Cancelar</HudButton>
						</div>
					</form>
				{:else if cuerpo}
					<div class="flex w-full flex-col gap-5">
						<form
							method="POST"
							action="?/editar"
							use:envio.enhance
							class="flex w-full flex-col gap-4"
						>
							<input type="hidden" name="bodyId" value={cuerpo.id} />
							<input type="hidden" name="kind" value={cuerpo.kind} />
							<input type="hidden" name="parentId" value={cuerpo.parentId ?? 0} />

							<TextField label="Nombre" name="name" value={cuerpo.name} required />
							<TextField
								label="Distancia orbital"
								name="orbitDistance"
								type="number"
								min="0"
								value={String(cuerpo.orbitDistance)}
							/>
							{#if esMundo(cuerpo.kind)}
								<SelectField
									label="Composición"
									name="bodyClass"
									options={COMPOSICION}
									value={cuerpo.bodyClass}
								/>
								<SelectField
									label="Atmósfera"
									name="atmosphere"
									options={ATMOSFERA}
									value={cuerpo.atmosphere}
								/>
							{:else if cuerpo.kind === 'star'}
								<SelectField
									label="Clase espectral"
									name="starClass"
									options={ESPECTRO}
									value={cuerpo.starClass}
									hint="De acá sale el clima de todo el sistema."
								/>
							{/if}

							<!--
								Con los dos estados nombrados y no como casilla: de una casilla
								«figura en las cartas» hay que **deducir** qué significa no marcarla,
								y las dos lecturas posibles —«no existe» y «hay que encontrarlo»— son
								muy distintas.

								Es estado del **mundo**, no de cada piloto: que cada uno lleve su
								propio registro de qué descubrió es otra tabla, y llega con la
								cartografía.
							-->
							<SelectField
								label="Descubrimiento"
								name="explored"
								options={CONOCIMIENTO}
								value={cuerpo.explored ? 'si' : 'no'}
							/>

							<HudButton type="submit" busy={envio.busy} variant="primary">Guardar</HudButton>
						</form>

						<!-- La estación: quién la opera y qué módulos tiene. -->
						{#if cuerpo.kind === 'station'}
							<form
								method="POST"
								action="?/estacion"
								use:envio.enhance
								class="flex w-full flex-col gap-4 border-t border-border-soft pt-5"
							>
								<input type="hidden" name="bodyId" value={cuerpo.id} />

								<SelectField
									label="Corporación que la opera"
									name="corporation"
									options={opciones.corporations}
								/>

								<div class="flex w-full flex-col gap-2">
									<Label>Módulos</Label>
									<div class="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
										{#each opciones.services as servicio (servicio.value)}
											<label class="flex cursor-pointer items-center gap-2">
												<input
													type="checkbox"
													name="services"
													value={servicio.value}
													checked={cuerpo.services.includes(servicio.label)}
													class="h-4 w-4 shrink-0 accent-[var(--color-accent)]"
												/>
												<span class="text-1 text-text-body">{servicio.label}</span>
											</label>
										{/each}
									</div>
								</div>

								<HudButton type="submit" busy={envio.busy} variant="primary"
									>Guardar la estación</HudButton
								>
							</form>
						{/if}

						<!-- El cinturón: qué se saca de él, cuánto aguanta y a qué ritmo se rehace. -->
						{#if cuerpo.kind === 'belt'}
							<form
								method="POST"
								action="?/minerales"
								use:envio.enhance
								class="flex w-full flex-col gap-3 border-t border-border-soft pt-5"
							>
								<input type="hidden" name="bodyId" value={cuerpo.id} />
								<Label>Minerales</Label>

								{#each opciones.ores as mineral (mineral.value)}
									{@const actual = cuerpo.ores.find((uno) => uno.ore === mineral.value)}
									<div class="flex w-full items-center gap-2">
										<label class="flex w-[9rem] shrink-0 cursor-pointer items-center gap-2">
											<input
												type="checkbox"
												name="ore"
												value={mineral.value}
												checked={Boolean(actual)}
												class="h-4 w-4 shrink-0 accent-[var(--color-accent)]"
											/>
											<span class="truncate text-1 text-text-body">{mineral.label}</span>
										</label>
										<input
											name="capacity"
											type="number"
											min="1"
											value={actual?.capacity ?? 10000}
											title="Tope"
											class="h-[2.15rem] w-full min-w-0 border border-border-soft bg-field px-2
												font-mono text-[0.75rem] text-text-strong focus:border-accent focus:outline-none"
										/>
										<input
											name="regen"
											type="number"
											min="0"
											value={actual?.regenPerHour ?? 100}
											title="Reposición por hora"
											class="h-[2.15rem] w-full min-w-0 border border-border-soft bg-field px-2
												font-mono text-[0.75rem] text-text-strong focus:border-accent focus:outline-none"
										/>
									</div>
								{/each}

								<p class="text-1 text-text-muted">
									Tope y reposición por hora. Cambiar el tope no rellena lo que ya se minó.
								</p>

								<HudButton type="submit" busy={envio.busy} variant="primary"
									>Guardar los minerales</HudButton
								>
							</form>
						{/if}

						<!-- Y lo que no se deshace, abajo de todo y con su motivo si no se puede. -->
						<div class="flex w-full flex-col gap-2 border-t border-border-soft pt-5">
							{#if cuerpo.blockers.length > 0}
								<p class="text-1 text-text-muted">{cuerpo.blockers.join(' ')}</p>
							{/if}
							<form method="POST" action="?/borrar" use:envio.enhance>
								<input type="hidden" name="bodyId" value={cuerpo.id} />
								<HudButton
									type="submit"
									busy={envio.busy}
									variant="danger"
									disabled={cuerpo.blockers.length > 0}
								>
									<Icon name="warning" weight="bold" size="0.75rem" />
									Borrar {cuerpo.name}
								</HudButton>
							</form>
						</div>
					</div>
				{:else}
					<div class="flex h-full flex-col items-start justify-center gap-2">
						<BodyText>
							Elegí un cuerpo del árbol para verlo y editarlo, o agregá uno nuevo. Todo lo que
							cuelgue de lo elegido se agrega desde el botón de abajo.
						</BodyText>
					</div>
				{/if}
			</div>
		</TitledPanel>
	</div>
</div>

<!--
	Las puertas, en su propia fila. Son del sistema y no de un cuerpo: preguntarle
	a una luna por las salidas del sistema no tiene sentido, y meterlas en la
	columna derecha las escondería detrás de una elección.
-->
<TitledPanel
	title="Salidas"
	detail={sistema.gates.length === 0
		? 'ninguna'
		: sistema.gates.length === 1
			? '1 puerta'
			: `${sistema.gates.length} puertas`}
	class="w-full"
>
	<div class="flex w-full flex-col items-start gap-6 md:flex-row md:items-start">
		<div class="w-[13rem] shrink-0">
			<GateRose
				bearings={sistema.bearings}
				gates={sistema.gates}
				highlight={modo === 'agregar' && nuevoTipo === 'gate' ? nuevoRumbo : ''}
			/>
		</div>

		<div class="flex w-full min-w-0 flex-col gap-3">
			{#if sistema.gates.length === 0}
				<BodyText>
					Este sistema no tiene salidas. Agregá una puerta desde el árbol, elegile un rumbo, y
					después conectala con otro sistema o creá el vecino desde ella.
				</BodyText>
			{/if}

			{#each sistema.gates as puerta (puerta.gateId)}
				<div
					class="flex w-full flex-wrap items-center gap-3 border-l-[2px] py-2 pl-3
						{puerta.destination ? 'border-l-accent' : 'border-l-warning'}"
				>
					<span class="flex min-w-[10rem] flex-col gap-[0.15rem]">
						<span
							class="font-display text-[0.78rem] font-bold tracking-display text-text-strong uppercase"
						>
							{puerta.name}
						</span>
						<span class="font-mono text-[0.65rem] text-text-muted">{puerta.bearingLabel}</span>
					</span>

					{#if puerta.destination}
						<span class="flex items-center gap-2">
							<Icon name="arrow-circle-right" weight="fill" size="0.9rem" class="text-accent" />
							<span class="text-1 text-text-body">
								{puerta.destinationSystem} · {puerta.destination}
							</span>
							<span class="font-mono text-[0.72rem] text-data">{puerta.jumpDistance} al</span>
							{#if puerta.closed}
								<span
									class="border border-danger px-[0.4rem] py-[0.05rem] font-display text-[0.6rem]
										font-bold tracking-label whitespace-nowrap text-danger uppercase"
								>
									Paso cerrado
								</span>
							{/if}
						</span>

						<div class="ml-auto flex flex-wrap items-center gap-2">
							<!--
								Cerrar no es desconectar: la puerta se queda donde está, sigue
								llevando adonde llevaba, y no se cruza. Es lo que permite aislar un
								sistema sin borrarle las salidas ni moverle la casilla a nadie.
							-->
							<form method="POST" action="?/cerrar" use:envio.enhance>
								<input type="hidden" name="gateId" value={puerta.gateId} />
								<input type="hidden" name="closed" value={puerta.closed ? '0' : '1'} />
								<HudButton type="submit" busy={envio.busy} size="1" variant="ghost">
									<Icon
										name={puerta.closed ? 'arrow-circle-right' : 'x'}
										weight="bold"
										size="0.7rem"
									/>
									{puerta.closed ? 'Reabrir paso' : 'Cerrar paso'}
								</HudButton>
							</form>

							<form method="POST" action="?/desconectar" use:envio.enhance>
								<input type="hidden" name="gateId" value={puerta.gateId} />
								<HudButton type="submit" busy={envio.busy} size="1" variant="ghost">
									Desconectar
								</HudButton>
							</form>
						</div>
					{:else}
						<span class="text-1 text-warning">No lleva a ninguna parte todavía.</span>

						<div class="ml-auto flex flex-wrap items-center gap-2">
							{#if sistema.loose.length > 0}
								<form
									method="POST"
									action="?/conectar"
									use:envio.enhance
									class="flex flex-wrap items-center gap-2"
								>
									<input type="hidden" name="gateId" value={puerta.gateId} />
									<select
										name="otherGateId"
										class="h-[1.75rem] cursor-pointer border border-border-soft bg-field px-2
											font-body text-[0.75rem] text-text-strong focus:border-accent focus:outline-none"
									>
										{#each sistema.loose as suelta (suelta.gateId)}
											<option value={suelta.gateId}>{suelta.label}</option>
										{/each}
									</select>
									<input
										name="jumpDistance"
										type="number"
										min="0"
										value="10"
										title="Distancia de salto, en décimas de año luz"
										class="h-[1.75rem] w-[4.5rem] border border-border-soft bg-field px-2
											font-mono text-[0.72rem] text-text-strong focus:border-accent focus:outline-none"
									/>
									<HudButton type="submit" busy={envio.busy} size="1">Unir</HudButton>
								</form>
							{/if}
							<HudButton size="1" variant="primary" onclick={() => (vecinoDe = puerta.gateId)}>
								Crear el vecino
							</HudButton>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</TitledPanel>

<!--
	Crear el sistema del otro lado desde la puerta: se planta la salida y desde
	ella nace lo que hay enfrente, con su gemela en el rumbo opuesto y las dos ya
	unidas. Es el gesto que uno quiere al armar una galaxia.
-->
<Modal open={vecinoDe !== null} title="Crear el sistema del otro lado" icon="planet" size="lg">
	<form method="POST" action="?/vecino" use:envio.enhance class="flex w-full flex-col gap-5">
		<input type="hidden" name="gateId" value={vecinoDe ?? 0} />

		<BodyText>
			El sistema nuevo nace con su estrella y con una puerta de vuelta en el rumbo opuesto, ya unida
			a ésta.
		</BodyText>

		<TextField label="Nombre" name="name" placeholder="Ocaso" required />
		<SelectField
			label="Constelación"
			name="constellationId"
			options={opciones.constellations}
			value={String(sistema.constellationId)}
			hint="Por omisión, la misma que ésta: las puertas unen vecinos."
		/>

		<div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
			<SelectField label="Facción" name="controllingFaction" options={opciones.factions} />
			<SelectField
				label="Gobierno"
				name="government"
				options={opciones.governments.map((uno) => ({ value: uno.value, label: uno.label }))}
			/>
		</div>

		<div class="grid w-full grid-cols-2 gap-4">
			<TextField
				label="Seguridad"
				name="security"
				type="number"
				min="0"
				max="100"
				value="30"
				hint="Tiene que entrar en la banda del gobierno."
			/>
			<TextField
				label="Distancia de salto"
				name="jumpDistance"
				type="number"
				min="0"
				value="10"
				hint="En décimas de año luz."
			/>
		</div>

		<div class="grid w-full grid-cols-3 gap-3"></div>

		<div class="flex items-center justify-end gap-3">
			<HudButton variant="ghost" onclick={() => (vecinoDe = null)}>Cancelar</HudButton>
			<HudButton type="submit" busy={envio.busy} variant="primary">Crear y unir</HudButton>
		</div>
	</form>
</Modal>

<Modal bind:open={borrarSistema} title="Borrar {sistema.name}" icon="warning">
	<form method="POST" action="?/eliminar" use:envio.enhance class="flex w-full flex-col gap-5">
		<Panel class="w-full border-danger bg-danger-wash">
			<BodyText>
				Se va el sistema entero, con todos sus cuerpos, sus estaciones y sus puertas. No se puede
				deshacer, y el registro va a guardar que fuiste vos.
			</BodyText>
		</Panel>

		<!--
			El nombre va resaltado y fuera de la etiqueta: lo que hay que escribir es
			el dato, y en una etiqueta de una línea se pierde entre el resto de la
			frase justo cuando importa leerlo bien.
		-->
		<p class="text-2 text-text-body">
			Escribí <span class="font-display font-bold text-accent-bright">{sistema.name}</span> para confirmar.
		</p>

		<TextField label="Nombre del sistema" name="confirm" autocomplete="off" required />

		<div class="flex items-center justify-end gap-3">
			<HudButton variant="ghost" onclick={() => (borrarSistema = false)}>Cancelar</HudButton>
			<HudButton type="submit" busy={envio.busy} variant="danger">Borrar para siempre</HudButton>
		</div>
	</form>
</Modal>

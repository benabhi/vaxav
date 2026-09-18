<!--
	La ventana de una ficha: el «ver quién es» del juego.

	**Vive en el armazón y no en una pantalla.** Se dibuja una vez, encima de
	todo, y por eso cualquier nombre de cualquier lista puede abrirla: una ventana
	que sólo se puede abrir desde algunas pantallas es media función.

	**Tiene lo mismo que el módulo**, sección por sección, y con las mismas piezas:
	la tabla de agentes y la de miembros son literalmente las de las pestañas. Una
	ficha ajena que muestre menos que la propia obliga a preguntarse qué falta.

	Su estado vive en la URL —cuál está abierta, qué sección, por dónde va su
	listado—, así que se comparte por mensaje, se cierra con el botón de atrás y se
	recarga sin perderla. Los parámetros llevan prefijo porque **abajo hay una
	pantalla** con sus propios `buscar` y `pagina`: sin él, el buscador de la
	ventana filtraría la tabla de atrás.

	Cerrar es sacar el parámetro, y por eso es un enlace y no un botón: el navegador
	ya sabe volver.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import Icon from '../Icon.svelte';
	import HudButton from '../buttons/HudButton.svelte';
	import HudLink from '../buttons/HudLink.svelte';
	import Modal from '../ui/Modal.svelte';
	import PanelTabs, { type Solapa } from '../ui/PanelTabs.svelte';
	import SegmentBar from '../meters/SegmentBar.svelte';
	import BodyText from '../typography/BodyText.svelte';
	import Label from '../typography/Label.svelte';
	import AgentList from './AgentList.svelte';
	import FamilyXpPanel from './FamilyXpPanel.svelte';
	import Identicon from './Identicon.svelte';
	import MemberList from './MemberList.svelte';
	import StationList from './StationList.svelte';
	import SkillHexagon from './SkillHexagon.svelte';
	import ReputationLadder from './ReputationLadder.svelte';
	import {
		CORPORATION_SECTIONS,
		FICHA_PARAM,
		FICHA_PREFIX,
		hrefFicha,
		type FichaKind
	} from '$lib/fichas';
	import type { Ficha } from '$lib/tipos';

	interface Props {
		ficha: Ficha | null;
	}

	let { ficha }: Props = $props();

	/**
	 * La URL con unos parámetros de la ventana cambiados.
	 *
	 * Todo lo de la ventana lleva prefijo, así que lo de la pantalla de abajo queda
	 * intacto: se puede filtrar la tabla de la ficha sin perder en qué página
	 * estaba la lista que hay detrás.
	 */
	function conParametro(cambios: Record<string, string>): string {
		const params = new SvelteURLSearchParams(page.url.searchParams);
		for (const [clave, valor] of Object.entries(cambios)) {
			const propio = `${FICHA_PREFIX}${clave}`;
			if (valor) params.set(propio, valor);
			else params.delete(propio);
		}
		// Cambiar cualquier cosa vuelve a la primera página de la ventana.
		if (!('pagina' in cambios)) params.delete(`${FICHA_PREFIX}pagina`);
		return `${page.url.pathname}?${params.toString()}`;
	}

	/** Cambiar de sección limpia el recorte de la anterior: son otras columnas. */
	function aSeccion(code: string): string {
		const params = new SvelteURLSearchParams(page.url.searchParams);
		for (const clave of [...params.keys()]) {
			if (clave.startsWith(FICHA_PREFIX)) params.delete(clave);
		}
		params.set(`${FICHA_PREFIX}seccion`, code);
		return `${page.url.pathname}?${params.toString()}`;
	}

	/** Cerrar la ventana es sacar todo lo suyo de la URL. */
	function cerrada(): string {
		const params = new SvelteURLSearchParams(page.url.searchParams);
		params.delete(FICHA_PARAM);
		for (const clave of [...params.keys()]) {
			if (clave.startsWith(FICHA_PREFIX)) params.delete(clave);
		}
		const texto = params.toString();
		return texto ? `${page.url.pathname}?${texto}` : page.url.pathname;
	}

	/**
	 * Lo que el formulario de una lista tiene que arrastrar.
	 *
	 * Un `GET` manda sólo lo que tiene adentro, así que sin esto filtrar cerraría
	 * la ventana y perdería la pantalla de abajo.
	 */
	let escondidos = $derived.by(() => {
		const campos: Record<string, string> = {};
		for (const [clave, valor] of page.url.searchParams) {
			if (!clave.startsWith(FICHA_PREFIX) && clave !== FICHA_PARAM) campos[clave] = valor;
		}
		campos[FICHA_PARAM] = page.url.searchParams.get(FICHA_PARAM) ?? '';
		campos[`${FICHA_PREFIX}seccion`] = ficha?.section ?? '';
		return campos;
	});

	/**
	 * Las secciones, que hoy tiene una sola clase de ficha.
	 *
	 * Vacías en las otras dos: lo público de una persona entra en una pantalla, y
	 * un selector de una sola cosa es un adorno que además promete que hay más.
	 */
	let solapas = $derived<Solapa[]>(
		ficha?.kind === 'corporacion'
			? CORPORATION_SECTIONS.map((una) => ({
					code: una.code,
					label: una.label,
					href: aSeccion(una.code)
				}))
			: []
	);

	/**
	 * El enlace que cambia de ficha sin cerrar la ventana.
	 *
	 * Es lo que vuelve navegable el sector: de un piloto se salta a su corporación
	 * y de ahí a uno de sus agentes, como en el juego del que sale la idea. Limpia
	 * el recorte de la anterior porque son otras columnas.
	 */
	function enlaceFicha(kind: FichaKind, code: string): string {
		return hrefFicha(page.url, kind, code);
	}

	/** La fecha, escrita por el navegador: el servidor manda el instante en UTC. */
	const fecha = (ms: number) =>
		new Date(ms).toLocaleDateString('es', { year: 'numeric', month: 'short', day: 'numeric' });

	/**
	 * Cuánto hace que vuela, en palabras.
	 *
	 * La fecha sola obliga a hacer la cuenta de cabeza, y lo que uno quiere saber al
	 * mirar a un desconocido no es el día: es si es de los primeros o si llegó ayer.
	 */
	function antiguedad(ms: number): string {
		const dias = Math.max(0, Math.floor((Date.now() - ms) / 86_400_000));
		if (dias < 1) return 'hoy';
		if (dias === 1) return 'hace 1 día';
		if (dias < 30) return `hace ${dias} días`;
		const meses = Math.floor(dias / 30);
		if (meses < 12) return meses === 1 ? 'hace 1 mes' : `hace ${meses} meses`;
		const anios = Math.floor(dias / 365);
		return anios === 1 ? 'hace 1 año' : `hace ${anios} años`;
	}

	/**
	 * La ventana está abierta mientras la URL pida una ficha.
	 *
	 * Derivado y escribible: lo calcula la URL, y la ventana puede cerrarse sola
	 * —Escape, la cruz, el clic afuera— sin que eso sea la verdad. La verdad es la
	 * URL: al cerrarse se navega a la de al lado sin la ficha, el dato deja de
	 * venir y el derivado vuelve a decir que no hay nada abierto.
	 */
	let abierta = $derived(ficha !== null);

	$effect(() => {
		if (!abierta && ficha) goto(cerrada(), { noScroll: true, keepFocus: true });
	});
</script>

{#if ficha}
	<Modal
		bind:open={abierta}
		title={ficha.title}
		detail={ficha.subtitle}
		icon={ficha.icon}
		size="lg"
	>
		<!--
			**Alto fijo donde hay pestañas, alto mínimo donde no.** Una ventana que se
			estira al cambiar de sección —cuatro datos en una, una tabla de veinticinco
			filas en otra— no se siente como una ventana con pestañas sino como cinco
			ventanas distintas: ahí el marco queda quieto y lo que sobra se desplaza
			adentro. La ficha de una sola sección no tiene entre qué saltar, así que le
			alcanza con un piso que la salve de salir como una ranura.
		-->
		<div
			class="flex w-full min-w-0 flex-col gap-4
				{solapas.length > 0 ? 'h-[min(30rem,62vh)]' : 'min-h-[min(17rem,48vh)]'}"
		>
			<!--
				Las pestañas son de la corporación: las otras fichas tienen una sola
				sección, y un selector de una sola cosa es un adorno.
			-->
			{#if solapas.length > 0}
				<div class="w-full shrink-0">
					<PanelTabs tabs={solapas} active={ficha.section} />
				</div>
			{/if}

			<div
				class="flex w-full min-w-0 grow flex-col items-start gap-4 overflow-x-hidden overflow-y-auto"
			>
				{#if ficha.pilot}
					{@const uno = ficha.pilot}
					{#if uno.closed}
						<!--
							El perfil cerrado tiene su propia vista y no un cartel: el que llega
							acá apretó un nombre esperando ver a alguien, y «no se puede» dicho con
							una línea de texto gris se lee como un error del juego. El sello
							apagado detrás del ojo tachado dice lo mismo sin leer: hay alguien, y
							eligió no mostrarse.
						-->
						<div class="flex w-full grow flex-col items-center justify-center gap-4 py-6">
							<span class="relative flex items-center justify-center">
								<Identicon
									name={uno.callsign}
									family="piloto"
									size="6rem"
									class="opacity-25 saturate-0"
								/>
								<span class="absolute inset-0 flex items-center justify-center text-text-muted">
									<Icon name="eye-slash" weight="duotone" size="2.4rem" />
								</span>
							</span>

							<span class="flex flex-col items-center gap-1">
								<span class="font-display text-3 tracking-display text-text-strong uppercase">
									{uno.callsign}
								</span>
								<Label>Ficha cerrada</Label>
							</span>

							<p class="max-w-[26rem] text-center text-1 text-text-muted">
								Este piloto prefiere no ser mirado. Su distintivo sigue estando donde estaba —en los
								miembros de su corporación, al pie de un mensaje—, pero de acá para adentro no hay
								nada que ver.
							</p>
						</div>
					{:else}
						<!--
							**La ficha es una credencial, no una tabla.** Alguien que aprieta un
							distintivo quiere saber con quién está hablando, y cuatro renglones
							rotulados no contestan eso. Así que arriba va la banda de su bandera
							—su color al filo, su escudo de fondo— con el sello, el distintivo y a
							quién le responde; y abajo la figura del piloto con sus cifras al lado.

							Es la misma credencial que uno ve de sí mismo en Piloto, recortada a lo
							público: sin créditos, sin dónde está parado y sin los pozos sin gastar.
						-->
						<div
							class="relative flex w-full items-start gap-4 overflow-hidden border border-l-[3px]
								border-border-soft bg-well px-4 py-[0.9rem]"
							style="border-left-color: {uno.factionColor}"
						>
							{#if uno.factionCrest}
								<!--
									El escudo de fondo, apenas encendido: el mismo recurso que la
									credencial propia. Da identidad sin robarle lectura a nada.
								-->
								<img
									src={uno.factionCrest}
									alt=""
									class="pointer-events-none absolute -right-[2rem] -bottom-[3rem] z-0 h-[11rem]
										w-[11rem] opacity-[0.08] mix-blend-screen saturate-[0.6]"
								/>
							{/if}

							<Identicon
								name={uno.callsign}
								family="piloto"
								size="3.5rem"
								title="Sello de {uno.callsign}"
								class="relative z-[1] shrink-0"
							/>

							<div class="relative z-[1] flex min-w-0 grow flex-col gap-[0.3rem]">
								<span
									class="truncate font-display text-4 leading-title-5 font-bold tracking-title
										text-text-strong uppercase"
								>
									{uno.callsign}
								</span>

								<span class="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
									<span class="truncate text-1 text-text-body">{uno.profession}</span>
									<span
										class="truncate font-display text-[0.7rem] tracking-label uppercase"
										style="color: {uno.factionColor}"
									>
										{uno.faction}
									</span>
								</span>

								<!-- A quién le responde, con su sello: es un enlace a su ficha. -->
								{#if uno.corporationCode}
									<a
										href={enlaceFicha('corporacion', uno.corporationCode)}
										class="flex min-w-0 items-center gap-2 text-[0.78rem] text-text-muted
											underline decoration-dotted underline-offset-[0.2rem] hover:text-accent-bright"
									>
										<Identicon name={uno.corporation} family="corporacion" size="1.15rem" />
										<span class="truncate">{uno.corporation}</span>
									</a>
								{:else}
									<span class="text-[0.78rem] text-text-muted">Independiente</span>
								{/if}
							</div>

							<!--
								El rango arriba a la derecha, que es donde una credencial pone lo que
								la califica. En pantalla angosta baja a la fila de lecturas.
							-->
							<div class="relative z-[1] hidden shrink-0 flex-col items-end gap-[0.15rem] xs:flex">
								<Label>IPP</Label>
								<span class="font-display text-2 tracking-display text-accent-bright uppercase">
									{uno.rating.rank}
								</span>
								<span class="font-mono text-[0.78rem] text-data">{uno.rating.value}</span>
							</div>
						</div>

						<!-- Las lecturas: el escalón, lo que falta para el próximo y la antigüedad. -->
						<div class="flex w-full flex-wrap items-center gap-x-5 gap-y-3">
							<span class="flex shrink-0 items-center gap-3">
								<Label>Rango</Label>
								<SegmentBar filled={uno.rating.step + 1} total={uno.rating.steps} class="w-24" />
								<span class="font-display text-1 tracking-display text-accent-bright uppercase">
									{uno.rating.rank}
								</span>
								<span class="font-mono text-[0.78rem] text-data xs:hidden">{uno.rating.value}</span>
							</span>

							{#if uno.rating.next}
								<span class="flex min-w-0 shrink items-baseline gap-2">
									<Label>Después</Label>
									<span class="truncate text-[0.72rem] text-text-muted">{uno.rating.next}</span>
								</span>
							{/if}

							<div class="grow"></div>

							<span class="flex shrink-0 items-baseline gap-2">
								<Label>Vuela desde</Label>
								<span class="font-mono text-[0.78rem] text-data">{fecha(uno.since)}</span>
								<span class="text-[0.7rem] text-text-muted">{antiguedad(uno.since)}</span>
							</span>
						</div>

						<!--
							La figura con su lista al lado, como toda figura del proyecto: la
							silueta dice bien *cuál* —una punta hacia Extracción es un minero— y
							las cifras dicen *cuánto*.
						-->
						<div
							class="flex w-full flex-col items-start gap-4 border-t border-border-soft pt-4 sm:flex-row sm:gap-5"
						>
							<div class="flex w-full justify-center sm:w-[14rem] sm:shrink-0">
								<div class="w-full max-w-[14rem]">
									<SkillHexagon families={uno.families} layers="invested" />
								</div>
							</div>
							<div class="w-full min-w-0 flex-[1_1_0]">
								<FamilyXpPanel families={uno.families} layers="invested" />
							</div>
						</div>

						{#if uno.mine}
							<div
								class="flex w-full flex-wrap items-center gap-3 border-t border-border-soft pt-4"
							>
								<Label>Sos vos</Label>
								<span class="text-[0.7rem] text-text-muted">
									Así te ven los demás cuando aprietan tu distintivo.
								</span>
								<div class="grow"></div>
								<HudLink href="/opciones" variant="outline" size="1">
									<Icon name="gear-six" weight="bold" size="0.7rem" />
									Tu ficha
								</HudLink>
							</div>
						{/if}
					{/if}
				{:else if ficha.agent}
					{@const uno = ficha.agent}
					<div class="flex w-full flex-col items-start gap-4 sm:flex-row">
						<Identicon
							name={uno.agent.name}
							family="agente"
							size="5rem"
							title="Sello de {uno.agent.name}"
							class="shrink-0 {uno.agent.open ? '' : 'opacity-60 saturate-[0.5]'}"
						/>

						<div class="flex min-w-0 grow flex-col gap-3">
							<div class="grid w-full grid-cols-2 gap-3">
								<span class="flex min-w-0 flex-col items-start gap-[0.1rem]">
									<Label>Reparte</Label>
									<span class="flex min-w-0 items-center gap-2">
										<Icon
											name={uno.agent.kindIcon}
											weight="bold"
											size="0.75rem"
											class="shrink-0 text-accent-dim"
										/>
										<span class="truncate text-1 text-text-body">{uno.agent.kind}</span>
									</span>
								</span>
								<span class="flex flex-col items-start gap-[0.1rem]">
									<Label>Nivel</Label>
									<span class="font-display text-1 tracking-display text-accent-bright">
										{uno.agent.level}
									</span>
								</span>
								<span class="flex min-w-0 flex-col items-start gap-[0.1rem]">
									<Label>Responde a</Label>
									<a
										href={enlaceFicha('corporacion', uno.agent.corporationCode)}
										class="truncate text-1 text-text-body underline decoration-dotted underline-offset-[0.2rem] hover:text-accent-bright"
									>
										{uno.agent.corporation}
									</a>
								</span>
								<span class="flex min-w-0 flex-col items-start gap-[0.1rem]">
									<Label>Dónde para</Label>
									<span class="flex min-w-0 items-baseline gap-2">
										<span class="truncate text-1 text-text-body">{uno.agent.station}</span>
										<a
											href="/navegacion/galaxia?sistema={uno.agent.systemCode}"
											class="truncate text-[0.7rem] text-text-muted underline decoration-dotted underline-offset-[0.2rem] hover:text-accent-bright"
										>
											{uno.agent.system}
										</a>
									</span>
								</span>
							</div>

							<div
								class="flex w-full flex-wrap items-center gap-3 border-t border-border-soft pt-3"
							>
								<Label>Te atiende</Label>
								{#if uno.agent.open}
									<span class="font-display text-1 tracking-label text-data uppercase">Sí</span>
								{:else}
									<span class="font-display text-1 tracking-label text-text-muted uppercase">
										Todavía no
									</span>
									<span class="text-[0.7rem] text-text-muted">Pide {uno.needed} de reputación</span>
								{/if}
							</div>
						</div>
					</div>

					{#if uno.description}
						<!--
							Quién es, en una línea. Va acá y no en la tarjeta de la estación: se lee
							una vez, y en una columna de cuatro tarjetas cuatro párrafos son cuatro
							tarjetas que no entran juntas.
						-->
						<BodyText>{uno.description}</BodyText>
					{/if}

					<!--
						**Las dos escaleras, dibujadas.** Es la pregunta que la lista deja abierta
						—«¿por qué éste no me atiende?»— y la contesta mostrando que hay dos caminos
						hasta el mismo umbral: trabajar para ellos, o subir con su bandera y abrir
						de a muchos.
					-->
					<div class="flex w-full flex-col gap-3 border-t border-border-soft pt-4">
						<Label>Lo que decide</Label>
						{#each uno.standings as escalera (escalera.label)}
							<div class="flex w-full flex-wrap items-center gap-3">
								<span class="min-w-0 flex-[1_1_9rem] truncate text-1 text-text-body">
									{escalera.label}
								</span>
								<SegmentBar filled={escalera.reached} total={escalera.tiers} class="w-20" />
								<span class="font-display text-1 tracking-display text-accent-bright uppercase">
									{escalera.tier}
								</span>
								<span class="font-mono text-[0.72rem] text-data">{escalera.value}</span>
								<div class="grow"></div>
								{#if escalera.enough}
									<span class="flex shrink-0 items-center gap-1 text-[0.7rem] text-data">
										<Icon name="check" weight="bold" size="0.7rem" />
										Alcanza
									</span>
								{:else}
									<span class="shrink-0 text-[0.7rem] text-text-muted">No alcanza</span>
								{/if}
							</div>
						{/each}
					</div>
				{:else if ficha.section === 'info' && ficha.corporation}
					{@const corp = ficha.corporation}
					<div class="flex w-full flex-col items-start gap-4 sm:flex-row">
						<Identicon
							name={corp.name}
							family="corporacion"
							size="5rem"
							title="Sello de {corp.name}"
							class="shrink-0"
						/>

						<div class="flex min-w-0 grow flex-col gap-3">
							<div class="grid w-full grid-cols-2 gap-3">
								<span class="flex flex-col items-start gap-[0.1rem]">
									<Label>Rubro</Label>
									<span class="truncate text-1 text-text-body">{corp.kind}</span>
								</span>
								<span class="flex flex-col items-start gap-[0.1rem]">
									<Label>Clase</Label>
									<span class="truncate text-1 text-text-body">{corp.origin}</span>
								</span>
								<span class="flex flex-col items-start gap-[0.1rem]">
									<Label>Responde a</Label>
									<span class="truncate text-1 text-text-body">{corp.faction}</span>
								</span>
								<span class="flex flex-col items-start gap-[0.1rem]">
									<Label>Pilotos</Label>
									<span class="truncate font-mono text-[0.78rem] text-data">{corp.members}</span>
								</span>
							</div>

							{#if corp.reputation}
								<div
									class="flex w-full flex-wrap items-center gap-3 border-t border-border-soft pt-3"
								>
									<Label>Reputación</Label>
									<SegmentBar
										filled={corp.reputation.reached}
										total={corp.reputation.tiers}
										class="w-20"
									/>
									<span class="font-display text-1 tracking-display text-accent-bright uppercase">
										{corp.reputation.tier}
									</span>
									<span class="font-mono text-[0.72rem] text-data">{corp.reputation.value}</span>
								</div>
							{/if}
						</div>
					</div>

					{#if corp.description}
						<BodyText>{corp.description}</BodyText>
					{/if}

					<div class="flex w-full flex-wrap items-center gap-3 border-t border-border-soft pt-4">
						<!--
						**Alistarse, sólo si estás libre.** Con corporación propia el botón ni
						se dibuja: no es que no se pueda apretar, es que primero hay que
						renunciar, y un botón que existe para explicar eso molesta más de lo
						que ayuda.
					-->
						{#if !corp.mine && corp.canJoin !== null}
							{#if corp.joinBlocked}
								<span class="text-[0.7rem] text-text-muted">{corp.joinBlocked}</span>
							{/if}
							<form method="POST" action="/corporacion?/unirse">
								<input type="hidden" name="corporacion" value={corp.code} />
								<HudButton
									type="submit"
									variant="primary"
									size="1"
									disabled={!corp.canJoin}
									title={corp.joinBlocked || undefined}
								>
									<Icon name="handshake" weight="bold" size="0.7rem" />
									Alistarse
								</HudButton>
							</form>
						{/if}

						{#if corp.mine}
							<Label>Respondés a ella</Label>
						{/if}

						<div class="grow"></div>

						<HudLink href="/navegacion/galaxia?corporacion={corp.code}" variant="outline" size="1">
							<Icon name="map-trifold" weight="bold" size="0.7rem" />
							Verla en el mapa
						</HudLink>
					</div>
				{:else if ficha.section === 'reputacion' && ficha.reputation}
					{@const rep = ficha.reputation}
					{#if rep.reputation}
						<div class="w-full">
							<ReputationLadder ladder={rep.reputation.ladder} percent={rep.reputation.percent} />
						</div>
						<div class="flex w-full flex-wrap items-center gap-3 border-t border-border-soft pt-4">
							<Label>Escalón</Label>
							<span class="font-display text-1 tracking-display text-accent-bright uppercase">
								{rep.reputation.tier}
							</span>
							<span class="font-mono text-[0.78rem] text-data">{rep.reputation.value}</span>
							<div class="grow"></div>
							<Label>Abre agentes</Label>
							<span class="font-mono text-[0.78rem] text-text-body">{rep.reputation.level}</span>
						</div>
						{#if rep.total === 0}
							<p class="w-full text-1 text-text-muted">
								Todavía no pasó nada entre ustedes. Acá va a quedar cada movimiento, con lo que sumó
								y el número que dejó.
							</p>
						{:else}
							<p class="w-full text-1 text-text-muted">
								{rep.total === 1 ? '1 movimiento' : `${rep.total} movimientos`}. El libro entero
								está en la pestaña de tu corporación.
							</p>
						{/if}
					{/if}
				{:else if ficha.section === 'ubicaciones' && ficha.stations}
					<!--
						La misma tabla que la pestaña del módulo, con su buscador y su paginado:
						dos maneras de listar los puestos de una corporación serían dos que un
						día dicen cosas distintas. Ver `StationList`.
					-->
					<StationList
						ubicaciones={ficha.stations}
						hrefFor={conParametro}
						hidden={escondidos}
						prefix={FICHA_PREFIX}
					/>
				{:else if ficha.section === 'agentes' && ficha.agents}
					<AgentList
						agentes={ficha.agents}
						hrefFor={conParametro}
						hidden={escondidos}
						prefix={FICHA_PREFIX}
					/>
				{:else if ficha.section === 'miembros' && ficha.members}
					<MemberList
						miembros={ficha.members}
						hrefFor={conParametro}
						hidden={escondidos}
						prefix={FICHA_PREFIX}
					/>
				{/if}
			</div>
		</div>
	</Modal>
{/if}

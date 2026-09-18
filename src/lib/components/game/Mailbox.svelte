<!--
	Una bandeja de mensajes: la lista arriba, el que está abierto abajo.

	**Es una sola pieza para las tres pestañas.** Recibidos, enviados y archivados
	no son tres pantallas: son la misma lista mirada desde distintos lados, y lo
	que cambia —de qué lado está el otro, cómo se llama el panel, qué decir cuando
	no hay nada— llega ya resuelto en el dato. Escribirlas por separado sería
	garantizar que dentro de un mes se vean distinto, que es exactamente lo que le
	pasó a las tablas antes de `HudTable`.

	**Cortada en horizontal y no en vertical**, como un lector de correo de
	escritorio: la tabla arriba con su propio desplazamiento y el mensaje abierto
	debajo, siempre en el mismo lugar. Puestas lado a lado, la lista se quedaba con
	una columna angosta donde el asunto no entraba y el mensaje —que es texto
	corrido— caía en la mitad flaca de la pantalla. Un asunto se lee a lo ancho y un
	párrafo también.

	Los dos recuadros tienen **techo y desplazamiento propio**: la lista no pasa de
	su alto y el cuerpo del mensaje tampoco, y lo que sobra se desplaza adentro de
	su caja, que es la regla de toda tabla del proyecto. Sin eso, quince filas
	dejaban el lector abajo de la pantalla y había que bajar para leer lo que uno
	acababa de abrir.

	**Techo y no alto fijo.** Con alto fijo la página no se mueve nunca, que es más
	prolijo, pero una bandeja de tres mensajes deja media pantalla de caja vacía, y
	una caja vacía se ve peor que un salto. Acá las cajas miden lo que tienen hasta
	donde se les permite.

	**El mensaje abierto viaja en la URL**, igual que la página y que todo recorte
	del juego: se comparte, se vuelve con el botón de atrás y se recarga sin
	perderlo.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page as pagina } from '$app/state';
	import Icon from '../Icon.svelte';
	import Panel from '../cards/Panel.svelte';
	import TitledPanel from '../cards/TitledPanel.svelte';
	import HudButton from '../buttons/HudButton.svelte';
	import Modal from '../ui/Modal.svelte';
	import TextField from '../forms/TextField.svelte';
	import TextArea from '../forms/TextArea.svelte';
	import ErrorCallout from '../forms/ErrorCallout.svelte';
	import Label from '../typography/Label.svelte';
	import { hrefFicha } from '$lib/fichas';
	import CardTitle from '../typography/CardTitle.svelte';
	import HudTable, { type Columna } from '../ui/HudTable.svelte';
	import Paginator from '../ui/Paginator.svelte';
	import Identicon from './Identicon.svelte';
	import { BODY_MAX, SUBJECT_MAX } from '$lib/game/messages';
	import type { Bandeja } from '$lib/tipos';

	interface Props {
		bandeja: Bandeja;
		/** El motivo por el que no se pudo mandar, si el envío volvió con uno. */
		error?: string;
	}

	let { bandeja, error = '' }: Props = $props();

	/**
	 * Si está abierta la ventana de escribir.
	 *
	 * Arranca abierta si la URL trae destinatario: es como llega el jugador desde
	 * la lista de pilotos de una estación, y hacerle apretar «Escribir» después de
	 * haber apretado «Escribirle» sería un paso que no decide nada.
	 */
	let escribiendo = $state(pagina.url.searchParams.has('para'));

	// El envío que vuelve con un motivo reabre la ventana: si no, el motivo
	// aparecería sobre un formulario cerrado y el jugador perdería lo que escribió
	// sin saber por qué. Va en un efecto y no en el valor inicial porque el
	// componente no se rearma entre el envío y la respuesta.
	$effect(() => {
		if (error) escribiendo = true;
	});

	let destinatario = $derived(pagina.url.searchParams.get('para') ?? '');

	/**
	 * La fecha de un mensaje, en la hora del jugador.
	 *
	 * Misma forma que los libros de la billetera y de la reputación: 24 horas y
	 * sin «a. m.», porque el juego lleva reloj UTC de 24 en la barra de estado.
	 */
	function fecha(at: number): string {
		return new Date(at).toLocaleString('es-AR', {
			day: '2-digit',
			month: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		});
	}

	/**
	 * Las columnas.
	 *
	 * La primera junta el punto de sin abrir y el sello de con quién es, y va sin
	 * rótulo: dos encabezados vacíos seguidos se leen como un error de dibujado, y
	 * ni el punto ni el sello necesitan que les pongan nombre.
	 */
	let columnas = $derived<Columna[]>([
		{ label: '', width: '3.4rem' },
		{ label: bandeja.counterpartLabel, width: '9rem' },
		{ label: 'Asunto' },
		{ label: 'Fecha', width: '7rem', class: 'text-right', from: 'md' }
	]);

	/** El enlace a una fila, conservando la página en la que está el jugador. */
	function enlace(id: number): string {
		return `${bandeja.base}?pagina=${bandeja.page}&m=${id}`;
	}

	/** De quién es la cara que se muestra arriba del mensaje abierto. */
	let cara = $derived(bandeja.open?.mine ? bandeja.open.to : (bandeja.open?.from ?? ''));
</script>

<!--
	La barra de arriba: el verbo a la izquierda y las cifras al lado, como toda
	barra de instrumentos del juego. Las dos lecturas contestan lo único que se
	pregunta antes de mirar la lista: cuánto hay y cuánto falta ver.
-->
<div class="flex w-full flex-wrap items-center gap-x-5 gap-y-3">
	<HudButton type="button" variant="primary" size="2" onclick={() => (escribiendo = true)}>
		<Icon name="envelope-simple" weight="bold" size="0.8rem" />
		Escribir
	</HudButton>

	<div class="flex items-baseline gap-2">
		<Label>En la bandeja</Label>
		<span class="font-mono text-[0.8rem] text-text-body">{bandeja.total}</span>
	</div>

	<div class="flex items-baseline gap-2">
		<Label>Sin abrir</Label>
		<span class="font-mono text-[0.8rem] {bandeja.unread > 0 ? 'text-data' : 'text-text-muted'}">
			{bandeja.unread}
		</span>
	</div>
</div>

<!-- Arriba, la lista, con su propio desplazamiento. -->
<TitledPanel title={bandeja.title} class="w-full">
	<HudTable
		columns={columnas}
		minWidth="32rem"
		class="max-h-[17rem] overflow-y-auto md:max-h-[22rem]"
	>
		{#each bandeja.rows as fila (fila.id)}
			<!--
				**La fila entera abre el mensaje**, no sólo el asunto. Con el enlace puesto
				nada más en el asunto, apretar el nombre de quien escribió —o la fecha, o
				el espacio de al lado— no hacía nada, y en una bandeja uno apunta a la
				fila. Es el mismo trato que las filas del mercado.

				El asunto sigue siendo un enlace de verdad igual: es lo que hace que se
				llegue con el teclado y que se pueda abrir en otra pestaña. Cuando el
				click viene de ahí, la fila no se mete.
			-->
			<tr
				onclick={(evento) => {
					if (!(evento.target as HTMLElement).closest('a')) goto(enlace(fila.id));
				}}
				class="cursor-pointer border-b border-border-soft/40 transition-colors last:border-0
					{fila.open ? 'bg-surface-strong' : 'hover:bg-surface-hover'}"
			>
				<td class="py-[0.4rem]">
					<div class="flex items-center gap-2">
						<!--
							El punto de sin abrir, y no negrita en todo el renglón: en una tabla
							de ancho fijo la negrita mueve el texto y la lista entera parece
							bailar entre recargas. Ocupa su lugar aunque esté apagado, o las
							filas leídas correrían el sello medio centímetro.
						-->
						<span
							class="block h-[0.4rem] w-[0.4rem] shrink-0 rounded-full
								{fila.unread ? 'bg-data shadow-data-glow' : 'bg-transparent'}"
							title={fila.unread ? 'Sin abrir' : undefined}
						></span>
						<!--
							Y el sello del otro. Una bandeja de nombres repetidos en gris se lee
							toda igual; con la cara de cada uno, la fila que uno busca se
							encuentra antes de leer una palabra. Es el mismo sello que lo nombra
							en cualquier otra pantalla del juego.
						-->
						<Identicon
							name={fila.counterpart}
							family="piloto"
							size="1.5rem"
							title="Sello de {fila.counterpart}"
							class="shrink-0 {fila.unread ? '' : 'opacity-70'}"
						/>
					</div>
				</td>
				<td class="py-[0.4rem] pr-3 text-1 text-text-body">
					<span class="block truncate">{fila.counterpart}</span>
				</td>
				<td class="py-[0.4rem] pr-3">
					<a
						href={enlace(fila.id)}
						class="block truncate text-1 no-underline
							{fila.unread ? 'text-text-strong' : 'text-text-body'} hover:text-accent-bright"
					>
						{fila.subject}
					</a>
				</td>
				<td
					class="hidden py-[0.4rem] text-right font-mono text-[0.72rem] text-text-muted md:table-cell"
				>
					{fecha(fila.at)}
				</td>
			</tr>
		{/each}
	</HudTable>

	{#if bandeja.total === 0}
		<!-- El estado vacío va afuera de la tabla, como en toda lista del juego. -->
		<p class="w-full pt-3 text-1 text-text-muted">{bandeja.empty}</p>
	{/if}

	<Paginator
		page={bandeja.page}
		pages={bandeja.pages}
		href={(n) => `${bandeja.base}?pagina=${n}`}
		class="mt-3"
	/>
</TitledPanel>

<!-- Y abajo el lector, que ocupa su lugar esté abierto o no. -->
<Panel class="w-full">
	{#if bandeja.open}
		<div class="flex w-full flex-col gap-4">
			<!-- La cabecera: quién, qué y cuándo, con la cara del otro al costado. -->
			<div class="flex w-full items-start gap-4 border-b border-border-soft pb-4">
				<Identicon
					name={cara}
					family="piloto"
					size="3rem"
					title="Sello de {cara}"
					class="shrink-0"
				/>

				<div class="flex min-w-0 grow flex-col gap-2">
					<CardTitle>{bandeja.open.subject}</CardTitle>

					<!--
						Los dos distintivos abren su ficha: lo primero que uno quiere saber de
						un mensaje de alguien que no conoce es quién es. Van acá y no en la
						tabla de arriba porque ahí la fila entera abre el mensaje, y un enlace
						adentro le robaría el clic a lo que uno fue a hacer.
					-->
					<div class="flex w-full flex-wrap items-baseline gap-x-5 gap-y-1">
						<span class="flex min-w-0 items-baseline gap-2">
							<Label>De</Label>
							<a
								href={hrefFicha(pagina.url, 'piloto', bandeja.open.from)}
								class="truncate text-1 text-text-body no-underline hover:text-accent-bright"
							>
								{bandeja.open.from}
							</a>
						</span>
						<span class="flex min-w-0 items-baseline gap-2">
							<Label>Para</Label>
							<a
								href={hrefFicha(pagina.url, 'piloto', bandeja.open.to)}
								class="truncate text-1 text-text-body no-underline hover:text-accent-bright"
							>
								{bandeja.open.to}
							</a>
						</span>
						<span class="flex items-baseline gap-2">
							<Label>Fecha</Label>
							<span class="font-mono text-[0.72rem] text-text-muted">
								{fecha(bandeja.open.at)}
							</span>
						</span>
					</div>
				</div>
			</div>

			<!--
				El cuerpo, en su propio pozo y con el filo naranja al costado: es lo que
				lo separa de la cabecera sin necesidad de otro título, y es el mismo
				recurso que usa el juego para el detalle de un módulo o el aviso de una
				venta.

				`whitespace-pre-wrap` es lo que hace que un mensaje con párrafos se lea
				como lo escribieron y no como un bloque corrido.
			-->
			<div
				class="max-h-[11rem] w-full overflow-y-auto border-l-[3px] border-l-accent bg-well px-4
					py-3 md:max-h-[15rem]"
			>
				<p class="w-full text-2 leading-6 wrap-anywhere whitespace-pre-wrap text-text-body">
					{bandeja.open.body}
				</p>
			</div>

			<div class="flex w-full flex-wrap items-center gap-3">
				<!--
					Archivar y no borrar. Un mensaje es la prueba de un trato, y un juego
					donde el otro puede hacer desaparecer lo que escribió es un juego donde
					la palabra no vale nada. Sale de la bandeja, queda entero, y vuelve con
					el mismo botón.
				-->
				<form method="POST" action="/mensajes?/archivar">
					<input type="hidden" name="mensaje" value={bandeja.open.id} />
					<input type="hidden" name="guardar" value={bandeja.open.archived ? '0' : '1'} />
					<input type="hidden" name="volver" value={bandeja.base} />
					<HudButton type="submit" variant="ghost" size="1">
						<Icon
							name={bandeja.open.archived ? 'arrow-arc-left' : 'archive'}
							weight="bold"
							size="0.7rem"
						/>
						{bandeja.open.archived ? 'Devolver a la bandeja' : 'Archivar'}
					</HudButton>
				</form>

				<div class="grow"></div>

				{#if bandeja.open.mine}
					<!--
						De lo que mandaste, lo único que falta saber es si lo abrieron. De lo
						que te mandaron no hace falta decirlo: el que lo abrió sos vos.
					-->
					<span class="text-[0.72rem] text-text-muted">
						{bandeja.open.seen ? 'Ya lo abrió.' : 'Todavía no lo abrió.'}
					</span>
				{:else}
					<HudButton type="button" variant="outline" size="1" onclick={() => (escribiendo = true)}>
						<Icon name="envelope-simple" weight="bold" size="0.7rem" />
						Responder
					</HudButton>
				{/if}
			</div>
		</div>
	{:else}
		<!--
			El lector vacío **ocupa su lugar igual** y no desaparece: una pantalla donde
			el panel de abajo aparece y se va al elegir una fila da un salto en cada
			click. Y dice qué hacer, que es lo que un hueco no dice.
		-->
		<div class="flex min-h-[8rem] w-full flex-col items-center justify-center gap-3 py-5">
			<Icon name="envelope-simple" weight="thin" size="3rem" class="text-accent-dim opacity-50" />
			<p class="text-1 text-text-muted">Elegí un mensaje de la lista para leerlo acá.</p>
		</div>
	{/if}
</Panel>

<!--
	Escribir, en una ventana y no en una pantalla aparte: es una acción, no un
	lugar, y sacarla a su propia ruta agregaría una pestaña que no se visita nunca
	salvo para esto.

	Manda siempre a `/mensajes`, sea cual sea la bandeja donde se esté, y al salir
	bien lleva a Enviados: lo primero que uno quiere después de mandar algo es ver
	que se mandó.
-->
<Modal bind:open={escribiendo} title="Escribir" icon="envelope-simple" size="lg">
	<form method="POST" action="/mensajes?/enviar" class="flex w-full flex-col gap-4">
		{#if error}
			<ErrorCallout message={error} />
		{/if}

		<TextField
			label="Para"
			name="para"
			placeholder="El distintivo del piloto"
			value={destinatario || (bandeja.open && !bandeja.open.mine ? bandeja.open.from : '')}
			required
			autocomplete="off"
		/>

		<TextField
			label="Asunto"
			name="asunto"
			maxlength={SUBJECT_MAX}
			value={bandeja.open && !bandeja.open.mine ? `Re: ${bandeja.open.subject}` : ''}
			autocomplete="off"
		/>

		<TextArea label="Mensaje" name="cuerpo" maxlength={BODY_MAX} rows={10} required />

		<div class="flex w-full flex-wrap items-center justify-end gap-3">
			<HudButton type="button" variant="ghost" size="2" onclick={() => (escribiendo = false)}>
				Cancelar
			</HudButton>
			<HudButton type="submit" variant="primary" size="2">
				<Icon name="envelope-simple" weight="bold" size="0.8rem" />
				Mandar
			</HudButton>
		</div>
	</form>
</Modal>

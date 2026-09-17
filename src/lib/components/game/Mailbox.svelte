<!--
	Una bandeja de mensajes: la lista, el que está abierto y con qué escribir.

	**Es una sola pieza para las dos pestañas.** Recibidos y enviados no son dos
	pantallas: son la misma lista mirada desde el otro lado, y lo que cambia —de
	qué lado está el otro, qué decir cuando no hay nada— llega ya resuelto en el
	dato. Escribirlas por separado sería garantizar que dentro de un mes se vean
	distinto, que es exactamente lo que le pasó a las tablas antes de `HudTable`.

	**El mensaje abierto va al lado y no en otra ruta.** El proyecto tiene dos
	niveles de navegación y nunca un tercero; cuando un módulo necesita más
	profundidad se resuelve con el diseño de la pantalla, y una lista con el
	detalle al lado es ese diseño. Cuál está abierto viaja en la URL —igual que la
	página y que todo recorte del juego—, así que se comparte, se vuelve con el
	botón de atrás y se recarga sin perderlo.

	En pantalla chica el abierto va **arriba**: el jugador acaba de tocar una fila
	para leerlo, y hacerlo aparecer abajo de una tabla de quince es pedirle que
	busque lo que pidió.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page as pagina } from '$app/state';
	import Icon from '../Icon.svelte';
	import TitledPanel from '../cards/TitledPanel.svelte';
	import HudButton from '../buttons/HudButton.svelte';
	import Modal from '../ui/Modal.svelte';
	import TextField from '../forms/TextField.svelte';
	import TextArea from '../forms/TextArea.svelte';
	import ErrorCallout from '../forms/ErrorCallout.svelte';
	import Label from '../typography/Label.svelte';
	import HudTable, { type Columna } from '../ui/HudTable.svelte';
	import Paginator from '../ui/Paginator.svelte';
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
	 * la lista de pilotos de una estación, y hacerle apretar «Redactar» después de
	 * haber apretado «Escribirle» sería un paso que no decide nada. También queda
	 * abierta si el envío falló, o el motivo se mostraría sobre un formulario
	 * cerrado y vacío.
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

	let columnas = $derived<Columna[]>([
		{ label: '', width: '1.4rem' },
		{ label: bandeja.counterpartLabel, width: '8rem' },
		{ label: 'Asunto' },
		{ label: 'Fecha', width: '7rem', class: 'text-right', from: 'md' }
	]);

	/** El enlace a una fila, conservando la página en la que está el jugador. */
	function enlace(id: number): string {
		return `${bandeja.base}?pagina=${bandeja.page}&m=${id}`;
	}
</script>

<div class="flex w-full flex-wrap items-center gap-3">
	<HudButton type="button" variant="primary" size="2" onclick={() => (escribiendo = true)}>
		<Icon name="envelope-simple" weight="bold" size="0.8rem" />
		Escribir
	</HudButton>

	{#if bandeja.unread > 0}
		<span class="font-mono text-[0.75rem] text-data">
			{bandeja.unread === 1 ? '1 sin abrir' : `${bandeja.unread} sin abrir`}
		</span>
	{/if}
</div>

<div class="flex w-full flex-col items-start gap-[1.25rem] lg:flex-row">
	<!--
		La lista. Segunda en un teléfono y primera cuando hay ancho: ver la cabecera.
	-->
	<div class="order-2 w-full min-w-0 flex-[3_1_0] lg:order-1">
		<TitledPanel
			title={bandeja.title}
			detail={bandeja.total === 1 ? '1 mensaje' : `${bandeja.total} mensajes`}
			class="w-full"
		>
			<HudTable columns={columnas} minWidth="30rem">
				{#each bandeja.rows as fila (fila.id)}
					<!--
						**La fila entera abre el mensaje**, no sólo el asunto. Con el enlace
						puesto nada más en el asunto, apretar el nombre de quién escribió —o
						la fecha, o el espacio de al lado— no hacía nada, y en una bandeja uno
						apunta a la fila, no a cuatro palabras de ella. Es el mismo trato que
						las filas del mercado.

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
						<td class="py-2">
							<!--
								El punto de sin abrir, y no negrita en todo el renglón: en una
								tabla de ancho fijo la negrita mueve el texto y la lista entera
								parece bailar entre recargas.
							-->
							{#if fila.unread}
								<span
									class="block h-[0.4rem] w-[0.4rem] rounded-full bg-data shadow-data-glow"
									title="Sin abrir"
								></span>
							{/if}
						</td>
						<td class="py-2 text-1 text-text-body">
							<span class="block truncate">{fila.counterpart}</span>
						</td>
						<td class="py-2">
							<a
								href={enlace(fila.id)}
								class="block truncate text-1 no-underline
									{fila.unread ? 'text-text-strong' : 'text-text-body'} hover:text-accent-bright"
							>
								{fila.subject}
							</a>
						</td>
						<td
							class="hidden py-2 text-right font-mono text-[0.72rem] text-text-muted md:table-cell"
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
	</div>

	{#if bandeja.open}
		<div class="order-1 w-full min-w-0 flex-[2_1_0] lg:order-2">
			<TitledPanel title={bandeja.open.subject} class="w-full">
				<div class="flex w-full flex-col gap-4">
					<div class="flex w-full flex-wrap items-start gap-x-6 gap-y-3">
						<div class="flex min-w-0 flex-col items-start gap-1">
							<Label>De</Label>
							<span class="truncate text-1 text-text-body">{bandeja.open.from}</span>
						</div>
						<div class="flex min-w-0 flex-col items-start gap-1">
							<Label>Para</Label>
							<span class="truncate text-1 text-text-body">{bandeja.open.to}</span>
						</div>
						<div class="flex flex-col items-start gap-1">
							<Label>Fecha</Label>
							<span class="font-mono text-[0.72rem] text-text-muted">
								{fecha(bandeja.open.at)}
							</span>
						</div>
					</div>

					<!--
						El cuerpo, respetando los renglones que escribió el que lo mandó.
						`whitespace-pre-wrap` es lo que hace que un mensaje con párrafos se
						lea como lo escribieron y no como un bloque corrido.
					-->
					<p
						class="w-full border-t border-border-soft pt-4 text-2 leading-6 wrap-anywhere
							whitespace-pre-wrap text-text-body"
					>
						{bandeja.open.body}
					</p>

					<div class="flex w-full flex-wrap items-center gap-3 border-t border-border-soft pt-4">
						<!--
							Archivar y no borrar. Un mensaje es la prueba de un trato, y un juego
							donde el otro puede hacer desaparecer lo que escribió es un juego
							donde la palabra no vale nada. Sale de la bandeja, queda entero, y
							vuelve con el mismo botón.
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

						{#if bandeja.open.mine}
							<!--
								De lo que mandaste, lo único que falta saber es si lo abrieron. De
								lo que te mandaron no hace falta decirlo: el que lo abrió sos vos.
							-->
							<span class="text-[0.72rem] text-text-muted">
								{bandeja.open.seen ? 'Ya lo abrió.' : 'Todavía no lo abrió.'}
							</span>
						{:else}
							<HudButton
								type="button"
								variant="outline"
								size="1"
								onclick={() => (escribiendo = true)}
							>
								<Icon name="envelope-simple" weight="bold" size="0.7rem" />
								Responder
							</HudButton>
						{/if}
					</div>
				</div>
			</TitledPanel>
		</div>
	{/if}
</div>

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

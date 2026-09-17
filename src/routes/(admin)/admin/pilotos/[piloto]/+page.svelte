<!--
	La ficha de un piloto, del lado de quien administra.

	Lo primero que se ve **no es el formulario**: es si la cuenta tiene la puerta
	cerrada. Quien abre esta pantalla casi siempre llega por un reclamo o por una
	denuncia, y la pregunta con la que llega es «¿qué le pasa a esta cuenta?».

	Dos columnas, como el constructor del universo: a la izquierda quién es y qué
	se le edita, a la derecha su historial de sanciones y sus roles. No llevan alto
	fijo porque acá no hay un árbol que se pierda al estirarse la otra columna —son
	dos listas de largo parecido— y encerrarlas obligaría a desplazar dos veces.
-->
<script lang="ts">
	import { submitting } from '$lib/forms.svelte';
	import Icon from '$lib/components/Icon.svelte';
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
	import { ADMIN_ROUTE } from '$lib/admin';
	import { SANCTIONS, isSanctionKind } from '$lib/sanctions';
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

	let ficha = $derived(data.ficha);

	/** La clase de sanción elegida, que decide si se pide fecha. */
	let clase = $state('warning');
	let pideFecha = $derived(isSanctionKind(clase) && SANCTIONS[clase].dated);

	let sancionar = $state(false);
	let borrar = $state(false);
	let levantando = $state<number | null>(null);

	/** Una fecha con hora: acá lo que se lee es cuándo pasó. */
	function fecha(at: number): string {
		return new Date(at).toLocaleString('es-AR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		});
	}

	/** Sólo el día, para un vencimiento. */
	function dia(at: number): string {
		return new Date(at).toLocaleDateString('es-AR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}
</script>

<svelte:head><title>{ficha.callsign} · Pilotos · Vaxav</title></svelte:head>

<div class="flex w-full flex-wrap items-end justify-between gap-4">
	<div class="flex flex-col items-start gap-1">
		<a
			href="{ADMIN_ROUTE}/pilotos"
			class="flex items-center gap-2 text-accent-dim no-underline hover:text-accent-bright"
		>
			<Icon name="caret-left" weight="bold" size="0.6rem" />
			<Eyebrow>Pilotos</Eyebrow>
		</a>
		<DisplayTitle>{ficha.callsign}</DisplayTitle>
	</div>

	<div class="flex flex-wrap items-center gap-3">
		<HudButton variant="danger" onclick={() => (sancionar = true)}>
			<Icon name="warning" weight="bold" size="0.75rem" />
			Sancionar
		</HudButton>
		<HudButton
			variant="danger"
			disabled={ficha.blockers.length > 0}
			title={ficha.blockers.join(' ')}
			onclick={() => (borrar = true)}
		>
			Dar de baja
		</HudButton>
	</div>
</div>

<!--
	Lo primero: si puede entrar. Va arriba de todo y no en su panel porque es lo
	que se vino a averiguar.
-->
{#if ficha.blockedMessage}
	<Panel class="w-full border-danger bg-danger-wash">
		<div class="flex w-full items-start gap-3">
			<Icon name="warning" weight="fill" size="1.1rem" class="mt-[0.1rem] shrink-0 text-danger" />
			<BodyText>{ficha.blockedMessage}</BodyText>
		</div>
	</Panel>
{/if}

<div class="flex w-full flex-wrap items-start gap-x-6 gap-y-3">
	<div class="flex flex-col items-start gap-1">
		<Label>Facción</Label>
		<span class="font-display text-[0.8rem] text-text-strong">{ficha.faction}</span>
	</div>
	<div class="flex flex-col items-start gap-1">
		<Label>Profesión</Label>
		<span class="font-display text-[0.8rem] text-text-strong">{ficha.profession}</span>
	</div>
	<div class="flex flex-col items-start gap-1">
		<Label>Dónde está</Label>
		<span class="font-display text-[0.8rem] text-text-strong">
			{ficha.location}{ficha.system ? ` · ${ficha.system}` : ''}
		</span>
	</div>
	<div class="grow"></div>
	<div class="flex flex-col items-start gap-1">
		<Label>Créditos</Label>
		<span class="font-mono text-[0.9rem] text-data">{ficha.credits}</span>
	</div>
	<div class="flex flex-col items-start gap-1">
		<Label>Piloto desde</Label>
		<span class="font-mono text-[0.85rem] text-text-body">{dia(ficha.createdAt)}</span>
	</div>
</div>

<ErrorCallout message={form?.error} />

<div class="grid w-full grid-cols-1 items-start gap-5 md:grid-cols-2">
	<!-- Lo que se edita. -->
	<div class="flex w-full flex-col gap-5">
		<TitledPanel title="Identidad" class="w-full">
			<form method="POST" action="?/identidad" use:envio.enhance class="flex w-full flex-col gap-4">
				<TextField label="Distintivo" name="callsign" value={ficha.callsign} required />
				<TextField label="Correo" name="email" type="email" value={ficha.email} required />
				<p class="text-1 text-text-muted">
					Cambiarle el distintivo le cierra las sesiones: se entera al volver a entrar y no a mitad
					de una pantalla.
				</p>
				<HudButton type="submit" busy={envio.busy} variant="primary">Guardar</HudButton>
			</form>
		</TitledPanel>

		<TitledPanel title="Contraseña" class="w-full">
			<form
				method="POST"
				action="?/contrasena"
				use:envio.enhance
				class="flex w-full flex-col gap-4"
			>
				<TextField
					label="Contraseña nueva"
					name="password"
					type="password"
					autocomplete="new-password"
					required
				/>
				<p class="text-1 text-text-muted">
					No hace falta la anterior, y por eso le cierra todas las sesiones. Queda anotado que la
					cambiaste vos; la contraseña no se guarda en ningún registro.
				</p>
				<HudButton type="submit" busy={envio.busy} variant="primary">Cambiar</HudButton>
			</form>
		</TitledPanel>

		<TitledPanel title="Ubicación" class="w-full">
			<form method="POST" action="?/mover" use:envio.enhance class="flex w-full flex-col gap-4">
				<SelectField
					label="Moverlo a"
					name="bodyId"
					options={ficha.bodies}
					value={String(ficha.locationId)}
					hint="No le cancela la orden en curso: si estaba viajando, va a llegar igual a donde iba."
				/>
				<HudButton type="submit" busy={envio.busy} variant="primary">Mover</HudButton>
			</form>
		</TitledPanel>

		<TitledPanel title="Créditos" class="w-full">
			<form method="POST" action="?/creditos" use:envio.enhance class="flex w-full flex-col gap-4">
				<TextField
					label="Ajuste"
					name="amount"
					type="number"
					placeholder="5000 o -5000"
					required
					hint="En positivo le acredita, en negativo le debita."
				/>
				<TextField label="Motivo" name="reason" placeholder="Compensación por un bug" required />
				<p class="text-1 text-text-muted">
					Se escribe como un asiento del libro mayor, igual que cualquier movimiento del juego: el
					saldo no se toca a mano y las cuentas siguen cuadrando.
				</p>
				<HudButton type="submit" busy={envio.busy} variant="primary">Ajustar</HudButton>
			</form>
		</TitledPanel>
	</div>

	<!-- Lo que se mira. -->
	<div class="flex w-full flex-col gap-5">
		<TitledPanel
			title="Sanciones"
			detail={ficha.sanctions.length === 0
				? 'ninguna'
				: ficha.sanctions.length === 1
					? '1 en el historial'
					: `${ficha.sanctions.length} en el historial`}
			class="w-full"
		>
			{#if ficha.sanctions.length === 0}
				<BodyText>Esta cuenta nunca tuvo una sanción.</BodyText>
			{:else}
				<div class="flex w-full flex-col gap-3">
					{#each ficha.sanctions as una (una.id)}
						<!--
							El borde dice el estado antes que el texto: la que pesa va en rojo,
							la que existe pero no cierra nada en naranja, y la levantada o
							vencida en gris. En un historial largo eso es lo único que se ve de
							lejos.
						-->
						<div
							class="flex w-full flex-col gap-1 border-l-[2px] py-1 pl-3
								{una.blocks ? 'border-l-danger' : una.active ? 'border-l-warning' : 'border-l-border-soft'}"
						>
							<div class="flex flex-wrap items-center gap-2">
								<span
									class="font-display text-[0.76rem] font-bold tracking-display uppercase
										{una.blocks ? 'text-danger' : una.active ? 'text-warning' : 'text-text-muted'}"
								>
									{una.kindLabel}
								</span>
								{#if una.liftedAt !== null}
									<span class="font-mono text-[0.62rem] text-text-muted">
										levantada por {una.liftedBy || 'el sistema'}
									</span>
								{:else if una.until !== null}
									<span class="font-mono text-[0.62rem] text-text-muted">
										{una.blocks ? `vence el ${dia(una.until)}` : `venció el ${dia(una.until)}`}
									</span>
								{/if}
							</div>

							<span class="text-1 text-text-body">{una.reason}</span>
							<span class="font-mono text-[0.62rem] text-text-muted">
								{fecha(una.at)} · {una.issuedBy}
							</span>

							{#if una.liftedAt === null && una.active}
								<div class="pt-1">
									<HudButton size="1" variant="ghost" onclick={() => (levantando = una.id)}>
										Levantar
									</HudButton>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</TitledPanel>

		<TitledPanel
			title="Roles"
			detail={ficha.roles.filter((rol) => rol.held).length === 0 ? 'ninguno' : ''}
			class="w-full"
		>
			<div class="flex w-full flex-col gap-3">
				{#each ficha.roles as rol (rol.id)}
					<div class="flex w-full items-start gap-3">
						<form method="POST" action="?/rol" use:envio.enhance class="shrink-0 pt-[0.1rem]">
							<input type="hidden" name="roleId" value={rol.id} />
							<input type="hidden" name="grant" value={rol.held ? 'no' : 'si'} />
							<button
								type="submit"
								disabled={envio.busy}
								aria-pressed={rol.held}
								title={rol.held ? `Sacarle ${rol.name}` : `Darle ${rol.name}`}
								class="flex h-[1.1rem] w-[1.1rem] cursor-pointer items-center justify-center border
									transition-[background-color,border-color]
									{rol.held
									? 'border-accent-bright bg-accent text-on-accent'
									: 'border-border-soft bg-well text-transparent hover:border-accent'}"
							>
								<Icon name="check" weight="bold" size="0.6rem" />
							</button>
						</form>
						<div class="flex min-w-0 flex-col gap-[0.1rem]">
							<span
								class="font-display text-[0.74rem] font-semibold tracking-display uppercase
									{rol.held ? 'text-text-strong' : 'text-text-muted'}"
							>
								{rol.name}
							</span>
							<span class="text-1 text-text-muted">{rol.description}</span>
							{#if rol.held && rol.grantedBy}
								<span class="font-mono text-[0.62rem] text-text-muted">
									se lo dio {rol.grantedBy}
								</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</TitledPanel>
	</div>
</div>

<Modal bind:open={sancionar} title="Sancionar a {ficha.callsign}" icon="warning" size="lg">
	<form method="POST" action="?/sancionar" use:envio.enhance class="flex w-full flex-col gap-5">
		<SelectField
			label="Qué le ponés"
			name="kind"
			options={ficha.sanctionKinds}
			bind:value={clase}
		/>

		<TextField
			label="Motivo"
			name="reason"
			placeholder="Macros en el cinturón"
			required
			hint="Lo va a ver el piloto. Es lo primero que te van a reclamar."
		/>

		<!--
			La fecha sólo aparece para una suspensión: un baneo con vencimiento sería
			una suspensión, y el servidor lo rechaza.
		-->
		{#if pideFecha}
			<TextField
				label="Hasta"
				name="until"
				type="date"
				required
				hint="Vence sola a la medianoche UTC de ese día."
			/>
		{/if}

		<div class="flex items-center justify-end gap-3">
			<HudButton variant="ghost" onclick={() => (sancionar = false)}>Cancelar</HudButton>
			<HudButton type="submit" busy={envio.busy} variant="danger">Sancionar</HudButton>
		</div>
	</form>
</Modal>

<Modal open={levantando !== null} title="Levantar la sanción" icon="shield-check">
	<form method="POST" action="?/levantar" use:envio.enhance class="flex w-full flex-col gap-5">
		<input type="hidden" name="sanctionId" value={levantando ?? 0} />

		<BodyText>
			No se borra: queda en el historial con la fecha y tu nombre. Una cuenta que parece limpia es
			una cuenta cuya historia nadie va a encontrar.
		</BodyText>

		<TextField label="Por qué la levantás" name="reason" placeholder="Se aclaró" required />

		<div class="flex items-center justify-end gap-3">
			<HudButton variant="ghost" onclick={() => (levantando = null)}>Cancelar</HudButton>
			<HudButton type="submit" busy={envio.busy} variant="primary">Levantar</HudButton>
		</div>
	</form>
</Modal>

<Modal bind:open={borrar} title="Dar de baja a {ficha.callsign}" icon="warning">
	<form method="POST" action="?/eliminar" use:envio.enhance class="flex w-full flex-col gap-5">
		<Panel class="w-full border-danger bg-danger-wash">
			<BodyText>
				Se va la cuenta con su nave, su bodega, su bitácora y sus órdenes del mercado. No se puede
				deshacer. En el registro va a quedar que fuiste vos.
			</BodyText>
		</Panel>

		<BodyText>
			Si lo que querés es que no pueda entrar, un baneo alcanza y no destruye nada.
		</BodyText>

		<p class="text-2 text-text-body">
			Escribí <span class="font-display font-bold text-accent-bright">{ficha.callsign}</span> para confirmar.
		</p>

		<TextField label="Distintivo" name="confirm" autocomplete="off" required />

		<div class="flex items-center justify-end gap-3">
			<HudButton variant="ghost" onclick={() => (borrar = false)}>Cancelar</HudButton>
			<HudButton type="submit" busy={envio.busy} variant="danger">Dar de baja</HudButton>
		</div>
	</form>
</Modal>

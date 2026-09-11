<!--
	Alta de piloto, paso a paso.

	Cuatro pantallas cortas en vez de un formulario largo: dos de las decisiones
	—el distintivo y la facción— duran para siempre, así que conviene explicarlas
	antes de que el jugador las tome, y no después.

	Los pasos son estado del navegador: elegir un oficio no es una escritura y no
	tiene por qué viajar. El servidor entra dos veces —a validar la cuenta, que
	exige mirar la base, y a crear el piloto—, y las dos por la misma etiqueta
	`<form>`, que es la que elige a cuál de las dos acciones va.
-->
<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import HudButton from '$lib/components/buttons/HudButton.svelte';
	import HudLink from '$lib/components/buttons/HudLink.svelte';
	import Panel from '$lib/components/cards/Panel.svelte';
	import AuthPanel from '$lib/components/forms/AuthPanel.svelte';
	import ChoiceCard from '$lib/components/forms/ChoiceCard.svelte';
	import ErrorCallout from '$lib/components/forms/ErrorCallout.svelte';
	import StepIndicator from '$lib/components/forms/StepIndicator.svelte';
	import TextField from '$lib/components/forms/TextField.svelte';
	import FactionCard from '$lib/components/game/FactionCard.svelte';
	import PageShell from '$lib/components/layout/PageShell.svelte';
	import Section from '$lib/components/layout/Section.svelte';
	import CardTitle from '$lib/components/typography/CardTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import { professionIcon, skillsSummary } from '$lib/format';
	import { FACTION_LIST, GOVERNED_SYSTEMS } from '$lib/game/factions';
	import { PROFESSION_LIST } from '$lib/game/professions';
	import { LOGIN_ROUTE } from '$lib/routes';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	/** Los pasos, en orden. El último es el resumen antes de firmar. */
	const STEP_LABELS = ['Cuenta', 'Oficio', 'Origen', 'Confirmar'];

	const ACCOUNT_STEP = 0;
	const PROFESSION_STEP = 1;
	const FACTION_STEP = 2;
	const CONFIRM_STEP = 3;

	let step = $state(ACCOUNT_STEP);
	let error = $state('');
	/** Mientras el servidor contesta, para que dos clics no creen dos pilotos. */
	let sending = $state(false);

	let callsign = $state('');
	let email = $state('');
	let password = $state('');
	let confirmation = $state('');
	let profession = $state('');
	let faction = $state('');

	// Se busca en la lista en vez de indexar el catálogo: acá el código puede
	// estar vacío —todavía no se eligió— y una búsqueda lo resuelve sin hacerle
	// pasar por el tipo un estado que es legítimo.
	let chosenProfession = $derived(PROFESSION_LIST.find((item) => item.code === profession));
	let chosenFaction = $derived(FACTION_LIST.find((item) => item.code === faction));
	let professionDetail = $derived(profession ? skillsSummary(profession) : '');

	let isFirstStep = $derived(step <= ACCOUNT_STEP);
	let isConfirmStep = $derived(step >= CONFIRM_STEP);

	/** Salta a un paso ya visitado, desde el resumen. */
	function goToStep(target: number) {
		error = '';
		step = Math.max(ACCOUNT_STEP, Math.min(target, CONFIRM_STEP));
	}

	/** Vuelve un paso, sin perder nada de lo elegido. */
	function previousStep() {
		goToStep(step - 1);
	}

	/**
	 * Avanza desde un paso de elección, que se valida sin preguntarle a nadie.
	 *
	 * El de la cuenta no pasa por acá: ése necesita la base, así que va por la
	 * acción `verificar` y avanza recién cuando el servidor contesta.
	 */
	function nextStep() {
		if (step === PROFESSION_STEP && !profession) {
			error = 'Elegí con qué oficio venís.';
			return;
		}
		if (step === FACTION_STEP && !faction) {
			error = 'Elegí de dónde venís.';
			return;
		}
		error = '';
		step = Math.min(step + 1, CONFIRM_STEP);
	}

	function chooseProfession(code: string) {
		profession = code;
		error = '';
	}

	function chooseFaction(code: string) {
		faction = code;
		error = '';
	}

	/**
	 * Lo que hace el navegador con la respuesta de cualquiera de las dos acciones.
	 *
	 * Un problema se muestra en el aviso y deja el paso donde estaba; un éxito
	 * sólo puede venir de `verificar`, porque crear el piloto termina en una
	 * redirección, y de ésa se ocupa `applyAction`.
	 */
	const handleResponse: SubmitFunction = () => {
		error = '';
		sending = true;
		return async ({ result }) => {
			sending = false;
			if (result.type === 'failure') {
				error = String(result.data?.error ?? '');
				return;
			}
			if (result.type === 'success') {
				step = PROFESSION_STEP;
				return;
			}
			await applyAction(result);
		};
	};
</script>

<svelte:head><title>Crear piloto · Vaxav</title></svelte:head>

{#snippet summaryRow(label: string, value: string, target: number)}
	<!-- Una línea del resumen, con su atajo para volver a cambiarla. -->
	<div class="flex w-full items-center gap-3">
		<span class="w-28 shrink-0 text-2 text-text-muted">{label}</span>
		<span class="text-2 text-text-strong">{value}</span>
		<div class="grow"></div>
		<HudButton variant="ghost" size="1" onclick={() => goToStep(target)}>Cambiar</HudButton>
	</div>
{/snippet}

<PageShell>
	<Section topSpacing={false}>
		<Eyebrow>Alta de piloto</Eyebrow>
		<StepIndicator labels={STEP_LABELS} current={step} />

		<form method="POST" action="?/crear" use:enhance={handleResponse} class="w-full">
			<div class="flex w-full flex-col items-start gap-5">
				{#if step === PROFESSION_STEP}
					<AuthPanel
						title="El oficio"
						subtitle="Es a lo que te dedicabas antes de comprarte la nave, y define con qué habilidades arrancás. Las seis reparten la misma experiencia inicial: ninguna empieza mejor que otra, empiezan distinto. Tampoco te encierra —podés terminar haciendo otra cosa—, sólo que vas a tardar más que quien empezó ahí."
					>
						<div class="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{#each PROFESSION_LIST as item (item.code)}
								<ChoiceCard
									name={item.name}
									description={item.description}
									detail={skillsSummary(item.code)}
									icon={professionIcon(item.code)}
									selected={profession === item.code}
									onChoose={() => chooseProfession(item.code)}
								/>
							{/each}
						</div>
					</AuthPanel>
				{:else if step === FACTION_STEP}
					<AuthPanel
						title="El origen"
						subtitle="La facción dice de dónde venís y a quién respondés. Por ahora sólo decide en qué estación aparecés: no da bonos, porque de eso ya se ocupa el oficio. Más adelante va a pesar en la reputación y en quién te abre la puerta."
					>
						<div class="grid w-full grid-cols-1 gap-4 lg:grid-cols-3">
							{#each FACTION_LIST as item (item.code)}
								<FactionCard
									faction={item}
									selected={faction === item.code}
									pilots={data.factionPilots[item.code] ?? 0}
									systems={GOVERNED_SYSTEMS}
									onChoose={() => chooseFaction(item.code)}
								/>
							{/each}
						</div>
					</AuthPanel>
				{:else if step === CONFIRM_STEP}
					<AuthPanel
						title="Confirmar"
						subtitle="Repasá antes de subir a bordo. El distintivo y la facción no se cambian después; el oficio sólo marca por dónde empezás."
					>
						<div class="flex w-full flex-col items-start gap-3">
							<Panel class="w-full">
								<div class="flex w-full flex-col gap-3">
									{@render summaryRow('Distintivo', callsign, ACCOUNT_STEP)}
									{@render summaryRow('Correo', email, ACCOUNT_STEP)}
									{@render summaryRow('Oficio', chosenProfession?.name ?? '', PROFESSION_STEP)}
									{@render summaryRow('Origen', chosenFaction?.name ?? '', FACTION_STEP)}
									{@render summaryRow(
										'Estación',
										chosenFaction?.startingStationName ?? '',
										FACTION_STEP
									)}
								</div>
							</Panel>
							<Panel class="w-full">
								<div class="flex flex-col items-start gap-2">
									<CardTitle>Con esto arrancás</CardTitle>
									<p class="font-mono text-2 text-data">{professionDetail}</p>
								</div>
							</Panel>
						</div>
					</AuthPanel>
				{:else}
					<AuthPanel
						title="La cuenta"
						subtitle="El distintivo es el nombre con el que te van a conocer los demás pilotos y no se puede cambiar después. El correo no se le muestra a nadie: sirve para recuperar el acceso si perdés la contraseña."
					>
						<div class="flex w-full flex-col items-start gap-4">
							<TextField
								label="Distintivo"
								name="callsign"
								placeholder="Halcon_7"
								hint="Entre {data.limits.callsignMin} y {data.limits
									.callsignMax} caracteres. Letras, números, guion y guion bajo."
								maxlength={data.limits.callsignMax}
								autocomplete="username"
								bind:value={callsign}
							/>
							<TextField
								label="Correo"
								name="email"
								type="email"
								placeholder="piloto@ejemplo.com"
								hint="No se muestra a otros jugadores."
								autocomplete="email"
								bind:value={email}
							/>
							<div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
								<TextField
									label="Contraseña"
									name="password"
									type="password"
									hint="Al menos {data.limits.passwordMin} caracteres."
									autocomplete="new-password"
									bind:value={password}
								/>
								<TextField
									label="Repetir contraseña"
									name="password_confirmation"
									type="password"
									autocomplete="new-password"
									bind:value={confirmation}
								/>
							</div>
						</div>
					</AuthPanel>
				{/if}

				<!--
					Lo elegido en los pasos anteriores viaja con el envío: los campos de la
					cuenta dejan de existir al pasar al oficio, y el oficio y el origen
					nunca fueron campos. Un campo oculto no es hijo de la caja flexible, así
					que no abre un hueco entre el paso y el aviso.
				-->
				{#if step !== ACCOUNT_STEP}
					<input type="hidden" name="callsign" value={callsign} />
					<input type="hidden" name="email" value={email} />
					<input type="hidden" name="password" value={password} />
					<input type="hidden" name="password_confirmation" value={confirmation} />
				{/if}
				<input type="hidden" name="profession" value={profession} />
				<input type="hidden" name="faction" value={faction} />

				<ErrorCallout message={error} />

				<div class="flex w-full items-center gap-3">
					{#if isFirstStep}
						<HudLink href={LOGIN_ROUTE} variant="ghost" size="3">Ya tengo piloto</HudLink>
					{:else}
						<HudButton variant="ghost" size="3" onclick={previousStep}>Atrás</HudButton>
					{/if}
					<div class="grow"></div>
					{#if isConfirmStep}
						<HudButton variant="primary" size="3" type="submit" disabled={sending}>
							Crear piloto
						</HudButton>
					{:else if step === ACCOUNT_STEP}
						<HudButton
							variant="primary"
							size="3"
							type="submit"
							formaction="?/verificar"
							disabled={sending}
						>
							Continuar
						</HudButton>
					{:else}
						<HudButton variant="primary" size="3" onclick={nextStep}>Continuar</HudButton>
					{/if}
				</div>
			</div>
		</form>
	</Section>
</PageShell>

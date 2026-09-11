<!-- Ingreso de un piloto ya registrado. -->
<script lang="ts">
	import HudButton from '$lib/components/buttons/HudButton.svelte';
	import HudLink from '$lib/components/buttons/HudLink.svelte';
	import AuthPanel from '$lib/components/forms/AuthPanel.svelte';
	import ErrorCallout from '$lib/components/forms/ErrorCallout.svelte';
	import TextField from '$lib/components/forms/TextField.svelte';
	import PageShell from '$lib/components/layout/PageShell.svelte';
	import Section from '$lib/components/layout/Section.svelte';
	import { REGISTER_ROUTE } from '$lib/routes';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<svelte:head><title>Iniciar sesión · Vaxav</title></svelte:head>

<PageShell width="max-w-reading">
	<Section topSpacing={false}>
		<AuthPanel title="Iniciar sesión" subtitle="El sector siguió andando sin vos.">
			<form method="POST" class="w-full">
				<div class="flex w-full flex-col items-start gap-5">
					<TextField
						label="Distintivo"
						name="callsign"
						placeholder="Halcon_7"
						autocomplete="username"
						value={form?.callsign ?? ''}
					/>
					<TextField
						label="Contraseña"
						name="password"
						type="password"
						autocomplete="current-password"
					/>
					<ErrorCallout message={form?.error} />
					<div class="flex flex-wrap gap-3">
						<HudButton variant="primary" size="3" type="submit">Entrar</HudButton>
						<HudLink href={REGISTER_ROUTE} variant="ghost" size="3">Crear piloto</HudLink>
					</div>
					<p class="text-1 leading-[1.65] text-text-muted">
						La sesión queda abierta un mes en este navegador.
					</p>
				</div>
			</form>
		</AuthPanel>
	</Section>
</PageShell>

<!--
	Portada: la pantalla de entrada al juego.

	No es una página de producto con secciones y argumentos: es la **intro del
	juego**. Logotipo, las cuatro palabras que dicen a qué se juega, dos botones y
	nada más. Lo que hay que explicar se explica adentro.
-->
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import LogoImage from '$lib/components/brand/LogoImage.svelte';
	import HudLink from '$lib/components/buttons/HudLink.svelte';
	import BareShell from '$lib/components/layout/BareShell.svelte';
	import { LOGIN_ROUTE, REGISTER_ROUTE } from '$lib/routes';

	/**
	 * Las cuatro cosas que se pueden hacer en Vaxav. En infinitivo: es un rótulo,
	 * no una orden al jugador.
	 */
	const ACTIVITIES = ['Construir', 'Explorar', 'Comerciar', 'Combatir'];
</script>

<svelte:head>
	<title>Vaxav · simulación espacial multijugador</title>
	<meta
		name="description"
		content="Juego multijugador masivo por navegador, espacial y sandbox: manejá un piloto y su nave para extraer, explorar, comerciar y combatir en un sector compartido. Las órdenes tardan tiempo real y se resuelven solas."
	/>
</svelte:head>

<BareShell>
	<!-- El campo de estrellas del fondo, definido en app.css. -->
	<div class="vaxav-starfield"></div>

	<!-- Un resplandor naranja bajo el contenido, como el borde de un planeta. -->
	<div
		class="pointer-events-none absolute bottom-[-32rem] left-1/2 h-[46rem] w-[min(120rem,190vw)] -translate-x-1/2 rounded-full"
		style="background: radial-gradient(closest-side, rgba(255,122,26,0.20), rgba(255,122,26,0.05) 55%, transparent 78%)"
	></div>

	<div
		class="relative z-1 flex min-h-dvh w-full items-center justify-center px-[1.25rem] py-8 xs:px-5 sm:px-6"
	>
		<div class="flex w-full flex-col items-center gap-6">
			<LogoImage />

			<div
				class="h-px w-[min(34rem,70vw)]"
				style="background: linear-gradient(90deg, transparent, var(--color-border-strong), transparent)"
			></div>

			<!-- Las cuatro actividades, separadas por un punto medio. -->
			<div class="flex w-full flex-wrap items-center justify-center gap-3">
				{#each ACTIVITIES as activity, index (activity)}
					{#if index > 0}
						<span class="xs:text-base text-[0.85rem] text-accent-dim">·</span>
					{/if}
					<span
						class="xs:text-base font-display text-[0.85rem] font-semibold tracking-label whitespace-nowrap text-accent-bright uppercase text-shadow-glow sm:text-[1.15rem]"
					>
						{activity}
					</span>
				{/each}
			</div>

			<p class="max-w-[34rem] text-center text-2 leading-[1.7] text-text-body">
				Simulación espacial multijugador. Una nave, un sector compartido, y órdenes que tardan
				tiempo real en cumplirse.
			</p>

			<!-- Entrar o crear piloto. No hay una tercera cosa que hacer acá. -->
			<div class="flex flex-wrap items-center justify-center gap-4">
				<HudLink href={LOGIN_ROUTE} variant="primary" size="3">
					<Icon name="rocket-launch" weight="fill" size="1.1rem" />
					<span>Jugar</span>
				</HudLink>
				<HudLink href={REGISTER_ROUTE} size="3">
					<span>Crear piloto</span>
				</HudLink>
			</div>
		</div>
	</div>

	<div class="absolute right-0 bottom-[1.25rem] left-0 z-1 flex justify-center">
		<p class="font-display text-1 tracking-label text-text-muted uppercase">
			Fase F2 · en desarrollo
		</p>
	</div>
</BareShell>

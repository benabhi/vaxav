<!--
	La portada del cuartel general.

	Contesta dos cosas: **qué podés hacer vos** y **qué pasó recién**. Nada más,
	porque nada más existe todavía y este proyecto no pone carteles de lo que va a
	venir.

	Lo de las llaves no es decoración de bienvenida. Un sistema de permisos
	granular tiene un problema propio: nadie sabe qué tiene. El que reparte cree
	que dio una cosa, el que recibe descubre lo que puede a fuerza de chocarse con
	puertas, y cuando algo sale mal nadie puede decir quién podía hacerlo. Verlas
	escritas, con lo que abren al lado, es lo que corta las tres.

	**Las áreas van en su propia fila y no apiladas en una columna.** Con cuatro
	paneles en una sola columna, esa columna se vuelve tres veces más alta que la
	de al lado y la pantalla queda coja. En fila, la grilla los estira a la misma
	altura y se leen como lo que son: cuatro grupos del mismo rango.
-->
<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';
	import EventLine from '$lib/components/admin/EventLine.svelte';
	import Panel from '$lib/components/cards/Panel.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import CardTitle from '$lib/components/typography/CardTitle.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import { ADMIN_ROUTE } from '$lib/admin';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let cuartel = $derived(data.cuartel);
</script>

<svelte:head><title>Cuartel general · Vaxav</title></svelte:head>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Administración</Eyebrow>
	<DisplayTitle>Cuartel general</DisplayTitle>
</div>

<!--
	Los roles primero y las llaves después: el rol es el nombre con el que uno
	piensa lo que es —"soy moderador"— y las llaves son lo que eso significa en la
	práctica. Al revés, la lista de permisos no tendría de dónde colgarse.
-->
<div class="grid w-full grid-cols-1 items-stretch gap-5 md:grid-cols-2">
	<TitledPanel
		title="Tus roles"
		detail={cuartel.roles.length === 1 ? '1 rol' : `${cuartel.roles.length} roles`}
		class="w-full"
	>
		<div class="flex w-full flex-col gap-3">
			{#each cuartel.roles as rol (rol.code)}
				<div class="flex w-full flex-col items-start gap-1 border-l-[2px] border-l-accent pl-3">
					<span
						class="font-display text-[0.8rem] font-bold tracking-display text-text-strong uppercase"
					>
						{rol.name}
					</span>
					{#if rol.description}
						<BodyText>{rol.description}</BodyText>
					{/if}
				</div>
			{/each}
		</div>

		<!--
			Lo de la firma va acá abajo y no en su propio panel: es una nota al pie de
			quién sos, no un aviso que merezca un recuadro propio compitiendo con el
			resto.
		-->
		<p class="mt-4 border-t border-border-soft pt-3 text-1 text-text-muted">
			Todo lo que se haga desde el cuartel queda anotado con tu nombre. No es una advertencia: es lo
			que hace que el registro sirva, y vale igual para vos que para cualquier otro.
		</p>
	</TitledPanel>

	<!-- Lo último que pasó, para no tener que abrir el registro sólo para mirar. -->
	{#if cuartel.recent.length > 0}
		<TitledPanel
			title="Lo último"
			detail={cuartel.events === 1 ? '1 evento en total' : `${cuartel.events} eventos en total`}
			class="w-full"
		>
			<div class="flex w-full flex-col gap-[0.15rem]">
				{#each cuartel.recent as evento (evento.id)}
					<EventLine event={evento} />
				{/each}
			</div>

			<a href="{ADMIN_ROUTE}/eventos" class="mt-4 flex items-center gap-2 no-underline">
				<span
					class="font-display text-[0.7rem] font-semibold tracking-label text-accent-bright uppercase hover:text-accent"
				>
					Ver el registro entero
				</span>
				<Icon name="caret-right" weight="bold" size="0.65rem" class="text-accent-bright" />
			</a>
		</TitledPanel>
	{:else}
		<Panel class="w-full">
			<div class="flex flex-col items-start gap-2">
				<CardTitle>Todavía no pasó nada</CardTitle>
				<BodyText>
					Acá se va a ir anotando lo que ocurra: altas y bajas de cuenta, cambios de contraseña y
					cada rol que se reparta. El registro no se edita ni se borra, así que sirve para
					reconstruir qué pasó cuando algo no cierre.
				</BodyText>
			</div>
		</Panel>
	{/if}
</div>

<div class="grid w-full grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
	{#each cuartel.areas as area (area.label)}
		<TitledPanel title={area.label} class="w-full">
			<div class="flex w-full flex-col gap-[0.6rem]">
				{#each area.keys as llave (llave.label)}
					<div class="flex w-full items-start gap-[0.6rem]">
						<!--
							Las peligrosas se marcan y no se esconden: el que las tiene necesita
							saber que las tiene, sobre todo si no pidió tenerlas.
						-->
						<Icon
							name={llave.dangerous ? 'warning' : 'check'}
							weight="bold"
							size="0.8rem"
							class="mt-[0.2rem] shrink-0 {llave.dangerous ? 'text-danger' : 'text-accent-dim'}"
						/>
						<div class="flex min-w-0 flex-col gap-[0.1rem]">
							<span
								class="font-display text-[0.74rem] font-semibold tracking-display
									{llave.dangerous ? 'text-danger' : 'text-text-strong'} uppercase"
							>
								{llave.label}
							</span>
							<span class="text-1 text-text-muted">{llave.summary}</span>
						</div>
					</div>
				{/each}
			</div>
		</TitledPanel>
	{/each}
</div>

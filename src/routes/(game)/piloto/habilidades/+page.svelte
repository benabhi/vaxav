<!--
	Pestaña Habilidades: el árbol del piloto, y dónde se gasta el pozo.

	Es la pantalla donde se decide en qué se convierte el piloto, así que muestra
	**el catálogo entero** y no sólo lo entrenado: una lista de lo que ya sabés no
	ayuda a elegir en qué invertir.

	Está armada para cuando haya cientos. Los filtros son lo primero de la pantalla
	y no un accesorio: rama, estado y búsqueda por nombre, que son las tres
	preguntas con las que uno llega. El detalle se abre en la misma fila para no
	perder el lugar en la lista.

	**Los pozos van arriba de todo** porque son el presupuesto: lo primero que hay
	que saber antes de mirar precios es cuánto se tiene.
-->
<script lang="ts">
	import { enhance } from '$app/forms';
	import Icon from '$lib/components/Icon.svelte';
	import TitledPanel from '$lib/components/cards/TitledPanel.svelte';
	import ErrorCallout from '$lib/components/forms/ErrorCallout.svelte';
	import SkillMeter from '$lib/components/meters/SkillMeter.svelte';
	import BodyText from '$lib/components/typography/BodyText.svelte';
	import DisplayTitle from '$lib/components/typography/DisplayTitle.svelte';
	import Eyebrow from '$lib/components/typography/Eyebrow.svelte';
	import Label from '$lib/components/typography/Label.svelte';
	import { thousands } from '$lib/format';
	import type { FilaArbol } from '$lib/tipos';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let tree = $derived(data.tree);

	/** Los tres estados por los que uno filtra una lista larga. */
	const ESTADOS = [
		{ code: 'todas', label: 'Todas' },
		{ code: 'entrenadas', label: 'Entrenadas' },
		{ code: 'disponibles', label: 'Puedo subir' },
		{ code: 'bloqueadas', label: 'Bloqueadas' }
	] as const;

	let familia = $state('');
	let estado = $state<(typeof ESTADOS)[number]['code']>('todas');
	let busqueda = $state('');
	/** Qué fila está desplegada, o vacío si ninguna. */
	let abierta = $state('');

	function coincide(skill: FilaArbol): boolean {
		if (familia && skill.family !== familia) return false;
		if (estado === 'entrenadas' && !skill.trained) return false;
		if (estado === 'disponibles' && !skill.canInvest) return false;
		if (estado === 'bloqueadas' && (skill.canInvest || skill.maxed)) return false;

		const texto = busqueda.trim().toLowerCase();
		if (!texto) return true;
		return (
			skill.name.toLowerCase().includes(texto) ||
			skill.familyName.toLowerCase().includes(texto) ||
			skill.governs.toLowerCase().includes(texto)
		);
	}

	let visibles = $derived(tree.skills.filter(coincide));

	/** Si hay algún filtro puesto, para poder ofrecer limpiarlos. */
	let filtrando = $derived(familia !== '' || estado !== 'todas' || busqueda.trim() !== '');

	function limpiar() {
		familia = '';
		estado = 'todas';
		busqueda = '';
	}
</script>

<svelte:head><title>Habilidades · Piloto · Vaxav</title></svelte:head>

<div class="flex flex-col items-start gap-1">
	<Eyebrow>Habilidades</Eyebrow>
	<DisplayTitle>{data.pilot.callsign}</DisplayTitle>
</div>

<!--
	Los pozos: el presupuesto. Cada uno dice cuánto hay y **cuántas habilidades de
	esa rama se pueden subir con eso**, que es lo que convierte un número suelto en
	una decisión. Tocar uno filtra la lista por su rama.
-->
<TitledPanel
	title="Pozos de experiencia"
	detail="{tree.trained} de {tree.total} entrenadas"
	class="w-full"
>
	<div class="grid w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
		{#each tree.pools as pozo (pozo.family)}
			<button
				type="button"
				onclick={() => (familia = familia === pozo.family ? '' : pozo.family)}
				aria-pressed={familia === pozo.family}
				class="flex cursor-pointer flex-col items-start gap-1 border border-t-[2px] px-[0.6rem]
					py-2 text-left transition-[background-color,border-color]
					{familia === pozo.family
					? 'border-border-soft border-t-accent-bright bg-surface-strong shadow-glow'
					: pozo.xp > 0
						? 'border-border-soft border-t-border bg-surface hover:bg-surface-hover'
						: 'border-dead-border border-t-dead-edge bg-dead hover:bg-surface-hover'}"
			>
				<span class="flex w-full items-center gap-[0.35rem]">
					<Icon
						name={pozo.icon}
						weight={pozo.xp > 0 ? 'duotone' : 'thin'}
						size="0.8rem"
						class={pozo.xp > 0 ? 'text-accent' : 'text-text-muted'}
					/>
					<span
						class="min-w-0 overflow-hidden font-display text-[0.64rem] font-bold tracking-label
							text-ellipsis whitespace-nowrap uppercase
							{pozo.xp > 0 ? 'text-text-strong' : 'text-text-muted'}"
					>
						{pozo.name}
					</span>
				</span>
				<span class="font-mono text-[0.95rem] {pozo.xp > 0 ? 'text-data' : 'text-text-muted'}">
					{thousands(pozo.xp)}
				</span>
				<span class="font-display text-[0.58rem] tracking-label text-text-muted uppercase">
					{pozo.affordable > 0 ? `${pozo.affordable} para subir` : 'sin alcance'}
				</span>
			</button>
		{/each}
	</div>
</TitledPanel>

<ErrorCallout message={form?.error} />

<TitledPanel title="Árbol" detail="{visibles.length} de {tree.total}" class="w-full">
	<!-- Los filtros. Van arriba de la lista porque son lo primero que se usa. -->
	<div class="mb-3 flex w-full flex-wrap items-center gap-2 border-b border-border-soft pb-3">
		<label class="flex min-w-0 flex-[1_1_12rem] items-center gap-2">
			<Icon name="magnifying-glass" weight="bold" size="0.8rem" class="shrink-0 text-accent-dim" />
			<input
				type="search"
				bind:value={busqueda}
				placeholder="Buscar por nombre o por lo que mejora"
				class="h-8 w-full min-w-0 border border-border-soft bg-field px-2 font-body text-[0.78rem]
					text-text-strong transition-[border-color,box-shadow] placeholder:text-text-muted
					hover:border-border focus:border-accent focus:shadow-glow focus:outline-none"
			/>
		</label>

		<div class="flex flex-wrap items-center gap-1">
			{#each ESTADOS as opcion (opcion.code)}
				<button
					type="button"
					onclick={() => (estado = opcion.code)}
					aria-pressed={estado === opcion.code}
					class="cursor-pointer border px-[0.55rem] py-[0.25rem] font-display text-[0.64rem]
						font-semibold tracking-label whitespace-nowrap uppercase transition-[background-color,color]
						{estado === opcion.code
						? 'border-accent bg-accent text-on-accent'
						: 'border-border-soft bg-transparent text-accent-bright hover:bg-surface-hover'}"
				>
					{opcion.label}
				</button>
			{/each}
		</div>

		{#if filtrando}
			<button
				type="button"
				onclick={limpiar}
				class="flex cursor-pointer items-center gap-1 border border-border-soft px-[0.5rem]
					py-[0.25rem] text-text-muted transition-colors hover:text-accent"
			>
				<Icon name="x" weight="bold" size="0.6rem" />
				<span class="font-display text-[0.64rem] font-semibold tracking-label uppercase">
					Limpiar
				</span>
			</button>
		{/if}
	</div>

	{#if visibles.length === 0}
		<BodyText>No hay habilidades que cumplan con eso. Probá aflojando los filtros.</BodyText>
	{/if}

	<div class="flex w-full flex-col">
		{#each visibles as skill (skill.code)}
			{@const desplegada = abierta === skill.code}
			<div
				class="w-full border-l-[3px] transition-[background-color,border-color]
					{skill.canInvest
					? 'border-l-data bg-surface'
					: skill.trained
						? 'border-l-border-soft bg-transparent'
						: 'border-l-transparent bg-transparent'}"
			>
				<!--
					La fila. Tocarla despliega el detalle acá mismo y no en otra pantalla:
					comparar dos habilidades es ir y volver, y perder el lugar en una lista
					de cientos es perder el hilo.
				-->
				<button
					type="button"
					onclick={() => (abierta = desplegada ? '' : skill.code)}
					aria-expanded={desplegada}
					class="flex w-full cursor-pointer flex-wrap items-center gap-3 border-b border-border-soft
						px-[0.6rem] py-[0.6rem] text-left hover:bg-surface-hover"
				>
					<Icon
						name={skill.familyIcon}
						weight={skill.trained ? 'duotone' : 'thin'}
						size="0.9rem"
						class={skill.trained ? 'text-accent' : 'text-text-muted'}
					/>

					<span class="flex min-w-[8rem] flex-[1_1_10rem] flex-col items-start gap-[0.15rem]">
						<span
							class="w-full overflow-hidden font-display text-[0.82rem] font-bold tracking-display
								text-ellipsis whitespace-nowrap uppercase
								{skill.trained ? 'text-text-strong' : 'text-text-muted'}"
						>
							{skill.name}
						</span>
						<span class="font-display text-[0.58rem] tracking-label text-accent-dim uppercase">
							{skill.familyName} · x{skill.difficulty}
						</span>
					</span>

					<!--
						El medidor, el nivel y la experiencia van en un solo grupo: en un
						teléfono la fila no entra, y bajan los tres juntos en vez de
						desarmarse en tres renglones sueltos.
					-->
					<span class="flex shrink-0 items-center gap-2">
						<SkillMeter
							level={skill.level}
							progress={skill.progress}
							highlight={skill.maxed}
							class="w-[7rem]"
						/>

						<span
							class="w-[2rem] text-center font-mono text-[0.78rem]
								{skill.trained ? 'text-accent-bright' : 'text-text-muted'}"
						>
							{skill.levelLabel}
						</span>

						<span class="w-[4rem] text-right font-mono text-[0.72rem] text-data">
							{thousands(skill.xp)}
						</span>

						<Icon
							name={desplegada ? 'caret-up' : 'caret-down'}
							weight="bold"
							size="0.7rem"
							class="text-accent-dim"
						/>
					</span>
				</button>

				<!-- El detalle: qué mejora, qué cuesta y qué falta. -->
				{#if desplegada}
					<div
						class="flex w-full flex-col gap-3 border-b border-border-soft bg-surface-strong
							px-[0.9rem] py-[0.8rem]"
					>
						<div class="flex w-full flex-col gap-1">
							<Label>Qué mejora</Label>
							<BodyText>{skill.governs}</BodyText>
						</div>

						<div class="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
							<span class="flex flex-col gap-1">
								<Label>Nivel</Label>
								<span class="font-mono text-[0.82rem] text-accent-bright">
									{skill.levelLabel} · {skill.progress} %
								</span>
							</span>
							<span class="flex flex-col gap-1">
								<Label>Experiencia</Label>
								<span class="font-mono text-[0.82rem] text-data">{thousands(skill.xp)}</span>
							</span>
							<span class="flex flex-col gap-1">
								<Label>Dificultad</Label>
								<span class="font-mono text-[0.82rem] text-accent-bright">x{skill.difficulty}</span>
							</span>
							<span class="flex flex-col gap-1">
								<Label>Siguiente nivel</Label>
								<span class="font-mono text-[0.82rem] text-data">
									{skill.maxed ? '—' : thousands(skill.cost)}
								</span>
							</span>
						</div>

						{#if skill.missing.length > 0}
							<div class="flex w-full flex-wrap items-center gap-2">
								<Icon name="warning" weight="fill" size="0.75rem" class="text-warning" />
								<span class="text-1 text-warning">
									Necesitás {skill.missing.join(', ')}
								</span>
							</div>
						{/if}

						<!--
							El botón dice el costo y de qué pozo sale: apretar algo que gasta
							tiene que decir cuánto gasta antes de apretarlo.
						-->
						<div class="flex w-full flex-wrap items-center gap-3">
							{#if skill.maxed}
								<span
									class="flex items-center gap-1 border border-data px-[0.5rem] py-[0.15rem]
										font-display text-[0.64rem] font-bold tracking-label text-data uppercase"
								>
									<Icon name="star" weight="fill" size="0.6rem" />
									Al máximo
								</span>
							{:else}
								<form method="POST" action="?/invertir" use:enhance>
									<input type="hidden" name="habilidad" value={skill.code} />
									<button
										type="submit"
										disabled={!skill.canInvest}
										class="flex items-center gap-2 border px-[0.7rem] py-[0.3rem] font-display
											text-[0.68rem] font-semibold tracking-label uppercase transition-[background-color,color]
											{skill.canInvest
											? 'cursor-pointer border-data bg-transparent text-data hover:bg-data hover:text-on-accent'
											: 'cursor-not-allowed border-border-soft bg-transparent text-text-muted opacity-60'}"
									>
										<Icon name="lightning" weight="fill" size="0.65rem" />
										Subir a nivel {skill.nextLevel} · {thousands(skill.cost)} XP
									</button>
								</form>
								{#if skill.blocked}
									<span class="text-1 text-text-muted">{skill.blocked}</span>
								{:else}
									<span class="text-1 text-text-muted">
										Sale del pozo de {skill.familyName}
									</span>
								{/if}
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</TitledPanel>

<!--
	Un desplegable del HUD, con su etiqueta.

	Nació en el constructor, que está hecho casi enteramente de elegir de una lista
	—la constelación, la facción, el gobierno, el mineral—, y **vive con los demás
	campos** porque un desplegable no es del cuartel: lo usa cualquier pantalla que
	tenga algo que elegir, empezando por los filtros del mapa del piloto. Sin él,
	cada una resolvería por su cuenta el aspecto de un `<select>`, que es justo lo
	que CLAUDE.md §1 manda no hacer.

	Mide y se ve **igual que `TextField`**: mismo alto, mismo borde, mismo halo al
	enfocarlo. En una cabina los controles están alineados, y un desplegable más
	bajo que el campo de al lado se nota aunque nadie sepa por qué.

	Agrupa por `group` cuando las opciones lo traen: con veinte constelaciones, una
	lista plana no dice en qué parte de la galaxia cae cada una.
-->
<script lang="ts">
	import type { HTMLSelectAttributes } from 'svelte/elements';
	import { CONTROL_HEIGHTS, type ControlSize } from '../buttons/estilos';
	import type { OpcionConstructor } from '$lib/tipos';

	interface Props extends Omit<HTMLSelectAttributes, 'value' | 'size'> {
		label: string;
		name: string;
		options: readonly OpcionConstructor[];
		hint?: string;
		size?: ControlSize;
		value?: string;
	}

	let {
		label,
		name,
		options,
		hint = '',
		size = '2',
		value = $bindable(''),
		...rest
	}: Props = $props();

	/**
	 * Las opciones repartidas por grupo, en el orden en que apareció cada grupo.
	 *
	 * **Junta todo lo del mismo grupo, aunque venga salteado.** Antes sólo unía lo
	 * que llegaba pegado, y alcanzaba porque había una sola región: con seis, el
	 * catálogo viene ordenado por nombre de constelación y las regiones se
	 * intercalan, así que la misma aparecía tres veces. Dos grupos con el mismo
	 * nombre son dos claves repetidas, y una lista con claves repetidas **no se
	 * dibuja**: se llevaba puesta la pantalla entera.
	 */
	let grupos = $derived.by(() => {
		// Un objeto y no un `Map`: es una tabla efímera que se arma y se tira en la
		// misma vuelta, no estado reactivo. `Object.keys` conserva el orden de
		// inserción para claves de texto, que es justo lo que hace falta acá.
		const porNombre: Record<string, OpcionConstructor[]> = {};
		for (const opcion of options) {
			const nombre = opcion.group ?? '';
			(porNombre[nombre] ??= []).push(opcion);
		}
		return Object.entries(porNombre).map(([name, opciones]) => ({ name, options: opciones }));
	});

	let agrupado = $derived(grupos.some((uno) => uno.name !== ''));
</script>

<div class="flex w-full flex-col items-start gap-2">
	<label for={name} class="font-display text-1 font-medium tracking-label text-accent uppercase">
		{label}
	</label>
	<select
		id={name}
		{name}
		class="text-base {CONTROL_HEIGHTS[size]} w-full cursor-pointer appearance-none border
			border-border-soft bg-field px-[11px] font-body leading-none text-text-strong
			shadow-[inset_0_0_0_1px_rgb(255_251_237/0.235)] transition-[border-color,box-shadow]
			hover:border-border focus:border-accent focus:shadow-glow focus:outline-none"
		{...rest}
		bind:value
	>
		{#if agrupado}
			{#each grupos as grupo (grupo.name)}
				<optgroup label={grupo.name || 'Sin región'}>
					{#each grupo.options as opcion (opcion.value)}
						<option value={opcion.value}>{opcion.label}</option>
					{/each}
				</optgroup>
			{/each}
		{:else}
			{#each options as opcion (opcion.value)}
				<option value={opcion.value}>{opcion.label}</option>
			{/each}
		{/if}
	</select>
	{#if hint}
		<p class="text-1 text-text-muted">{hint}</p>
	{/if}
</div>

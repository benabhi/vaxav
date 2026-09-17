<!--
	Un desplegable del HUD, con su etiqueta.

	Existe porque el constructor está hecho casi enteramente de elegir de una
	lista: la constelación, la facción, el gobierno, la corporación, el mineral.
	Sin él, cada pantalla resolvería por su cuenta el aspecto de un `<select>`, que
	es justo lo que CLAUDE.md §1 manda no hacer.

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

	/** Las opciones repartidas por grupo, respetando el orden en que llegaron. */
	let grupos = $derived.by(() => {
		const salida: { name: string; options: OpcionConstructor[] }[] = [];
		for (const opcion of options) {
			const nombre = opcion.group ?? '';
			const ultimo = salida.at(-1);
			if (ultimo && ultimo.name === nombre) ultimo.options.push(opcion);
			else salida.push({ name: nombre, options: [opcion] });
		}
		return salida;
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

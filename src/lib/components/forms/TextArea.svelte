<!--
	Campo de varios renglones, para lo que no entra en uno.

	Hasta acá el proyecto no tenía ninguno: hasta las descripciones del cuartel se
	escriben en un `TextField` de una línea, porque son un renglón largo y no un
	texto. Un mensaje privado sí es un texto —tiene párrafos, se relee antes de
	mandarlo— y escribirlo en una ranura de una línea es pelearse con la
	herramienta.

	**Es el mismo campo que `TextField` con otra altura**, y a propósito: mismo
	fondo, mismo borde fino, mismo anillo interior, mismo halo naranja al
	enfocarlo. Dos campos del mismo formulario que se ven distinto se leen como un
	error antes que como dos clases de campo.

	Lo único que no hereda es la altura de control: un campo de texto no se alinea
	con un botón, se alinea con lo que hay que escribir. Va en renglones y no en
	una medida fija para que crezca con la tipografía y con la escala del HUD.
-->
<script lang="ts">
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLTextareaAttributes, 'value'> {
		label: string;
		name: string;
		/** Una aclaración debajo, si hace falta. */
		hint?: string;
		/** Cuántos renglones de alto. */
		rows?: number;
		value?: string;
	}

	let { label, name, hint = '', rows = 8, value = $bindable(''), ...rest }: Props = $props();
</script>

<div class="flex w-full flex-col items-start gap-2">
	<label for={name} class="font-display text-1 font-medium tracking-label text-accent uppercase">
		{label}
	</label>
	<textarea
		id={name}
		{name}
		{rows}
		class="text-base w-full resize-y border border-border-soft bg-field px-[11px] py-2 font-body
			leading-6 text-text-strong shadow-[inset_0_0_0_1px_rgb(255_251_237/0.235)]
			transition-[border-color,box-shadow] placeholder:text-text-muted hover:border-border
			focus:border-accent focus:shadow-glow focus:outline-none"
		{...rest}
		bind:value></textarea>
	{#if hint}
		<p class="text-1 text-text-muted">{hint}</p>
	{/if}
</div>

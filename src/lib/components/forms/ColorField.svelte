<!--
	Elegir el color de algo.

	Es el selector del navegador —`input type="color"`— envuelto para que parezca
	del HUD. **No es una librería**: es un control nativo, como el campo de texto que
	envuelve `TextField`, y trae gratis la rueda completa, el hexadecimal a mano y el
	cuentagotas del sistema operativo. Escribir una rueda propia sería reimplementar
	peor algo que ya está en todas las máquinas.

	**Y al lado va «automático», que es la opción de entrada.** El color se genera a
	partir del nombre, así que nada queda sin color y nadie tiene que decidir para
	que el mapa se vea; esto existe para cuando el automático no alcanza —dos vecinas
	que salieron parecidas, o una que se quiere de un color concreto—. Por eso vacío
	no es un dato que falte: es «elegilo vos».

	Ocupa **una sola línea** a propósito: se usa en filas de una lista, y un selector
	de tres renglones convierte una lista de veinte en una pantalla de scroll.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';

	interface Props {
		label?: string;
		name: string;
		/** `#rrggbb`, o vacío para el automático. */
		value?: string;
		/** El color que se usaría sin elegir ninguno: con lo que abre la rueda. */
		auto?: string;
		hint?: string;
		/**
		 * A qué formulario pertenece, cuando no está adentro de él.
		 *
		 * El atributo `form` lo ata igual, que es para lo que existe.
		 */
		form?: string;
	}

	let {
		label = '',
		name,
		value = $bindable(''),
		auto = '#ff7a1a',
		hint = '',
		form = ''
	}: Props = $props();

	/**
	 * Con qué color abre la rueda.
	 *
	 * Nunca vacío: un `input type="color"` sin valor cae en negro, y el negro dice
	 * «elegí negro» cuando lo que pasa es «no elegí nada». Con el automático adentro,
	 * abrir la rueda arranca del color que la cosa ya tenía.
	 */
	let enLaRueda = $derived(value || auto);

	let automatico = $derived(value === '');
</script>

<div class="flex items-center gap-2">
	{#if label}
		<span class="font-display text-1 font-medium tracking-label text-accent uppercase">
			{label}
		</span>
	{/if}

	<!-- El valor real viaja escondido: el nativo no puede decir «ninguno». -->
	<input type="hidden" {name} form={form || undefined} bind:value />

	<!--
		El nativo, encogido a un cuadrado del tamaño del HUD. Se le sacan el relleno y
		el borde propios para que la muestra ocupe todo y el marco sea el nuestro.
	-->
	<span
		class="relative block h-[1.7rem] w-[2.2rem] shrink-0 border transition-colors
			{automatico ? 'border-dead-border opacity-70' : 'border-border hover:border-accent'}"
	>
		<input
			type="color"
			value={enLaRueda}
			aria-label="Elegir un color"
			class="absolute inset-0 h-full w-full cursor-pointer appearance-none border-0 bg-transparent
				p-0 [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:border-0
				[&::-webkit-color-swatch-wrapper]:p-0"
			oninput={(evento) => (value = evento.currentTarget.value)}
		/>
	</span>

	<!--
		Volver al automático. Es un botón aparte y no una opción del selector porque el
		nativo no tiene forma de decir «ninguno»: siempre devuelve un color.
	-->
	<button
		type="button"
		class="flex h-[1.7rem] shrink-0 cursor-pointer items-center gap-[0.3rem] border px-[0.4rem]
			font-display text-[0.62rem] tracking-label uppercase transition-colors
			{automatico
			? 'border-accent bg-accent text-on-accent'
			: 'border-border-soft text-text-muted hover:border-border hover:text-text-body'}"
		title="Usar el color que sale del nombre"
		onclick={() => (value = '')}
	>
		{#if automatico}
			<Icon name="check" weight="bold" size="0.65rem" />
		{/if}
		Auto
	</button>

	{#if hint}
		<span class="text-1 text-text-muted">{hint}</span>
	{/if}
</div>

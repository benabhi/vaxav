<!--
	Un botón del HUD.

	En Elite Dangerous un botón es un rectángulo de borde fino con el texto en
	mayúsculas, y cuando se lo señala o se lo elige **se llena de naranja y el
	texto pasa a negro**. Esa inversión es la que da la sensación de estar
	apretando algo físico, así que vive acá y no repartida por las pantallas.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Icon from '../Icon.svelte';
	import {
		BUTTON_BASE,
		BUTTON_SIZES,
		BUTTON_VARIANTS,
		type ButtonSize,
		type ButtonVariant
	} from './estilos';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
		variant?: ButtonVariant;
		size?: ButtonSize;
		/**
		 * Si está trabajando.
		 *
		 * Se apaga y muestra el aro girando. **No es sólo cortesía**: sin señal,
		 * quien apretó no sabe si el clic entró y vuelve a apretar, y dos envíos en
		 * camino pueden pisarse contra la misma fila.
		 *
		 * Reemplaza al ícono que traiga el botón en vez de sumarse: el aro ocupa su
		 * lugar, así que el texto no se corre ni el botón cambia de ancho.
		 */
		busy?: boolean;
		class?: string;
	}

	let {
		children,
		variant = 'outline',
		size = '2',
		busy = false,
		disabled = false,
		class: extra = '',
		type = 'button',
		...rest
	}: Props = $props();
</script>

<button
	{type}
	disabled={disabled || busy}
	aria-busy={busy || undefined}
	class="{BUTTON_BASE} {BUTTON_SIZES[size]} {BUTTON_VARIANTS[variant]} {extra}"
	{...rest}
>
	{#if busy}
		<Icon name="circle-notch" weight="bold" size="0.8rem" class="animate-spin" />
	{/if}
	{@render children()}
</button>

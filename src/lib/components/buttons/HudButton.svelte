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
		class?: string;
	}

	let {
		children,
		variant = 'outline',
		size = '2',
		class: extra = '',
		type = 'button',
		...rest
	}: Props = $props();
</script>

<button
	{type}
	class="{BUTTON_BASE} {BUTTON_SIZES[size]} {BUTTON_VARIANTS[variant]} {extra}"
	{...rest}
>
	{@render children()}
</button>

<!--
	Un enlace con forma de botón del HUD.

	Es un `<a>` y no un botón con navegación adentro: lo que lleva a otra pantalla
	tiene que poder abrirse en otra pestaña y leerse como enlace.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes } from 'svelte/elements';
	import {
		BUTTON_BASE,
		BUTTON_SIZES,
		BUTTON_VARIANTS,
		type ButtonSize,
		type ButtonVariant
	} from './estilos';

	interface Props extends HTMLAnchorAttributes {
		children: Snippet;
		href: string;
		variant?: ButtonVariant;
		size?: ButtonSize;
		class?: string;
	}

	let {
		children,
		href,
		variant = 'outline',
		size = '2',
		class: extra = '',
		...rest
	}: Props = $props();
</script>

<a
	{href}
	class="{BUTTON_BASE} {BUTTON_SIZES[size]} {BUTTON_VARIANTS[variant]} no-underline {extra}"
	{...rest}
>
	{@render children()}
</a>

<!--
	Marco común de las pantallas públicas: cabecera, cuerpo y pie.

	Así la navegación, el ancho de lectura y los márgenes se deciden una vez y no
	se discuten pantalla por pantalla. La cabecera imita la barra superior del HUD
	del juego: una línea fina naranja que separa el marco del contenido, y nada
	más.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import BrandLink from '../brand/BrandLink.svelte';
	import Wordmark from '../brand/Wordmark.svelte';
	import HudLink from '../buttons/HudLink.svelte';
	import { LOGIN_ROUTE, REGISTER_ROUTE } from '$lib/routes';
	import Bounded from './Bounded.svelte';

	interface Props {
		children: Snippet;
		/** Una clase de ancho máximo; por omisión, el del sitio. */
		width?: string;
	}

	let { children, width }: Props = $props();
</script>

<div class="flex min-h-dvh w-full flex-col">
	<header class="sticky top-0 z-20 border-b border-border bg-surface-overlay backdrop-blur-[10px]">
		<Bounded>
			<div class="flex w-full items-center py-3">
				<BrandLink />
				<div class="grow"></div>
				<div class="flex items-center gap-3">
					<!--
						En pantallas chicas la acción principal se lleva todo el espacio;
						iniciar sesión sigue disponible desde la portada.
					-->
					<div class="hidden sm:flex">
						<HudLink href={LOGIN_ROUTE} variant="ghost">Iniciar sesión</HudLink>
					</div>
					<HudLink href={REGISTER_ROUTE}>Crear piloto</HudLink>
				</div>
			</div>
		</Bounded>
	</header>

	<main class="w-full grow py-6 xs:py-7 sm:py-[3.5rem]">
		<Bounded {width}>
			<div class="flex w-full flex-col items-start">
				{@render children()}
			</div>
		</Bounded>
	</main>

	<footer class="mt-8 border-t border-border-soft xs:mt-9 sm:mt-[5rem]">
		<Bounded>
			<div class="flex w-full flex-col items-start gap-3 py-[1.75rem] md:flex-row md:items-center">
				<Wordmark size="text-1" iconSize="0.8rem" />
				<div class="grow"></div>
				<p class="font-display text-1 tracking-display text-text-muted uppercase">
					Proyecto en desarrollo · fase F2
				</p>
			</div>
		</Bounded>
	</footer>
</div>

<!--
	El marco del cuartel general.

	Es **la misma barra lateral del juego con otra lista**: el Neocom sabe dibujar
	cualquier juego de secciones, así que acá no se duplica ni una línea de su
	plegado, su aspecto ni su comportamiento en teléfono. Lo que cambia es el
	bloque de marca —"CUARTEL" en vez de "VAXAV"— y a dónde lleva el pie: al juego,
	que es de donde se vino.

	Lo que **no** se reusa es la barra de arriba. La del juego cuenta qué está
	haciendo el piloto y qué hora es; acá eso no viene al caso, y en su lugar va lo
	único que importa recordar en una pantalla donde se le puede tocar la cuenta a
	cualquiera: **con qué nombre estás firmando**. Todo lo que se haga desde acá
	queda anotado con ese nombre.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../Icon.svelte';
	import Label from '../typography/Label.svelte';
	import Neocom from './Neocom.svelte';
	import { ADMIN_ROUTE, type AdminSection } from '$lib/admin';
	import type { Module } from '$lib/navigation';
	import { PILOT_ROUTE } from '$lib/routes';

	interface Props {
		children: Snippet;
		/** Las secciones que este piloto puede abrir. */
		sections: readonly AdminSection[];
		activeSection: string;
		/** Con qué nombre queda firmado lo que se haga acá. */
		callsign: string;
	}

	let { children, sections, activeSection, callsign }: Props = $props();

	/** La clave con la que el navegador recuerda si la barra quedó desplegada. */
	const CLAVE = 'vaxav_neocom';

	let expanded = $state(true);

	$effect(() => {
		try {
			expanded = localStorage.getItem(CLAVE) !== '0';
		} catch {
			// Un navegador que no deja guardar nada no es motivo para no trabajar.
		}
	});

	function alternar() {
		expanded = !expanded;
		try {
			localStorage.setItem(CLAVE, expanded ? '1' : '0');
		} catch {
			// Ídem: la preferencia se pierde al recargar y nada más.
		}
	}

	/**
	 * La vuelta al juego, abajo de todo.
	 *
	 * Va como una sección más y no como un botón aparte porque es lo que es: otra
	 * fila de la misma columna. Nunca queda activa —su ruta no es del cuartel— y
	 * eso está bien: es una salida, no un lugar donde estar.
	 */
	const VOLVER: Module = {
		code: 'game',
		label: 'Al juego',
		icon: 'rocket',
		tabs: [{ route: PILOT_ROUTE, label: 'Al juego' }]
	};
</script>

<Neocom
	{expanded}
	activeModule={activeSection}
	onToggle={alternar}
	modules={sections}
	brand="CUARTEL"
	brandIcon="crown-simple"
	brandRoute={ADMIN_ROUTE}
	extra={[VOLVER]}
/>

<div class="neocom-content min-h-dvh">
	<!--
		El borde de abajo es de aviso y no el gris de siempre: es la única señal
		permanente de que lo que se toque acá no afecta a un piloto sino a todos.
	-->
	<div
		class="sticky top-0 z-20 flex h-topbar w-full items-center border-b border-b-warning/50
			bg-surface-overlay px-[0.9rem] backdrop-blur-[10px] xs:px-[1.1rem] sm:px-6"
	>
		<div class="flex w-full items-center gap-4">
			<span class="flex items-center gap-2">
				<Icon name="crown-simple" weight="fill" size="0.9rem" class="text-warning" />
				<span
					class="font-display text-[0.72rem] font-bold tracking-label whitespace-nowrap text-warning uppercase"
				>
					Cuartel general
				</span>
			</span>
			<div class="grow"></div>
			<span class="flex items-center gap-2">
				<span class="hidden xs:block"><Label>Sesión</Label></span>
				<span class="font-mono text-[0.8rem] whitespace-nowrap text-text-strong">{callsign}</span>
			</span>
		</div>
	</div>

	<div
		class="mx-auto w-full max-w-content px-[0.9rem] py-[1.25rem] xs:px-[1.1rem] xs:py-5 sm:px-6 sm:py-6"
	>
		<div class="flex w-full flex-col items-start gap-6">
			{@render children()}
		</div>
	</div>
</div>

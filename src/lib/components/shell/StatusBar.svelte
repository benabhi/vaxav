<!--
	Qué hora es, y el lugar reservado para la barra de acción.

	La diferencia de fondo con la cabecera pública es qué ocupa el borde superior:
	en las páginas públicas hay navegación, y acá **no**. Salir y moverse entre
	secciones es cosa del Neocom; la barra de arriba queda para lo que no depende
	de dónde esté el piloto ni de sus datos. Dónde está y cuánto tiene se leen en
	su propia ficha, no acá arriba.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import Label from '../typography/Label.svelte';
	import ActionIndicator from './ActionIndicator.svelte';
	import UtcClock from './UtcClock.svelte';
	import type { AccionEnCurso } from '$lib/tipos';

	interface Props {
		action: AccionEnCurso | null;
	}

	let { action }: Props = $props();
</script>

<div
	class="sticky top-0 z-20 flex h-topbar w-full items-center border-b border-border bg-surface-overlay px-[0.9rem] backdrop-blur-[10px] xs:px-[1.1rem] sm:px-6"
>
	<div class="flex w-full items-center gap-4">
		<ActionIndicator {action} />
		<div class="grow"></div>
		<div class="flex items-center gap-2">
			<Icon name="clock" weight="fill" size="0.9rem" class="text-accent-dim" />
			<UtcClock />
			<span class="hidden xs:block"><Label>UTC</Label></span>
		</div>
	</div>
</div>

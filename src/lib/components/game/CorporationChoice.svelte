<!--
	Una corporación ofrecida para alistarse: su sello, su nombre, su rubro y a qué
	se dedica.

	**Con el sello y no sólo con el nombre.** Es lo que hace que doce opciones se
	distingan de un vistazo en vez de ser doce párrafos, y como el sello se calcula
	a partir del nombre, la misma corporación se ve igual acá, en la ficha y en
	cualquier lista futura.

	Se usa en los dos lugares donde se elige una —el alta y la ficha del piloto que
	está sin corporación—, y se comporta igual en los dos: se elige, y confirmar es
	un paso aparte. Alistarse de un clic es de las cosas que uno no quería hacer.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';
	import Identicon from './Identicon.svelte';
	import { corporationKindIcon, corporationKindLabel } from '$lib/format';
	import type { CorporationBlueprint } from '$lib/game/corporations';

	interface Props {
		corporation: CorporationBlueprint;
		selected: boolean;
		onChoose: () => void;
	}

	let { corporation, selected, onChoose }: Props = $props();
</script>

<button
	type="button"
	aria-pressed={selected}
	class="flex cursor-pointer flex-col items-start gap-2 border p-3 text-left transition-colors
		{selected
		? 'border-accent bg-surface-strong'
		: 'border-border-soft hover:border-border hover:bg-surface'}"
	onclick={onChoose}
>
	<div class="flex w-full items-center gap-3">
		<Identicon name={corporation.name} size="2.75rem" />
		<div class="flex min-w-0 flex-col">
			<span
				class="truncate font-display text-[0.85rem] font-bold tracking-display text-text-strong
					uppercase"
			>
				{corporation.name}
			</span>
			<span
				class="flex items-center gap-[0.3rem] text-[0.7rem] tracking-label text-accent uppercase"
			>
				<Icon name={corporationKindIcon(corporation.kind)} weight="bold" size="0.7rem" />
				{corporationKindLabel(corporation.kind)}
			</span>
		</div>
	</div>
	<p class="text-1 text-text-muted">{corporation.description}</p>
</button>

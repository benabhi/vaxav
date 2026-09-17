<!--
	La mesa del piloto: lo que tiene publicado de un lado del mostrador.

	Es un componente y no el cuerpo de una pantalla porque **las dos pestañas
	—ventas y compras— muestran exactamente la misma tabla**, y tenerla dos veces
	sería garantizar que algún día se emprolije una y la otra no. Lo único que
	cambia entre las dos es qué órdenes le llegan y qué dice cuando no hay ninguna.

	Cancelar vive acá adentro: es la única cosa que se puede hacer con una orden
	propia sin abrir nada, y sacarla afuera obligaría a que cada pantalla que use
	esta tabla repita el formulario.
-->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import HudButton from '$lib/components/buttons/HudButton.svelte';
	import type { OrdenPropia } from '$lib/tipos';
	import HudTable, { type Columna } from '../ui/HudTable.svelte';

	interface Props {
		orders: readonly OrdenPropia[];
		/** Qué decir cuando no hay ninguna. Cambia según el lado. */
		empty: string;
	}

	let { orders, empty }: Props = $props();

	/**
	 * Cuánto falta para que venza, en palabras.
	 *
	 * Una fecha exacta obliga a hacer la cuenta; "en 3 d" se lee de un vistazo, que
	 * es lo único que se quiere saber de una orden que sigue viva.
	 */
	function cuando(at: number): string {
		const segundos = Math.max(0, Math.floor((at - Date.now()) / 1000));
		if (segundos < 60) return 'ya';
		if (segundos < 3600) return `en ${Math.max(1, Math.floor(segundos / 60))} min`;
		const horas = Math.floor(segundos / 3600);
		if (horas < 48) return `en ${horas} h`;
		return `en ${Math.floor(horas / 24)} d`;
	}

	/** Las columnas de las órdenes propias. */
	const COLUMNAS: Columna[] = [
		{ label: 'Ítem', width: '34%' },
		{ label: 'Quedan', width: '12%', class: 'text-right' },
		{ label: 'Precio', width: '14%', class: 'text-right' },
		{ label: 'Dónde', width: '20%' },
		{ label: 'Vence', width: '12%' },
		{ label: '', width: '8%', class: 'text-right' }
	];
</script>

<HudTable columns={COLUMNAS} minWidth="34rem" sticky={false}>
	{#each orders as orden (orden.id)}
		<tr class="border-b border-border-soft/40 last:border-0">
			<td class="py-[0.45rem] pr-3">
				<div class="flex min-w-0 flex-wrap items-center gap-2">
					<span class="truncate text-2 text-text-strong">{orden.name}</span>
					{#if orden.pending}
						<!--
								Todavía no está en el libro. Decirlo es lo que evita que el piloto
								la busque ahí y crea que se perdió.
							-->
						<span
							class="border border-border-soft px-[0.3rem] font-display text-[0.55rem]
									tracking-label text-text-muted uppercase"
						>
							Acordando
						</span>
					{/if}
				</div>
			</td>
			<td class="py-[0.45rem] pr-3 text-right font-mono text-[0.78rem] text-text-body">
				{orden.quantity} / {orden.initialQuantity}
			</td>
			<td class="py-[0.45rem] pr-3 text-right font-mono text-[0.78rem] text-accent-bright">
				{orden.price} CR
			</td>
			<td class="truncate py-[0.45rem] pr-3 text-2 text-text-body">{orden.stationName}</td>
			<td class="py-[0.45rem] pr-3 font-mono text-[0.72rem] text-text-muted">
				{cuando(orden.expiresAt)}
			</td>
			<td class="py-[0.45rem] text-right">
				<form
					method="POST"
					action="?/cancelar"
					use:enhance={() =>
						async ({ update }) => {
							await update();
							await invalidateAll();
						}}
				>
					<input type="hidden" name="orden" value={orden.id} />
					<HudButton type="submit" size="1" variant="ghost">Cancelar</HudButton>
				</form>
			</td>
		</tr>
	{:else}
		<tr>
			<td colspan="6" class="py-4 text-center text-1 text-text-muted">{empty}</td>
		</tr>
	{/each}
</HudTable>

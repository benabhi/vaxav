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
</script>

<div class="w-full overflow-x-auto">
	<table
		class="w-full min-w-[34rem] table-fixed border-collapse text-left
			[&_:is(th,td):first-child]:pl-2 [&_:is(th,td):last-child]:pr-2"
	>
		<!--
			En porcentajes y no en `rem`: esta tabla ocupa el ancho del panel, que es
			el de la pantalla, y con medidas fijas el ítem se quedaba con todo lo que
			sobraba y las otras cinco columnas terminaban amontonadas contra el borde.
		-->
		<colgroup>
			<col class="w-[34%]" />
			<col class="w-[12%]" />
			<col class="w-[14%]" />
			<col class="w-[20%]" />
			<col class="w-[12%]" />
			<col class="w-[8%]" />
		</colgroup>
		<thead>
			<tr class="border-b border-border-soft">
				{#each [{ label: 'Ítem', right: false }, { label: 'Quedan', right: true }, { label: 'Precio', right: true }, { label: 'Dónde', right: false }, { label: 'Vence', right: false }, { label: '', right: true }] as columna (columna.label)}
					<th
						class="py-2 pr-3 font-display text-1 tracking-label text-accent-dim uppercase
							{columna.right ? 'text-right' : ''}"
					>
						{columna.label}
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
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
		</tbody>
	</table>
</div>

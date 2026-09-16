<!--
	**La figura de la pantalla del registro**: la traza de actividad.

	Una barra por día del último mes. Contesta por su forma la pregunta con la que
	uno abre un registro —«¿cuándo pasó algo?»— sin leer una sola fila: un juego
	tranquilo es una línea baja y pareja, y una tarde en la que un administrador
	estuvo trabajando es un pico que se ve desde el otro lado de la habitación.
	Con datos distintos se ve distinta, que es el examen que separa una figura de
	un adorno.

	**Y además es el filtro.** Cada barra es un enlace al registro de ese día, así
	que mirar el pico y abrirlo son el mismo gesto. Enlaces y no botones: el día
	elegido queda en la URL y se puede citar.

	El alto es fijo y no sale de una proporción —al revés que el anillo de la nave
	o el hexágono del piloto—, y es a propósito: una banda de barras no se
	deforma al estirarse, sólo cambia el ancho de cada una. Lo que hay que cuidar
	es que siga siendo legible en un teléfono, y para eso alcanza con un alto que
	crece un escalón cuando hay ancho.
-->
<script lang="ts">
	import type { DiaRegistro } from '$lib/tipos';

	interface Props {
		days: readonly DiaRegistro[];
		/** El día abierto, o vacío si se miran todos. */
		selected: string;
		/** A dónde lleva cada barra. Vacío quiere decir «quitar el filtro de día». */
		href: (day: string) => string;
	}

	let { days, selected, href }: Props = $props();

	/**
	 * Contra qué se mide la barra más alta.
	 *
	 * El mínimo de 1 evita dividir por cero un registro vacío, y de paso hace que
	 * un único evento no dibuje una barra de altura completa: un día con uno solo
	 * no es un día movido.
	 */
	let techo = $derived(Math.max(1, ...days.map((dia) => dia.total)));

	/**
	 * El alto de una barra, en porcentaje.
	 *
	 * Los días vacíos no se dibujan a cero sino a una hilacha: la línea de base
	 * tiene que verse continua, o un mes tranquilo parecería un mes sin datos.
	 */
	function alto(total: number): string {
		if (total === 0) return '2%';
		return `${Math.max(8, Math.round((total / techo) * 100))}%`;
	}

	/** El día y el mes, que es lo que se lee al pasar por encima. */
	function etiqueta(dia: DiaRegistro): string {
		const [, mes, dia_] = dia.day.split('-');
		const cuenta = dia.total === 1 ? '1 evento' : `${dia.total} eventos`;
		return `${dia_}/${mes} · ${cuenta}`;
	}

	let desde = $derived(days.length > 0 ? days[0].day.slice(5).replace('-', '/') : '');
	let total = $derived(days.reduce((suma, dia) => suma + dia.total, 0));
</script>

<div class="flex w-full flex-col gap-2">
	<div class="flex h-[4rem] w-full items-end gap-[2px] border-b border-border-soft sm:h-[5.5rem]">
		{#each days as dia (dia.day)}
			{@const activo = dia.day === selected}
			<a
				href={href(activo ? '' : dia.day)}
				title={etiqueta(dia)}
				aria-current={activo ? 'true' : undefined}
				style="height: {alto(dia.total)}"
				class="min-w-[3px] flex-[1_1_0] transition-[background-color]
					{activo
					? 'bg-accent-bright shadow-glow'
					: dia.total > 0
						? 'bg-accent/70 hover:bg-accent-bright'
						: 'bg-border-soft hover:bg-accent-dim'}"
				aria-label={etiqueta(dia)}
			></a>
		{/each}
	</div>

	<!--
		Los extremos con su fecha y el techo de la escala. Sin el techo, dos trazas
		de meses distintos parecerían iguales aunque una tuviera diez veces más
		movimiento: una figura dice bien *cuál* y mal *cuánto*, y esto es lo que
		pone el *cuánto*.
	-->
	<div class="flex w-full items-center gap-3 font-mono text-[0.65rem] text-text-muted">
		<span>{desde}</span>
		<div class="grow"></div>
		<span>máx. {techo}/día · {total} en el mes</span>
		<div class="grow"></div>
		<span>hoy</span>
	</div>
</div>

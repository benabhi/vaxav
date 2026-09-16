<!--
	El canal de guías de un árbol: la sangría, los codos y la casilla del ícono.

	Es **sólo el dibujo de la rama**; qué dice la fila lo pone quien lo usa. Se
	separó del cuerpo del sistema cuando el constructor del universo necesitó el
	mismo árbol con otro contenido: las medidas de acá abajo costaron varias
	pasadas de afinado y duplicarlas era garantizar que las dos copias se
	desalinearan con el primer retoque.

	Las líneas **salen de abajo del ícono del padre**, atraviesan a todos sus hijos
	y se cortan en el último, así que la rama se sigue con el ojo sin contar
	espacios. Que salga de abajo y no de un costado importa sobre todo en la raíz:
	un cuerpo de profundidad cero no tiene codo que lo ate a nada, así que una
	línea que le naciera al lado se vería como una raya suelta en vez de como una
	rama. Y son varios: un sistema binario tiene dos estrellas, y cada una cuelga
	lo suyo.

	**Se dibuja con cajas de un píxel y no con caracteres**, para que el brazo del
	codo llegue exactamente al centro de la casilla del ícono. Un píxel de más
	desalinea el árbol entero.

	**Quien lo envuelva no puede ponerle relleno vertical a la fila.** El aire de
	arriba y de abajo lo pone el contenido, acá adentro: los trazos tienen que
	llegar al borde para que la línea de una fila toque la de la siguiente. Con
	relleno en la fila, cada trazo se corta antes del borde y la vertical que baja
	de la raíz queda en pedacitos. Ojo con envolverlo en un `<button>`, que trae el
	suyo del navegador y hay que apagarlo con `py-0`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../Icon.svelte';
	import type { IconName } from '$lib/icons';

	interface Props {
		depth: number;
		/**
		 * Una guía por columna de ancestro: `true` si la rama que pasa por esa
		 * columna todavía tiene algo abajo, y entonces su línea atraviesa esta fila.
		 */
		rails: readonly boolean[];
		/** Último hijo de su padre: se dibuja el codo y no la horquilla. */
		isLast: boolean;
		hasChildren: boolean;
		expanded: boolean;
		icon: IconName;
		/** Destacado: la casilla se llena de naranja, como todo lo elegido en Vaxav. */
		filled?: boolean;
		children: Snippet;
	}

	let {
		depth,
		rails,
		isLast,
		hasChildren,
		expanded,
		icon,
		filled = false,
		children
	}: Props = $props();

	/**
	 * Las medidas del canal, en rem. Van con nombre y en un solo lugar.
	 *
	 * `INDENT` es cuánto se corre cada nivel. Vale más que el ancho de media
	 * casilla a propósito: las verticales tienen que caer **bajo el centro del
	 * ícono del padre**, así que el hijo necesita arrancar a la derecha de ese
	 * punto para que el brazo del codo tenga dónde cruzar.
	 */
	const INDENT = 2;
	/** El ancho de la casilla del ícono, y su medio: ahí va la vertical. */
	const ICON = 2.25;
	const HALF = ICON / 2;
	/** A qué altura está el centro de la casilla: el aire de arriba más medio alto. */
	const ARM = 1.725;
	/** Dónde termina la casilla, que es de donde arranca la bajada a los hijos. */
	const HEAD = 2.85;
</script>

<!--
	Un trazo vertical del árbol, ubicado por su borde izquierdo.

	El aire de arriba y de abajo **no va en la fila sino en su contenido**: los
	trazos tienen que llegar al borde para que la línea de una fila toque la de la
	siguiente. Con el relleno en la fila, cada línea se cortaba antes del borde y
	el árbol quedaba en pedacitos.
-->
{#snippet vertical(left: number, top: number, height: string)}
	<span
		class="absolute w-0 border-l border-l-border-soft"
		style="left: {left}rem; top: {top}rem; height: {height}"
	></span>
{/snippet}

<div class="relative flex w-full items-start gap-0">
	<!--
		La sangría del cuerpo y las líneas de sus ancestros. Vienen justas —una marca
		por columna, de la raíz al abuelo— y la del padre directo no está entre
		ellas: ésa la dibuja el codo, que además sabe si cortarse.
	-->
	<span class="relative shrink-0 self-stretch" style="width: {depth * INDENT}rem">
		{#each rails as continues, index (index)}
			{#if continues}
				{@render vertical(index * INDENT + HALF, 0, '100%')}
			{/if}
		{/each}

		{#if depth > 0}
			{@render vertical((depth - 1) * INDENT + HALF, 0, isLast ? `${ARM}rem` : '100%')}
			<span
				class="absolute h-0 border-t border-t-border-soft"
				style="left: {(depth - 1) * INDENT + HALF}rem; top: {ARM}rem; width: {INDENT - HALF}rem"
			></span>
		{/if}
	</span>

	<!--
		La casilla del ícono es lo que le da estructura a la lista: sin ella los
		íconos flotan y el árbol se lee como un párrafo. El margen de arriba lo pone
		ella, porque la fila no puede tener relleno.

		De abajo de esta casilla —y centrada en ella— sale la línea hacia los hijos,
		que es lo que hace que la rama se vea nacer del cuerpo y no de un costado.
	-->
	<span class="relative shrink-0 self-stretch" style="width: {ICON}rem">
		<span
			class="mt-[0.6rem] flex h-[2.25rem] w-[2.25rem] items-center justify-center
				{filled
				? 'border border-transparent bg-accent shadow-glow'
				: 'border border-border-soft bg-surface'}"
		>
			<Icon
				name={icon}
				weight={filled ? 'fill' : 'duotone'}
				size="1.15rem"
				class={filled ? 'text-on-accent' : 'text-accent'}
			/>
		</span>

		{#if hasChildren && expanded}
			{@render vertical(HALF, HEAD, `calc(100% - ${HEAD}rem)`)}
		{/if}
	</span>

	<!--
		La línea que separa filas va acá y no en la fila entera: así cruza el texto
		pero no las columnas del árbol, que quedan de un trazo.
	-->
	<div
		class="flex w-full min-w-0 flex-col items-start gap-1 border-b border-border-soft py-[0.6rem] pl-[0.6rem]"
	>
		{@render children()}
	</div>
</div>

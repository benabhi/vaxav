<!--
	La tabla del HUD: el esqueleto que comparten todas las listas del juego.

	Existe porque el mismo bloque estaba copiado **seis veces** —la bitácora, los
	pilotos, la billetera, el mercado, las órdenes propias y el universo— con las
	mismas cinco decisiones repetidas en cada una: el contenedor que se desplaza
	solo en horizontal, el ancho mínimo, el encabezado pegado arriba, el relleno de
	las columnas de las puntas y el borde que se va en la última fila. Cambiar el
	aspecto de las tablas del juego significaba tocar seis archivos y acordarse de
	los seis.

	**Las columnas son un dato y no marcado.** De ahí salen tres cosas de una sola
	declaración: el `colgroup` con los anchos, los encabezados, y cuáles se pueden
	ordenar. Una columna que no declara `key` no ofrece orden, así que es imposible
	que un encabezado prometa un orden que el servidor no sabe hacer.

	**El orden son enlaces, no botones.** Cada orden es una URL distinta, así que se
	comparte, se vuelve con el botón de atrás y se recarga sin perderlo. Es el mismo
	criterio que ya usaba `Paginator`.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../Icon.svelte';

	/** Una columna de la tabla: cómo se llama, cuánto mide y si ordena. */
	export interface Columna {
		readonly label: string;
		/**
		 * La clave de orden que entiende el servidor, o vacío si no se ordena.
		 *
		 * Es la misma cadena que viaja en la URL y que la vista valida contra su
		 * tabla de órdenes: escribir acá una que allá no exista deja un encabezado
		 * que no hace nada.
		 */
		readonly key?: string;
		/** El ancho de la columna, para el `colgroup`: `12rem`, `auto`. */
		readonly width?: string;
		/** Clases del encabezado y de sus celdas: alineación, sobre todo. */
		readonly class?: string;
		/**
		 * Si la columna se esconde en pantalla chica y aparece a partir de `md`.
		 *
		 * Es una bandera y no una clase porque **esconder una columna no se escribe
		 * igual en los dos lugares**: la celda es `table-cell` y la columna del
		 * `colgroup` es `table-column`. Pasar la misma clase a los dos —que es lo
		 * natural de hacer— deja la tabla sin anchos y el texto de una columna
		 * encima del de la de al lado.
		 */
		readonly wide?: boolean;
	}

	interface Props {
		columns: readonly Columna[];
		/** Ancho mínimo antes de que la tabla se desplace adentro de su caja. */
		minWidth?: string;
		/** Por qué columna se está ordenando, y en qué sentido. */
		sort?: string;
		dir?: 'asc' | 'desc';
		/** A dónde lleva el encabezado de una columna ordenable. */
		sortHref?: (key: string) => string;
		/** Las filas. */
		children: Snippet;
		class?: string;
	}

	let {
		columns,
		minWidth = '40rem',
		sort = '',
		dir = 'asc',
		sortHref,
		children,
		class: extra = ''
	}: Props = $props();
</script>

<!--
	Se desplaza **adentro de su propia caja** y nunca arrastrando la página: una
	tabla ancha que mueve la pantalla entera rompe todo lo demás que hay alrededor.
-->
<div class="w-full overflow-x-auto {extra}">
	<table
		class="w-full table-fixed border-collapse text-left [&_:is(th,td):first-child]:pl-2
			[&_:is(th,td):last-child]:pr-2"
		style="min-width: {minWidth}"
	>
		<colgroup>
			{#each columns as columna, indice (indice)}
				<col
					class={columna.wide ? 'hidden md:table-column' : ''}
					style={columna.width ? `width: ${columna.width}` : ''}
				/>
			{/each}
		</colgroup>

		<!-- Pegado arriba: en una lista larga, saber qué columna se está mirando
		     importa más cuanto más lejos se llegó. -->
		<thead class="sticky top-0 z-10 bg-well">
			<tr class="border-b border-border-soft">
				{#each columns as columna, indice (indice)}
					<th
						class="py-2 pr-3 font-display text-1 tracking-label text-accent-dim uppercase
							{columna.wide ? 'hidden md:table-cell' : ''} {columna.class ?? ''}"
					>
						{#if columna.key && sortHref}
							<a
								href={sortHref(columna.key)}
								class="inline-flex items-center gap-1 no-underline hover:text-accent-bright
									{sort === columna.key ? 'text-accent-bright' : 'text-accent-dim'}"
							>
								{columna.label}
								<!--
									La flecha sólo en la columna activa. Una flecha apagada en cada
									encabezado dice «se puede ordenar» y ensucia seis veces algo que se
									descubre pasando el mouse una.
								-->
								{#if sort === columna.key}
									<Icon
										name={dir === 'asc' ? 'caret-up' : 'caret-down'}
										weight="bold"
										size="0.6rem"
									/>
								{/if}
							</a>
						{:else}
							{columna.label}
						{/if}
					</th>
				{/each}
			</tr>
		</thead>

		<tbody>
			{@render children()}
		</tbody>
	</table>
</div>

<!--
	Un cuerpo del sistema, colgado de su padre por un codo.

	Los conectores dicen quién cuelga de quién mejor que la sangría sola: la línea
	baja por la columna del padre, atraviesa a todos sus hijos y se corta en el
	último, así que la rama se sigue con el ojo sin contar espacios.

	**Se dibuja con cajas de un píxel y no con caracteres**, para que el brazo del
	codo llegue exactamente al centro de la casilla del ícono. Las medidas de más
	abajo son las que hacen que todo cuadre: un píxel de más desalinea el árbol
	entero.

	Se enciende al pasar el mouse: en trece renglones, saber cuál se está mirando
	cuesta menos que leer.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../Icon.svelte';
	import HudValue from '../typography/HudValue.svelte';
	import Label from '../typography/Label.svelte';
	import type { FilaCuerpo } from '$lib/tipos';

	interface Props {
		body: FilaCuerpo;
		expanded: boolean;
		onToggle: (code: string) => void;
		/** Las acciones de la fila: hoy sólo viajar. */
		actions?: Snippet<[FilaCuerpo]>;
		/** La marca de "estás acá", que es un disparador y vive en la fila real. */
		hereMarker?: Snippet;
	}

	let { body, expanded, onToggle, actions, hereMarker }: Props = $props();
</script>

<!--
	Ancho de una columna del árbol. Angosto a propósito: las verticales juntas es
	lo que hace que un árbol se lea como un árbol.

	El aire de arriba y de abajo **no va en la fila sino en su contenido**: las
	columnas tienen que llegar al borde para que la línea de una fila toque la de
	la siguiente. Con el relleno en la fila, cada línea se cortaba antes del borde
	y el árbol quedaba en pedacitos.

	`CONNECTOR_CENTER` (1.725rem) es a qué altura está el centro de la casilla del
	ícono —el aire de arriba más media casilla—, que es donde tiene que llegar el
	brazo del codo. `HEAD_HEIGHT` (2.85rem) es donde termina esa primera línea,
	que es de donde arranca la bajada al primer hijo.
-->
{#snippet vertical(top: string, height: string)}
	<span
		class="absolute left-1/2 w-0 border-l border-l-border-soft"
		style="top: {top}; height: {height}"
	></span>
{/snippet}

<!--
	Plegar y desplegar desde cualquier parte de la fila: en un teléfono, apuntarle
	a una flecha de doce píxeles no es una opción. Es **comodidad de puntero** y
	nada más: el control de verdad es la flecha, que es un botón con su nombre y
	se alcanza con el tabulador. Por eso la fila no lleva rol ni foco, y por eso
	se silencian las dos reglas: no hay nada que anunciarle a un lector de
	pantalla acá que la flecha no diga mejor.
-->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	class="relative w-full border-l-[3px] px-[0.7rem] transition-[background-color,border-color] hover:border-l-border
		{body.hasChildren ? 'cursor-pointer' : 'cursor-default'}
		{body.isHere
		? 'border-l-accent bg-surface-strong'
		: 'border-l-transparent bg-transparent hover:bg-surface-hover'}"
	id={body.isHere ? 'vaxav-aqui' : undefined}
	onclick={() => onToggle(body.code)}
>
	<div class="flex w-full items-start gap-0">
		<!--
			La columna de un ancestro: su línea vertical, si todavía sigue bajando.
			Cuando ese ancestro ya no tiene más hijos por debajo, la columna va vacía.
			Eso es lo que hace legible al árbol: las líneas que quedan dibujadas son
			exactamente las ramas que siguen abiertas.
		-->
		{#each body.rails as continues, index (index)}
			<span class="relative w-[1rem] shrink-0 self-stretch">
				{#if continues}{@render vertical('0', '100%')}{/if}
			</span>
		{/each}

		<!--
			El codo que ata la fila a su padre: `├─`, o `└─` si es el último. Ocupa la
			columna del padre, así que su tramo vertical cae justo debajo de la flecha
			de plegar del padre y la rama se ve continua.
		-->
		{#if body.depth > 0}
			<span class="relative w-[1rem] shrink-0 self-stretch">
				{@render vertical('0', body.isLast ? '1.725rem' : '100%')}
				<!--
					El brazo cruza también la columna del tallo, para llegar hasta el
					ícono: uno que se corta antes deja la fila flotando.
				-->
				<span
					class="absolute left-1/2 h-0 border-t border-t-border-soft"
					style="top: 1.725rem; width: calc(50% + 1rem)"
				></span>
			</span>
		{/if}

		<!--
			La columna propia del cuerpo: por acá baja la línea hacia sus hijos. Va
			vacía y sin nada encima; la flecha de plegar está al lado del nombre para
			no cruzarle el trazo justo donde tiene que verse continuo.
		-->
		<span class="relative w-[1rem] shrink-0 self-stretch">
			{#if body.hasChildren && expanded}
				{@render vertical('2.85rem', 'calc(100% - 2.85rem)')}
			{/if}
		</span>

		<!--
			La casilla del ícono es lo que le da estructura a la lista: sin ella los
			íconos flotan y el árbol se lee como un párrafo. Donde está el piloto se
			llena de naranja, que es como el juego marca lo elegido en todas partes.
			El margen de arriba lo pone ella, porque la fila no puede tener relleno.
		-->
		<span
			class="mt-[0.6rem] flex h-[2.25rem] w-[2.25rem] shrink-0 items-center justify-center
				{body.isHere
				? 'border border-transparent bg-accent shadow-glow'
				: 'border border-border-soft bg-surface'}"
		>
			<Icon
				name={body.icon}
				weight={body.isHere ? 'fill' : 'duotone'}
				size="1.15rem"
				class={body.isHere ? 'text-on-accent' : 'text-accent'}
			/>
		</span>

		<!--
			La línea que separa filas va acá y no en la fila entera: así cruza el texto
			pero no las columnas del árbol, que quedan de un trazo.
		-->
		<div
			class="flex w-full min-w-0 flex-col items-start gap-1 border-b border-border-soft py-[0.6rem] pl-[0.6rem]"
		>
			<div class="flex min-h-[2.25rem] w-full flex-nowrap items-center gap-2">
				<!--
					La flecha de plegar, pegada al nombre: acá no le pisa la línea a nadie
					y queda donde el ojo ya está mirando. Una hoja no dibuja nada, y el
					hueco lo sostiene la casilla del ícono.
				-->
				{#if body.hasChildren}
					<button
						type="button"
						class="flex cursor-pointer items-center {body.isHere
							? 'text-accent-bright'
							: 'text-accent-dim'}"
						aria-expanded={expanded}
						aria-label="{expanded ? 'Plegar' : 'Desplegar'} {body.name}"
						onclick={(evento) => {
							// La fila entera pliega al clic: sin esto el botón dispararía
							// las dos cosas y se volvería a desplegar en el acto.
							evento.stopPropagation();
							onToggle(body.code);
						}}
					>
						<Icon name={expanded ? 'caret-down' : 'caret-right'} weight="bold" size="0.7rem" />
					</button>
				{/if}

				<!--
					Cede espacio antes que forzar el salto de línea: el nombre se trunca
					si hace falta, para que las columnas de la derecha no se empujen a un
					segundo renglón. No crece: así la mira queda pegada justo después del
					texto y no empujada al fondo.
				-->
				<span
					class="min-w-[3rem] flex-[0_1_auto] overflow-hidden font-display text-[0.92rem] font-bold
						tracking-display text-ellipsis whitespace-nowrap uppercase
						{body.isHere ? 'text-accent-bright' : 'text-text-strong'}"
				>
					{body.name}
				</span>

				<!--
					Después del nombre y no antes: es un dato sobre el cuerpo, no parte de
					su título. Ancho fijo aunque esté vacío: sin esto sólo la fila "aquí"
					ocuparía ese espacio y las columnas de la derecha quedarían
					desalineadas respecto al resto.
				-->
				<span class="w-[1.5rem] shrink-0">
					{#if body.isHere && hereMarker}{@render hereMarker()}{/if}
				</span>

				<!-- Lo que se ve de una rama plegada: que hay algo adentro. -->
				{#if body.hasChildren && !expanded}
					<span
						class="flex shrink-0 items-center gap-[0.3rem] border border-border-soft px-[0.4rem]
							py-[0.12rem] text-accent-dim"
					>
						<Icon name="circles-three" weight="bold" size="0.7rem" />
						<span
							class="font-display text-[0.62rem] font-semibold tracking-label whitespace-nowrap uppercase"
						>
							Plegado
						</span>
					</span>
				{/if}

				<!--
					Cuatro columnas de ancho fijo: caen en el mismo lugar en cada fila, así
					que "Explorado", el tipo, la distancia y las acciones quedan alineados
					verticalmente entre renglones en vez de correrse según el contenido.
					Cada celda recorta lo que no entra en vez de solaparse con la de al
					lado.
				-->
				<div class="ml-auto flex shrink-0 items-center gap-2">
					<span class="w-[5.25rem] overflow-hidden">
						<!--
							El sistema inicial está entero cartografiado, así que hoy todas
							dicen lo mismo. Se muestra igual: cuando existan sistemas a medio
							levantar, la lista va a estar leyéndose con esta misma etiqueta.
							Lo conocido se dice bajito; lo que falta encontrar se enciende.
						-->
						<span
							class="flex min-w-0 items-center gap-[0.25rem] overflow-hidden
								{body.explored ? 'text-text-muted' : 'text-accent'}"
						>
							<Icon name={body.explorationIcon} weight="bold" size="0.65rem" />
							<span
								class="overflow-hidden font-display text-[0.6rem] font-semibold tracking-label
									text-ellipsis whitespace-nowrap uppercase"
							>
								{body.exploration}
							</span>
						</span>
					</span>
					<span class="w-[4.25rem] overflow-hidden">
						<Label class="overflow-hidden text-ellipsis whitespace-nowrap">{body.kind}</Label>
					</span>
					<span class="w-[2.75rem] overflow-hidden">
						{#if body.distance}
							<span class="font-mono text-[0.72rem] whitespace-nowrap text-data">
								{body.distance}
							</span>
						{/if}
					</span>
					<!--
						`min-width` en vez de `width`: en la fila del piloto no hay ningún
						botón, y sin reservar al menos ese ancho el bloque entero de columnas
						—empujado con `ml-auto`— se corre y desalinea las demás filas. Que sea
						un mínimo y no un ancho fijo es lo que deja crecer el bloque el día
						que haya más de una acción.
					-->
					<div class="flex min-w-[4.5rem] shrink-0 items-center gap-2">
						{#if actions}{@render actions(body)}{/if}
					</div>
				</div>
			</div>

			<p class="text-1 leading-[1.65] text-text-muted">{body.description}</p>

			{#if body.isStation}
				<div class="flex w-full flex-col items-start gap-2 pt-[0.15rem]">
					<!-- Quién la opera y a quién responde: la facción se lee a través de
						 la corporación, no al revés. -->
					<div class="flex flex-wrap items-center gap-[0.4rem]">
						<HudValue class="text-[0.72rem]">{body.corporation}</HudValue>
						<Label>{body.corporationKind}</Label>
						<span class="text-accent-dim">·</span>
						<Label>{body.owner}</Label>
					</div>
					<div class="flex flex-wrap items-center gap-[0.35rem]">
						{#each body.services as service (service)}
							<span class="border border-border-soft bg-surface px-2 py-[0.15rem]">
								<span
									class="font-display text-[0.68rem] font-semibold tracking-display whitespace-nowrap text-accent-bright uppercase"
								>
									{service}
								</span>
							</span>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<!--
	Un cuerpo del sistema, colgado de su padre por un codo.

	El dibujo de la rama —la sangría, los codos y la casilla del ícono— lo pone
	`TreeBranch`, que es el mismo que usa el constructor del universo. Acá queda
	lo que esta pantalla tiene de propio: qué dice la fila, qué columnas de datos
	lleva a la derecha y qué se puede hacer con el cuerpo.

	Se enciende al pasar el mouse: en trece renglones, saber cuál se está mirando
	cuesta menos que leer.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '../Icon.svelte';
	import HudValue from '../typography/HudValue.svelte';
	import Label from '../typography/Label.svelte';
	import TreeBranch from '../ui/TreeBranch.svelte';
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
	Plegar y desplegar desde cualquier parte de la fila: en un teléfono, apuntarle
	a una flecha de doce píxeles no es una opción. Es **comodidad de puntero** y
	nada más: el control de verdad es la flecha, que es un botón con su nombre y
	se alcanza con el tabulador. Por eso la fila no lleva rol ni foco, y por eso
	se silencian las dos reglas: no hay nada que anunciarle a un lector de
	pantalla acá que la flecha no diga mejor.
-->
<!--
	**Dos marcas y no una.** El naranja dice dónde estás parado y el cian adónde
	venís, y conviven: mientras la nave está en camino el piloto sigue teniendo
	guardado el cuerpo del que salió, así que el árbol muestra las dos puntas del
	viaje. Es el mismo cian que el mapa usa para el tramo en curso, y por la misma
	regla: en este juego el cian quiere decir **vos** —dónde estás y adónde vas—.
-->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	class="relative w-full border-l-[3px] px-[0.7rem] transition-[background-color,border-color] hover:border-l-border
		{body.hasChildren ? 'cursor-pointer' : 'cursor-default'}
		{body.isHere
		? 'border-l-accent bg-surface-strong'
		: body.isDestination
			? 'border-l-data bg-data-wash'
			: 'border-l-transparent bg-transparent hover:bg-surface-hover'}"
	id={body.isHere ? 'vaxav-aqui' : undefined}
	onclick={() => onToggle(body.code)}
>
	<TreeBranch
		depth={body.depth}
		rails={body.rails}
		isLast={body.isLast}
		hasChildren={body.hasChildren}
		{expanded}
		icon={body.icon}
		filled={body.isHere}
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
						: body.isDestination
							? 'text-data'
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
						{body.isHere ? 'text-accent-bright' : body.isDestination ? 'text-data' : 'text-text-strong'}"
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

		<!--
			Las frases van cada una en su renglón, no unidas en un párrafo: son datos
			distintos —qué es, qué se respira, quién lo cuida— y separadas se barren
			de un vistazo. Puede no venir ninguna, y ahí no se dibuja nada: una
			estación ya dice abajo lo que tiene.
		-->
		{#each body.description as frase (frase)}
			<p class="text-1 leading-[1.65] text-text-muted">{frase}</p>
		{/each}

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
	</TreeBranch>
</div>

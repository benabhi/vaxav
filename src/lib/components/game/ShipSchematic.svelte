<!--
	El dibujo de alambre de la nave, al centro del anillo.

	Una silueta genérica y no el casco concreto: dibujar cinco naves distintas es
	trabajo de arte, y la figura ya cumple su función —dar centro y decir "acá
	está tu nave"— siendo una sola. No hay arte de naves en el proyecto, y el
	alambre es justamente el lenguaje del juego que se imita.

	El centrado lo hace la caja y no el `<svg>`: en SVG, `transform` es un
	atributo del dibujo y no CSS, así que no entiende porcentajes. Puesto ahí, se
	ignora sin avisar y la nave queda corrida media figura abajo y a la derecha.
-->
<div
	class="pointer-events-none absolute top-1/2 left-1/2 h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2"
>
	<svg
		viewBox="0 0 100 100"
		width="100%"
		height="100%"
		aria-hidden="true"
		style="filter: drop-shadow(0 0 12px rgb(255 122 26 / 0.4))"
	>
		<!-- Casco: una punta de flecha con las alas hacia atrás. -->
		<path
			d="M50 4 L62 32 L88 62 L88 76 L58 66 L54 92 L50 97 L46 92 L42 66 L12 76 L12 62 L38 32 Z"
			fill="rgb(255 122 26 / 0.06)"
			stroke="var(--color-accent)"
			stroke-width="1.4"
			stroke-linejoin="round"
		/>
		<!-- Nervaduras internas: lo que convierte una silueta en un esquema. -->
		<path
			d="M50 4 L50 97 M38 32 L62 32 M42 66 L58 66"
			stroke="var(--color-accent-dim)"
			stroke-width="0.9"
		/>
		<!-- Toberas. -->
		<path
			d="M44 92 L56 92"
			stroke="var(--color-accent-bright)"
			stroke-width="3"
			stroke-linecap="round"
		/>
	</svg>
</div>

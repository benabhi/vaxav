<!--
	Aviso de error. No ocupa lugar mientras no haya nada que decir.

	**Se trae a la vista solo.** En una pantalla larga —el constructor de sistemas,
	la ficha de un piloto— el aviso queda arriba y el formulario que falló abajo,
	así que quien aprieta el botón no ve nada y cree que no pasó nada. Que el
	componente se ocupe de esto y no cada pantalla es lo que hace que ninguna se
	olvide.

	`block: 'center'` y no `'start'`: arriba de todo suele haber una barra pegada, y
	al centro el aviso nunca queda debajo de ella.
-->
<script lang="ts">
	import Icon from '../Icon.svelte';

	interface Props {
		message?: string | null;
	}

	let { message = '' }: Props = $props();

	let caja = $state<HTMLElement | null>(null);

	$effect(() => {
		// Se lee `message` para que el efecto vuelva a correr con cada error nuevo,
		// incluso si es el mismo texto dos veces seguidas.
		if (!message || !caja) return;
		caja.scrollIntoView({ block: 'center' });
	});
</script>

{#if message}
	<div
		bind:this={caja}
		role="alert"
		class="flex w-full items-center gap-3 border border-danger bg-danger-wash px-[0.9rem] py-[0.7rem]"
	>
		<Icon name="warning" weight="fill" size="1rem" class="text-danger" />
		<p class="text-2 text-text-strong">{message}</p>
	</div>
{/if}

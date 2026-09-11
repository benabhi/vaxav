<!--
	La hora, en UTC.

	Todo el juego mide el tiempo en UTC, así que es la hora que importa para los
	temporizadores. La cuenta el navegador: si su reloj está mal, el número va a
	estar mal, pero lo que resuelve las acciones es siempre el instante guardado
	en el servidor.
-->
<script lang="ts">
	let ahora = $state(new Date());

	$effect(() => {
		const reloj = setInterval(() => (ahora = new Date()), 1000);
		return () => clearInterval(reloj);
	});

	let hora = $derived(ahora.toISOString().slice(11, 19));
</script>

<span class="font-mono text-[0.8rem] text-accent-bright">{hora}</span>

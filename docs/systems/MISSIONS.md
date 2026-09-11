# Agentes, reputación y misiones

> **Implementado en parte**: los agentes existen, están sentados en las
> estaciones y se ven en la pantalla de Ubicación. La reputación es una regla
> pura, todavía sin guardar. Las misiones no existen y **no tienen fase
> asignada** en el [roadmap](../ROADMAP.md).
>
> Ver también: [corporaciones](CORPORATIONS.md) · [facciones](FACTIONS.md) ·
> [universo](UNIVERSE.md)

## Los agentes

Un **agente** es un NPC sentado en una estación que reparte trabajo. No trabaja
para la estación: trabaja para una **corporación**, y puede estar sentado en una
estación que opera otra.

Eso último es lo que hace que una estación sea un lugar y no un edificio. En
Puerto Ánfora, que opera Casa Verlan, atienden además un enlace de la Extractora
Anillo —que responde a otra facción— y una capitana de la Vigilia Ánfora, que no
opera ninguna estación y existe sólo como gente. Una corporación no es una
estación con otro nombre.

**La cantidad varía y eso es contenido, no un descuido.** Puerto Ánfora tiene
cuatro, el Muelle dos, la Planta Escarcha ninguno. Un puerto con gente y un
puesto industrial vacío se distinguen antes de leer una sola línea.

Un agente necesita el módulo de **Contactos** en su estación: sin él no hay dónde
recibir a nadie. Es un invariante del plano y hay una prueba que lo sostiene.

### Especialidades

De qué van las misiones que reparte: **transporte, minería, comercio, combate y
exploración**. Una por cada forma de jugar, más el transporte, que engancha a
todas las demás.

## Los cinco niveles

Como en EVE, las misiones van del **1 al 5** y cada agente reparte las de su
nivel. No se llega al de arriba pidiendo: se llega habiendo hecho los de abajo.
Ésa es la razón de que exista la reputación —darle una escalera al jugador—, y no
la de tener un número más en la ficha.

## La reputación

Escala entera de **0 a 100**, sin decimales: dos pilotos nunca tienen que poder
calcular distinto por un redondeo.

| Escalón     | Reputación | Abre      |
| ----------- | ---------- | --------- |
| Desconocido | 0          | Nivel I   |
| Conocido    | 10         | Nivel II  |
| Confiable   | 25         | Nivel III |
| Aliado      | 50         | Nivel IV  |
| Leal        | 80         | Nivel V   |

Son **datos de balance**: los números se van a mover cuando haya misiones que los
pongan a prueba, y moverlos tiene que ser cambiar esa tabla y nada más.

### Se sube con tres cosas a la vez

Terminar una misión sube la reputación con **el agente que la dio, su corporación
y la facción de esa corporación**.

**Por ahora sólo la de facción abre misiones.** Las otras dos se guardan para
cuando haya algo que quieran comprar: precios distintos en un mercado, acceso a
una estación cerrada, un contrato que no se publica. Definir tres monedas de
confianza y usar una sola es prematuro; definir una sola y necesitar tres después
es peor.

### Sin bandera no hay papeles

Un agente de una corporación que no responde a ninguna de las tres **atiende a
cualquiera**, sin importar el nivel. No es un agujero: es el atractivo de un
puerto franco. Al Amarre Franco se llega antes y se llega sin haberle caído bien
a nadie, y esa es exactamente la clase de decisión que el juego quiere ofrecer.

### Todavía no se guarda

No hay tabla de reputación. La escriben las misiones, y las misiones no existen,
así que una tabla hoy sería una columna vacía sin nadie que la escriba —el mismo
criterio que se usó para no agregar todavía qué corporación reclamó un sistema—.

Mientras tanto todo piloto está en cero, y **la pantalla lo dice**: los agentes
que no atienden se ven igual, apagados, con cuánta reputación hace falta. Esconder
lo que falta sería más prolijo y mucho peor: lo que se ve es la escalera que el
jugador tiene por delante.

## Los retratos

Cada agente tiene su hueco de retrato en la ficha. Las imágenes viven en
`static/portraits/` y **se descubren, no se declaran**: se recorre la carpeta
entera, subcarpetas incluidas, y lo único que importa es el nombre del archivo.

- Un archivo que se llama como un agente —`verlan_aduana.webp`— es _su_ retrato,
  esté guardado donde esté.
- Todo lo demás va a un **fondo común** que se reparte entre los que no tienen
  uno propio, de forma estable: el mismo agente saca siempre el mismo retrato.

Los del fondo se llaman **`<rasgo>-<número>`** —`m-0001`, `f-0002`, `x-` para
todo lo demás—, y **cada agente declara su rasgo** en el plano, así que el reparto
respeta la cara que le corresponde. Si todavía no hay retratos de ese rasgo, se
cae al fondo entero: una cara que no encaja del todo es mejor que un hueco vacío.

El rasgo va en el nombre del archivo y no en una carpeta justamente porque las
carpetas no cuentan: así sobrevive a cualquier reordenamiento, y un generador
puede escribir donde le quede cómodo.

Así la carpeta se puede ordenar como convenga y el día que haya un generador de
retratos alcanza con dejar las imágenes ahí para que aparezcan en el juego, sin
tocar una línea de código. Las reglas y cómo preparar las imágenes están en
`assets/portraits/LEEME.md`.

Sin imagen queda una silueta, que dice que ahí falta algo mejor que una foto
genérica repetida en diez fichas.

## Por decidir

- Si la reputación puede ser **negativa**, y qué pasa cuando una facción te odia.
- Si trabajar para una facción baja la reputación con otra, como en EVE.
- Cómo se generan las misiones concretas: a mano, por plantilla o por sistema.
- Si un agente tiene un cupo de trabajo, o reparte sin límite.
- Qué hacen la reputación con la corporación y con el agente, además de existir.

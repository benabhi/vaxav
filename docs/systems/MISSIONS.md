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

Escala de **0 a 100**, **guardada en milésimas enteras**. Los decimales se ven —la
pantalla dice `12,40`— pero adentro no hay un solo número con coma flotante: dos
pilotos nunca tienen que poder calcular distinto por un redondeo, que es la misma
razón por la que los créditos son enteros.

Hay decimales porque **hacen falta**. Lo que se gana es una fracción de lo que
falta, así que cerca del último escalón una misión mueve dos décimas de punto: con
una escala entera eso se redondearía a cero y la escalera se moriría justo donde
tenía que ponerse interesante.

| Escalón     | Reputación | Abre      |
| ----------- | ---------- | --------- |
| Desconocido | 0          | Nivel I   |
| Conocido    | 10         | Nivel II  |
| Confiable   | 25         | Nivel III |
| Aliado      | 50         | Nivel IV  |
| Leal        | 80         | Nivel V   |

Son **datos de balance**: los números se van a mover cuando haya misiones que los
pongan a prueba, y moverlos tiene que ser cambiar esa tabla y nada más.

### Cuánto cuesta subir

**Se gana una fracción de lo que falta, no una cantidad fija**, como en EVE:

```
ganancia = (100 − actual) × 0,25 % × nivel de la misión
```

Es lo que hace que el sistema aguante un juego largo sin números gigantes. El
primer punto sale casi gratis; el tramo de Aliado a Leal cuesta cinco veces más; y
**nunca se llega a cien**. Un tope que se alcanza deja de significar algo, una
asíntota no.

De cero a Leal con una corporación son **doscientas veinticinco misiones**,
subiendo de nivel al tocar cada escalón:

| Tramo                  | Con misiones de | Misiones | Acumulado |
| ---------------------- | --------------- | -------- | --------- |
| Desconocido → Conocido | Nivel I         | 43       | 43        |
| Conocido → Confiable   | Nivel II        | 36       | 79        |
| Confiable → Aliado     | Nivel III       | 54       | 133       |
| Aliado → Leal          | Nivel IV        | 92       | 225       |

Cada tramo es del orden del anterior y el último es el doble que el primero:
ninguno es un muro, y el final se siente como un final. La constante —veinticinco
diezmilésimas por nivel— es un dato de balance más, y un test recorre las
doscientas veinticinco para que moverla sea una decisión y no un descuido.

### Se sube con tres cosas a la vez

Terminar una misión sube la reputación con **el agente que la dio, su corporación
y la facción de esa corporación**. La del agente se guarda para cuando tenga algo
que ofrecer; **las otras dos abren trabajo, y son dos escaleras distintas**.

| Escalera           | Qué abre                                                       | Qué cuesta           |
| ------------------ | -------------------------------------------------------------- | -------------------- |
| **La corporación** | Los agentes **de esa corporación**                             | Lo que dice la tabla |
| **La facción**     | Ese nivel en **todas** las corporaciones que llevan su bandera | Mucho más            |

Al agente le alcanza con que **una de las dos** llegue: vale la que esté más
arriba, y no se suman. Sumarlas haría que ninguna significara nada por sí sola —dos
escalones a medio subir no hacen uno entero—.

Que sean dos es lo que convierte a la reputación en una decisión en vez de una
barra que sube. La de la corporación es la barata y hace que **elegir para quién
trabajar importe**; la de la facción es el atajo del que ya se ganó el nombre en
todo el sector, y por eso cuesta lo que cuesta.

Y abre lo que abre **y nada más**: en Puerto Ánfora hay una agente de la Extractora
Anillo, que es concorde, sentada en un puerto del Dominio. Con el Dominio al tope,
ella sigue sin atender.

### Sin bandera no hay papeles

Un agente de una corporación que no responde a ninguna de las tres **atiende a
cualquiera**, sin importar el nivel. No es un agujero: es el atractivo de un
puerto franco. Al Amarre Franco se llega antes y se llega sin haberle caído bien
a nadie, y esa es exactamente la clase de decisión que el juego quiere ofrecer.

### Dónde se guarda

En dos tablas, como los créditos: `standing` con el valor que se lee en cada
pantalla y `standing_entry` con el libro que lo explica. El valor **no se edita**:
es la suma de sus asientos, y un test recorre el código fuente para que nadie más
que `services/reputation.ts` escriba la tabla. El histórico paginado que muestra
la pestaña no es una tabla aparte: **es ese libro**.

Una sola tabla para corporaciones y facciones, con `subject_kind` diciendo cuál:
la pregunta es la misma para las dos. Por código y no por identificador, porque
las facciones no tienen tabla. Y **sin fila es cero**, que es donde arranca todo
el mundo: nadie nace con cuarenta filas en cero, una por cada corporación del
sector.

Lo que se recorta se asienta recortado. Un asiento de «+1,00» sobre un piloto que
estaba a 0,30 del techo sería una mentira prolija, y además rompería la suma del
libro contra el valor guardado.

### Dónde se mira

En **tres lugares distintos**, y cada uno contesta una pregunta que los otros no:

| Dónde                    | Qué muestra                                                                                        |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| Corporación · Reputación | La escalera con **ésta**: dónde estás, qué abre el próximo escalón y el histórico de cómo llegaste |
| Ubicación                | Cuál de los agentes **de esta estación** te atiende, y qué le falta al que no                      |
| Piloto · Reputación      | El panorama: toda facción y toda corporación con la que tengas número                              |

La tercera **todavía no existe**, y es a propósito: hoy sería una lista de una
fila. Se gana el lugar cuando las misiones repartan números con varias, que es
cuando aparece la pregunta que sólo ella contesta —«¿con quién me conviene seguir
trabajando?»—. Va en Piloto y no en Corporación porque es del piloto: sobrevive a
renunciar.

Lo mismo con la **reputación con el agente**: el esquema le deja lugar y nadie la
escribe. Cuando haga algo además de existir, su lugar es la ficha de la
corporación, al lado de la gente que reparte trabajo.

### Todavía no la escribe nadie

La máquina está puesta y **le falta la fuente**: la reputación la mueven las
misiones, y las misiones no existen. Hasta entonces todo piloto está en cero.

Y **la pantalla lo dice**: los agentes que no atienden se ven igual, apagados, con
cuánta reputación hace falta y con quién. Esconder lo que falta sería más prolijo
y mucho peor: lo que se ve es la escalera que el jugador tiene por delante.

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

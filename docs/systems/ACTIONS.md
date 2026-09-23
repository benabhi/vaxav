# Acciones, tiempo y experiencia

> **Implementado en parte.** El motor de acciones existe: se encola una orden por
> vez, se resuelve de forma perezosa e idempotente y deja su informe en la
> bitácora. Hay cinco acciones: **viajar**, **saltar**, **escanear**, **minar** y
> **acordar una orden** del mercado. Los números están para discutirse.

> **La experiencia ya no se reparte entre habilidades**: una acción deposita en el
> pozo de su familia. Ver [habilidades](SKILLS.md).
>
> Ver también: [habilidades](SKILLS.md) · [naves](SHIPS.md) ·
> [universo](UNIVERSE.md) · [mercado](MARKET.md) · [interfaz](INTERFACE.md)

**Toda acción ocupa el único turno del piloto**, y ésa es la regla que sostiene el
balance de todo lo demás: cualquier forma de ganar experiencia compite con las
otras por el mismo recurso, que es el tiempo real. Por eso acordar una orden del
mercado paga Comercio sin abrir una granja: el minuto que se va en un trámite es
un minuto que no se está minando.

Todo lo que hace un piloto en Vaxav es una **acción**: viajar, minar, refinar,
reparar, comerciar, escanear. Las acciones son la única forma de cambiar el
estado del mundo, y la única forma de ganar experiencia.

## Anatomía de una acción

| Campo                   | Qué guarda                                                      |
| ----------------------- | --------------------------------------------------------------- |
| Tipo                    | Viajar, minar, refinar, reparar…                                |
| Inicio                  | Instante exacto en que se dio la orden                          |
| Duración                | Calculada al empezar, ya con todos los bonos aplicados          |
| Origen / destino        | Dónde ocurre, y hacia dónde si es un desplazamiento             |
| Habilidad principal     | La que se lleva el pozo completo de XP                          |
| Habilidades secundarias | Reciben el 15 % del pozo cada una                               |
| Resultado               | Se calcula al resolver: qué se obtuvo, qué se gastó, qué cambió |

**Y toda acción declara de dónde sale**: qué módulos necesita montados y qué
habilidades cambian su resultado. No es un adorno de la interfaz, es parte de la
acción: sin eso el jugador descubre lo que le falta sólo cuando le falta, que es
tarde. Cómo se dibuja está en
[la procedencia de una acción](INTERFACE.md#la-procedencia-de-una-acción); por qué
es obligatorio, en [«la cadena»](../DESIGN.md#la-cadena-se-muestra-o-no-existe).

## Cuánto tarda

```
duración = duración base de la acción ÷ (1 + bonos)
```

Los **bonos** son una sola bolsa, y ahí está la gracia del sistema: se suman los
de las habilidades, los fijos de la nave, los de los módulos montados y los de la
facción. Una misma orden tarda distinto para dos pilotos distintos, y esa
diferencia **es** la progresión.

Ejemplo: minar tiene una base de 60 minutos. Un piloto con Minería III (+15 %),
una nave con +10 % y un módulo de extracción con +20 % acumula 0,45 de bono:
60 ÷ 1,45 ≈ **41 minutos**.

Los bonos se suman, no se multiplican: es más fácil de explicar al jugador, más
fácil de balancear, y evita que apilar seis fuentes chicas rompa el juego.

**Y un bono se aplica una sola vez.** Viajar es el caso testigo: su duración son
dos sumandos —la alineación de la nave más la distancia dividida por su velocidad
de warp— y **Maniobra no vuelve a entrar en la cuenta**, porque ya está adentro de
la alineación que calcula la hoja de la nave. Contarla dos veces para el mismo
efecto es la forma más fácil de romper el balance sin que se note.

**Viajar es además el único verbo con forma propia**, y no por capricho: la mitad
de su reloj no depende de la distancia, así que no hay una duración base que
dividir. La fórmula entera, de dónde sale cada uno de sus dos números y qué se
durmió al cambiarla están en
[viajar es alinearse y cruzar](SHIPS.md#viajar-es-alinearse-y-cruzar).

## Cómo se resuelve

Las acciones **no** se resuelven con un proceso que tickea en segundo plano. Se
guardan con su instante de inicio y su duración, y se resuelven de forma
**perezosa**: cuando el jugador entra —o cuando cualquier consulta necesita el
estado real— se calcula todo lo que ya venció y se aplica en orden.

Consecuencias buscadas:

- El servidor no trabaja mientras nadie juega.
- El resultado es idéntico estés conectado o no. Nadie gana por quedarse mirando.
- El reloj que se ve en pantalla es decorativo: **la verdad es el instante
  guardado en la base**.

## El informe

Cuando una acción vence, el jugador recibe un **informe**: qué se hizo, cuánto
tardó, qué salió y cuánta experiencia fue a cada habilidad.

```
┌─────────────────────────────────────────────┐
│ EXTRACCIÓN COMPLETADA        hace 3 minutos │
│ Anillos de Ánfora III                       │
│                                             │
│ Obtenido    148 m³ de silicato ferroso      │
│ Bodega      148 / 200 m³                    │
│                                             │
│ Minería          +600 XP    (nivel 2, 61 %) │
│ Estiba            +90 XP                    │
│ Prospección       +90 XP                    │
└─────────────────────────────────────────────┘
```

Los informes se acumulan en la **bitácora**, que es lo primero que se lee al
volver. En un juego donde las cosas pasan mientras no estás, la bitácora no es un
adorno: es el relato de tu partida.

## Ejemplo completo

El caso que define el bucle. Un piloto está en Puerto Ánfora y quiere minar.

1. **Ordena viajar** a los Anillos de Ánfora III. La duración sale de lo que su
   nave tarda en alinearse más la distancia dividida por su velocidad de warp:
   12 minutos.
2. **El contador corre.** El piloto cierra la pestaña y se va a hacer otra cosa.
3. **Al volver**, la acción ya venció: informe de viaje, posición nueva y
   +120 XP al pozo de Pilotaje.
4. **Ordena minar.** 41 minutos, calculados como en el ejemplo de arriba.
5. **Al volver**, el segundo informe: 148 m³ en bodega y +600 XP al pozo de
   Extracción, que después se reparte comprando niveles.
6. **Decide**: seguir minando, volver a vender, o gastar el viaje en otra cosa.
   La bodega llena obliga a elegir, que es de lo que se trata.

## Saltar

Cruzar una puerta estelar es una acción como cualquier otra —tiene inicio,
duración y resolución perezosa— con una sola diferencia: **es la única que cambia
de sistema**.

**Se salta parado en la puerta.** No desde cualquier lado del sistema: hay que
viajar hasta ella primero. Eso es lo que hace que la distancia orbital de una
puerta importe —una puerta lejos de la estrella cuesta un viaje largo antes del
salto— y lo que ata el mapa de adentro del sistema con el de la galaxia.

### Cruzar es gratis

**No cuesta combustible, no pide alcance, y la misma puerta tarda lo mismo para
cualquier nave.** Lo único que hay para saber antes de apretar es cuánto tarda:

```
duración = máx(1, 240 s por año luz · distancia de la puerta)
```

La distancia de la puerta es lo único que entra en la cuenta. Es **un dato del
universo y no de la nave**: montar un calibrador de salto no acorta el cruce ni
un segundo, y lo que sí lo acorta es que la puerta esté más cerca. **Nada llega
nunca a cero**: el tiempo tiene su piso de un segundo, igual que el viaje dentro
del sistema.

Hasta acá el salto cobraba combustible por masa y distancia, exigía que el
alcance del motor llegara, y dividía el tiempo por ese alcance. Las tres cosas se
fueron juntas, y el razonamiento importa más que la regla:

- **En EVE cruzar un stargate es gratis**, sin excepciones prácticas. Lo que
  Vaxav cobraba —combustible proporcional a masa por distancia— es **la fórmula
  del motor de salto de EVE aplicada a la puerta**: una fórmula fiel puesta en la
  cosa equivocada.
- **Allá el combustible paga por saltearse la red de puertas, no por usarla.** El
  motor de salto va en línea recta e ignora la topología del mapa; eso es
  proyección de fuerza, y por eso se cobra caro.
- **Y el argumento que lo decidió es de este juego y no de aquél:** en EVE
  quedarse sin isótopos te deja **lento**, porque la red de puertas gratis sigue
  ahí; en Vaxav te dejaría **varado**, porque la puerta es el único camino. Es el
  mismo argumento con el que [naves](SHIPS.md#movimiento-los-que-se-vuelven-tiempo)
  ya había declarado gratis el viaje dentro del sistema: «una nave varada entre
  dos planetas sin con qué encender el motor es una partida rota».

Hay un dato de afuera que apunta al mismo lado: en septiembre de 2026 CCP le
sacó el combustible al **Ansiblex Jump Bridge** —lo más parecido a una puerta que
tenía consumible— y lo reemplazó por un presupuesto que se recarga solo. Es el
mismo problema resuelto en la misma dirección.

Lo que sí sigue en pie es que **el motivo por el que un salto no se puede dar
sale de una sola función pura**, `jumpProblem`, que comparten la pantalla y el
servicio: el botón que se apaga y el rechazo del servidor dicen exactamente lo
mismo, y el jugador nunca aprieta algo que va a rebotar. Los tres motivos que
quedan **no se arreglan comprando**: una nave que no está en condiciones de
volar, una puerta que no lleva a ninguna parte todavía y un
[paso cerrado](UNIVERSE.md#el-paso-cerrado). La puerta no se gana con equipo, y
por eso el piloto nuevo llega a cualquier lado.

### El combustible no se borró: se mudó

Lo que va a costar combustible es **el motor de salto de las capitales**: el que
cruza entre sistemas que no son vecinos y sin puerta. Ese verbo todavía no
existe, así que hoy **el combustible no tiene ningún consumidor**.

La maquinaria quedó escrita y dormida, con la anotación de qué verbo la
despierta: el consumo por masa y su eficiencia en `jumps.ts`, el repostaje en el
servicio de naves, el helio-3 como ítem del catálogo que el mercado no muestra.
Lo que deja son huérfanos **declarados y con fecha** —Astrogación, Eficiencia de
combustible, el tanque, el depósito auxiliar y el calibrador de salto—, y están
contados uno por uno en
[estado y huecos](../ROADMAP.md#saltar-sin-puerta). Es lo que
[la cadena](../DESIGN.md#no-hace-falta-cerrarla-de-una-vez) permite: no cerrarla
de una vez, pero saber dónde está cada hueco.

## Qué paga cada acción

Una acción deposita en el pozo de **una sola rama**, y de ahí sale una regla que
condiciona el diseño: **una rama sin ninguna acción que la pague es una rama
inalcanzable**. Por eso escanear paga **Ciencias** y no Extracción, aunque quien
más escanee sea un minero: es lo único que la paga, y sin eso la rama no tendría
forma de crecer.

| Acción            | Rama       | Peso           | Dónde                       |
| ----------------- | ---------- | -------------- | --------------------------- |
| Viajar            | Pilotaje   | 1,0            | Entre cuerpos de un sistema |
| Saltar            | Pilotaje   | 1,0            | Parado en una puerta        |
| Escanear una roca | Ciencias   | 1,5            | En un cinturón              |
| Minar una roca    | Extracción | 1,0            | En un cinturón              |
| Acordar una orden | Comercio   | según el valor | Atracado con mostrador      |

**Saltar paga lo mismo que viajar y en la misma rama**, que es lo coherente con
que cruzar no pida nada: lo único que se pone es el rato, y el rato es lo que la
experiencia mide.

Escanear pesa por encima de uno porque es corta y exigente —se lee una roca en
minuto y medio— y porque es la única fuente de su rama: si rindiera poco, Ciencias
seguiría siendo inalcanzable en la práctica aunque técnicamente tuviera una
fuente.

## Reglas

- **Una acción por vez.** Sin cola, al menos por ahora: obliga a elegir cada vez
  y evita que el juego se juegue solo por seis horas.
- **No se cancela sin costo.** Abortar un viaje deja a la nave a mitad de camino;
  abortar una extracción pierde el ciclo empezado.
- **Nada se acelera pagando.** Ni con créditos ni con clicks.

## Por decidir

- Si se permite encolar una segunda acción, y a cambio de qué.
- Qué pasa con las acciones que fallan: ¿riesgo real de perder carga o nave?
- Si hay acciones pasivas de largo plazo (instalaciones que producen solas).
- Cuánto duran las cosas en la vida real: ¿minutos, horas? La escala define si el
  juego se visita tres veces por día o dos veces por semana.

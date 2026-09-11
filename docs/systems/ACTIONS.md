# Acciones, tiempo y experiencia

> **Propuesta.** Las mecánicas son la intención de diseño; los números están para
> discutirse. Nada de esto está implementado todavía.
>
> Ver también: [habilidades](SKILLS.md) · [naves](SHIPS.md) ·
> [universo](UNIVERSE.md) · [interfaz](INTERFACE.md)

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

**Y un bono se aplica una sola vez.** Viajar es el caso testigo: su duración sale
de la distancia y de la **velocidad de la nave**, y Navegación no vuelve a entrar
en la cuenta porque ya está adentro de esa velocidad —junto con el bono de rol
del casco y los propulsores montados—. Contarla dos veces para el mismo efecto es
la forma más fácil de romper el balance sin que se note.

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

1. **Ordena viajar** a los Anillos de Ánfora III. La duración sale de la
   distancia, de Navegación, de la nave y de sus módulos: 12 minutos.
2. **El contador corre.** El piloto cierra la pestaña y se va a hacer otra cosa.
3. **Al volver**, la acción ya venció: informe de viaje, posición nueva y
   +120 XP a Navegación, +18 a Eficiencia de combustible.
4. **Ordena minar.** 41 minutos, calculados como en el ejemplo de arriba.
5. **Al volver**, el segundo informe: 148 m³ en bodega, +600 XP a Minería y +90 a
   cada secundaria.
6. **Decide**: seguir minando, volver a vender, o gastar el viaje en otra cosa.
   La bodega llena obliga a elegir, que es de lo que se trata.

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

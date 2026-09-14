# El mercado

> **Implementado.** La estación compra y vende a precio fijo, con su asiento en
> el libro de créditos y en el de ítems. Las órdenes entre jugadores todavía no
> existen; la forma de la pantalla ya está preparada para ellas.
>
> Ver también: [naves y módulos](SHIPS.md) · [universo](UNIVERSE.md) ·
> [arquitectura](ARCHITECTURE.md) · [interfaz](INTERFACE.md)

El mercado es **el otro extremo del circuito**. Minar llena la bodega y ahí
termina; el mercado convierte esa bodega en créditos, y los créditos en equipo.
Es además **la única puerta para conseguir módulos**: el equipamiento sólo mueve
lo que ya es tuyo entre la bodega y una ranura.

## La horquilla

Mientras la estación sea la única contraparte, no hace falta una tabla de
precios: cada ítem declara su **precio de referencia** y todo se deriva de ahí.
Lo que hace que un mostrador no sea igual a otro es **la horquilla**: la
diferencia entre lo que la estación paga y lo que cobra.

```
lo que te cobra = referencia × (100 + horquilla) / 100
lo que te paga  = referencia × (100 − horquilla) / 100
```

La horquilla arranca en **20 puntos** y sólo se puede angostar:

| Qué la angosta             | Cuánto                       |
| -------------------------- | ---------------------------- |
| El rubro de la corporación | Hasta 6 puntos               |
| Regateo                    | 2 puntos por nivel, hasta 10 |

**Nunca baja de 5 puntos.** Es la misma regla que el piso de tiempo de una
extracción: el progreso mejora el número, no borra la mecánica. Sin ese piso, un
piloto con Regateo al 5 en la estación de su rubro compraría y vendería al mismo
precio, y el comercio dejaría de tener costo.

Las mejoras **se suman**, como todos los bonos del proyecto.

## El precio sale del lote, no de la unidad

La cuenta se redondea **una sola vez, sobre la operación entera**. No es un
detalle de implementación: el silicato vale 12, y redondeando cien veces tanto un
17 % como un 14 % de horquilla dan 10 créditos la unidad. El rubro de la estación
dejaría de significar nada justo en el mineral que un minero nuevo vende todo el
día.

Redondeando al final, esos mismos cien silicatos valen 996 o 1.032 según dónde se
descarguen. **Ese es el número que hace que el mapa importe.**

El precio por unidad que muestra la lista es de **vitrina**: sirve para comparar,
no para calcular. La pantalla rehace el total con las mismas funciones puras que
usa el servidor, así que lo que dice el diálogo es exactamente lo que se cobra.

## El rubro de la corporación

Quién opera la estación decide en qué es buena, y sale de `corporation.kind`, que
ya estaba sembrado. No hay tabla nueva.

| Rubro       | Mineral | Módulos | Por qué                                  |
| ----------- | ------- | ------- | ---------------------------------------- |
| Minera      | −6      | —       | Comprar mineral es su negocio            |
| Industrial  | —       | −6      | Los fabrica, los suelta más barato       |
| Comercial   | −3      | −3      | No produce nada y vive del volumen       |
| Logística   | −2      | −2      | Mueve carga ajena; algo se le pega       |
| Exploración | −2      | —       | Pasa por los cinturones y trae de vuelta |
| Seguridad   | —       | —       | No comercia: cobra por patrullar         |

En Ánfora eso significa que **conviene descargar en el Muelle de los Anillos**
—una minera— y no en Puerto Ánfora, aunque el puerto quede a mano. Es una
decisión con números atrás y no una cuestión de qué está más cerca.

## Qué comercia cada estación

Se deriva de los módulos instalados, con la misma regla que usa el equipamiento:
lo que una estación ofrece sale de lo que tiene, no de una lista aparte que haya
que mantener sincronizada.

| Módulo de la estación | Qué habilita              |
| --------------------- | ------------------------- |
| Mercado               | Compra y venta de módulos |
| Mercado o Refinería   | Compra de mineral         |

Una refinería sin mostrador **igual compra mineral**: lo necesita para trabajar.
Eso le da sentido a una parada que de otro modo sería decorativa —la Planta
Escarcha, en la luna de Ánfora III, es exactamente ese caso—.

**La estación no revende mineral.** Lo compra para procesarlo, y un mostrador que
lo devolviera al catálogo convertiría el circuito minero en un botón que se
aprieta sin salir del hangar.

## Dónde queda lo comprado

En **la bodega de la estación**, no en la de la nave. Así comprar nunca se
rechaza por falta de lugar, y desde ahí se monta o se sube a bordo como cualquier
otra cosa guardada. Es lo mismo que hace EVE con el hangar de objetos.

Vender, en cambio, sale de **cualquiera de las dos bodegas**: lo recién minado
está a bordo, lo que se dejó guardado está en tierra, y las dos se pueden vender
sin moverlas antes.

## La pantalla

La forma es la del mercado de EVE Online, con la voz de Elite: un **árbol de
categorías** a la izquierda, la **lista de la rama elegida** arriba a la derecha,
y abajo el **ítem seleccionado con sus dos libros de órdenes** —vendedores y
compradores—.

No es imitación por gusto. Es la única forma que aguanta un catálogo de cientos
de módulos: una lista plana con filtros anda con cuarenta y siete y se vuelve
inusable después. Mientras la estación sea la única contraparte, cada libro tiene
una sola orden —la suya—, pero las columnas de cantidad, ubicación y saltos ya
están puestas: el día que haya órdenes de jugadores son más filas en la misma
tabla, y la pantalla no cambia de forma.

Se entra desde la **baldosa del módulo en Ubicación**, que es donde está el
jugador cuando decide comerciar. Un módulo de estación es una sala del lugar
donde estás parado, no un destino del Neocom.

### La figura: la horquilla

La [figura propia de la pantalla](../../CLAUDE.md) es un instrumento que dibuja
lo que la estación se queda: la referencia al centro, lo que paga a la izquierda,
lo que cobra a la derecha. **Informa por su forma** —ancha es un mostrador caro,
angosta es uno donde conviene operar— y va **entre los dos libros**, porque lo
que dibuja es exactamente la distancia entre ellos.

Debajo va el desglose, que es lo que la convierte en algo que enseña: "20 de
base, −3 por casa comercial, −4 por Regateo". Un 13 % suelto no se aprende.

## Lo que viene

- **Órdenes entre jugadores.** La tabla ya tiene la forma; falta la tabla de
  órdenes y el emparejamiento.
- **Precios por estación.** Una tabla `station_offer` es aditiva: el día que
  Puerto Ánfora pague 5 % más por el hierro, se agrega sin migrar nada.
- **Mercado regional.** Ver ofertas de otras estaciones del sistema, con los
  saltos que hay hasta cada una — de ahí la columna que hoy dice "Acá".
- **Contabilidad y Análisis de mercado**, las dos habilidades de Comercio que
  todavía no mueven ningún número: comisiones y historial de precios.

# Los materiales

> **Casi todo por implementar.** Existen los **cuatro minerales** de `game/items.ts`
> y nada más: no hay refinado, ni componentes, ni consumibles, ni hielo, ni gas. Lo
> que sigue es el plano completo, y el orden en que entra está en
> [la hoja de ruta](../ROADMAP.md).
>
> Ver también: [naves y módulos](SHIPS.md) · [profesiones](PROFESSIONS.md) ·
> [mercado](MARKET.md) · [economía](ECONOMY.md)

Los materiales son **el cuerpo de la economía**: lo único que un jugador produce y
otro consume. Todo lo demás —créditos, órdenes, contratos— es la forma en que se
mueven.

La regla que los ordena es que **nada valioso está donde es cómodo**. La seguridad
del sistema decide qué mineral hay, así que el mapa no necesita ningún otro empujón
para sacar a la gente del centro.

## Cuatro escalones, no dos

```
materia prima  →  refinado  →  componente  →  producto
   mineral         hierro       placa          placa de blindaje
   hielo           helio-3      bloque         combustible
   gas             fulereno     célula         cristal de extracción
```

**El escalón de componentes es el que hace falta y no tenemos.** Sin él, fabricar
es una receta de un paso y el técnico no tiene oficio propio: compra mineral,
aprieta un botón y sale un módulo. Con él, hay una capa entera de mercado entre el
minero y el que arma, que es donde vive la mitad de la economía de este género.

## Minerales de asteroide

**La seguridad del sistema decide qué hay.** Lo común está en todos lados; lo
valioso, sólo donde no hay quien te cuide. Es el único empujón que el juego
necesita para sacar a la gente del centro.

| Mineral                       | Seguridad | m³/u | Refina en (por 100)               | Merma |
| ----------------------------- | --------- | ---: | --------------------------------- | ----: |
| **Silicato ferroso (hoy)**    | Alta      |  1,0 | 60 hierro · 20 silicio            |  20 % |
| **Condrita carbonácea (hoy)** | Alta      |  1,0 | 55 carbono · 20 hierro            |  25 % |
| **Piroxeno (hoy)**            | Media     |  0,8 | 55 silicio · 15 carbono           |  30 % |
| **Escoria titanífera**        | Media     |  0,9 | 40 titanio · 20 hierro            |  40 % |
| **Veta iridiada (hoy)**       | Baja      |  0,6 | 15 iridio · 25 hierro             |  60 % |
| **Basalto cobáltico**         | Baja      |  0,7 | 30 cobalto · 20 titanio           |  50 % |
| **Brecha platinífera**        | Nula      |  0,5 | 12 platino · 20 cobalto           |  68 % |
| **Núcleo uranífero**          | Nula      |  0,4 | 8 uranio · 15 platino · 10 iridio |  67 % |

Y **cada mineral tiene tres variantes de calidad** —`+5 %`, `+10 %`, `+15 %`— que
rinden más al refinar y aparecen más lejos. Es la idea más rentable de EVE en este
rubro: **multiplica el catálogo de veinticuatro entradas sin multiplicar ninguna
decisión**, porque la variante se reconoce por el nombre y se trata igual.

> `Silicato ferroso` · `Silicato ferroso denso (+5 %)` · `Silicato ferroso rico (+10 %)` ·
> `Silicato ferroso macizo (+15 %)`

## Hielo

Otra actividad, no una variante: pide **cosechador** en vez de láser, la habilidad
de Extracción de hielo, y aparece en lunas y anillos helados y no en cinturones.

| Hielo             | Seguridad | m³/u | Deja (por unidad)                          |
| ----------------- | --------- | ---: | ------------------------------------------ |
| **Hielo sucio**   | Alta      |  5,0 | 50 agua pesada · 25 oxígeno                |
| **Hielo azul**    | Media     |  5,0 | 40 agua pesada · 20 nitrógeno · 10 helio-3 |
| **Hielo glaciar** | Baja      |  5,0 | 30 nitrógeno · 25 helio-3                  |
| **Hielo oscuro**  | Nula      |  5,0 | 50 helio-3 · 15 oxígeno                    |

**El helio-3 es el que importa**: es el combustible, y es **el único refinado que
ya existe como ítem del catálogo**. No se compra en ninguna parte —el mercado no
lo muestra— porque hoy **nada lo consume**: cruzar una puerta es gratis y el verbo
que lo va a quemar es el motor de salto de las capitales, que todavía no existe.
Ver [cruzar es gratis](ACTIONS.md#cruzar-es-gratis).

El hielo sigue siendo su fuente, y el orden en que entran los tres es el de
[la cadena](../DESIGN.md#no-hace-falta-cerrarla-de-una-vez): primero el verbo que
gasta, después el insumo, y la fuente cuando haya qué alimentar.

Notar el volumen: **cinco metros cúbicos por unidad**. El hielo es un problema de
logística antes que de extracción, y eso es lo que le da sentido a las barcazas.

## Gas

La tercera materia prima. Se aspira de nubes, que **no están en el mapa hasta que
alguien las escanea** — es la primera actividad que ata extracción con exploración.

| Gas           | Dónde                     | m³/u | Para qué                         |
| ------------- | ------------------------- | ---: | -------------------------------- |
| **Fulereno**  | Nubes de sistemas sin ley |  2,0 | Componentes de módulos avanzados |
| **Hidracina** | Nubes cerca de gigantes   |  2,0 | Bloques de combustible           |
| **Xenón**     | Nubes raras, sin ley      |  2,0 | Cargas y cristales               |

## Refinados

Lo que sale de refinar. **Ocupan una décima parte de lo que ocupaba la piedra**, y
ahí está la decisión: refinar donde se saca y acarrear poco, o acarrear mucho y
refinar donde pagan mejor.

| Material        | m³/u | De dónde sale         | Para qué sirve                                |
| --------------- | ---: | --------------------- | --------------------------------------------- |
| **Hierro**      |  0,1 | Casi todo mineral     | Estructura, blindaje, placas                  |
| **Carbono**     |  0,1 | Condrita, piroxeno    | Compuestos livianos: propulsores, bodegas     |
| **Silicio**     |  0,1 | Silicato, piroxeno    | Todo lo que pide cómputo                      |
| **Titanio**     |  0,1 | Escoria, basalto      | Cascos y armazones                            |
| **Cobalto**     |  0,1 | Basalto, brecha       | Bobinas, distribuidores, escudos              |
| **Iridio**      |  0,1 | Veta iridiada, núcleo | **Lo raro.** Todo módulo de escalón A lo pide |
| **Platino**     |  0,1 | Brecha, núcleo        | Ópticas, sensores, armas de precisión         |
| **Uranio**      |  0,1 | Núcleo uranífero      | Plantas de energía y motores de salto grandes |
| **Helio-3**     |  0,1 | Hielo                 | **Combustible del salto sin puerta**          |
| **Agua pesada** |  0,1 | Hielo                 | Refrigerante y soporte vital                  |
| **Nitrógeno**   |  0,1 | Hielo                 | Propelente y bloques de combustible           |
| **Oxígeno**     |  0,1 | Hielo                 | Soporte vital                                 |

## Componentes

El escalón que falta. Se fabrican con **Componentes** (Industria x2) y son lo que
los módulos piden de verdad: un módulo no se hace con hierro, se hace con placas.

| Componente              | m³/u | Se hace con             | Aparece en                        |
| ----------------------- | ---: | ----------------------- | --------------------------------- |
| **Placa laminada**      |  0,5 | Hierro, titanio         | Blindaje, mamparos, cascos        |
| **Armazón compuesto**   |  0,5 | Carbono, titanio        | Bodegas, cascos, propulsores      |
| **Circuito impreso**    |  0,3 | Silicio, cobalto        | Sensores, escáneres, computadoras |
| **Bobina de inducción** |  0,4 | Cobalto, hierro         | Distribuidores, escudos, iónicos  |
| **Lente focal**         |  0,3 | Silicio, platino        | Láseres, escáneres, ópticas       |
| **Célula de energía**   |  0,4 | Uranio, carbono         | Plantas de energía, acumuladores  |
| **Tubo de contención**  |  0,6 | Titanio, iridio         | Motores de salto, lanzas térmicas |
| **Núcleo cuántico**     |  0,2 | Iridio, platino, uranio | **Sólo escalón A**                |

## Consumibles

Lo que se gasta al usarlo. Es la categoría que hace que la economía no se sature:
un módulo se compra una vez, un cristal se compra siempre.

| Consumible                | Se gasta en                   | Se hace con                                    |
| ------------------------- | ----------------------------- | ---------------------------------------------- |
| **Cristal de extracción** | Cada ciclo de láser de tira   | Lente focal, silicio, el mineral al que apunta |
| **Carga cinética**        | Cada disparo de cañón de masa | Placa laminada, hierro                         |
| **Carga iónica**          | Cada disparo de emisor iónico | Bobina, cobalto                                |
| **Carga térmica**         | Cada disparo de lanza térmica | Tubo de contención, xenón                      |
| **Bloque de combustible** | Estructuras y saltos largos   | Helio-3, nitrógeno, hidracina                  |
| **Sonda de exploración**  | Cada lanzamiento              | Circuito impreso, silicio                      |

**El cristal de extracción es el ejemplo de cadena completa** que conviene tener a
mano cuando se discuta cualquier mecánica nueva:

| Eslabón        | En el cristal de extracción                         |
| -------------- | --------------------------------------------------- |
| **El verbo**   | Extraer con láser de tira                           |
| **El insumo**  | El cristal, que se gasta                            |
| **La fuente**  | Silicio y platino, que salen de minerales distintos |
| **El aparato** | El láser de tira, que sólo entra en una barcaza     |
| **La llave**   | Láseres de tira, Cristales de extracción            |
| **La fábrica** | Cristalografía, en un taller de estación            |
| **El lugar**   | La estación con taller; el cinturón con ese mineral |

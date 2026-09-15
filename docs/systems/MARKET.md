# El mercado

> **Implementado.** Órdenes de compra y de venta entre pilotos, con garantía,
> comisión e impuesto; la estación participa como una orden más. El mercado es
> regional y el alcance depende de habilidad.
>
> Ver también: [naves y módulos](SHIPS.md) · [habilidades](SKILLS.md) ·
> [universo](UNIVERSE.md) · [arquitectura](ARCHITECTURE.md)

El mercado es **el otro extremo del circuito**. Minar llena la bodega y ahí
termina; el mercado la convierte en créditos, y los créditos en equipo. Es además
**la única puerta para conseguir módulos**: el equipamiento sólo mueve lo que ya
es tuyo entre una bodega y una ranura.

## Mirar es libre, operar pide mostrador

Dos reglas que parecen opuestas y no lo son:

- **El mercado vive en el Neocom y se ve desde cualquier parte.** Parado en un
  cinturón con la bodega llena, saber a cuánto se está pagando el iridio es
  justamente lo que decide adónde ir. Los precios son información, y esconderlos
  no agrega dificultad: agrega viajes a ciegas.
- **Comprar, vender o publicar exige estar atracado en una estación con el módulo
  Mercado.** Sin mostrador no hay con quién tratar, y esa estación tampoco
  aparece en ningún libro. Es la misma regla que usa el equipamiento —lo que una
  estación ofrece sale de lo que tiene instalado— y le dará peso a instalar un
  mercado el día que los módulos de estación los pongan los jugadores.

Cuando no se puede operar, la pantalla **dice por qué** en vez de esconder los
botones sin explicación.

## El alcance

El mercado **no es global**, y ésa es la decisión que le da geografía económica a
la galaxia: si el hierro valiera lo mismo en todas partes, moverlo no sería un
oficio y el mapa sería decorado.

Se ve lo que hay en las regiones al alcance, contando la propia, y el techo de
diseño son **cinco**. Sin entrenar se ve una —nunca cero: un piloto que no ve ni
el mercado donde está parado no podría vender lo que acaba de minar, y eso no es
progresión, es una pared—.

| Análisis de mercado | Regiones que ve | Alcance de sus órdenes de compra |
| ------------------- | --------------- | -------------------------------- |
| Sin entrenar        | 1               | Sólo su estación                 |
| I                   | 2               | 1 región                         |
| IV o más            | 5               | 4 regiones                       |

## Publicar es una acción

Poner una orden **no es un botón: es una acción con su tiempo**, como viajar o
minar. Se están cerrando condiciones con alguien, lleva **un minuto** y ocupa el
único turno que el piloto tiene.

Eso resuelve un agujero del árbol de habilidades: **Comercio no tenía de dónde
sacar experiencia**. Un piloto que quisiera dedicarse a comerciar estaba obligado
a ir a picar piedra para poder negociar mejor, que es exactamente al revés de lo
que la rama promete.

**Lo que impide granjearla** es que la experiencia sale del **valor del trato** y
tiene tope: publicar cien órdenes de un crédito paga lo mismo que publicar una, y
para llegar al techo hay que comprometer una fortuna y pagar la comisión que le
corresponde. A ese precio, comprar experiencia con créditos sale carísimo. Y como
las acciones son una por vez, el minuto que se va en un trámite es un minuto que
no se está minando.

**Comprar y vender contra una orden que ya existe no es una acción**: ahí no se
negocia nada, se toma el precio de otro.

La orden se escribe **al encargar**, con su garantía ya tomada, y **abre sola
cuando el reloj pasa su fecha**. Si se creara al resolver, la plata o la
mercadería quedarían libres mientras se negocia y se podrían comprometer dos
veces. Cancelar, en cambio, es **instantáneo**: retirarse de un trato no es una
negociación, es decir que no, y cancelar mientras se acuerda cancela también la
acción.

## Las órdenes

Una orden es **una promesa respaldada**:

- Publicar una **de venta** saca la mercadería de la bodega. Mientras la orden
  viva, esas unidades no se montan, no viajan y no se venden dos veces.
- Publicar una **de compra** reserva los créditos por adelantado.

Sin garantía, aceptar una orden sería descubrir recién ahí que del otro lado no
había nada, después de haber viajado hasta el mostrador. Cancelar devuelve la
garantía entera.

**Lo comprado queda en la estación de la orden.** Comprar no teletransporta nada:
un precio bueno a cuatro sistemas es un precio bueno más un viaje. De ahí sale la
pantalla de **Propiedades**, que dice qué tiene el piloto y dónde; sin ella,
comprar lejos sería una forma elegante de perder la compra.

Se publica **donde uno está parado**. Poner un puesto a distancia es una mecánica
aparte —y más cara— que todavía no existe.

### Ninguna es eterna

Sin vencimiento, el libro se llena de precios viejos de pilotos que dejaron de
jugar, y un mercado que muestra ofertas que nadie va a honrar es peor que uno
vacío. La escalera es la de EVE y el tope lo da **Contactos**:

| Contactos    | Hasta     |
| ------------ | --------- |
| Sin entrenar | 1 día     |
| I            | 3 días    |
| II           | 1 semana  |
| III          | 2 semanas |
| IV           | 1 mes     |
| V            | 3 meses   |

Un piloto nuevo publica por un día, que alcanza de sobra para liquidar una
bodega. **Al vencer, la garantía vuelve entera**: caducar no es perder.

El barrido es perezoso, como todo acá: no hay ningún reloj corriendo del lado del
servidor. Una orden vencida es invisible para todos desde el instante en que
vence —el libro filtra por fecha—, y la garantía vuelve cuando su dueño aparece.

## Lo que se lleva la casa

Dos cobros, y son dos porque castigan cosas distintas. Los dos bajan con
habilidad **hasta un piso** y nunca a cero.

| Cobro                     | Cuándo      | Base  | Piso  | Habilidad    |
| ------------------------- | ----------- | ----- | ----- | ------------ |
| **Comisión del corredor** | Al publicar | 3,0 % | 1,0 % | Regateo      |
| **Impuesto de venta**     | Al vender   | 5,0 % | 2,0 % | Contabilidad |

Las cuatro habilidades de Comercio quedan con un trabajo cada una: **Regateo**
mueve la horquilla de la estación y la comisión, **Contabilidad** el impuesto y
cuántas órdenes se pueden llevar, **Análisis de mercado** hasta dónde se ve, y
**Contactos** cuánto puede durar una orden.

La comisión **no se devuelve al cancelar**: es lo que hace que llenar el libro de
órdenes para tantear el mercado tenga costo. El impuesto es el **sumidero de
créditos** de la economía: sin algo que saque plata del mundo, la plata sólo entra
y todo termina valiendo nada.

**Cuántas órdenes se pueden llevar abiertas** también sale de Contabilidad —una
sola habilidad para los dos lados, no una por cada uno— y el cupo es **por lado**:
sin entrenar, una de compra y una de venta; una más por nivel, hasta cinco de cada
una. Ese cinco es el techo **de esta habilidad** y no del juego: subirlo más
adelante es cosa de una habilidad más profunda de Comercio, no de mover el
número.

Que sea por lado y no un total compartido es a propósito: con un cupo único,
tener una venta publicada impediría poner una compra, y ofrecer algo y pedir algo
a la vez es justamente el par que hace entender el oficio. Lo que hay que ganarse
es el volumen, no la primera lección.

## La estación es una orden más

Mientras la economía arranca, la estación pone su propio puesto en el libro. Su
orden **no se agota** y **no se guarda**: se calcula a partir del precio de
referencia del ítem y del rubro de la corporación. Guardarla serían doscientas
filas que habría que resembrar cada vez que se mueva una fórmula, y además su
precio no es el mismo para todos.

Su puesto se ve **desde cualquier parte**, como el resto del libro: la banda de
cada estación con mostrador entra al catálogo aunque el piloto esté parado en un
cinturón a medio sistema. Que haya que estar atracado para **apretar** el botón no
significa que haya que estar atracado para **ver** el precio —esconderlo mientras
uno mina diría que no hay a quién venderle justo cuando hay que decidir si vale la
pena volver, y dejaría el catálogo en blanco hasta que otro piloto publicara algo.
El requisito del módulo Mercado no se afloja: una estación sin mostrador sigue sin
aparecer en ningún libro.

Lo que la distingue es **la horquilla**: la estación siempre paga menos de lo que
cobra, y esa diferencia es su ganancia.

```
lo que te cobra = referencia × (100 + horquilla) / 100
lo que te paga  = referencia × (100 − horquilla) / 100
```

La horquilla arranca en **20 puntos**, la angostan el rubro de la corporación
(hasta 6) y Regateo (2 por nivel), y **nunca baja de 5**. Regateo es lo único que
se negocia porque es lo único que tiene con quién: del otro lado de una orden de
jugador hay otro jugador.

| Rubro       | Mineral | Módulos | Por qué                                  |
| ----------- | ------- | ------- | ---------------------------------------- |
| Minera      | −6      | —       | Comprar mineral es su negocio            |
| Industrial  | —       | −6      | Los fabrica, los suelta más barato       |
| Comercial   | −3      | −3      | No produce nada y vive del volumen       |
| Logística   | −2      | −2      | Mueve carga ajena; algo se le pega       |
| Exploración | −2      | —       | Pasa por los cinturones y trae de vuelta |
| Seguridad   | —       | —       | No comercia: cobra por patrullar         |

**La estación no revende mineral.** Lo compra para procesarlo; un mostrador que lo
devolviera al catálogo convertiría el circuito minero en un botón que se aprieta
sin salir del hangar.

### Es una banda, no un precio

De acá sale la forma en que van a moverse los precios: **la compra de la estación
es el piso y su venta el techo**, y los jugadores compiten entre medio. Nadie va a
vender por debajo de lo que paga la estación —le vendería a ella—, ni comprar por
encima de lo que la estación cobra. Dentro de esa banda, la oferta y la demanda
hacen lo suyo.

Cuando la economía se sostenga sola, la banda se puede angostar o quitar. Es un
número, no una reescritura.

## El precio sale del lote, no de la unidad

La cuenta se redondea **una sola vez, sobre la operación entera**. No es un
detalle de implementación: el silicato vale 12, y redondeando cien veces tanto un
17 % como un 14 % de horquilla dan 10 créditos la unidad, con lo que el rubro de
la estación dejaría de significar nada justo en el mineral que un minero nuevo
vende todo el día. Redondeando al final, esos mismos cien silicatos valen 996 o
1.032 según dónde se descarguen. **Ese es el número que hace que el mapa
importe.**

El precio por unidad de la lista es de **vitrina**: sirve para comparar, no para
calcular. La pantalla rehace el total con las mismas funciones puras que usa el
servidor, así que lo que dice el diálogo es exactamente lo que se cobra.

## El historial

Cada operación cerrada deja su punto, **también las que tienen a la estación del
otro lado**: si sólo contaran las de jugadores, un mercado recién abierto no
tendría nada que dibujar justo cuando más falta hace saber cuánto vale lo que uno
trae.

Se agrupa por día, y el promedio va **ponderado por cantidad**: una venta de mil
unidades dice mucho más sobre el precio del día que una de tres, y promediar
renglones dejaría que una operación mínima moviera la curva tanto como una
enorme. Los días sin operaciones no se rellenan: la curva une los que hubo.

## La pantalla

La forma es la del mercado de EVE Online, con la voz de Elite, y se ordena en
tres piezas que contestan tres preguntas distintas:

1. **El árbol de categorías**, a la izquierda, para examinar sin saber cómo se
   llama lo que se busca.
2. **El catálogo, en dos tablas**: arriba las **órdenes de venta** —lo que se
   puede comprar— y abajo las **órdenes de compra** —lo que se puede vender—. Cada
   renglón dice **dónde** está ese precio y **a cuántos saltos**, porque el mercado
   se mira desde cualquier parte y un precio sin lugar no alcanza para decidir: lo
   barato a cuatro saltos es barato más un viaje. Cuando el mostrador es el que uno
   tiene debajo de los pies, la columna dice "Acá" en vez de un número, y señalar
   el nombre de la estación muestra el camino entero —qué orbita, en qué sistema,
   en qué región—, que es la [nomenclatura del universo](UNIVERSE.md). Las
   cabeceras ordenan, y clickear la que ya ordena da vuelta el sentido. Con
   los dos precios en la misma fila hay que leer columna por columna para saber de
   qué lado del mostrador está cada cosa; separados, "¿qué puedo comprar acá?" se
   contesta mirando una tabla. Un ítem aparece en las dos si tiene órdenes de los
   dos lados, y eso no es repetirlo: son dos ofertas distintas. Lo que existe pero
   nadie comercia va en una lista aparte, porque sigue siendo información.
3. **Dos ventanas**, y una sola cosa en cada una:
   - **Operar**: se abre al clickear una fila, y la fila ya eligió el lado, así
     que muestra esa orden —quién la puso, a cuánto, cuánto hay, a qué distancia—
     y nada más. Si la mejor orden es la propia, lo único que ofrece es retirarla.
   - **Poner una orden**: la otra cosa que se puede hacer en un mercado. Es una
     decisión —cuánto, a cuánto, por cuánto tiempo— que además compromete el turno
     del piloto, y por eso la ventana **es** la confirmación.

Mezclar las dos ventanas obligaba a leer un formulario entero para hacer la
operación más simple del mercado.

El catálogo entero viaja con la pantalla; **el libro de cada ítem se pide al
abrirlo**, y de cada lado viajan **sólo las primeras cincuenta**. Traer las
órdenes de los cincuenta y un renglones para dibujar una lista sería pedir miles
de filas de las que se miran dos, y un ítem popular puede juntar miles él solo:
nadie opera contra la número ochocientos. La pantalla dice cuántas quedaron
afuera, que es lo que informa si el mercado está profundo.

### La figura: el historial

La [figura propia de la pantalla](../../CLAUDE.md) es el gráfico de precios —a un
botón de distancia en la ventana de operar— y tiene tres capas que contestan cosas distintas: **la banda** entre el mínimo y el
máximo de cada día dice cuánta pelea hubo, **la línea** del promedio dice a
cuánto se comerció de verdad, y **las barras** de volumen dicen cuánto se movió.
Un precio bonito con volumen cero no es un precio: es una anécdota.

La horquilla de la estación queda como **una línea de texto** y no como segunda
figura: dos figuras en una pantalla compiten y no gana ninguna, y la pregunta de
este módulo es si un precio es bueno, no cuánto se queda el mostrador.

## Lo que viene

- **Publicar a distancia**, con su costo y su habilidad.
- **Saltos de verdad en la columna de distancia**, cuando haya más de un sistema.
- **Contratos**, que es lo que le falta a Contactos para dejar de ser decorativa.
- **Transporte**: hoy la carga sólo se mueve volando uno mismo.

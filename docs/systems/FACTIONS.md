# Facciones

> **Propuesta.** Los nombres y la historia son un borrador para reaccionar en
> contra; el eje y el alcance sí están decididos.
>
> Ver también: [universo](UNIVERSE.md) · [profesiones](PROFESSIONS.md)

Al crear el piloto se elige una facción. Es **de dónde viene y a quién responde**,
no a qué se dedica: el oficio lo define la [profesión](PROFESSIONS.md), que es
otro eje y se elige aparte.

## Son tres

Tres superpotencias, con la misma estructura que las de Elite Dangerous —imperio,
federación y alianza— porque es un reparto que funciona: un poder viejo y
jerárquico, uno grande y burocrático, y una coalición de los que no quisieron ser
ninguno de los dos.

Tres y no cuatro. Con cuatro, la cuarta siempre termina siendo "los
independientes", que no es una facción sino la ausencia de una.

## Qué hace una facción

Por ahora, **una sola cosa: determina dónde empieza el piloto**. Nada de bonos ni
de habilidades regaladas — de eso ya se ocupa la profesión, y duplicarlo
convertiría la elección en un cálculo en vez de una decisión de identidad.

Más adelante va a cargar reputación, acceso a estaciones, contratos y conflictos.
Está pensada para crecer, pero no se implementa nada de eso hasta que exista.

## Cómo se presentan

La pantalla de elección sigue el panel de facciones del juego: **emblema, nombre
grande, la línea que dice qué clase de poder es** —`IMPERIO | ARISTOCRACIA`—, el
lema, la descripción y una tabla de lecturas debajo.

Cada ficha lleva el **escudo de la facción** en un hueco cuadrado con borde, y el
mismo escudo enorme y casi apagado de marca de agua detrás, que es lo que en el
juego le da peso al panel sin robarle lugar al texto.

Sin elegir, el escudo va **desaturado y apagado**; al elegirlo **recupera su
color y se enciende**. Es la forma más directa de decir "ésta es la tuya", y
mantiene el naranja de la interfaz al mando mientras el jugador todavía está
mirando.

Los escudos son la **única excepción a la regla del acento único**: cada uno
tiene su color —rojo el Dominio, azul la Concordia, verde el Pacto— porque un
escudo es identidad, no interfaz. Alrededor, todo sigue siendo naranja.

Vienen sobre negro y se funden con `mix-blend-mode: screen`, así que quedan
apoyados sobre el panel en lugar de dentro de un recuadro. Están en
`static/factions/`, en WebP y a 320 px: 27 KB los tres, contra 830 KB que pesaban
los originales.

Las lecturas son datos, no adorno:

| Lectura             | De dónde sale                                                               |
| ------------------- | --------------------------------------------------------------------------- |
| Gobierno            | De la facción                                                               |
| Estación de partida | De la facción                                                               |
| Sistema             | De la facción                                                               |
| Sistemas            | Hoy una constante: Ánfora es el único que existe. Se cuenta de verdad en F5 |
| Pilotos             | **Real**, contado en la base al abrir el alta                               |

**Nada se parte en dos renglones.** Es la regla que ordena esta pantalla, y de
ella salen tres decisiones:

- Las lecturas van **apiladas** —etiqueta arriba, valor abajo—, así el valor se
  lleva el ancho entero de su columna en vez de la mitad.
- Los **valores van en caja normal**. Las mayúsculas con interletrado ancho son
  lindas en una etiqueta de dos palabras y ocupan el doble en un nombre como
  "Muelle de los Anillos". Las mayúsculas quedan para las etiquetas.
- Los valores largos —gobierno, estación— ocupan la ficha entera; los cortos
  —sistema, sistemas, pilotos— comparten renglón de a tres.

Debajo del nombre queda sólo el **arquetipo** (`IMPERIO`), que es corto y siempre
entra. En el juego ahí va `FEDERACIÓN | DEMOCRACIA`, pero esa línea completa no
sobrevive a una ficha angosta, así que el gobierno se mudó a las lecturas.

Y como red de seguridad, si algún día aparece un nombre desmedido, el valor se
corta con puntos suspensivos antes de desbordar la ficha.

Las tres fichas tienen la misma altura y **la tabla va pegada al pie de cada
una**: la descripción se estira para ocupar lo que sobra. Así las lecturas quedan
alineadas entre sí y se pueden comparar de un vistazo, que es para lo que están;
si flotaran detrás de cada descripción, cada una caería a distinta altura y
compararlas obligaría a buscarlas.

Que la cantidad de pilotos sea real importa: es lo que convierte la elección en
una decisión informada —sumarse a la mayoría o al bando flaco— en vez de un
sorteo entre tres textos.

## Las tres

### El Dominio — _imperio · aristocracia_

> «El orden se hereda»

El poder más viejo del sector, y el que más se nota que lo es. Linaje, protocolo,
deudas de honor que se heredan y una idea muy clara de que hay quienes mandan y
quienes obedecen. Elegante por fuera, durísimo por dentro.

- **Empieza en**: Puerto Ánfora, la estación principal del sistema.
- **Cómo ve al resto**: la Concordia es una asamblea de contadores; el Pacto,
  gente sin apellido jugando a tener país.

### La Concordia — _federación · democracia corporativa_

> «Todo se vota»

La más grande y la más lenta. Democracia de corporaciones, con elecciones reales,
lobbies reales y una flota enorme. Todo se puede discutir, y por eso todo tarda.

- **Empieza en**: Muelle de los Anillos, en órbita de Ánfora III.
- **Cómo ve al resto**: el Dominio es un museo con armas; el Pacto, un vecindario
  que se cree Estado.

### El Pacto — _alianza · coalición_

> «Lo acordado se cumple»

Sistemas independientes que se juntaron para no ser tragados por los otros dos.
Sin capital, sin flota propia digna de ese nombre y sin ganas de tenerla: lo que
tienen son acuerdos, y los cumplen.

- **Empieza en**: Hábitat Talo, excavado en un asteroide del Cinturón Exterior.
- **Cómo ve al resto**: dos imperios discutiendo cuál se queda con la mesa.

## Las facciones no poseen estaciones

Poseen **corporaciones**, y las corporaciones poseen estaciones. Una facción es un
poder político; operar un muelle es un negocio, y de eso se encargan las
compañías. Ver [corporaciones](CORPORATIONS.md).

También controlan **un puñado de sistemas** cada una, no el mapa entero: el resto
del espacio queda libre para que lo reclamen las corporaciones de jugadores. Ver
[universo](UNIVERSE.md).

## Reglas de diseño

- **La facción no da ventaja mecánica.** Elegir por historia y no por planilla es
  el punto.
- **La facción no encierra.** Un piloto del Dominio puede vivir en el Cinturón
  Exterior si aguanta las miradas.
- **Ninguna tiene razón.** Cada una tiene argumentos y gente que la banca.
- **Cuando el mapa crezca**, cada facción va a tener su propio espacio; hoy las
  tres conviven en Ánfora porque es el único sistema que existe.

## Por decidir

- Si se puede cambiar de facción, y a qué costo.
- Cómo funciona la reputación: una escala por facción, y qué abre y cierra.
- Si hay hostilidad mecánica (zonas vedadas, tasas distintas, ataques a la vista).
- Si las corporaciones de jugadores se alinean con facciones o son ajenas.
- La historia larga de cada una: cómo llegaron, qué se deben y qué se reprochan.

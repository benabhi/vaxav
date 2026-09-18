# La economía y la pérdida

> **Decidido, nada implementado.** Las naves se destruyen: es la decisión que más
> cosas ordena de todo el juego, y depende del combate, que todavía no existe. Lo
> que sí existe ya son los créditos y el mercado.
>
> Ver también: [materiales](MATERIALS.md) · [mercado](MARKET.md) ·
> [naves](SHIPS.md) · [universo](UNIVERSE.md)

Un juego de economía necesita que **la demanda no se agote**. Sin pérdida, la curva
de cualquier bien es la misma: sube mientras los jugadores se equipan y después es
plana para siempre. El minero deja de tener a quién venderle, el industrial deja de
tener qué fabricar y el mercado se vuelve un museo con precios.

Con pérdida, todo lo que se destruyó hay que volver a sacarlo de una piedra. **La
economía deja de ser un acumulador y pasa a ser un caudal**, que es lo único que
sostiene a un juego de años.

## Qué se pierde y qué no

La regla tiene que ser legible en una línea, porque es la que el jugador va a
tener en la cabeza cada vez que decida salir:

> **Se pierde la nave y lo que llevaba. El piloto siempre vuelve.**

| Qué                   | Qué le pasa                                                |
| --------------------- | ---------------------------------------------------------- |
| El casco              | Se destruye                                                |
| Los módulos montados  | Una parte se destruye y **otra queda flotando**            |
| La carga de la bodega | Una parte se destruye y **otra queda flotando**            |
| El piloto             | **Vuelve.** Aparece en la estación de su facción, sin nave |
| Las habilidades       | No se tocan nunca. Lo aprendido, aprendido                 |

Dos decisiones adentro de eso, y las dos importan:

- **El piloto no muere.** Perder horas de entrenamiento por una emboscada no
  produce cuidado: produce gente que no sale. La pérdida tiene que doler en lo que
  se repone, no en lo que no se repone.
- **Una parte queda flotando**, y no todo se destruye. Es lo que convierte a
  destruir en algo que _rinde_ y no sólo en algo que arruina al otro; sin botín,
  atacar es puro vandalismo y nadie lo hace por economía. Es además el verbo que le
  faltaba a **Recuperación de pecios** y al **Rapiña**, que hoy son una llave y un
  casco sin puerta.

## La red de seguridad: la Pioner se repone gratis

**Una nave de alta gratis en cualquier estación, siempre.** Es la consecuencia
directa de P7 y de P8 juntas: si el primer casco se puede perder y no se repone, un
piloto nuevo que tuvo mala suerte se queda mirando una pantalla sin nada que hacer,
y eso no es dificultad, es un final.

Con reposición gratis, la pérdida real de un piloto nuevo es **lo que llevaba
puesto**, que es poco y se vuelve a juntar. Y la escalera de riesgo queda sola: el
que sale con la Pioner arriesga nada y saca poco; el que sale con el Cíclope lleno
arriesga mucho.

## Dónde se puede perder una nave

Acá es donde el número de seguridad de cada sistema —que hoy sólo se dibuja— se
vuelve mecánico:

| Banda de seguridad | Qué pasa si alguien ataca                                                    |
| ------------------ | ---------------------------------------------------------------------------- |
| **Alta**           | Las patrullas de la facción responden, y rápido. Atacar es una decisión cara |
| **Media**          | Responden, pero tarde. Alcanza para escapar, no para salvar la carga         |
| **Baja**           | No responde nadie. Queda el registro y la reputación perdida                 |
| **Nula**           | No hay nada ni nadie. Es el lugar donde las capitales tienen sentido         |

**Y eso es lo que hace que el mapa signifique algo.** Hoy la seguridad decide qué
mineral hay; con esto decide además cuánto se arriesga en ir a buscarlo, y las dos
cosas apuntan en la misma dirección: lo que vale está donde no te cuidan.

## El problema del juego idle

Vaxav es un juego de esperar, y eso choca de frente con la pérdida: **un piloto que
cerró el navegador con una orden de cuarenta minutos en curso no puede defenderse
de nada**. Si se lo puede destruir mientras no está, el juego castiga cerrar la
pestaña, que es exactamente lo contrario de lo que un idle promete.

Tres reglas que resuelven eso sin sacarle el filo a la pérdida:

1. **Atracado es seguro, siempre.** Adentro de una estación no pasa nada. Es la
   decisión de EVE y es la correcta: el riesgo se toma al salir, y salir es un acto
   voluntario.
2. **Se puede perder la nave estando en el espacio**, con una orden en curso o sin
   ella. Es el precio de estar afuera, y es lo que hace que decidir salir cuente.
3. **Una orden que termina con la nave destruida no entrega nada.** El botín de esa
   acción se pierde con la bodega, que es lo que ya iba a pasar de todos modos.

La consecuencia de diseño es la que hay que aceptar: **el que quiere estar seguro,
atraca**. Y como atracado no se mina ni se viaja, el juego entero pasa a ser una
serie de decisiones sobre cuánto tiempo estar afuera y con cuánto encima.

## Qué cambia en el balance

Cuatro cosas, y conviene revisarlas cuando se toque cualquier número:

- **Los escalones altos pueden ser fuertes.** Un módulo A que rinde un 60 % más no
  desbalancea si además se pierde: el que lo lleva está arriesgando algo que le
  costó semanas fabricar.
- **Los materiales tienen piso de precio.** La reposición es demanda constante, así
  que el mineral común no se vuelve basura aunque todos sepan minarlo.
- **El seguro, si existe, va después.** Un sistema que devuelve parte del valor
  suaviza la pérdida, pero también la anula si se pasa de generoso. No entra en esta
  etapa.
- **El combate pasa a ser un prerrequisito de varias cosas**, no una etapa opcional
  del final. Sin él, la pérdida sólo puede venir de accidentes, y un juego donde lo
  único que te destruye es la mala suerte no es un juego de economía: es una
  lotería.

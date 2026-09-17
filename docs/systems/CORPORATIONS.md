# Corporaciones

> **Implementado en parte**: las corporaciones del mundo existen, operan las
> estaciones y **reciben pilotos**: al alistarse se elige una. Las de jugadores
> todavía no existen, y tampoco los roles ni la billetera compartida.
>
> Ver también: [facciones](FACTIONS.md) · [universo](UNIVERSE.md)

Una corporación es **quien opera las cosas**. Las estaciones no pertenecen a las
facciones: pertenecen a corporaciones, y esas corporaciones responden a una
facción o a ninguna.

## Por qué existe esta capa

Sin ella, una estación tendría una columna con el nombre de una facción y el
mundo quedaría plano: tres dueños posibles para todo. Con ella:

- **Hay muchísimos actores.** Cada rubro del juego va a tener los suyos, y dos
  corporaciones de la misma facción pueden llevarse pésimo.
- **La facción de una estación se deriva**: estación → corporación → facción. No
  se guarda dos veces, así que no puede contradecirse.
- **Una estación puede no responder a nadie.** El Amarre Franco es de Libre
  Amarre, que no le rinde cuentas a ninguna de las tres, y eso es exactamente su
  atractivo.

## Una sola tabla, para las del mundo y las de jugadores

`Corporation` tiene una marca de si es NPC, y ahí termina la diferencia.

Es la decisión importante del modelo. El día que un jugador construya una
estación, el dueño tiene que poder ser su corporación; con dos tablas separadas,
el dueño de una estación sería **polimórfico** —a veces apunta acá, a veces
allá—, que es el peor final posible y no se arregla después sin migrar todo.

Es además la tabla que va a usar el módulo Corporación cuando existan miembros,
roles y billetera compartida.

## Una corporación no es una estación con otro nombre

Puede no operar ninguna y existir igual, sólo como **gente**: la Vigilia Ánfora es
seguridad contratada por el Dominio y su presencia en el sistema es una capitana
sentada en Puerto Ánfora repartiendo trabajo. Ver
[agentes y misiones](MISSIONS.md).

Al revés también: una estación aloja agentes de corporaciones ajenas, y a veces de
otra facción. Eso es lo que la vuelve un lugar y no un edificio.

## Rubros

Minería, industria, comercio, exploración, seguridad y logística. Definen a qué
se dedica cada una y, más adelante, qué ofrece y qué contratos publica.

## El conjunto inicial

**Doce por facción y cuatro sin bandera**, cuarenta en total. Con tres o cuatro,
elegir a cuál alistarse no sería elegir; con esta cantidad, el sector empieza a
tener adentro gente que no se lleva bien entre sí.

Y **los doce de cada facción cubren los seis rubros, de a dos**. Eso no es
prolijidad: el rubro va a decidir qué contratos publica y qué compra cada una, así
que una facción a la que le falte un rubro es una facción donde media profesión no
encuentra trabajo, y con una sola por rubro elegir sería aceptar la única que hace
lo que uno quiere hacer.

Que sean **doce y no once** es además lo único que se ve desde afuera: el alta las
reparte en una grilla de dos columnas en tableta y tres en monitor, y once dejaban
la última fila coja. Un test verifica las tres cosas —el mínimo por facción, que
las tres ofrezcan la misma cantidad y que esa cantidad llene filas enteras—, que
es lo que mantiene parejo el catálogo cuando crezca.

Las cinco que operan una estación, que son la minoría:

| Corporación       | Rubro     | Responde a   | Opera                 |
| ----------------- | --------- | ------------ | --------------------- |
| Casa Verlan       | Comercio  | El Dominio   | Puerto Ánfora         |
| Extractora Anillo | Minería   | La Concordia | Muelle de los Anillos |
| Hidros Escarcha   | Industria | La Concordia | Planta Escarcha       |
| Comuna Talo       | Minería   | El Pacto     | Hábitat Talo          |
| Libre Amarre      | Logística | _ninguna_    | Amarre Franco         |

Las otras treinta y cinco **no operan ninguna**, y está bien: una corporación puede
existir sólo como gente.

Son contenido, no reglas, y viven en **su propio archivo**,
`src/lib/game/corporations.ts`, como las facciones y los oficios. Estaban adentro
del plano del universo y se mudaron cuando pasaron de seis a cuarenta: un
catálogo que va a llegar a doscientas convierte en depósito al archivo que lo
aloje. La siembra los carga desde ahí, y la data inicial que se genere más adelante
va a salir del mismo lugar.

## El piloto pertenece a una

`pilot.corporation_id` apunta a la misma tabla que las del mundo, así que el día
que exista una de jugadores afiliarse a una o a otra es la misma columna.

**Nulo es un estado legítimo y no un dato que falte**: un independiente vuela por
su cuenta, y va a ser el estado normal cuando se pueda renunciar. La pantalla lo
dice con esa palabra en vez de mostrar un hueco.

Se elige **al alistarse**, en un paso propio del alta, y sólo entre las de la
facción elegida: alistarse en una del Dominio habiendo nacido en el Pacto no es una
elección interesante, es una contradicción. El servicio lo revalida, porque la
pantalla filtra pero no decide.

### Y se puede cambiar después

Desde la ficha se **renuncia** y desde el estado de independiente se **elige otra**,
con las mismas reglas del alta y con la misma lista. Tres condiciones, y las tres
dicen lo mismo desde distintos lados —que la elección signifique algo—:

- **Hay que estar libre para alistarse.** Renunciar es una decisión aparte; sin
  eso se podría aparecer en otra sin haber salido de la anterior.
- **Tiene que ser de la facción del piloto.** Las cuatro sin bandera quedan afuera
  por la misma cuenta: operan estaciones, no reciben pilotos.
- **Las del mundo aceptan siempre.** El día que existan las de jugadores va a
  haber un campo que diga si reciben aspirantes; ponerlo hoy sería una columna en
  `true` para todas.

**La reputación no se toca al entrar ni al salir**, y ésa es la decisión que más
va a rendir después. El número es del par piloto × corporación y existe con o sin
membresía: se puede tener treinta con una en la que nunca se estuvo, y el que
renuncia no pierde lo que se ganó. Es lo que va a permitir que una corporación de
jugadores pida «Confiable para entrar» sin inventar ninguna mecánica nueva.

## El módulo Corporación

Entrada propia en el Neocom, después de Navegación y antes del Mercado: primero el
piloto, su nave y dónde está; después a quién le rinde cuentas; recién ahí lo que
compra y vende.

**Va a ser una zona de varias pestañas** —miembros, roles y permisos, bienes,
contratos—, y están las dos que hoy tienen algo detrás:

| Pestaña      | Qué contesta                                                         |
| ------------ | -------------------------------------------------------------------- |
| **Ficha**    | Quién es, qué rubro tiene, qué estaciones opera y dónde tiene gente  |
| **Miembros** | Quiénes son los otros: buscar, filtrar por oficio, ordenar y paginar |

Las demás llegan cuando tengan algo detrás: una entrada de menú que lleva a un
cartel es una puerta cerrada con el nombre puesto.

La ficha dice además **de qué clase es**: del mundo o de jugadores. Hoy son todas
del mundo y el rótulo dice siempre lo mismo, y va igual: el día que se puedan
fundar, el que mire una ficha tiene que poder saber de cuál de las dos es **sin
haberlo aprendido antes**, y una distinción que aparece recién cuando ya hay con
qué confundirse llega tarde. Sale del catálogo y no de una columna —las del mundo
son exactamente las que están ahí—, así que no hay nada que migrar.

La ficha termina en **«ver en el mapa»**, que abre la galaxia recortada a los
sistemas donde la corporación tiene un puesto. Es un botón y no una lista de
enlaces porque la pregunta no es «¿dónde está este puesto?» sino «¿dónde está
metida?», y eso lo contesta la forma del conjunto y no un nombre a la vez. El
recorte viaja en la URL y el mapa lo deja puesto en su propio desplegable, así
que se ve de dónde salió y se saca desde ahí.

Del listado de miembros se muestra **lo público** —cómo se llama cada uno, a qué se
dedica y desde cuándo vuela—: dónde está parado ahora no, porque un listado de
miembros no es un radar.

Y nace con **recorte, orden y paginado**, como todo listado del proyecto, en vez de
esperar a que haga falta: la lista de una corporación grande sin filtros es una
lista que no se usa. Se busca por distintivo y se filtra por oficio, que es la
pregunta que va a importar cuando se armen operaciones —hacen falta tres mineros y
un escolta, y eso no se contesta leyendo mil nombres—. El desplegable ofrece
**sólo los oficios que hay adentro**: uno que ofrece seis opciones de las que cinco
no encuentran nada hace perder el tiempo cinco veces de cada seis.

El orden de entrada es por **antigüedad**, que es como una corporación se cuenta a
sí misma. Como la fecha se guarda al segundo, los que empatan conservan el orden de
alta —el que entró primero tiene el identificador más bajo— y no se reacomodan
alfabéticamente, que sería mentir sobre quién estaba antes. La mecánica compartida
está en [arquitectura](ARCHITECTURE.md#toda-lista-larga-se-recorta-igual).

## El sello: la cara de cada una

Ninguna corporación queda sin emblema, y nadie tuvo que dibujar cuarenta:
**el sello se calcula a partir del nombre**. Mismo nombre, mismo sello, en
cualquier máquina y para siempre; no se guarda en ninguna tabla porque no hay nada
que guardar.

Lo arma `src/lib/identicon.ts`, que devuelve un plano —colores, celdas, formas— y
lo dibuja `Identicon.svelte` en SVG hecho a mano, como toda figura del juego.

Tres decisiones lo sostienen:

- **Simétrico**, espejado sobre el eje vertical: es lo que convierte un ruido de
  celdas en algo que parece un escudo.
- **Una familia por clase de cosa.** La corporación es un panal hexagonal con marco
  de seis lados; el piloto, un disco de casillas cuadradas y de un solo tono. No se
  confunden ni de reojo, y agregar una familia —alianzas, estaciones— es agregar una
  receta. La familia entra en la semilla, así que una corporación y un piloto que se
  llamen igual tampoco comparten dibujo.
- **Del idioma del juego**: hexágonos, y la saturación y el brillo fijos de la
  paleta, para que ningún emblema desentone con el naranja del HUD aunque su tono
  sea verde.

**Sobre repetirse**: «imposible» no existe con un hash, y conviene decirlo. Lo que
sí hay es medida. El generador no es el cuello de botella —arranca de 128 bits—, el
dibujo tiene del orden de cuatro billones de variantes, y por la paradoja del
cumpleaños el primer choque probable cae cerca de los dos millones de nombres. Un
test lo verifica sobre veinte mil. Si alguna vez el juego pasa esa escala, lo que
hay que agrandar es el dibujo —un anillo más de celdas multiplica el espacio por un
millón—, no el hash.

## Por decidir

- Cómo se crea una corporación de jugadores, y qué cuesta.
- Si una corporación de jugadores puede alinearse con una facción, y qué gana.
- Si renunciar tendría que costar algo —reputación, un tiempo de espera— o si
  está bien que sea gratis.
- Si las corporaciones NPC compiten entre sí de forma visible para el jugador.

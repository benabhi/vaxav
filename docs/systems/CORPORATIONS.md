# Corporaciones

> **Implementado en parte**: las corporaciones del mundo existen y operan las
> estaciones. Las de jugadores llegan en F12.
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

## Las del sistema inicial

| Corporación       | Rubro     | Responde a   | Opera                 |
| ----------------- | --------- | ------------ | --------------------- |
| Casa Verlan       | Comercio  | El Dominio   | Puerto Ánfora         |
| Extractora Anillo | Minería   | La Concordia | Muelle de los Anillos |
| Hidros Escarcha   | Industria | La Concordia | Planta Escarcha       |
| Comuna Talo       | Minería   | El Pacto     | Hábitat Talo          |
| Libre Amarre      | Logística | _ninguna_    | Amarre Franco         |
| Vigilia Ánfora    | Seguridad | El Dominio   | _ninguna_             |

Son contenido, no reglas: viven en el plano de `src/lib/game/universe.ts` y se
cargan con la siembra, igual que los cuerpos.

## Por decidir

- Cómo se crea una corporación de jugadores, y qué cuesta.
- Si una corporación de jugadores puede alinearse con una facción, y qué gana.
- Qué hace la reputación con una corporación, además de existir (ver
  [misiones](MISSIONS.md)).
- Si las corporaciones NPC compiten entre sí de forma visible para el jugador.

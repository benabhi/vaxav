# Profesiones

> **Implementado.** El alta reparte el presupuesto de experiencia y el piloto
> arranca con esas habilidades entrenadas y, si su oficio lo trae, con el equipo
> puesto en la nave.

> **Hoy sólo se ofrece el minero.** Una profesión se ofrece cuando hay algo que
> hacer con ella, y es la única con actividades propias. Las otras siete se quedan
> en el catálogo —siguen verificando el presupuesto y los pilotos que ya las tengan
> siguen jugando— pero no aparecen en el alta.
>
> Ver también: [habilidades](SKILLS.md) · [facciones](FACTIONS.md) ·
> [naves](SHIPS.md)

Al crear el piloto se elige una **profesión**: lo que venía haciendo antes de
comprarse una nave.

## No es una clase, y esto importa

**La profesión no tiene ninguna consecuencia mecánica.** Ni una. No da bonos, no
desbloquea nada, no cierra ninguna puerta y no se puede «equivocar»:

- **Cualquier piloto puede entrenar cualquier habilidad del catálogo**, desde el
  primer día y sin permiso de nadie. Un minero que se aburre puede terminar de
  mercader; sólo va a tardar más que uno que empezó ahí, y esa diferencia se mide
  en horas, no en semanas.
- **Nunca se vuelve a consultar.** Después del alta, el juego no le pregunta a
  nadie qué oficio eligió. Queda como parte de la historia del piloto, como la
  facción de origen.

Lo único que hace es **evitar la pantalla de ceros**: le da al piloto un puñado de
habilidades ya entrenadas y una Pioner adaptada a ese oficio, para que pueda hacer
algo útil desde el primer minuto en vez de mirar una nave vacía sin saber por
dónde empezar.

Dicho de otro modo: es **el primer reparto del presupuesto inicial, hecho por el
juego en vez de por el jugador**. Y por eso la pregunta abierta más interesante de
este documento sigue siendo si hace falta una novena opción «sin oficio» que deje
repartirlo a mano.

## Una por familia

Hay **ocho**, exactamente una por cada familia de habilidades, y un test lo hace
cumplir.

No es simetría por gusto: la familia es la unidad que tiene **pozo de experiencia
propio**, así que una familia sin oficio de entrada es una rama a la que nadie
llega con el repartidor puesto, y dos oficios en la misma familia son dos formas
de empezar en el mismo lugar.

## El presupuesto común

Todas reparten **la misma experiencia inicial**, contada con el multiplicador de
cada habilidad ya aplicado. Ninguna empieza mejor que otra: empiezan **distinto**.

El número sale de la curva y no de una cifra redonda, porque la curva se mueve y
el presupuesto tiene que moverse con ella:

```
2 × (una habilidad x1 al nivel II)  +  (una habilidad x2 al nivel I)  =  1.532
```

Esa forma —**dos habilidades que el piloto hace bien y una que conoce**— es la
misma para las ocho. Es lo que un oficio previo deja, y es lo que hace el balance
verificable de un vistazo: si las cuentas dan, está bien.

## Las ocho

### Minero · Extracción

Trabajó en los anillos hasta que juntó para su propia nave. Sabe sacar mineral, sabe acomodarlo y sabe leer una roca antes de picarla.

| Habilidad | Nivel | Rango | Costo |
| --------- | :---: | :---: | ----: |
| Minería   |  II   |  x1   |   666 |
| Estiba    |  II   |  x1   |   666 |
| Escaneo   |   I   |  x2   |   200 |

### Explorador · Ciencias

Vivió de vender coordenadas. Llega más lejos y ve antes lo que hay.

| Habilidad            | Nivel | Rango | Costo |
| -------------------- | :---: | :---: | ----: |
| Navegación           |  II   |  x1   |   666 |
| Manejo de lanzaderas |  II   |  x1   |   666 |
| Escaneo              |   I   |  x2   |   200 |

### Transportista · Pilotaje

Llevó carga ajena media vida. Nadie mete más cosas en menos bodega.

| Habilidad                 | Nivel | Rango | Costo |
| ------------------------- | :---: | :---: | ----: |
| Estiba                    |  II   |  x1   |   666 |
| Navegación                |  II   |  x1   |   666 |
| Eficiencia de combustible |   I   |  x2   |   200 |

### Mercader · Comercio

Empezó revendiendo en el muelle. Compra bien y sabe qué le están cobrando.

| Habilidad    | Nivel | Rango | Costo |
| ------------ | :---: | :---: | ----: |
| Regateo      |  II   |  x1   |   666 |
| Estiba       |  II   |  x1   |   666 |
| Contabilidad |   I   |  x2   |   200 |

### Escolta · Combate

Cobró por proteger convoyes. Tira derecho y arregla lo que le rompen.

| Habilidad | Nivel | Rango | Costo |
| --------- | :---: | :---: | ----: |
| Puntería  |  II   |  x1   |   666 |
| Mecánica  |  II   |  x1   |   666 |
| Blindaje  |   I   |  x2   |   200 |

### Técnico · Ingeniería

Fue mecánico de hangar. Entiende la nave por dentro mejor que nadie.

| Habilidad          | Nivel | Rango | Costo |
| ------------------ | :---: | :---: | ----: |
| Mecánica           |  II   |  x1   |   666 |
| Estiba             |  II   |  x1   |   666 |
| Gestión de energía |   I   |  x2   |   200 |

### Fundidor · Industria

Pasó años en un horno de estación. Sabe qué sale de cada piedra y cuánto se pierde en el intento.

| Habilidad   | Nivel | Rango | Costo |
| ----------- | :---: | :---: | ----: |
| Refinado    |  II   |  x1   |   666 |
| Fabricación |  II   |  x1   |   666 |
| Reciclaje   |   I   |  x2   |   200 |

### Contramaestre · Mando

Manejó la tripulación de un carguero ajeno. Repartir trabajo y cuentas es lo único que sabe hacer, y lo hace muy bien.

| Habilidad  | Nivel | Rango | Costo |
| ---------- | :---: | :---: | ----: |
| Liderazgo  |  II   |  x1   |   666 |
| Navegación |  II   |  x1   |   666 |
| Maniobra   |   I   |  x2   |   200 |

## Reglas de diseño

- **Los repartos respetan los prerrequisitos.** El Técnico puede tener Gestión de
  energía porque tiene Mecánica II; el Mercader, Contabilidad porque tiene Regateo
  II. Una profesión nunca entrega una habilidad que el piloto no podría haber
  entrenado.
- **Ninguna profesión es la buena.** Si alguna se vuelve la elección obvia, el
  problema está en el balance de las acciones, no en subirle los niveles.
- **La forma no se toca.** Dos x1 al nivel II y una x2 al nivel I. Una profesión
  que pida otra forma está pidiendo otro presupuesto, y ahí se rediscuten las
  ocho.
- **El equipo es parte del oficio, no del presupuesto.** Un oficio deja lo que uno
  sabe y también las herramientas con las que trabajaba; sin herramientas, el
  primer día es mirar el espacio. Va en el kit y no cuesta experiencia.

## Por decidir

- **Si hace falta una novena opción «sin oficio»** que reparta el presupuesto a
  gusto del jugador, para quien ya sabe lo que quiere. Es la que más sentido tiene
  de todas, justamente porque la profesión no es una clase.
- Si la profesión define también el **capital de arranque**.
- Si conviene mostrarla en el perfil público del piloto.

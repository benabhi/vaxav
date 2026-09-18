# Las bases: habilidades, naves, módulos y materiales

> **Documento de investigación y propuesta, no de implementación.** Nada de lo que
> hay acá está construido todavía, y varias cosas contradicen a propósito lo que
> hoy existe. Sirve para decidir; cuando algo se decide, se implementa y el
> documento del sistema correspondiente pasa a ser la verdad.
>
> Ver también: [diseño general](DESIGN.md) · [habilidades](systems/SKILLS.md) ·
> [naves](systems/SHIPS.md) · [acciones](systems/ACTIONS.md) ·
> [universo](systems/UNIVERSE.md)

## Por qué existe este documento

Vaxav llegó a un punto incómodo y sano a la vez: **funciona lo suficiente como
para notar que los cimientos son chicos**. Hay veintitrés habilidades, cuarenta y
ocho módulos, cinco cascos y cuatro minerales. Alcanza para probar el bucle; no
alcanza para un juego que se piensa en años.

El problema no es la cantidad. Es que un catálogo chico **no obliga a elegir**, y
elegir es todo lo que este género tiene para ofrecer. Si hay una nave minera, no
hay decisión de minería. Si una habilidad llega al cinco en veinte horas, no hay
identidad: hay una lista de pendientes.

Lo que sigue es, en este orden:

1. **Qué hay hoy**, contado sin maquillaje.
2. **Cómo resuelve esto EVE Online**, que es el juego que resolvió estos problemas
   hace veinte años y del que conviene robar con criterio.
3. **Qué adaptamos y qué no**, con el motivo de cada decisión.
4. **La progresión**: el diagnóstico numérico de por qué las habilidades suben
   demasiado rápido, y una propuesta concreta.
5. **Los catálogos propuestos**: habilidades, clases de nave, naves, módulos y
   materiales.
6. **Las cadenas**, actividad por actividad, con los huecos marcados.
7. **Cómo se implementa esto por etapas**, sin parar el juego en el camino.

Una advertencia sobre cómo leerlo. Las tablas grandes **no son una lista de
compras**: son un mapa. El valor está en que cada entrada tenga su lugar en una
cadena y en que se vea qué falta. Implementar la mitad, bien encadenada, vale más
que las dos terceras partes sueltas.

---

## 1 · Qué hay hoy

| Catálogo             | Cuántos | Estado                                                       |
| -------------------- | ------: | ------------------------------------------------------------ |
| Habilidades          |      23 | Seis familias. 13 no mueven ningún número todavía            |
| Cascos               |       5 | Pioner, Mula, Percal, Vencejo, Alabarda                      |
| Módulos              |      48 | Escalones E y A, clases 1 a 3                                |
| Minerales            |       4 | Sólo de asteroide. Sin hielo, gas ni planetario              |
| Materiales refinados |       0 | El refinado está escrito en los documentos y no en el código |
| Oficios              |       6 | Uno jugable: minero                                          |

Y tres cosas que conviene tener presentes porque condicionan todo lo demás:

- **La experiencia se gana haciendo, no esperando.** Es la diferencia deliberada
  con EVE y la decisión más importante ya tomada.
- **La experiencia va a un pozo por familia**, y el jugador decide en qué
  habilidad de esa rama gastarlo. Minar no sube Minería: llena el pozo de
  Extracción.
- **Ninguna mecánica entra sola.** La regla de la cadena —verbo, insumo, fuente,
  aparato, llave, fábrica, lugar— es el filtro con el que hay que leer todo lo que
  se propone acá.

---

## 2 · Cómo lo resuelve EVE Online

No para copiarlo. Para entender **qué problema resuelve cada pieza**, que es lo
único que se puede trasladar a un juego que no tiene el mismo soporte.

### 2.1 · Habilidades: rangos, curva y tiempo

EVE tiene unas 400 habilidades repartidas en unas 25 categorías. Tres mecanismos
las sostienen:

- **Cada habilidad tiene un rango** de 1 a 16, que multiplica su costo. No hay
  "habilidades caras" y "baratas" por criterio suelto: el rango es un número
  declarado y se ve.
- **La curva es empinada.** Cada nivel cuesta **√32 ≈ 5,66 veces** el anterior.
  Para un rango 1: 250, 1.414, 8.000, 45.255 y 256.000 puntos. El nivel 5 solo
  cuesta **más de cuatro veces la suma de los cuatro anteriores**.
- **Se entrena con el reloj, una por vez.** El recurso escaso no es el esfuerzo:
  es el tiempo, y es compartido. Entrenar una cosa es no entrenar otra.

Qué resuelve cada una:

| Mecanismo         | Problema que resuelve                                            |
| ----------------- | ---------------------------------------------------------------- |
| Rango declarado   | Que el costo sea legible y se pueda balancear sin tocar la curva |
| Curva de ×5,66    | Que el nivel 5 sea una **decisión de identidad** y no un trámite |
| Una cola de a una | Que especializarse **duela**, que es lo que le da peso           |
| Catálogo enorme   | Que nadie lo termine, y que dos pilotos veteranos sean distintos |

Lo importante para nosotros es el tercero. **EVE no hace escaso el aprender: hace
escaso el elegir qué aprender.** Nosotros ya tomamos esa idea por otro camino —el
pozo por familia— y funciona igual de bien: minar cuatro horas da para subir
Minería un nivel _o_ para abrir Prospección y Refinado, no para las dos cosas.

### 2.2 · La escalera de las naves

EVE agrupa los cascos en **clases**, y cada clase tiene su habilidad de manejo.
No se pilotea "una nave": se pilotea una clase, y dentro de la clase hay familias
con roles.

```
Lanzadera → Fragata → Destructor → Crucero → Crucero de batalla → Acorazado
                ↓          ↓           ↓
          Industrial   Barcaza    Transporte
                ↓          ↓
          Carguero     Exhumadora
```

Tres cosas que hacen que esa escalera funcione:

- **Subir de clase es caro y no siempre conviene.** Una fragata especializada le
  gana a un crucero genérico en su tarea. El tamaño no es progresión lineal.
- **Cada casco da bonos por nivel de una habilidad**, no valores fijos. La misma
  nave en manos distintas rinde distinto, y eso es lo que impide que la nave
  reemplace al piloto.
- **Cada clase tiene su amarre.** Una nave grande no entra en cualquier estación,
  y eso convierte al mapa en una decisión.

### 2.3 · La minería, que es más profunda de lo que parece

Es el pilar que tenemos a medio construir, y donde EVE tiene más para enseñar.

- **Tres materias primas distintas**, con naves y módulos distintos: **mineral**
  de asteroide, **hielo** y **gas**. No son variantes: son tres actividades con
  su propia habilidad, su propio aparato y su propio lugar.
- **El mineral varía con la seguridad del sistema.** Lo común está en todos lados
  y lo valioso sólo donde no hay ley. Es lo que empuja al jugador hacia afuera.
- **Cada mineral tiene variantes de calidad** (+5 %, +10 %, +15 %) que valen más y
  aparecen más lejos. Multiplica el catálogo sin multiplicar las decisiones.
- **Los láseres de tira usan cristales**, que se consumen, son específicos por
  mineral y se fabrican. Es la cadena entera en un solo módulo: verbo, insumo,
  fuente, aparato, llave y fábrica.
- **El mineral en bruto ocupa mucho más que lo refinado**, lo que vuelve a la
  logística una decisión propia: refinar cerca o acarrear lejos.

Lo último es lo que convierte a la minería en un oficio y no en un botón: **lo
caro no es sacar la piedra, es moverla**.

### 2.4 · La industria

La cadena de EVE, simplificada: **mineral → refinado → componentes → producto**,
con planos que dicen qué entra y qué sale, y con dos ejes de investigación —
eficiencia de material y de tiempo— que hacen que fabricar sea una carrera de
optimización y no una receta fija.

Lo aprovechable sin traer la complejidad entera:

- **Que refinar sea una habilidad con rendimiento porcentual**, y que la merma
  exista. Sin merma, refinar es un cambio de nombre.
- **Que los módulos avanzados pidan un material que sólo hay lejos.** Es lo que
  ata la industria a la geografía y le da sentido a viajar.
- **Que exista un escalón de componentes** entre el material y el producto.
  Convierte la fabricación en una cadena de varios oficios en vez de una receta.

### 2.5 · La exploración y la guerra electrónica

Dos sistemas que todavía no tenemos y que el juego va a pedir:

- **Sondas de escaneo**: hay cosas que no están en el mapa hasta que alguien las
  encuentra. La firma de una nave, su perfil de sensores y la habilidad del que
  busca deciden si aparece o no.
- **Buscar y esconderse son el mismo sistema visto de los dos lados.** Sensores
  contra firma. Un módulo que baja la firma vale exactamente lo que valen los
  sensores del que persigue.

Es la base de "escanear un sistema", "escanear un cuerpo" y "buscar a alguien",
que es justo lo que queremos más adelante. **Conviene diseñar los tres como una
sola mecánica con tres usos** y no como tres sistemas parecidos.

### 2.6 · Qué de EVE **no** queremos

Tan importante como lo anterior:

| De EVE                          | Por qué no                                                        |
| ------------------------------- | ----------------------------------------------------------------- |
| Entrenamiento con el reloj      | Vaxav entrena **haciendo**. Es la decisión de identidad del juego |
| Atributos neurales e implantes  | Optimización invisible que castiga al que no lee una wiki         |
| Invención con probabilidad      | Fabricar y que salga mal no es una decisión: es un impuesto       |
| Planos como objeto comerciable  | Una economía entera para sostener; más adelante, si hace falta    |
| Cientos de variantes por módulo | El catálogo tiene que caber en una cabeza                         |
| Pérdida total de nave al morir  | Sin decidir. Ver «Por decidir» en `DESIGN.md`                     |

---

## 3 · Qué adaptamos, y la forma que le damos

Siete decisiones que ordenan todo lo que viene después. Cada una está escrita como
**propuesta**: son las que hay que aprobar o rechazar antes de construir.

### P1 · La curva se empina y los rangos se abren hasta 16

Es el cambio más importante y el más barato: son dos constantes. Detalle y
números en la sección 4.

### P2 · Siete familias en vez de seis

Hoy son Pilotaje, Ingeniería, Extracción, Comercio, Combate y Ciencias. Se agrega
**Industria**, que hoy está repartida entre Extracción e Ingeniería y va a ser un
oficio entero.

La familia importa más que en otros juegos porque **es la moneda**: el pozo se
llena por familia. Una familia de más es un pozo que hay que llenar; una de menos
es una actividad que financia a otra que no le corresponde. Con siete, cada oficio
del juego tiene su pozo y ninguno depende de una actividad ajena.

### P3 · Las naves se agrupan en clases, y cada clase es una habilidad

Nadie "sabe volar naves". Se sabe volar **lanzaderas**, o **barcazas mineras**, o
**cruceros**. La habilidad de clase es el requisito duro del casco y el bono de
rol del casco cuelga de la habilidad de su especialidad, que es lo que ya hace
hoy.

### P4 · Tres materias primas, no una

Mineral de asteroide, **hielo** y **gas**. Cada una con su habilidad, su módulo y
su lugar. Es lo que convierte a la minería en un oficio con decisiones adentro.

### P5 · El escalón de componentes existe

`mineral → refinado → componente → módulo`. Cuatro pasos y no dos. El componente
es lo que hace que el técnico tenga trabajo aunque no mine ni venda.

### P6 · Buscar y esconderse son un solo sistema

Sensores contra firma, con una sola cuenta que sirve para escanear un sistema,
analizar un cuerpo y encontrar a alguien. Tres usos, una mecánica.

### P7 · La Pioner no tiene bono de rol

**Y es una regla, no un olvido.** Es el casco que el astillero le entrega a
cualquiera: si tuviera bono, el primer casco del juego ya estaría empujando al
piloto hacia una especialidad antes de que la elija. La Pioner vuela, carga poco,
aguanta menos y **no es buena en nada**. Todo lo que rinda de más tiene que venir
de lo que el piloto le monte y de lo que el piloto sepa.

Hoy tiene `+2 % de velocidad por nivel de Manejo de lanzaderas`. Se saca.
Consecuencia: Manejo de lanzaderas pasa a gobernar el requisito de la clase, que
es lo que le corresponde.

---

## 4 · La progresión: por qué sube demasiado rápido

### 4.1 · El diagnóstico, con números

Hoy: cada nivel cuesta **el triple** que el anterior, con el rango de 1 a 5.

| Nivel | Costo del nivel | Acumulado (rango 1) |
| ----: | --------------: | ------------------: |
|     1 |             100 |                 100 |
|     2 |             300 |                 400 |
|     3 |             900 |               1.300 |
|     4 |           2.700 |               4.000 |
|     5 |           8.100 |              12.100 |

Una acción reparte `10 × minutos × dificultad`. Con dificultad 1 eso son **600 XP
por hora de juego**. De ahí sale lo que preocupa:

| Habilidad  | XP a nivel 5 | Horas de acción |
| ---------- | -----------: | --------------: |
| Rango x1   |       12.100 |              20 |
| Rango x5   |       60.500 |             101 |
| **Las 23** |  **580.800** |        **~970** |

Novecientas setenta horas para tener **el catálogo entero al máximo** —los rangos
de las veintitrés suman 48, y cada rango cuesta 12.100—. Alguien que juegue dos
horas por día lo termina en poco más de un año, y a partir de ahí no hay nada que
entrenar. Para un juego pensado en años, eso no es progresión: es una
lista de pendientes con fecha de vencimiento.

Y hay un segundo problema, más sutil: **el nivel 5 cuesta el doble que los cuatro
anteriores juntos**, cuando debería costar mucho más. Con ×3, especializarse casi
no duele; el que junta experiencia termina llevando todo al 5 porque el último
tramo no lo frena.

### 4.2 · Qué mover, en orden de efecto

Hay cuatro perillas y conviene entender qué hace cada una antes de tocarlas:

| Perilla                     | Efecto                                  | Riesgo                                     |
| --------------------------- | --------------------------------------- | ------------------------------------------ |
| **Crecimiento por nivel**   | Cambia la forma: cuánto pesa el nivel 5 | Ninguno: es la perilla correcta            |
| **Techo de rango**          | Cuánto se estira lo especializado       | Ninguno: es la perilla correcta            |
| **Cantidad de habilidades** | Cuánto hay para hacer en total          | Un catálogo inflado no se lee              |
| **XP por minuto**           | Todo más lento, parejo                  | Hace que **jugar** se sienta lento. Evitar |

**Las dos primeras son las que hay que mover.** La última es la tentación fácil y
la peor: bajar el XP por minuto no hace el juego más largo, hace cada sesión más
aburrida. Lo que se quiere es que el último nivel sea caro, no que el primero
tarde.

### 4.3 · La propuesta

**Crecimiento de ×3 a ×5,66** (la raíz de 32, que es exactamente la de EVE) y
**rangos de x1 a x16**.

| Nivel | Costo del nivel | Acumulado (rango 1) |
| ----: | --------------: | ------------------: |
|     1 |             100 |                 100 |
|     2 |             566 |                 666 |
|     3 |           3.200 |               3.866 |
|     4 |          18.102 |              21.968 |
|     5 |         102.400 |             124.368 |

Lo que esto cambia, dicho en horas de juego a 600 XP por hora:

| Meta                                  |    Hoy | Propuesta |
| ------------------------------------- | -----: | --------: |
| Nivel 1 de una habilidad de entrada   | 10 min |    10 min |
| Nivel 3 de una habilidad de entrada   |    2 h |     6,5 h |
| Nivel 4 de una habilidad de entrada   |    7 h |      37 h |
| Nivel 5 de una habilidad de entrada   |   20 h |     207 h |
| Nivel 5 de una habilidad de rango x5  |  101 h |   1.036 h |
| Nivel 5 de una habilidad de rango x16 |      — |   3.316 h |

Las tres propiedades que tiene esa forma y que son las que se buscaban:

- **Los primeros niveles siguen siendo inmediatos.** Nivel 1 en diez minutos y
  nivel 3 en una tarde larga: el juego no se vuelve lento al empezar, que es lo
  que había que cuidar.
- **El nivel 4 ya es una inversión y el 5 es una identidad.** Cuesta cinco veces
  y media lo que los cuatro anteriores juntos. Nadie lleva veinte habilidades al
  cinco; se llevan tres, y ésas dicen quién sos.
- **El rango estira sin deformar.** Un x16 al cinco son más de tres mil horas: es
  el techo de una carrera, no un objetivo de temporada.

Con el catálogo propuesto en la sección 5 —**110 habilidades**, cuyos rangos suman
416— llevarlo todo al nivel 5 pasa a costar **51,7 millones de experiencia**: más
de **ochenta mil horas** de juego. Y el número importa menos que lo que significa:
deja de ser una meta y pasa a ser un horizonte. Nadie lo termina, y por eso dos
veteranos se parecen tan poco.

### 4.4 · Qué se toca en el código

Tres constantes y una migración de datos:

- `LEVEL_COSTS` y `LEVEL_THRESHOLDS` en `game/progression.ts`.
- `MAX_DIFFICULTY` en `game/skills.ts`, de 5 a 16.
- **La experiencia ya gastada de los pilotos existentes.** Con la curva nueva, un
  piloto que hoy tiene una habilidad al 4 pasaría a tenerla al 2. Como todavía no
  hay jugadores de verdad, la migración correcta es **devolver al pozo todo lo
  invertido** y dejar que cada uno vuelva a repartirlo: es honesto y es una línea
  de SQL. El día que haya jugadores, esto ya no se puede hacer así.

Y una escalera de rangos fija, para que los números no se inventen caso por caso:

| Rango | Para qué                                                        |
| ----: | --------------------------------------------------------------- |
|    x1 | Habilidad de entrada de una familia. Cualquiera la empieza      |
|    x2 | El segundo escalón de una rama; lo que se usa todos los días    |
|    x3 | Especialización clara dentro de un oficio                       |
|    x4 | Lo que abre una clase de nave intermedia o un módulo avanzado   |
|    x5 | La punta de una rama de oficio                                  |
|    x6 | Clases de nave pesadas, técnicas caras                          |
|    x8 | Lo que define a un veterano de un oficio                        |
|   x12 | Capacidades de flota o de capital                               |
|   x16 | El tope del juego. Una o dos por familia, y ninguna obligatoria |

---

## 5 · El catálogo de habilidades

**Ciento diez habilidades en siete familias.** Parece mucho y es el punto: un
catálogo que se termina es un catálogo chico. Lo que hace que no sea inabarcable
no es el tamaño sino la forma — cada familia tiene una habilidad de entrada que
cualquiera puede empezar, y de ahí sale una rama por oficio.

Cómo leer las tablas:

- **Rango** es el multiplicador de costo, de la escalera de la sección 4.4.
- **Gobierna** es qué número mueve. Una habilidad que no mueve ningún número es un
  huérfano y no debería entrar: si la columna dice «nada todavía», la habilidad
  espera a que exista la mecánica.
- **Pide** son los prerrequisitos. Se leen como `Habilidad N`.

Las marcadas con **(hoy)** ya existen en el catálogo; el resto son propuestas. Las
que cambian de familia o de rango lo dicen.

### 5.1 · Pilotaje — dónde y cómo se mueve la nave

La familia de las **clases de nave**. Volar una clase que no se sabe volar es
imposible, no penalizado: es el requisito duro más importante del juego.

| Habilidad                           | Rango | Gobierna                                | Pide                               |
| ----------------------------------- | ----: | --------------------------------------- | ---------------------------------- |
| Manejo de lanzaderas **(hoy)**      |    x1 | Requisito de la clase lanzadera         | —                                  |
| Navegación **(hoy)**                |    x1 | Velocidad dentro del sistema            | —                                  |
| Maniobra                            |    x2 | Tiempo de alineación antes de salir     | Navegación 2                       |
| Eficiencia de combustible **(hoy)** |    x2 | Consumo por salto                       | Navegación 2                       |
| Naves ligeras                       |    x2 | Requisito de la clase corbeta           | Manejo de lanzaderas 3             |
| Astrogación **(hoy)**               |    x3 | Tiempo de salto                         | Navegación 3                       |
| Naves industriales                  |    x3 | Requisito de la clase industrial        | Naves ligeras 3                    |
| Destructores                        |    x3 | Requisito de la clase destructor        | Naves ligeras 3                    |
| Cálculo de saltos                   |    x4 | Alcance de salto                        | Astrogación 3                      |
| Barcazas mineras                    |    x4 | Requisito de la clase barcaza           | Naves industriales 3, Minería 4    |
| Pilotaje evasivo                    |    x4 | Firma mientras se está en movimiento    | Maniobra 3                         |
| Cruceros                            |    x5 | Requisito de la clase crucero           | Destructores 3                     |
| Transportes rápidos                 |    x6 | Requisito de la clase transporte        | Naves industriales 4, Maniobra 4   |
| Cargueros                           |    x6 | Requisito de la clase carguero          | Naves industriales 5               |
| Naves de reconocimiento             |    x6 | Requisito de la clase explorador pesado | Naves ligeras 5, Escaneo 4         |
| Exhumadoras                         |    x6 | Requisito de la clase exhumadora        | Barcazas mineras 5                 |
| Acorazados                          |    x8 | Requisito de la clase acorazado         | Cruceros 5                         |
| Vuelo en formación                  |    x8 | Cuántas naves coordina una flota        | Cruceros 4                         |
| Naves capitales                     |   x12 | Requisito de la clase capital           | Acorazados 5, Vuelo en formación 4 |

### 5.2 · Ingeniería — los sistemas de la nave

Todo lo que hace que un casco vuele y aguante. **Es la familia que ningún oficio
puede saltear**: el minero necesita bodega y acumulador, el mercader necesita
blindaje para no perder la carga, el explorador necesita energía.

| Habilidad                      | Rango | Gobierna                                           | Pide                             |
| ------------------------------ | ----: | -------------------------------------------------- | -------------------------------- |
| Mecánica **(hoy)**             |    x1 | Estructura del casco y reparación                  | —                                |
| Gestión de energía **(hoy)**   |    x2 | Potencia disponible de la planta                   | Mecánica 2                       |
| Ingeniería de bodega **(hoy)** |    x2 | Capacidad efectiva de carga                        | Mecánica 2                       |
| Blindaje **(hoy, de Combate)** |    x2 | Puntos de blindaje                                 | Mecánica 2                       |
| Escudos **(hoy, de Combate)**  |    x2 | Capacidad de escudo                                | Gestión de energía 2             |
| Ajuste de módulos **(hoy)**    |    x3 | Cómputo disponible; requisito de módulos avanzados | Mecánica 3, Gestión de energía 2 |
| Acumulador                     |    x3 | Capacidad del acumulador                           | Gestión de energía 3             |
| Recarga de escudos             |    x3 | Velocidad de recarga del escudo                    | Escudos 3                        |
| Reparación de casco            |    x3 | Rendimiento de los módulos de reparación           | Mecánica 3                       |
| Ingeniería de propulsión       |    x4 | Empuje de los propulsores                          | Gestión de energía 3             |
| Compensación de blindaje       |    x4 | Resistencias del blindaje                          | Blindaje 4                       |
| Compensación de escudos        |    x4 | Resistencias del escudo                            | Escudos 4                        |
| Montaje de refuerzos           |    x4 | Requisito y penalización de los refuerzos de casco | Ajuste de módulos 3              |
| Sistemas de emergencia         |    x4 | Qué queda encendido cuando falta potencia          | Gestión de energía 4             |
| Termodinámica                  |    x5 | Sobrecargar un módulo sin quemarlo                 | Ajuste de módulos 4              |
| Ingeniería avanzada            |    x8 | Requisito de los módulos de escalón A              | Ajuste de módulos 5              |

### 5.3 · Extracción — sacarlo de donde está

Tres materias primas y tres caminos. **La habilidad de entrada es la misma**, pero
el hielo y el gas piden aparatos distintos y aparecen en lugares distintos.

| Habilidad                 | Rango | Gobierna                                          | Pide                             |
| ------------------------- | ----: | ------------------------------------------------- | -------------------------------- |
| Minería **(hoy)**         |    x1 | Rendimiento por ciclo de láser                    | —                                |
| Estiba **(hoy)**          |    x1 | Cuánto compacta el mineral en bodega              | —                                |
| Supervisión de cinturón   |    x2 | Qué se ve de un cinturón sin escanear cada roca   | Minería 2                        |
| Prospección **(hoy)**     |    x3 | Profundidad de la lectura de una roca             | Minería 3, Escaneo 2             |
| Extracción de hielo       |    x3 | Rendimiento y ciclo de los cosechadores de hielo  | Minería 3                        |
| Explotación de anillos    |    x3 | Rendimiento en anillos planetarios                | Minería 3                        |
| Láseres de tira           |    x4 | Requisito y rendimiento de los láseres de tira    | Minería 4, Barcazas mineras 1    |
| Cristales de extracción   |    x4 | Cuánto dura un cristal y cuánto suma              | Láseres de tira 2                |
| Extracción de gas         |    x4 | Rendimiento de los aspiradores de nube            | Minería 4, Escaneo 3             |
| Extracción planetaria     |    x4 | Qué se puede sacar de la superficie de un planeta | Minería 3, Escaneo 3             |
| Rendimiento de extracción |    x5 | Bono general sobre todo lo que se extrae          | Minería 5                        |
| Extracción profunda       |    x5 | Acceso a los minerales que sólo hay sin ley       | Láseres de tira 4, Prospección 4 |
| Drones de extracción      |    x5 | Cuántos drones mineros se controlan               | Minería 4, Drones 3              |
| Recuperación de pecios    |    x4 | Qué se saca de una nave destruida                 | Mecánica 3, Escaneo 3            |
| Explotación industrial    |    x8 | Bono de rendimiento de las clases pesadas         | Exhumadoras 3, Rendimiento 4     |

### 5.4 · Industria — convertirlo en otra cosa

**Familia nueva.** Hoy está repartida entre Extracción e Ingeniería, y eso hace
que el que fabrica financie su oficio minando, que es exactamente lo que el pozo
por familia viene a evitar.

| Habilidad                         | Rango | Gobierna                                       | Pide                                     |
| --------------------------------- | ----: | ---------------------------------------------- | ---------------------------------------- |
| Refinado **(hoy, de Extracción)** |    x1 | Rendimiento del refinado en estación           | —                                        |
| Fabricación                       |    x1 | Requisito para fabricar; tiempo de trabajo     | —                                        |
| Munición y cargas                 |    x2 | Fabricar munición, cristales y cargas          | Fabricación 2                            |
| Reciclaje                         |    x2 | Qué se recupera al desarmar un módulo          | Refinado 2                               |
| Componentes                       |    x2 | Fabricar los componentes intermedios           | Fabricación 2                            |
| Tasación de mena                  |    x2 | Estimar el rinde de un lote antes de refinarlo | Refinado 2, Análisis de materiales 2     |
| Química industrial                |    x3 | Procesar gas y hielo en insumos utilizables    | Refinado 3                               |
| Eficiencia de tiempo              |    x3 | Cuánto tarda un trabajo de fabricación         | Fabricación 3                            |
| Planos y licencias                |    x3 | Cuántos planos se pueden tener en uso          | Fabricación 3                            |
| Producción en serie               |    x3 | Cuántos trabajos simultáneos                   | Fabricación 4                            |
| Eficiencia de material            |    x4 | Cuánto material se ahorra por trabajo          | Fabricación 4                            |
| Ingeniería de módulos             |    x4 | Fabricar módulos de escalón intermedio         | Componentes 3, Ajuste de módulos 3       |
| Cristalografía                    |    x4 | Fabricar cristales de extracción               | Componentes 3, Cristales de extracción 2 |
| Fabricación avanzada              |    x5 | Fabricar módulos de escalón A                  | Ingeniería de módulos 4                  |
| Construcción de cascos            |    x6 | Fabricar cascos                                | Componentes 4, Producción en serie 3     |
| Industria de capital              |   x12 | Fabricar cascos y estructuras de clase capital | Construcción de cascos 5                 |

### 5.5 · Comercio — moverlo y venderlo

| Habilidad                     | Rango | Gobierna                                         | Pide                               |
| ----------------------------- | ----: | ------------------------------------------------ | ---------------------------------- |
| Regateo **(hoy)**             |    x1 | Margen con la estación                           | —                                  |
| Tasación                      |    x2 | Ver el valor real de lo que se compra o se vende | Regateo 2                          |
| Contabilidad **(hoy)**        |    x2 | Impuesto de venta y cuántas órdenes se llevan    | Regateo 2                          |
| Aranceles                     |    x3 | Qué se paga al operar fuera de la propia bandera | Contabilidad 3                     |
| Análisis de mercado **(hoy)** |    x3 | Cuántas regiones se ven                          | Regateo 3                          |
| Negociación                   |    x3 | Recompensa de los contratos de agente            | Regateo 3                          |
| Corretaje                     |    x4 | Comisión al publicar una orden                   | Contabilidad 4                     |
| Contactos **(hoy)**           |    x4 | Cuánto dura publicada una orden                  | Regateo 4, Contabilidad 3          |
| Contratos                     |    x4 | Cuántos contratos propios se sostienen           | Corretaje 3                        |
| Logística comercial           |    x4 | Costo de mover carga por encargo                 | Contabilidad 3                     |
| Especulación                  |    x5 | Ver el histórico de precios y su tendencia       | Análisis de mercado 4              |
| Redes comerciales             |    x6 | Alcance de las órdenes a distancia               | Análisis de mercado 5, Contactos 4 |
| Diplomacia corporativa        |    x6 | Reputación ganada por operar con una bandera     | Negociación 4                      |

### 5.6 · Combate — y no perder la carga

La familia que hoy tiene más huérfanos, porque el combate todavía no existe. Entra
cuando entre el combate y no antes: **son las llaves de un verbo que no está**.

| Habilidad                    | Rango | Gobierna                                      | Pide                                |
| ---------------------------- | ----: | --------------------------------------------- | ----------------------------------- |
| Puntería **(hoy)**           |    x1 | Daño base de las armas montadas               | —                                   |
| Enganche                     |    x2 | A cuántos blancos se apunta y a qué distancia | Puntería 2                          |
| Cañones de masa              |    x2 | Daño cinético                                 | Puntería 3                          |
| Emisores iónicos             |    x2 | Daño iónico                                   | Puntería 3, Gestión de energía 2    |
| Lanzas térmicas              |    x2 | Daño térmico                                  | Puntería 3                          |
| Municiones                   |    x2 | Qué cargas se pueden usar y cuánto rinden     | Puntería 2                          |
| Cadencia                     |    x3 | Tiempo de ciclo de las armas                  | Puntería 4                          |
| Precisión                    |    x3 | Cuánto pega a blanco chico o rápido           | Enganche 3                          |
| Drones                       |    x3 | Cuántos drones se controlan                   | Ajuste de módulos 2                 |
| Tácticas de escolta          |    x4 | Bono a lo que se protege, no a uno mismo      | Enganche 3, Vuelo en formación 1    |
| Guerra electrónica **(hoy)** |    x4 | Interferir, trabar o escapar de un enganche   | Gestión de energía 3, Escaneo 2     |
| Perturbación de sensores     |    x4 | Bajar los sensores del otro                   | Guerra electrónica 3                |
| Inhibición de salto          |    x5 | Impedir que el otro salte                     | Guerra electrónica 4, Astrogación 3 |
| Artillería pesada            |    x6 | Armas de clase 5 en adelante                  | Cadencia 4, Cruceros 3              |
| Mando de flota               |    x6 | Bono que se reparte a toda la flota           | Vuelo en formación 3                |
| Doctrina de flota            |    x8 | Cuántos bonos de mando se sostienen a la vez  | Mando de flota 4                    |

### 5.7 · Ciencias — encontrar, entender y esconderse

La familia de **buscar y esconderse**, que son el mismo sistema. Es también la que
va a sostener escanear un sistema, analizar un cuerpo y encontrar a alguien.

| Habilidad                        | Rango | Gobierna                                            | Pide                               |
| -------------------------------- | ----: | --------------------------------------------------- | ---------------------------------- |
| Escaneo **(hoy, era x2)**        |    x1 | Alcance y calidad del escáner de a bordo            | —                                  |
| Sensores                         |    x2 | Alcance de los sensores pasivos                     | Escaneo 2                          |
| Análisis de materiales **(hoy)** |    x2 | Identificar lo que se extrae o se encuentra         | Escaneo 2                          |
| Sondas de exploración            |    x3 | Cuántas sondas se lanzan y cómo se ubican           | Escaneo 3                          |
| Análisis de firmas               |    x3 | Distinguir qué es una señal antes de ir             | Sondas de exploración 2            |
| Cartografía **(hoy)**            |    x3 | Registrar rutas y sistemas no cartografiados        | Escaneo 3, Astrogación 2           |
| Perfil de firma                  |    x4 | Bajar la propia firma: no ser encontrado            | Sensores 3                         |
| Astrometría                      |    x4 | Fuerza de escaneo: qué tan débil puede ser la señal | Sondas de exploración 3            |
| Arqueología                      |    x4 | Abrir yacimientos y restos                          | Análisis de firmas 3               |
| Criptografía                     |    x4 | Abrir depósitos de datos                            | Análisis de firmas 3               |
| Contravigilancia                 |    x5 | Detectar que a uno lo están escaneando              | Perfil de firma 4                  |
| Rastreo                          |    x5 | Encontrar una nave concreta y no una señal          | Astrometría 4                      |
| Investigación                    |    x5 | Mejorar planos: material y tiempo                   | Análisis de materiales 4           |
| Física de salto                  |    x6 | Entender y usar pasajes no cartografiados           | Cartografía 4, Cálculo de saltos 3 |
| Xenoarqueología                  |    x8 | Los restos que nadie sabe leer todavía              | Arqueología 5, Criptografía 4      |

### 5.8 · Cómo crece el catálogo sin desbordarse

Tres reglas para cuando haya que agregar la habilidad ciento trece:

1. **Una habilidad nueva mueve un número que ya existe, o entra con la mecánica
   que lo crea.** Nunca antes. Es la regla de la cadena aplicada a este catálogo.
2. **Cada familia tiene una sola habilidad de entrada de rango x1** —dos como
   mucho—. Es la puerta, y una familia con cinco puertas no se siente como una
   rama sino como una bolsa.
3. **El rango sale de la escalera de la sección 4.4**, no del gusto. Si una
   habilidad parece merecer un rango que la escalera no le da, lo que está mal es
   dónde se la puso en el árbol.

---

## 6 · Las naves: clases, cascos y bonos

### 6.1 · La clase es la unidad, no el casco

Nadie sabe «volar naves». Se sabe volar **una clase**, y ésa es la habilidad que el
casco exige. Trae cuatro consecuencias que valen más que la lista de naves:

1. **Cambiar de clase es una decisión cara**, con su propio rango de habilidad. No
   se sube de nave por juntar créditos.
2. **Dentro de una clase hay roles**, y ahí la decisión es gratis: el que sabe
   volar corbetas las vuela todas. Lo que separa a la minera ligera de la
   exploradora es qué le montás y qué sabés hacer, no otro permiso.
3. **Cada clase tiene su amarre.** Una nave grande no entra en cualquier estación,
   y eso convierte al mapa en una decisión de logística.
4. **El tamaño no es progresión.** Una corbeta minera especializada saca más
   mineral que un crucero genérico. Subir de clase sirve para hacer **otra cosa**,
   no para hacer lo mismo mejor.

| Clase                 | Habilidad            | Amarre | Para qué está                                    |
| --------------------- | -------------------- | ------ | ------------------------------------------------ |
| **Lanzadera**         | Manejo de lanzaderas | Chico  | Empezar. Vuela, carga poco y no es buena en nada |
| **Corbeta**           | Naves ligeras        | Chico  | La primera especialización real                  |
| **Destructor**        | Destructores         | Chico  | Muchos anclajes en un casco barato               |
| **Industrial**        | Naves industriales   | Medio  | Mover carga sin pretensiones                     |
| **Barcaza minera**    | Barcazas mineras     | Medio  | Extraer en serio: láseres de tira y cristales    |
| **Crucero**           | Cruceros             | Medio  | El casco polivalente del medio juego             |
| **Transporte rápido** | Transportes rápidos  | Medio  | Mover carga por donde no conviene ir lento       |
| **Reconocimiento**    | Naves de recon.      | Chico  | Ver sin ser visto                                |
| **Exhumadora**        | Exhumadoras          | Medio  | La punta de la minería                           |
| **Carguero**          | Cargueros            | Grande | Volumen, y nada más que volumen                  |
| **Acorazado**         | Acorazados           | Grande | Aguantar y pegar                                 |
| **Capital**           | Naves capitales      | Grande | El horizonte. No entra en esta etapa             |

### 6.2 · La regla del bono de rol

**Cada casco tiene exactamente un bono, y escala con una habilidad.** Nunca un
valor fijo. Es lo que impide que la nave reemplace al piloto: una barcaza en manos
sin entrenar es una nave con bodega y nada más.

Y una excepción que es una regla:

> **La Pioner no tiene bono.** Es el casco que el astillero le entrega a cualquiera
> que se dé de alta. Si tuviera bono, el primer casco del juego ya estaría
> empujando al piloto hacia una especialidad antes de que la elija. Todo lo que
> rinda de más tiene que venir de lo que le monte y de lo que sepa.

### 6.3 · El catálogo de cascos

Veinte, y ninguno bueno en todo. Los marcados con **(hoy)** ya existen; el resto
son propuestas. Los números concretos —masa, bodega, ranuras— se fijan al
implementar cada uno; lo que decide acá es **el rol y el bono**.

#### Lanzadera

| Casco            | Rol             | Bono de rol              | Pide |
| ---------------- | --------------- | ------------------------ | ---- |
| **Pioner (hoy)** | La nave de alta | **Ninguno, a propósito** | —    |

#### Corbeta — la primera especialización

| Casco             | Rol           | Bono de rol                                     | Pide                        |
| ----------------- | ------------- | ----------------------------------------------- | --------------------------- |
| **Vencejo (hoy)** | Exploradora   | +8 % alcance de sensores por nivel de Escaneo   | Naves ligeras 1, Escaneo 2  |
| **Barreno**       | Minera ligera | +10 % rendimiento de láser por nivel de Minería | Naves ligeras 1, Minería 2  |
| **Estilete**      | Escolta       | +5 % daño por nivel de Puntería                 | Naves ligeras 2, Puntería 2 |
| **Saeta**         | Correo        | +10 % velocidad por nivel de Maniobra           | Naves ligeras 2, Maniobra 2 |

El **Barreno** es la nave importante de esta clase: es el primer casco con bodega
de mineral separada de la bodega general, que es lo que convierte a la minería en
un oficio con logística propia.

#### Destructor — muchos anclajes, casco barato

| Casco              | Rol          | Bono de rol                                                   | Pide                           |
| ------------------ | ------------ | ------------------------------------------------------------- | ------------------------------ |
| **Alabarda (hoy)** | Combate      | +5 % daño por nivel de Cadencia                               | Destructores 1, Puntería 3     |
| **Rapiña**         | Recuperación | +10 % de lo que se saca de un pecio por nivel de Recuperación | Destructores 2, Recuperación 2 |

#### Industrial — mover carga

| Casco          | Rol                 | Bono de rol                                   | Pide                                    |
| -------------- | ------------------- | --------------------------------------------- | --------------------------------------- |
| **Mula (hoy)** | Carguera            | +5 % bodega por nivel de Ingeniería de bodega | Naves industriales 1, Ing. de bodega 2  |
| **Ónice**      | Transporte discreto | −8 % firma por nivel de Perfil de firma       | Naves industriales 2, Perfil de firma 2 |

#### Barcaza minera — el salto de oficio

La clase que cambia la minería de actividad a profesión: **es la que puede montar
láseres de tira**, que piden cristales, que se fabrican y se gastan.

| Casco            | Rol                | Bono de rol                                                    | Pide                                      |
| ---------------- | ------------------ | -------------------------------------------------------------- | ----------------------------------------- |
| **Percal (hoy)** | Barcaza de mineral | +5 % rendimiento de láser de tira por nivel de Láseres de tira | Barcazas mineras 1, Láseres de tira 1     |
| **Glaciar**      | Barcaza de hielo   | −5 % ciclo del cosechador por nivel de Extracción de hielo     | Barcazas mineras 2, Extracción de hielo 3 |
| **Sifón**        | Barcaza de gas     | +8 % rendimiento del aspirador por nivel de Extracción de gas  | Barcazas mineras 2, Extracción de gas 3   |

#### Crucero — el casco polivalente

| Casco       | Rol                | Bono de rol                                               | Pide                              |
| ----------- | ------------------ | --------------------------------------------------------- | --------------------------------- |
| **Espolón** | Combate            | +5 % daño por nivel de Artillería pesada                  | Cruceros 1, Cadencia 3            |
| **Fragua**  | Apoyo              | +10 % reparación a otros por nivel de Tácticas de escolta | Cruceros 2, Tácticas de escolta 2 |
| **Quimera** | Guerra electrónica | +10 % efecto de perturbación por nivel de G. electrónica  | Cruceros 2, Guerra electrónica 3  |

#### Las clases especializadas

| Casco        | Clase             | Rol                     | Bono de rol                                                | Pide                                     |
| ------------ | ----------------- | ----------------------- | ---------------------------------------------------------- | ---------------------------------------- |
| **Corsario** | Transporte rápido | Pasar donde no conviene | −10 % firma por nivel de Transportes rápidos               | Transportes rápidos 1, Perfil de firma 3 |
| **Espectro** | Reconocimiento    | Ver sin ser visto       | +10 % fuerza de escaneo por nivel de Astrometría           | Naves de recon. 1, Astrometría 3         |
| **Cíclope**  | Exhumadora        | La punta de la minería  | +8 % rendimiento de láser de tira por nivel de Exhumadoras | Exhumadoras 1, Láseres de tira 4         |
| **Coloso**   | Carguero          | Volumen y nada más      | +5 % bodega por nivel de Cargueros                         | Cargueros 1, Ing. de bodega 4            |
| **Tizona**   | Acorazado         | Aguantar y pegar        | +5 % resistencias por nivel de Acorazados                  | Acorazados 1, Compensación de blindaje 3 |

### 6.4 · Cómo se nombra una nave

Sin una regla, el catálogo deriva: la primera tanda sale evocadora y la décima
sale de la cocina. Cuatro criterios, y el cuarto es el que más trabaja:

1. **Una sola palabra**, sin artículo y sin apellido. `Corsario`, no `El Corsario`
   ni `Corsario Mk II`.
2. **Sustantivo concreto**, nunca adjetivo. `Espectro` dice algo; `Furtiva` es una
   etiqueta pegada encima.
3. **Del registro del oficio o del filo**: herramientas, armas, piedra,
   depredadores, accidentes geográficos. Nada doméstico ni rural — una nave no se
   llama como algo que hay en una cocina o en un galpón.
4. **Tiene que poder gritarse en una radio.** Dos o tres sílabas, consonante dura,
   sin diminutivos. Si el nombre suena tierno, está mal: estas cosas pesan
   cuatrocientas toneladas.

Y una regla de coherencia: **el nombre dice el carácter, no el rol**. `Barreno` no
dice «minera», dice «perfora»; `Fragua` no dice «apoyo», dice «repara y aguanta
calor». El rol ya está escrito al lado; el nombre está para que se recuerde.

> **Los cinco cascos que ya existen se quedan como están.** `Pioner`, `Vencejo` y
> `Alabarda` cumplen la regla de sobra. `Mula` y `Percal` no del todo —son de otro
> registro, más rural—, pero están sembrados y en la base, y renombrarlos es una
> migración por un problema de gusto. Si se decide cambiarlos, `Acémila` y `Basalto`
> entran sin tocar nada de lo que significan.

### 6.5 · Qué hace falta en el código para que esto entre

Cuatro cambios, ninguno grande, y conviene el orden:

1. **`Hull` gana `class`**, del catálogo de clases, y el requisito de clase sale de
   ahí en vez de escribirse a mano en cada casco. Así es imposible crear un casco
   de una clase y olvidarse de pedir su habilidad.
2. **`RoleBonus` pasa a ser opcional** —`RoleBonus | null`—, que es lo que la
   Pioner necesita. Hoy el tipo obliga a inventarle uno.
3. **`BONUS_TARGETS` se amplía**: rendimiento de tira, ciclo de cosechador, firma,
   fuerza de escaneo, resistencias, reparación a otros. Son datos y no código, así
   que agregar uno es agregar una entrada.
4. **La bodega de mineral separada** es un atributo nuevo del casco, y el primero
   que va a pedir cambios en el inventario: una bodega que sólo acepta una clase de
   ítem.

---

## 7 · Los materiales

### 7.1 · Cuatro escalones, no dos

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

### 7.2 · Minerales de asteroide

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

### 7.3 · Hielo

Otra actividad, no una variante: pide **cosechador** en vez de láser, la habilidad
de Extracción de hielo, y aparece en lunas y anillos helados y no en cinturones.

| Hielo             | Seguridad | m³/u | Deja (por unidad)                          |
| ----------------- | --------- | ---: | ------------------------------------------ |
| **Hielo sucio**   | Alta      |  5,0 | 50 agua pesada · 25 oxígeno                |
| **Hielo azul**    | Media     |  5,0 | 40 agua pesada · 20 nitrógeno · 10 helio-3 |
| **Hielo glaciar** | Baja      |  5,0 | 30 nitrógeno · 25 helio-3                  |
| **Hielo oscuro**  | Nula      |  5,0 | 50 helio-3 · 15 oxígeno                    |

**El helio-3 es el que importa**: es el combustible del salto. Hoy el combustible
se compra en la estación y eso es un huérfano declarado en `DESIGN.md`; el hielo es
su fuente, y con él la cadena del salto se cierra.

Notar el volumen: **cinco metros cúbicos por unidad**. El hielo es un problema de
logística antes que de extracción, y eso es lo que le da sentido a las barcazas.

### 7.4 · Gas

La tercera materia prima. Se aspira de nubes, que **no están en el mapa hasta que
alguien las escanea** — es la primera actividad que ata extracción con exploración.

| Gas           | Dónde                     | m³/u | Para qué                         |
| ------------- | ------------------------- | ---: | -------------------------------- |
| **Fulereno**  | Nubes de sistemas sin ley |  2,0 | Componentes de módulos avanzados |
| **Hidracina** | Nubes cerca de gigantes   |  2,0 | Bloques de combustible           |
| **Xenón**     | Nubes raras, sin ley      |  2,0 | Cargas y cristales               |

### 7.5 · Refinados

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
| **Helio-3**     |  0,1 | Hielo                 | **Combustible de salto**                      |
| **Agua pesada** |  0,1 | Hielo                 | Refrigerante y soporte vital                  |
| **Nitrógeno**   |  0,1 | Hielo                 | Propelente y bloques de combustible           |
| **Oxígeno**     |  0,1 | Hielo                 | Soporte vital                                 |

### 7.6 · Componentes

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

### 7.7 · Consumibles

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

---

## 8 · Los módulos

### 8.1 · Las tres coordenadas de un módulo

Un módulo se ubica con tres datos y ninguno sobra:

| Coordenada      | Qué decide                                                 |
| --------------- | ---------------------------------------------------------- |
| **Ranura**      | Dónde entra: anclaje, utilidad, interno esencial, opcional |
| **Clase** 1-8   | Si **cabe**. En una ranura de clase 4 entra un 4 o menor   |
| **Escalón** E→A | Cuánto rinde, cuánto cuesta y **qué habilidad pide**       |

El escalón es el eje de progresión y funciona así: **la E no pide nada** —es la que
vuela una nave de astillero, y ponerle requisito dejaría a un piloto nuevo con una
nave que no despega— y de ahí para arriba cada escalón pide más habilidad, más
cómputo y más potencia. Un escalón alto no es gratis: **rinde más pero aprieta el
presupuesto**, así que en una nave chica la E puede seguir siendo la elección
correcta.

| Escalón | Pide                                         | Rinde | Se fabrica con    |
| ------- | -------------------------------------------- | ----- | ----------------- |
| **E**   | Nada                                         | Base  | Refinados comunes |
| **D**   | La habilidad del módulo a 2                  | +15 % | + un componente   |
| **C**   | La habilidad del módulo a 3                  | +30 % | + dos componentes |
| **B**   | La habilidad del módulo a 4, Ajuste 3        | +45 % | + iridio          |
| **A**   | La habilidad del módulo a 5, Ing. avanzada 3 | +60 % | + núcleo cuántico |

Hoy están hechos los dos extremos, E y A, y **el piso y el techo quedan fijos** a
propósito: los escalones del medio se llenan sin mover los extremos ni renombrar
nada de lo que ya existe.

### 8.2 · Los internos esenciales

Siete, uno por ranura fija. **Se mejoran, no se quitan**: un casco no elige _si_
tiene planta de energía, elige cuál.

| Interno               | Qué aporta                  | Habilidad que lo gobierna | Se fabrica con               |
| --------------------- | --------------------------- | ------------------------- | ---------------------------- |
| **Planta de energía** | Potencia disponible         | Gestión de energía        | Célula de energía, titanio   |
| **Propulsores**       | Empuje → velocidad          | Ingeniería de propulsión  | Armazón compuesto, carbono   |
| **Motor de salto**    | Potencia de salto → alcance | Cálculo de saltos         | Tubo de contención, uranio   |
| **Distribuidor**      | Acumulador y recarga        | Acumulador                | Bobina de inducción, cobalto |
| **Sensores**          | Alcance de detección        | Sensores                  | Circuito impreso, platino    |
| **Soporte vital**     | Autonomía de la tripulación | Mecánica                  | Placa laminada, oxígeno      |
| **Tanque**            | Capacidad de combustible    | Eficiencia de combustible | Armazón compuesto, hierro    |

### 8.3 · Anclajes — lo que apunta hacia afuera

| Familia                 | Qué hace                          | Habilidad           | Clases | Se fabrica con               |
| ----------------------- | --------------------------------- | ------------------- | ------ | ---------------------------- |
| **Láser de extracción** | Saca mineral, ciclo corto         | Minería             | 1-3    | Lente focal, silicio         |
| **Láser de tira**       | Saca mucho más, **gasta cristal** | Láseres de tira     | 4-6    | Lente focal, tubo, titanio   |
| **Cosechador de hielo** | Corta hielo, ciclo largo          | Extracción de hielo | 3-5    | Tubo de contención, titanio  |
| **Aspirador de nube**   | Aspira gas                        | Extracción de gas   | 3-5    | Armazón, bobina, circuito    |
| **Cañón de masa**       | Daño cinético, **gasta carga**    | Cañones de masa     | 1-6    | Placa laminada, hierro       |
| **Emisor iónico**       | Daño iónico, drena acumulador     | Emisores iónicos    | 1-6    | Bobina de inducción, cobalto |
| **Lanza térmica**       | Daño térmico, alcance corto       | Lanzas térmicas     | 1-6    | Tubo de contención, xenón    |
| **Lanzador de drones**  | Suelta drones que trabajan solos  | Drones              | 2-5    | Armazón compuesto, circuito  |

**El láser de tira es la pieza que cambia el oficio**, y por eso sólo entra en
barcazas y exhumadoras: rinde varias veces lo que un láser común, pero gasta un
cristal específico del mineral al que apunta. Es lo que convierte a minar en una
cadena con abastecimiento propio en vez de un botón gratis.

### 8.4 · Utilidad — lo que va colgado afuera y no dispara

| Familia                      | Qué hace                                                | Habilidad                 | Clases | Se fabrica con         |
| ---------------------------- | ------------------------------------------------------- | ------------------------- | ------ | ---------------------- |
| **Escáner de superficie**    | Lee una roca: qué es y cuánto tiene                     | Prospección               | 1-3    | Circuito, lente        |
| **Lanzador de sondas**       | Escanea el sistema: encuentra lo que no está en el mapa | Sondas de exploración     | 2-4    | Circuito, armazón      |
| **Analizador de restos**     | Abre yacimientos y depósitos                            | Arqueología, Criptografía | 2-4    | Circuito, núcleo       |
| **Recolector**               | Levanta lo que quedó flotando                           | Recuperación de pecios    | 1-3    | Armazón, bobina        |
| **Amplificador de sensores** | Más alcance, más firma                                  | Sensores                  | 1-4    | Circuito, platino      |
| **Perturbador**              | Baja los sensores del otro                              | Perturbación de sensores  | 3-5    | Bobina, núcleo         |
| **Inhibidor de salto**       | Impide que el otro salte                                | Inhibición de salto       | 4-6    | Tubo, núcleo           |
| **Reparador de casco**       | Repara blindaje en vuelo                                | Reparación de casco       | 2-5    | Placa laminada, hierro |

### 8.5 · Opcionales — lo que define a qué se dedica

| Familia                   | Qué hace                             | Habilidad                 | Clases | Se fabrica con          |
| ------------------------- | ------------------------------------ | ------------------------- | ------ | ----------------------- |
| **Bodega auxiliar**       | Más carga, más masa                  | Ingeniería de bodega      | 1-6    | Armazón compuesto       |
| **Bodega de mineral**     | Carga **sólo mineral**, y compacta   | Estiba                    | 3-6    | Armazón, placa          |
| **Refuerzo de escudo**    | Más escudo                           | Escudos                   | 1-6    | Bobina, circuito        |
| **Placa de blindaje**     | Más blindaje, mucha más masa         | Blindaje                  | 1-6    | Placa laminada          |
| **Mamparo estructural**   | Más estructura                       | Mecánica                  | 1-6    | Placa laminada, titanio |
| **Tanque auxiliar**       | Más combustible                      | Eficiencia de combustible | 1-4    | Armazón, hierro         |
| **Refinería de a bordo**  | Refina en vuelo, con merma alta      | Refinado                  | 3-5    | Tubo, circuito, titanio |
| **Computadora de ajuste** | Más cómputo disponible               | Ajuste de módulos         | 2-5    | Circuito, platino       |
| **Amortiguador de firma** | Baja la firma: **no ser encontrado** | Perfil de firma           | 2-5    | Armazón, núcleo         |
| **Bodega de drones**      | Espacio de drones, **separado**      | Drones                    | 2-4    | Armazón, circuito       |
| **Taller de a bordo**     | Fabrica lejos de estación, lento     | Fabricación               | 4-6    | Armazón, tubo, circuito |

**La bodega de drones va aparte de la general**, y es una decisión de diseño y no
de esquema: si compartieran espacio, llevar drones sería siempre peor que llevar
mineral y nadie los llevaría nunca.

### 8.6 · Los refuerzos de casco, que todavía no existen

EVE tiene una cuarta clase de ranura: **refuerzos permanentes**, que se montan una
vez, no se sacan y **cobran una penalización** — más blindaje a cambio de
velocidad, más bodega a cambio de estructura.

Vale la pena tenerlos en el horizonte porque resuelven algo que hoy no tiene
solución: **cómo diferenciar dos naves del mismo casco con el mismo equipo**. Pero
no entran en esta etapa: piden una ranura nueva, una habilidad nueva y un escalón
de fabricación propio, y hay cosas más urgentes.

### 8.7 · Cuántos módulos salen de esto

Con once familias de anclaje y utilidad, once de opcionales, siete internos, cinco
escalones y las clases que cada familia admite, el catálogo llega **del orden de
doscientos cincuenta módulos** sin inventar ninguno a mano: cada uno es una
combinación de familia, clase y escalón, y sus números salen de una curva.

Eso es lo que hay que construir: **no un catálogo escrito a mano de doscientas
entradas, sino un generador de treinta familias**. La familia declara qué hace,
qué habilidad pide y con qué se fabrica; la clase y el escalón escalan los números
con una fórmula. Es la única forma de que agregar una familia nueva sea una tarde y
no una semana.

---

## 9 · Las cadenas, actividad por actividad

La prueba de fuego de todo lo anterior. Cada actividad tiene que poder llenar las
siete columnas; **la que tenga huecos no está lista para entrar**, y saber dónde
están los huecos es exactamente el propósito de este documento.

Leyenda: ✅ existe · 🔨 propuesto acá · ❌ hueco sin fecha.

### Minar mineral

| Eslabón    | Qué es                                   |                 |
| ---------- | ---------------------------------------- | --------------- |
| El verbo   | Extraer de una roca                      | ✅              |
| El insumo  | Nada, con láser común                    | ✅              |
| La fuente  | Cinturones, ocho minerales por seguridad | 🔨 (hay cuatro) |
| El aparato | Láser de extracción                      | ✅              |
| La llave   | Minería, Estiba, Prospección             | ✅              |
| La fábrica | Lente focal + silicio                    | 🔨              |
| El lugar   | El cinturón; la estación que compra      | ✅              |

**Es la única cadena casi cerrada.** Le falta la fábrica del láser y la mitad de
los minerales.

### Minar con láser de tira

| Eslabón    | Qué es                                       |     |
| ---------- | -------------------------------------------- | --- |
| El verbo   | Extraer en serie                             | 🔨  |
| El insumo  | **Cristal de extracción, que se gasta**      | 🔨  |
| La fuente  | El mismo cinturón, más rápido                | 🔨  |
| El aparato | Láser de tira, sólo en barcaza               | 🔨  |
| La llave   | Láseres de tira, Cristales, Barcazas mineras | 🔨  |
| La fábrica | Cristalografía, en taller de estación        | 🔨  |
| El lugar   | Cinturón + taller que fabrique cristales     | 🔨  |

Todo propuesto, y **cierra sola**: es la cadena más completa de las nuevas, y por
eso es la mejor candidata a ser la primera que se construya entera.

### Refinar

| Eslabón    | Qué es                        |                         |
| ---------- | ----------------------------- | ----------------------- |
| El verbo   | Convertir mineral en material | ❌                      |
| El insumo  | El mineral, que se consume    | ✅                      |
| La fuente  | La minería                    | ✅                      |
| El aparato | La refinería de la estación   | ✅ (el servicio existe) |
| La llave   | Refinado, Tasación de mena    | ✅ / 🔨                 |
| La fábrica | No aplica                     | —                       |
| El lugar   | Estación con refinería        | ✅                      |

**El verbo no existe**: el servicio de refinería está sembrado en las estaciones y
no hace nada. Es el hueco más barato de cerrar de todos los que hay.

### Saltar a otro sistema

| Eslabón    | Qué es                                 |     |
| ---------- | -------------------------------------- | --- |
| El verbo   | Cruzar una puerta                      | ✅  |
| El insumo  | **Combustible**, que se consume        | ✅  |
| La fuente  | **Hielo → helio-3**                    | ❌  |
| El aparato | Motor de salto y tanque                | ✅  |
| La llave   | Astrogación, Eficiencia de combustible | ✅  |
| La fábrica | Tubo de contención + uranio            | 🔨  |
| El lugar   | La puerta; la estación que reabastece  | ✅  |

El huérfano declarado en `DESIGN.md`: **el combustible se compra y no sale de
ningún lado.** La cadena del hielo lo cierra.

### Fabricar un módulo

| Eslabón    | Qué es                                          |                         |
| ---------- | ----------------------------------------------- | ----------------------- |
| El verbo   | Fabricar                                        | ❌                      |
| El insumo  | Componentes y refinados                         | 🔨                      |
| La fuente  | Refinado y fabricación de componentes           | 🔨                      |
| El aparato | El taller de la estación                        | ✅ (el servicio existe) |
| La llave   | Fabricación, Componentes, Ingeniería de módulos | 🔨                      |
| La fábrica | No aplica: es la fábrica                        | —                       |
| El lugar   | Estación con taller                             | ✅                      |

### Escanear y explorar

| Eslabón    | Qué es                                           |                 |
| ---------- | ------------------------------------------------ | --------------- |
| El verbo   | Escanear un sistema, un cuerpo o a alguien       | ❌ (sólo rocas) |
| El insumo  | **Sondas**, que se gastan                        | 🔨              |
| La fuente  | Circuito impreso + silicio                       | 🔨              |
| El aparato | Lanzador de sondas, amplificador                 | 🔨              |
| La llave   | Escaneo, Sondas, Astrometría, Análisis de firmas | 🔨              |
| La fábrica | Taller                                           | 🔨              |
| El lugar   | Cualquier sistema; lo que se encuentra está ahí  | 🔨              |

**Y su reverso, que es la misma cadena:** el amortiguador de firma y Perfil de
firma son el aparato y la llave de _no ser encontrado_. Diseñarlos juntos es lo que
evita terminar con dos sistemas parecidos que no se hablan.

### Comerciar

| Eslabón    | Qué es                           |         |
| ---------- | -------------------------------- | ------- |
| El verbo   | Comprar y vender                 | ✅      |
| El insumo  | Créditos                         | ✅      |
| La fuente  | Todo lo demás                    | ✅      |
| El aparato | Ninguno                          | —       |
| La llave   | Regateo, Contabilidad, Corretaje | ✅ / 🔨 |
| La fábrica | No aplica                        | —       |
| El lugar   | Estación con mercado             | ✅      |

### Combatir

Sin verbo. **Toda la familia de Combate es hoy un conjunto de llaves sin puerta**,
y la propuesta de la sección 5.6 no cambia eso: entra cuando entre el combate.

---

## 10 · Cómo se construye esto sin parar el juego

Diez etapas, en orden de dependencia y no de entusiasmo. Cada una deja algo
jugable y cada una cierra huérfanos concretos.

| #     | Etapa                       | Qué entra                                                                 | Qué cierra                                  |
| ----- | --------------------------- | ------------------------------------------------------------------------- | ------------------------------------------- |
| **A** | **La curva**                | `LEVEL_COSTS`, `MAX_DIFFICULTY` a 16, devolver lo invertido a los pozos   | Que el catálogo se termine en un año        |
| **B** | **Las siete familias**      | Familia Industria; habilidades movidas de familia; rangos nuevos          | Que fabricar financie su oficio con minería |
| **C** | **Las clases de nave**      | `Hull.class`, bono opcional, **la Pioner sin bono**, habilidades de clase | Que volar una nave no pida nada             |
| **D** | **Refinar**                 | El verbo, los ocho refinados, la merma                                    | El servicio de refinería que no hace nada   |
| **E** | **Componentes y fabricar**  | El verbo, los ocho componentes, recetas por módulo                        | 47 módulos que no se fabrican               |
| **F** | **El generador de módulos** | Familias + fórmula de clase y escalón; escalones D, C, B                  | Un catálogo escrito a mano que no escala    |
| **G** | **El hielo**                | Cosechador, cuatro hielos, helio-3                                        | **El combustible sin fuente**               |
| **H** | **Barcazas y cristales**    | Clase barcaza, láser de tira, cristales, bodega de mineral                | Que minar sea un botón sin abastecimiento   |
| **I** | **Escanear**                | Sondas, firmas, encontrar y esconderse                                    | Sensores y firma, que sólo se dibujan       |
| **J** | **El gas**                  | Aspirador, tres gases, nubes que hay que escanear                         | Nada: es contenido sobre H e I              |

Tres notas de orden que importan más que la lista:

- **A y B van primero y juntos.** Son las dos que invalidan trabajo si llegan
  después: cada habilidad que se agregue con la curva vieja hay que rebalancearla,
  y cada una que se ponga en la familia equivocada hay que migrarla.
- **D antes que E, y E antes que F.** Fabricar sin refinar no tiene insumo, y
  generar módulos sin saber con qué se fabrican es generar la mitad de cada uno.
- **G cierra el huérfano más viejo del juego.** Si hay que elegir una sola de las
  diez para hacer después de C, es ésa.

---

## 11 · Lo que este documento no decide

Preguntas abiertas que hay que contestar antes de construir lo que depende de
ellas. No están acá por olvido: están porque la respuesta cambia el diseño y no
sólo los números.

1. **¿Se pierde la nave?** Todo el balance de escalones y de fabricación depende de
   si un módulo A es una compra para siempre o algo que se repone. Sin economía de
   pérdida, la industria se satura en un año.
2. **¿El mineral se agota por sistema o por cinturón?** Decide si vale la pena que
   una corporación se instale en un lugar.
3. **¿Cuántas acciones simultáneas?** Con una sola, las cadenas largas se sienten
   como una fila de espera. Con varias, el pozo por familia se llena mucho más
   rápido y la curva de la sección 4 necesita otro número.
4. **¿La fabricación tarda tiempo real?** Si sí, es otra acción con temporizador y
   compite con minar. Si no, es un botón y el técnico no tiene qué hacer mientras.
5. **¿Los planos son objeto?** Comerciables abren una economía entera; fijos por
   habilidad son mucho más simples y quitan una capa de juego.
6. **¿Cuánto rinde el escalón A sobre el E?** Acá se propuso +60 %. Si es mucho, el
   equipo decide más que el piloto; si es poco, subir de escalón no es una meta.
7. **¿Las variantes de calidad del mineral son ítems distintos o un atributo?**
   Ítems distintos es más simple de mercado y multiplica el catálogo por cuatro.

---

## 12 · Resumen para quien no leyó todo

- **La curva de habilidades se empina** de ×3 a ×5,66 y los rangos llegan a x16.
  Es un cambio de dos constantes y es el más importante del documento.
- **Siete familias**, no seis: Industria se separa.
- **Ciento diez habilidades** propuestas, cada una moviendo un número.
- **Doce clases de nave**, cada una con su habilidad, y **veinte cascos**.
- **La Pioner no tiene bono, y es una regla.**
- **Tres materias primas** —mineral, hielo y gas—, ocho minerales por banda de
  seguridad, doce refinados y ocho componentes.
- **Un escalón de componentes** entre el material y el módulo.
- **Módulos generados por familia, clase y escalón**, no escritos a mano.
- **Buscar y esconderse son un solo sistema**: sensores contra firma.
- **El hielo cierra el huérfano del combustible**, que es el más viejo que hay.

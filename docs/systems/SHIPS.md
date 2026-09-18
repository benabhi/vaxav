# Naves, módulos y equipamiento

> **Implementado**: el catálogo de cascos y módulos, la calculadora, la pantalla
> de equipamiento y el **hangar** —cada piloto tiene su nave guardada y viaja con
> ella—. Falta poder tener **más de una**, comprarlas, y todo lo que depende del
> **combate**, que todavía no existe.
>
> Ver también: [habilidades](SKILLS.md) · [acciones](ACTIONS.md) ·
> [universo](UNIVERSE.md) · [interfaz](INTERFACE.md)

La nave es la herramienta y el límite del piloto. Tiene una activa por vez, y lo
que puede hacer depende tanto de ella como de lo que sabe.

## El filtro: qué atributo se gana el lugar

Un atributo entra si **cambia una decisión antes de dar una orden**. Muchos
atributos de un juego 3D existen porque se sienten volando —maniobrabilidad,
cabeceo, convergencia de armas, calor—; acá se lee un número, se da una orden y
se vuelve en dos horas. Ésos no entran.

Y la regla que ordena todo lo demás: **la moneda de Vaxav es el tiempo**. Los
atributos que más valen son los que se convierten en tiempo —masa, velocidad,
bodega, ciclos sostenidos—, porque el tiempo es lo que el jugador está gastando.
Los que no se convierten en tiempo, en riesgo o en plata, son decoración.

## Los cuatro presupuestos

Cuatro preguntas distintas en cuatro momentos distintos. Es lo que EVE hace bien y
conviene robar entero:

| Presupuesto                     | La pregunta                     | Sale de  |
| ------------------------------- | ------------------------------- | -------- |
| **Ranura** (clase 1-8)          | ¿Entra físicamente?             | El casco |
| **Grilla** (MW) · **CPU** (u)   | ¿La nave lo sostiene instalado? | El casco |
| **Capacitor** (carga + recarga) | ¿Lo puedo mantener encendido?   | El casco |
| **Calibración**                 | ¿Me alcanza para otro refuerzo? | El casco |

Los nombres son **los de EVE**, a propósito: grilla de poder, CPU, capacitor y
calibración. El público que más rápido va a entender esta pantalla es el que ya
jugó EVE, y hacerlo tropezar con sinónimos no lo hace más nuestro — lo hace más
lento. Lo nuestro son las bandejas.

**Los cuatro salen del casco, y eso es nuevo.** Antes la potencia venía de la
planta y el acumulador del distribuidor, que eran módulos: el presupuesto se podía
comprar. Ahora es fijo por casco y sólo se estira con habilidades, que es lo que
convierte al equipamiento en un rompecabezas en vez de una lista de compras.

**Dos ejes de montaje y no uno.** Potencia castiga lo grande y lo bruto; Cómputo
castiga lo electrónico —escáneres, generador de escudo, refinería—. Una bodega
enorme casi no gasta cómputo; un escudo bueno se lo come. Con un solo presupuesto,
siempre gana el módulo más grande que entre en la ranura, y armar una nave deja de
ser un rompecabezas.

**Y ahí está el micro-juego que hace buena a esta parte de EVE:** los dos
presupuestos están apretados a propósito, así que **un cinco por ciento más de
potencia —que suena a nada— es lo que hace que el módulo mejor quepa**. Equipar
deja de ser elegir lo más caro y pasa a tener tres salidas: bajar un escalón en
otra ranura, dejar una vacía, o entrenar dos niveles más y volver.

### La calibración es la que no se deshace

Los tres primeros presupuestos se recuperan desmontando. **La calibración no**: un
refuerzo sacado se destruye, así que gastarla es definitivo. Es el único
presupuesto que obliga a decidir antes y no después.

Un refuerzo grande se come casi toda; tres chicos entran justos.

### El capacitor, reinterpretado

En EVE el capacitor es un juego de manejo en vivo: apagás cosas, esperás, tirás
una batería. Eso acá no existe.

En Vaxav se resuelve en **una cuenta al dar la orden**: recarga por segundo
contra consumo por ciclo. Si la recarga cubre el consumo, la acción se sostiene;
si no, **el rendimiento cae en proporción a lo que la recarga alcanza a pagar**.
Mismo dilema —capacidad contra consumo—, sin pedirle a nadie que mire la
pantalla.

Es lo que convierte al capacitor en una decisión real: dos láseres grandes en un
casco de acumulador modesto rinden al 80 %, y lo que se hace con eso es montar una
batería en una consola —pagando la consola— o llevar un láser más chico. Ninguna
de las dos es gratis, que es el punto.

## Los atributos

### Identidad

| Atributo                     | Qué decide                                              |
| ---------------------------- | ------------------------------------------------------- |
| **Rol**                      | El bono de casco, que **escala con una habilidad**      |
| **Tamaño de amarre** (S/M/L) | A qué estaciones podés entrar. Hace que el mapa importe |

### Supervivencia: tres capas

| Capa         | Carácter                                                                 |
| ------------ | ------------------------------------------------------------------------ |
| **Escudo**   | Sólo existe si montás generador. Se recarga solo                         |
| **Blindaje** | Viene con el casco. **No se recupera solo**: se repara en estación. Pesa |
| **Casco**    | La última. En cero, se pierde la nave                                    |

### Movimiento: los que se vuelven tiempo

| Atributo                 | Qué decide                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Masa** (t)             | Casco + módulos + carga. **Divide la velocidad y el alcance**, así que toda decisión de equipamiento cuesta tiempo |
| **Velocidad de crucero** | Cuánto tarda ir de un cuerpo a otro. Sale del empuje ÷ masa                                                        |
| **Alcance de salto**     | Cuán lejos llega un salto. Sale de la potencia de salto ÷ masa                                                     |
| **Combustible**          | Cuántos saltos antes de repostar                                                                                   |

Que velocidad y alcance salgan los dos de dividir por la masa no es casualidad:
es lo que hace que un módulo que sólo pesa —una placa de blindaje, que no
consume nada— igual te cueste algo.

_Cuántos_ saltos podés dar **no es un atributo**: es combustible sobre consumo, y
el consumo es proporcional a la masa. Se calcula.

**Y el atributo es el tanque, no lo que hay adentro.** «Combustible» en la ficha
del casco es _cuánto entra_; lo que la nave lleva encima se guarda en la nave y se
gasta al saltar. Son dos números distintos y la pantalla los muestra juntos
—`113 / 120`— porque el que importa es la resta.

De ahí sale una regla chica que no es obvia: **lo que hay se acota a lo que
entra** cada vez que se lee. Desmontar un tanque deja la nave con más combustible
del que ahora le cabe, y mostrar `140 / 120` es mostrar un error.

El combustible **sólo se gasta saltando**. Moverse dentro de un sistema es
gratis, a propósito: una nave varada entre dos planetas sin con qué encender el
motor es una partida rota, y el costo de evitarlo —rescates, remolques, un botón
de auxilio— no compra nada que el juego necesite.

### Capacidad e información

| Atributo                | Qué decide                                                           |
| ----------------------- | -------------------------------------------------------------------- |
| **Bodega** (m³)         | Cuántos viajes hacen falta. En un juego idle, eso **es** el tiempo   |
| **Alcance de sensores** | Qué ves del sistema sin moverte; le da sentido a explorar            |
| **Firma**               | Cuán fácil te encuentran. La decisión del carguero: lleno o discreto |

### Lo que queda afuera, y por qué

- **Tripulación**: sería un buen sumidero de plata —sueldos por día—, y los
  sumideros importan en una economía de jugadores. Ahora que los créditos existen
  se puede discutir; sigue afuera hasta que haya algo más en qué gastarlos.
- **Calor**: en Elite es divertido porque se maneja en vivo. Acá sería un segundo
  acumulador con otro nombre.
- **Maniobrabilidad, cabeceo, convergencia**: no hay vuelo.

## Las bandejas

Cuatro, y cada una contesta una pregunta distinta sobre qué hace ese módulo:

| Bandeja       | Qué va                                             | La regla                          |
| ------------- | -------------------------------------------------- | --------------------------------- |
| **Altos**     | Armas, láseres de extracción, rayos                | **Actúa sobre otra cosa**         |
| **Medios**    | Escudos, propulsores, sensores, guerra electrónica | **Se enciende y gasta capacitor** |
| **Bajos**     | Blindaje, bodega, relés de energía, calibradores   | **Está puesto y ya**              |
| **Refuerzos** | Lo que se suelda al casco y no se saca             | **No se desmonta: se destruye**   |

En el código son `high`, `mid`, `low` y `rig`. **Son los nombres de EVE**, por lo
mismo que la grilla y la CPU: el que más rápido va a entender esta pantalla es el
que ya jugó ese juego, y hacerlo tropezar con sinónimos no lo hace más nuestro,
lo hace más lento.

La regla de la derecha es la que evita que se discuta nunca dónde va un módulo
nuevo. Si actúa sobre otra cosa va arriba; si tiene interruptor, al medio; si está
puesto y no hace nada por sí solo, abajo.

**El costo de estos nombres es que dejan de enseñar.** «Consola» decía sola qué
iba adentro; «Medios» no dice nada. Por eso cada bandeja lleva media línea al lado
del rótulo —_armas y herramientas · lo que se enciende · lo que va atornillado ·
no se desmontan_—: se lee una vez y después es ruido de fondo, que es exactamente
lo que tiene que ser. Vive en `slotKindHint`.

**El reparto es la personalidad del casco.** Se escribe como una terna, siempre en
ese orden, y es lo primero que se lee de una nave:

```
PERCAL · Minera
2 · 4 · 3
```

Dos anclajes para dos láseres, cuatro consolas para todo lo que hay que encender
mientras se trabaja, tres de bastidor para bodega y chapa. La Mula, que es
`1 · 3 · 5`, se equipa de una manera que no se parece en nada.

### Los internos esenciales se fueron, y era el problema

Antes había una quinta bandeja: siete **internos esenciales** —planta,
propulsores, motor de salto, distribuidor, sensores, soporte vital y tanque— que
todo casco tenía que llevar. No eran una decisión: eran una lista de compras.

Los números de entonces lo dicen solos:

| Casco    | Ranuras | Forzadas | Suyas |
| -------- | ------: | -------: | ----: |
| Pioner   |      11 |        7 | **4** |
| Mula     |      15 |        7 |     8 |
| Alabarda |      16 |        7 |     9 |

Y **veinticuatro de los cuarenta y nueve módulos del catálogo existían sólo para
llenar esas siete ranuras**. La mitad del catálogo no era una elección.

Ahora los siete son **atributos del casco**. Una nave _tiene_ planta de energía,
igual que tiene masa; no se elige tenerla:

| Interno        | Dónde vive ahora                                 |
| -------------- | ------------------------------------------------ |
| Planta         | `power` del casco — **ya era el presupuesto**    |
| Sensores       | `sensorRange` del casco — **ya era un atributo** |
| Tanque         | `fuel` del casco — **ya era un atributo**        |
| Distribuidor   | `capacitor` y su recarga, del casco              |
| Propulsores    | La velocidad base del casco                      |
| Motor de salto | `jumpRange` del casco                            |
| Soporte vital  | **Se fue.** No gobernaba nada                    |

Cuatro de los siete ya eran atributos del casco _además_ de módulos: se estaba
cobrando dos veces por lo mismo.

Y lo que esos módulos daban de más —más potencia, más empuje, más alcance de
salto— **vuelve como módulo opcional que cuesta una ranura**. Querés más empuje:
montás un propulsor en una consola y perdés la consola. Ésa sí es una decisión, y
es toda la diferencia entre mejorar y comprar.

### La clase: si entra

De 1 a 8. En una ranura de clase 4 entra un módulo de clase 4 o menor, nunca uno
mayor. **Es lo único que decide si entra**, y por eso no va en el nombre del
módulo sino como insignia al lado.

### El escalón: I y II

La **puerta de habilidad**. El **I** no pide nada y es con el que sale una nave del
astillero; el **II** rinde más, cuesta más, pide habilidades entrenadas y aprieta
más la potencia y el cómputo.

| Escalón          | Requisito                     |
| ---------------- | ----------------------------- |
| **I**            | Nada, en ninguna clase        |
| **II** clase 1-2 | Su habilidad al **nivel II**  |
| **II** clase 3   | Su habilidad al **nivel III** |

Que el I no pida nada **nunca** no es generosidad: un requisito ahí dejaría a un
piloto nuevo con una nave que no despega.

Corre **hacia adelante** y queda lugar para un III. Antes era una letra de la E a
la A que corría **para atrás** —la A era el tope— y había que aprenderse que la
escalera iba al revés; ésa era la mitad de por qué no se entendía. La otra mitad
era que mezclaba dos cosas en una letra: el escalón tecnológico y el compromiso de
diseño, que ahora van separados.

Cuál es «su habilidad» sale del sistema: los propulsores piden **Navegación**, los
calibradores de salto **Astrogación**, los amplificadores de sensores **Escaneo** y
el láser de extracción **Minería**.

> **Sólo se gatea con habilidades que se puedan entrenar.** La experiencia se
> deposita por rama, así que una rama sin ninguna acción que la pague es una rama
> que nadie puede subir, y pedirla sería cerrar la puerta con la llave adentro. La
> lista vive en `game/actions.ts` y un test la vigila.

**Dónde se hacen cumplir: en dos lugares y sólo dos.** La hoja de rendimiento
empuja lo que falta a la lista de problemas —y como volar es no tener ninguno y
todas las acciones lo consultan, los requisitos deciden de una vez si se puede
viajar, minar o escanear—, y la lista de una ranura no ofrece lo que el piloto no
sabe usar. El módulo sigue siendo suyo y se puede vender; lo que no se puede es
montarlo.

### El compromiso va en el adjetivo

Dentro de un mismo escalón y una misma clase puede haber varias versiones, y lo
que las distingue es **qué recurso ahorra cada una**. Se nombran con un
vocabulario cerrado que se repite en todas las familias, así que se entiende sin
abrir la ficha y escala a cientos de módulos sin inventar cientos de nombres:

| Adjetivo        | Qué sacrifica y qué gana                              |
| --------------- | ----------------------------------------------------- |
| **Compacto**    | Rinde algo menos, pide mucho menos cómputo y potencia |
| **Sobrio**      | Rinde menos, consume mucho menos acumulador           |
| **Persistente** | Ciclo más largo, drenaje mucho menor                  |
| **Amplio**      | Más capacidad, ciclo más lento                        |
| **Focalizado**  | Más alcance, menos potencia bruta                     |

Es lo que hace que **no haya una configuración óptima, sino una para cada
oficio**: un módulo que parece peor por sus números es la elección correcta en la
nave donde el que parece mejor directamente no entra.

Así queda un nombre completo:

```
Láser de extracción II                 clase 2
Extensor de escudo compacto I          clase 1
Placa de blindaje II                   clase 3
Amplificador de sensores focalizado I  clase 1
```

## Los refuerzos

Se sueldan al casco. **Sacar uno lo destruye**, y ahí está toda la gracia: es la
única decisión de equipamiento que no se puede deshacer.

Cada refuerzo **mejora algo cobrándote otra cosa**. Eso es lo que impide que sean
simplemente más módulos:

| Refuerzo       | Mejora                     | Cobra             |
| -------------- | -------------------------- | ----------------- |
| **Blindaje**   | Blindaje y resistencias    | Velocidad         |
| **Escudo**     | Escudo y recarga           | Acumulador        |
| **Estiba**     | Bodega                     | Blindaje          |
| **Propulsión** | Velocidad                  | Blindaje          |
| **Extracción** | Rendimiento del láser      | Cómputo           |
| **Sensores**   | Alcance y tiempo de fijado | Acumulador        |
| **Energía**    | Potencia disponible        | Firma: te ven más |

**Tres ranuras en todos los cascos, salvo la Pioner, que tiene una.** La forma del
casco ya la dice la terna; los refuerzos son profundidad, no otra dimensión que
balancear.

### La habilidad no los hace más fuertes: hace el castigo más chico

Es el tipo de progresión que el juego no tenía. Todas las demás habilidades
empujan un número hacia arriba; ésta **abre configuraciones que antes no
cerraban**:

> _Refuerzos de blindaje V_ no da más blindaje: devuelve la mitad de la velocidad
> que el refuerzo estaba cobrando.

Una habilidad por familia de refuerzo, en Ingeniería, y cada una es la llave de un
estilo de equipamiento entero. El árbol crece solo cuando crece el catálogo.

Una tentación descartada: **una habilidad que suba la calibración**. Multiplicaría
todos los refuerzos a la vez y desarmaría el presupuesto, que es justo lo que hace
que la elección duela.

### De dónde salen

```
combate  →  restos  →  recuperar  →  componentes  →  refuerzos
```

Los refuerzos son **lo que hace que valga la pena recuperar restos**, y sin ellos
el recuperador es un oficio anunciado sin producto. Son además el único consumible
caro que el juego va a tener: un módulo se rescata de un pecio, un refuerzo no
—**cada vez que se pierde la nave se pierden los refuerzos**—.

## Los tres tipos de daño

**Cinético** (balas, metralla, misiles), **Iónico** (atraviesa campos) y
**Térmico** (pega en todo, un poco menos).

Tres y no cuatro: en un navegador, el cuarto tipo es el que nadie termina de
entender. Y tres y no uno: con un solo tipo, el equipamiento queda en un único
eje —más tanque o más daño— y elegir arma deja de ser una decisión.

### Las resistencias no son un atributo de la nave

Salen de **qué es cada capa**. Un escudo es un campo, así que lo atraviesa lo
iónico y le rebota lo cinético; el blindaje es materia y le pasa al revés; el
casco desnudo no frena nada. Son nueve números, una sola vez, en las reglas:

|              | Cinético | Iónico | Térmico |
| ------------ | -------- | ------ | ------- |
| **Escudo**   | 50 %     | 0 %    | 25 %    |
| **Blindaje** | 10 %     | 50 %   | 25 %    |
| **Casco**    | 0 %      | 0 %    | 0 %     |

Con eso alcanza para calcular **puntos efectivos por tipo de daño**, que es el
número que un piloto mira antes de salir: no "cuánto escudo tengo" sino "por
dónde me van a romper".

**No es un atajo que haya que rehacer.** Las resistencias por casco y por módulo
—módulos de resistencia, perfiles por nave— son un modificador _encima_ de esta
tabla, y llegan **con el combate**. Una nave sin ellos se comporta
exactamente como hoy, así que no hay migración pendiente.

### La regla de balance del híbrido

El térmico pega menos pero nunca lo resisten bien, así que corre el riesgo de ser
siempre la respuesta correcta. La regla que lo evita:

> **El híbrido gana cuando no sabés a qué te enfrentás, y pierde cuando sí.**

Eso convierte al **alcance de sensores** en su contrapeso —saber contra qué vas
es lo que habilita traer el arma especializada— y le da trabajo a un atributo que
si no quedaría de adorno.

### Los cascos también piden

Un casco declara **una lista** de requisitos y no uno solo: la nave de guerra que
exige puntería y blindaje no es una rareza, es lo normal en cuanto el catálogo
crece.

| Casco    | Pide                    |
| -------- | ----------------------- |
| Pioner   | **Nada**                |
| Mula     | Ingeniería de bodega II |
| Percal   | Minería II              |
| Vencejo  | Escaneo II              |
| Alabarda | Puntería II             |

**La Pioner no pide nada por la misma razón que el escalón E**: es el casco que el
astillero le entrega a cualquiera que se dé de alta. Manejo de lanzaderas, que era
su requisito, pasó a ser su **bono de rol** —donde antes estaba Navegación, que ya
empuja la velocidad de toda nave desde el bono general y se estaba contando dos
veces—.

Los otros cuatro piden habilidades de ramas que todavía no tienen fuente, y eso
está bien hoy por una razón temporal: **no hay astillero**, así que el único casco
que alguien puede tener es el de partida. El día que se puedan comprar, o su rama
tiene fuente o el requisito cambia; un test lo recuerda.

## Los cinco cascos

| Casco        | Rol               |   Terna | Refuerzos | Bono de rol                         |
| ------------ | ----------------- | ------: | --------: | ----------------------------------- |
| **Pioner**   | Lanzadera inicial | `1·2·2` |         1 | Velocidad, por Manejo de lanzaderas |
| **Mula**     | Carguera          | `1·3·5` |         3 | Bodega, por Ingeniería de bodega    |
| **Percal**   | Minera            | `2·4·3` |         3 | Extracción, por Minería             |
| **Vencejo**  | Exploradora       | `1·5·2` |         3 | Sensores, por Escaneo               |
| **Alabarda** | Combate           | `4·3·4` |         3 | Daño, por Puntería                  |

**La terna es lo primero que se lee de una nave.** La Mula lleva casi todo en el
bastidor —bodega y chapa, que son pasivos— y el Vencejo casi todo en consolas
—sensores y electrónica, que se encienden—. Son dos naves que no se parecen en
nada al equiparlas, y eso se ve antes de abrir la ficha.

Cada uno es bueno en **una cosa distinta**: dos cascos con el mismo bono serían el
mismo casco con otro nombre, y hay una prueba que lo impide.

> En el MVP, las de exploración y combate se pueden armar pero su ventaja queda
> latente: todavía no existen esas actividades.

## Las clases de nave

> **Nada de esto está implementado**: hoy existen cinco cascos sueltos, sin clase
> y sin requisito de clase. Es el plano de hacia dónde crece el hangar.

### La clase es la unidad, no el casco

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
| **Capital**           | Naves capitales      | Grande | **Una nave que es un lugar.** Ver más abajo      |

### La regla del bono de rol

**Cada casco tiene exactamente un bono, y escala con una habilidad.** Nunca un
valor fijo. Es lo que impide que la nave reemplace al piloto: una barcaza en manos
sin entrenar es una nave con bodega y nada más.

Y una excepción que es una regla:

> **La Pioner no tiene bono.** Es el casco que el astillero le entrega a cualquiera
> que se dé de alta. Si tuviera bono, el primer casco del juego ya estaría
> empujando al piloto hacia una especialidad antes de que la elija. Todo lo que
> rinda de más tiene que venir de lo que le monte y de lo que sepa.

### El catálogo de cascos

Veinte, y ninguno bueno en todo. Los marcados con **(hoy)** ya existen; el resto
son propuestas. Los números concretos —masa, bodega, ranuras— se fijan al
implementar cada uno; lo que decide acá es **el rol y el bono**.

### Lanzadera

| Casco            | Rol             | Bono de rol              | Pide |
| ---------------- | --------------- | ------------------------ | ---- |
| **Pioner (hoy)** | La nave de alta | **Ninguno, a propósito** | —    |

### Corbeta — la primera especialización

| Casco             | Rol           | Bono de rol                                     | Pide                        |
| ----------------- | ------------- | ----------------------------------------------- | --------------------------- |
| **Vencejo (hoy)** | Exploradora   | +8 % alcance de sensores por nivel de Escaneo   | Naves ligeras 1, Escaneo 2  |
| **Barreno**       | Minera ligera | +10 % rendimiento de láser por nivel de Minería | Naves ligeras 1, Minería 2  |
| **Estilete**      | Escolta       | +5 % daño por nivel de Puntería                 | Naves ligeras 2, Puntería 2 |
| **Saeta**         | Correo        | +10 % velocidad por nivel de Maniobra           | Naves ligeras 2, Maniobra 2 |

El **Barreno** es la nave importante de esta clase: es el primer casco con bodega
de mineral separada de la bodega general, que es lo que convierte a la minería en
un oficio con logística propia.

### Destructor — muchos anclajes, casco barato

| Casco              | Rol          | Bono de rol                                                   | Pide                           |
| ------------------ | ------------ | ------------------------------------------------------------- | ------------------------------ |
| **Alabarda (hoy)** | Combate      | +5 % daño por nivel de Cadencia                               | Destructores 1, Puntería 3     |
| **Rapiña**         | Recuperación | +10 % de lo que se saca de un pecio por nivel de Recuperación | Destructores 2, Recuperación 2 |

### Industrial — mover carga

| Casco          | Rol                 | Bono de rol                                   | Pide                                    |
| -------------- | ------------------- | --------------------------------------------- | --------------------------------------- |
| **Mula (hoy)** | Carguera            | +5 % bodega por nivel de Ingeniería de bodega | Naves industriales 1, Ing. de bodega 2  |
| **Ónice**      | Transporte discreto | −8 % firma por nivel de Perfil de firma       | Naves industriales 2, Perfil de firma 2 |

### Barcaza minera — el salto de oficio

La clase que cambia la minería de actividad a profesión: **es la que puede montar
láseres de tira**, que piden cristales, que se fabrican y se gastan.

| Casco            | Rol                | Bono de rol                                                    | Pide                                      |
| ---------------- | ------------------ | -------------------------------------------------------------- | ----------------------------------------- |
| **Percal (hoy)** | Barcaza de mineral | +5 % rendimiento de láser de tira por nivel de Láseres de tira | Barcazas mineras 1, Láseres de tira 1     |
| **Glaciar**      | Barcaza de hielo   | −5 % ciclo del cosechador por nivel de Extracción de hielo     | Barcazas mineras 2, Extracción de hielo 3 |
| **Sifón**        | Barcaza de gas     | +8 % rendimiento del aspirador por nivel de Extracción de gas  | Barcazas mineras 2, Extracción de gas 3   |

### Crucero — el casco polivalente

| Casco       | Rol                | Bono de rol                                               | Pide                              |
| ----------- | ------------------ | --------------------------------------------------------- | --------------------------------- |
| **Espolón** | Combate            | +5 % daño por nivel de Artillería pesada                  | Cruceros 1, Cadencia 3            |
| **Fragua**  | Apoyo              | +10 % reparación a otros por nivel de Tácticas de escolta | Cruceros 2, Tácticas de escolta 2 |
| **Quimera** | Guerra electrónica | +10 % efecto de perturbación por nivel de G. electrónica  | Cruceros 2, Guerra electrónica 3  |

### Las clases especializadas

| Casco        | Clase             | Rol                     | Bono de rol                                                | Pide                                     |
| ------------ | ----------------- | ----------------------- | ---------------------------------------------------------- | ---------------------------------------- |
| **Corsario** | Transporte rápido | Pasar donde no conviene | −10 % firma por nivel de Transportes rápidos               | Transportes rápidos 1, Perfil de firma 3 |
| **Espectro** | Reconocimiento    | Ver sin ser visto       | +10 % fuerza de escaneo por nivel de Astrometría           | Naves de recon. 1, Astrometría 3         |
| **Cíclope**  | Exhumadora        | La punta de la minería  | +8 % rendimiento de láser de tira por nivel de Exhumadoras | Exhumadoras 1, Láseres de tira 4         |
| **Coloso**   | Carguero          | Volumen y nada más      | +5 % bodega por nivel de Cargueros                         | Cargueros 1, Ing. de bodega 4            |
| **Tizona**   | Acorazado         | Aguantar y pegar        | +5 % resistencias por nivel de Acorazados                  | Acorazados 1, Compensación de blindaje 3 |

### Cómo se nombra una nave

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

### Las capitales: una nave que es un lugar

La idea que cambia de qué son las capitales, y conviene anotarla antes de que se
pierda:

> **Una capital desplegada aparece en el árbol del sistema, como una estación
> más, y los demás pilotos pueden atracar en ella e interactuar.**

No es una nave grande: es **la primera pieza de infraestructura que un jugador
planta en el mapa**. Deja de ser algo que uno vuela y pasa a ser un lugar al que
los otros van, que es una diferencia de naturaleza y no de tamaño.

### Por qué esto es más importante de lo que parece

Cierra tres huecos de una sola vez, y ninguno se resuelve solo:

1. **Le da sentido al espacio sin ley.** Hoy, salir del centro es todo riesgo y
   ninguna permanencia: se va, se saca mineral y se vuelve. Con capitales, una
   corporación puede **quedarse**, y quedarse es lo que convierte a un sistema en
   territorio de alguien.
2. **Le da meta a la industria.** El escalón de componentes de la sección 7.6
   termina hoy en un módulo. Con capitales, termina en algo que se ve en el mapa y
   que le sirve a otros, que es la única recompensa que un industrial valora de
   verdad.
3. **Le da razón de ser a la corporación.** Nadie se afilia por una lista de
   miembros. Se afilia porque **la corporación tiene algo que uno solo no puede
   tener**, y esto es exactamente eso.

### Qué la hace rara, que es la parte difícil

Rara no quiere decir cara. Una cosa cara con el tiempo la tiene todo el mundo. Lo
que la mantiene rara son **cuatro compuertas distintas**, y conviene que sean
distintas porque una sola se satura:

| Compuerta         | Qué exige                                                                              |
| ----------------- | -------------------------------------------------------------------------------------- |
| **Habilidad**     | Naves capitales x12 e Industria de capital x12: miles de horas                         |
| **Material**      | Componentes de capital, que piden uranio, platino e iridio — los tres sólo hay sin ley |
| **Lugar**         | Sólo se arma en una estación con **astillero de capital**, que hay en pocas            |
| **Sostenimiento** | Consume combustible **mientras está desplegada**. Si nadie la abastece, se apaga       |

La cuarta es la que más trabaja y la que menos se piensa. **Una capital que no
cuesta nada mantener es una capital que nadie desarma**, y a los dos años el mapa
está lleno. El consumo continuo la vuelve una decisión que se toma todos los
meses, no una sola vez.

### Qué se puede hacer en una

Lo que la corporación le haya montado. **Una capital no trae servicios: trae
ranuras para servicios**, y ahí se decide qué clase de puesto es.

| Servicio montado | Qué habilita                                          |
| ---------------- | ----------------------------------------------------- |
| Amarre           | Atracar, que es lo mínimo para que sea un lugar       |
| Bodega           | Dejar carga y que otro la levante                     |
| Taller           | Fabricar lejos del centro                             |
| Refinería        | **Refinar donde se saca**, y acarrear la décima parte |
| Astillero        | Reparar y reequipar sin volver                        |

La refinería es la que cambia la economía: hoy la decisión de un minero lejano es
acarrear piedra o no ir; con una capital refinando en el sistema, la decisión pasa
a ser **quién sostiene la capital**, que es una decisión de grupo.

### Cómo entra en el modelo

La buena noticia es que el patrón ya está resuelto y probado en el juego: **la
puerta estelar es un cuerpo más y no una tabla aparte**, y por eso aparece en el
árbol, tiene distancia orbital y se le puede viajar sin tocar una línea de
`systemTree`. La capital desplegada usa exactamente el mismo camino.

| Pieza                 | Cómo                                                                         |
| --------------------- | ---------------------------------------------------------------------------- |
| Aparece en el árbol   | `BodyKind` gana `'capital'`, como ganó `'gate'`                              |
| Se le viaja           | Gratis: es un cuerpo, y viajar ya sabe ir a un cuerpo                        |
| Se atraca             | La estación cuelga del cuerpo, igual que en cualquier estación               |
| Es de alguien         | La estación ya apunta a una corporación. No hace falta nada nuevo            |
| Sigue siendo una nave | La fila de `ship` gana `body_id`: desplegada apunta a su cuerpo, guardada no |

Ese último renglón es el interesante y el que hay que pensar bien: **una capital
es una nave y un lugar a la vez**, y el estado «desplegada» es el que decide cuál
de las dos cosas es en cada momento. Desplegarla y replegarla son dos verbos
nuevos, y son los que le dan a la mecánica su tensión: desplegada sirve a todos y
es un blanco; guardada no sirve a nadie y no se la puede perder.

### La cadena

| Eslabón    | En la capital                                            |
| ---------- | -------------------------------------------------------- |
| El verbo   | Desplegar, atracar, replegar                             |
| El insumo  | **Combustible mientras está desplegada**                 |
| La fuente  | Hielo → helio-3 → bloques de combustible                 |
| El aparato | La capital, y los servicios que se le montan             |
| La llave   | Naves capitales x12, Industria de capital x12            |
| La fábrica | Astillero de capital, con componentes de capital         |
| El lugar   | El sistema donde se despliega, que pasa a ser de alguien |

Se cierra sola, y **depende entera de la cadena del hielo**: sin helio-3 no hay
con qué sostenerla. Es otro argumento para que el hielo sea de las primeras etapas.

### Lo que hay que decidir antes de construirla

1. ~~**¿Se puede destruir?**~~ **Sí**, como todo lo que vuela en este juego. Ver
   [P8](#p8--las-naves-se-pierden). La consecuencia de orden es dura y hay que
   aceptarla: **el combate tiene que existir antes que las capitales**, porque una
   capital indestructible en un mapa donde todo lo demás se pierde es la única cosa
   segura del juego, y todos van a vivir adentro.
2. **¿Cuántas por corporación?** Una obliga a elegir dónde; varias convierten al
   mapa en una grilla de puestos.
3. **¿Quién puede atracar?** Sólo la corporación, los aliados, o cualquiera. La
   tercera es la que crea economía —un puesto que le cobra peaje al que pasa— y la
   que más trabajo pide.
4. **¿Dónde se puede desplegar?** Si se puede en el centro, nadie va a salir. La
   respuesta probablemente sea **sólo fuera del perímetro**, que de paso le da a la
   zona sin ley una razón para existir.

## El hangar

Cada piloto tiene **una nave**, y la tiene desde el alta: `create_pilot` la crea
junto con sus habilidades iniciales, porque un piloto sin nave no puede hacer
nada y sería un piloto a medias.

De la base sale **sólo el casco y qué hay en cada ranura** (`Ship` y
`FittedModule`). Todo número que describa a la nave se le pide a la calculadora,
que es la misma que usa la pantalla y la que resuelve las acciones.

La bandera `is_active` en vez de una nave única por piloto: tener varias sigue
siendo "por decidir", y una bandera deja la puerta abierta sin costar nada hoy.

### Viajar usa la velocidad de la nave

```
duración = distancia × segundos_por_unidad × (velocidad_de_referencia ÷ velocidad)
```

Y nada más. **Navegación no entra en esta cuenta**: ya está adentro de la
velocidad, junto con el bono de rol del casco y los propulsores que tenga puestos.
Aplicarla otra vez sería contar el mismo bono dos veces para el mismo efecto, que
es exactamente lo que la regla de "una sola bolsa" quiere evitar.

Con la velocidad de referencia igual a la de una lanzadera de astillero, los
tiempos calibrados del sistema inicial no se movieron. Lo que cambió es que ahora
**la masa cuesta tiempo de verdad**: montarle una placa de blindaje a la Pioner la
frena de 200 a 192 u/s, y ese trayecto pasa a tardar más.

## De dónde sale un módulo

Un módulo tiene que estar **en la bodega de tu nave** para poder montarlo. Sin esa
regla, la pantalla de equipamiento ofrece el catálogo entero como si las piezas no
fueran de nadie ni estuvieran en ningún lado.

**Comprar y equipar son dos verbos distintos, en dos pantallas distintas.**
Comprar es del **[mercado](MARKET.md)**, que es donde viven la búsqueda y el árbol
de categorías; equipar es mover lo que ya es tuyo de la bodega a una ranura, y al
revés. Mezclarlos —una estación que surte el catálogo entero
desde la ranura— convierte el equipamiento en una lista de compras sin precio y
deja al mercado sin razón de existir.

**Un módulo que se baja vuelve a la bodega**, y uno que se sube sale de ella. Si
lo que estás bajando no entra en el lugar que queda, la operación se niega con el
motivo: desmontar no puede ser una forma silenciosa de tirar una pieza. El cálculo
del lugar usa la capacidad que la nave va a tener **después**, porque bajar una
bodega adicional achica el espacio justo cuando esa misma bodega necesita entrar.

Lo que la estación sigue decidiendo es **si podés tocar la nave**: hace falta estar
atracado y que el lugar tenga el módulo de Equipamiento.

| Estación                                                             | ¿Se puede reconfigurar? |
| -------------------------------------------------------------------- | ----------------------- |
| Puerto Ánfora · Muelle de los Anillos · Hábitat Talo · Amarre Franco | Sí                      |
| **Planta Escarcha**                                                  | **No**                  |

Es una regla de una línea que hace que el mapa importe: quedarse sin escudo cerca
de la Planta Escarcha significa volver a otro lado a montarlo.

Si una ranura no tiene nada disponible, la pantalla lo dice y manda al mercado:
«no tenés nada» es una queja, «se compra en el mercado» es una instrucción.

## Cómo está construido

| Módulo                      | Qué tiene                                                 |
| --------------------------- | --------------------------------------------------------- |
| `src/lib/game/damage.ts`    | Los tres tipos, las tres capas y la tabla de resistencias |
| `src/lib/game/hulls.ts`     | Los cascos, sus atributos y sus ranuras                   |
| `src/lib/game/modules.ts`   | El catálogo de lo que se monta                            |
| `src/lib/game/fitting.ts`   | **La calculadora**                                        |
| `src/lib/game/inventory.ts` | Qué de la bodega entra en una ranura                      |

### Nada derivado se guarda

Se guarda el casco, qué módulo hay en cada ranura y el daño actual de cada capa.
Masa total, velocidad, alcance, puntos efectivos, rendimiento, estabilidad del
acumulador: **todo se calcula**.

Es el mismo criterio con el que la seguridad de un sistema sale de su gobierno
(ver [universo](UNIVERSE.md)). Con las dos cosas guardadas terminan
contradiciéndose, y una nave que dice tener 400 de escudo y aguanta 250 es de los
errores que el jugador descubre justo cuando lo perjudica.

### Una sola calculadora para la pantalla y para el juego

`fitting.ts` es la **misma** función que va a usar el motor de acciones cuando
exista el hangar. En EVE las herramientas de equipamiento son de terceros,
reimplementan la matemática y se desfasan del juego; acá tenemos las dos puntas,
así que **la pantalla no puede mentir por construcción**: si dice 340 m³ por
hora, el motor va a extraer 340.

### Los bonos se suman

Habilidad más casco, en una sola bolsa, como fija [acciones](ACTIONS.md). Es más
fácil de explicar, más fácil de balancear, y evita que apilar seis fuentes chicas
rompa el juego. La tabla de qué habilidad mejora qué está en `fitting.ts` y es
**dato**: sumar una habilidad que mejore algo es agregar una fila.

### Todo entero

No hay un solo decimal en las reglas. Lo que necesita fracción se lleva en
**décimas** —alcance de salto, daño por segundo—, igual que el dinero se lleva en
la unidad más chica, y la coma aparece recién al escribirlo en pantalla.

## Qué consume cada número: la auditoría

Un módulo se gana su lugar si algo lee lo que produce. Esta tabla dice qué lee
cada cosa, para que se vea de un vistazo qué es contenido vivo y qué todavía no
lo es:

| Lo que produce un módulo        | Quién lo lee                            | Estado  |
| ------------------------------- | --------------------------------------- | ------- |
| Masa y empuje                   | Viajar: la duración real                | **ya**  |
| Potencia y cómputo              | El propio equipamiento: si entra o no   | **ya**  |
| Bodega                          | Cuánto te traés de un cinturón          | Etapa 2 |
| Rendimiento de extracción       | Minar                                   | Etapa 2 |
| Acumulador y su recarga         | Si el trabajo se sostiene o rinde menos | Etapa 2 |
| Potencia de salto y combustible | Qué puertas podés usar, y cuántas veces | Etapa 6 |
| Escudo, blindaje, daño por tipo | Combate                                 | Combate |
| Alcance de sensores             | Explorar y prospectar                   | Después |
| Firma                           | Qué tan fácil te encuentran             | Combate |

**Lo que hoy no lee nadie se dice acá.** De los 25 números que devuelve la
calculadora, sólo la velocidad y el permiso de volar cambian el resultado de una
acción; el resto todavía se dibuja nada más. Eso es una deuda, no una
característica, y esta tabla es la lista de lo que hay que pagar. **El día que una
fila se quede sin nadie que la lea, el número sobra.**

Mientras tanto, un número que nada consume **no se le muestra al jugador**: la
ficha enseña lo que algo usa. Un panel de aguante que ninguna mecánica puede
gastar es una promesa escrita con cifras.

## Reglas de diseño

- **La nave no reemplaza al piloto.** Los bonos escalan con habilidades: una nave
  buena en manos sin entrenar rinde poco.
- **Especializar duele.** Una nave con tres láseres mina rapidísimo y no
  sobrevive a un mal encuentro.
- **Nada es gratis**: potencia, cómputo, masa y espacio son cuatro presupuestos
  que compiten entre sí.
- **Armar algo imposible tiene que poder hacerse.** La pantalla deja montar un
  módulo que no entra y **dice por qué** no cierra, en vez de impedirlo sin
  explicación.

## Por decidir

- Si las naves se pierden al ser destruidas o se reparan, y con qué seguro.
- Si el equipamiento se daña con el uso.
- Cómo se consiguen: sólo compra en astillero, o también fabricación.
- Cuántas naves puede tener un piloto a la vez, y dónde quedan las demás.
- Si existe la ingeniería de módulos, y con qué costo.
- Qué gasta el combustible además de los saltos.

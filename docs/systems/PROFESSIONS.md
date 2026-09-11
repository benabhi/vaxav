# Profesiones

> **Propuesta.** Los repartos son un borrador; el presupuesto común sí es la idea
> de fondo. Nada está implementado todavía.
>
> Ver también: [habilidades](SKILLS.md) · [facciones](FACTIONS.md) ·
> [naves](SHIPS.md)

Al crear el piloto se elige una **profesión**: lo que venía haciendo antes de
comprarse una nave. No es una clase ni un rol permanente — es **de dónde arranca**.

## Qué hace una profesión

Le da al piloto un puñado de habilidades ya entrenadas, para que pueda hacer algo
útil desde el primer minuto en vez de mirar una pantalla de ceros. Eso es todo:
no bloquea nada, no da bonos propios, no impide reconvertirse. Un minero que se
aburre puede terminar de mercader, sólo que va a tardar más que uno que empezó
ahí.

## El presupuesto común

Todas las profesiones reparten **la misma cantidad de experiencia inicial: 1.000
puntos**, contados con el multiplicador de cada habilidad ya aplicado. Ninguna
empieza mejor que otra: empiezan **distinto**.

Eso hace que el balance sea verificable de un vistazo —si las cuentas dan 1.000,
está bien— y que agregar una profesión nueva no requiera rediscutir las otras.

Recordatorio de costos, para leer las tablas: alcanzar el nivel 1 de una x1 son
100 puntos; el nivel 2, 400 acumulados. En una x2 esos mismos niveles son 200 y 800.

## Las seis propuestas

### Minero

Trabajó en los anillos hasta que juntó para su propia nave. Sabe sacar mineral y
sabe acomodarlo.

| Habilidad  | Nivel | Costo |
| ---------- | :---: | ----: |
| Minería    |  II   |   400 |
| Estiba     |  II   |   400 |
| Navegación |   I   |   100 |
| Mecánica   |   I   |   100 |

### Explorador

Vivió de vender coordenadas. Llega más lejos y ve antes lo que hay.

| Habilidad            | Nivel | Costo |
| -------------------- | :---: | ----: |
| Navegación           |  II   |   400 |
| Manejo de lanzaderas |  II   |   400 |
| Escaneo              |   I   |   200 |

### Transportista

Llevó carga ajena media vida. Nadie mete más cosas en menos bodega.

| Habilidad            | Nivel | Costo |
| -------------------- | :---: | ----: |
| Estiba               |  II   |   400 |
| Navegación           |  II   |   400 |
| Regateo              |   I   |   100 |
| Manejo de lanzaderas |   I   |   100 |

### Mercader

Empezó revendiendo en el muelle. Compra bien y sabe qué le están cobrando.

| Habilidad            | Nivel | Costo |
| -------------------- | :---: | ----: |
| Regateo              |  II   |   400 |
| Contabilidad         |   I   |   200 |
| Navegación           |   I   |   100 |
| Estiba               |   I   |   100 |
| Mecánica             |   I   |   100 |
| Manejo de lanzaderas |   I   |   100 |

### Escolta

Cobró por proteger convoyes. Tira derecho y arregla lo que le rompen.

| Habilidad            | Nivel | Costo |
| -------------------- | :---: | ----: |
| Puntería             |  II   |   400 |
| Mecánica             |  II   |   400 |
| Navegación           |   I   |   100 |
| Manejo de lanzaderas |   I   |   100 |

### Técnico

Fue mecánico de hangar. Entiende la nave por dentro mejor que nadie.

| Habilidad            | Nivel | Costo |
| -------------------- | :---: | ----: |
| Mecánica             |  II   |   400 |
| Gestión de energía   |   I   |   200 |
| Minería              |   I   |   100 |
| Estiba               |   I   |   100 |
| Navegación           |   I   |   100 |
| Manejo de lanzaderas |   I   |   100 |

## Reglas de diseño

- **Los repartos respetan los prerrequisitos.** El Técnico puede tener Gestión de
  energía porque tiene Mecánica II; el Mercader, Contabilidad porque tiene
  Regateo II. Una profesión nunca entrega una habilidad que el piloto no podría
  haber entrenado.
- **Ninguna profesión es la buena.** Si alguna se vuelve la elección obvia, el
  problema está en el balance de las acciones, no en subirle los niveles.
- **La profesión se elige una vez** y queda como parte de la historia del piloto,
  aunque después haga otra cosa.

## Por decidir

- Si la profesión también define la **nave inicial** o el capital de arranque.
- Si conviene mostrarla en el perfil público del piloto.
- Si hay una séptima opción "sin oficio" que reparte el presupuesto a gusto del
  jugador, para quien ya sabe lo que quiere.

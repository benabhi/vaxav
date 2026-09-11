# El MVP

> Qué es lo mínimo que ya es Vaxav, y qué queda deliberadamente afuera.
>
> Ver también: [hoja de ruta](ROADMAP.md) · [arquitectura](systems/ARCHITECTURE.md)
> · [diseño general](DESIGN.md)

## Qué es Vaxav

Una mezcla de tres juegos, y conviene decir qué se toma de cada uno porque
explica casi todas las decisiones:

| De                  | Se toma                                                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **OGame**           | El ritmo: das una orden, corre un temporizador, volvés a ver el resultado. Sesiones cortas y frecuentes, por navegador, sin instalar nada |
| **EVE Online**      | La profundidad: habilidades que tardan meses, economía enteramente en manos de los jugadores, corporaciones, un solo universo compartido  |
| **Elite Dangerous** | La piel y la nave: la interfaz naranja del HUD, y una nave con ranuras por clase y calificación que se arma pieza por pieza               |

## La frase del MVP

> **Un piloto se crea, viaja por el sistema Ánfora, mina en un cinturón, ve subir
> sus habilidades por haberlo hecho, y se cruza con otros pilotos en el chat.**

Si eso funciona y se siente bien, el juego existe. Todo lo demás —mercado,
corporaciones, industria, combate— es crecimiento sobre esa base.

## Qué entra

### 1. Cuenta y piloto _(hecho)_

Registro en cuatro pasos, ingreso, sesión persistente, profesión y facción.

### 2. Roles y permisos

Jugador, moderador y administrador. **Antes de que haya un solo usuario real**:
sumarlo después obliga a repensar cada pantalla y cada operación.

### 3. El sistema Ánfora, en la base de datos

Estrella, planetas, lunas, cinturones y estaciones como **filas, no como
constantes en el código**. El universo tiene que poder crecer sin desplegar.

### 4. Habilidades

El catálogo inicial, la experiencia que se gana al resolver acciones, y la
pantalla donde se ve el progreso en estrellas.

### 5. Naves y hangar

Cinco cascos: la lanzadera inicial, una carguera chica, una minera, una
exploradora y una de combate. Con sus ranuras por clase, aunque el catálogo de
módulos arranque corto.

> Las de exploración y combate se pueden comprar pero todavía no tienen actividad
> propia: su ventaja queda latente hasta que existan esas mecánicas. Se incluyen
> igual para que el hangar nazca con variedad y para probar el sistema de bonos.

### 6. Movimiento

Viajar entre los cuerpos del sistema. Es la primera acción con temporizador y la
que valida el motor entero.

### 7. Minería

Extraer en un cinturón y llenar la bodega. Es la primera fuente de recursos, y
sin ella la economía no tiene de dónde salir.

### 8. El motor de acciones

Lo más importante del MVP y lo que no se puede improvisar: encolar, resolver de
forma perezosa e idempotente, repartir experiencia, escribir el informe y dejarlo
en la bitácora. Con el **indicador siempre visible** de qué se está haciendo y
cuánto falta.

### 9. Chat en tiempo real

Global y por sistema. Es lo que convierte una simulación en un lugar con gente.

### 10. Mensajería asíncrona

Correo entre pilotos, básico. Lo que el chat no puede sostener: lo que hay que
poder leer tres días después.

### 11. Billetera

Saldo en créditos y el **libro de movimientos** desde el primer día. Un juego con
economía de jugadores sin registro de asientos es imposible de auditar cuando
aparece el primer duplicado.

## Qué queda afuera, a propósito

| Fuera del MVP               | Por qué                                                                                                         |
| --------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Mercado**                 | Es un sistema grande por sí solo y necesita que antes haya recursos, bodegas y gente. Se hace bien o no se hace |
| **Corporaciones**           | Necesitan jugadores que ya tengan algo que compartir                                                            |
| **Propiedades e industria** | Sin mercado no hay a quién venderle lo fabricado                                                                |
| **Mapa galáctico**          | Con un solo sistema, un mapa de galaxia es una pantalla vacía                                                   |
| **Combate**                 | Es el sistema más difícil de balancear y el que más daño hace si sale mal                                       |
| **Misiones de NPC**         | Requieren estaciones con contenido y una economía andando                                                       |
| **Ingeniería de módulos**   | Es profundidad sobre un sistema de módulos que todavía no existe                                                |

Nada de esto está descartado: está en la [hoja de ruta](ROADMAP.md) y el MVP se
construye **sin cerrarles la puerta**, que es distinto de construirlas ahora.

## Cuándo está listo

El MVP se da por terminado cuando un piloto nuevo puede, sin ayuda:

1. Crearse una cuenta y elegir profesión y facción.
2. Ver su nave en el hangar y sus habilidades iniciales.
3. Viajar de la estación a un cinturón y que el viaje tarde.
4. Cerrar el navegador, volver más tarde y encontrar el viaje resuelto.
5. Minar hasta llenar la bodega.
6. Ver la experiencia repartida entre la habilidad principal y las secundarias, y
   una estrella que se llena.
7. Volver a la estación y ver los créditos de la venta en su billetera, con el
   asiento correspondiente.
8. Saludar en el chat y que otro piloto le conteste.
9. Mandarle un mensaje a alguien que no está conectado.

Y cuando, además, **dos pilotos haciendo lo mismo al mismo tiempo no se pisan**:
esa es la prueba que separa un prototipo de un juego multijugador.

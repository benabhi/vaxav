# Retratos de los NPC

Dejá las imágenes acá adentro y aparecen en el juego. **La estructura de carpetas
no importa**: se recorre todo, subcarpetas incluidas, y lo único que se mira es el
**nombre del archivo**.

Que las carpetas no cuenten es a propósito: se pueden reordenar cuando haya
cuatrocientos retratos sin que se rompa nada, y un generador puede escribir donde
le quede cómodo.

## Las dos reglas

1. **Un archivo que se llama igual que un agente es su retrato.** Por ejemplo
   `verlan_aduana.webp` es el de Sela Verlan, esté guardado donde esté. Los
   códigos de agente salen del plano, en `vaxav/game/universe.py`.
2. **Todo lo demás va al fondo común**, que se reparte entre los agentes que no
   tienen uno propio. El reparto es estable: el mismo agente saca siempre el
   mismo retrato, entre arranques y entre máquinas.

## Cómo se nombran

```
agentes/verlan_aduana.webp     ← retrato propio: el código del agente, tal cual
pool/m-0001.webp               ← fondo común: rasgo y número
pool/f-0002.webp
```

Para el fondo común: **`<rasgo>-<número de cuatro cifras>`**.

| Rasgo | Qué es |
|---|---|
| `m` | Masculino |
| `f` | Femenino |
| `x` | Andrógino, o cualquier otra cosa |

El rasgo va en el **nombre** y no en la carpeta justamente porque las carpetas no
cuentan: así sobrevive a cualquier reordenamiento. **Hoy el reparto no lo mira**
—toma cualquier imagen del fondo—, pero el día que un agente tenga un aspecto
declarado, filtrar por ese prefijo es cambiar una línea y ningún archivo.

Los números no tienen que ser correlativos ni empezar de nuevo por rasgo: son sólo
para que dos archivos no se llamen igual. Un generador puede seguir contando desde
donde quedó.

Un nombre de fondo común nunca puede chocar con uno de agente: los códigos de
agente son palabras con guión bajo (`talo_prospeccion`) y los del fondo empiezan
con una letra y un guión medio.

## Cómo se preparan las imágenes

- **Cuadradas**, porque el hueco de la ficha lo es.
- **512 × 512**, que alcanza para el hueco de hoy y para uno más grande mañana.
- **WebP, calidad 82.** Cada retrato pesa unos 35 KB; el PNG original pesaba dos
  megas y medio, y son imágenes que se cargan de a diez en una pantalla.
- Recorte: **cuadrado del ancho completo, anclado al borde de arriba** y centrado
  a lo ancho. En un retrato la cara está siempre en la mitad de arriba, así que
  esa regla sirve para cualquier tanda sin mirar imagen por imagen.

Formatos que se leen: `.webp`, `.avif`, `.png`, `.jpg`, `.jpeg` y `.gif`.
Cualquier otro archivo —este mismo, una licencia, un `.psd`— se ignora.

## Mientras no haya ninguno

El hueco dibuja una silueta. Es a propósito: dice que ahí falta algo, que es más
honesto que repetir una foto genérica en diez fichas.

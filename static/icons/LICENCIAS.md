# Íconos

Los íconos son de [Phosphor Icons](https://phosphoricons.com), servidos desde el
propio proyecto igual que las fuentes: la página no sale a buscar nada a
internet.

- **Licencia**: MIT ([phosphor-icons/core](https://github.com/phosphor-icons/core)).
- **Qué hay acá**: sólo los íconos que la interfaz usa, en los seis pesos
  (`thin`, `light`, `regular`, `bold`, `fill`, `duotone`), organizados por peso.
- **Cómo se usan**: nunca como `<img>`, sino con `mask` en
  `src/lib/components/Icon.svelte`, para que tomen el color del texto que los
  rodea en lugar de traer el suyo.

Para sumar un ícono, descargar los seis pesos desde
`https://raw.githubusercontent.com/phosphor-icons/core/main/assets/<peso>/<nombre>[-<peso>].svg`
y guardarlos como `static/icons/<peso>/<nombre>.svg` — sin el sufijo del peso en
el nombre, porque ya lo dice la carpeta— y sumarlo a `ICON_NAMES` en
`src/lib/icons.ts`. `src/lib/icons.test.ts` verifica que no falte ninguno de los
seis pesos y que no sobre ninguno que nadie use.

# Íconos

Los íconos son de [Phosphor Icons](https://phosphoricons.com), servidos desde el
propio proyecto igual que las fuentes: la página no sale a buscar nada a
internet.

- **Licencia**: MIT ([phosphor-icons/core](https://github.com/phosphor-icons/core)).
- **Qué hay acá**: sólo los íconos que la interfaz usa, en los seis pesos
  (`thin`, `light`, `regular`, `bold`, `fill`, `duotone`), organizados por peso.
- **Cómo se usan**: nunca como `<img>`, sino con `mask` en
  `vaxav/components/icons.py`, para que tomen el color del texto que los rodea y
  acompañen el modo claro y el oscuro.

Para sumar un ícono, descargar los seis pesos desde
`https://raw.githubusercontent.com/phosphor-icons/core/main/assets/<peso>/<nombre>[-<peso>].svg`
y guardarlos como `assets/icons/<peso>/<nombre>.svg` — sin el sufijo del peso en
el nombre, porque ya lo dice la carpeta. Los tests de `tests/test_icons.py`
verifican que no falte ninguno.

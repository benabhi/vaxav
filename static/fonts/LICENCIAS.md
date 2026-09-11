# Fuentes

Las tres familias se sirven desde el propio proyecto (`assets/fonts/`), no desde
Google Fonts. Son subconjuntos latinos, que cubren todo el español.

Elite Dangerous usa **Eurostile**, que es comercial; estas son las alternativas
libres más cercanas. Ver `docs/systems/VISUAL.md`.

| Archivo | Familia | Pesos | Licencia |
|---|---|---|---|
| `rajdhani-*-latin.woff2` | [Rajdhani](https://github.com/itfoundry/rajdhani) | 500, 600, 700 | SIL Open Font License 1.1 |
| `titillium-web-*-latin.woff2` | [Titillium Web](https://fonts.google.com/specimen/Titillium+Web) | 400, 600 | SIL Open Font License 1.1 |
| `jetbrains-mono-latin.woff2` | [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) | 400–500 | SIL Open Font License 1.1 |

La OFL permite usarlas, incrustarlas y redistribuirlas, incluso en proyectos
comerciales, siempre que no se vendan por separado y que las obras derivadas no
usen los nombres reservados.

Para actualizarlas: descargar el `.woff2` del subconjunto latino desde
`fonts.googleapis.com/css2` y reemplazar el archivo; las reglas `@font-face`
están en `assets/vaxav.css`.

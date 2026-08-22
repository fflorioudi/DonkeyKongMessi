# QA V3.4 - Selector Y Nivel 1 Barcelona

## Objetivo

Separar el tutorial del primer nivel real y agregar selector de niveles desde el boton `Jugar`.

## Assets Recibidos

- `public/assets/levels/level-1-background.png`
- `public/sprites/level-1-platforms.png`
- `public/sprites/level-1-rival.png`
- `public/sprites/level-1-companions.png`

Fuentes preservadas:

- `public/sprites/source/level-1-platforms-source.png`
- `public/sprites/source/level-1-rival-source.png`
- `public/sprites/source/level-1-companions-source.png`

## Alcance

- Boton `Jugar` abre selector, no entra directo a partida.
- Tutorial y Nivel 1 quedan desbloqueados.
- Nivel 2 a Nivel 5 quedan visibles como bloqueados hasta recibir covers/assets.
- Nivel 1 usa background Camp Nou, plataformas Barcelona y rival propio.
- Companion queda recortado y registrado para mecanica futura, todavia no activo como ayuda.

## QA Automatico

Ejecutar:

```bash
npm run assets:level1
npm run qa:v3.4
npm run qa:v3.3
npm run qa:v3.2.4
npm run qa:v2.9
npm run typecheck
npm run lint
npm run build
```

## QA Manual

1. Abrir portada.
2. Tocar `Jugar`.
3. Confirmar que abre selector de niveles.
4. Entrar al Tutorial y confirmar que sigue igual.
5. Volver al menu, tocar `Jugar` y entrar a Nivel 1.
6. Confirmar fondo Camp Nou, plataformas Barcelona y rival nuevo.
7. Confirmar que Nivel 2 a Nivel 5 aparecen bloqueados.
8. Confirmar que no aparecen controles jugables en portada ni selector.

## Criterio De Cierre

- Selector usable en mobile.
- Tutorial y Nivel 1 se pueden jugar por separado.
- Nivel 1 se declara desde datos.
- Los assets quedan normalizados y registrados.

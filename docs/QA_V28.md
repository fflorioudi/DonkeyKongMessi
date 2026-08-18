# QA V2.8 - Preparacion Para Multiples Niveles

Objetivo: validar que el motor quedo listo para agregar escenarios nuevos sin duplicar logica.

## Alcance

- Catalogo de niveles en `Game`.
- Seleccion por indice desde menu.
- Dificultad por nivel.
- Rival por nivel.
- Fondo por nivel.
- Plataformas con frame visual definido por datos.
- Records locales separados por nivel.

## QA Automatico

Ejecutar:

```bash
npm run qa:v2.8
npm run lint
npm run typecheck
npm run build
```

Validaciones cubiertas por `qa:v2.8`:

- `package.json` registra el script.
- `LevelDefinition` expone `difficulty`, `background` y `rival`.
- El snapshot expone `levelIndex` y `levelCount`.
- `data/levels.ts` contiene la configuracion nueva.
- `Game` recibe el catalogo de niveles.
- `Game` puede seleccionar nivel por indice.
- High score y mejor tiempo usan claves por nivel.
- El scoring usa `level.difficulty`.
- Fondo y Cristiano se renderizan desde datos.
- El menu usa el catalogo y muestra selector.

## QA Manual Mobile

1. Abrir el juego en mobile portrait.
2. Confirmar que la portada muestra selector de nivel.
3. Confirmar que con un solo nivel los botones laterales quedan deshabilitados.
4. Entrar a jugar y completar o perder una partida.
5. Volver al inicio.
6. Confirmar que el selector sigue estable y no duplica inputs ni audio.
7. Recargar la pagina.
8. Confirmar que high score y mejor tiempo del Nivel 1 siguen visibles.

## Prueba De Extensibilidad

Para validar arquitectura sin disenar el Nivel 2 final:

1. Duplicar temporalmente el objeto del Nivel 1 en `data/levels.ts`.
2. Cambiar `id`, `name`, `theme`, `difficulty`, `rival` o `background`.
3. Confirmar que el selector permite cambiar de nivel.
4. Confirmar que cada nivel conserva records separados.
5. Descartar el duplicado temporal si no forma parte de la version.

## Criterio De Cierre V2.8

- Agregar un segundo nivel requiere tocar principalmente `data/levels.ts`.
- El motor no depende de `levels[0]`.
- El Nivel 1 conserva gameplay, assets, audio y scoring de V2.7.

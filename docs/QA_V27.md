# QA V2.7 - Persistencia Y Rejugabilidad

Objetivo: validar que el Nivel 1 ya tiene motivos minimos para repetirse antes de preparar multiples niveles.

## Alcance

- Puntaje persistente.
- Mejor tiempo local.
- Bonus por completar el nivel.
- Bonus por vidas restantes.
- Bonus por terminar rapido.
- Resumen claro al ganar.
- Records visibles al perder.

## QA Automatico

Ejecutar:

```bash
npm run qa:v2.7
npm run lint
npm run typecheck
npm run build
```

Validaciones cubiertas por `qa:v2.7`:

- `package.json` registra el script de QA.
- `HudSnapshot` expone tiempo, mejor tiempo y desglose de puntaje.
- El motor persiste mejor tiempo y high score en `localStorage`.
- La victoria calcula bonus por meta, vidas y tiempo.
- El HUD muestra cronometro durante la partida.
- Victory muestra resumen de puntos.
- Game Over muestra marcas locales.
- El snapshot inicial contiene los campos nuevos.

## QA Manual Mobile

1. Abrir el juego en telefono real o emulador mobile.
2. Completar el nivel con al menos una vida restante.
3. Confirmar que Victory muestra progreso, meta, vidas, tiempo y total final.
4. Reiniciar y completar mas rapido.
5. Confirmar que aparece nuevo mejor tiempo si corresponde.
6. Perder una partida despues de haber ganado.
7. Confirmar que Game Over conserva puntos maximos y mejor tiempo.
8. Recargar la pagina.
9. Confirmar que las marcas siguen guardadas.

## Criterio De Cierre V2.7

- Completar mas rapido o con mas vidas mejora el resultado.
- El jugador entiende por que recibio su puntaje final.
- Las marcas sobreviven a reinicio de partida y recarga.
- No hay regresiones en controles, audio ni sprites de V2.6.

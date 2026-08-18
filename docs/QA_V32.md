# QA V3.2 - Camara Vertical Y Tutorial Extendido

## Objetivo

Validar que el tutorial deja de estar limitado a una sola pantalla sin achicar sprites, plataformas ni controles.

## Alcance

- Mundo del Nivel 1 mas alto que el viewport mobile.
- Canvas renderizado como viewport fijo de 390 x 720.
- Camara vertical que sigue a Messi al subir.
- Ruta extendida con mas plataformas y escaleras.
- Compatibilidad con obstaculos genericos de V3.0 y tarjeta roja de V3.1.
- Sin nuevos rectangulos visibles como arte de gameplay.

## QA Automatico

Ejecutar:

```bash
npm run qa:v3.2
npm run qa:v3.1
npm run qa:v3.0
npm run typecheck
npm run lint
npm run build
```

Validaciones cubiertas por `qa:v3.2`:

- `LevelDefinition` declara `viewportWidth`, `viewportHeight` y `camera`.
- `worldHeight` es mayor que `viewportHeight`.
- El tutorial tiene ruta expandida de plataformas y escaleras.
- `Game` mantiene `cameraY`.
- El canvas escala contra viewport, no contra el alto total del mundo.
- El render aplica `ctx.translate(0, -this.cameraY)`.
- El flash de dano respeta la ventana visible.
- La portada declara `Mobile v3.2`.
- README y roadmap documentan la decision.

## QA Manual Mobile

1. Abrir `http://localhost:3000/donkey-messi`.
2. Iniciar partida.
3. Confirmar que Messi aparece abajo con el tamano habitual.
4. Subir por las primeras escaleras.
5. Confirmar que la camara acompana suavemente sin achicar el mapa.
6. Confirmar que las plataformas inferiores salen de pantalla al avanzar.
7. Respawnear por golpe o caida y confirmar que la camara vuelve abajo limpia.
8. Llegar arriba y confirmar que Copa, Cristiano, pelotas y tarjeta roja siguen visibles con sprite.

## Criterio De Cierre

- El tutorial se siente mas largo sin perder legibilidad.
- La camara no vibra ni muestra fuera del mundo.
- Los controles tactiles siguen fijos y comodos.
- Las pelotas y tarjetas siguen desapareciendo cuando salen del mapa.
- La base sirve para niveles futuros mas altos.

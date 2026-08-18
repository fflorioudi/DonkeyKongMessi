# QA V3.1 - Obstaculo Tarjeta Roja

Objetivo: validar el primer obstaculo nuevo sobre el sistema generico de V3.0.

## Alcance

- Tipo `red-card`.
- Spawner de baja frecuencia en el tutorial.
- Movimiento horizontal.
- Hitbox rectangular reducida.
- Sprite pixel art propio.
- Compatibilidad con pelota `ball`.

## QA Automatico

Ejecutar:

```bash
npm run qa:v2.1
npm run qa:v2.2
npm run qa:v2.3
npm run qa:v2.4
npm run qa:v2.5
npm run qa:v2.6
npm run qa:v2.7
npm run qa:v2.8
npm run qa:v2.9
npm run qa:v3.0
npm run qa:v3.1
npm run lint
npm run typecheck
npm run build
```

Validaciones cubiertas por `qa:v3.1`:

- `red-card` existe como tipo.
- El Nivel 1 declara un spawner `tutorial-red-card`.
- El spawner es suave: `firstDelay` alto y `maxActive: 1`.
- `Obstacle` soporta runtime de tarjeta roja.
- La tarjeta se mueve horizontalmente.
- La hitbox es reducida.
- La tarjeta usa `public/sprites/red-card.png`.
- Las pelotas desaparecen tambien cuando quedan apoyadas en la plataforma inferior.
- La portada declara `Mobile v3.1` o superior.

## QA Manual Mobile

1. Abrir el juego en mobile portrait.
2. Entrar con `Jugar`.
3. Confirmar que las pelotas siguen funcionando igual.
4. Esperar la primera tarjeta roja.
5. Confirmar que se ve roja, clara y distinta a la pelota.
6. Confirmar que no aparece encima del respawn.
7. Tocar la tarjeta y confirmar perdida de vida.
8. Evitarla y confirmar que sale de pantalla.
9. Completar el tutorial.

## Criterio De Cierre V3.1

- La tarjeta roja se distingue de la pelota.
- No genera muertes invisibles.
- Puede activarse, balancearse o quitarse desde `data/levels.ts`.
- El loop central sigue trabajando con `obstacles`, no con casos especiales.
- No queda ningun rectangulo de canvas como arte visible de la tarjeta.

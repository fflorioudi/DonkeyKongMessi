# QA V3.3 - Botin De Oro

## Objetivo

Probar el primer power-up jugable en el tutorial como base para Nivel 1.

## Decision De Diseno

El Botin de Oro da invencibilidad temporal, no vida extra.

Motivo:

- En tutorial ensena una mecanica activa y visible.
- Permite probar feedback, timer y colision sin romper el balance de vidas.
- Una vida extra queda reservada para un pickup raro de niveles mas avanzados.

## Asset

- Fuente original: `public/sprites/source/power-up-botin-de-oro-source.png`
- Spritesheet runtime: `public/sprites/power-up-botin-de-oro.png`
- Metadata: sheet `goldenBoot` en `public/sprites/sprites.json`

## QA Automatico

Ejecutar:

```bash
npm run assets:powerup:botin
npm run qa:v3.3
npm run qa:v3.2.4
npm run qa:v3.1
npm run typecheck
npm run lint
npm run build
```

## QA Manual

1. Entrar al tutorial.
2. Subir hasta la segunda plataforma y agarrar el Botin de Oro.
3. Confirmar que aparece contador de Botin en HUD.
4. Tocar una pelota o tarjeta durante el efecto.
5. Confirmar que Messi no pierde vida y el obstaculo desaparece.
6. Esperar a que termine el timer.
7. Tocar otro obstaculo y confirmar que vuelve a quitar vida.
8. Confirmar que no hay cuadrados visibles para representar el power-up.

## Criterio De Cierre

- El power-up se ve con sprite pixel art.
- La invencibilidad dura unos segundos y se comunica en HUD.
- Los obstaculos no hacen dano durante el efecto.
- La logica queda declarada en `LevelDefinition` para reusarla en Nivel 1.

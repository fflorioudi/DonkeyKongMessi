# QA V3.0 - Sistema Generico De Obstaculos

Objetivo: validar que la pelota actual quedo integrada en un sistema extensible de obstaculos sin cambiar el comportamiento del Nivel 1.

## Alcance

- Tipos genericos de obstaculo.
- Spawners genericos por nivel.
- Pelota actual conservada como primer tipo `ball`.
- Timers por spawner.
- Colisiones delegadas a entidad `Obstacle`.
- Limpieza de obstaculos en respawn.
- Compatibilidad con QA historico de V2.

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
npm run lint
npm run typecheck
npm run build
```

Validaciones cubiertas por `qa:v3.0`:

- `ObstacleKind`, `ObstacleDefinition` y `ObstacleSpawnerDefinition` existen.
- `LevelDefinition` soporta `obstacleSpawners`.
- El Nivel 1 declara un spawner generico con `kind: "ball"`.
- `Ball` sigue existiendo como implementacion fisica.
- `Obstacle` envuelve la pelota y expone `update`, `draw` y `collidesWith`.
- `Game` trabaja con `obstacles` y timers por spawner.
- La portada declara `Mobile v3.0`.

## QA Manual Mobile

1. Abrir el juego en mobile portrait.
2. Entrar con `Jugar`.
3. Confirmar que Cristiano lanza pelotas como antes.
4. Confirmar que las pelotas rebotan, caen y desaparecen al tocar el fondo.
5. Recibir un golpe.
6. Confirmar respawn limpio sin obstaculos encima de Messi.
7. Completar el nivel.
8. Confirmar scoring, audio, Victory y records.

## Criterio De Cierre V3.0

- El Nivel 1 se juega igual o mejor que en V2.9.
- El loop central no depende de una lista `balls`.
- Agregar `red-card` en V3.1 no exige reescribir el sistema de spawn.

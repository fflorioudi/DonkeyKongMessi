# QA V2.5 - Audio Basico

Objetivo: sumar respuesta sonora original sin usar musica ni assets con derechos.

## Cambios

- Audio generado con Web Audio API.
- Archivos `.wav` propios generados localmente en `public/audio`.
- HTMLAudio se intenta primero para mejorar compatibilidad mobile.
- Web Audio queda como fallback.
- Sonido de inicio.
- Sonido de salto.
- Sonido de golpe.
- Sonido de pelota lanzada.
- Sonido de Game Over.
- Sonido de victoria.
- Sonido corto de UI.
- Boton de sonido/mute.
- Preferencia de sonido persistida en `localStorage`.
- Desbloqueo de audio en el primer gesto de `Jugar`, compatible con restricciones mobile.
- Boton `Audio` para probar desbloqueo antes de jugar.

## QA Automatico

Comando:

```bash
npm run qa:v2.5
```

Valida:

- Existencia del `AudioManager`.
- Uso de Web Audio.
- Existencia de fallback con archivos `.wav`.
- Desbloqueo de HTMLAudio por gesto mobile.
- Desbloqueo por gesto mobile.
- Persistencia de mute.
- Conexion de sonidos a eventos de juego.
- Existencia del boton de sonido.

## QA Manual

1. Abrir el juego en mobile.
2. Tocar `Jugar` y confirmar que suena inicio.
3. Saltar y confirmar sonido corto.
4. Esperar lanzamiento de pelota y confirmar sonido.
5. Recibir golpe y confirmar sonido de impacto.
6. Llegar a Game Over y confirmar sonido.
7. Ganar y confirmar fanfarria corta.
8. Mutear con el boton `S/M`.
9. Refrescar y confirmar que mute persiste.

## Criterio De Cierre V2.5

- El audio no bloquea el primer input mobile.
- Los sonidos son cortos y no molestan.
- El juego puede mutearse.
- No se usan canciones ni assets con derechos.
- El rendimiento se mantiene fluido.

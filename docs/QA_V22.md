# QA V2.2 - Feedback Visual

Objetivo: que el jugador entienda mejor lo que ocurre sin agregar mecanicas nuevas.

## Cambios

- Flash rojo al recibir impacto.
- Texto flotante `-1 vida`.
- Mensaje temporal en HUD.
- Messi parpadea con contorno durante proteccion de respawn.
- Escalera activa resaltada cuando Messi puede usarla.
- Cristiano muestra cue visual al lanzar pelota.
- Texto flotante `PELIGRO` cuando aparece una pelota.
- Pelotas con rotacion visual.
- Meta con pulso durante juego.
- Victoria con anillo de celebracion y texto `+1000`.

## QA Automatico

Comando:

```bash
npm run qa:v2.2
```

Valida que existan las senales visuales clave de impacto, respawn, escalera activa, lanzamiento, victoria, mensaje HUD y rotacion de pelota.

## QA Manual

1. Recibir un golpe y confirmar que se entiende la perdida de vida.
2. Confirmar que el respawn muestra proteccion visual.
3. Acercarse a una escalera y confirmar que se resalta.
4. Esperar un lanzamiento de Cristiano y confirmar que se nota el peligro.
5. Observar una pelota rodando y confirmar que el movimiento se lee.
6. Llegar a la meta y confirmar que la victoria se siente clara.
7. Revisar que ningun mensaje tape controles o zonas criticas.

## Criterio De Cierre V2.2

- El golpe se entiende sin texto externo.
- La escalera activa se percibe visualmente.
- El lanzamiento de pelota se anticipa mejor.
- La victoria tiene feedback visual claro.
- El rendimiento sigue fluido en mobile.

# QA V2 - Donkey Kong: Edicion Messi

Objetivo: validar que la v2 mobile-only tiene el nucleo tecnico necesario para avanzar a V2.1.

Estado: cerrada tecnicamente.

Nota: varios casos pasan a V2.1 como pruebas de balance fino. V2 cierra con motor, controles, pausa, pelotas desde arriba, respawn limpio y QA documentado.

## Entorno De Prueba

- URL local: `http://localhost:3000/donkey-messi`
- Orientacion: portrait
- Viewports sugeridos: `360x740`, `390x844`, `414x896`, `430x932`
- Navegadores: Chrome mobile o DevTools mobile; Safari iOS cuando se pueda probar en telefono real

## Smoke Test

1. Abrir la URL en viewport mobile.
2. Ver pantalla inicial con boton `Jugar`.
3. Tocar `Jugar`.
4. Confirmar que aparecen HUD, canvas, Messi, Cristiano, plataformas, escaleras y controles.
5. Mover izquierda/derecha con botones tactiles.
6. Saltar con `J`.
7. Subir y bajar una escalera con `^` y `v`.
8. Dejar que una pelota golpee a Messi.
9. Confirmar perdida de vida, respawn y limpieza de pelotas activas.
10. Completar el nivel llegando a la meta superior.

Resultado esperado: se puede jugar, morir, respawnear y ganar sin teclado ni mouse.

## Casos Funcionales

### QA-01 Inicio Mobile

- Paso: abrir el juego en portrait.
- Esperado: el juego ocupa el viewport sin scroll del body y sin elementos fuera de pantalla.

### QA-02 Controles Tactiles

- Paso: mantener izquierda/derecha y soltar.
- Esperado: Messi arranca, se mueve y se detiene sin input pegado.

### QA-03 Salto De Evasion

- Paso: intentar saltar desde una plataforma hacia la plataforma superior sin usar escalera.
- Esperado: Messi no alcanza la plataforma superior. El salto sirve para esquivar pelotas.

### QA-04 Escaleras Obligatorias

- Paso: ubicarse frente a una escalera y presionar `^` o `v`.
- Esperado: Messi se centra en la escalera, sube/baja y puede salir hacia la plataforma.

### QA-05 Pelotas Desde Arriba

- Paso: esperar al spawner de Cristiano.
- Esperado: las pelotas aparecen arriba, ruedan por plataformas y caen por bordes.

### QA-06 Limpieza De Pelotas En Fondo

- Paso: observar una pelota que llega a la plataforma inferior.
- Esperado: la pelota desaparece al tocar el fondo del nivel.

### QA-07 Respawn Justo

- Paso: recibir impacto.
- Esperado: Messi vuelve al spawn, pierde una vida y no quedan pelotas activas encima del respawn.

### QA-08 Game Over

- Paso: perder las 3 vidas.
- Esperado: aparece Game Over, controles quedan inactivos y `Reiniciar` empieza una partida limpia.

### QA-09 Victoria

- Paso: alcanzar la camiseta/meta superior.
- Esperado: aparece Level Complete, se suma bonus y los controles dejan de mover al jugador.

### QA-10 Pausa

- Paso: tocar `II` durante la partida.
- Esperado: el juego entra en pausa, no avanzan pelotas ni fisica, y se puede continuar o reiniciar.

### QA-11 HUD

- Paso: jugar durante 30 segundos y avanzar verticalmente.
- Esperado: vidas, puntos y maximo son legibles y no tapan zonas criticas.

### QA-12 Responsive

- Paso: cambiar entre viewports mobile sugeridos.
- Esperado: el canvas mantiene proporciones, los controles siguen accesibles y no se reinicia la partida por resize.

## Checklist Tecnico

- `npm run lint`
- `npm run typecheck`
- `npm run build`

## Criterio De Cierre V2

- El nivel puede terminarse en mobile usando solo tactil.
- El salto no rompe la progresion por escaleras.
- Las pelotas nacen desde arriba y no se acumulan en el fondo.
- El respawn no castiga con obstaculos persistentes.
- Pausa, reinicio, victoria y Game Over no duplican loops ni inputs.
- El HUD y los controles no bloquean lectura del nivel.

## Resultado De Cierre

- Estado tecnico: aprobado.
- Estado de balance: pasa a V2.1.
- Estado visual: pasa a V2.2 / V2.6.
- Estado de controles finos: pasa a V2.3 si QA detecta incomodidad.

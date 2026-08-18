# QA V2.3 - Control Mobile Pulido

Objetivo: mejorar ergonomia tactil y limpiar el feedback de escalera sin sumar mecanicas nuevas.

## Cambios

- La escalera activa ya no muestra aura rectangular.
- La escalera activa se marca solo en sus largueros y escalones.
- Los botones de subir/bajar quedan ocultos e inactivos cuando Messi no puede usar escalera.
- Los botones tactiles tienen estado presionado mas visible.
- Los botones tactiles son levemente mas grandes.
- La franja inferior de controles es un poco menos invasiva.
- Se intenta vibracion corta en acciones tactiles cuando el navegador lo permite.
- Se mantiene captura de pointer para multitouch.

## QA Automatico

Comando:

```bash
npm run qa:v2.3
```

Valida:

- Que no exista aura rectangular de escalera.
- Que la escalera activa se siga marcando.
- Que subir/bajar sean contextuales.
- Que controles ocultos no intercepten toques.
- Que exista estado visual de boton presionado.
- Que la vibracion mobile se invoque de forma segura.
- Que los botones mantengan pointer capture.

## QA Manual

1. Acercarse a una escalera y confirmar que solo se iluminan sus partes, sin aura de fondo.
2. Alejarse de escaleras y confirmar que subir/bajar desaparecen.
3. Mantener izquierda/derecha y saltar con otro dedo.
4. Probar subir/bajar escalera sin mirar demasiado los botones.
5. Confirmar que los botones no tapan rutas importantes del Nivel 1.
6. Revisar en telefono real si la vibracion se siente bien o si conviene quitarla.

## Criterio De Cierre V2.3

- Se puede jugar con dos pulgares sin mirar controles todo el tiempo.
- Saltar y moverse a la vez se siente confiable.
- Subir y bajar escaleras no requiere precision excesiva.
- La escalera activa no ensucia visualmente el nivel.

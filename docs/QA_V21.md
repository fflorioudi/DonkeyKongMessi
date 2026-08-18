# QA V2.1 - Balance Fino

Objetivo: cerrar una version jugable mas justa del Nivel 1 sin agregar mecanicas grandes.

## Cambios De Balance

- Salto reducido para que no pueda reemplazar a las escaleras.
- Velocidad horizontal suavizada para mejorar control tactil.
- Velocidad de escalera reducida para evitar pasarse de plataforma.
- Tolerancia de entrada a escaleras ampliada.
- Pelotas mas lentas.
- Spawner de pelotas menos agresivo.
- Maximo de pelotas activas reducido.
- Respawn con gracia breve y parpadeo visual.
- Zona inferior del nivel reservada para controles.
- Controles multitouch mas robustos.

## QA Automatico

Comando:

```bash
npm run qa:v2.1
```

Valida:

- La altura del salto no alcanza para reemplazar escaleras.
- El salto sigue alcanzando para esquivar pelotas.
- La plataforma inferior no invade la zona de controles.
- El primer lanzamiento de pelota deja tiempo de reaccion.
- La frecuencia de pelotas es legible para V2.1.
- La cantidad de pelotas activas esta limitada.
- La velocidad horizontal esta en rango arcade controlable.
- Subir escaleras es mas lento que correr.

## QA Manual Recomendado

1. Completar el nivel 3 veces seguidas en mobile.
2. Confirmar que no se puede subir de plataforma solo saltando.
3. Confirmar que el salto permite esquivar una pelota.
4. Morir en distintas plataformas y revisar que el respawn no mate inmediatamente.
5. Mantener izquierda + salto y derecha + salto para revisar multitouch.
6. Subir y bajar cada escalera sin tener que alinear perfecto.
7. Pausar durante una pelota en movimiento y confirmar que todo queda congelado.
8. Reiniciar desde pausa, Game Over y victoria.

## Criterio De Cierre V2.1

- QA automatico aprobado.
- Build productivo aprobado.
- Controles tactiles no quedan pegados.
- Respawn limpio y justo.
- Ritmo de pelotas legible.
- El nivel conserva el recorrido por escaleras.

## Estado

Estado tecnico: cerrado.

Estado de playtest manual: pendiente de prueba en telefono real.

# README - Jugabilidad Pendiente

Este documento enumera lo que falta hacer para que el juego pase de tutorial vertical a campana completa de cinco niveles.

## Estado Actual

Ya existe:

- Tutorial vertical con camara.
- Movimiento, salto y escaleras.
- Pelotas con frecuencia variable.
- Tarjeta roja como obstaculo generico.
- Respawn limpio.
- Audio basico.
- Scoring, high score y mejor tiempo local.
- Portada con prologo y camino de cinco niveles.

## Prioridad Alta

### 1. Cierre Fino Del Tutorial

- Balancear largo total del tutorial.
- Ajustar frecuencia real de pelotas en mobile.
- Verificar que la camara no tape lectura de obstaculos.
- Revisar si la meta del tutorial debe ser completar o solo entrenar.
- Agregar checkpoint opcional a mitad de mapa si el tutorial crece mas.

### 2. Sistema De Campana

- Diferenciar `Tutorial` de `Nivel 1` en datos.
- Crear estado de desbloqueo de niveles.
- Selector de niveles real.
- Persistencia por nivel: completado, mejor score, mejor tiempo.
- UI de nivel bloqueado/desbloqueado.

### 3. Power-Ups

- `PowerUpDefinition` creado para pickups declarados por nivel.
- Spawn data-driven por nivel.
- Primer power-up implementado: Botin de Oro.
- Efecto actual: invencibilidad temporal con contador en HUD.
- Pickup con sprite propio y sonido de activacion.
- Pendiente: balancear duracion, frecuencia y posicion por nivel.
- Pendiente: definir power-ups futuros como vida extra, gambeta o limpieza de obstaculos.

### 4. Companeros / Rescates

- Crear `RescueDefinition`.
- NPC con sprite propio.
- Trigger de rescate.
- Bonus de puntaje.
- Resumen en victoria.
- Persistencia local por nivel.
- Primer rescate recomendado: companero en ruta alternativa.

## Prioridad Media

### 5. Mas Tipos De Obstaculos

- Pelota con fuego.
- Pelota con curva.
- Red que frena o empuja.
- Hazard fijo con pinches.
- Barrida horizontal.
- Obstaculo con telegraph antes de salir.

### 6. Sistema De Dificultad Por Nivel

- Tabla por nivel: vidas, tiempo par, bonus, velocidad de obstaculos.
- Rango de spawn por obstaculo.
- Cantidad maxima activa por tipo.
- Rutas principales y alternativas.
- Dificultad por altura del mapa.

### 7. Checkpoints Y Respawn

- Checkpoint por plataforma o por altura.
- Respawn en ultimo checkpoint limpio.
- Limpieza de obstaculos cercanos al respawn.
- Invulnerabilidad corta con feedback.
- Evitar respawn sobre escalera o hazard.

### 8. Camara Avanzada

- Ajustar lookahead vertical al subir.
- Evitar que una caida brusca sea confusa.
- Revisar si la camara debe bajar con Messi o esperar.
- Soporte para niveles mas altos que el tutorial.
- Marcas visuales de progreso en mapa largo.

## Prioridad Baja Pero Importante

### 9. Pulido De Controles

- Probar multitouch en Android y iOS.
- Ajustar tamano y posicion de botones.
- Revisar sensibilidad de escaleras.
- Mejorar boton de salto si tapa accion en plataformas bajas.
- Agregar pausa/resume sin input pegado.

### 10. Feedback Y Juice

- Animacion al agarrar power-up.
- Particulas pixel art simples.
- Golpe con pausa breve o flash controlado.
- Sonido distinto por obstaculo.
- Musica corta o loop ambiente.
- Celebracion al terminar nivel.

### 11. Pantallas De Fin

- Victoria de tutorial.
- Victoria de nivel.
- Victoria final de campana.
- Resumen de rescates.
- Resumen de power-ups usados.
- Boton siguiente nivel.

### 12. QA Y Herramientas

- QA automatico por cada version.
- QA visual de spritesheets.
- QA mobile manual documentado.
- Script para validar que no haya rectangulos visibles nuevos.
- Script para validar metadata de todos los sprites.
- Checklist previo a push.

## Orden Recomendado

1. Cerrar V3.2.x con tutorial, portada y prologo.
2. V3.3: power-up basico con Botin de Oro.
3. V3.4: separar Tutorial y Nivel 1 real.
4. V3.5: selector/desbloqueo de campana.
5. V3.6: companero/rescate.
6. V3.7: Nivel 1 completo.
7. V3.8: candidate de Fase 2.

## No Hacer Todavia

- Ranking online.
- Login.
- Editor de niveles.
- Cinco niveles completos de golpe.
- Boss final complejo antes de cerrar power-ups y rescates.
- Reemplazar sprites jugables estables con recortes no validados.

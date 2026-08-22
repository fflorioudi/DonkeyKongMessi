# Roadmap Fase 2 - V3

Este documento define la Fase 2 del proyecto. La base V2.9 ya deja un Nivel 1 estable, mobile-only, con sprites, audio, scoring, persistencia y arquitectura preparada para multiples niveles.

Fase 2 empieza oficialmente con V3.

## Objetivo General

Convertir el prototipo estable de una pantalla en un juego con contenido expandible.

La meta no es hacer los cinco niveles de golpe. La meta es construir el sistema que permita sumar niveles, obstaculos, power-ups y rescates sin duplicar logica ni romper el Nivel 1.

## Regla Principal

Cada version V3 debe mantener:

- mobile-only;
- portrait;
- controles tactiles como experiencia principal;
- Nivel 1 funcionando;
- QA automatico de V2 completo en verde;
- build productivo correcto.

Si una mejora nueva rompe legibilidad, input tactil o performance mobile, se ajusta antes de seguir agregando contenido.

## Base De Entrada

Fase 2 arranca desde V2.9 candidate:

- Nivel 1: Rosario / Origen.
- Motor Canvas 2D separado de React.
- Spritesheets PNG HD para Messi, Cristiano, pelota, Copa, plataformas, escaleras y hazards.
- Audio basico con fallback `.wav`.
- Scoring con high score y mejor tiempo local.
- Selector de nivel preparado.
- `LevelDefinition` data-driven con dificultad, fondo, rival, plataformas, escaleras, spawner y meta.

## Principios De Fase 2

- Primero sistemas, despues contenido masivo.
- Cada mecanica nueva debe tener QA propio.
- Cada obstaculo debe ser legible en pantalla chica.
- Cada elemento jugable visible debe tener sprite pixel art propio; no usar rectangulos de canvas como arte final ni placeholder visible.
- Cada nivel debe poder balancearse desde datos.
- No agregar arte final si la mecanica todavia esta cambiando.
- No agregar ranking online, base de datos ni autenticacion en esta fase.

## Versiones V3

## V3.0 - Sistema Generico De Obstaculos

Objetivo: reemplazar la pelota unica por una arquitectura de obstaculos extensible.

Estado: cerrada tecnicamente.

Alcance:

- Crear un modelo de obstaculo por datos.
- Mantener la pelota actual como primer tipo compatible.
- Separar spawners de obstaculos de la logica especifica de pelota.
- Permitir multiples spawners por nivel.
- Preparar tipos futuros: pelota, tarjeta roja, botin, guante, hazard fijo.

Entregables:

- `ObstacleDefinition` y `ObstacleSpawnerDefinition`.
- Entidad o modulo comun para actualizar/dibujar obstaculos.
- Compatibilidad completa con el Nivel 1 actual.
- QA automatico `npm run qa:v3.0`.
- Documento `docs/QA_V30.md`.

Criterio de cierre:

- Nivel 1 se juega igual o mejor que en V2.9.
- Crear un nuevo obstaculo no exige tocar el loop principal.
- Las pelotas siguen desapareciendo al tocar el fondo.

## V3.1 - Obstaculo Tarjeta Roja

Objetivo: sumar el primer obstaculo nuevo sin crear un nivel nuevo todavia.

Estado: cerrada tecnicamente.

Alcance:

- Tarjeta roja horizontal o diagonal.
- Movimiento simple, claro y justo.
- Hitbox rectangular reducida.
- Aparicion controlada desde spawner.
- Primer uso opcional en una variante interna del Nivel 1 o en Nivel 2.

Entregables:

- Sprite pixel art propio desde PNG.
- Tipo `red-card`.
- QA automatico `npm run qa:v3.1`.
- Ajuste de audio corto si aplica.

Criterio de cierre:

- La tarjeta se distingue de la pelota.
- No genera muertes invisibles o injustas.
- Puede activarse/desactivarse desde datos.

## V3.2 - Camara Vertical Y Mundo Alto

Objetivo: convertir el tutorial en banco de pruebas para niveles mas largos sin achicar medidas.

Estado: en cierre tecnico.

Alcance:

- Separar `worldHeight` de `viewportHeight`.
- Mantener canvas mobile fijo de 390 x 720.
- Agregar camara vertical suavizada siguiendo a Messi.
- Extender el tutorial con mas plataformas y escaleras.
- Mantener controles tactiles fijos fuera del render del mundo.
- Preparar la misma logica para niveles futuros.

Entregables:

- `CameraDefinition`.
- `viewportWidth` y `viewportHeight` en `LevelDefinition`.
- Ruta tutorial extendida.
- QA automatico `npm run qa:v3.2`.
- Documento `docs/QA_V32.md`.

Criterio de cierre:

- Messi no cambia de escala.
- La camara no muestra fuera del mapa.
- El respawn vuelve a una vista limpia.
- El tutorial funciona como base para mundos verticales.

### V3.2.1 - Frecuencia Variable De Pelotas

Objetivo: cambiar el ritmo fijo de pelotas por un rango de aparicion mas organico.

Estado: en cierre tecnico.

Alcance:

- Agregar `spawnDelayMs` opcional a `ObstacleSpawnerDefinition`.
- Pelotas con delay inicial y rango aleatorio para los siguientes lanzamientos.
- Mantener `maxActive` como seguro tecnico, no como ritmo principal.
- Conservar fallback a `interval` para spawners simples.

Criterio de cierre:

- La primera pelota mantiene lectura clara.
- Las siguientes salen entre `2200 ms` y `4200 ms`.
- No se acumulan pelotas infinitas.
- V3.2 de camara vertical sigue estable.

### V3.2.2 - Fix Direccion Pegada

Objetivo: corregir el caso donde el boton tactil de izquierda/derecha queda presionado logicamente despues de soltar.

Estado: en cierre tecnico.

Alcance:

- Detectar `pointerup` y `pointercancel` globales.
- Resetear input al perder foco o cambiar visibilidad.
- Manejar perdida de captura del puntero en cada boton.
- Mantener soporte multitouch para movimiento, escalera y salto.

Criterio de cierre:

- Messi se detiene al soltar izquierda o derecha.
- Arrastrar el dedo fuera del boton no deja direccion activa.
- Pausa, menu o cambio de app limpian input.

### V3.2.3 - Portada Y Prologo De Historia

Objetivo: activar la portada nueva y separar narrativamente el tutorial de los cinco niveles futuros.

Estado: en cierre tecnico.

Alcance:

- Usar la portada externa como menu principal.
- Superponer hotspots reales sobre `Jugar`, `Entrenar` y `Audio`.
- Evitar titulo y botones duplicados encima del arte.
- Presentar el mapa actual como `Tutorial`.
- Dejar planteado el camino: Tutorial + Nivel 1 a Nivel 5.

Criterio de cierre:

- Portada clickeable y limpia.
- El tutorial queda entendido como prologo.
- La historia tiene una direccion clara antes de crear Nivel 1 real.

### V3.2.4 - Portada Limpia Y Plan De Assets

Objetivo: liberar la portada de controles jugables, mantener sprites propios y documentar proporciones para assets futuros.

Estado: en cierre tecnico.

Alcance:

- Preservar la hoja fuente solo como referencia.
- Descartar recortes externos de la UI principal.
- Renderizar controles jugables solo durante partida.
- Documentar proporciones para fondos, sprites, power-ups, companeros y portadas.
- Crear README de disenos pendientes por nivel.
- Crear README de jugabilidad pendiente.

Criterio de cierre:

- La portada no queda bloqueada por controles jugables.
- La jugabilidad estable no cambia.
- Los proximos assets y sistemas quedan planificados.

## V3.3 - Power-Up Basico

Objetivo: agregar una ventaja simple que cambie decisiones sin complicar controles.

Power-up recomendado para empezar: `Botin de Oro`.

Alcance:

- Pickup con sprite pixel art propio.
- Estado temporal de poder.
- Messi puede destruir o ignorar obstaculos por pocos segundos.
- Feedback visual y sonoro.
- Duracion definida por datos.

Entregables:

- `PowerUpDefinition`.
- Estado de power-up en snapshot/HUD si hace falta.
- QA automatico `npm run qa:v3.3`.
- Documento `docs/QA_V33.md`.

Criterio de cierre:

- El power-up se entiende sin texto largo.
- No rompe el balance del Nivel 1.
- El efecto termina claramente.

## V3.4 - Nivel 2: Barcelona / Ascenso

Objetivo: crear el primer nivel nuevo usando la arquitectura de V2.8/V3.0.

Alcance:

- Nuevo objeto en `data/levels.ts`.
- Plataformas con rutas alternativas.
- Dificultad un poco mayor.
- Uso controlado de tarjeta roja o power-up si ya estan cerrados.
- Fondo y paleta propios.
- Selector de nivel con flechas activas.

Entregables:

- Nivel 2 jugable de punta a punta.
- Records separados por nivel.
- QA automatico `npm run qa:v3.4`.
- Documento `docs/QA_V34.md`.

Criterio de cierre:

- El Nivel 2 se crea principalmente desde datos.
- El Nivel 1 no cambia de comportamiento.
- El selector permite navegar entre Nivel 1 y Nivel 2.

## V3.5 - Rescate Opcional Simple

Objetivo: sumar una meta secundaria sin crear complejidad narrativa.

Rescate recomendado para empezar: Di Maria.

Alcance:

- NPC/companero ubicado en el nivel.
- Trigger de rescate.
- Bonus de puntos o marca visual.
- Persistencia local opcional por nivel.
- Resumen en pantalla de victoria.

Entregables:

- `RescueDefinition`.
- Sprite pixel art propio del personaje.
- QA automatico `npm run qa:v3.5`.
- Documento `docs/QA_V35.md`.

Criterio de cierre:

- El rescate no es obligatorio para completar.
- Se entiende si fue logrado o no.
- No tapa rutas ni controles.

## V3.6 - Mejoras De Animacion Y Feedback

Objetivo: mejorar sensacion de juego despues de sumar nuevas mecanicas.

Alcance:

- Ajustar animaciones de Messi segun power-up, hit y victoria.
- Ajustar velocidad de animacion de Cristiano.
- Mejor feedback de colision y destruccion de obstaculos.
- Pulir transiciones de menu, pausa y victoria si hace falta.

Entregables:

- QA visual `docs/QA_V36.md`.
- Ajustes de metadata de sprites si corresponde.
- Captura comparativa opcional.

Criterio de cierre:

- El juego se siente mas claro, no mas cargado.
- No baja performance mobile.

## V3.7 - Candidate Fase 2

Objetivo: cerrar Fase 2 con dos niveles, obstaculos extensibles y al menos una mecanica nueva.

Alcance:

- QA completo de V2 y V3.
- Build productivo.
- Playtest mobile.
- Balance de Nivel 1 y Nivel 2.
- Actualizacion de README y roadmap.

Entregables:

- `npm run qa:v3.7`.
- Documento `docs/QA_V37.md`.
- Candidate build Fase 2.

Criterio de cierre:

- Nivel 1 y Nivel 2 son completables.
- Hay al menos dos tipos de obstaculo.
- Hay al menos un power-up o rescate funcional.
- La arquitectura queda lista para Nivel 3.

## Orden Recomendado

1. V3.0: sistema generico de obstaculos.
2. V3.1: tarjeta roja.
3. V3.2: camara vertical y mundo alto.
4. V3.3: power-up basico.
5. V3.4: Nivel 2.
6. V3.5: rescate opcional.
7. V3.6: feedback y animaciones.
8. V3.7: candidate Fase 2.

## No Hacer Todavia

- No crear los cinco niveles juntos.
- No meter ranking online.
- No agregar autenticacion.
- No crear editor de niveles.
- No redisenar todos los sprites finales antes de cerrar mecanicas.
- No agregar mecanicas que exijan botones nuevos permanentes.

## Primer Paso Concreto

Empezar V3.0.

La primera tarea tecnica es refactorizar la pelota actual para que sea un obstaculo dentro de un sistema generico, manteniendo el comportamiento exacto del Nivel 1.

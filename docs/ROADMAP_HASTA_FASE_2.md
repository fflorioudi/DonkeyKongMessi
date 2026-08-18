# Roadmap Hasta Fase 2

Este documento define las versiones necesarias para cerrar una v1/v2 solida y llegar ordenadamente a Fase 2.

La regla principal sigue siendo mobile-only: cada version debe probarse en portrait y con controles tactiles.

## Estado Actual

### V1 - Prototipo Jugable

Estado: completada.

Incluye:

- Proyecto Next.js + TypeScript.
- Canvas 2D mobile portrait.
- Motor separado de React.
- Nivel 1 con plataformas, escaleras, pelota enemiga, vidas, meta y reinicio.
- Controles tactiles iniciales.

### V2 - Gameplay Base Ajustado

Estado: cerrada tecnicamente.

Incluye:

- Salto ajustado para que no reemplace a las escaleras.
- Pelotas generadas desde Cristiano en la parte superior.
- Pelotas con gravedad, caida por bordes y limpieza al tocar fondo.
- Respawn limpio.
- HUD con puntaje y maximo local.
- Pausa mobile.
- QA documentado en `docs/QA_V2.md`.

Nota de cierre: V2 no significa que el juego ya este balanceado o presentable. Significa que el nucleo tecnico mobile ya existe y que la siguiente version puede concentrarse en probar, ajustar y mejorar sensacion de juego.

### V2.1 - QA Y Balance Fino

Estado: cerrada tecnicamente.

Foco inmediato:

- Probar el nivel varias veces en mobile.
- Detectar donde se siente injusto, incomodo o lento.
- Ajustar parametros sin agregar mecanicas nuevas.
- Cerrar una version que ya se pueda jugar de punta a punta con confianza.

Entregables:

- Balance de salto, movimiento, escaleras y pelotas.
- Respawn con breve gracia de seguridad.
- Controles multitouch mas robustos.
- QA automatico en `npm run qa:v2.1`.
- QA de balance documentado en `docs/QA_V21.md`.

## Versiones Recomendadas Antes De Fase 2

## V2.1 - QA Y Balance Fino

Objetivo: confirmar que el nivel se puede terminar y que las muertes se sienten justas.

Alcance:

- Probar todos los casos de `docs/QA_V2.md`.
- Ajustar velocidad de Messi.
- Ajustar salto.
- Ajustar frecuencia de pelotas.
- Ajustar posicion de escaleras y plataformas.
- Revisar que los botones no tapen rutas importantes.

Criterio de cierre:

- El nivel puede completarse 3 veces seguidas en mobile.
- El salto no permite subir de plataforma sin escalera.
- Ningun respawn genera muerte inmediata.
- Los controles no quedan pegados.

Nota: la parte tecnica queda cerrada. La confirmacion de "3 veces seguidas en mobile" queda como playtest manual de telefono real.

## V2.2 - Feedback Visual

Objetivo: que el jugador entienda mejor lo que pasa sin agregar mecanicas nuevas.

Estado: cerrada tecnicamente.

Alcance:

- Parpadeo breve de Messi tras recibir impacto.
- Pequena animacion o flash al perder vida.
- Indicador visual cuando Messi puede usar escalera.
- Efecto simple al tocar la meta.
- Mejor diferenciacion entre pelota, jugador, rival y objetivo.

Entregables:

- Flash de impacto y texto flotante de vida.
- Proteccion de respawn visible.
- Escalera activa resaltada.
- Cue visual de lanzamiento de pelota.
- Pelota con rotacion.
- Pulso de meta y celebracion de victoria.
- QA automatico en `npm run qa:v2.2`.
- QA documentado en `docs/QA_V22.md`.

Criterio de cierre:

- El golpe se entiende sin leer texto.
- La escalera activa se percibe visualmente.
- La victoria se siente clara.

## V2.3 - Control Mobile Pulido

Objetivo: mejorar ergonomia tactil antes de sumar contenido.

Estado: cerrada tecnicamente.

Alcance:

- Revisar tamano y ubicacion de botones.
- Mejorar soporte multitouch.
- Evaluar si subir/bajar debe aparecer solo cerca de escaleras.
- Evitar que un dedo tape a Messi en zonas criticas.
- Agregar zonas tactiles invisibles mas comodas si hace falta.

Entregables:

- Escalera activa sin aura rectangular.
- Botones de subir/bajar contextuales.
- Botones tactiles mas grandes y con estado presionado.
- Franja inferior menos invasiva.
- Vibracion tactil corta cuando el navegador lo permite.
- QA automatico en `npm run qa:v2.3`.
- QA documentado en `docs/QA_V23.md`.

Criterio de cierre:

- Se puede jugar con dos pulgares sin mirar los botones todo el tiempo.
- Saltar y moverse a la vez se siente confiable.
- Subir y bajar escaleras no requiere precision excesiva.

## V2.4 - Pantallas Y Flujo

Objetivo: hacer que el juego se sienta como una experiencia completa aunque tenga un solo nivel.

Estado: cerrada tecnicamente.

Alcance:

- Mejorar portada.
- Mejorar Game Over.
- Mejorar Level Complete.
- Mostrar resumen de puntos.
- Agregar boton para volver al inicio.
- Agregar texto minimo de "Como jugar" en pantalla separada o modal.

Entregables:

- Asset `public/assets/cover-v24.png` generado con ImageGen built-in.
- Menu principal con portada.
- Pantalla `Entrenar`.
- Salida a inicio desde pausa, Game Over y Victory.
- Resumen de puntos en pantallas finales.
- QA automatico en `npm run qa:v2.4`.
- QA documentado en `docs/QA_V24.md`.

Criterio de cierre:

- Un jugador nuevo entiende como empezar.
- Perder y reiniciar es inmediato.
- Ganar deja claro que el nivel termino.

## V2.5 - Audio Basico

Objetivo: sumar respuesta sensorial sin depender de assets externos con derechos.

Estado: cerrada tecnicamente.

Alcance:

- Sonido de salto.
- Sonido de golpe.
- Sonido de pelota lanzada.
- Sonido de victoria.
- Toggle simple de sonido.
- Audio generado por Web Audio o assets propios.

Entregables:

- Audio sintetico con Web Audio.
- Fallback con archivos `.wav` propios para mobile.
- Sonidos de inicio, salto, golpe, lanzamiento, Game Over, victoria y UI.
- Toggle de sonido con persistencia local.
- QA automatico en `npm run qa:v2.5`.
- QA documentado en `docs/QA_V25.md`.

Criterio de cierre:

- El audio no bloquea el primer input mobile.
- Los sonidos son cortos y no molestan.
- El juego puede mutearse.

## V2.6 - Arte Placeholder Mejorado

Objetivo: pasar de rectangulos funcionales a una identidad visual propia, sin hacer aun arte final.

Estado: cerrada tecnicamente.

Alcance:

- Messi placeholder mas reconocible.
- Cristiano placeholder mas reconocible.
- Pelota mas legible.
- Plataformas con estilo futbolero simple.
- Fondo de Rosario mas claro.
- Meta superior mas identificable como camiseta o trofeo.

Entregables:

- Spritesheets PNG separados para Messi, Cristiano, pelota, Copa, plataformas, escalera y hazards.
- Metadata en `public/sprites/sprites.json`.
- Pipeline HD en `scripts/extract-hd-sprite-assets.py`.
- Render con `SpriteManager`.
- QA automatico en `npm run qa:v2.6`.
- QA documentado en `docs/QA_V26.md`.

Criterio de cierre:

- En una captura se entiende que es un arcade futbolero.
- Los elementos jugables se distinguen al instante.
- El arte no reduce legibilidad ni rendimiento.

## V2.7 - Persistencia Y Rejugabilidad Minima

Objetivo: darle motivo para repetir el nivel antes de crear nuevos escenarios.

Estado: cerrada tecnicamente.

Alcance:

- High score persistente.
- Mejor calculo de puntos.
- Bonus por terminar con vidas restantes.
- Bonus por tiempo.
- Mejor tiempo local persistente.
- Resumen al completar nivel.

Entregables:

- Cronometro en HUD.
- Desglose de puntos: progreso, meta, vidas y tiempo.
- Badges de nuevo maximo y nuevo mejor tiempo.
- Records persistidos en `localStorage`.
- Resumen de victoria y marcas en Game Over.
- QA automatico en `npm run qa:v2.7`.
- QA documentado en `docs/QA_V27.md`.

Criterio de cierre:

- Completar mas rapido o con mas vidas mejora el resultado.
- El jugador puede intentar superar su marca.
- El resumen explica el puntaje sin agregar friccion.

## V2.8 - Preparacion Para Multiples Niveles

Objetivo: dejar el motor preparado para Fase 2 sin duplicar codigo.

Estado: en cierre tecnico.

Alcance:

- Revisar `LevelDefinition`.
- Separar configuracion de dificultad.
- Permitir cargar otro nivel por indice.
- Preparar selector interno simple, aunque solo haya un nivel visible.
- Asegurar que spawners, plataformas, escaleras, rival, fondo y metas sean data-driven.

Entregables:

- Catalogo de niveles recibido por `Game`.
- Metodo `selectLevel(index)` disponible desde menu.
- `difficulty`, `background` y `rival` dentro de cada nivel.
- Records locales separados por nivel.
- Selector compacto de nivel en portada.
- QA automatico en `npm run qa:v2.8`.
- QA documentado en `docs/QA_V28.md`.

Criterio de cierre:

- Crear un segundo nivel requiere tocar principalmente `data/levels.ts`.
- El motor no tiene valores hardcodeados del Nivel 1 salvo dimensiones globales.
- El selector puede cambiar de nivel sin reiniciar listeners ni loops.

## V2.9 - Candidate Build

Objetivo: cerrar la etapa pre-Fase 2 con una version estable y presentable.

Alcance:

- Ejecutar QA completo.
- Corregir bugs encontrados.
- Revisar performance mobile.
- Revisar legibilidad en pantallas chicas.
- Limpiar archivos temporales.
- Actualizar README y roadmap.

Criterio de cierre:

- Build productivo correcto.
- QA manual aprobado.
- Nivel 1 divertido y repetible.
- Base tecnica lista para contenido nuevo.

## Entrada A Fase 2

Fase 2 empieza cuando el Nivel 1 ya funciona como juego completo de una pantalla.

La Fase 2 deberia incluir:

- Sistema generico de obstaculos.
- Primer power-up.
- Mejoras de animacion.
- Nivel 2 basado en datos.
- Selector de nivel.
- Primer rescate opcional.
- Mas identidad visual y sonora.

## Orden Sugerido

1. Cerrar V2.1 con QA y balance.
2. Hacer V2.2 y V2.3 juntas si los controles siguen incomodos.
3. Hacer V2.4 para que el flujo sea presentable.
4. Hacer V2.5 solo despues de que el gameplay este firme.
5. Hacer V2.6 para mejorar identidad.
6. Hacer V2.7 y V2.8 como preparacion directa para Fase 2.
7. Hacer V2.9 como candidate build.

## No Hacer Antes De Fase 2

- Crear cinco niveles.
- Agregar base de datos.
- Agregar ranking online.
- Agregar personajes complejos.
- Agregar editor de niveles.
- Meter arte final si el gameplay todavia cambia.
- Optimizar prematuramente cosas que no son problema en mobile.

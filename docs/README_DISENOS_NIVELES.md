# README - Disenos Pendientes Por Nivel

Este documento define que assets faltan crear para que la campana avance desde el tutorial actual hasta cinco niveles completos.

## Regla Base

- Todo elemento jugable visible debe tener sprite pixel art propio.
- No usar rectangulos de canvas como placeholder visible.
- Cada nivel necesita identidad visual, rival, fondo, plataformas, hazards, power-up y companero/rescate cuando aplique.
- Las portadas y key art pueden venir generadas externamente, pero deben integrarse con hotspots o UI real.
- Los sprites finales deben venir separados por archivo o spritesheet claro, con metadata en `public/sprites/sprites.json`.
- Los sprites jugables actuales se mantienen como base. No reemplazar por recortes sueltos sin validar grilla, pivote e hitbox.

## Instrucciones Para Pedir Assets A ChatGPT

Copiar esta regla en cada pedido:

```text
Generar los assets separados, no mezclar personajes, plataformas, fondo, rivales, power-ups, companeros ni obstaculos en una sola imagen.
Cada elemento jugable debe venir con fondo transparente PNG.
Si es spritesheet, usar celdas uniformes, una fila horizontal, frames completos dentro de cada celda y margen interno para que ningun frame invada al siguiente.
No agregar sombras cortadas, textos, botones ni UI dentro de sprites jugables.
Los fondos deben venir sin personajes, sin plataformas jugables, sin botones y sin obstaculos, porque despues se montan por separado en el motor.
Las portadas pueden tener texto y botones visuales, pero deben respetar zona segura inferior y no incluir controles jugables.
```

## Proporciones Base Del Juego

- Viewport logico mobile: `390x720`.
- Mundo tutorial actual: `390x1160`.
- Relacion de portada recomendada: `9:16`, por ejemplo `1080x1920`.
- Zona segura de portada: dejar libres `96 px` arriba y `180 px` abajo en un lienzo `1080x1920`.
- Los botones visuales de portada deben quedar por encima del borde inferior y lejos de donde aparecen controles jugables en partida.
- Fondo vertical de nivel: generar minimo `780x2320` para escala 2x del tutorial; preferible `1170x3480` para 3x.
- Fondos de niveles futuros: mantener ancho equivalente a `390` logicos y alto entre `1160` y `1600` logicos segun el largo del nivel.

## Proporciones De Sprites

Usar estas celdas para mantener compatibilidad con el motor actual:

| Asset | Celda por frame | Frames recomendados | Fondo | Nota |
| --- | ---: | ---: | --- | --- |
| Messi | `280x360` | 8 | Transparente | idle, run, jump, climb, hit, victory |
| Rival principal | `280x360` | 8 | Transparente | idle, taunt, throw, hit |
| Pelota | `128x128` | 8 | Transparente | giro completo, centrada |
| Copa | `180x240` | 12 | Transparente | brillo suave, base alineada |
| Plataforma | `320x150` | 1 por color/variante | Transparente | top jugable visible y base decorativa |
| Escalera | `140x240` | 2 | Transparente | normal y activa, sin aura externa |
| Hazard fijo | `300x160` | 1 a 4 | Transparente | pinches/red/trampa, hitbox legible |
| Tarjeta roja | `160x120` | 8 | Transparente | icono centrado, sin cuadrado plano |
| Power-up | `160x160` | 4 a 8 | Transparente | brillo dentro de celda |
| Companero | `220x300` | 4 a 8 | Transparente | idle, rescue, celebrate |
| UI icono | `192x192` | 1 | Transparente | selector, estado, recompensa |

## Entrega Ideal Por Nivel

Cada nivel debe venir en archivos separados:

- `level-N-background.png`: fondo vertical completo, sin jugabilidad encima.
- `level-N-platforms.png`: spritesheet de plataformas, celdas `320x150`.
- `level-N-rival.png`: spritesheet rival, celdas `280x360`.
- `level-N-obstacles.png`: spritesheet obstaculos, celdas documentadas.
- `level-N-powerups.png`: spritesheet power-ups, celdas `160x160`.
- `level-N-companions.png`: spritesheet companeros, celdas `220x300`.
- `level-N-cover.png`: portada o card del nivel, `1080x1920`.
- `level-N-preview.png`: imagen compuesta solo de referencia, no se usa para recortar gameplay.

## Material Externo Recibido

Fuente guardada como referencia:

- `public/sprites/source/chatgpt-story-sheet-20260821-230304.png`

Recortes descartados para UI/gameplay en V3.2.4:

- `public/assets/story/story-icon-tutorial-messi.png`
- `public/assets/story/story-icon-level1-platform.png`
- `public/assets/story/story-icon-level2-fireball.png`
- `public/assets/story/story-icon-level3-netball.png`
- `public/assets/story/story-icon-level4-hazard.png`
- `public/assets/story/story-icon-level5-cup.png`
- `public/assets/story/story-icons-preview.png`

Decision actual: no usarlos en UI ni gameplay. Nos quedamos con los sprites propios ya validados. Estos recortes quedan solo como referencia historica y no deben reemplazar assets jugables ni piezas de la portada actual.

## Tutorial - Rosario / Primer Ascenso

Estado actual: jugable.

Falta crear o pulir:

- Fondo final de barrio vertical extendido, compatible con camara.
- Variantes de plataformas tutorial con menos ruido visual.
- Pequenos carteles o elementos ambientales de Rosario.
- Feedback visual de inicio de tutorial.
- Mini portada secundaria o placa de prologo.
- Sprite de companero opcional para explicar rescates mas adelante.

## Nivel 1 - Barcelona / Nace El 10

Rol narrativo: primer nivel real despues del tutorial.

Faltan disenos:

- Fondo: ciudad/estadio europeo de noche, mas limpio que Rosario.
- Historia: Messi del barca cruza su primer escenario grande mientras la Copa queda mas lejos.
- Plataformas: metal azul/grana, cesped corto, soportes mas europeos.
- Rival: Cristiano version manchester united .
- Obstaculos: pelotas mas rapidas, tarjeta roja con patron simple.
- Power-up: Botin de Oro, primer power-up oficial.
- Companero: Ronaldinho inspirado, como rescate/tutorial de bonus.
- Portada de nivel: mini card vertical para selector futuro.

## Nivel 2 - Europa / Noches Grandes

Rol narrativo: dificultad intermedia, mas ritmo y lectura de patrones.

Faltan disenos:

- Fondo: estadio grande con luces frias y tribunas altas.
- Historia: noches decisivas, la escalada empieza a sentirse internacional.
- Plataformas: azul electrico, acero oscuro, zonas moviles futuras.
- Rival: arquero o defensor pesado.
- Obstaculos: pelota con fuego, pelota con curva, tarjeta roja mas frecuente.
- Power-up: Escudo o Gambeta corta para atravesar peligro por segundos.
- Companero: Neymar/Suarez inspirado, rescate de ataque.
- Hazards: pinches o redes que obliguen a cambiar ruta.

## Nivel 3 - Seleccion / Peso De La Camiseta

Rol narrativo: presion nacional y escenario mas emocional.

Faltan disenos:

- Fondo: estadio celeste/blanco con banderas argentinas.
- Historia: jugar con la presion de todo un pais.
- Plataformas: celeste/blanco, cesped mas claro, banderas colgantes.
- Rival: marca fuerte o rival sudamericano.
- Obstaculos: pelota con red, barridas, silbatos/tarjetas.
- Power-up: Albiceleste boost, mejora temporal de salto o velocidad.
- Companero: Di Maria inspirado, rescate clave.
- Props: banderas, papelitos, luces y confeti controlado.

## Nivel 4 - Semifinal / Todo O Nada

Rol narrativo: nivel dificil, combinacion de mecanicas.

Faltan disenos:

- Fondo: estadio oscuro, lluvia ligera o tension visual.
- Historia: semifinal trabada, cada error cuesta.
- Plataformas: rojas/oscuras, mas angostas, hazards visibles.
- Rival: Cristiano mas agresivo o doble amenaza.
- Obstaculos: pinches, tarjetas, pelotas con timing alternado.
- Power-up: Capitan, invulnerabilidad corta o limpieza de obstaculos.
- Companero: companero defensivo/arquero inspirado.
- Hazards: pinches animados y plataformas trampa con sprite propio.

## Nivel 5 - Final / La Copa Vuelve

Rol narrativo: cierre de campana.

Faltan disenos:

- Fondo: estadio final, noche dorada, Copa al centro.
- Historia: recuperar la Copa robada.
- Plataformas: dorado/azul, ruta larga con camara vertical completa.
- Rival: Cristiano final boss con animaciones extra.
- Obstaculos: mezcla de pelotas, tarjetas, fuego y hazards.
- Power-up: Final boost, modo estrella por tiempo corto.
- Companeros: rescates acumulados o aparicion visual de los salvados.
- Copa: animacion final mas grande, brillo y celebracion.
- Pantalla de victoria final con arte propio.

## Assets Globales Faltantes

- Spritesheet de power-ups.
- Spritesheet de companeros/rescates.
- Spritesheet de hazards nuevos.
- Fondos verticales por nivel.
- Portadas por nivel para selector.
- UI de selector de campana.
- Iconos de estado: bloqueado, completado, rescate logrado, mejor tiempo.
- Animaciones de victoria por nivel.

## Criterio Para Aceptar Un Asset

- Fondo transparente si es sprite jugable.
- Frames recortados sin invadir el siguiente frame.
- Metadata de frame width/height y pivotes.
- Hitbox documentada si participa en colisiones.
- Version preview para QA visual.
- No debe tapar controles en mobile.

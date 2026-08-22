# README - Disenos Pendientes Por Nivel

Este documento define que assets faltan crear para que la campana avance desde el tutorial actual hasta cinco niveles completos.

## Regla Base

- Todo elemento jugable visible debe tener sprite pixel art propio.
- No usar rectangulos de canvas como placeholder visible.
- Cada nivel necesita identidad visual, rival, fondo, plataformas, hazards, power-up y companero/rescate cuando aplique.
- Las portadas y key art pueden venir generadas externamente, pero deben integrarse con hotspots o UI real.
- Los sprites finales deben venir separados por archivo o spritesheet claro, con metadata en `public/sprites/sprites.json`.

## Material Rescatado Actual

Fuente guardada:

- `public/sprites/source/chatgpt-story-sheet-20260821-230304.png`

Recortes usados en el prologo:

- `public/assets/story/story-icon-tutorial-messi.png`
- `public/assets/story/story-icon-level1-platform.png`
- `public/assets/story/story-icon-level2-fireball.png`
- `public/assets/story/story-icon-level3-netball.png`
- `public/assets/story/story-icon-level4-hazard.png`
- `public/assets/story/story-icon-level5-cup.png`
- `public/assets/story/story-icons-preview.png`

Estos recortes son UI/narrativa. No reemplazan sprites jugables hasta limpiar grillas, pivotes y hitboxes.

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
- Historia: Messi cruza su primer escenario grande mientras la Copa queda mas lejos.
- Plataformas: metal azul/grana, cesped corto, soportes mas europeos.
- Rival: defensor capitan o Cristiano version visitante.
- Obstaculos: pelotas mas rapidas, tarjeta roja con patron simple.
- Power-up: Botin de Oro, primer power-up oficial.
- Companero: Xavi/Iniesta inspirado, como rescate/tutorial de bonus.
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

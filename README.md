# Donkey Kong: Edicion Messi

Documento operativo del proyecto. Consolida el documento maestro de diseno y el anexo obligatorio mobile-only.

## Vision

Donkey Kong: Edicion Messi es un arcade 2D de plataformas inspirado en la lectura inmediata de los arcades clasicos. Messi comienza en la parte inferior del escenario y debe ascender por plataformas y escaleras mientras esquiva obstaculos futboleros hasta alcanzar una meta superior.

El juego debe sentirse como un homenaje arcade futbolero con humor y estetica pixel-art propia. La prioridad no es simular una carrera real, sino construir una experiencia clara, precisa, rejugable y divertida.

## Requisito Principal

El proyecto es **mobile only**.

Debe disenarse, desarrollarse, probarse y optimizarse exclusivamente para telefonos celulares. La version final no esta pensada para PC, notebook, mouse ni teclado.

Toda decision futura debe responder primero:

> Esto funciona bien con una sola mano o con dos pulgares en un telefono?

Si una mecanica exige teclado, mouse o precision propia de escritorio, debe redisenarse para tactil.

## Plataforma Objetivo

- Navegador mobile.
- Orientacion principal: portrait.
- Canvas 2D.
- Controles tactiles.
- HUD minimo y legible.
- Escalado responsive sin deformar la fisica.
- Soporte para safe-area, devicePixelRatio y resize sin reiniciar partida.

## Stack Sugerido

- Next.js
- TypeScript
- React para UI, menus, HUD y overlays.
- Canvas 2D para gameplay.
- requestAnimationFrame con delta time.
- Estado de alta frecuencia dentro del motor, no en React state.

## Prioridad De Desarrollo

Primero se construye una sola pantalla excelente.

El objetivo de la fase uno no es tener cinco niveles ni arte final. El objetivo es abrir el juego desde un celular, tocar "Jugar" y completar un nivel funcional desde abajo hasta arriba usando solo controles tactiles.

## MVP De Fase Uno

Definition of Done:

- El juego abre en navegador mobile.
- La pantalla inicial permite comenzar sin teclado ni mouse.
- El nivel se juega en portrait.
- Messi aparece en la parte inferior.
- El jugador puede moverse izquierda/derecha con controles tactiles.
- El jugador puede saltar con boton tactil.
- El jugador puede subir y bajar escaleras con controles tactiles o controles contextuales.
- Hay entre 4 y 6 plataformas solidas.
- Hay al menos 2 escaleras funcionales.
- Hay al menos una pelota enemiga que puede matar al jugador.
- Hay 3 vidas iniciales.
- Al recibir impacto, Messi pierde una vida y respawnea.
- Al perder todas las vidas aparece Game Over.
- Al alcanzar la meta superior aparece Level Complete.
- El HUD muestra vidas, puntos y nivel.
- El reinicio no duplica listeners ni loops.
- El canvas escala a distintos tamanos de telefono sin deformar la logica del mundo.
- El HUD y los controles no tapan zonas criticas del escenario.

## Controles Mobile

Propuesta inicial:

- Zona inferior izquierda: movimiento izquierda/derecha.
- Zona inferior derecha: salto.
- Subir/bajar escalera:
  - opcion A: botones tactiles contextuales cuando Messi esta cerca de una escalera;
  - opcion B: joystick virtual simple;
  - opcion C: botones arriba/abajo visibles pero discretos.

Para fase uno, conviene implementar botones tactiles separados por claridad y precision.

El teclado puede quedar como ayuda temporal de desarrollo, pero no debe ser requisito para jugar ni validar el MVP.

## Identidad Del Juego

### Protagonista

Messi, representado con pixel art propio o placeholders durante el prototipo.

### Rival Central

Cristiano Ronaldo ocupa el rol equivalente al rival superior del arcade clasico. Aparece en la parte alta de los escenarios y activa o lanza obstaculos futboleros para frenar el ascenso de Messi.

La rivalidad debe presentarse de forma exagerada, humoristica y arcade.

### Lenguaje Visual

El mundo reemplaza el lenguaje industrial clasico por simbolos futboleros:

- pelotas;
- botines;
- camisetas;
- copas;
- estadios;
- tuneles;
- tarjetas;
- guantes de arquero.

Evitar copiar logos, escudos, canciones, sprites o marcas protegidas. Crear arte propio.

## Core Loop

1. Empezar en la parte inferior del nivel.
2. Leer patrones de obstaculos.
3. Elegir ruta por plataformas y escaleras.
4. Correr, saltar y subir.
5. Recoger puntos o bonus.
6. Evitar impactos.
7. Perder vida y respawnear si hay choque.
8. Alcanzar la meta superior.
9. Recibir puntuacion y avanzar.

En el nivel final, tomar la Copa del Mundo activa una fase de escape descendente.

## Pilares De Diseno

- Claridad: el jugador entiende rapido donde esta, donde debe ir y que debe evitar.
- Precision: controles consistentes, muertes justas.
- Escalada: cada nivel agrega una idea fuerte.
- Identidad: estetica futbolera y pixel-art propia.
- Rejugabilidad: puntos, tiempo, coleccionables y rescates opcionales.
- Mobile-first: todo debe sentirse bien con tactil.

## Modelo De Nivel

Los niveles deben definirse por datos. No dibujar geometria a mano dentro de componentes React.

Datos recomendados:

- platforms: x, y, width, slope opcional.
- ladders: x, yTop, yBottom, width.
- playerSpawn: x, y.
- goal: x, y, type.
- obstacleSpawns: tipo, frecuencia, ruta.
- collectibles: tipo, x, y.
- rescues: personaje, x, y.

## Arquitectura Propuesta

```txt
app/
  donkey-messi/
    page.tsx

game/
  Game.ts
  Input.ts
  Level.ts
  physics.ts
  collision.ts
  types.ts

entities/
  Player.ts
  Obstacle.ts
  Ball.ts

data/
  levels.ts
  powerups.ts

ui/
  HUD.tsx
  TouchControls.tsx
  GameOver.tsx
  Victory.tsx
  Pause.tsx
```

## Game Loop

El loop debe correr con requestAnimationFrame.

Orden recomendado por frame:

1. Leer input tactil.
2. Actualizar jugador.
3. Aplicar gravedad, salto y escaleras.
4. Actualizar obstaculos.
5. Resolver colisiones.
6. Aplicar reglas de vidas, puntos y victoria.
7. Renderizar canvas.
8. Sincronizar React solo si cambia algo visible.

## Colisiones

- Hitbox de Messi ligeramente menor que el sprite.
- Plataformas: resolver principalmente al caer desde arriba.
- Escaleras: zonas rectangulares; al entrar se puede centrar al jugador.
- Obstaculos: circulo o AABB segun forma.
- Power-ups y meta: triggers rectangulares.
- Evitar pixel-perfect collision en fase uno.

## Obstaculos

Orden sugerido:

1. Pelota gigante rodante.
2. Tarjeta roja horizontal.
3. Botin rebotador.
4. Guante de arquero lateral.
5. Trofeo falso.
6. Pelota rapida.

Fase uno solo necesita pelota rodante.

## Power-Ups Futuros

- Botin de Oro: permite romper obstaculos por 5 a 7 segundos.
- Camiseta 10: invencibilidad por 4 a 5 segundos.
- Mate: recupera una vida.
- Copa America: multiplicador de puntuacion.
- Pelota especial: proyectil de un uso.

No son necesarios para fase uno.

## Niveles Planeados

### Nivel 1 - Rosario / Origen

Tutorial jugable. Plataformas simples, pocas escaleras y pelotas lentas. Meta simbolica: camiseta o balon superior.

### Nivel 2 - Barcelona / Ascenso

Plataformas mas inclinadas, rutas alternativas, tarjetas rojas y primer power-up.

### Nivel 3 - Maracana / Primera Gran Conquista

Mayor densidad, guantes o botines, zona central de riesgo y Copa America como meta.

### Nivel 4 - Wembley / Consolidacion

Nivel tecnico con escaleras cortadas, rutas de riesgo y obstaculos con direccion variable.

### Nivel 5 - Qatar / Final

Escenario dorado y nocturno. Cristiano custodia la Copa del Mundo.

### Fase Final - Escape Con La Copa

Luego de tomar la Copa, Messi debe descender con tiempo reducido hasta la parte inferior.

## Companeros Opcionales

Pueden aparecer como rescates opcionales:

- Di Maria.
- De Paul.
- Dibu.
- Maradona.

No hace falta que sigan al jugador durante la pantalla. Basta con marcarlos como rescatados y mostrarlos en el final.

## Audio

- Musica chiptune original.
- Sonido de salto.
- Sonido de golpe.
- Sonido de coleccionable.
- Fanfarria de nivel completado.
- Fanfarria final.

No usar canciones con derechos.

## Rendimiento Mobile

- Evitar renders React por frame.
- Evitar imagenes gigantes.
- Evitar efectos pesados innecesarios.
- Limpiar listeners al desmontar.
- No duplicar requestAnimationFrame.
- Usar devicePixelRatio correctamente.
- Mantener input tactil sin lag perceptible.

## Checklist De Calidad

- Messi no atraviesa plataformas al saltar o caer.
- Messi no queda pegado a bordes.
- Las escaleras se pueden entrar y salir sin trabas.
- Las muertes se sienten justas.
- El nivel puede completarse sin exploits obvios.
- Restart no duplica listeners ni loops.
- El canvas escala sin deformar la fisica.
- El HUD no tapa zonas importantes.
- Los controles tactiles son grandes, separados y comodos.
- El juego funciona en pantallas pequenas.
- El nivel puede modificarse cambiando solo datos.

## Fuera De Alcance Inicial

- Multijugador.
- Fisica realista de pelota.
- Scrolling complejo.
- Editor de niveles.
- IA avanzada.
- Autenticacion.
- Base de datos.
- Ranking online.
- Decenas de personajes.
- Cinco niveles antes de cerrar el primero.

## Estado Actual

### V1

- Proyecto Next.js + TypeScript creado.
- Canvas mobile portrait.
- Nivel 1 jugable con plataformas, escaleras, salto, vidas, meta y pelota enemiga.
- Controles tactiles iniciales.

### V2

Estado: cerrada tecnicamente.

- Salto ajustado para que no reemplace a las escaleras.
- Pelotas generadas desde Cristiano en la parte superior.
- Pelotas con gravedad, caida por bordes y limpieza al tocar el fondo.
- Respawn limpio sin pelotas activas encima del jugador.
- HUD con puntaje y maximo local.
- Pausa mobile con continuar y reiniciar.
- QA documentado en `docs/QA_V2.md`.

### V2.1

Estado: cerrada tecnicamente.

- Balance de salto, movimiento, escaleras y pelotas.
- Spawner menos agresivo y limite menor de pelotas activas.
- Respawn con breve gracia visual.
- Tolerancia de escaleras ampliada.
- Controles multitouch mas robustos.
- QA automatico con `npm run qa:v2.1`.
- QA de balance documentado en `docs/QA_V21.md`.

### V2.2

Estado: cerrada tecnicamente.

- Feedback visual de impacto.
- Respawn protegido con contorno.
- Escalera activa resaltada.
- Cue visual de lanzamiento de pelota.
- Pelotas con rotacion.
- Meta con pulso y victoria con celebracion.
- QA automatico con `npm run qa:v2.2`.
- QA visual documentado en `docs/QA_V22.md`.

### V2.3

Estado: cerrada tecnicamente.

- Escalera activa sin aura rectangular.
- Controles de subir/bajar contextuales.
- Botones tactiles mas grandes y con estado presionado.
- Franja inferior menos invasiva.
- Vibracion corta en acciones tactiles si el navegador lo permite.
- QA automatico con `npm run qa:v2.3`.
- QA de controles documentado en `docs/QA_V23.md`.

### V2.4

Estado: cerrada tecnicamente.

- Portada con asset PNG propio en `public/assets/cover-v24-worldcup.png`.
- Menu principal visual.
- Pantalla breve de entrenamiento.
- Salida a inicio desde pausa, Game Over y Victory.
- Pantallas finales con puntos.
- QA automatico con `npm run qa:v2.4`.
- QA de flujo documentado en `docs/QA_V24.md`.

### V2.5

Estado: cerrada tecnicamente.

- Audio basico generado con Web Audio.
- Fallback real con archivos `.wav` en `public/audio`.
- Sonidos de inicio, salto, golpe, lanzamiento, Game Over, victoria y UI.
- Boton de sonido/mute.
- Preferencia de sonido persistida en `localStorage`.
- QA automatico con `npm run qa:v2.5`.
- QA de audio documentado en `docs/QA_V25.md`.

### V2.6

Estado: en cierre tecnico, con pase HD estilo Super Milo J aplicado.

- Spritesheets PNG separados para Messi, Cristiano, pelota, Copa, plataformas, escalera y hazards.
- Messi en 280x360 con 8 frames HD: idle, run, jump, climb, hit y victory.
- Cristiano en 280x360 con 8 frames HD: idle, taunt y throw.
- Pelota con 8 frames de giro, Copa con brillo y tiles de plataformas 320x150.
- Referencias HD guardadas en `public/sprites/source/`.
- Preview visual en `public/sprites/preview-v26-hd.png`.
- Pipeline de extraccion HD en `scripts/extract-hd-sprite-assets.py`.
- Metadata de grillas, pivotes y animaciones en `public/sprites/sprites.json`.
- Render con `SpriteManager` y smoothing desactivado.
- QA automatico con `npm run qa:v2.6`.
- QA de arte documentado en `docs/QA_V26.md`.

## Siguiente Paso

Playtest manual de V2.6 en telefono real y luego avanzar a V2.7: persistencia y rejugabilidad minima.

## Roadmap

El plan de versiones necesarias antes de entrar en Fase 2 esta documentado en `docs/ROADMAP_HASTA_FASE_2.md`.

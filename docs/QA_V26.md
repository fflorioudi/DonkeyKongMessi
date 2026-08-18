# QA V2.6 - Spritesheets PNG

Objetivo: reemplazar placeholders dibujados a mano por spritesheets PNG separados, exactos y reutilizables, con un salto visual cercano al nivel de produccion usado en Super Milo J.

## Assets Generados

Ubicacion: `public/sprites/`

- `messi.png`: 8 frames HD, idle, run, jump, climb, hit y victory.
- `cristiano.png`: 8 frames HD, idle, taunt y throw con pelota.
- `ball.png`: 8 frames de pelota rodando.
- `worldcup.png`: 6 frames de Copa con brillo.
- `platforms.png`: tiles de plataformas por color.
- `ladder.png`: escalera normal y activa sin aura externa.
- `hazards.png`: pinches.
- `preview-v26-hd.png`: contact sheet para revisar el arte completo.
- `source/`: referencias HD generadas para Messi, Ronaldo y props.
- `sprites.json`: metadata de grilla, pivotes, frames y animaciones.

## Pipeline

Comando:

```bash
node scripts/generate-sprite-assets.mjs
```

Los PNGs finales se extrajeron desde referencias HD y se normalizaron con celdas fijas, transparencia real, pivotes declarados y `imageSmoothingEnabled = false` en render.

## QA Automatico

Comando:

```bash
npm run qa:v2.6
```

Valida:

- Existencia de cada PNG.
- Tamano de grilla correcto.
- Metadata de animaciones.
- Metadata de pivotes.
- Minimos de calidad: Messi y Cristiano con frames HD de al menos 260x320, pelota con 8 frames y plataformas de al menos 300x140.
- Existencia del preview sheet.
- Uso de `SpriteManager`.
- Uso de sprites en Messi, pelota, Copa, plataformas y escaleras.
- Pixel art sin smoothing.

## QA Manual

1. Abrir el juego y confirmar que Messi ya no es un rectangulo simple.
2. Moverse y confirmar animacion de carrera.
3. Saltar y confirmar pose de salto.
4. Subir escalera y confirmar animacion de climb.
5. Confirmar que Cristiano cambia al lanzar.
6. Confirmar que la pelota usa spritesheet.
7. Confirmar que plataformas y escaleras mantienen lectura clara.
8. Confirmar que todo sigue fluido en mobile.
9. Revisar `public/sprites/preview-v26-hd.png` antes de push.

## Criterio De Cierre V2.6

- En una captura se entiende que es un arcade futbolero.
- Los elementos jugables se distinguen al instante.
- Cada asset principal vive en su propio PNG.
- Las animaciones usan frames separados.
- El arte no reduce legibilidad ni rendimiento.

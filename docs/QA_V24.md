# QA V2.4 - Pantallas Y Flujo

Objetivo: que el juego se sienta como una experiencia completa aunque todavia tenga un solo nivel.

## Assets

- `public/assets/cover-v24-worldcup.png`
- Generado con ImageGen built-in.
- Uso: portada mobile del menu principal.
- Prompt base: pixel-art vertical de arcade futbolero, sin logos reales, sin texto embebido, sin marcas.
- Ajuste narrativo: la parte superior muestra la Copa del Mundo, porque es el objeto que Cristiano roba/custodia.

Asset historico:

- `public/assets/cover-v24.png`: primera version de portada con camiseta superior, conservada como referencia.

## Cambios

- Portada con key art vertical.
- Menu principal sobre imagen.
- Acciones principales: `Jugar` y `Entrenar`.
- Pantalla breve de entrenamiento.
- Pausa con salida a inicio.
- Game Over con puntos, reinicio e inicio.
- Victory con puntos, jugar de nuevo e inicio.
- Motor con metodo `menu()` para volver a estado inicial limpio.

## QA Automatico

Comando:

```bash
npm run qa:v2.4
```

Valida:

- Existencia del asset de portada.
- Uso del asset en el menu.
- Flujo de entrenamiento.
- Retorno a menu desde motor/UI.
- Acciones de pausa, victoria y Game Over.

## QA Manual

1. Abrir `localhost:3000/donkey-messi`.
2. Confirmar que la portada llena el viewport mobile.
3. Tocar `Entrenar`, volver y luego jugar.
4. Pausar y volver a inicio.
5. Perder y volver a inicio desde Game Over.
6. Ganar y volver a inicio desde Victory.
7. Confirmar que el menu no queda tapado por safe-area o controles.

## Criterio De Cierre V2.4

- Un jugador nuevo entiende como empezar.
- Perder y reiniciar es inmediato.
- Ganar deja claro que el nivel termino.
- Se puede volver al inicio desde estados principales.
- La portada no usa logos, marcas ni texto embebido.

# QA V2.9 - Candidate Build

Objetivo: cerrar la etapa pre-Fase 2 con una version estable, documentada y lista para playtest final en telefono.

## Alcance

- QA completo de V2.1 a V2.8.
- Build productivo.
- Estado documental actualizado.
- Limpieza de artefactos locales.
- Revision de portada, selector, HUD, controles, audio, scoring y flujo de reinicio.

## QA Automatico

Ejecutar:

```bash
npm run qa:v2.1
npm run qa:v2.2
npm run qa:v2.3
npm run qa:v2.4
npm run qa:v2.5
npm run qa:v2.6
npm run qa:v2.7
npm run qa:v2.8
npm run qa:v2.9
npm run lint
npm run typecheck
npm run build
```

Validaciones cubiertas por `qa:v2.9`:

- Todos los scripts QA quedan registrados.
- Toda la documentacion QA esperada existe.
- La portada declara `Mobile v2.9 candidate`.
- El selector de nivel no muestra flechas cuando hay un solo nivel.
- Los estilos del selector evitan botones desproporcionados.
- Los artefactos de build quedan ignorados.
- README y roadmap registran V2.8 cerrada y V2.9 documentada.
- El motor conserva arquitectura basada en catalogo de niveles.

## QA Manual Mobile

1. Abrir `/donkey-messi` en portrait.
2. Confirmar que la portada no tiene superposiciones.
3. Tocar `Audio` y confirmar sonido.
4. Entrar con `Jugar`.
5. Probar movimiento, salto y escaleras.
6. Recibir un golpe y confirmar respawn limpio.
7. Pausar, continuar y volver al inicio.
8. Perder una partida y reiniciar.
9. Completar el nivel y confirmar resumen de puntos.
10. Recargar y confirmar persistencia de maximo y mejor tiempo.

## Criterio De Cierre V2.9

- QA automatico completo en verde.
- Build productivo correcto.
- Nivel 1 estable y repetible.
- Base tecnica lista para crear Nivel 2 en Fase 2.

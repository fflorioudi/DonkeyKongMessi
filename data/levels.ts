import type { LevelDefinition } from "@/game/types";

export const levels: LevelDefinition[] = [
  {
    id: 1,
    name: "Rosario / Origen",
    theme: "Atardecer de barrio, tribunas bajas y primeras pelotas lentas.",
    worldWidth: 390,
    worldHeight: 720,
    playerSpawn: { x: 36, y: 642 },
    platforms: [
      { x: 18, y: 684, width: 354, height: 18, color: "#2ee58a" },
      { x: 56, y: 566, width: 278, height: 16, color: "#ffe45c" },
      { x: 18, y: 448, width: 254, height: 16, color: "#39a9ff" },
      { x: 96, y: 330, width: 276, height: 16, color: "#ff5c7a" },
      { x: 18, y: 212, width: 250, height: 16, color: "#f7f8ff" },
      { x: 126, y: 104, width: 226, height: 16, color: "#b7ff4a" },
    ],
    ladders: [
      { x: 286, y: 566, width: 34, height: 118 },
      { x: 74, y: 448, width: 34, height: 118 },
      { x: 222, y: 330, width: 34, height: 118 },
      { x: 146, y: 212, width: 34, height: 118 },
      { x: 296, y: 104, width: 34, height: 108 },
    ],
    ballSpawner: {
      x: 316,
      y: 91,
      interval: 3.2,
      firstDelay: 0.6,
      maxActive: 4,
      ball: {
        radius: 13,
        speed: 112,
        direction: -1,
      },
    },
    goal: {
      x: 148,
      y: 54,
      width: 72,
      height: 48,
      label: "10",
    },
  },
];

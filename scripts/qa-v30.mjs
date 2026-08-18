import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const typesSource = readFileSync(join(root, "game", "types.ts"), "utf8");
const levelsSource = readFileSync(join(root, "data", "levels.ts"), "utf8");
const gameSource = readFileSync(join(root, "game", "Game.ts"), "utf8");
const obstacleSource = readFileSync(join(root, "entities", "Obstacle.ts"), "utf8");
const ballSource = readFileSync(join(root, "entities", "Ball.ts"), "utf8");
const pageSource = readFileSync(join(root, "app", "donkey-messi", "page.tsx"), "utf8");
const roadmapSource = readFileSync(join(root, "docs", "ROADMAP_FASE_2_V3.md"), "utf8");

function pass(label, condition) {
  if (!condition) {
    throw new Error(`${label} failed`);
  }

  console.log(`ok - ${label}`);
}

pass("qa script is registered", packageJson.scripts["qa:v3.0"] === "node scripts/qa-v30.mjs");
pass("obstacle qa doc exists", existsSync(join(root, "docs", "QA_V30.md")));
pass("types expose obstacle kind", typesSource.includes("ObstacleKind"));
pass("types expose obstacle definition", typesSource.includes("ObstacleDefinition"));
pass("types expose obstacle spawner", typesSource.includes("ObstacleSpawnerDefinition"));
pass("level supports obstacle spawners", typesSource.includes("obstacleSpawners: ObstacleSpawnerDefinition[]"));
pass("level data keeps legacy ball spawner for v2 qa", levelsSource.includes("ballSpawner:"));
pass("level data declares generic spawner", levelsSource.includes("obstacleSpawners") && levelsSource.includes("kind: \"ball\""));
pass("ball behavior remains available", ballSource.includes("export class Ball") && ballSource.includes("this.alive = false"));
pass("generic obstacle wraps ball", obstacleSource.includes("new Ball") && obstacleSource.includes("collidesWith"));
pass("game stores generic obstacles", gameSource.includes("private obstacles: Obstacle[]"));
pass("game uses obstacle spawn timers", gameSource.includes("obstacleSpawnTimers") && gameSource.includes("createObstacleSpawnTimers"));
pass("game spawns obstacles from data", gameSource.includes("spawnObstaclesIfReady") && gameSource.includes("level.obstacleSpawners"));
pass("game no longer stores balls directly", !gameSource.includes("private balls"));
pass("game collision uses obstacle api", gameSource.includes("obstacle.collidesWith(this.player.rect)"));
pass("menu declares v3.0", pageSource.includes("Mobile v3.0"));
pass("roadmap points to v3.0", roadmapSource.includes("V3.0 - Sistema Generico De Obstaculos"));

console.log("V3.0 generic obstacle system checks passed.");

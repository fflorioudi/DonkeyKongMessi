import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const typesSource = readFileSync(join(root, "game", "types.ts"), "utf8");
const levelsSource = readFileSync(join(root, "data", "levels.ts"), "utf8");
const obstacleSource = readFileSync(join(root, "entities", "Obstacle.ts"), "utf8");
const ballSource = readFileSync(join(root, "entities", "Ball.ts"), "utf8");
const gameSource = readFileSync(join(root, "game", "Game.ts"), "utf8");
const pageSource = readFileSync(join(root, "app", "donkey-messi", "page.tsx"), "utf8");
const roadmapSource = readFileSync(join(root, "docs", "ROADMAP_FASE_2_V3.md"), "utf8");
const spritesSource = readFileSync(join(root, "public", "sprites", "sprites.json"), "utf8");

function pass(label, condition) {
  if (!condition) {
    throw new Error(`${label} failed`);
  }

  console.log(`ok - ${label}`);
}

pass("qa script is registered", packageJson.scripts["qa:v3.1"] === "node scripts/qa-v31.mjs");
pass("red-card qa doc exists", existsSync(join(root, "docs", "QA_V31.md")));
pass("types expose red-card kind", typesSource.includes("\"red-card\""));
pass("types define red-card obstacle", typesSource.includes("RedCardObstacleDefinition"));
pass("level data includes red-card spawner", levelsSource.includes("id: \"tutorial-red-card\"") && levelsSource.includes("kind: \"red-card\""));
pass("red-card spawner is gentle for tutorial", levelsSource.includes("firstDelay: 6.8") && levelsSource.includes("maxActive: 1"));
pass("obstacle supports red-card runtime", obstacleSource.includes("definition.obstacle.kind === \"red-card\""));
pass("red-card moves horizontally", obstacleSource.includes("this.rect.x += this.direction * this.speed * dt"));
pass("red-card has reduced hitbox", obstacleSource.includes("hitboxInset") && obstacleSource.includes("private get hitbox"));
pass("red-card sprite exists", existsSync(join(root, "public", "sprites", "red-card.png")));
pass("red-card sprite is non-empty", statSync(join(root, "public", "sprites", "red-card.png")).size > 100);
pass("red-card metadata exists", spritesSource.includes("\"redCard\"") && spritesSource.includes("/sprites/red-card.png"));
pass("red-card sheet is detailed", spritesSource.includes("\"frameWidth\": 160") && spritesSource.includes("\"frames\": 8"));
pass("red-card exclamation is centered by generator", readFileSync(join(root, "scripts", "generate-red-card-sprite.mjs"), "utf8").includes("iconY = y + 22"));
pass("red-card uses sprite drawing", obstacleSource.includes("\"redCard\"") && obstacleSource.includes("drawTrimmedFrame"));
pass("red-card has no canvas rectangle fallback", !obstacleSource.includes("drawRedCard"));
pass("balls disappear on bottom support", ballSource.includes("bottomPlatform") && ballSource.includes("this.isSupportedBy(bottomPlatform)"));
pass("game still uses generic obstacle loop", gameSource.includes("spawnObstaclesIfReady") && gameSource.includes("obstacle.collidesWith"));
pass("menu declares v3.1 or newer", /Mobile v3\.\d+/.test(pageSource));
pass("roadmap mentions v3.1", roadmapSource.includes("V3.1 - Obstaculo Tarjeta Roja"));

console.log("V3.1 red-card obstacle checks passed.");

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const typesSource = readFileSync(join(root, "game", "types.ts"), "utf8");
const levelsSource = readFileSync(join(root, "data", "levels.ts"), "utf8");
const gameSource = readFileSync(join(root, "game", "Game.ts"), "utf8");
const pageSource = readFileSync(join(root, "app", "donkey-messi", "page.tsx"), "utf8");
const roadmapSource = readFileSync(join(root, "docs", "ROADMAP_FASE_2_V3.md"), "utf8");
const readmeSource = readFileSync(join(root, "README.md"), "utf8");

function pass(label, condition) {
  if (!condition) {
    throw new Error(`${label} failed`);
  }

  console.log(`ok - ${label}`);
}

function readNumber(name) {
  const match = levelsSource.match(new RegExp(`${name}: (\\d+(?:\\.\\d+)?)`));

  if (!match) {
    throw new Error(`Missing level number ${name}`);
  }

  return Number(match[1]);
}

const worldHeight = readNumber("worldHeight");
const viewportHeight = readNumber("viewportHeight");
const platformCount = (levelsSource.match(/\{ x: \d+, y: \d+, width: \d+, height: \d+, color:/g) ?? []).length;
const ladderCount = (levelsSource.match(/\{ x: \d+, y: \d+, width: \d+, height: \d+ \}/g) ?? []).length;

pass("qa script is registered", packageJson.scripts["qa:v3.2"] === "node scripts/qa-v32.mjs");
pass("camera qa doc exists", existsSync(join(root, "docs", "QA_V32.md")));
pass("types expose viewport dimensions", typesSource.includes("viewportWidth: number") && typesSource.includes("viewportHeight: number"));
pass("types expose camera definition", typesSource.includes("CameraDefinition") && typesSource.includes("followTopMargin"));
pass("tutorial world is taller than viewport", worldHeight > viewportHeight);
pass("tutorial has expanded platform route", platformCount >= 10);
pass("tutorial has expanded ladder route", ladderCount >= 9);
pass("level defines camera tuning", levelsSource.includes("camera:") && levelsSource.includes("smoothing: 7.5"));
pass("game stores camera position", gameSource.includes("private cameraY = 0"));
pass("game updates camera smoothly", gameSource.includes("private updateCamera") && gameSource.includes("Math.exp(-smoothing * dt)"));
pass("game clamps camera to world bounds", gameSource.includes("this.level.worldHeight - this.level.viewportHeight") && gameSource.includes("clamp("));
pass("canvas scales to viewport, not full world", gameSource.includes("this.level.viewportWidth") && gameSource.includes("this.level.viewportHeight"));
pass("render clears only visible viewport", gameSource.includes("ctx.clearRect(0, 0, this.level.viewportWidth, this.level.viewportHeight)"));
pass("render translates world by camera", gameSource.includes("ctx.translate(0, -this.cameraY)"));
pass("screen flash respects visible camera window", gameSource.includes("ctx.fillRect(0, this.cameraY, this.level.viewportWidth, this.level.viewportHeight)"));
pass("menu declares v3.2", pageSource.includes("Mobile v3.2"));
pass("roadmap includes v3.2 camera", roadmapSource.includes("V3.2 - Camara Vertical"));
pass("readme includes v3.2 camera", readmeSource.includes("### V3.2") && readmeSource.includes("camara vertical"));

console.log("V3.2 vertical camera checks passed.");

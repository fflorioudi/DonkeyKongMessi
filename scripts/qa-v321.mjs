import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const typesSource = readFileSync(join(root, "game", "types.ts"), "utf8");
const levelsSource = readFileSync(join(root, "data", "levels.ts"), "utf8");
const gameSource = readFileSync(join(root, "game", "Game.ts"), "utf8");
const pageSource = readFileSync(join(root, "app", "donkey-messi", "page.tsx"), "utf8");
const readmeSource = readFileSync(join(root, "README.md"), "utf8");

function pass(label, condition) {
  if (!condition) {
    throw new Error(`${label} failed`);
  }

  console.log(`ok - ${label}`);
}

pass("qa script is registered", packageJson.scripts["qa:v3.2.1"] === "node scripts/qa-v321.mjs");
pass("qa doc exists", existsSync(join(root, "docs", "QA_V321.md")));
pass("types expose spawn delay range", typesSource.includes("SpawnDelayRangeDefinition") && typesSource.includes("spawnDelayMs?"));
pass("ball spawner declares randomized milliseconds", levelsSource.includes("spawnDelayMs:") && levelsSource.includes("min: 2200") && levelsSource.includes("max: 4200"));
pass("ball spawner keeps high safety cap", levelsSource.includes("id: \"ronaldo-opening-ball\"") && levelsSource.includes("maxActive: 8"));
pass("legacy ball config mirrors safety cap", levelsSource.includes("ballSpawner:") && levelsSource.includes("maxActive: 8"));
pass("game uses initial delay helper", gameSource.includes("initialSpawnDelaySeconds(spawner)"));
pass("game uses randomized next delay helper", gameSource.includes("nextSpawnDelaySeconds(spawner)") && gameSource.includes("Math.random()"));
pass("legacy interval fallback remains", gameSource.includes("return spawner.interval"));
pass("menu declares v3.2.1", pageSource.includes("Mobile v3.2.1"));
pass("readme documents v3.2.1", readmeSource.includes("### V3.2.1") && readmeSource.includes("2200-4200 ms"));

console.log("V3.2.1 randomized spawn timing checks passed.");

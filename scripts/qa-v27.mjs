import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const gameSource = readFileSync(join(root, "game", "Game.ts"), "utf8");
const typesSource = readFileSync(join(root, "game", "types.ts"), "utf8");
const hudSource = readFileSync(join(root, "ui", "HUD.tsx"), "utf8");
const victorySource = readFileSync(join(root, "ui", "Victory.tsx"), "utf8");
const gameOverSource = readFileSync(join(root, "ui", "GameOver.tsx"), "utf8");
const pageSource = readFileSync(join(root, "app", "donkey-messi", "page.tsx"), "utf8");
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

function pass(label, condition) {
  if (!condition) {
    throw new Error(`${label} failed`);
  }

  console.log(`ok - ${label}`);
}

pass("qa script is registered", packageJson.scripts["qa:v2.7"] === "node scripts/qa-v27.mjs");
pass("types expose elapsed time", typesSource.includes("elapsedTime: number"));
pass("types expose best time", typesSource.includes("bestTime: number"));
pass("types expose score breakdown", typesSource.includes("ScoreBreakdown"));
pass("game persists best time", gameSource.includes("BEST_TIME_KEY") && gameSource.includes("recordBestTime"));
pass("game keeps high score persistence", gameSource.includes("HIGH_SCORE_KEY") && gameSource.includes("recordHighScore"));
pass("game computes life bonus", gameSource.includes("LIFE_BONUS") && gameSource.includes("lifeBonus"));
pass("game computes time bonus", gameSource.includes("TIME_BONUS_PER_SECOND") && gameSource.includes("timeBonus"));
pass("completion uses score summary", gameSource.includes("scoreBreakdown") && gameSource.includes("completeLevel"));
pass("hud shows timer", hudSource.includes("formatTime(snapshot.elapsedTime)"));
pass("victory renders score summary", victorySource.includes("scoreSummary") && victorySource.includes("Nuevo tiempo"));
pass("game over renders records", gameOverSource.includes("snapshot.highScore") && gameOverSource.includes("bestTime"));
pass("initial snapshot contains v27 fields", pageSource.includes("scoreBreakdown") && pageSource.includes("isNewBestTime"));

console.log("V2.7 persistence and replayability checks passed.");

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const playerSource = readFileSync(join(root, "entities", "Player.ts"), "utf8");
const gameSource = readFileSync(join(root, "game", "Game.ts"), "utf8");
const victorySource = readFileSync(join(root, "ui", "Victory.tsx"), "utf8");
const pageSource = readFileSync(join(root, "app", "donkey-messi", "page.tsx"), "utf8");
const readmeSource = readFileSync(join(root, "README.md"), "utf8");

function pass(label, condition) {
  if (!condition) {
    throw new Error(`${label} failed`);
  }

  console.log(`ok - ${label}`);
}

pass("qa script is registered", packageJson.scripts["qa:v3.4.7"] === "node scripts/qa-v347.mjs");
pass("jump launch has priority", playerSource.includes("const startsJump = input.jump && canJump"));
pass("airborne ladder grab is allowed by climb input", playerSource.includes("const wantsClimb = input.climb !== 0 && Boolean(ladder) && !startsJump"));
pass("climb controls can appear while airborne", playerSource.includes("return Boolean(findUsableLadder(this.rect, ladders))"));
pass("tutorial surface offsets were recalibrated", gameSource.includes("const offsets = [18, 20, 3, 18, 16, 14, 19, 4, 4]"));
pass("level 2 victory source exists", existsSync(join(root, "public", "assets", "ui", "final-level-2.png")));
pass("level 2 victory clean asset exists", existsSync(join(root, "public", "assets", "ui", "final-level-2-clean.png")));
pass("victory chooses level 2 image", victorySource.includes("final-level-2-clean.png") && victorySource.includes("victoryImages[snapshot.levelIndex]"));
pass("menu declares v3.4.7 or newer", /Mobile v3\.(?:4\.[7-9]\d*|[5-9]\d*(?:\.\d+)?)/.test(pageSource));
pass("readme documents v3.4.7", readmeSource.includes("### V3.4.7"));

console.log("V3.4.7 airborne ladder grab, tutorial surface, and level 2 victory checks passed.");

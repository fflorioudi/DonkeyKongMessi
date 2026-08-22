import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const sprites = JSON.parse(readFileSync(join(root, "public", "sprites", "sprites.json"), "utf8"));
const playerSource = readFileSync(join(root, "entities", "Player.ts"), "utf8");
const gameSource = readFileSync(join(root, "game", "Game.ts"), "utf8");
const pageSource = readFileSync(join(root, "app", "donkey-messi", "page.tsx"), "utf8");
const readmeSource = readFileSync(join(root, "README.md"), "utf8");

function pass(label, condition) {
  if (!condition) {
    throw new Error(`${label} failed`);
  }

  console.log(`ok - ${label}`);
}

pass("qa script is registered", packageJson.scripts["qa:v3.4.4"] === "node scripts/qa-v344.mjs");
pass("level 2 extractor is registered", packageJson.scripts["assets:level2"] === "node scripts/extract-level2-assets.mjs");
pass("qa doc exists", existsSync(join(root, "docs", "QA_V344.md")));
pass("level 2 background exists", existsSync(join(root, "public", "assets", "levels", "level-2-background.png")));
pass("level 2 platforms exist", existsSync(join(root, "public", "sprites", "level-2-platforms.png")));
pass("level 2 source exists", existsSync(join(root, "public", "sprites", "source", "level-2-platforms-source.png")));
pass("level 2 platform metadata exists", Boolean(sprites.sheets.level2Platforms));
pass("level 2 platform sheet has sixteen frames", sprites.sheets.level2Platforms?.frames === 16);
pass("level 2 platform sheet uses expected grid", sprites.sheets.level2Platforms?.frameWidth === 320 && sprites.sheets.level2Platforms?.frameHeight === 150);
pass("ladder grab does not override jump", playerSource.includes("!input.jump") && playerSource.includes("isRisingJump"));
pass("rising jump cannot be stopped by ladder", playerSource.includes("this.state === \"jump\" && this.vy < 0") && playerSource.includes("!isRisingJump"));
pass("tutorial platform surface offsets are modest", gameSource.includes("const offsets = [10, 8, 0, 9, 8, 0, 6, 0, 0]"));
pass("menu declares v3.4.4", pageSource.includes("Mobile v3.4.4"));
pass("readme documents v3.4.4", readmeSource.includes("### V3.4.4") && readmeSource.includes("escalera"));

console.log("V3.4.4 ladder jump, tutorial platform alignment, and level 2 asset prep checks passed.");

import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const gameSource = readFileSync(join(root, "game", "Game.ts"), "utf8");
const levelsSource = readFileSync(join(root, "data", "levels.ts"), "utf8");
const playerSource = readFileSync(join(root, "entities", "Player.ts"), "utf8");
const ballSource = readFileSync(join(root, "entities", "Ball.ts"), "utf8");
const hudSource = readFileSync(join(root, "ui", "HUD.tsx"), "utf8");

function pass(label, condition) {
  if (!condition) {
    throw new Error(`${label} failed`);
  }

  console.log(`ok - ${label}`);
}

pass("hit feedback exists", gameSource.includes("hitFlash") && gameSource.includes("-1 vida"));
pass("respawn protection is visible", playerSource.includes("isProtected") && playerSource.includes("strokeRect"));
pass("active ladder highlight exists", gameSource.includes("findActiveLadder") && gameSource.includes("isActive"));
pass("ball throw cue exists", gameSource.includes("throwCue") && gameSource.includes("PELIGRO"));
pass(
  "victory feedback exists",
  gameSource.includes("goalFlash") && gameSource.includes("totalBonus") && levelsSource.includes("completionBonus: 1000"),
);
pass("hud message exists", hudSource.includes("hudMessage") && gameSource.includes("setMessage"));
pass("ball rotation exists", ballSource.includes("rotation") && ballSource.includes("ctx.rotate"));

console.log("V2.2 feedback checks passed.");

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const sprites = JSON.parse(readFileSync(join(root, "public", "sprites", "sprites.json"), "utf8"));
const typesSource = readFileSync(join(root, "game", "types.ts"), "utf8");
const playerSource = readFileSync(join(root, "entities", "Player.ts"), "utf8");
const gameSource = readFileSync(join(root, "game", "Game.ts"), "utf8");
const levelsSource = readFileSync(join(root, "data", "levels.ts"), "utf8");
const pageSource = readFileSync(join(root, "app", "donkey-messi", "page.tsx"), "utf8");
const readmeSource = readFileSync(join(root, "README.md"), "utf8");

function pass(label, condition) {
  if (!condition) {
    throw new Error(`${label} failed`);
  }

  console.log(`ok - ${label}`);
}

pass("qa script is registered", packageJson.scripts["qa:v3.4.1"] === "node scripts/qa-v341.mjs");
pass("qa doc exists", existsSync(join(root, "docs", "QA_V341.md")));
pass("level 1 messi source exists", existsSync(join(root, "public", "sprites", "source", "level-1-messi-source.png")));
pass("level 1 messi sheet exists", existsSync(join(root, "public", "sprites", "level-1-messi.png")));
pass("level 1 cover exists", existsSync(join(root, "public", "assets", "levels", "level-1-cover.png")));
pass("level 1 messi metadata exists", Boolean(sprites.sheets.level1Messi));
pass("level 1 messi uses expected grid", sprites.sheets.level1Messi?.frameWidth === 280 && sprites.sheets.level1Messi?.frameHeight === 360);
pass("level 1 messi has core animations", ["idle", "run", "jump", "climb", "hit", "victory"].every((key) => sprites.sheets.level1Messi?.animations?.[key]));
pass("types expose player sprite sheet", typesSource.includes("playerSpriteSheet?: string"));
pass("player draw accepts sprite sheet", playerSource.includes('spriteSheet = "messi"') && playerSource.includes("animationFrame(spriteSheet"));
pass("game passes level player sheet", gameSource.includes("this.level.playerSpriteSheet"));
pass("level 1 uses Barcelona Messi", levelsSource.includes('playerSpriteSheet: "level1Messi"'));
pass("tutorial keeps default Messi", levelsSource.includes('stageLabel: "Tutorial"') && !levelsSource.slice(0, levelsSource.indexOf('stageLabel: "Nivel 1"')).includes("playerSpriteSheet"));
pass("selector uses level 1 cover", pageSource.includes("/assets/levels/level-1-cover.png"));
pass("level 1 obstacles stay ball and red-card", levelsSource.includes('kind: "ball"') && levelsSource.includes('kind: "red-card"') && !levelsSource.includes('kind: "boot"') && !levelsSource.includes('kind: "glove"'));
pass("readme documents v3.4.1", readmeSource.includes("### V3.4.1") && readmeSource.includes("Messi Barcelona"));

console.log("V3.4.1 level 1 Messi and cover checks passed.");

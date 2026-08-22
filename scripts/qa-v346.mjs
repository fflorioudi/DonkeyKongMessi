import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const sprites = JSON.parse(readFileSync(join(root, "public", "sprites", "sprites.json"), "utf8"));
const typesSource = readFileSync(join(root, "game", "types.ts"), "utf8");
const obstacleSource = readFileSync(join(root, "entities", "Obstacle.ts"), "utf8");
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

pass("qa script is registered", packageJson.scripts["qa:v3.4.6"] === "node scripts/qa-v346.mjs");
pass("level 2 extractor is registered", packageJson.scripts["assets:level2"] === "node scripts/extract-level2-assets.mjs");
pass("level 2 cover exists", existsSync(join(root, "public", "assets", "levels", "level-2-cover.png")));
pass("level 2 shield sheet exists", existsSync(join(root, "public", "sprites", "level-2-shield.png")));
pass("level 2 Neymar sheet exists", existsSync(join(root, "public", "sprites", "level-2-companions.png")));
pass("level 2 hazard sheet exists", existsSync(join(root, "public", "sprites", "level-2-hazard.png")));
pass("level 2 power-up source exists", existsSync(join(root, "public", "sprites", "source", "level-2-power-up-source.png")));
pass("level 2 companion source exists", existsSync(join(root, "public", "sprites", "source", "level-2-companions-source.png")));
pass("level 2 hazard source exists", existsSync(join(root, "public", "sprites", "source", "level-2-hazard-source.png")));
pass("shield metadata exists", Boolean(sprites.sheets.level2Shield));
pass("Neymar metadata exists", Boolean(sprites.sheets.level2Companion));
pass("hazard metadata exists", Boolean(sprites.sheets.level2Hazards));
pass("level 2 platform metadata still exists", Boolean(sprites.sheets.level2Platforms));
pass("level 2 rival metadata still exists", Boolean(sprites.sheets.level2Rival));
pass("power-up types include shield and Neymar", typesSource.includes('"shield"') && typesSource.includes('"neymar"'));
pass("fixed hazards support sprite hitboxes", typesSource.includes("spriteSheet?: string") && typesSource.includes("hitboxInset?: number"));
pass("obstacle renders fixed hazards with sprites", obstacleSource.includes('this.kind === "fixed-hazard"') && obstacleSource.includes("level2Hazards"));
pass("fixed hazards do not trigger throw cue", gameSource.includes('spawner.obstacle.kind === "fixed-hazard"'));
pass("level 2 HD platforms draw as tall sprites", gameSource.includes('sheet === "level2Platforms"'));
pass("Neymar draws as companion power-up", gameSource.includes('powerUp.kind === "neymar"'));
pass("level 2 is declared", levelsSource.includes('stageLabel: "Nivel 2"') && levelsSource.includes('name: "Europa / Noches grandes"'));
pass("level 2 uses level 1 Messi", levelsSource.includes('playerSpriteSheet: "level1Messi"'));
pass("level 2 uses shield and Neymar", levelsSource.includes('spriteSheet: "level2Shield"') && levelsSource.includes('spriteSheet: "level2Companion"'));
pass("level 2 uses fixed hazards", levelsSource.includes('kind: "fixed-hazard"') && levelsSource.includes('spriteSheet: "level2Hazards"'));
pass("level selector unlocks level 2", pageSource.includes('cover: "/assets/levels/level-2-cover.png"') && pageSource.includes("levelIndex: 2"));
pass("menu declares v3.4.6", pageSource.includes("Mobile v3.4.6"));
pass("readme documents v3.4.6", readmeSource.includes("### V3.4.6"));

console.log("V3.4.6 level 2 assets, selector unlock, shield, Neymar, and fixed hazards checks passed.");

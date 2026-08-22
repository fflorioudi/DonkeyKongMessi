import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const sprites = JSON.parse(readFileSync(join(root, "public", "sprites", "sprites.json"), "utf8"));
const typesSource = readFileSync(join(root, "game", "types.ts"), "utf8");
const gameSource = readFileSync(join(root, "game", "Game.ts"), "utf8");
const levelsSource = readFileSync(join(root, "data", "levels.ts"), "utf8");
const pageSource = readFileSync(join(root, "app", "donkey-messi", "page.tsx"), "utf8");
const stylesSource = readFileSync(join(root, "app", "donkey-messi", "styles.css"), "utf8");
const roadmapSource = readFileSync(join(root, "docs", "ROADMAP_FASE_2_V3.md"), "utf8");
const readmeSource = readFileSync(join(root, "README.md"), "utf8");

function pass(label, condition) {
  if (!condition) {
    throw new Error(`${label} failed`);
  }

  console.log(`ok - ${label}`);
}

pass("qa script is registered", packageJson.scripts["qa:v3.4"] === "node scripts/qa-v34.mjs");
pass("level 1 extractor is registered", packageJson.scripts["assets:level1"] === "node scripts/extract-level1-assets.mjs");
pass("qa doc exists", existsSync(join(root, "docs", "QA_V34.md")));
pass("level 1 background exists", existsSync(join(root, "public", "assets", "levels", "level-1-background.png")));
pass("level 1 platforms exist", existsSync(join(root, "public", "sprites", "level-1-platforms.png")));
pass("level 1 rival exists", existsSync(join(root, "public", "sprites", "level-1-rival.png")));
pass("level 1 companions exist", existsSync(join(root, "public", "sprites", "level-1-companions.png")));
pass("level 1 sources preserved", ["level-1-platforms-source.png", "level-1-rival-source.png", "level-1-companions-source.png"].every((file) => existsSync(join(root, "public", "sprites", "source", file))));
pass("level 1 platform metadata exists", Boolean(sprites.sheets.level1Platforms));
pass("level 1 rival metadata exists", Boolean(sprites.sheets.level1Rival));
pass("level 1 companion metadata exists", Boolean(sprites.sheets.level1Companion));
pass("level 1 platforms use expected grid", sprites.sheets.level1Platforms?.frameWidth === 320 && sprites.sheets.level1Platforms?.frameHeight === 150);
pass("level 1 rival uses expected grid", sprites.sheets.level1Rival?.frameWidth === 280 && sprites.sheets.level1Rival?.frameHeight === 360);
pass("level 1 companion uses expected grid", sprites.sheets.level1Companion?.frameWidth === 220 && sprites.sheets.level1Companion?.frameHeight === 300);
pass("types support level images", typesSource.includes("imageSrc?: string"));
pass("types support per-platform sheet", typesSource.includes("spriteSheet?: string"));
pass("types support per-rival sheet", typesSource.includes("spriteSheet?: string"));
pass("game preloads background images", gameSource.includes("backgroundImages") && gameSource.includes("loadBackgroundImage"));
pass("game draws background image", gameSource.includes("background.imageSrc") && gameSource.includes("ctx.drawImage(backgroundImage"));
pass("game draws platform sheet by data", gameSource.includes('platform.spriteSheet ?? "platforms"'));
pass("game draws rival sheet by data", gameSource.includes('rival.spriteSheet ?? "cristiano"'));
pass("tutorial remains present", levelsSource.includes('stageLabel: "Tutorial"') && levelsSource.includes("tutorial-golden-boot"));
pass("level 1 real exists", levelsSource.includes('stageLabel: "Nivel 1"') && levelsSource.includes("Barcelona / Nace el 10"));
pass("level 1 uses Camp Nou background", levelsSource.includes('/assets/levels/level-1-background.png'));
pass("level 1 uses generated sprites", ["level1Platforms", "level1Rival"].every((token) => levelsSource.includes(token)));
pass("level 1 is harder than tutorial", levelsSource.includes("duration: 4.2") && levelsSource.includes("min: 1600"));
pass("menu declares v3.4", pageSource.includes("Mobile v3.4"));
pass("play button opens level selector", pageSource.includes("openLevelSelect") && pageSource.includes("Seleccion de niveles"));
pass("selector includes tutorial and five levels", ["Tutorial", "Nivel 1", "Nivel 5"].every((token) => pageSource.includes(token)));
pass("selector can play level by index", pageSource.includes("playLevel(slot.levelIndex)"));
pass("selector has mobile styles", stylesSource.includes(".levelSelectPanel") && stylesSource.includes(".levelCardGrid") && stylesSource.includes(".levelCardCover"));
pass("roadmap documents v3.4", roadmapSource.includes("V3.4 - Selector Y Nivel 1 Real"));
pass("readme documents v3.4", readmeSource.includes("### V3.4") && readmeSource.includes("Selector de niveles"));

console.log("V3.4 level selector and Barcelona level checks passed.");

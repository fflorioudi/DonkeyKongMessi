import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const gameSource = readFileSync(join(root, "game", "Game.ts"), "utf8");
const typesSource = readFileSync(join(root, "game", "types.ts"), "utf8");
const levelsSource = readFileSync(join(root, "data", "levels.ts"), "utf8");
const pageSource = readFileSync(join(root, "app", "donkey-messi", "page.tsx"), "utf8");
const stylesSource = readFileSync(join(root, "app", "donkey-messi", "styles.css"), "utf8");
const roadmapSource = readFileSync(join(root, "docs", "ROADMAP_HASTA_FASE_2.md"), "utf8");
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

function pass(label, condition) {
  if (!condition) {
    throw new Error(`${label} failed`);
  }

  console.log(`ok - ${label}`);
}

pass("qa script is registered", packageJson.scripts["qa:v2.8"] === "node scripts/qa-v28.mjs");
pass("level type exposes difficulty config", typesSource.includes("LevelDifficultyDefinition"));
pass("level type exposes background config", typesSource.includes("LevelBackgroundDefinition"));
pass("level type exposes rival config", typesSource.includes("RivalDefinition"));
pass("snapshot exposes level selection", typesSource.includes("levelIndex: number") && typesSource.includes("levelCount: number"));
pass("level data includes difficulty", levelsSource.includes("difficulty:") && levelsSource.includes("timeBonusPerSecond"));
pass("level data includes background", levelsSource.includes("background:") && levelsSource.includes("groundBands"));
pass("level data includes rival", levelsSource.includes("rival:") && levelsSource.includes("facingLeft"));
pass("platform data declares sprite frames", levelsSource.includes("spriteFrame"));
pass("game receives level catalog", gameSource.includes("levels: LevelDefinition[]") && gameSource.includes("this.levels = levels"));
pass("game can select level by index", gameSource.includes("selectLevel(index: number)") && gameSource.includes("this.levelIndex = index"));
pass("records are per level", gameSource.includes("highScoreKey(this.level)") && gameSource.includes("bestTimeKey(this.level)"));
pass("scoring uses level difficulty", gameSource.includes("this.level.difficulty") && gameSource.includes("completionBonus"));
pass("background is data driven", gameSource.includes("const { background } = this.level") && gameSource.includes("background.groundBands"));
pass("rival render is data driven", gameSource.includes("const { rival } = this.level") && gameSource.includes("rival.facingLeft"));
pass("page passes all levels", pageSource.includes("new Game(canvas, levels, setSnapshot)"));
pass("menu plants campaign path", pageSource.includes("campaignPath") && pageSource.includes("Nivel 5"));
pass("campaign path has styles", stylesSource.includes(".campaignPath"));
pass("roadmap mentions v2.8", roadmapSource.includes("V2.8 - Preparacion Para Multiples Niveles"));

console.log("V2.8 multi-level preparation checks passed.");

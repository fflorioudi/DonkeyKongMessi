import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const sprites = JSON.parse(readFileSync(join(root, "public", "sprites", "sprites.json"), "utf8"));
const playerSource = readFileSync(join(root, "entities", "Player.ts"), "utf8");
const victorySource = readFileSync(join(root, "ui", "Victory.tsx"), "utf8");
const stylesSource = readFileSync(join(root, "app", "donkey-messi", "styles.css"), "utf8");
const pageSource = readFileSync(join(root, "app", "donkey-messi", "page.tsx"), "utf8");
const readmeSource = readFileSync(join(root, "README.md"), "utf8");

function pass(label, condition) {
  if (!condition) {
    throw new Error(`${label} failed`);
  }

  console.log(`ok - ${label}`);
}

pass("qa script is registered", packageJson.scripts["qa:v3.4.5"] === "node scripts/qa-v345.mjs");
pass("victory ui extractor is registered", packageJson.scripts["assets:victory-ui"] === "node scripts/prepare-victory-ui-assets.mjs");
pass("qa doc exists", existsSync(join(root, "docs", "QA_V345.md")));
pass("clean tutorial victory exists", existsSync(join(root, "public", "assets", "ui", "final-level-0-clean.png")));
pass("clean level 1 victory exists", existsSync(join(root, "public", "assets", "ui", "final-level-1-clean.png")));
pass("victory uses clean images", victorySource.includes("final-level-0-clean.png") && victorySource.includes("final-level-1-clean.png"));
pass("victory time omits duplicated suffix", victorySource.includes("formatTimeValue") && !victorySource.includes('toFixed(1)}s'));
pass("victory score never displays negative", victorySource.includes("Math.max(0, Math.floor(score))"));
pass("victory stats use stronger typography", stylesSource.includes("Impact") && stylesSource.includes("-webkit-text-stroke"));
pass("ladder grab supports airborne recovery", playerSource.includes("const startsJump = input.jump && canJump") && playerSource.includes("return Boolean(findUsableLadder(this.rect, ladders))"));
pass("ladder grab does not steal jump launch", playerSource.includes("!startsJump"));
pass("level 2 rival source exists", existsSync(join(root, "public", "sprites", "source", "level-2-rival-source.png")));
pass("level 2 rival sheet exists", existsSync(join(root, "public", "sprites", "level-2-rival.png")));
pass("level 2 rival metadata exists", Boolean(sprites.sheets.level2Rival));
pass("level 2 rival uses complete-frame pass", sprites.sheets.level2Rival?.frames === 3);
pass("menu declares v3.4.5 or newer", /Mobile v3\.(?:4\.[5-9]\d*|[5-9]\d*(?:\.\d+)?)/.test(pageSource));
pass("readme documents v3.4.5", readmeSource.includes("### V3.4.5") && readmeSource.toLowerCase().includes("tipografia"));

console.log("V3.4.5 victory typography, ladder air lockout, and level 2 rival checks passed.");

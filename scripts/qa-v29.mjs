import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const readmeSource = readFileSync(join(root, "README.md"), "utf8");
const roadmapSource = readFileSync(join(root, "docs", "ROADMAP_HASTA_FASE_2.md"), "utf8");
const pageSource = readFileSync(join(root, "app", "donkey-messi", "page.tsx"), "utf8");
const stylesSource = readFileSync(join(root, "app", "donkey-messi", "styles.css"), "utf8");
const gitignoreSource = readFileSync(join(root, ".gitignore"), "utf8");
const levelsSource = readFileSync(join(root, "data", "levels.ts"), "utf8");
const gameSource = readFileSync(join(root, "game", "Game.ts"), "utf8");

function pass(label, condition) {
  if (!condition) {
    throw new Error(`${label} failed`);
  }

  console.log(`ok - ${label}`);
}

for (const version of ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8", "2.9"]) {
  pass(`qa script v${version} is registered`, Boolean(packageJson.scripts[`qa:v${version}`]));
}

for (const doc of ["QA_V2.md", "QA_V21.md", "QA_V22.md", "QA_V23.md", "QA_V24.md", "QA_V25.md", "QA_V26.md", "QA_V27.md", "QA_V28.md", "QA_V29.md"]) {
  pass(`${doc} exists`, existsSync(join(root, "docs", doc)));
}

pass("menu declares candidate or newer build", /Mobile v(?:2\.9 candidate|3\.\d+)/.test(pageSource));
pass("single level selector stays compact", pageSource.includes("canSelectLevel") && pageSource.includes("isSingle"));
pass("selector styles avoid oversized arrows", stylesSource.includes(".levelPicker.isSingle") && stylesSource.includes(".menuPanel .levelPicker button"));
pass("build artifacts are ignored", gitignoreSource.includes("*.tsbuildinfo") && gitignoreSource.includes(".next-dev.*.log"));
pass("readme closes v2.8", readmeSource.includes("### V2.8") && readmeSource.includes("Estado: cerrada tecnicamente."));
pass("readme documents v2.9", readmeSource.includes("### V2.9") && /candidate build/i.test(readmeSource));
pass("roadmap documents v2.9 deliverables", roadmapSource.includes("QA automatico en `npm run qa:v2.9`"));
pass("level remains data driven", levelsSource.includes("difficulty:") && levelsSource.includes("background:") && levelsSource.includes("rival:"));
pass("game remains catalog driven", gameSource.includes("levels: LevelDefinition[]") && gameSource.includes("selectLevel(index: number)"));

console.log("V2.9 candidate build checks passed.");

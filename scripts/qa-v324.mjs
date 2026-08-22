import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const pageSource = readFileSync(join(root, "app", "donkey-messi", "page.tsx"), "utf8");
const stylesSource = readFileSync(join(root, "app", "donkey-messi", "styles.css"), "utf8");
const extractorSource = readFileSync(join(root, "scripts", "extract-story-ui-assets.py"), "utf8");
const designReadme = readFileSync(join(root, "docs", "README_DISENOS_NIVELES.md"), "utf8");
const gameplayReadme = readFileSync(join(root, "docs", "README_JUGABILIDAD_PENDIENTE.md"), "utf8");

const storyDir = join(root, "public", "assets", "story");
const icons = [
  "story-icon-tutorial-messi.png",
  "story-icon-level1-platform.png",
  "story-icon-level2-fireball.png",
  "story-icon-level3-netball.png",
  "story-icon-level4-hazard.png",
  "story-icon-level5-cup.png",
];

function pass(label, condition) {
  if (!condition) {
    throw new Error(`${label} failed`);
  }

  console.log(`ok - ${label}`);
}

pass("qa script is registered", packageJson.scripts["qa:v3.2.4"] === "node scripts/qa-v324.mjs");
pass("qa doc exists", existsSync(join(root, "docs", "QA_V324.md")));
pass("story source sheet is preserved", existsSync(join(root, "public", "sprites", "source", "chatgpt-story-sheet-20260821-230304.png")));
pass("extractor documents source sheet", extractorSource.includes("chatgpt-story-sheet-20260821-230304.png"));

for (const icon of icons) {
  pass(`${icon} exists`, existsSync(join(storyDir, icon)) && statSync(join(storyDir, icon)).size > 500);
}

pass("story preview exists", existsSync(join(storyDir, "story-icons-preview.png")));
pass("campaign uses rescued icons", icons.every((icon) => pageSource.includes(`/assets/story/${icon}`)));
pass("campaign icon style exists", stylesSource.includes(".campaignIcon"));
pass("menu declares v3.2.4", pageSource.includes("Mobile v3.2.4"));
pass("design readme exists", existsSync(join(root, "docs", "README_DISENOS_NIVELES.md")));
pass("design readme covers required asset areas", ["Fondos", "Historia", "Plataformas", "Rival", "Power-up", "Companero"].every((word) => designReadme.includes(word)));
pass("gameplay readme exists", existsSync(join(root, "docs", "README_JUGABILIDAD_PENDIENTE.md")));
pass("gameplay readme covers core systems", ["Controles", "Camara", "Power-Ups", "Companeros", "Checkpoints", "QA"].every((word) => gameplayReadme.includes(word)));

console.log("V3.2.4 rescued story asset and planning checks passed.");

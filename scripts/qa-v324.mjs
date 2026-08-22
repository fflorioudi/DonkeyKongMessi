import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const pageSource = readFileSync(join(root, "app", "donkey-messi", "page.tsx"), "utf8");
const stylesSource = readFileSync(join(root, "app", "donkey-messi", "styles.css"), "utf8");
const designReadme = readFileSync(join(root, "docs", "README_DISENOS_NIVELES.md"), "utf8");
const gameplayReadme = readFileSync(join(root, "docs", "README_JUGABILIDAD_PENDIENTE.md"), "utf8");

function pass(label, condition) {
  if (!condition) {
    throw new Error(`${label} failed`);
  }

  console.log(`ok - ${label}`);
}

pass("qa script is registered", packageJson.scripts["qa:v3.2.4"] === "node scripts/qa-v324.mjs");
pass("qa doc exists", existsSync(join(root, "docs", "QA_V324.md")));
pass("menu does not render gameplay touch controls", pageSource.includes("{isPlaying && <TouchControls"));
pass("hidden touch controls cannot block menu", stylesSource.includes('.touchControls[aria-hidden="true"]') && stylesSource.includes("display: none"));
pass("campaign no longer uses rescued sheet icons", !pageSource.includes("/assets/story/story-icon-") && !stylesSource.includes(".campaignIcon"));
pass("menu declares v3.2.4", pageSource.includes("Mobile v3.2.4"));
pass("design readme exists", existsSync(join(root, "docs", "README_DISENOS_NIVELES.md")));
pass("design readme covers required asset areas", ["Fondos", "Historia", "Plataformas", "Rival", "Power-up", "Companero"].every((word) => designReadme.includes(word)));
pass("design readme defines proportions", ["390x720", "1080x1920", "separado", "transparente"].every((word) => designReadme.includes(word)));
pass("gameplay readme exists", existsSync(join(root, "docs", "README_JUGABILIDAD_PENDIENTE.md")));
pass("gameplay readme covers core systems", ["Controles", "Camara", "Power-Ups", "Companeros", "Checkpoints", "QA"].every((word) => gameplayReadme.includes(word)));

console.log("V3.2.4 clean cover and planning checks passed.");

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const gameSource = readFileSync(join(root, "game", "Game.ts"), "utf8");
const controlsSource = readFileSync(join(root, "ui", "TouchControls.tsx"), "utf8");
const pauseSource = readFileSync(join(root, "ui", "Pause.tsx"), "utf8");
const victorySource = readFileSync(join(root, "ui", "Victory.tsx"), "utf8");
const pageSource = readFileSync(join(root, "app", "donkey-messi", "page.tsx"), "utf8");
const stylesSource = readFileSync(join(root, "app", "donkey-messi", "styles.css"), "utf8");
const readmeSource = readFileSync(join(root, "README.md"), "utf8");

function pass(label, condition) {
  if (!condition) {
    throw new Error(`${label} failed`);
  }

  console.log(`ok - ${label}`);
}

pass("qa script is registered", packageJson.scripts["qa:v3.4.3"] === "node scripts/qa-v343.mjs");
pass("qa doc exists", existsSync(join(root, "docs", "QA_V343.md")));
pass("pause image exists", existsSync(join(root, "public", "assets", "ui", "cartel-pausa.png")));
pass("tutorial victory image exists", existsSync(join(root, "public", "assets", "ui", "final-level-0.png")));
pass("level 1 victory image exists", existsSync(join(root, "public", "assets", "ui", "final-level-1.png")));
pass("pause uses image overlay hotspots", pauseSource.includes("/assets/ui/cartel-pausa.png") && pauseSource.includes("pauseResume") && pauseSource.includes("pauseRestart") && pauseSource.includes("pauseHome"));
pass("victory uses level-specific images", victorySource.includes("/assets/ui/final-level-0.png") && victorySource.includes("/assets/ui/final-level-1.png"));
pass("victory renders dynamic stats", ["victoryTime", "victoryBest", "victoryScore"].every((token) => victorySource.includes(token)));
pass("victory exposes next level action", victorySource.includes("onNextLevel") && victorySource.includes("canNextLevel"));
pass("page wires next level safely", pageSource.includes("playNextLevel") && pageSource.includes("nextIndex >= levels.length") && pageSource.includes("canNextLevel={snapshot.levelIndex + 1 < levels.length}"));
pass("game can select next after victory", gameSource.includes('"levelComplete"') && gameSource.includes("includes(this.status)"));
pass("touchend no longer kills multi-touch air movement", !controlsSource.includes('window.addEventListener("touchend", resetAll)'));
pass("sticky protection still keeps pointer cancel and focus reset", controlsSource.includes('window.addEventListener("pointercancel", releasePointer)') && controlsSource.includes('window.addEventListener("touchcancel", resetAll)') && controlsSource.includes('window.addEventListener("blur", resetAll)'));
pass("tutorial platform art aligns surface", gameSource.includes("platformSurfaceOffset") && gameSource.includes('sheet !== "level0Platforms"'));
pass("image overlay styles exist", stylesSource.includes(".imageOverlay") && stylesSource.includes(".victoryNext") && stylesSource.includes(".pauseResume"));
pass("menu declares v3.4.3", pageSource.includes("Mobile v3.4.3"));
pass("readme documents v3.4.3", readmeSource.includes("### V3.4.3") && readmeSource.includes("control aereo"));

console.log("V3.4.3 pause/victory overlays and aerial control checks passed.");

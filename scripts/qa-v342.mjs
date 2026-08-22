import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const sprites = JSON.parse(readFileSync(join(root, "public", "sprites", "sprites.json"), "utf8"));
const controlsSource = readFileSync(join(root, "ui", "TouchControls.tsx"), "utf8");
const typesSource = readFileSync(join(root, "game", "types.ts"), "utf8");
const gameSource = readFileSync(join(root, "game", "Game.ts"), "utf8");
const hudSource = readFileSync(join(root, "ui", "HUD.tsx"), "utf8");
const levelsSource = readFileSync(join(root, "data", "levels.ts"), "utf8");
const pageSource = readFileSync(join(root, "app", "donkey-messi", "page.tsx"), "utf8");
const readmeSource = readFileSync(join(root, "README.md"), "utf8");

function pass(label, condition) {
  if (!condition) {
    throw new Error(`${label} failed`);
  }

  console.log(`ok - ${label}`);
}

pass("qa script is registered", packageJson.scripts["qa:v3.4.2"] === "node scripts/qa-v342.mjs");
pass("qa doc exists", existsSync(join(root, "docs", "QA_V342.md")));
pass("level 0 cover exists", existsSync(join(root, "public", "assets", "levels", "level-0-cover.png")));
pass("level 0 background exists", existsSync(join(root, "public", "assets", "levels", "level-0-background.png")));
pass("level 0 platform sheet exists", existsSync(join(root, "public", "sprites", "level-0-platforms.png")));
pass("level 0 source sheet exists", existsSync(join(root, "public", "sprites", "source", "level-0-platforms-source.png")));
pass("level 0 platform metadata exists", Boolean(sprites.sheets.level0Platforms));
pass("level 0 platform sheet has nine frames", sprites.sheets.level0Platforms?.frames === 9);
pass("tutorial uses new background", levelsSource.includes('imageSrc: "/assets/levels/level-0-background.png"'));
pass("tutorial uses level 0 platforms", levelsSource.includes('spriteSheet: "level0Platforms"'));
pass("selector uses tutorial cover", pageSource.includes("/assets/levels/level-0-cover.png"));
pass("menu declares v3.4.2 or newer", /Mobile v3\.(?:4\.[2-9]\d*|[5-9]\d*(?:\.\d+)?)/.test(pageSource));
pass("touch controls clear stale movement before new direction", controlsSource.includes("activeMoves.current.clear()"));
pass("touch controls reset on mouse up and touch cancel", ["mouseup", "touchcancel"].every((event) => controlsSource.includes(`"${event}"`)));
pass("touch controls handle leaving the button", controlsSource.includes("onPointerLeave") && controlsSource.includes("onPointerOut"));
pass("power-up type supports Ronaldinho", typesSource.includes('"golden-boot" | "ronaldinho"'));
pass("level 1 includes Ronaldinho assist", levelsSource.includes('id: "level-1-ronaldinho-assist"') && levelsSource.includes('label: "Ronaldinho"'));
pass("Ronaldinho uses companion sprite", levelsSource.includes('spriteSheet: "level1Companion"') && levelsSource.includes('animation: "idle"'));
pass("power-up draw uses per-pickup sprite sheet", gameSource.includes('powerUp.spriteSheet ?? "goldenBoot"'));
pass("power-up message uses pickup label", gameSource.includes("`${powerUp.label}: invencible`"));
pass("HUD renders active power-up label", hudSource.includes("{snapshot.activePowerUp.label}"));
pass("readme documents v3.4.2", readmeSource.includes("### V3.4.2") && readmeSource.includes("Ronaldinho"));

console.log("V3.4.2 tutorial assets, Ronaldinho assist, and sticky input checks passed.");

import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const pageSource = readFileSync(join(root, "app", "donkey-messi", "page.tsx"), "utf8");
const stylesSource = readFileSync(join(root, "app", "donkey-messi", "styles.css"), "utf8");
const typesSource = readFileSync(join(root, "game", "types.ts"), "utf8");
const gameSource = readFileSync(join(root, "game", "Game.ts"), "utf8");
const levelsSource = readFileSync(join(root, "data", "levels.ts"), "utf8");
const hudSource = readFileSync(join(root, "ui", "HUD.tsx"), "utf8");
const readmeSource = readFileSync(join(root, "README.md"), "utf8");
const coverPath = join(root, "public", "assets", "cover-chatgpt-escalada-del-10.png");

function pass(label, condition) {
  if (!condition) {
    throw new Error(`${label} failed`);
  }

  console.log(`ok - ${label}`);
}

pass("qa script is registered", packageJson.scripts["qa:v3.2.3"] === "node scripts/qa-v323.mjs");
pass("qa doc exists", existsSync(join(root, "docs", "QA_V323.md")));
pass("new cover asset exists", existsSync(coverPath) && statSync(coverPath).size > 1_000_000);
pass("menu uses new cover", pageSource.includes("/assets/cover-chatgpt-escalada-del-10.png"));
pass("old overlay title is not duplicated", !pageSource.includes("Donkey Kong: Edicion Messi"));
pass("cover uses real hotspots", pageSource.includes("coverHotspotPlay") && pageSource.includes("coverHotspotTraining") && pageSource.includes("coverHotspotAudio"));
pass("hotspots stay visually quiet", stylesSource.includes("background: transparent") && stylesSource.includes(".srOnly"));
pass("menu audio is embedded in cover", pageSource.includes("coverHotspotAudio") && pageSource.includes("testAudio"));
pass("top sound button hidden on menu", pageSource.includes('snapshot.status !== "menu"'));
pass("campaign path plants tutorial plus five levels", pageSource.includes("Tutorial") && pageSource.includes("Nivel 1") && pageSource.includes("Nivel 5"));
pass("menu declares v3.2.3 or newer", /Mobile v3\.2\.\d+/.test(pageSource));
pass("tutorial has display label", typesSource.includes("stageLabel?: string") && levelsSource.includes('stageLabel: "Tutorial"'));
pass("snapshot exposes display label", typesSource.includes("levelLabel: string") && gameSource.includes("levelLabel: this.level.stageLabel"));
pass("hud uses display label", hudSource.includes("snapshot.levelLabel"));
pass("readme documents v3.2.3", readmeSource.includes("### V3.2.3") && /portada nueva/i.test(readmeSource));

console.log("V3.2.3 cover and story foundation checks passed.");

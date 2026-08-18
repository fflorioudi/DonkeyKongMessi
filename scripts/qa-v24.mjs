import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const pageSource = readFileSync(join(root, "app", "donkey-messi", "page.tsx"), "utf8");
const gameSource = readFileSync(join(root, "game", "Game.ts"), "utf8");
const stylesSource = readFileSync(join(root, "app", "donkey-messi", "styles.css"), "utf8");
const coverPath = join(root, "public", "assets", "cover-v24-worldcup.png");

function pass(label, condition) {
  if (!condition) {
    throw new Error(`${label} failed`);
  }

  console.log(`ok - ${label}`);
}

pass("cover asset exists", existsSync(coverPath));
pass("cover asset is non-empty", statSync(coverPath).size > 100_000);
pass("menu uses world cup cover art", pageSource.includes("/assets/cover-v24-worldcup.png") && stylesSource.includes(".coverArt"));
pass("training flow exists", pageSource.includes("showTraining") && pageSource.includes("Entrenamiento"));
pass("game can return to menu", gameSource.includes("menu()") && pageSource.includes("showMenu"));
pass("pause has menu exit", pageSource.includes("onMenu={showMenu}") && readFileSync(join(root, "ui", "Pause.tsx"), "utf8").includes("Inicio"));
pass("end screens show score and menu action", readFileSync(join(root, "ui", "Victory.tsx"), "utf8").includes("Puntos") && readFileSync(join(root, "ui", "GameOver.tsx"), "utf8").includes("Inicio"));
pass("menu panel avoids card-heavy center overlay", stylesSource.includes(".menuPanel") && stylesSource.includes("bottom:"));

console.log("V2.4 flow checks passed.");

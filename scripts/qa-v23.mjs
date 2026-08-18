import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const gameSource = readFileSync(join(root, "game", "Game.ts"), "utf8");
const controlsSource = readFileSync(join(root, "ui", "TouchControls.tsx"), "utf8");
const stylesSource = readFileSync(join(root, "app", "donkey-messi", "styles.css"), "utf8");

function pass(label, condition) {
  if (!condition) {
    throw new Error(`${label} failed`);
  }

  console.log(`ok - ${label}`);
}

pass("ladder highlight has no aura rectangle", !gameSource.includes("ladder.x - 9"));
pass("active ladder still marks rails", gameSource.includes("strokeRect(ladder.x + 5") && gameSource.includes("#ffe45c"));
pass("climb controls are contextual", controlsSource.includes("aria-hidden={!canClimb}") && stylesSource.includes(".climbCluster.isActive"));
pass("inactive climb controls cannot intercept touches", stylesSource.includes("pointer-events: none") && stylesSource.includes("pointer-events: auto"));
pass("touch buttons expose pressed state", controlsSource.includes("dataset.pressed") && stylesSource.includes('[data-pressed="true"]'));
pass("mobile haptics are attempted safely", controlsSource.includes("navigator.vibrate(8)"));
pass("touch controls keep pointer capture", controlsSource.includes("setPointerCapture") && controlsSource.includes("releasePointerCapture"));

console.log("V2.3 control checks passed.");

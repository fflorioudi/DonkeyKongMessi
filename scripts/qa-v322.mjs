import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const controlsSource = readFileSync(join(root, "ui", "TouchControls.tsx"), "utf8");
const pageSource = readFileSync(join(root, "app", "donkey-messi", "page.tsx"), "utf8");
const readmeSource = readFileSync(join(root, "README.md"), "utf8");

function pass(label, condition) {
  if (!condition) {
    throw new Error(`${label} failed`);
  }

  console.log(`ok - ${label}`);
}

pass("qa script is registered", packageJson.scripts["qa:v3.2.2"] === "node scripts/qa-v322.mjs");
pass("qa doc exists", existsSync(join(root, "docs", "QA_V322.md")));
pass("window pointerup clears active direction", controlsSource.includes('window.addEventListener("pointerup", releasePointer)'));
pass("window pointercancel clears active direction", controlsSource.includes('window.addEventListener("pointercancel", releasePointer)'));
pass("window blur resets all input", controlsSource.includes('window.addEventListener("blur", resetAll)') && controlsSource.includes("input?.reset()"));
pass("visibilitychange resets all input", controlsSource.includes('document.addEventListener("visibilitychange", resetAll)'));
pass("lost pointer capture is handled", controlsSource.includes("onLostPointerCapture"));
pass("button release checks active pointer", controlsSource.includes("activePointer.current !== pointerId"));
pass("button release guards pointer capture", controlsSource.includes("hasPointerCapture(pointerId)"));
pass("menu declares v3.2.2", pageSource.includes("Mobile v3.2.2"));
pass("readme documents v3.2.2", readmeSource.includes("### V3.2.2") && readmeSource.includes("pointerup"));

console.log("V3.2.2 sticky touch input checks passed.");

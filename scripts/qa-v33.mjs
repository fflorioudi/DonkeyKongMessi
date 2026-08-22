import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const sprites = JSON.parse(readFileSync(join(root, "public", "sprites", "sprites.json"), "utf8"));
const gameSource = readFileSync(join(root, "game", "Game.ts"), "utf8");
const typesSource = readFileSync(join(root, "game", "types.ts"), "utf8");
const levelsSource = readFileSync(join(root, "data", "levels.ts"), "utf8");
const obstacleSource = readFileSync(join(root, "entities", "Obstacle.ts"), "utf8");
const hudSource = readFileSync(join(root, "ui", "HUD.tsx"), "utf8");
const audioSource = readFileSync(join(root, "game", "Audio.ts"), "utf8");
const pageSource = readFileSync(join(root, "app", "donkey-messi", "page.tsx"), "utf8");
const roadmapSource = readFileSync(join(root, "docs", "ROADMAP_FASE_2_V3.md"), "utf8");

function pass(label, condition) {
  if (!condition) {
    throw new Error(`${label} failed`);
  }

  console.log(`ok - ${label}`);
}

pass("qa script is registered", packageJson.scripts["qa:v3.3"] === "node scripts/qa-v33.mjs");
pass("asset extractor is registered", packageJson.scripts["assets:powerup:botin"] === "node scripts/extract-powerup-botin.mjs");
pass("qa doc exists", existsSync(join(root, "docs", "QA_V33.md")));
pass("power-up source exists", existsSync(join(root, "public", "sprites", "source", "power-up-botin-de-oro-source.png")));
pass("power-up runtime sheet exists", existsSync(join(root, "public", "sprites", "power-up-botin-de-oro.png")));
pass("golden boot metadata exists", Boolean(sprites.sheets.goldenBoot));
pass("golden boot uses 160 cells", sprites.sheets.goldenBoot?.frameWidth === 160 && sprites.sheets.goldenBoot?.frameHeight === 160);
pass("golden boot has 8 frames", sprites.sheets.goldenBoot?.frames === 8);
pass("golden boot has pulse animation", sprites.sheets.goldenBoot?.animations?.pulse?.length >= 8);
pass("types expose power-up definition", typesSource.includes("PowerUpDefinition") && typesSource.includes("PowerUpEffectDefinition"));
pass("snapshot exposes active power-up", typesSource.includes("activePowerUp: ActivePowerUpSnapshot | null"));
pass("level definition owns power-ups", typesSource.includes("powerUps: PowerUpDefinition[]"));
pass("tutorial includes golden boot", levelsSource.includes('kind: "golden-boot"') && levelsSource.includes("tutorial-golden-boot"));
pass("tutorial power-up grants invincibility", levelsSource.includes('kind: "invincibility"') && levelsSource.includes("duration: 5.5"));
pass("game stores runtime power-ups", gameSource.includes("RuntimePowerUp") && gameSource.includes("createPowerUps(this.level)"));
pass("game collects power-ups", gameSource.includes("collectPowerUps") && gameSource.includes("activatePowerUp"));
pass("game tracks invincibility timer", gameSource.includes("invincibilityTimer") && gameSource.includes("invincibilityDuration"));
pass("invincible player destroys obstacle", gameSource.includes("obstacle.destroy()") && gameSource.includes("this.invincibilityTimer > 0"));
pass("power-up is rendered with sprite", gameSource.includes('"goldenBoot"'));
pass("power-up draw has no rectangle fallback", !gameSource.includes("fillRect(powerUp") && !gameSource.includes("strokeRect(powerUp"));
pass("obstacles can be destroyed", obstacleSource.includes("destroy()") && obstacleSource.includes("this.ball.alive = false"));
pass("hud renders active power-up", hudSource.includes("snapshot.activePowerUp") && hudSource.includes("hudPower"));
pass("audio exposes power-up sound", audioSource.includes("playPowerUp()"));
pass("menu declares v3.3", pageSource.includes("Mobile v3.3"));
pass("roadmap mentions v3.3", roadmapSource.includes("V3.3 - Power-Up Basico"));

console.log("V3.3 golden boot power-up checks passed.");

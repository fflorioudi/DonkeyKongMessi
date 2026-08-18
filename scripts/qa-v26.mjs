import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const spritesDir = join(root, "public", "sprites");
const metadataPath = join(spritesDir, "sprites.json");
const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
const gameSource = readFileSync(join(root, "game", "Game.ts"), "utf8");
const playerSource = readFileSync(join(root, "entities", "Player.ts"), "utf8");
const ballSource = readFileSync(join(root, "entities", "Ball.ts"), "utf8");
const spriteSource = readFileSync(join(root, "game", "Sprites.ts"), "utf8");
const requiredSheets = ["messi", "cristiano", "ball", "worldcup", "platforms", "ladder", "hazards"];
const requiredSources = ["messi-hd-reference.png", "ronaldo-hd-reference.png", "props-hd-reference.png"];

function pass(label, condition, detail = "") {
  if (!condition) {
    throw new Error(`${label} failed ${detail}`);
  }

  console.log(`ok - ${label}`);
}

function pngSize(path) {
  const buffer = readFileSync(path);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

for (const sheetName of requiredSheets) {
  pass(`${sheetName} metadata exists`, Boolean(metadata.sheets[sheetName]));
}

for (const [name, sheet] of Object.entries(metadata.sheets)) {
  const path = join(root, "public", sheet.src);
  const size = pngSize(path);

  pass(`${name} png exists`, existsSync(path));
  pass(`${name} png non-empty`, statSync(path).size > 100);
  pass(`${name} width matches frame grid`, size.width === sheet.frameWidth * sheet.frames, `${size.width}`);
  pass(`${name} height matches frame height`, size.height === sheet.frameHeight, `${size.height}`);
  pass(`${name} has animations`, Object.keys(sheet.animations).length > 0);
  pass(`${name} has pivot metadata`, Number.isFinite(sheet.pivot?.x) && Number.isFinite(sheet.pivot?.y));
}

pass("metadata declares pixel art", metadata.pixelArt === true && metadata.smoothing === false);
pass("metadata declares HD Milo style pass", metadata.version === "v2.6-hd-milo-style");
pass("preview sheet exists", existsSync(join(spritesDir, "preview-v26-hd.png")));
for (const source of requiredSources) {
  pass(`${source} source reference exists`, existsSync(join(spritesDir, "source", source)));
}
pass("messi has HD frame count", metadata.sheets.messi.frames >= 8);
pass("messi frame size upgraded to HD", metadata.sheets.messi.frameWidth >= 260 && metadata.sheets.messi.frameHeight >= 320);
pass("messi has run climb jump hit victory states", ["run", "climb", "jump", "hit", "victory"].every((name) => metadata.sheets.messi.animations[name]));
pass("cristiano has HD frame count", metadata.sheets.cristiano.frames >= 8);
pass("cristiano frame size upgraded to HD", metadata.sheets.cristiano.frameWidth >= 260 && metadata.sheets.cristiano.frameHeight >= 320);
pass("cristiano has throw sequence", metadata.sheets.cristiano.animations.throw.length >= 4);
pass("ball has 8 rolling frames", metadata.sheets.ball.frames >= 8);
pass("worldcup has smoother frame count", metadata.sheets.worldcup.frames >= 12);
pass("platform tiles are high resolution", metadata.sheets.platforms.frameWidth >= 300 && metadata.sheets.platforms.frameHeight >= 140);
pass("sprite manager disables smoothing", spriteSource.includes("imageSmoothingEnabled = false"));
pass("sprite manager supports trimmed drawing", spriteSource.includes("drawTrimmedFrame"));
pass("game loads sprite manager", gameSource.includes("new SpriteManager"));
pass("player uses trimmed messi spritesheet", playerSource.includes("\"messi\"") && playerSource.includes("drawTrimmedFrame"));
pass("ball uses trimmed ball spritesheet", ballSource.includes("\"ball\"") && ballSource.includes("drawTrimmedFrame"));
pass("game uses world cup sprite", gameSource.includes("\"worldcup\""));
pass("game uses platform and ladder sprites", gameSource.includes("\"platforms\"") && gameSource.includes("\"ladder\""));

console.log("V2.6 sprite checks passed.");

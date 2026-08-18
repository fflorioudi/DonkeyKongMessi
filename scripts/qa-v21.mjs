import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const physicsSource = readFileSync(join(root, "game", "physics.ts"), "utf8");
const levelSource = readFileSync(join(root, "data", "levels.ts"), "utf8");

function readConst(name) {
  const match = physicsSource.match(new RegExp(`export const ${name} = (\\d+)`));

  if (!match) {
    throw new Error(`Missing physics const ${name}`);
  }

  return Number(match[1]);
}

function readNumber(name) {
  const match = levelSource.match(new RegExp(`${name}: (\\d+(?:\\.\\d+)?)`));

  if (!match) {
    throw new Error(`Missing level number ${name}`);
  }

  return Number(match[1]);
}

function readPlatforms() {
  const platformBlock = levelSource.match(/platforms: \[([\s\S]*?)\],\r?\n    ladders:/);

  if (!platformBlock) {
    throw new Error("Missing platforms block");
  }

  return [...platformBlock[1].matchAll(/\{ x: (\d+), y: (\d+), width: (\d+), height: (\d+)/g)].map((match) => ({
    x: Number(match[1]),
    y: Number(match[2]),
    width: Number(match[3]),
    height: Number(match[4]),
  }));
}

function pass(label, condition, detail) {
  if (!condition) {
    throw new Error(`${label} failed: ${detail}`);
  }

  console.log(`ok - ${label}`);
}

const gravity = readConst("GRAVITY");
const jumpSpeed = readConst("JUMP_SPEED");
const moveSpeed = readConst("MOVE_SPEED");
const climbSpeed = readConst("CLIMB_SPEED");
const controlSafeZoneTop = readNumber("controlSafeZoneTop");
const firstDelay = readNumber("firstDelay");
const interval = readNumber("interval");
const maxActive = readNumber("maxActive");
const platforms = readPlatforms().sort((a, b) => a.y - b.y);
const jumpHeight = (jumpSpeed * jumpSpeed) / (2 * gravity);
const platformGaps = platforms.slice(1).map((platform, index) => platform.y - platforms[index].y);
const smallestGap = Math.min(...platformGaps);
const bottomPlatform = platforms.at(-1);
const worldHeight = readNumber("worldHeight");
const viewportHeight = levelSource.includes("viewportHeight")
  ? readNumber("viewportHeight")
  : worldHeight;
const cameraStartY = Math.max(0, worldHeight - viewportHeight);
const bottomPlatformScreenY = bottomPlatform.y - cameraStartY;

pass(
  "jump cannot replace ladders",
  jumpHeight < smallestGap - 10,
  `jumpHeight=${jumpHeight.toFixed(1)}, smallestGap=${smallestGap}`,
);
pass("jump can clear balls", jumpHeight > 52, `jumpHeight=${jumpHeight.toFixed(1)}`);
pass(
  "bottom platform leaves control safe zone",
  bottomPlatformScreenY + bottomPlatform.height <= controlSafeZoneTop,
  `screenY=${bottomPlatformScreenY}, controlSafeZoneTop=${controlSafeZoneTop}`,
);
pass("ball spawner starts after player can react", firstDelay >= 1, `firstDelay=${firstDelay}`);
pass("ball interval is readable for v2.1", interval >= 3.4, `interval=${interval}`);
pass("active balls keep a safety cap", maxActive <= 8, `maxActive=${maxActive}`);
pass("movement remains arcade but controllable", moveSpeed >= 220 && moveSpeed <= 250, `moveSpeed=${moveSpeed}`);
pass("climb speed is slower than run speed", climbSpeed < moveSpeed, `climbSpeed=${climbSpeed}, moveSpeed=${moveSpeed}`);

console.log("V2.1 balance checks passed.");

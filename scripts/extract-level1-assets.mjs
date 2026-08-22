import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceRoot = "C:/Users/ffeli/Downloads";
const paths = {
  platforms: join(sourceRoot, "level-1-platforms.png"),
  background: join(sourceRoot, "level-1-background.png"),
  rival: join(sourceRoot, "level-1-rival.png"),
  companions: join(sourceRoot, "level-1-companions.png"),
  messi: join(sourceRoot, "level-1-messi.png"),
  cover: join(sourceRoot, "level-1-cover.png"),
};
const metadataPath = join(root, "public", "sprites", "sprites.json");

for (const [label, path] of Object.entries(paths)) {
  if (!existsSync(path)) {
    throw new Error(`Missing Level 1 ${label} asset: ${path}`);
  }
}

copySource(paths.platforms, "level-1-platforms-source.png");
copySource(paths.rival, "level-1-rival-source.png");
copySource(paths.companions, "level-1-companions-source.png");
copySource(paths.messi, "level-1-messi-source.png");

const backgroundOutput = join(root, "public", "assets", "levels", "level-1-background.png");
mkdirSync(dirname(backgroundOutput), { recursive: true });
copyFileSync(paths.background, backgroundOutput);
copyFileSync(paths.cover, join(root, "public", "assets", "levels", "level-1-cover.png"));

await normalizeSheet({
  input: paths.messi,
  output: join(root, "public", "sprites", "level-1-messi.png"),
  frameWidth: 280,
  frameHeight: 360,
  maxWidth: 260,
  maxHeight: 350,
  boxes: [
    { x: 42, y: 179, width: 149, height: 344 },
    { x: 286, y: 189, width: 197, height: 334 },
    { x: 549, y: 188, width: 195, height: 336 },
    { x: 793, y: 194, width: 268, height: 330 },
    { x: 1116, y: 175, width: 201, height: 349 },
    { x: 1427, y: 173, width: 148, height: 351 },
    { x: 1644, y: 197, width: 249, height: 327 },
    { x: 1943, y: 176, width: 200, height: 347 },
  ],
  bottomPadding: 4,
  scaleMode: "contain",
  sheetKey: "level1Messi",
  animations: {
    idle: [0],
    run: [1, 2, 3, 2],
    jump: [4],
    climb: [5],
    hit: [6],
    victory: [7],
  },
  pivot: { x: 140, y: 356 },
});

await normalizeSheet({
  input: paths.platforms,
  output: join(root, "public", "sprites", "level-1-platforms.png"),
  frameWidth: 320,
  frameHeight: 150,
  maxWidth: 310,
  maxHeight: 138,
  boxes: [
    { x: 21, y: 33, width: 727, height: 124 },
    { x: 788, y: 33, width: 725, height: 124 },
    { x: 95, y: 195, width: 580, height: 110 },
    { x: 862, y: 195, width: 582, height: 110 },
    { x: 95, y: 331, width: 580, height: 96 },
    { x: 865, y: 331, width: 579, height: 96 },
    { x: 74, y: 461, width: 618, height: 126 },
    { x: 854, y: 461, width: 616, height: 126 },
  ],
  bottomPadding: 6,
  scaleMode: "contain",
  sheetKey: "level1Platforms",
  animations: {
    longBlue: [0],
    longRed: [1],
    mediumBlue: [2],
    mediumRed: [3],
    beamBlue: [4],
    beamRed: [5],
    grassBlue: [6],
    grassRed: [7],
  },
  pivot: { x: 160, y: 144 },
});

await normalizeSheet({
  input: paths.rival,
  output: join(root, "public", "sprites", "level-1-rival.png"),
  frameWidth: 280,
  frameHeight: 360,
  maxWidth: 256,
  maxHeight: 342,
  boxes: [
    { x: 21, y: 110, width: 207, height: 475 },
    { x: 241, y: 124, width: 205, height: 461 },
    { x: 468, y: 104, width: 208, height: 481 },
    { x: 695, y: 171, width: 300, height: 414 },
    { x: 1032, y: 157, width: 342, height: 428 },
    { x: 1320, y: 248, width: 254, height: 337 },
    { x: 1586, y: 252, width: 309, height: 333 },
    { x: 1906, y: 168, width: 255, height: 417 },
  ],
  bottomPadding: 4,
  scaleMode: "contain",
  sheetKey: "level1Rival",
  animations: {
    idle: [0, 1],
    taunt: [6],
    throw: [2, 3, 4],
    hit: [5],
    victory: [7],
  },
  pivot: { x: 140, y: 356 },
});

await normalizeSheet({
  input: paths.companions,
  output: join(root, "public", "sprites", "level-1-companions.png"),
  frameWidth: 220,
  frameHeight: 300,
  maxWidth: 206,
  maxHeight: 286,
  boxes: [
    { x: 16, y: 6, width: 185, height: 320 },
    { x: 224, y: 4, width: 190, height: 325 },
    { x: 432, y: 25, width: 208, height: 306 },
    { x: 650, y: 36, width: 228, height: 294 },
    { x: 855, y: 44, width: 232, height: 280 },
    { x: 1072, y: 58, width: 228, height: 270 },
    { x: 1298, y: 5, width: 222, height: 320 },
    { x: 640, y: 362, width: 248, height: 306 },
  ],
  bottomPadding: 4,
  scaleMode: "contain",
  sheetKey: "level1Companion",
  animations: {
    idle: [0, 1],
    dribble: [2, 3, 4],
    assist: [5, 7],
    celebrate: [6],
  },
  pivot: { x: 110, y: 296 },
});

function copySource(input, filename) {
  const output = join(root, "public", "sprites", "source", filename);
  mkdirSync(dirname(output), { recursive: true });
  copyFileSync(input, output);
}

async function normalizeSheet({
  input,
  output,
  frameWidth,
  frameHeight,
  maxWidth,
  maxHeight,
  boxes,
  bottomPadding,
  scaleMode,
  sheetKey,
  animations,
  pivot,
}) {
  mkdirSync(dirname(output), { recursive: true });
  const composites = [];
  const trims = [];

  for (const [index, box] of boxes.entries()) {
    const crop = await sharp(input, { limitInputPixels: false })
      .ensureAlpha()
      .extract({ left: box.x, top: box.y, width: box.width, height: box.height })
      .png()
      .toBuffer();
    const bounds = await alphaBounds(crop);
    const trimmed = await sharp(crop)
      .ensureAlpha()
      .extract({ left: bounds.x, top: bounds.y, width: bounds.width, height: bounds.height })
      .png()
      .toBuffer();
    const scale = scaleMode === "contain" ? Math.min(maxWidth / bounds.width, maxHeight / bounds.height, 1) : 1;
    const resizedWidth = Math.max(1, Math.round(bounds.width * scale));
    const resizedHeight = Math.max(1, Math.round(bounds.height * scale));
    const resized = await sharp(trimmed)
      .resize(resizedWidth, resizedHeight, { fit: "fill", kernel: "lanczos3" })
      .png()
      .toBuffer();
    const left = Math.round(index * frameWidth + (frameWidth - resizedWidth) / 2);
    const top = Math.round(frameHeight - resizedHeight - bottomPadding);

    composites.push({ input: resized, left, top });
    trims.push({ x: left - index * frameWidth, y: top, w: resizedWidth, h: resizedHeight });
  }

  await sharp({
    create: {
      width: frameWidth * boxes.length,
      height: frameHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png()
    .toFile(output);

  const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
  metadata.sheets[sheetKey] = {
    src: `/sprites/${output.split(/[\\/]/).pop()}`,
    frameWidth,
    frameHeight,
    frames: boxes.length,
    animations,
    pivot,
    trims,
  };
  writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
}

async function alphaBounds(buffer) {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let minX = info.width;
  let minY = info.height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (data[(y * info.width + x) * 4 + 3] <= 12) {
        continue;
      }

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (minX > maxX || minY > maxY) {
    return { x: 0, y: 0, width: info.width, height: info.height };
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceRoot = "C:/Users/ffeli/Downloads";
const paths = {
  background: join(sourceRoot, "level-2-background.png"),
  platforms: join(sourceRoot, "level-2-platforms.png"),
  rival: join(sourceRoot, "level-2-rival.png"),
};
const metadataPath = join(root, "public", "sprites", "sprites.json");

for (const [label, path] of Object.entries(paths)) {
  if (!existsSync(path)) {
    throw new Error(`Missing level 2 ${label} asset: ${path}`);
  }
}

copySource(paths.platforms, "level-2-platforms-source.png");
copySource(paths.rival, "level-2-rival-source.png");

const levelsDir = join(root, "public", "assets", "levels");
mkdirSync(levelsDir, { recursive: true });
copyFileSync(paths.background, join(levelsDir, "level-2-background.png"));

await normalizeSheet({
  input: paths.platforms,
  output: join(root, "public", "sprites", "level-2-platforms.png"),
  frameWidth: 320,
  frameHeight: 150,
  maxWidth: 308,
  maxHeight: 138,
  boxes: [
    { x: 26, y: 70, width: 871, height: 139 },
    { x: 934, y: 66, width: 309, height: 114 },
    { x: 1254, y: 13, width: 276, height: 203 },
    { x: 37, y: 237, width: 849, height: 128 },
    { x: 918, y: 232, width: 243, height: 94 },
    { x: 1151, y: 244, width: 374, height: 220 },
    { x: 27, y: 406, width: 448, height: 125 },
    { x: 513, y: 401, width: 496, height: 142 },
    { x: 1031, y: 497, width: 472, height: 249 },
    { x: 29, y: 570, width: 580, height: 172 },
    { x: 637, y: 587, width: 357, height: 168 },
    { x: 33, y: 821, width: 170, height: 156 },
    { x: 251, y: 767, width: 164, height: 234 },
    { x: 456, y: 869, width: 290, height: 69 },
    { x: 805, y: 854, width: 182, height: 102 },
    { x: 1036, y: 795, width: 479, height: 184 },
  ],
  sheetKey: "level2Platforms",
  animations: {
    longBeam: [0],
    mediumBeam: [1],
    hangingSmall: [2],
    longFlat: [3],
    smallFlat: [4],
    hangingBeam: [5],
    meshMedium: [6],
    railMedium: [7],
    ramp: [8],
    glassLong: [9],
    glassMedium: [10],
    cube: [11],
    pillar: [12],
    speedPad: [13],
    portal: [14],
    longLight: [15],
  },
});

await normalizeSheet({
  input: paths.rival,
  output: join(root, "public", "sprites", "level-2-rival.png"),
  frameWidth: 280,
  frameHeight: 360,
  maxWidth: 256,
  maxHeight: 342,
  boxes: [
    { x: 13, y: 174, width: 191, height: 386 },
    { x: 229, y: 176, width: 206, height: 382 },
    { x: 445, y: 147, width: 202, height: 411 },
  ],
  sheetKey: "level2Rival",
  animations: {
    idle: [0, 1],
    throw: [2],
    guard: [1],
    victory: [1],
  },
});

function copySource(input, filename) {
  const output = join(root, "public", "sprites", "source", filename);
  mkdirSync(dirname(output), { recursive: true });
  copyFileSync(input, output);
}

async function normalizeSheet({ input, output, frameWidth, frameHeight, maxWidth, maxHeight, boxes, sheetKey, animations }) {
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
    const scale = Math.min(maxWidth / bounds.width, maxHeight / bounds.height, 1);
    const resizedWidth = Math.max(1, Math.round(bounds.width * scale));
    const resizedHeight = Math.max(1, Math.round(bounds.height * scale));
    const resized = await sharp(trimmed)
      .resize(resizedWidth, resizedHeight, { fit: "fill", kernel: "lanczos3" })
      .png()
      .toBuffer();
    const left = Math.round(index * frameWidth + (frameWidth - resizedWidth) / 2);
    const top = Math.round(frameHeight - resizedHeight - 6);

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
    pivot: { x: 160, y: 144 },
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

  return minX > maxX
    ? { x: 0, y: 0, width: info.width, height: info.height }
    : { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

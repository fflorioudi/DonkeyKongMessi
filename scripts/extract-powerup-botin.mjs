import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const input = process.argv[2] ?? "C:/Users/ffeli/Downloads/power-up-botin-de-oro.png";
const sourceOutput = join(root, "public", "sprites", "source", "power-up-botin-de-oro-source.png");
const sheetOutput = join(root, "public", "sprites", "power-up-botin-de-oro.png");
const metadataPath = join(root, "public", "sprites", "sprites.json");
const cell = 160;
const safeSize = 148;
const alphaThreshold = 10;
const frameRanges = [
  [19, 231],
  [274, 496],
  [540, 776],
  [824, 1068],
  [1087, 1392],
  [1402, 1647],
  [1654, 1890],
  [1921, 2147],
];

if (!existsSync(input)) {
  throw new Error(`Power-up source not found: ${input}`);
}

mkdirSync(dirname(sourceOutput), { recursive: true });
copyFileSync(input, sourceOutput);

const source = sharp(input, { limitInputPixels: false }).ensureAlpha();
const { data, info } = await source.raw().toBuffer({ resolveWithObject: true });
const bounds = frameRanges.map(([startX, endX]) => findBounds(data, info.width, info.height, startX, endX));
const maxWidth = Math.max(...bounds.map((box) => box.width));
const maxHeight = Math.max(...bounds.map((box) => box.height));
const scale = Math.min(safeSize / maxWidth, safeSize / maxHeight);
const trims = [];
const composites = [];

for (const [index, box] of bounds.entries()) {
  const resizedWidth = Math.max(1, Math.round(box.width * scale));
  const resizedHeight = Math.max(1, Math.round(box.height * scale));
  const left = Math.round(index * cell + (cell - resizedWidth) / 2);
  const top = Math.round(cell - resizedHeight - 4);
  const frame = await sharp(input, { limitInputPixels: false })
    .ensureAlpha()
    .extract({ left: box.x, top: box.y, width: box.width, height: box.height })
    .resize(resizedWidth, resizedHeight, { fit: "fill", kernel: "nearest" })
    .png()
    .toBuffer();

  composites.push({ input: frame, left, top });
  trims.push({ x: left - index * cell, y: top, w: resizedWidth, h: resizedHeight });
}

await sharp({
  create: {
    width: cell * frameRanges.length,
    height: cell,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite(composites)
  .png()
  .toFile(sheetOutput);

const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
metadata.sheets.goldenBoot = {
  src: "/sprites/power-up-botin-de-oro.png",
  frameWidth: cell,
  frameHeight: cell,
  frames: frameRanges.length,
  animations: {
    pulse: [0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1],
  },
  pivot: {
    x: 80,
    y: 156,
  },
  trims,
};
writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);

function findBounds(buffer, width, height, startX, endX) {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let x = startX; x <= endX; x += 1) {
    for (let y = 0; y < height; y += 1) {
      if (buffer[(y * width + x) * 4 + 3] <= alphaThreshold) {
        continue;
      }

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (minX > maxX || minY > maxY) {
    throw new Error(`Empty power-up frame range: ${startX}-${endX}`);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

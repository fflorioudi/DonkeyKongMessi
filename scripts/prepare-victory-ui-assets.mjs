import { existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceDir = join(root, "public", "assets", "ui");
const assets = [
  {
    input: join(sourceDir, "final-level-0.png"),
    output: join(sourceDir, "final-level-0-clean.png"),
  },
  {
    input: join(sourceDir, "final-level-1.png"),
    output: join(sourceDir, "final-level-1-clean.png"),
  },
];

const covers = [
  { x: 258, y: 875, width: 235, height: 88, radius: 12 },
  { x: 640, y: 875, width: 232, height: 88, radius: 12 },
  { x: 333, y: 1028, width: 456, height: 108, radius: 14 },
];

for (const asset of assets) {
  if (!existsSync(asset.input)) {
    throw new Error(`Missing victory source asset: ${asset.input}`);
  }

  mkdirSync(dirname(asset.output), { recursive: true });
  const svg = `
    <svg width="1024" height="1536" viewBox="0 0 1024 1536" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="panel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#071426"/>
          <stop offset="1" stop-color="#03101f"/>
        </linearGradient>
      </defs>
      ${covers
        .map(
          (cover) => `
            <rect x="${cover.x}" y="${cover.y}" width="${cover.width}" height="${cover.height}" rx="${cover.radius}" fill="url(#panel)" opacity="1"/>
            <rect x="${cover.x + 3}" y="${cover.y + 3}" width="${cover.width - 6}" height="${cover.height - 6}" rx="${Math.max(1, cover.radius - 3)}" fill="none" stroke="#155da0" stroke-width="3" opacity="0.82"/>
          `,
        )
        .join("")}
    </svg>
  `;

  await sharp(asset.input, { limitInputPixels: false }).composite([{ input: Buffer.from(svg), left: 0, top: 0 }]).png().toFile(asset.output);
}

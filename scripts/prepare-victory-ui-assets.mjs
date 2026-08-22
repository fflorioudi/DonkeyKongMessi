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
  {
    input: join(sourceDir, "final-level-2.png"),
    output: join(sourceDir, "final-level-2-clean.png"),
  },
];

const covers = [
  { x: 274, y: 932, width: 188, height: 40, radius: 9 },
  { x: 664, y: 932, width: 174, height: 40, radius: 9 },
  { x: 354, y: 1036, width: 340, height: 82, radius: 12 },
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

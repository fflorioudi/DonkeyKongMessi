import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const frameWidth = 160;
const frameHeight = 120;
const frames = 8;
const width = frameWidth * frames;
const height = frameHeight;
const pixels = new Uint8Array(width * height * 4);

const palette = {
  transparent: [0, 0, 0, 0],
  shadow: [11, 13, 20, 128],
  outline: [40, 12, 22, 255],
  outline2: [86, 12, 26, 255],
  dark: [126, 20, 36, 255],
  mid: [216, 35, 58, 255],
  red: [242, 48, 72, 255],
  light: [255, 92, 112, 255],
  shine: [255, 170, 184, 255],
  paper: [255, 245, 222, 255],
  gold: [255, 214, 86, 255],
  goldDark: [184, 126, 32, 255],
  amber: [255, 186, 68, 255],
  smoke: [68, 78, 92, 110],
};

function setPixel(x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= height) {
    return;
  }

  pixels.set(color, (y * width + x) * 4);
}

function rect(x, y, w, h, color) {
  for (let py = y; py < y + h; py += 1) {
    for (let px = x; px < x + w; px += 1) {
      setPixel(px, py, color);
    }
  }
}

function line(x0, y0, x1, y1, color) {
  const dx = Math.abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let error = dx + dy;
  let x = x0;
  let y = y0;

  while (true) {
    setPixel(x, y, color);
    if (x === x1 && y === y1) {
      break;
    }
    const e2 = 2 * error;
    if (e2 >= dy) {
      error += dy;
      x += sx;
    }
    if (e2 <= dx) {
      error += dx;
      y += sy;
    }
  }
}

function drawSpark(x, y, color) {
  rect(x - 1, y - 5, 2, 11, color);
  rect(x - 5, y - 1, 11, 2, color);
  setPixel(x - 3, y - 3, color);
  setPixel(x + 3, y - 3, color);
  setPixel(x - 3, y + 3, color);
  setPixel(x + 3, y + 3, color);
}

function drawCard(frame, offsetY, tilt, scaleX) {
  const ox = frame * frameWidth;
  const centerX = ox + 80;
  const x = centerX - Math.round(32 * scaleX);
  const y = 24 + offsetY;
  const w = Math.round(64 * scaleX);
  const h = 70;

  rect(x + 12, y + 12, w, h, palette.shadow);
  line(x + 4, y + h + 9, x + w + 16, y + h + 1, palette.smoke);
  line(x + 8, y + h + 15, x + w + 20, y + h + 8, palette.smoke);

  for (let row = 0; row < h; row += 1) {
    const skew = Math.round((row - h / 2) * tilt);
    const rowX = x + skew;
    const cornerInset = row < 6 || row >= h - 6 ? 7 : row < 10 || row >= h - 10 ? 3 : 0;
    rect(rowX + cornerInset, y + row, w - cornerInset * 2, 1, palette.outline);
  }

  for (let row = 5; row < h - 5; row += 1) {
    const skew = Math.round((row - h / 2) * tilt);
    const rowX = x + skew;
    const cornerInset = row < 10 || row >= h - 10 ? 7 : 5;
    const band = row < 18 ? palette.light : row > 52 ? palette.dark : row % 7 < 3 ? palette.red : palette.mid;
    rect(rowX + cornerInset, y + row, w - cornerInset * 2, 1, band);
  }

  for (let row = 15; row < h - 7; row += 1) {
    const skew = Math.round((row - h / 2) * tilt);
    rect(x + skew + 8, y + row, 7, 1, palette.outline2);
    rect(x + skew + w - 15, y + row, 4, 1, palette.dark);
  }

  const topSkew = Math.round((12 - h / 2) * tilt);
  rect(x + topSkew + 17, y + 12, w - 29, 4, palette.shine);
  rect(x + topSkew + w - 20, y + 18, 6, 3, palette.shine);
  rect(x + topSkew + 17, y + 20, Math.max(7, Math.round(w * 0.28)), 2, palette.shine);

  const iconX = x + Math.round(w / 2) + Math.round((32 - h / 2) * tilt);
  const iconY = y + 22;
  rect(iconX - 7, iconY - 2, 14, 32, palette.outline2);
  rect(iconX - 5, iconY, 10, 28, palette.paper);
  rect(iconX - 3, iconY + 2, 6, 22, palette.gold);
  rect(iconX - 6, iconY + 32, 12, 8, palette.outline2);
  rect(iconX - 4, iconY + 33, 8, 6, palette.paper);
  rect(iconX - 2, iconY + 34, 4, 4, palette.gold);

  drawSpark(x + w + 16, y + 16, frame % 2 === 0 ? palette.gold : palette.amber);
  if (frame % 3 === 0) {
    drawSpark(x - 10, y + 42, palette.shine);
  }
}

[
  [0, -2, -0.1, 0.78],
  [1, -1, -0.06, 0.9],
  [2, 0, -0.02, 1],
  [3, 1, 0.03, 0.92],
  [4, 2, 0.08, 0.82],
  [5, 1, 0.04, 0.92],
  [6, 0, -0.02, 1],
  [7, -1, -0.06, 0.9],
].forEach(([frame, offsetY, tilt, scaleX]) => drawCard(frame, offsetY, tilt, scaleX));

const raw = new Uint8Array((width * 4 + 1) * height);
for (let y = 0; y < height; y += 1) {
  const rowStart = y * (width * 4 + 1);
  raw[rowStart] = 0;
  raw.set(pixels.subarray(y * width * 4, (y + 1) * width * 4), rowStart + 1);
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type);
  const payload = Buffer.concat([typeBytes, data]);
  const output = Buffer.alloc(12 + data.length);
  output.writeUInt32BE(data.length, 0);
  typeBytes.copy(output, 4);
  data.copy(output, 8);
  output.writeUInt32BE(crc32(payload), output.length - 4);
  return output;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(width, 0);
ihdr.writeUInt32BE(height, 4);
ihdr[8] = 8;
ihdr[9] = 6;

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw)),
  chunk("IEND", Buffer.alloc(0)),
]);

writeFileSync(join(process.cwd(), "public", "sprites", "red-card.png"), png);

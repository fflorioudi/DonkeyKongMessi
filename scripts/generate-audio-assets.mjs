import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), "public", "audio");
mkdirSync(outDir, { recursive: true });

const sampleRate = 44100;

const sounds = {
  ui: [
    { frequency: 740, duration: 0.055, type: "square", volume: 0.45 },
  ],
  start: [
    { frequency: 392, duration: 0.08, type: "square", volume: 0.48 },
    { frequency: 523, duration: 0.09, type: "square", volume: 0.48 },
    { frequency: 659, duration: 0.12, type: "square", volume: 0.48 },
  ],
  jump: [
    { frequency: 420, duration: 0.06, type: "square", volume: 0.44 },
    { frequency: 760, duration: 0.07, type: "square", volume: 0.44 },
  ],
  throw: [
    { frequency: 180, duration: 0.08, type: "sawtooth", volume: 0.42 },
    { frequency: 110, duration: 0.1, type: "sawtooth", volume: 0.42 },
  ],
  hit: [
    { frequency: 140, duration: 0.13, type: "sawtooth", volume: 0.58 },
    { frequency: 82, duration: 0.17, type: "square", volume: 0.46 },
  ],
  gameover: [
    { frequency: 220, duration: 0.11, type: "square", volume: 0.48 },
    { frequency: 165, duration: 0.13, type: "square", volume: 0.48 },
    { frequency: 110, duration: 0.2, type: "square", volume: 0.48 },
  ],
  victory: [
    { frequency: 523, duration: 0.09, type: "square", volume: 0.5 },
    { frequency: 659, duration: 0.09, type: "square", volume: 0.5 },
    { frequency: 784, duration: 0.11, type: "square", volume: 0.5 },
    { frequency: 1046, duration: 0.24, type: "square", volume: 0.5 },
  ],
};

for (const [name, notes] of Object.entries(sounds)) {
  writeFileSync(join(outDir, `${name}.wav`), makeWav(notes));
}

console.log(`Generated ${Object.keys(sounds).length} audio assets in ${outDir}`);

function makeWav(notes) {
  const gap = 0.018;
  const totalDuration = notes.reduce((sum, note) => sum + note.duration + gap, 0);
  const totalSamples = Math.ceil(totalDuration * sampleRate);
  const pcm = new Int16Array(totalSamples);
  let cursor = 0;

  for (const note of notes) {
    const noteSamples = Math.floor(note.duration * sampleRate);

    for (let i = 0; i < noteSamples; i += 1) {
      const t = i / sampleRate;
      const envelope = makeEnvelope(i, noteSamples);
      const sample = waveform(note.type, note.frequency, t) * note.volume * envelope;
      pcm[cursor + i] = Math.max(-1, Math.min(1, sample)) * 32767;
    }

    cursor += noteSamples + Math.floor(gap * sampleRate);
  }

  return encodeWav(pcm);
}

function makeEnvelope(index, total) {
  const attack = Math.max(1, Math.floor(total * 0.08));
  const release = Math.max(1, Math.floor(total * 0.22));

  if (index < attack) {
    return index / attack;
  }

  if (index > total - release) {
    return Math.max(0, (total - index) / release);
  }

  return 1;
}

function waveform(type, frequency, t) {
  const phase = (t * frequency) % 1;

  if (type === "square") {
    return phase < 0.5 ? 1 : -1;
  }

  if (type === "sawtooth") {
    return phase * 2 - 1;
  }

  return Math.sin(Math.PI * 2 * frequency * t);
}

function encodeWav(samples) {
  const dataBytes = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataBytes);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataBytes, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataBytes, 40);

  for (let i = 0; i < samples.length; i += 1) {
    buffer.writeInt16LE(samples[i], 44 + i * 2);
  }

  return buffer;
}

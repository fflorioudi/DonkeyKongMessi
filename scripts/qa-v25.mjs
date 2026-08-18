import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const audioSource = readFileSync(join(root, "game", "Audio.ts"), "utf8");
const gameSource = readFileSync(join(root, "game", "Game.ts"), "utf8");
const pageSource = readFileSync(join(root, "app", "donkey-messi", "page.tsx"), "utf8");
const stylesSource = readFileSync(join(root, "app", "donkey-messi", "styles.css"), "utf8");

function pass(label, condition) {
  if (!condition) {
    throw new Error(`${label} failed`);
  }

  console.log(`ok - ${label}`);
}

pass("web audio manager exists", audioSource.includes("AudioContext") && audioSource.includes("OscillatorNode") === false);
pass("audio unlock exists for mobile gesture", audioSource.includes("async unlock") && gameSource.includes("this.audio.unlock"));
pass("sounds wait for running context", audioSource.includes("runWhenReady") && audioSource.includes("context?.state !== \"running\""));
pass("test sound exists", audioSource.includes("playTest") && audioSource.includes("scheduleTone"));
pass("menu audio test exists", pageSource.includes("testAudio") && pageSource.includes("Audio"));
pass("mute preference persists", audioSource.includes("localStorage") && audioSource.includes("donkey-messi-audio-enabled"));
pass("jump sound wired", audioSource.includes("playJump") && gameSource.includes("this.audio.playJump"));
pass("hit sound wired", audioSource.includes("playHit") && gameSource.includes("this.audio.playHit"));
pass("throw sound wired", audioSource.includes("playThrow") && gameSource.includes("this.audio.playThrow"));
pass("victory sound wired", audioSource.includes("playVictory") && gameSource.includes("this.audio.playVictory"));
pass("game over sound wired", audioSource.includes("playGameOver") && gameSource.includes("this.audio.playGameOver"));
pass("sound toggle exists", pageSource.includes("toggleAudio") && stylesSource.includes(".soundButton"));

console.log("V2.5 audio checks passed.");

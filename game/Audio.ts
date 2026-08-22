const AUDIO_ENABLED_KEY = "donkey-messi-audio-enabled";
const AUDIO_FILES = {
  gameOver: "/audio/gameover.wav",
  hit: "/audio/hit.wav",
  jump: "/audio/jump.wav",
  start: "/audio/start.wav",
  throw: "/audio/throw.wav",
  ui: "/audio/ui.wav",
  victory: "/audio/victory.wav",
} as const;

type AudioKey = keyof typeof AUDIO_FILES;

type AudioWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

type ToneOptions = {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  volume?: number;
  slideTo?: number;
  delay?: number;
};

export class AudioManager {
  enabled = true;
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private elements: Partial<Record<AudioKey, HTMLAudioElement>> = {};
  private htmlUnlocked = false;

  constructor() {
    this.enabled = this.loadEnabled();
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    this.persistEnabled();

    if (enabled) {
      void this.unlock();
    }
  }

  toggle() {
    if (this.enabled) {
      this.playUi();
      this.setEnabled(false);
      return;
    }

    this.setEnabled(true);
    this.playTest();
  }

  async unlock() {
    if (!this.enabled) {
      return;
    }

    this.ensureElements();
    await this.unlockHtmlAudio();

    const context = this.ensureContext();

    if (context?.state === "suspended") {
      await context.resume();
    }

    this.primeOutput();
  }

  playTest() {
    if (this.playFile("victory")) {
      return;
    }

    void this.runWhenReady(() => {
      this.scheduleTone({ frequency: 523, duration: 0.08, type: "square", volume: 0.11 });
      this.scheduleTone({ frequency: 784, duration: 0.12, type: "square", volume: 0.11, delay: 0.09 });
    });
  }

  playUi() {
    if (this.playFile("ui")) {
      return;
    }

    this.playTone({ frequency: 740, duration: 0.055, type: "square", volume: 0.08 });
  }

  playStart() {
    if (this.playFile("start")) {
      return;
    }

    this.playSequence([
      { frequency: 392, duration: 0.08, type: "square", volume: 0.1 },
      { frequency: 523, duration: 0.09, type: "square", volume: 0.1, delay: 0.08 },
      { frequency: 659, duration: 0.12, type: "square", volume: 0.1, delay: 0.17 },
    ]);
  }

  playJump() {
    if (this.playFile("jump")) {
      return;
    }

    this.playTone({ frequency: 420, slideTo: 760, duration: 0.13, type: "square", volume: 0.1 });
  }

  playThrow() {
    if (this.playFile("throw")) {
      return;
    }

    this.playTone({ frequency: 180, slideTo: 110, duration: 0.18, type: "sawtooth", volume: 0.09 });
  }

  playHit() {
    if (this.playFile("hit")) {
      return;
    }

    this.playSequence([
      { frequency: 140, duration: 0.13, type: "sawtooth", volume: 0.13 },
      { frequency: 82, duration: 0.17, type: "square", volume: 0.1, delay: 0.08 },
    ]);
  }

  playGameOver() {
    if (this.playFile("gameOver")) {
      return;
    }

    this.playSequence([
      { frequency: 220, duration: 0.11, type: "square", volume: 0.1 },
      { frequency: 165, duration: 0.13, type: "square", volume: 0.1, delay: 0.12 },
      { frequency: 110, duration: 0.2, type: "square", volume: 0.1, delay: 0.26 },
    ]);
  }

  playVictory() {
    if (this.playFile("victory")) {
      return;
    }

    this.playSequence([
      { frequency: 523, duration: 0.09, type: "square", volume: 0.1 },
      { frequency: 659, duration: 0.09, type: "square", volume: 0.1, delay: 0.1 },
      { frequency: 784, duration: 0.11, type: "square", volume: 0.1, delay: 0.2 },
      { frequency: 1046, duration: 0.24, type: "square", volume: 0.1, delay: 0.33 },
    ]);
  }

  playPowerUp() {
    this.playSequence([
      { frequency: 659, duration: 0.07, type: "square", volume: 0.09 },
      { frequency: 880, duration: 0.08, type: "square", volume: 0.09, delay: 0.08 },
      { frequency: 1175, duration: 0.12, type: "square", volume: 0.08, delay: 0.17 },
    ]);
  }

  private playSequence(tones: ToneOptions[]) {
    tones.forEach((tone) => this.playTone(tone));
  }

  private playFile(key: AudioKey) {
    if (!this.enabled) {
      return true;
    }

    this.ensureElements();
    const element = this.elements[key];

    if (!element) {
      return false;
    }

    element.currentTime = 0;
    element.volume = 1;
    const playback = element.play();

    if (playback) {
      playback.catch(() => {
        this.htmlUnlocked = false;
      });
    }

    return true;
  }

  private ensureElements() {
    for (const [key, source] of Object.entries(AUDIO_FILES) as Array<[AudioKey, string]>) {
      if (this.elements[key]) {
        continue;
      }

      const element = new Audio(source);
      element.preload = "auto";
      element.volume = 0.68;
      this.elements[key] = element;
    }
  }

  private async unlockHtmlAudio() {
    if (this.htmlUnlocked) {
      return;
    }

    this.ensureElements();
    const unlockTargets = Object.values(this.elements);

    await Promise.allSettled(
      unlockTargets.map(async (element) => {
        element.muted = true;
        element.currentTime = 0;
        await element.play();
        element.pause();
        element.currentTime = 0;
        element.muted = false;
      }),
    );

    this.htmlUnlocked = true;
  }

  private playTone({ frequency, duration, type = "sine", volume = 0.04, slideTo, delay = 0 }: ToneOptions) {
    if (!this.enabled) {
      return;
    }

    void this.runWhenReady(() => {
      this.scheduleTone({ frequency, duration, type, volume, slideTo, delay });
    });
  }

  private async runWhenReady(callback: () => void) {
    if (!this.enabled) {
      return;
    }

    await this.unlock();

    if (this.context?.state !== "running" || !this.master) {
      return;
    }

    callback();
  }

  private scheduleTone({ frequency, duration, type = "sine", volume = 0.08, slideTo, delay = 0 }: ToneOptions) {
    const context = this.context;

    if (!context || !this.master) {
      return;
    }

    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);

    if (slideTo) {
      oscillator.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
    }

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(this.master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  private primeOutput() {
    if (!this.context || !this.master) {
      return;
    }

    const buffer = this.context.createBuffer(1, 1, 22050);
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.master);
    source.start(0);
  }

  private ensureContext() {
    if (this.context) {
      return this.context;
    }

    const AudioContextClass = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;

    if (!AudioContextClass) {
      return null;
    }

    this.context = new AudioContextClass();
    this.master = this.context.createGain();
    this.master.gain.value = 0.72;
    this.master.connect(this.context.destination);

    return this.context;
  }

  private loadEnabled() {
    try {
      return window.localStorage.getItem(AUDIO_ENABLED_KEY) !== "false";
    } catch {
      return true;
    }
  }

  private persistEnabled() {
    try {
      window.localStorage.setItem(AUDIO_ENABLED_KEY, String(this.enabled));
    } catch {
      // Audio preference is nice to keep, but gameplay should not depend on storage.
    }
  }
}

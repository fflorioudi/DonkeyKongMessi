const AUDIO_ENABLED_KEY = "donkey-messi-audio-enabled";

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

    const context = this.ensureContext();

    if (context?.state === "suspended") {
      await context.resume();
    }

    this.primeOutput();
  }

  playTest() {
    void this.runWhenReady(() => {
      this.scheduleTone({ frequency: 523, duration: 0.08, type: "square", volume: 0.11 });
      this.scheduleTone({ frequency: 784, duration: 0.12, type: "square", volume: 0.11, delay: 0.09 });
    });
  }

  playUi() {
    this.playTone({ frequency: 740, duration: 0.055, type: "square", volume: 0.08 });
  }

  playStart() {
    this.playSequence([
      { frequency: 392, duration: 0.08, type: "square", volume: 0.1 },
      { frequency: 523, duration: 0.09, type: "square", volume: 0.1, delay: 0.08 },
      { frequency: 659, duration: 0.12, type: "square", volume: 0.1, delay: 0.17 },
    ]);
  }

  playJump() {
    this.playTone({ frequency: 420, slideTo: 760, duration: 0.13, type: "square", volume: 0.1 });
  }

  playThrow() {
    this.playTone({ frequency: 180, slideTo: 110, duration: 0.18, type: "sawtooth", volume: 0.09 });
  }

  playHit() {
    this.playSequence([
      { frequency: 140, duration: 0.13, type: "sawtooth", volume: 0.13 },
      { frequency: 82, duration: 0.17, type: "square", volume: 0.1, delay: 0.08 },
    ]);
  }

  playGameOver() {
    this.playSequence([
      { frequency: 220, duration: 0.11, type: "square", volume: 0.1 },
      { frequency: 165, duration: 0.13, type: "square", volume: 0.1, delay: 0.12 },
      { frequency: 110, duration: 0.2, type: "square", volume: 0.1, delay: 0.26 },
    ]);
  }

  playVictory() {
    this.playSequence([
      { frequency: 523, duration: 0.09, type: "square", volume: 0.1 },
      { frequency: 659, duration: 0.09, type: "square", volume: 0.1, delay: 0.1 },
      { frequency: 784, duration: 0.11, type: "square", volume: 0.1, delay: 0.2 },
      { frequency: 1046, duration: 0.24, type: "square", volume: 0.1, delay: 0.33 },
    ]);
  }

  private playSequence(tones: ToneOptions[]) {
    tones.forEach((tone) => this.playTone(tone));
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
    this.master.gain.value = 0.95;
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

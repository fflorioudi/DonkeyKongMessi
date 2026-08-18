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
  }

  toggle() {
    this.setEnabled(!this.enabled);
    if (this.enabled) {
      void this.unlock();
      this.playUi();
    }
  }

  async unlock() {
    if (!this.enabled) {
      return;
    }

    const context = this.ensureContext();

    if (context?.state === "suspended") {
      await context.resume();
    }
  }

  playUi() {
    this.playTone({ frequency: 740, duration: 0.045, type: "square", volume: 0.035 });
  }

  playStart() {
    this.playSequence([
      { frequency: 392, duration: 0.07, type: "square", volume: 0.04 },
      { frequency: 523, duration: 0.08, type: "square", volume: 0.04, delay: 0.07 },
      { frequency: 659, duration: 0.1, type: "square", volume: 0.04, delay: 0.15 },
    ]);
  }

  playJump() {
    this.playTone({ frequency: 420, slideTo: 760, duration: 0.12, type: "square", volume: 0.04 });
  }

  playThrow() {
    this.playTone({ frequency: 180, slideTo: 110, duration: 0.16, type: "sawtooth", volume: 0.035 });
  }

  playHit() {
    this.playSequence([
      { frequency: 140, duration: 0.12, type: "sawtooth", volume: 0.06 },
      { frequency: 82, duration: 0.16, type: "square", volume: 0.04, delay: 0.08 },
    ]);
  }

  playGameOver() {
    this.playSequence([
      { frequency: 220, duration: 0.1, type: "square", volume: 0.04 },
      { frequency: 165, duration: 0.12, type: "square", volume: 0.04, delay: 0.11 },
      { frequency: 110, duration: 0.18, type: "square", volume: 0.04, delay: 0.24 },
    ]);
  }

  playVictory() {
    this.playSequence([
      { frequency: 523, duration: 0.08, type: "square", volume: 0.04 },
      { frequency: 659, duration: 0.08, type: "square", volume: 0.04, delay: 0.09 },
      { frequency: 784, duration: 0.1, type: "square", volume: 0.04, delay: 0.18 },
      { frequency: 1046, duration: 0.22, type: "square", volume: 0.04, delay: 0.3 },
    ]);
  }

  private playSequence(tones: ToneOptions[]) {
    tones.forEach((tone) => this.playTone(tone));
  }

  private playTone({ frequency, duration, type = "sine", volume = 0.04, slideTo, delay = 0 }: ToneOptions) {
    if (!this.enabled) {
      return;
    }

    const context = this.ensureContext();

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
    this.master.gain.value = 0.6;
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

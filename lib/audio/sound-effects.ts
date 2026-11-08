// Pure Web Audio API Synthesizer for Super Solario
// Zero external mp3 dependencies - 100% reliable, zero CORS/404 issues, authentic 8-bit NES tones!

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private bgmTimer: NodeJS.Timeout | null = null;
  private currentBgmTheme: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('solario_sound_muted');
      this.isMuted = saved === 'true';
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('solario_sound_muted', String(this.isMuted));
    }
    if (this.isMuted) {
      this.stopBGM();
    }
    return this.isMuted;
  }

  // 1. Mario Jump (Sweep from 150Hz to 600Hz square wave)
  public playJump(isSuper: boolean = false) {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    const startFreq = isSuper ? 180 : 140;
    const endFreq = isSuper ? 680 : 540;

    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.16);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  }

  // 2. Coin Chime (Classic B5 -> E6 crystal chime)
  public playCoin() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [987.77, 1318.51]; // B5, E6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.28);
    });
  }

  // 3. Stomp Enemy (Snappy percussive crunch)
  public playStomp() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.14);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.14);
  }

  // 4. Powerup Sprout / Item Reveal (Rising arpeggio)
  public playPowerupSprout() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [330, 392, 494, 587, 659];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.05;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.1);
    });
  }

  // 5. Powerup Collect (Super mushroom / flower eaten)
  public playPowerup() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [330, 392, 659, 523, 587, 784];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.07;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.14);
    });
  }

  // 6. Powerdown / Hurt (Descending slide)
  public playPowerdown() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  }

  // 7. Fireball (Laser / fireball whoosh)
  public playFireball() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }

  // 8. Brick Smash / Shatter
  public playBrickBreak() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.35, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  // 9. Kick Koopa Shell
  public playKick() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(380, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  }

  // 10. Flagpole Slide & Stage Clear
  public playFlagpole() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  }

  // 11. Victory Fanfare (Stage Clear)
  public playStageClear() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [392, 523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.12;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + (idx === notes.length - 1 ? 0.6 : 0.2));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + (idx === notes.length - 1 ? 0.6 : 0.2));
    });
  }

  // 12. Bowser Lava Bridge Collapse
  public playBossDefeat() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 1.2);

    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1.2);
  }

  // 13. Game Over (Classic descending lament)
  public playGameOver() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [523.25, 493.88, 466.16, 440, 415.3, 392, 349.23, 329.63];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.16;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.28);
    });
  }

  // 14. 1-Up Extra Life
  public play1Up() {
    if (this.isMuted) return;
    const ctx = this.initContext();
    if (!ctx) return;

    const notes = [330, 392, 659, 523, 587, 784];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 1.5, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.18);
    });
  }

  // 15. Background Music Generator (Pure Chiptune Loops)
  public startBGM(theme: 'overworld' | 'underground' | 'sky' | 'castle' | 'star' = 'overworld') {
    if (this.isMuted) return;
    if (this.currentBgmTheme === theme) return;
    this.stopBGM();

    const ctx = this.initContext();
    if (!ctx) return;

    this.currentBgmTheme = theme;

    let melodyNotes: Array<{ note: number; dur: number }>;
    let tempoMs = 135;

    if (theme === 'overworld') {
      melodyNotes = [
        { note: 659.25, dur: 0.12 }, // E5
        { note: 659.25, dur: 0.12 }, // E5
        { note: 0, dur: 0.12 },
        { note: 659.25, dur: 0.12 }, // E5
        { note: 0, dur: 0.12 },
        { note: 523.25, dur: 0.12 }, // C5
        { note: 659.25, dur: 0.12 }, // E5
        { note: 0, dur: 0.12 },
        { note: 783.99, dur: 0.22 }, // G5
        { note: 0, dur: 0.22 },
        { note: 392.00, dur: 0.22 }, // G4
        { note: 0, dur: 0.22 },
        { note: 523.25, dur: 0.16 }, // C5
        { note: 0, dur: 0.12 },
        { note: 392.00, dur: 0.16 }, // G4
        { note: 0, dur: 0.12 },
        { note: 329.63, dur: 0.16 }, // E4
        { note: 0, dur: 0.12 },
        { note: 440.00, dur: 0.16 }, // A4
        { note: 493.88, dur: 0.16 }, // B4
        { note: 466.16, dur: 0.16 }, // Bb4
        { note: 440.00, dur: 0.16 }, // A4
      ];
      tempoMs = 150;
    } else if (theme === 'underground') {
      melodyNotes = [
        { note: 261.63, dur: 0.15 },
        { note: 523.25, dur: 0.15 },
        { note: 466.16, dur: 0.15 },
        { note: 440.00, dur: 0.15 },
        { note: 415.30, dur: 0.15 },
        { note: 392.00, dur: 0.15 },
        { note: 0, dur: 0.3 },
        { note: 233.08, dur: 0.15 },
        { note: 466.16, dur: 0.15 },
        { note: 440.00, dur: 0.15 },
        { note: 392.00, dur: 0.15 },
        { note: 349.23, dur: 0.15 },
        { note: 0, dur: 0.3 },
      ];
      tempoMs = 170;
    } else if (theme === 'sky') {
      melodyNotes = [
        { note: 783.99, dur: 0.18 },
        { note: 659.25, dur: 0.18 },
        { note: 523.25, dur: 0.18 },
        { note: 587.33, dur: 0.18 },
        { note: 659.25, dur: 0.18 },
        { note: 783.99, dur: 0.28 },
        { note: 880.00, dur: 0.18 },
        { note: 783.99, dur: 0.18 },
        { note: 659.25, dur: 0.18 },
        { note: 523.25, dur: 0.3 },
        { note: 0, dur: 0.2 },
      ];
      tempoMs = 140;
    } else if (theme === 'castle') {
      melodyNotes = [
        { note: 220, dur: 0.1 },
        { note: 233.08, dur: 0.1 },
        { note: 220, dur: 0.1 },
        { note: 207.65, dur: 0.1 },
        { note: 220, dur: 0.14 },
        { note: 0, dur: 0.1 },
        { note: 164.81, dur: 0.1 },
        { note: 174.61, dur: 0.1 },
        { note: 164.81, dur: 0.1 },
        { note: 155.56, dur: 0.1 },
        { note: 164.81, dur: 0.14 },
        { note: 0, dur: 0.1 },
      ];
      tempoMs = 120;
    } else {
      melodyNotes = [
        { note: 659.25, dur: 0.08 },
        { note: 783.99, dur: 0.08 },
        { note: 659.25, dur: 0.08 },
        { note: 523.25, dur: 0.08 },
        { note: 587.33, dur: 0.08 },
        { note: 659.25, dur: 0.08 },
        { note: 783.99, dur: 0.08 },
        { note: 880.00, dur: 0.08 },
      ];
      tempoMs = 90;
    }

    let noteIdx = 0;
    const playNext = () => {
      if (this.isMuted || !this.currentBgmTheme) return;
      const cur = melodyNotes[noteIdx % melodyNotes.length];
      noteIdx++;

      if (cur.note > 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = theme === 'underground' || theme === 'castle' ? 'triangle' : 'square';
        osc.frequency.setValueAtTime(cur.note, ctx.currentTime);

        gain.gain.setValueAtTime(0.045, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + cur.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + cur.dur);
      }

      this.bgmTimer = setTimeout(playNext, cur.dur * 1000 + (tempoMs * 0.4));
    };

    playNext();
  }

  public stopBGM() {
    this.currentBgmTheme = null;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const sounds = new SoundSynthesizer();

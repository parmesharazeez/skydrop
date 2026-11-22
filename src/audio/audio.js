class Synth {
  start() {
    if (this.context) {
      this.context.resume().catch(() => {});
      return;
    }
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    this.context = new Audio();
    this.master = this.context.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.context.destination);
    this.rotor = this.context.createOscillator();
    this.rotor.type = 'sawtooth';
    this.rotor.frequency.value = 75;
    this.rotorGain = this.context.createGain();
    this.rotorGain.gain.value = 0;
    this.rotor.connect(this.rotorGain).connect(this.master);
    this.rotor.start();
    const buffer = this.context.createBuffer(
      1,
      this.context.sampleRate * 2,
      this.context.sampleRate,
    );
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
    this.wind = this.context.createBufferSource();
    this.wind.buffer = buffer;
    this.wind.loop = true;
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 550;
    this.windGain = this.context.createGain();
    this.windGain.gain.value = 0;
    this.wind.connect(filter).connect(this.windGain).connect(this.master);
    this.wind.start();
  }
  update(game) {
    if (!this.context) return;
    const t = this.context.currentTime;
    const flying = game.screen === 'playing';
    const speed = Math.hypot(...game.drone.velocity);
    this.master.gain.setTargetAtTime(game.muted ? 0 : game.volume, t, 0.08);
    this.rotorGain.gain.setTargetAtTime(flying ? 0.025 : 0, t, 0.1);
    this.rotor.frequency.setTargetAtTime(65 + speed * 5, t, 0.1);
    this.windGain.gain.setTargetAtTime(
      flying ? 0.015 + speed * 0.003 : 0,
      t,
      0.2,
    );
  }
  play(name) {
    if (!this.context) return;
    const notes = {
      click: [700],
      countdown: [880],
      pickup: [330, 660],
      release: [660, 330],
      success: [523, 659, 784],
      collision: [100, 70],
      victory: [523, 659, 784, 1047],
      failure: [440, 330, 220],
    }[name] || [440];
    notes.forEach((frequency, i) => {
      const t = this.context.currentTime + i * 0.12;
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      osc.type = name === 'collision' ? 'square' : 'sine';
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      osc.connect(gain).connect(this.master);
      osc.start(t);
      osc.stop(t + 0.22);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    });
  }
}
export const audio = new Synth();

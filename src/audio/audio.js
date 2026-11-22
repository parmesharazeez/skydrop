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
    this.rotorFilter = this.context.createBiquadFilter();
    this.rotorFilter.type = 'lowpass';
    this.rotorFilter.frequency.value = 320;
    this.rotor
      .connect(this.rotorFilter)
      .connect(this.rotorGain)
      .connect(this.master);
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
    if (this.previousScreen !== game.screen) {
      if (game.screen === 'playing')
        this.play(this.previousScreen === 'paused' ? 'resume' : 'takeoff');
      if (game.screen === 'paused') this.play('pause');
      this.previousScreen = game.screen;
    }
    const remaining = Math.ceil(game.time);
    if (flying && remaining <= 10 && remaining !== this.lastWarning)
      this.play('warning');
    this.lastWarning = remaining;
    this.rotorFilter.frequency.setTargetAtTime(260 + speed * 28, t, 0.15);
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
    if (name === 'hover') {
      const now = this.context.currentTime;
      if (now - (this.lastHover || 0) < 0.09) return;
      this.lastHover = now;
    }
    const notes = {
      click: [900],
      hover: [1400],
      takeoff: [220, 440, 880],
      pause: [520, 390],
      resume: [390, 520],
      warning: [1100, 880],
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
      gain.gain.linearRampToValueAtTime(
        name === 'hover' ? 0.018 : name === 'click' ? 0.05 : 0.1,
        t + 0.01,
      );
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

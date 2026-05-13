class SoundEngine {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.nodes = [];
    this.gainNode = this.ctx.createGain();
    this.gainNode.connect(this.ctx.destination);
    this.gainNode.gain.value = 0.5;
  }

  stop() {
    this.nodes.forEach(n => {
      try { n.stop(); } catch(e) {}
      try { n.disconnect(); } catch(e) {}
    });
    this.nodes = [];
  }

  play(type) {
    this.stop();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    
    if (type === 'rain') this.playRain();
    else if (type === 'forest') this.playForest();
    else if (type === 'cafe') this.playCafe();
    else if (type === 'beach') this.playBeach();
    else if (type === 'fire') this.playFire();
    else if (type === 'lofi') this.playLofi();
  }

  createNoise(type) {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'white') data[i] = white;
      else if (type === 'pink') {
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      } else if (type === 'brown') {
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 4;
      }
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    return noise;
  }

  playRain() {
    const noise = this.createNoise('pink');
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    noise.connect(filter);
    filter.connect(this.gainNode);
    noise.start();
    this.nodes.push(noise, filter);
  }

  playForest() {
    const noise = this.createNoise('pink');
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.2;
    noise.connect(filter).connect(gain).connect(this.gainNode);
    noise.start();
    this.nodes.push(noise, filter, gain);
  }

  playCafe() {
    const noise = this.createNoise('brown');
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    const gain = this.ctx.createGain();
    gain.gain.value = 0.6;
    noise.connect(filter).connect(gain).connect(this.gainNode);
    noise.start();
    this.nodes.push(noise, filter, gain);
  }

  playBeach() {
    const noise = this.createNoise('pink');
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    
    // LFO for waves
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.5;
    
    lfo.connect(lfoGain);
    
    const waveGain = this.ctx.createGain();
    waveGain.gain.value = 0.5;
    lfoGain.connect(waveGain.gain);
    
    noise.connect(filter).connect(waveGain).connect(this.gainNode);
    noise.start();
    lfo.start();
    this.nodes.push(noise, filter, lfo, lfoGain, waveGain);
  }

  playFire() {
    const noise = this.createNoise('white');
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    
    // Crackle LFO
    const lfo = this.ctx.createOscillator();
    lfo.type = 'square';
    lfo.frequency.value = 2;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.8;
    
    const fireGain = this.ctx.createGain();
    fireGain.gain.value = 0.3;
    
    lfo.connect(lfoGain);
    lfoGain.connect(fireGain.gain);
    
    noise.connect(filter).connect(fireGain).connect(this.gainNode);
    noise.start();
    lfo.start();
    this.nodes.push(noise, filter, lfo, lfoGain, fireGain);
  }

  playLofi() {
    // Just warm brown noise for lofi vibe
    this.playCafe();
  }
}

export const audioEngine = new SoundEngine();

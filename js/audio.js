// audio.js - Web Audio API synthesis engine

export class AudioSynthesizer {
    constructor() {
        this.isPlaying = false;
        this.initialized = false;

        // Audio parameters
        this.baseFrequency = 440;
        this.currentFrequency = 440;
        this.filterFrequency = 1000;
        this.filterQ = 5;
        this.reverbMix = 0.3;
        this.delayTime = 0.2;
        this.waveform = 'sine';
    }

    async init() {
        if (this.initialized) return;

        // Create audio context
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Main oscillator
        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.type = this.waveform;
        this.oscillator.frequency.value = this.currentFrequency;

        // Gain node for volume control
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 0;

        // Filter
        this.filter = this.audioContext.createBiquadFilter();
        this.filter.type = 'lowpass';
        this.filter.frequency.value = this.filterFrequency;
        this.filter.Q.value = this.filterQ;

        // Delay effect
        this.delayNode = this.audioContext.createDelay();
        this.delayNode.delayTime.value = this.delayTime;

        this.delayFeedback = this.audioContext.createGain();
        this.delayFeedback.gain.value = 0.4;

        this.delayMix = this.audioContext.createGain();
        this.delayMix.gain.value = 0.3;

        // Reverb (using convolver with generated impulse response)
        this.reverb = this.audioContext.createConvolver();
        this.reverb.buffer = this.generateReverbImpulse();

        this.reverbMixNode = this.audioContext.createGain();
        this.reverbMixNode.gain.value = this.reverbMix;

        this.dryGain = this.audioContext.createGain();
        this.dryGain.gain.value = 1 - this.reverbMix;

        // Analyser for visual feedback
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        this.analyserData = new Uint8Array(this.analyser.frequencyBinCount);

        // Master output
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = 0.3;

        // Connect nodes
        // Oscillator -> Gain -> Filter
        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.filter);

        // Delay chain
        this.filter.connect(this.delayNode);
        this.delayNode.connect(this.delayFeedback);
        this.delayFeedback.connect(this.delayNode); // Feedback loop
        this.delayNode.connect(this.delayMix);

        // Dry/Wet mix for delay
        this.filter.connect(this.dryGain);
        this.delayMix.connect(this.dryGain);

        // Reverb chain
        this.dryGain.connect(this.reverb);
        this.reverb.connect(this.reverbMixNode);

        // Mix dry and reverb
        const finalMix = this.audioContext.createGain();
        this.dryGain.connect(finalMix);
        this.reverbMixNode.connect(finalMix);

        // Final output
        finalMix.connect(this.analyser);
        this.analyser.connect(this.masterGain);
        this.masterGain.connect(this.audioContext.destination);

        // Start oscillator
        this.oscillator.start();

        this.initialized = true;
    }

    generateReverbImpulse() {
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * 2; // 2 seconds
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }

        return impulse;
    }

    start() {
        if (!this.initialized) return;

        this.isPlaying = true;
        this.gainNode.gain.linearRampToValueAtTime(
            0.5,
            this.audioContext.currentTime + 0.1
        );
    }

    stop() {
        if (!this.initialized) return;

        this.isPlaying = false;
        this.gainNode.gain.linearRampToValueAtTime(
            0,
            this.audioContext.currentTime + 0.1
        );
    }

    setFrequency(freq) {
        if (!this.initialized) return;

        this.currentFrequency = Math.max(50, Math.min(2000, freq));
        this.oscillator.frequency.linearRampToValueAtTime(
            this.currentFrequency,
            this.audioContext.currentTime + 0.05
        );
    }

    setFilterFrequency(freq) {
        if (!this.initialized) return;

        this.filterFrequency = Math.max(200, Math.min(5000, freq));
        this.filter.frequency.linearRampToValueAtTime(
            this.filterFrequency,
            this.audioContext.currentTime + 0.05
        );
    }

    setFilterQ(q) {
        if (!this.initialized) return;

        this.filterQ = Math.max(1, Math.min(20, q));
        this.filter.Q.linearRampToValueAtTime(
            this.filterQ,
            this.audioContext.currentTime + 0.05
        );
    }

    setReverbMix(mix) {
        if (!this.initialized) return;

        this.reverbMix = Math.max(0, Math.min(1, mix));
        this.reverbMixNode.gain.linearRampToValueAtTime(
            this.reverbMix,
            this.audioContext.currentTime + 0.05
        );
    }

    setDelayTime(time) {
        if (!this.initialized) return;

        this.delayTime = Math.max(0, Math.min(0.5, time));
        this.delayNode.delayTime.linearRampToValueAtTime(
            this.delayTime,
            this.audioContext.currentTime + 0.05
        );
    }

    setWaveform(type) {
        this.waveform = type;

        if (!this.initialized) return;

        // Need to recreate oscillator to change waveform
        this.oscillator.disconnect();
        this.oscillator.stop();

        this.oscillator = this.audioContext.createOscillator();
        this.oscillator.type = type;
        this.oscillator.frequency.value = this.currentFrequency;
        this.oscillator.connect(this.gainNode);
        this.oscillator.start();
    }

    getAudioLevel() {
        if (!this.initialized || !this.analyser) return 0;

        this.analyser.getByteFrequencyData(this.analyserData);

        // Calculate average
        let sum = 0;
        for (let i = 0; i < this.analyserData.length; i++) {
            sum += this.analyserData[i];
        }
        return (sum / this.analyserData.length) / 255;
    }

    // Convenience method to map 0-1 range to frequency with exponential scaling
    setFrequencyNormalized(value) {
        // Map 0-1 to 110Hz - 1760Hz (3 octaves starting from A2)
        const minFreq = 110;
        const maxFreq = 1760;
        const freq = minFreq * Math.pow(maxFreq / minFreq, value);
        this.setFrequency(freq);
    }
}

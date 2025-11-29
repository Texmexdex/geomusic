// main.js - Application entry point and coordination

import { Scene3D } from './scene.js';
import { AudioSynthesizer } from './audio.js';
import { InteractionController } from './interaction.js';

class App {
    constructor() {
        this.lastTime = 0;
        this.frameCount = 0;
        this.fpsUpdateTime = 0;

        this.init();
    }

    async init() {
        // Get canvas
        this.canvas = document.getElementById('canvas');

        // Initialize modules
        this.scene = new Scene3D(this.canvas);
        this.audio = new AudioSynthesizer();
        this.interaction = new InteractionController(this.canvas, this.scene, this.audio);

        // Setup UI event listeners
        this.setupUIListeners();

        // Start animation loop
        this.animate(0);

        console.log('3D Audio Synthesizer initialized');
        console.log('Click to start audio, move mouse to control sound');
    }

    setupUIListeners() {
        // Shape buttons
        document.querySelectorAll('[data-shape]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.interaction.changeShape(btn.dataset.shape);
            });
        });

        // Waveform buttons
        document.querySelectorAll('[data-wave]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.interaction.changeWaveform(btn.dataset.wave);
            });
        });
    }

    animate(time) {
        requestAnimationFrame((t) => this.animate(t));

        // Calculate delta time
        const deltaTime = (time - this.lastTime) / 1000;
        this.lastTime = time;

        // Update audio level from analyser
        const audioLevel = this.audio.getAudioLevel();
        this.scene.setAudioLevel(audioLevel);

        // Update scene
        this.scene.update(deltaTime);

        // Render
        this.scene.render();

        // Update FPS counter
        this.updateFPS(time);
    }

    updateFPS(time) {
        this.frameCount++;

        if (time - this.fpsUpdateTime > 1000) {
            const fps = Math.round(this.frameCount * 1000 / (time - this.fpsUpdateTime));
            document.getElementById('fps').textContent = fps + ' FPS';

            this.frameCount = 0;
            this.fpsUpdateTime = time;
        }
    }
}

// Start the application
window.addEventListener('DOMContentLoaded', () => {
    new App();
});

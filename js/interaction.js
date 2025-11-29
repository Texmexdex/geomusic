// interaction.js - User interaction handling

export class InteractionController {
    constructor(canvas, scene, audio) {
        this.canvas = canvas;
        this.scene = scene;
        this.audio = audio;

        this.mouseX = 0;
        this.mouseY = 0;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.shapeOffsetX = 0;
        this.shapeOffsetY = 0;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mouse move - controls rotation and filter
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));

        // Mouse wheel - controls frequency/pitch
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });

        // Click - toggle sound
        this.canvas.addEventListener('click', (e) => this.onClick(e));

        // Drag - controls reverb and delay
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.onTouchEnd(e));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
    }

    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = (e.clientX - rect.left) / rect.width;
        this.mouseY = (e.clientY - rect.top) / rect.height;

        // Update rotation based on mouse position
        const rotationX = (this.mouseY - 0.5) * Math.PI * 2;
        const rotationY = (this.mouseX - 0.5) * Math.PI * 2;
        this.scene.setRotation(rotationX, rotationY);

        // Update filter based on mouse position
        const filterFreq = 200 + this.mouseX * 4800; // 200Hz - 5000Hz
        const filterQ = 1 + this.mouseY * 19; // 1 - 20
        this.audio.setFilterFrequency(filterFreq);
        this.audio.setFilterQ(filterQ);

        // Handle dragging
        if (this.isDragging) {
            const dragX = (e.clientX - this.dragStartX) / rect.width;
            const dragY = (e.clientY - this.dragStartY) / rect.height;

            this.shapeOffsetX = dragX * 4; // Scale to world units
            this.shapeOffsetY = -dragY * 4;

            this.scene.setPosition(this.shapeOffsetX, this.shapeOffsetY);

            // Map drag to effects
            const delayTime = Math.abs(dragX) * 0.5; // 0 - 500ms
            const reverbMix = Math.abs(dragY); // 0 - 100%

            this.audio.setDelayTime(delayTime);
            this.audio.setReverbMix(reverbMix);
        }

        this.updateUI();
    }

    onWheel(e) {
        e.preventDefault();

        // Get current scale
        let scale = this.scene.currentScale;

        // Update scale based on wheel delta
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        scale += delta;
        scale = Math.max(0.5, Math.min(3, scale));

        this.scene.setScale(scale);

        // Map scale to frequency (exponential)
        // Scale 0.5 -> 110Hz (A2)
        // Scale 1.0 -> 440Hz (A4)
        // Scale 3.0 -> 1760Hz (A6)
        const normalizedScale = (scale - 0.5) / 2.5; // Map to 0-1
        this.audio.setFrequencyNormalized(normalizedScale);

        this.updateUI();
    }

    async onClick(e) {
        // Initialize audio context on first click
        if (!this.audio.initialized) {
            await this.audio.init();
            document.getElementById('status').textContent = 'Playing';
        }

        // Toggle sound
        if (this.audio.isPlaying) {
            this.audio.stop();
            document.getElementById('status').textContent = 'Paused';
        } else {
            this.audio.start();
            document.getElementById('status').textContent = 'Playing';
        }
    }

    onMouseDown(e) {
        this.isDragging = true;
        const rect = this.canvas.getBoundingClientRect();
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
    }

    onMouseUp(e) {
        this.isDragging = false;

        // Smoothly return shape to center
        this.scene.setPosition(0, 0);
        this.shapeOffsetX = 0;
        this.shapeOffsetY = 0;

        // Reset effects to defaults
        this.audio.setDelayTime(0.2);
        this.audio.setReverbMix(0.3);

        this.updateUI();
    }

    onTouchStart(e) {
        e.preventDefault();
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            this.onMouseDown({ clientX: touch.clientX, clientY: touch.clientY });
        }
    }

    onTouchMove(e) {
        e.preventDefault();
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            this.onMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
        }
    }

    onTouchEnd(e) {
        this.onMouseUp(e);
    }

    onKeyDown(e) {
        // Shape shortcuts
        if (e.key === '1') {
            this.changeShape('icosahedron');
        } else if (e.key === '2') {
            this.changeShape('torus');
        } else if (e.key === '3') {
            this.changeShape('octahedron');
        } else if (e.key === '4') {
            this.changeShape('dodecahedron');
        }

        // Waveform shortcuts
        if (e.key === 'q') {
            this.changeWaveform('sine');
        } else if (e.key === 'w') {
            this.changeWaveform('square');
        } else if (e.key === 'e') {
            this.changeWaveform('sawtooth');
        } else if (e.key === 'r') {
            this.changeWaveform('triangle');
        }

        // Space to toggle
        if (e.key === ' ') {
            e.preventDefault();
            this.onClick(e);
        }
    }

    changeShape(shape) {
        this.scene.createGeometry(shape);

        // Update button states
        document.querySelectorAll('[data-shape]').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.shape === shape) {
                btn.classList.add('active');
            }
        });
    }

    changeWaveform(wave) {
        this.audio.setWaveform(wave);

        // Update button states
        document.querySelectorAll('[data-wave]').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.wave === wave) {
                btn.classList.add('active');
            }
        });
    }

    updateUI() {
        // Update frequency display
        const freqDisplay = document.getElementById('freq-display');
        if (freqDisplay) {
            freqDisplay.textContent = Math.round(this.audio.currentFrequency) + ' Hz';
        }

        // Update filter display
        const filterDisplay = document.getElementById('filter-display');
        if (filterDisplay) {
            filterDisplay.textContent = Math.round(this.audio.filterFrequency) + ' Hz';
        }

        // Update Q display
        const qDisplay = document.getElementById('q-display');
        if (qDisplay) {
            qDisplay.textContent = this.audio.filterQ.toFixed(1);
        }

        // Update reverb display
        const reverbDisplay = document.getElementById('reverb-display');
        if (reverbDisplay) {
            reverbDisplay.textContent = Math.round(this.audio.reverbMix * 100) + '%';
        }

        // Update delay display
        const delayDisplay = document.getElementById('delay-display');
        if (delayDisplay) {
            delayDisplay.textContent = Math.round(this.audio.delayTime * 1000) + 'ms';
        }
    }
}

# 🎵 3D Audio Synthesizer

An interactive 3D audio synthesizer where you manipulate a geometric shape floating in a cosmic void to control real-time sound synthesis. Built with Three.js and Web Audio API.

![3D Audio Synthesizer](https://img.shields.io/badge/WebGL-Enabled-blue) ![Audio](https://img.shields.io/badge/Web%20Audio%20API-Supported-green) ![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- 🎮 **Interactive 3D Controls** - Manipulate geometric shapes in real-time
- 🎹 **Advanced Audio Synthesis** - Web Audio API with filters, reverb, and delay
- 🌌 **Stunning Visuals** - 1500+ particle cosmic void with audio-reactive effects
- 🎨 **Multiple Shapes** - Icosahedron, Torus, Octahedron, Dodecahedron
- 🎵 **Four Waveforms** - Sine, Square, Sawtooth, Triangle
- 📱 **Mobile Friendly** - Touch controls supported

## 🎮 Controls

| Input | Visual Effect | Audio Parameter |
|-------|---------------|-----------------|
| **Mouse Move** | Rotate shape | Filter frequency & resonance |
| **Mouse Wheel** | Scale shape | Oscillator pitch (110Hz - 1760Hz) |
| **Click & Drag** | Move shape | Reverb & delay mix |
| **Click** | — | Toggle audio on/off |
| **1-4 Keys** | — | Change shape |
| **Q-W-E-R Keys** | — | Change waveform |

## 🚀 Live Demo

**[Try it live here!](https://texmexdex.github.io/3d-audio-synth/)**

## 🛠️ Installation

No build tools required! Simply clone and open in a browser:

```bash
git clone https://github.com/texmexdex/3d-audio-synth.git
cd 3d-audio-synth
```

Then open `index.html` in your browser.

## 📁 Project Structure

```
3d-audio-synth/
├── index.html          # Main HTML with UI overlay
├── style.css           # Premium glassmorphism styling
└── js/
    ├── main.js         # Application coordinator
    ├── scene.js        # Three.js 3D scene manager
    ├── audio.js        # Web Audio API synthesis engine
    └── interaction.js  # Input handling & parameter mapping
```

## 🎯 How It Works

The synthesizer maps 3D transformations to audio parameters:

```
Mouse X → Filter Frequency (200-5000 Hz)
Mouse Y → Filter Resonance (Q: 1-20)
Wheel ↑ → Pitch Up (+2 octaves)
Wheel ↓ → Pitch Down (-2 octaves)
Drag X → Delay Time (0-500ms)
Drag Y → Reverb Mix (0-100%)
```

### Audio Signal Chain

```
Oscillator → Gain → Filter → Delay (feedback)
                              ↓
                    Dry/Wet Mix → Reverb
                                    ↓
                              Analyser → Master → Output
```

## 🎨 Technology Stack

- **3D Graphics**: [Three.js](https://threejs.org/) (r128)
- **Audio**: Web Audio API (native)
- **UI**: Vanilla HTML/CSS/JavaScript
- **Design**: Glassmorphism with cosmic theme
- **Fonts**: Google Fonts (Orbitron, Exo 2)

## 🌟 Highlights

- ⚡ **60 FPS** rendering with smooth animations
- 🎨 **Premium design** with glassmorphism effects
- 🔊 **Professional audio** with multiple effects
- 🎯 **Intuitive controls** mapped naturally to parameters
- ✨ **Audio-reactive visuals** that pulse with the sound

## 📝 Usage Tips

1. **Click anywhere** to start the audio (browser requires user interaction)
2. **Move your mouse slowly** to explore different filter sweeps
3. **Try combinations** like Torus + Square wave for robotic sounds
4. **Experiment with dragging** to add spacious reverb effects

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📄 License

MIT License - Feel free to use this project for learning or commercial purposes.

## 🙏 Acknowledgments

- Three.js community for excellent 3D graphics library
- Web Audio API for powerful synthesis capabilities
- The cosmic void for inspiration 🌌

---

**Made with ❤️ and WebGL**

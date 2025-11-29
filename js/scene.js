// scene.js - Three.js scene setup and rendering

export class Scene3D {
    constructor(canvas) {
        this.canvas = canvas;
        this.audioLevel = 0;
        this.targetRotationX = 0;
        this.targetRotationY = 0;
        this.currentScale = 1;
        
        this.init();
        this.createGeometry('icosahedron');
        this.createParticles();
    }
    
    init() {
        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x0a0014, 0.001);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 5;
        
        // Lighting
        this.ambientLight = new THREE.AmbientLight(0x404040, 1);
        this.scene.add(this.ambientLight);
        
        this.pointLight1 = new THREE.PointLight(0xb24bf3, 2, 100);
        this.pointLight1.position.set(5, 5, 5);
        this.scene.add(this.pointLight1);
        
        this.pointLight2 = new THREE.PointLight(0x00d4ff, 2, 100);
        this.pointLight2.position.set(-5, -5, 5);
        this.scene.add(this.pointLight2);
        
        this.pointLight3 = new THREE.PointLight(0xff006e, 1.5, 100);
        this.pointLight3.position.set(0, 5, -5);
        this.scene.add(this.pointLight3);
        
        // Handle window resize
        window.addEventListener('resize', () => this.onResize());
    }
    
    createGeometry(type) {
        // Remove existing mesh
        if (this.mesh) {
            this.scene.remove(this.mesh);
        }
        
        let geometry;
        switch(type) {
            case 'icosahedron':
                geometry = new THREE.IcosahedronGeometry(1.5, 0);
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(1.2, 0.4, 16, 100);
                break;
            case 'octahedron':
                geometry = new THREE.OctahedronGeometry(1.5, 0);
                break;
            case 'dodecahedron':
                geometry = new THREE.DodecahedronGeometry(1.5, 0);
                break;
            default:
                geometry = new THREE.IcosahedronGeometry(1.5, 0);
        }
        
        // Material with metallic/glass properties
        const material = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.7,
            roughness: 0.2,
            transparent: true,
            opacity: 0.9,
            envMapIntensity: 1,
            clearcoat: 1,
            clearcoatRoughness: 0.1,
            wireframe: false,
            emissive: 0xb24bf3,
            emissiveIntensity: 0.2
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.scene.add(this.mesh);
        
        // Add wireframe overlay
        const wireframeGeo = geometry.clone();
        const wireframeMat = new THREE.MeshBasicMaterial({
            color: 0x00d4ff,
            wireframe: true,
            transparent: true,
            opacity: 0.3
        });
        this.wireframe = new THREE.Mesh(wireframeGeo, wireframeMat);
        this.mesh.add(this.wireframe);
    }
    
    createParticles() {
        const particleCount = 1500;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            // Random positions in a large sphere
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const radius = 15 + Math.random() * 20;
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            // Random colors (purple/cyan/pink)
            const colorChoice = Math.random();
            if (colorChoice < 0.33) {
                colors[i * 3] = 0.7;
                colors[i * 3 + 1] = 0.3;
                colors[i * 3 + 2] = 0.95;
            } else if (colorChoice < 0.66) {
                colors[i * 3] = 0;
                colors[i * 3 + 1] = 0.83;
                colors[i * 3 + 2] = 1;
            } else {
                colors[i * 3] = 1;
                colors[i * 3 + 1] = 0;
                colors[i * 3 + 2] = 0.43;
            }
        }
        
        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        this.particles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(this.particles);
    }
    
    setAudioLevel(level) {
        this.audioLevel = level;
    }
    
    setRotation(x, y) {
        this.targetRotationX = x;
        this.targetRotationY = y;
    }
    
    setScale(scale) {
        this.currentScale = Math.max(0.5, Math.min(3, scale));
    }
    
    setPosition(x, y) {
        if (this.mesh) {
            this.mesh.position.x = x;
            this.mesh.position.y = y;
        }
    }
    
    update(deltaTime) {
        if (!this.mesh) return;
        
        // Smooth rotation
        this.mesh.rotation.x += (this.targetRotationX - this.mesh.rotation.x) * 0.1;
        this.mesh.rotation.y += (this.targetRotationY - this.mesh.rotation.y) * 0.1;
        
        // Audio-reactive scaling
        const audioScale = 1 + this.audioLevel * 0.3;
        const targetScale = this.currentScale * audioScale;
        this.mesh.scale.x += (targetScale - this.mesh.scale.x) * 0.2;
        this.mesh.scale.y += (targetScale - this.mesh.scale.y) * 0.2;
        this.mesh.scale.z += (targetScale - this.mesh.scale.z) * 0.2;
        
        // Audio-reactive color
        const hue = (this.audioLevel * 0.3) % 1;
        this.mesh.material.emissive.setHSL(hue, 1, 0.5);
        this.mesh.material.emissiveIntensity = 0.2 + this.audioLevel * 0.5;
        
        // Pulse wireframe opacity
        if (this.wireframe) {
            this.wireframe.material.opacity = 0.3 + this.audioLevel * 0.4;
        }
        
        // Subtle particle rotation
        if (this.particles) {
            this.particles.rotation.y += deltaTime * 0.05;
            this.particles.rotation.x += deltaTime * 0.02;
        }
        
        // Pulsing lights
        const time = Date.now() * 0.001;
        this.pointLight1.intensity = 2 + Math.sin(time) * 0.5 + this.audioLevel * 2;
        this.pointLight2.intensity = 2 + Math.sin(time + Math.PI) * 0.5 + this.audioLevel * 2;
        this.pointLight3.intensity = 1.5 + Math.cos(time) * 0.3 + this.audioLevel * 1.5;
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

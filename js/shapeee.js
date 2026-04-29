import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export class ParticlesSwarm {
    constructor(container, count = 20000) {
        this.count = count;
        this.container = container;
        this.speedMult = 1;
        this._running = true;
        this._rafId = null;

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.004);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.set(0, 0, 90);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5, 0.4, 0.85
        );
        bloomPass.strength = 2.8;
        bloomPass.radius = 0.6;
        bloomPass.threshold = 0;
        this.composer.addPass(bloomPass);

        this.dummy = new THREE.Object3D();
        this.pColor = new THREE.Color();
        this.target = new THREE.Vector3();

        this.geometry = new THREE.TetrahedronGeometry(0.25);
        this.material = new THREE.MeshBasicMaterial({ color: 0xffffff });

        this.mesh = new THREE.InstancedMesh(this.geometry, this.material, this.count);
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.scene.add(this.mesh);

        this.positions = [];
        const initColor = new THREE.Color();
        for (let i = 0; i < this.count; i++) {
            this.positions.push(new THREE.Vector3(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100
            ));
            this.mesh.setColorAt(i, initColor.setHex(0x00ff88));
        }

        this.clock = new THREE.Clock();
        this.animate = this.animate.bind(this);
        this._onResize = this._onResize.bind(this);
        window.addEventListener('resize', this._onResize);

        this.animate();
    }

    _onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.composer.setSize(window.innerWidth, window.innerHeight);
    }

    pause() {
        this._running = false;
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
    }

    resume() {
        if (!this._running) {
            this._running = true;
            this.clock.getDelta();
            this.animate();
        }
    }

    animate() {
        if (!this._running) return;
        this._rafId = requestAnimationFrame(this.animate);
        const time = this.clock.getElapsedTime() * this.speedMult;

        const speed = 0.5, complexity = 4, radius = 55, morph = 0.55;
        const count = this.count;

        for (let i = 0; i < count; i++) {
            const normalizedIdx = i / count;
            const t = time * speed;

            const theta = normalizedIdx * Math.PI * 2.0 * 100.0;
            const phi = Math.acos(2.0 * normalizedIdx - 1.0);

            const noise = Math.sin(theta * complexity + t) * Math.cos(phi * complexity - t);
            const r = radius + noise * 22.0 * morph;

            const x = r * Math.sin(phi) * Math.cos(theta + t);
            const y = r * Math.sin(phi) * Math.sin(theta + t);
            const z = r * Math.cos(phi) + Math.sin(t * 0.5 + normalizedIdx * 10.0) * 12.0;

            const waveA = Math.sin(normalizedIdx * 20.0 + t);
            const waveB = Math.cos(normalizedIdx * 10.0 - t * 0.8);
            const spiralX = x + waveA * 30.0;
            const spiralY = y + waveB * 30.0;
            const spiralZ = z + Math.sin(t + i) * 5.0;

            this.target.set(
                (1.0 - morph) * x + morph * spiralX,
                (1.0 - morph) * y + morph * spiralY,
                (1.0 - morph) * z + morph * spiralZ
            );

            const hue = (normalizedIdx + t * 0.1) % 1.0;
            const saturation = 0.8 + Math.abs(waveA) * 0.2;
            const lightness = 0.45 + Math.abs(noise) * 0.35;
            this.pColor.setHSL(hue, saturation, lightness);

            this.positions[i].lerp(this.target, 0.1);
            this.dummy.position.copy(this.positions[i]);
            this.dummy.updateMatrix();
            this.mesh.setMatrixAt(i, this.dummy.matrix);
            this.mesh.setColorAt(i, this.pColor);
        }

        this.mesh.instanceMatrix.needsUpdate = true;
        this.mesh.instanceColor.needsUpdate = true;
        this.composer.render();
    }

    dispose() {
        this.pause();
        window.removeEventListener('resize', this._onResize);
        this.geometry.dispose();
        this.material.dispose();
        this.scene.remove(this.mesh);
        this.renderer.dispose();
        if (this.container.contains(this.renderer.domElement)) {
            this.container.removeChild(this.renderer.domElement);
        }
    }
}

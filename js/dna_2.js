import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export class ParticlesSwarm {
    constructor(container, count = 15000) {
        this.count = count;
        this.container = container;
        this.speedMult = 1;
        this._running = true;
        this._rafId = null;

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.008);
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.set(0, 0, 120);

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
        bloomPass.strength = 2.0;
        bloomPass.radius = 0.5;
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
            this.mesh.setColorAt(i, initColor.setHex(0x00aaff));
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
            this.clock.getDelta(); // drain delta so no jump
            this.animate();
        }
    }

    animate() {
        if (!this._running) return;
        this._rafId = requestAnimationFrame(this.animate);
        const time = this.clock.getElapsedTime() * this.speedMult;

        const fieldStrength = 1.2;
        const morph = 0.4;
        const flowSpeed = 0.5;
        const jitter = 0.6;
        const count = this.count;

        for (let i = 0; i < count; i++) {
            const n = i / count;
            const t = time * 0.2 * flowSpeed;

            const angle = n * Math.PI * 100 + t;
            const radius = 25 + Math.sin(angle * 0.1) * 10;

            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const y = (n - 0.5) * 180;

            const noiseX = Math.sin(n * 50 + t) * Math.cos(n * 20) * fieldStrength * 10;
            const noiseY = Math.cos(n * 40 + t) * fieldStrength * 10;
            const noiseZ = Math.tan(Math.sin(n * 10 + t)) * fieldStrength * 2;

            const vibX = Math.sin(time * 3.0 + i) * jitter;
            const vibY = Math.cos(time * 2.5 + i * 0.5) * jitter;
            const vibZ = Math.sin(time * 4.0 - i) * jitter;

            const zoom = 1.8;
            this.target.set(
                (x + noiseX * (1.0 - morph) + vibX) * zoom,
                (y + noiseY + vibY) * zoom,
                (z + noiseZ * (1.0 - morph) + vibZ) * zoom
            );

            const pulse = Math.sin(time * 2.0 + n * 10.0) * 0.2 + 0.6;
            const lightness = 0.3 + Math.pow(Math.sin(n * Math.PI + t * 2.0), 4) * 0.4;

            if (i % 10 === 0) {
                this.pColor.setHSL(0.55, 0.8, lightness + 0.2);
            } else {
                this.pColor.setHSL(0.58, 0.9, lightness * pulse);
            }

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

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export class ParticlesSwarm {
    constructor(container, count = 20000) {
        this.count = count;
        this.container = container;
        this.speedMult = 1;
        this._paused = false;
        this._rafId = null;

        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x000000, 0.01);
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.set(0, 0, 100);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        bloomPass.strength = 1.8; bloomPass.radius = 0.4; bloomPass.threshold = 0;
        this.composer.addPass(bloomPass);

        this.dummy = new THREE.Object3D();
        this.color = new THREE.Color();
        this.target = new THREE.Vector3();
        this.pColor = new THREE.Color();

        this.geometry = new THREE.TetrahedronGeometry(0.25);
        this.material = new THREE.MeshBasicMaterial({ color: 0xffffff });

        this.mesh = new THREE.InstancedMesh(this.geometry, this.material, this.count);
        this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.scene.add(this.mesh);

        this.positions = [];
        for (let i = 0; i < this.count; i++) {
            this.positions.push(new THREE.Vector3(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100
            ));
            this.mesh.setColorAt(i, this.color.setHex(0x00ff88));
        }

        this.clock = new THREE.Clock();
        this.animate = this.animate.bind(this);
        this.animate();
    }

    pause() {
        this._paused = true;
        if (this._rafId) {
            cancelAnimationFrame(this._rafId);
            this._rafId = null;
        }
    }

    resume() {
        if (this._paused) {
            this._paused = false;
            this.animate();
        }
    }

    animate() {
        if (this._paused) return;
        this._rafId = requestAnimationFrame(this.animate);
        const time = this.clock.getElapsedTime() * this.speedMult;

        const PARAMS = { scale: 68, gravity: 1.45, pulse: 1.35, spin: 1.7, gold: 0.35 };
        const addControl = (id, _l, _min, _max, val) => PARAMS[id] !== undefined ? PARAMS[id] : val;
        const count = this.count;

        for (let i = 0; i < this.count; i++) {
            let target = this.target;
            let color = this.pColor;

            const scale      = addControl("scale",   "Scale",          20,  120, 68);
            const gravity    = addControl("gravity",  "Core Gravity",   0.2, 3.5, 1.45);
            const pulsePower = addControl("pulse",    "Shockwave Power", 0,   3,  1.35);
            const spinPower  = addControl("spin",     "Vortex Spin",    0.1, 4,  1.7);
            const goldMix    = addControl("gold",     "Gold Sparks",    0,   1,  0.35);

            const safeCount = Math.max(count, 1);
            const n = i / safeCount;
            const golden = 2.399963229728653;
            const layer = Math.floor(n * 9.0);
            const layerN = layer / 9.0;

            const t = time * 0.42;
            const p = i * golden;
            const wave = Math.sin(n * 92.0 - time * 3.6);
            const pulse = Math.pow(0.5 + 0.5 * Math.sin(time * 1.85 - n * 24.0), 6.0);
            const burst = 1.0 + pulse * pulsePower * (0.6 + 0.4 * Math.sin(n * 37.0 + time));

            const corePull = 1.0 - 0.72 * Math.pow(0.5 + 0.5 * Math.sin(time * 0.65 + n * 18.0), 3.0) * gravity;
            const ring = Math.sqrt(n);
            const orbit = p + t * spinPower * (1.0 + layerN * 2.7) + wave * 0.25;

            const spiral = Math.sin(n * 34.0 + time * 1.4) * 0.22;
            const radius = scale * ring * burst * (0.42 + 0.58 * Math.max(corePull, 0.12)) + spiral * scale;
            const verticalWave = Math.sin(n * 48.0 + time * 2.1) * Math.cos(time * 0.7 + layerN * 8.0);

            const x = Math.cos(orbit) * radius;
            const y = verticalWave * scale * 0.38 + Math.sin(orbit * 2.0 + time) * scale * 0.08;
            const z = Math.sin(orbit) * radius;

            target.set(x, y, z);

            const energy = Math.min(1.0, Math.max(0.0, pulse * 0.8 + Math.abs(wave) * 0.35 + (1.0 - ring) * 0.45));
            const spark = Math.pow(0.5 + 0.5 * Math.sin(i * 0.173 + time * 9.0), 18.0) * goldMix;
            const hue = 0.52 - energy * 0.06 + spark * 0.10;
            const sat = 0.78 + energy * 0.22;
            const light = 0.34 + energy * 0.38 + spark * 0.22;

            color.setHSL(hue, Math.min(1.0, sat), Math.min(0.82, light));

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
        this.geometry.dispose();
        this.material.dispose();
        this.scene.remove(this.mesh);
        this.renderer.dispose();
    }
}

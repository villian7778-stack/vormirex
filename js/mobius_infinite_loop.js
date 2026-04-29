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
        this.scene.fog = new THREE.FogExp2(0x000000, 0.008);
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.set(0, 0, 100);

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
        bloomPass.strength = 1.8;
        bloomPass.radius = 0.4;
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

        const scale = 82, twist = 2.5, flow = 0.9, thickness = 6.5, bloom = 0.7;
        const TAU = 6.283185307179586;
        const count = this.count;

        for (let i = 0; i < count; i++) {
            const u = (i + 0.5) / count;
            const g = i * 0.6180339887498949;
            const band = g - Math.floor(g);

            const t = time * flow;
            const a = TAU * u;
            const s1 = Math.sin(a + t * 0.35);
            const c1 = Math.cos(a + t * 0.35);
            const s2 = Math.sin((a + t * 0.35) * 2.0);

            const den = 1.0 + s1 * s1;
            const r = scale / den;

            const bx = c1 * r;
            const by = s1 * c1 * r * 0.9;
            const bz = scale * 0.14 * Math.sin(a * 3.0 - t * 0.8) + scale * 0.08 * s2 * bloom;

            const phi = TAU * band + t * 0.75 + twist * Math.sin(a * 0.5 + t * 0.2);
            const halfTwist = 0.5 * (a + t * 0.35);

            const ring = thickness * (
                0.55 + 0.28 * Math.sin(a * 5.0 - t * 1.3) +
                0.17 * Math.cos(a * 9.0 + t * 0.7) * bloom
            );

            const cp = Math.cos(phi), sp = Math.sin(phi);
            const ch = Math.cos(halfTwist), sh = Math.sin(halfTwist);

            const ox = ring * cp * ch;
            const oy = ring * sp;
            const oz = ring * cp * sh;

            const drift = 1.0 + 0.08 * Math.sin(a * 13.0 + t) + 0.05 * Math.cos(a * 21.0 - t * 1.7);

            this.target.set(
                (bx + ox + scale * 0.05 * Math.sin(phi * 2.0 + a * 4.0 + t)) * drift,
                (by + oy + scale * 0.04 * Math.cos(phi * 2.0 - a * 3.0 - t * 0.6)) * drift,
                (bz + oz + scale * 0.06 * Math.sin(a * 7.0 + phi - t * 0.5) * bloom) * drift
            );

            const h = band * 0.22 + 0.08 * Math.sin(a * 2.0 - t * 0.4) + 0.55 + 0.05 * s2;
            const hue = h - Math.floor(h);
            const sat = 0.75 + 0.2 * Math.abs(Math.sin(phi + a));
            const lit = 0.42 + 0.18 * Math.sin(phi - t * 0.3) + 0.08 * Math.cos(a * 6.0 + t);

            this.pColor.setHSL(hue, sat, lit);

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

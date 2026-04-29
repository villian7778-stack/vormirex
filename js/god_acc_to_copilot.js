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
        this.scene.fog = new THREE.FogExp2(0x000000, 0.006);
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
        bloomPass.strength = 2.2;
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
            this.clock.getDelta();
            this.animate();
        }
    }

    animate() {
        if (!this._running) return;
        this._rafId = requestAnimationFrame(this.animate);
        const time = this.clock.getElapsedTime() * this.speedMult;

        const scale = 45, complexity = 8, flow = 0.6;
        const count = this.count;

        for (let i = 0; i < count; i++) {
            const t = time * flow;
            const ratio = i / count;

            const phi   = Math.acos(1.0 - 2.0 * ratio);
            const theta = Math.sqrt(count * Math.PI) * phi;

            const harmonic   = Math.sin(complexity * phi + t) * Math.cos(complexity * theta - t);
            const baseRadius = scale * (0.6 + 0.4 * harmonic);

            let px = baseRadius * Math.sin(phi) * Math.cos(theta);
            let py = baseRadius * Math.sin(phi) * Math.sin(theta);
            let pz = baseRadius * Math.cos(phi);

            const energy       = Math.pow(Math.abs(Math.sin(ratio * Math.PI * 100.0 + t * 2.0)), 10.0);
            const tendrilReach = 1.0 + energy * 1.5;
            px *= tendrilReach;
            py *= tendrilReach;
            pz *= tendrilReach;

            const collapseCycle  = Math.pow(Math.sin(ratio * Math.PI + t * 0.5), 8.0);
            const collapseFactor = 1.0 - collapseCycle;
            px *= collapseFactor;
            py *= collapseFactor;
            pz *= collapseFactor;

            const dist2D       = Math.sqrt(px * px + pz * pz);
            const torsionAngle = dist2D * 0.02 * Math.sin(t * 0.2);

            const finalX = px * Math.cos(torsionAngle) - pz * Math.sin(torsionAngle);
            const finalZ = px * Math.sin(torsionAngle) + pz * Math.cos(torsionAngle);
            const finalY = py;

            this.target.set(finalX, finalY, finalZ);

            const distance        = Math.sqrt(finalX * finalX + finalY * finalY + finalZ * finalZ);
            const normalizedDist  = Math.min(distance / (scale * 2.5), 1.0);

            const hue = 0.55 + normalizedDist * 0.3;
            const sat = 0.7  + (1.0 - normalizedDist) * 0.3;
            const lit = 0.05 + Math.pow(1.0 - normalizedDist, 3.0) * 0.95;

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

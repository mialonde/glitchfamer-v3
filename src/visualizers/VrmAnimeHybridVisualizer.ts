import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRM } from '@pixiv/three-vrm';
import { TalkingHead } from "../core/TalkingHead";
import { IVisualizer, AudioEvents, RenderContext, VisualizerSettings } from '../types';

export class VrmAnimeHybridVisualizer implements IVisualizer {
    public name = 'VRM_ANIME_HYBRID';

    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;
    private renderer: THREE.WebGLRenderer;
    private vrm: VRM | null = null;
    private talkingHead: TalkingHead | null = null;
    
    private threeCanvas: HTMLCanvasElement;
    
    private customUniforms = {
        uTime: { value: 0 },
        uBass: { value: 0 },
        uMid: { value: 0 },
        uTreble: { value: 0 }
    };

    constructor() {
        this.threeCanvas = document.createElement('canvas');
        this.threeCanvas.width = 800;
        this.threeCanvas.height = 800;
        
        this.renderer = new THREE.WebGLRenderer({ canvas: this.threeCanvas, alpha: true, antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio || 1);
        this.renderer.setSize(this.threeCanvas.width, this.threeCanvas.height);
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(30, 1.0, 0.1, 100);
        this.camera.position.set(0.0, 1.45, 0.65); // Zoom in strictly to the face

        const light = new THREE.DirectionalLight(0xffffff, 2.0);
        light.position.set(1.0, 1.0, 1.0).normalize();
        this.scene.add(light);
        
        const ambient = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambient);

        this.loadVRM();
    }

    private loadVRM() {
        const loader = new GLTFLoader();
        loader.register((parser) => {
            return new VRMLoaderPlugin(parser);
        });

        loader.load(
            '/models/AliciaSolid.vrm',
            (gltf) => {
                const vrm = gltf.userData.vrm as VRM;
                this.vrm = vrm;
                this.talkingHead = new TalkingHead(vrm);
                this.scene.add(vrm.scene);
                
                // AliciaSolid (VRM 0.0) is facing +Z, camera is at +Z looking at 0, 
                // so rotation.y = 0 makes her face the camera.
                vrm.scene.rotation.y = Math.PI; 
                
                // Lower arms from T-Pose to A-Pose
                if (vrm.humanoid) {
                    const head = vrm.humanoid.getNormalizedBoneNode('head');
                    if (head) {
                        const headPos = new THREE.Vector3();
                        head.getWorldPosition(headPos);
                        // Position camera directly in front of the head
                        this.camera.position.set(headPos.x, headPos.y + 0.02, headPos.z + 0.55);
                        this.camera.lookAt(headPos.x, headPos.y + 0.02, headPos.z);
                    }
                    
                    const leftUpperArm = vrm.humanoid.getNormalizedBoneNode('leftUpperArm');
                    if (leftUpperArm) leftUpperArm.rotation.z = -1.0; // Rotate down
                    const rightUpperArm = vrm.humanoid.getNormalizedBoneNode('rightUpperArm');
                    if (rightUpperArm) rightUpperArm.rotation.z = 1.0; // Rotate down
                }

                // Setup custom shader onBeforeCompile for meshes
                vrm.scene.traverse((obj) => {
                    if ((obj as THREE.Mesh).isMesh) {
                        const mesh = obj as THREE.Mesh;
                        if (mesh.material) {
                            // Convert material to an array if it's not
                            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                            
                            materials.forEach(mat => {
                                if (mat.userData.customShaderInjected) return;
                                mat.userData.customShaderInjected = true;

                                const originalOnBeforeCompile = mat.onBeforeCompile.bind(mat);
                                mat.onBeforeCompile = (shader, renderer) => {
                                    // Let the original material set its defines and uniforms first
                                    originalOnBeforeCompile(shader, renderer);

                                    shader.uniforms.uTime = this.customUniforms.uTime;
                                    shader.uniforms.uBass = this.customUniforms.uBass;
                                    shader.uniforms.uMid = this.customUniforms.uMid;
                                    shader.uniforms.uTreble = this.customUniforms.uTreble;

                                    // Add uniforms to vertex shader
                                    shader.vertexShader = `
                                        uniform float uTime;
                                        uniform float uBass;
                                        uniform float uTreble;
                                    ` + shader.vertexShader;

                                    // Removed vertex ripple completely to avoid mesh tearing, keeping face stable
                                    shader.vertexShader = shader.vertexShader.replace(
                                        '#include <begin_vertex>',
                                        `
                                        #include <begin_vertex>
                                        `
                                    );
                                };
                            });
                        }
                    }
                });
            },
            (progress) => {},
            (error) => console.error("VRM Load Error:", error)
        );
    }

    public update(audio: AudioEvents, settings: VisualizerSettings): void {
        this.customUniforms.uTime.value = audio.time;
        this.customUniforms.uBass.value = audio.bassEnergy ?? audio.kick ?? 0;
        this.customUniforms.uMid.value = audio.midEnergy ?? audio.snare ?? 0;
        this.customUniforms.uTreble.value = audio.trebleEnergy ?? audio.hihat ?? 0;

        if (this.vrm) {
            if (this.talkingHead) {
                this.talkingHead.update(audio, settings);
            }

            this.vrm.update(1/60);
        }
    }

    public render(context: RenderContext): void {
        const { ctx, width, height, audio, settings } = context;

        // Resize three canvas if needed
        if (this.threeCanvas.width !== width || this.threeCanvas.height !== height) {
            this.threeCanvas.width = width;
            this.threeCanvas.height = height;
            this.renderer.setSize(width, height);
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }

        // Render Three.js Scene
        this.renderer.render(this.scene, this.camera);

        // Clear 2D Canvas (Background)
        ctx.fillStyle = '#050508'; // Darker background
        ctx.fillRect(0, 0, width, height);

        if (settings.avatarMode === 'anime') {
            // Solid Mode (Anime)
            ctx.drawImage(this.threeCanvas, 0, 0, width, height);
        } else {
            // Hologram Mode
            ctx.save();
            
            // Slight cyan/blue tint & additive blending for hologram glow
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = 0.85;
            
            // Chromatic aberration (RGB Split)
            // Red channel shift
            ctx.drawImage(this.threeCanvas, -2, 0, width, height);
            // Cyan channel shift
            ctx.drawImage(this.threeCanvas, 2, 0, width, height);
            
            ctx.globalAlpha = 1.0;
            ctx.drawImage(this.threeCanvas, 0, 0, width, height);
            
            // Scanlines overlay
            ctx.fillStyle = 'rgba(0, 255, 255, 0.05)';
            for (let y = 0; y < height; y += 4) {
                ctx.fillRect(0, y, width, 1);
            }
            ctx.restore();
        }

        // Vokal: Gözlerde waveform yansıyor / Post Processing (Distortion/Pixelation)
        const treble = audio.trebleEnergy ?? audio.hihat ?? 0;
        const mid = audio.midEnergy ?? audio.snare ?? 0;
        const bass = audio.bassEnergy ?? audio.kick ?? 0;

        // Kuantum Parçalanma (Treble Peak Glitch - 2D Canvas)
        if (treble > 0.75) {
            const glitchIntensity = (treble - 0.75) * 60;
            const slices = 5;
            for (let i = 0; i < slices; i++) {
                const sliceHeight = Math.random() * 30 + 5;
                const y = Math.random() * height;
                const xOffset = (Math.random() - 0.5) * glitchIntensity;
                
                try {
                    const imgData = ctx.getImageData(0, y, width, sliceHeight);
                    // Rgb split effect occasionally
                    if (Math.random() > 0.5) {
                        ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                        ctx.fillRect(0, y, width, sliceHeight);
                        ctx.globalCompositeOperation = 'lighter';
                    }
                    ctx.putImageData(imgData, xOffset, y);
                    ctx.globalCompositeOperation = 'source-over';
                } catch (e) {} // Ignore bounds errors
            }
        }

        // Overlay Vokal (Waveform yansıması - Holo HUD Effect)
        if (mid > 0.3) {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.strokeStyle = `rgba(0, 255, 255, ${mid * 0.6})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            // Sadece ortadaki göz hizasına waveform çiziyoruz (Anime karakterin gözlerinin olduğu yaklaşık Y)
            const eyeY = height * 0.40; 
            const waveWidth = width * 0.6;
            const startX = width * 0.2;
            
            for (let i = 0; i < audio.spectrum.length; i += 2) {
                const x = startX + (i / audio.spectrum.length) * waveWidth;
                const v = audio.spectrum[i] * 60 * mid;
                if (i === 0) ctx.moveTo(x, eyeY - v);
                else ctx.lineTo(x, eyeY - v);
            }
            ctx.stroke();
            ctx.restore();
            
            // Neon Glitch Box around eyes
            if (bass > 0.6) {
                ctx.strokeStyle = `rgba(255, 0, 128, ${bass * 0.3})`;
                ctx.strokeRect(startX, eyeY - 40, waveWidth, 80);
            }
        }
    }
}

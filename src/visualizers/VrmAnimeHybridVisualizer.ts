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
    
    private isLoaded = false;
    private isLoading = true;
    private currentModelUrl: string = '/models/AliciaSolid.vrm';
    private loadingError: string | null = null;
    private baseHeadPos: THREE.Vector3 = new THREE.Vector3(0, 1.35, 0);

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

        this.loadVRM(this.currentModelUrl);
    }

    public loadVRM(modelUrl: string = '/models/AliciaSolid.vrm') {
        this.currentModelUrl = modelUrl;
        this.isLoading = true;
        this.isLoaded = false;
        this.loadingError = null;

        // Clean up previous VRM
        if (this.vrm) {
            this.scene.remove(this.vrm.scene);
            this.vrm = null;
            this.talkingHead = null;
        }

        const loader = new GLTFLoader();
        loader.register((parser) => {
            return new VRMLoaderPlugin(parser);
        });

        const setupVRM = (vrm: VRM) => {
            this.vrm = vrm;
            this.talkingHead = new TalkingHead(vrm);
            this.scene.add(vrm.scene);
            this.isLoaded = true;
            this.isLoading = false;
            this.loadingError = null;
            
            // Standard VRM models face +Z, camera is at +Z looking at 0, 
            // so rotation.y = Math.PI makes the character face the camera.
            vrm.scene.rotation.y = Math.PI; 
            
            // Auto-focus camera on the character head & store base head position
            if (vrm.humanoid) {
                const head = vrm.humanoid.getNormalizedBoneNode('head');
                if (head) {
                    head.getWorldPosition(this.baseHeadPos);
                } else {
                    const bbox = new THREE.Box3().setFromObject(vrm.scene);
                    const center = new THREE.Vector3();
                    bbox.getCenter(center);
                    this.baseHeadPos.set(center.x, bbox.max.y - (bbox.max.y - bbox.min.y) * 0.14, center.z);
                }
            }

            this.updateCameraFraming(this.threeCanvas.width / this.threeCanvas.height);

            // Setup custom shader onBeforeCompile for meshes
            vrm.scene.traverse((obj) => {
                if ((obj as THREE.Mesh).isMesh) {
                    const mesh = obj as THREE.Mesh;
                    if (mesh.material) {
                        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
                        
                        materials.forEach(mat => {
                            if (mat.userData.customShaderInjected) return;
                            mat.userData.customShaderInjected = true;

                            const originalOnBeforeCompile = mat.onBeforeCompile.bind(mat);
                            mat.onBeforeCompile = (shader, renderer) => {
                                originalOnBeforeCompile(shader, renderer);

                                shader.uniforms.uTime = this.customUniforms.uTime;
                                shader.uniforms.uBass = this.customUniforms.uBass;
                                shader.uniforms.uMid = this.customUniforms.uMid;
                                shader.uniforms.uTreble = this.customUniforms.uTreble;

                                shader.vertexShader = `
                                    uniform float uTime;
                                    uniform float uBass;
                                    uniform float uTreble;
                                ` + shader.vertexShader;

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
        };

        loader.load(
            modelUrl,
            (gltf) => {
                const vrm = gltf.userData.vrm as VRM;
                if (vrm) {
                    setupVRM(vrm);
                } else {
                    console.error("No VRM user data found in model file:", modelUrl);
                    this.isLoading = false;
                    this.loadingError = "Model dosyasında VRM verisi bulunamadı.";
                }
            },
            (progress) => {},
            (error) => {
                console.warn(`VRM load error for ${modelUrl}:`, error);
                // Fallback to AliciaSolid if local path failed
                if (modelUrl !== '/models/AliciaSolid.vrm') {
                    console.log("Attempting fallback to /models/AliciaSolid.vrm");
                    this.loadVRM('/models/AliciaSolid.vrm');
                    return;
                }

                const fallbackUrl = 'https://raw.githubusercontent.com/vrm-c/UniVRM/master/Tests/Models/Alicia_vrm-0.51/AliciaSolid_vrm-0.51.vrm';
                loader.load(
                    fallbackUrl,
                    (gltf) => {
                        const vrm = gltf.userData.vrm as VRM;
                        if (vrm) {
                            setupVRM(vrm);
                        }
                    },
                    undefined,
                    (fallbackErr) => {
                        console.error("VRM Fallback Load Failed:", fallbackErr);
                        this.isLoading = false;
                        this.loadingError = "VRM modeli yüklenemedi.";
                    }
                );
            }
        );
    }

    public update(audio: AudioEvents, settings: VisualizerSettings): void {
        // Dynamic Model URL Switch
        const targetModelUrl = settings.vrmModelUrl || '/models/AliciaSolid.vrm';
        if (targetModelUrl !== this.currentModelUrl) {
            this.loadVRM(targetModelUrl);
        }

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

    /**
     * Tüm En-Boy Oranlarında (16:9, 1:1, 9:16) KAFAYI Ana Materyal & Odak Noktası Olarak Kadrajlama
     */
    private updateCameraFraming(aspect: number): void {
        if (!this.vrm) return;

        const headX = this.baseHeadPos.x;
        const headY = this.baseHeadPos.y;
        const headZ = this.baseHeadPos.z;

        // 16:9, 1:1 ve 9:16 için dinamik kamera mesafesi ve kadraj hesabı
        const baseDistance = 0.50;
        let distance = baseDistance;
        let yOffset = 0.01;
        let targetFov = 34;

        if (aspect < 0.8) {
            // 9:16 Dikey Format (Reels / TikTok / Shorts)
            // Dar genişlikte saç/kafa kesilmesini önlemek ve kafayı ekranın üst-orta altın oranına oturtmak için dinamik mesafe
            distance = baseDistance * (0.85 / Math.max(0.45, aspect));
            yOffset = -0.035; // Kafayı ana odak olarak üst-orta alana merkezler
            targetFov = 35;
        } else if (aspect >= 0.8 && aspect < 1.4) {
            // 1:1 Kare Format (Avatar / Kapak / Profil)
            distance = 0.52;
            yOffset = 0.012;
            targetFov = 34;
        } else {
            // 16:9 Geniş Ekran (Sinematik / YouTube)
            distance = 0.48;
            yOffset = 0.01;
            targetFov = 32;
        }

        const targetX = headX;
        const targetY = headY + yOffset;
        const targetZ = headZ;

        this.camera.fov = targetFov;
        this.camera.aspect = aspect;
        this.camera.position.set(targetX, targetY, targetZ + distance);
        this.camera.lookAt(targetX, targetY, targetZ);
        this.camera.updateProjectionMatrix();
    }

    public render(context: RenderContext): void {
        const { ctx, width, height, audio, settings } = context;
        const aspect = width / height;

        // Resize three canvas if needed
        if (this.threeCanvas.width !== width || this.threeCanvas.height !== height) {
            this.threeCanvas.width = width;
            this.threeCanvas.height = height;
            this.renderer.setSize(width, height);
        }

        // 16:9, 9:16 ve 1:1 oranlarında kafaya mükemmel odaklama
        this.updateCameraFraming(aspect);

        // Render Three.js Scene (Three.js WebGL canvas alpha: true is transparent)
        this.renderer.render(this.scene, this.camera);

        if (!this.isLoaded) {
            // Cyberpunk Holographic Loading Indicator (Transparent overlay)
            ctx.save();
            ctx.fillStyle = '#00F0FF';
            ctx.font = '10px "JetBrains Mono", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('INITIALIZING 3D VRM AVATAR NEURAL RIG...', width / 2, height / 2 - 20);
            
            const spin = audio.time * 4;
            ctx.strokeStyle = '#00F0FF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(width / 2, height / 2 + 15, 18, spin, spin + Math.PI * 1.5);
            ctx.stroke();
            ctx.restore();
            return;
        }

        const isHologram = settings.avatarMode === 'hologram';

        if (!isHologram) {
            // Solid Anime Mode (Default): Clean, crisp, high-definition 3D character directly on top of background
            ctx.save();
            ctx.drawImage(this.threeCanvas, 0, 0, width, height);
            ctx.restore();
        } else {
            // Hologram 3D Mode: Elegant holographic glow with subtle cyan ambience
            ctx.save();
            
            // Base character draw
            ctx.drawImage(this.threeCanvas, 0, 0, width, height);

            // Subtle holographic bloom overlay
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = 0.35 + (audio.energy * 0.25);
            ctx.drawImage(this.threeCanvas, 0, 0, width, height);

            ctx.restore();
        }
    }
}

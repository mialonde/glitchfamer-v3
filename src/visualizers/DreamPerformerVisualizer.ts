import * as THREE from 'three';
import { VRM, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';
import { IVisualizer, AudioEvents, RenderContext, VisualizerSettings } from '../types';
import { TalkingHead } from '../core/TalkingHead';

export class DreamPerformerVisualizer implements IVisualizer {
  public name = 'Dream Performer';

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private clock = new THREE.Clock();
  
  // Avatar
  private currentVrm: VRM | null = null;
  private isVrmLoaded = false;
  private isVrmLoading = false;
  private talkingHead: TalkingHead | null = null;
  
  // Resilient 3D Holographic Dummy Fallback
  private fallbackMesh: THREE.Group | null = null;
  private bodyParts: { mesh: THREE.Mesh; basePosition: THREE.Vector3; type: string }[] = [];

  // Dynamic Scene Elements
  private faceLight!: THREE.PointLight;
  private ambientLight!: THREE.AmbientLight;
  private rimLight!: THREE.DirectionalLight;
  private fractalWorldGroup!: THREE.Group;
  private fractalNodes: { mesh: THREE.Mesh; originalScale: THREE.Vector3; speed: number; phase: number }[] = [];
  
  // Psychedelic Space Grid / Particles
  private starField!: THREE.Points;
  private starGeometry!: THREE.BufferGeometry;
  private starPositions!: Float32Array;

  // Animation & Transition States
  private time = 0;
  private rotationSpeed = 0.15;
  private hueShift = 0;
  private targetFaceLightIntensity = 1.5;
  private targetAmbientIntensity = 0.4;
  private physicalWindPhase = 0;
  private chorusTransformation = 0; // Transforms world dynamically during high energy choruses
  private lastBeat = false;

  constructor() {
    this.initThree();
    this.loadVrm();
  }

  private initThree() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0a0518, 0.015);

    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.set(0, 1.4, 3.2);

    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true
      });
      this.renderer.setSize(720, 720);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    } catch (e) {
      console.warn("WebGL initialization error:", e);
    }

    // Lights
    this.ambientLight = new THREE.AmbientLight(0x1a0a2a, 0.4);
    this.scene.add(this.ambientLight);

    // Highly reactive PointLight directly in front of the avatar face
    this.faceLight = new THREE.PointLight(0xff00ff, 1.5, 8);
    this.faceLight.position.set(0, 1.6, 1.0);
    this.scene.add(this.faceLight);

    // Cinematic neon rim light
    this.rimLight = new THREE.DirectionalLight(0x00ffff, 1.8);
    this.rimLight.position.set(2, 4, -3);
    this.scene.add(this.rimLight);

    // Living Fractal World Group (background structure)
    this.fractalWorldGroup = new THREE.Group();
    this.scene.add(this.fractalWorldGroup);
    this.buildFractalWorld();

    // Foreground Psychedelic starfield
    this.buildStarField();

    // Build the fallback body mesh in case VRM load fails/takes time
    this.buildFallbackMannequin();
  }

  private buildFractalWorld() {
    // Generate a beautiful concentric shell of recursive glowing wireframe geometries
    // mimicking a sacred geometry / psychedelic dreamscape
    const geometries = [
      new THREE.IcosahedronGeometry(1, 1),
      new THREE.OctahedronGeometry(1, 2),
      new THREE.DodecahedronGeometry(1, 1),
      new THREE.TorusGeometry(1.2, 0.3, 8, 24)
    ];

    const count = 48;
    for (let i = 0; i < count; i++) {
      const geom = geometries[i % geometries.length];
      const mat = new THREE.MeshBasicMaterial({
        color: 0x8800ff,
        wireframe: true,
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending
      });

      const mesh = new THREE.Mesh(geom, mat);
      
      // Arrange nodes in spiral shells around the center avatar
      const theta = (i / count) * Math.PI * 2 * 3; // Spiral turns
      const radius = 6.0 + (i / count) * 15.0; // Expand outward
      const height = (Math.random() - 0.5) * 8.0;

      mesh.position.set(
        Math.sin(theta) * radius,
        height + 1.2,
        Math.cos(theta) * radius
      );

      const scaleVal = 0.5 + Math.random() * 1.5;
      mesh.scale.set(scaleVal, scaleVal, scaleVal);

      this.fractalWorldGroup.add(mesh);
      this.fractalNodes.push({
        mesh,
        originalScale: new THREE.Vector3(scaleVal, scaleVal, scaleVal),
        speed: 0.2 + Math.random() * 0.8,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  private buildStarField() {
    const starCount = 300;
    this.starGeometry = new THREE.BufferGeometry();
    this.starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i += 3) {
      // Cylindrical distribution around camera z axis
      const theta = Math.random() * Math.PI * 2;
      const radius = 1.0 + Math.random() * 8.0;
      this.starPositions[i] = Math.sin(theta) * radius;
      this.starPositions[i + 1] = (Math.random() - 0.2) * 5.0;
      this.starPositions[i + 2] = -15 + Math.random() * 30; // Z depth
    }

    this.starGeometry.setAttribute('position', new THREE.BufferAttribute(this.starPositions, 3));
    
    const starMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    this.starField = new THREE.Points(this.starGeometry, starMaterial);
    this.scene.add(this.starField);
  }

  private buildFallbackMannequin() {
    this.fallbackMesh = new THREE.Group();
    this.fallbackMesh.position.set(0, 0, 0);

    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });

    // Elegant glowing holographic mannequin
    const headGeom = new THREE.IcosahedronGeometry(0.2, 1);
    const head = new THREE.Mesh(headGeom, wireframeMaterial);
    head.position.set(0, 1.6, 0);
    this.fallbackMesh.add(head);
    this.bodyParts.push({ mesh: head, basePosition: head.position.clone(), type: 'head' });

    const chestGeom = new THREE.CylinderGeometry(0.18, 0.1, 0.5, 6, 2);
    const chest = new THREE.Mesh(chestGeom, wireframeMaterial);
    chest.position.set(0, 1.15, 0);
    this.fallbackMesh.add(chest);
    this.bodyParts.push({ mesh: chest, basePosition: chest.position.clone(), type: 'chest' });

    const pelvisGeom = new THREE.CylinderGeometry(0.12, 0.16, 0.25, 6, 1);
    const pelvis = new THREE.Mesh(pelvisGeom, wireframeMaterial);
    pelvis.position.set(0, 0.8, 0);
    this.fallbackMesh.add(pelvis);
    this.bodyParts.push({ mesh: pelvis, basePosition: pelvis.position.clone(), type: 'pelvis' });

    // Dynamic Limbs
    const limbSegments = [
      { name: 'armL1', geom: new THREE.CylinderGeometry(0.04, 0.03, 0.3, 4), pos: new THREE.Vector3(-0.3, 1.25, 0), rotZ: -0.5 },
      { name: 'armL2', geom: new THREE.CylinderGeometry(0.03, 0.02, 0.3, 4), pos: new THREE.Vector3(-0.45, 1.0, 0), rotZ: -0.3 },
      { name: 'armR1', geom: new THREE.CylinderGeometry(0.04, 0.03, 0.3, 4), pos: new THREE.Vector3(0.3, 1.25, 0), rotZ: 0.5 },
      { name: 'armR2', geom: new THREE.CylinderGeometry(0.03, 0.02, 0.3, 4), pos: new THREE.Vector3(0.45, 1.0, 0), rotZ: 0.3 },
      { name: 'legL1', geom: new THREE.CylinderGeometry(0.06, 0.05, 0.4, 4), pos: new THREE.Vector3(-0.15, 0.5, 0), rotZ: 0.1 },
      { name: 'legL2', geom: new THREE.CylinderGeometry(0.05, 0.04, 0.4, 4), pos: new THREE.Vector3(-0.15, 0.1, 0), rotZ: 0 },
      { name: 'legR1', geom: new THREE.CylinderGeometry(0.06, 0.05, 0.4, 4), pos: new THREE.Vector3(0.15, 0.5, 0), rotZ: -0.1 },
      { name: 'legR2', geom: new THREE.CylinderGeometry(0.05, 0.04, 0.4, 4), pos: new THREE.Vector3(0.15, 0.1, 0), rotZ: 0 }
    ];

    for (const seg of limbSegments) {
      const mesh = new THREE.Mesh(seg.geom, wireframeMaterial);
      mesh.position.copy(seg.pos);
      mesh.rotation.z = seg.rotZ;
      this.fallbackMesh.add(mesh);
      this.bodyParts.push({ mesh, basePosition: seg.pos.clone(), type: seg.name });
    }

    this.scene.add(this.fallbackMesh);
  }

  private async loadVrm() {
    if (this.isVrmLoaded || this.isVrmLoading) return;
    this.isVrmLoading = true;

    try {
      const loader = new THREE.Loader();
      // Since VRM uses GLTFLoader behind the scenes, we load GLTFLoader & register the plugin
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const gltfLoader = new GLTFLoader();
      
      gltfLoader.register((parser) => {
        return new VRMLoaderPlugin(parser);
      });

      console.log("Dream Performer loading AliciaSolid VRM...");
      gltfLoader.load(
        '/models/AliciaSolid.vrm',
        (gltf) => {
          const vrm = gltf.userData.vrm as VRM;
          if (!vrm) {
            throw new Error("VRM plugin could not extract Alicia VRM");
          }
          
          this.currentVrm = vrm;
          this.scene.add(vrm.scene);
          vrm.scene.rotation.y = Math.PI; // Face the camera perfectly without lookAt solver clashes

          // Force world matrix update before calibration/position queries
          vrm.scene.updateMatrixWorld(true);

          if (vrm.lookAt) {
            vrm.lookAt.target = this.camera;
            vrm.lookAt.autoUpdate = true;
          }

          // Unpack bone animations helper
          this.talkingHead = new TalkingHead(vrm);
          
          // Disable fallback mannequin if VRM loaded successfully
          if (this.fallbackMesh) {
            this.scene.remove(this.fallbackMesh);
            this.fallbackMesh = null;
          }

          this.isVrmLoaded = true;
          this.isVrmLoading = false;
          console.log("Alicia VRM successfully rigged into Dream Performer.");
        },
        undefined,
        (error) => {
          console.warn("Could not load /models/AliciaSolid.vrm, continuing elegantly with 3D Cyber Fallback Mannequin:", error);
          this.isVrmLoading = false;
        }
      );
    } catch (e) {
      console.warn("Exception caught loading VRM in Dream Performer:", e);
      this.isVrmLoading = false;
    }
  }

  public update(audio: AudioEvents, settings: VisualizerSettings): void {
    const delta = this.clock.getDelta();
    const speed = settings.visSpeed ?? 1.0;
    const scale = settings.visScale ?? 1.0;
    const colorShift = settings.visColorShift ?? 0.2;
    const beatSens = settings.visBeatSensitivity ?? 1.0;
    const rotationParam = settings.visRotation ?? 0.5;

    this.time += delta * speed;
    this.hueShift = (this.hueShift + delta * 20 * colorShift) % 360;

    // --- Audio Reaction Logic ---
    const bass = audio.bassEnergy ?? audio.kick ?? 0.1;
    const vocal = audio.vocalEnergy ?? audio.energy ?? 0.1;
    const treble = audio.trebleEnergy ?? 0.1;
    const generalEnergy = audio.energy ?? 0.2;

    // On Beat: Trigger a beautiful transformation wave pulse
    if (audio.beat && !this.lastBeat) {
      this.chorusTransformation = 1.0;
    } else {
      this.chorusTransformation += (0 - this.chorusTransformation) * 0.1; // Smooth decay
    }
    this.lastBeat = audio.beat;

    // --- 1. Living Fractal World Transform ---
    // Slow infinite cosmic tunnel camera motion
    this.fractalWorldGroup.rotation.y += delta * 0.06 * rotationParam * (1 + bass * 0.8);
    this.fractalWorldGroup.rotation.z += delta * 0.02 * rotationParam;
    
    // Scale and opacity pulsation based on Chorus/Beat Transformation state
    const currentWorldScale = 1.0 + this.chorusTransformation * 0.15 * beatSens;
    this.fractalWorldGroup.scale.set(currentWorldScale, currentWorldScale, currentWorldScale);

    this.fractalNodes.forEach((node, idx) => {
      // Dynamic spiral breathing driven by time & vocal frequency
      const breathing = Math.sin(this.time * node.speed + node.phase) * 0.15;
      const pulseScale = node.originalScale.clone().multiplyScalar(1.0 + breathing + vocal * 0.4);
      node.mesh.scale.copy(pulseScale);

      // Mutate material color dynamically driven by vocal hue shift
      const mat = node.mesh.material as THREE.MeshBasicMaterial;
      const nodeHue = (this.hueShift + idx * 8) % 360;
      mat.color.setHSL(nodeHue / 360, 0.9, 0.5);
      
      // Expand wireframe visibility at high chorus transformations
      mat.opacity = 0.08 + (vocal * 0.15) + (this.chorusTransformation * 0.25);
    });

    // --- 2. Foreground Starfield Flythrough ---
    const starAttr = this.starGeometry.getAttribute('position') as THREE.BufferAttribute;
    const starArray = starAttr.array as Float32Array;
    const flythroughSpeed = delta * 4 * speed * (1 + bass * 1.5);

    for (let i = 2; i < starArray.length; i += 3) {
      starArray[i] -= flythroughSpeed; // Move closer to camera on Z
      if (starArray[i] < -5) {
        // Recycle back to far plane
        starArray[i] = 15;
        // Randomize lateral positions on recycle
        const theta = Math.random() * Math.PI * 2;
        const radius = 1.0 + Math.random() * 8.0;
        starArray[i - 2] = Math.sin(theta) * radius;
        starArray[i - 1] = (Math.random() - 0.2) * 5.0;
      }
    }
    starAttr.needsUpdate = true;

    // Rotate starfield points slightly for a trippy parallax tilt
    this.starField.rotation.z += delta * 0.03 * rotationParam;

    // --- 3. Dynamic Face Lighting (driven by vocal shift) ---
    // Change face light color with vocal hue-shift, and intensity with general energy
    this.targetFaceLightIntensity = 0.5 + vocal * 4.5 * beatSens;
    this.faceLight.intensity += (this.targetFaceLightIntensity - this.faceLight.intensity) * 0.25;
    this.faceLight.color.setHSL(this.hueShift / 360, 1.0, 0.6);

    // Dynamic rotation of the point light to create organic shadows moving across the face
    const lightAngle = this.time * 1.8;
    this.faceLight.position.x = Math.sin(lightAngle) * 0.6;
    this.faceLight.position.z = 0.8 + Math.cos(lightAngle) * 0.4;

    this.ambientLight.intensity = 0.2 + (treble * 0.4);
    this.rimLight.color.setHSL((this.hueShift + 180) % 360 / 360, 1.0, 0.5);

    // --- 4. Physical Hair & Outfit Sway + Bone Motion ---
    this.physicalWindPhase += delta * 5.0 * (1.0 + bass * 1.2);

    if (this.isVrmLoaded && this.currentVrm) {
      // Direct lip-sync blending using talking head
      if (this.talkingHead) {
        this.talkingHead.update(audio);
      }

      // Update VRM animations, lookAt target, expression managers, and spring bones
      this.currentVrm.update(Math.min(delta, 0.1));

      // Sync custom Three.js shader deformation variables (similar to VRM Anime Hybrid Visualizer)
      this.currentVrm.scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh && obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((mat) => {
            if (mat.userData && mat.userData.shader) {
              const shader = mat.userData.shader;
              if (shader.uniforms) {
                if (shader.uniforms.uTime) shader.uniforms.uTime.value = this.time;
                if (shader.uniforms.uBass) shader.uniforms.uBass.value = bass;
                if (shader.uniforms.uTreble) shader.uniforms.uTreble.value = treble;
              }
            }
          });
        }
      });

    } else if (this.fallbackMesh) {
      // Rig the fallback Cyber Hologram Mannequin with reactive physical dances
      this.bodyParts.forEach((part) => {
        const timeFactor = this.time * 2.5 + part.mesh.position.y * 3.5;
        
        if (part.type === 'head') {
          // Dynamic bobbing and talking scale
          part.mesh.position.y = part.basePosition.y + Math.sin(timeFactor) * 0.015 + (bass * 0.02);
          const talkScale = 1.0 + vocal * 0.12 * beatSens;
          part.mesh.scale.set(talkScale, talkScale, talkScale);
        } else if (part.type === 'chest' || part.type === 'pelvis') {
          part.mesh.position.x = part.basePosition.x + Math.sin(timeFactor * 0.8) * 0.04;
          part.mesh.rotation.y = Math.cos(this.time * 1.5) * 0.12 + (bass * 0.08);
        } else if (part.type.startsWith('armL')) {
          part.mesh.rotation.z = -0.5 + Math.sin(timeFactor) * 0.15 + (vocal * 0.2);
          part.mesh.rotation.x = Math.cos(timeFactor) * 0.1;
        } else if (part.type.startsWith('armR')) {
          part.mesh.rotation.z = 0.5 + Math.sin(timeFactor + Math.PI) * 0.15 - (vocal * 0.2);
          part.mesh.rotation.x = Math.cos(timeFactor) * 0.1;
        } else if (part.type.startsWith('leg')) {
          part.mesh.rotation.x = Math.sin(timeFactor * 0.6) * 0.1 * (1 + bass);
        }
      });
    }
  }

  public render(context: RenderContext): void {
    const { ctx, width, height, settings } = context;

    // Check sizes and update camera aspect ratio inside 2D Canvas space
    if (this.renderer) {
      const renderW = Math.min(width, 1920);
      const renderH = Math.min(height, 1080);
      
      this.renderer.setSize(renderW, renderH, false);
      
      if (this.camera.aspect !== renderW / renderH) {
        this.camera.aspect = renderW / renderH;
        this.camera.updateProjectionMatrix();
      }

      // Secure camera look target straight at head level (0, 1.35, 0)
      this.camera.lookAt(0, 1.35, 0);

      // Trigger Three.js render loop frame
      this.renderer.render(this.scene, this.camera);

      // Copy WebGL offscreen buffer onto the main full-stack 2D canvas frame
      ctx.drawImage(this.renderer.domElement, 0, 0, width, height);
    }
  }
}

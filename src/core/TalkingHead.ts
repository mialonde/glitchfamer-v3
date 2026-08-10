import { VRM } from '@pixiv/three-vrm';
import * as THREE from 'three';
import { AudioEvents, VisualizerSettings } from '../types';
import { getLipSyncEnergy } from './LipSync';

export class TalkingHead {
  private vrm: VRM;

  constructor(vrm: VRM) {
    this.vrm = vrm;
  }

  public update(audio: AudioEvents, settings?: VisualizerSettings): void {
    if (!this.vrm) return;

    let vokal = getLipSyncEnergy(audio, settings);

    // More natural vowel switching
    let vowelRandom = 0;
    if (vokal > 0) {
        if (vokal > 0.7) {
            vowelRandom = Math.floor(audio.time * 12) % 2 === 0 ? 0 : 2; // 'aa' or 'oh/ou'
        } else {
            vowelRandom = Math.floor(audio.time * 8) % 3; // 'aa', 'ih', 'ou'
        }
    }

    // Reset shapes
    ['aa', 'ih', 'ou', 'ee', 'oh', 'A', 'I', 'U', 'E', 'O'].forEach(shape => {
        this.vrm?.expressionManager?.setValue(shape, 0);
    });

    // Set active shape based on vocal energy
    this.vrm.expressionManager?.setValue('aa', vowelRandom === 0 ? vokal : 0);
    this.vrm.expressionManager?.setValue('ih', vowelRandom === 1 ? vokal : 0);
    this.vrm.expressionManager?.setValue('ou', vowelRandom === 2 ? vokal : 0);

    // VRM 0.0 legacy blendshapes
    this.vrm.expressionManager?.setValue('A', vowelRandom === 0 ? vokal : 0);
    this.vrm.expressionManager?.setValue('I', vowelRandom === 1 ? vokal : 0);
    this.vrm.expressionManager?.setValue('U', vowelRandom === 2 ? vokal : 0);
    
    // Facial expressions & Micro-movements (TalkingHead principles)
    const slowTime = audio.time * 0.7;
    
    // Natural blinking (randomized interval feel via sine waves)
    const blinkVal = Math.sin(audio.time * 1.2) * Math.sin(audio.time * 0.8) * Math.sin(audio.time * 0.5);
    // Avoid blinking during extreme mouth movements
    const blink = (blinkVal > 0.88 && vokal < 0.6) ? 1 : 0;
    this.vrm.expressionManager?.setValue('blink', blink);
    this.vrm.expressionManager?.setValue('Blink', blink); // VRM 0.0
    
    // Micro facial expressions
    const isHappy = Math.sin(slowTime * 0.5) > 0.6 ? 0.2 + (vokal * 0.2) : 0;
    const isRelaxed = Math.sin(slowTime * 0.5 + Math.PI) > 0.7 ? 0.3 : 0;
    
    this.vrm.expressionManager?.setValue('happy', isHappy);
    this.vrm.expressionManager?.setValue('Joy', isHappy); // VRM 0.0
    
    this.vrm.expressionManager?.setValue('relaxed', isRelaxed);
    this.vrm.expressionManager?.setValue('Fun', isRelaxed); // VRM 0.0

    // Head and Neck Micro-movements (TalkingHead / Realistic avatar)
    const head = this.vrm.humanoid?.getNormalizedBoneNode('head');
    const neck = this.vrm.humanoid?.getNormalizedBoneNode('neck');
    const spine = this.vrm.humanoid?.getNormalizedBoneNode('spine');
    
    const bass = audio.bassEnergy ?? 0;

    if (head && neck && spine) {
        // Subtle breathing and swaying
        const swayX = Math.sin(audio.time * 0.8) * 0.015;
        const swayY = Math.sin(audio.time * 0.5) * 0.02;
        const swayZ = Math.sin(audio.time * 0.6) * 0.01;
        
        // Audio-reactive nod
        const nod = vokal * 0.05 + (bass * 0.05);
        
        // Distribute rotations across spine, neck, head for realism
        spine.rotation.z = swayZ;
        spine.rotation.x = swayX + (bass * 0.02);
        
        neck.rotation.y = swayY;
        neck.rotation.x = nod * 0.3;
        
        head.rotation.x = nod * 0.7 + Math.sin(audio.time * 1.5) * 0.02;
        head.rotation.y = swayY * 0.5;
        head.rotation.z = swayZ * -0.5; // Counter-tilt
    }
  }
}

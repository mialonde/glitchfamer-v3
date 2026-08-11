import { AudioEvents, VisualizerSettings, PerformanceLayerConfig } from '../types';

export type PerformanceState = 'BEFORE_PLAYBACK' | 'INSTRUMENTAL' | 'VOCAL' | 'HIGH_ENERGY';

export interface PerformanceLayerOutput {
  state: PerformanceState;

  // Layer 2: Facial Expressions
  facialExpressions: {
    happy: number;
    relaxed: number;
    browInnerUp: number;
    eyebrowTension: number;
  };

  // Layer 3: Eye Tracking & Human Blinking
  eyeTracking: {
    blinkValue: number;
    isDoubleBlinking: boolean;
    eyeLookOffset: { x: number; y: number };
    lookAtTarget: { x: number; y: number; z: number };
  };

  // Layer 4: Breathing & Posture
  breathing: {
    cyclePhase: number;        // 0..1
    breathIntensity: number;   // 0..1
    isPreVocalInhale: boolean; // Şarkı öncesi nefes alma tetikleyicisi
    spineExpansion: { x: number; y: number; z: number };
    shoulderElevation: number; // Radyan
    armBreathingOffset: number; // Radyan
  };

  // Layer 5: Body Idle & Performance
  bodyMotion: {
    headRotation: { x: number; y: number; z: number };
    neckRotation: { x: number; y: number; z: number };
    spineRotation: { x: number; y: number; z: number };
    rhythmNod: number;
  };

  // Layer 6: Hair & Secondary Physics
  hairPhysics: {
    secondaryMotionLag: { x: number; y: number; z: number };
    angularVelocity: { x: number; y: number; z: number };
  };
}

export const DEFAULT_PERFORMANCE_CONFIG: PerformanceLayerConfig = {
  layer1LipSyncEnabled: true,
  layer2FacialExpressionEnabled: true,
  layer3EyeTrackingEnabled: true,
  layer4BreathingEnabled: true,
  layer5BodyIdleEnabled: true,
  layer6HairPhysicsEnabled: true
};

/**
 * IdleAnimationEngine: 6 Katmanlı Prosedürel Avatar Performans ve Canlılık Motoru.
 * 
 * 6 Katmanlı Mimari (Motion Layer Architecture):
 *  - Layer 1: Lip Sync (VisemeEngine - En yüksek öncelik, ağız kapanma/açılma)
 *  - Layer 2: Facial Expression (Kaşlar, tebessüm, dinlenme ifadesi)
 *  - Layer 3: Eye Tracking & Blinking (Gaze, sakkadlar, insan tipi göz kırpma)
 *  - Layer 4: Breathing & Posture (8s nefes döngüsü, şarkı öncesi nefes alma, göğüs/omuz)
 *  - Layer 5: Body Idle & Performance (Müzik temposu kafa salınımı, ritim nod, rahat kol duruşu)
 *  - Layer 6: Hair & Secondary Physics (Sönümlü yay atalet gecikmesi ve VRM spring bone)
 */
export class IdleAnimationEngine {
  private state: PerformanceState = 'BEFORE_PLAYBACK';

  // -------------------------------------------------------------
  // Katman 2 & 3: Göz Kırpma & Sakkad Takibi (Human Blinking & Gaze)
  // -------------------------------------------------------------
  private nextBlinkTime: number = 2.0;
  private blinkProgress: number = -1;  // -1: idle, 0..duration: aktif
  private blinkDuration: number = 0.24;
  private isDoubleBlinkQueued: boolean = false;
  private currentBlinkValue: number = 0;

  private nextSaccadeTime: number = 1.5;
  private currentEyeLook = { x: 0, y: 0 };
  private targetEyeLook = { x: 0, y: 0 };
  private isIntrospectiveGlance: boolean = false;
  private nextGlanceTime: number = 5.0;

  // -------------------------------------------------------------
  // Katman 4: Nefes Alma & Şarkı Öncesi İnspirasyon
  // -------------------------------------------------------------
  private preVocalInhaleTimer: number = 0;
  private wasSingingPreviously: boolean = false;

  // -------------------------------------------------------------
  // Katman 5: Kafa & Gövde Mikro Kinematik
  // -------------------------------------------------------------
  private currentHeadRot = { x: 0, y: 0, z: 0 };
  private targetHeadRot = { x: 0, y: 0, z: 0 };
  private prevHeadRot = { x: 0, y: 0, z: 0 };

  // -------------------------------------------------------------
  // Katman 6: Saç & Aksesuar İkincil Fizik (Damped Spring)
  // -------------------------------------------------------------
  private hairOffset = { x: 0, y: 0, z: 0 };
  private hairVelocity = { x: 0, y: 0, z: 0 };
  private angularVelocity = { x: 0, y: 0, z: 0 };

  // -------------------------------------------------------------
  // Zaman ve Filtreleme
  // -------------------------------------------------------------
  private lastTime: number = 0;
  private internalTimer: number = 0;

  constructor() {
    this.scheduleNextBlink(1.5, false, false);
  }

  /**
   * İnsan Göz Kırpma Planlayıcısı (3.0 - 7.0 sn, Vokal anında 5.0 - 8.0 sn)
   */
  private scheduleNextBlink(currentTime: number, isVocal: boolean, isFollowUpDouble: boolean): void {
    if (isFollowUpDouble) {
      // Çift göz kırpma: ilk kırpmadan hemen 160-280ms sonra
      this.nextBlinkTime = currentTime + 0.18 + (Math.random() * 0.12);
      this.isDoubleBlinkQueued = false;
    } else {
      // Şarkı söylerken göz odağını korumak için kırpma sıklığı azalır
      const baseInterval = isVocal ? 5.0 : 3.2;
      const randomRange = isVocal ? 3.0 : 3.8;
      this.nextBlinkTime = currentTime + baseInterval + Math.random() * randomRange;
      // %20 olasılıkla peşinden çift göz kırpma gelir
      this.isDoubleBlinkQueued = Math.random() < 0.20;
    }
  }

  /**
   * Ana Güncelleme Döngüsü
   */
  public update(
    audio: AudioEvents,
    settings?: VisualizerSettings,
    isVocalSinging: boolean = false
  ): PerformanceLayerOutput {
    const config: PerformanceLayerConfig = {
      ...DEFAULT_PERFORMANCE_CONFIG,
      ...(settings?.performanceLayers || {})
    };

    const time = audio.time;
    const dt = (this.lastTime > 0 && Math.abs(time - this.lastTime) < 0.2)
      ? Math.max(0.001, time - this.lastTime)
      : 0.016;
    this.lastTime = time;
    this.internalTimer += dt;

    const bass = audio.bassEnergy ?? audio.kick ?? 0;
    const energy = audio.energy ?? 0;
    const vocalRMS = audio.vocalRMS ?? 0;

    // -------------------------------------------------------------
    // ADIM 1: Performans Durumu (4 Performance States)
    // -------------------------------------------------------------
    if (time <= 0.08 || audio.isSilence) {
      this.state = 'BEFORE_PLAYBACK';
    } else if (energy > 0.65 || bass > 0.70) {
      this.state = 'HIGH_ENERGY';
    } else if (isVocalSinging || vocalRMS > 0.04) {
      this.state = 'VOCAL';
    } else {
      this.state = 'INSTRUMENTAL';
    }

    const isSinging = this.state === 'VOCAL' || isVocalSinging;

    // -------------------------------------------------------------
    // ADIM 2: LAYER 4 - Breathing & Pre-vocal Inhale
    // -------------------------------------------------------------
    // 8 saniyelik doğal nefes döngüsü (4s alma, 4s verme)
    const breathCycleDuration = 8.0;
    const cyclePhase = (this.internalTimer % breathCycleDuration) / breathCycleDuration;
    // Sinüzoidal nefes eğrisi: 0.0 ile 1.0 arası pürüzsüz
    let breathIntensity = 0.5 + 0.5 * Math.sin(cyclePhase * Math.PI * 2 - Math.PI / 2);

    // Şarkı başlamadan hemen önce nefes alma (Pre-vocal Inhale Anticipation)
    if (!this.wasSingingPreviously && isSinging) {
      this.preVocalInhaleTimer = 0.40; // 400ms nefes çekme refleksi
    }
    this.wasSingingPreviously = isSinging;

    if (this.preVocalInhaleTimer > 0) {
      this.preVocalInhaleTimer -= dt;
      breathIntensity = Math.min(1.0, breathIntensity + 0.45);
    }

    const shoulderElevation = config.layer4BreathingEnabled
      ? (breathIntensity * 0.014) + (this.preVocalInhaleTimer > 0 ? 0.008 : 0) // ~0.8 - 1.2 derece
      : 0;

    const armBreathingOffset = config.layer4BreathingEnabled
      ? (breathIntensity * 0.008)
      : 0;

    const spineExpansion = config.layer4BreathingEnabled
      ? {
          x: breathIntensity * 0.008 + (bass * 0.012),
          y: 0,
          z: 0
        }
      : { x: 0, y: 0, z: 0 };

    // -------------------------------------------------------------
    // ADIM 3: LAYER 3 - Eye Tracking & Human Blinking
    // -------------------------------------------------------------
    // Göz Kırpma (Close: 90ms, Open: 140ms)
    const closeDuration = 0.090;
    const openDuration = 0.140;
    this.blinkDuration = closeDuration + openDuration;

    if (config.layer3EyeTrackingEnabled) {
      if (this.blinkProgress < 0 && time >= this.nextBlinkTime) {
        this.blinkProgress = 0;
      }

      if (this.blinkProgress >= 0) {
        this.blinkProgress += dt;

        if (this.blinkProgress <= closeDuration) {
          const t = this.blinkProgress / closeDuration;
          this.currentBlinkValue = Math.min(1.0, t * t * 1.05); // Ease-in
        } else if (this.blinkProgress <= this.blinkDuration) {
          const t = (this.blinkProgress - closeDuration) / openDuration;
          this.currentBlinkValue = Math.max(0.0, 1.0 - Math.sin(t * (Math.PI / 2))); // Ease-out
        } else {
          this.currentBlinkValue = 0.0;
          this.blinkProgress = -1;
          this.scheduleNextBlink(time, isSinging, this.isDoubleBlinkQueued);
        }
      } else {
        this.currentBlinkValue = 0.0;
      }
    } else {
      this.currentBlinkValue = 0.0;
    }

    // Göz Odağı, Sakkadlar ve Duygusal Bakış (Gaze & Saccades)
    if (config.layer3EyeTrackingEnabled) {
      // Periyodik bakış kayması ve ara sıra içe dönük / duygu bakışı
      if (time >= this.nextGlanceTime) {
        this.nextGlanceTime = time + 4.0 + Math.random() * 4.0;
        this.isIntrospectiveGlance = !isSinging && (Math.random() < 0.35); // Vokal yokken ara sıra aşağı/yana hafif bakış
      }

      if (time >= this.nextSaccadeTime) {
        this.nextSaccadeTime = time + 2.2 + Math.random() * 2.8;

        if (this.isIntrospectiveGlance) {
          // Hafif aşağı ve yana düşünceli bakış
          this.targetEyeLook.x = (Math.random() > 0.5 ? 0.05 : -0.05) + (Math.random() - 0.5) * 0.03;
          this.targetEyeLook.y = -0.04 - (Math.random() * 0.03);
        } else {
          // Doğrudan kameraya / seyirciye odaklı mikro hareketler
          this.targetEyeLook.x = (Math.random() - 0.5) * 0.06;
          this.targetEyeLook.y = (Math.random() - 0.5) * 0.035;
        }
      }

      // Yumuşak üstel takip (Smooth Saccade Spring)
      const saccadeAlpha = 1.0 - Math.exp(-dt / 0.065);
      this.currentEyeLook.x += (this.targetEyeLook.x - this.currentEyeLook.x) * saccadeAlpha;
      this.currentEyeLook.y += (this.targetEyeLook.y - this.currentEyeLook.y) * saccadeAlpha;
    } else {
      this.currentEyeLook.x = 0;
      this.currentEyeLook.y = 0;
    }

    // -------------------------------------------------------------
    // ADIM 4: LAYER 2 - Facial Expressions (Brows, Smile & Relaxed)
    // -------------------------------------------------------------
    let happyVal = 0.05;
    let relaxedVal = 0.15;
    let browInnerUp = 0.0;

    if (config.layer2FacialExpressionEnabled) {
      if (this.state === 'HIGH_ENERGY') {
        happyVal = 0.22 + (energy * 0.18);
        relaxedVal = 0.05;
        browInnerUp = 0.15 + (energy * 0.15);
      } else if (this.state === 'VOCAL') {
        happyVal = 0.12 + (vocalRMS * 0.20);
        relaxedVal = 0.08;
        browInnerUp = Math.min(0.35, vocalRMS * 0.85); // Vokal yoğunluğunda kaş mikro yükselmesi
      } else {
        happyVal = 0.04;
        relaxedVal = 0.20 + (breathIntensity * 0.08); // Enstrümantal dinlenme rahatlığı
        browInnerUp = 0.0;
      }
    }

    // -------------------------------------------------------------
    // ADIM 5: LAYER 5 - Body Idle & Performance (Head & Spine Sway)
    // -------------------------------------------------------------
    const t = this.internalTimer;
    
    // Doğal mikro salınım (0.2° - 1.5° = 0.0035 - 0.026 radyan)
    let rawYaw = (Math.sin(t * 0.42) * 0.018 + Math.sin(t * 0.21 + 1.1) * 0.012);
    let rawPitch = (Math.sin(t * 0.55 + 0.4) * 0.012 + Math.sin(t * 0.28) * 0.008);
    let rawRoll = (Math.sin(t * 0.33 + 1.8) * 0.008 + Math.cos(t * 0.16) * 0.005);

    // Nefes alırken kafanın hafif geriye eğilmesi
    if (config.layer4BreathingEnabled) {
      rawPitch -= breathIntensity * 0.006;
    }

    // Müzik ve Ritim Tepkisi (Audio Reactive Motion)
    let audioMotionScale = 1.0;
    let rhythmNod = 0;

    switch (this.state) {
      case 'BEFORE_PLAYBACK':
        audioMotionScale = 0.55;
        break;
      case 'INSTRUMENTAL':
        audioMotionScale = 1.05 + (energy * 0.30);
        rhythmNod = bass * 0.018; // Müzik ritminde hafif kafa binişi
        break;
      case 'VOCAL':
        audioMotionScale = 0.85;
        rhythmNod = (bass * 0.014) + (vocalRMS * 0.020);
        break;
      case 'HIGH_ENERGY':
        audioMotionScale = 1.40;
        rhythmNod = bass * 0.032;
        break;
    }

    if (config.layer5BodyIdleEnabled) {
      rawYaw *= audioMotionScale;
      rawPitch = (rawPitch * audioMotionScale) + rhythmNod;
      rawRoll *= audioMotionScale;
    } else {
      rawYaw = 0;
      rawPitch = 0;
      rawRoll = 0;
    }

    // Güvenli Sınırlar (Limit Clamping: Yaw ±5°, Pitch ±3°, Roll ±2°)
    const maxYaw = 0.087;
    const maxPitch = 0.052;
    const maxRoll = 0.035;

    this.targetHeadRot.x = Math.max(-maxPitch, Math.min(maxPitch, rawPitch));
    this.targetHeadRot.y = Math.max(-maxYaw, Math.min(maxYaw, rawYaw));
    this.targetHeadRot.z = Math.max(-maxRoll, Math.min(maxRoll, rawRoll));

    // Düşük Geçiren Yumuşatma Filtresi (Low-Pass Filter: 75ms)
    const headAlpha = 1.0 - Math.exp(-dt / 0.075);
    this.currentHeadRot.x += (this.targetHeadRot.x - this.currentHeadRot.x) * headAlpha;
    this.currentHeadRot.y += (this.targetHeadRot.y - this.currentHeadRot.y) * headAlpha;
    this.currentHeadRot.z += (this.targetHeadRot.z - this.currentHeadRot.z) * headAlpha;

    // -------------------------------------------------------------
    // ADIM 6: LAYER 6 - Hair & Secondary Physics (Damped Spring)
    // -------------------------------------------------------------
    this.angularVelocity.x = (this.currentHeadRot.x - this.prevHeadRot.x) / dt;
    this.angularVelocity.y = (this.currentHeadRot.y - this.prevHeadRot.y) / dt;
    this.angularVelocity.z = (this.currentHeadRot.z - this.prevHeadRot.z) / dt;

    this.prevHeadRot.x = this.currentHeadRot.x;
    this.prevHeadRot.y = this.currentHeadRot.y;
    this.prevHeadRot.z = this.currentHeadRot.z;

    if (config.layer6HairPhysicsEnabled) {
      const springK = 22.0;
      const dampingC = 7.0;

      const forceX = -this.angularVelocity.x * 0.16 - (springK * this.hairOffset.x) - (dampingC * this.hairVelocity.x);
      const forceY = -this.angularVelocity.y * 0.20 - (springK * this.hairOffset.y) - (dampingC * this.hairVelocity.y);
      const forceZ = -this.angularVelocity.z * 0.16 - (springK * this.hairOffset.z) - (dampingC * this.hairVelocity.z);

      this.hairVelocity.x += forceX * dt;
      this.hairVelocity.y += forceY * dt;
      this.hairVelocity.z += forceZ * dt;

      this.hairOffset.x += this.hairVelocity.x * dt;
      this.hairOffset.y += this.hairVelocity.y * dt;
      this.hairOffset.z += this.hairVelocity.z * dt;
    } else {
      this.hairOffset.x = 0;
      this.hairOffset.y = 0;
      this.hairOffset.z = 0;
    }

    // -------------------------------------------------------------
    // ADIM 7: ÇIKIŞ PAKETİ DERLEME
    // -------------------------------------------------------------
    return {
      state: this.state,

      facialExpressions: {
        happy: happyVal,
        relaxed: relaxedVal,
        browInnerUp,
        eyebrowTension: isSinging ? vocalRMS * 0.4 : 0
      },

      eyeTracking: {
        blinkValue: this.currentBlinkValue,
        isDoubleBlinking: this.isDoubleBlinkQueued,
        eyeLookOffset: this.currentEyeLook,
        lookAtTarget: {
          x: this.currentEyeLook.x * 0.8,
          y: this.currentEyeLook.y * 0.8,
          z: 1.0 // Kamera ön düzlemi
        }
      },

      breathing: {
        cyclePhase,
        breathIntensity,
        isPreVocalInhale: this.preVocalInhaleTimer > 0,
        spineExpansion,
        shoulderElevation,
        armBreathingOffset
      },

      bodyMotion: {
        headRotation: {
          x: this.currentHeadRot.x * 0.65,
          y: this.currentHeadRot.y * 0.65,
          z: this.currentHeadRot.z * 0.65
        },
        neckRotation: {
          x: this.currentHeadRot.x * 0.35,
          y: this.currentHeadRot.y * 0.35,
          z: this.currentHeadRot.z * 0.35
        },
        spineRotation: {
          x: spineExpansion.x,
          y: this.currentHeadRot.y * 0.15,
          z: this.currentHeadRot.z * 0.15
        },
        rhythmNod
      },

      hairPhysics: {
        secondaryMotionLag: this.hairOffset,
        angularVelocity: this.angularVelocity
      }
    };
  }

  public getState(): PerformanceState {
    return this.state;
  }
}

export const idleAnimationEngine = new IdleAnimationEngine();

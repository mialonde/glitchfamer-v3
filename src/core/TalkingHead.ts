import { VRM } from '@pixiv/three-vrm';
import * as THREE from 'three';
import { AudioEvents, VisualizerSettings } from '../types';
import { VisemeEngine } from './VisemeEngine';
import { idleAnimationEngine } from './IdleAnimationEngine';

export type HumanoidBoneKey = 
  | 'hips'
  | 'spine'
  | 'chest'
  | 'upperChest'
  | 'neck'
  | 'head'
  | 'leftShoulder'
  | 'rightShoulder'
  | 'leftUpperArm'
  | 'rightUpperArm'
  | 'leftLowerArm'
  | 'rightLowerArm'
  | 'leftHand'
  | 'rightHand';

interface BoneCalibration {
  boneName: HumanoidBoneKey;
  node: THREE.Object3D;
  initialQuaternion: THREE.Quaternion;
  initialPosition: THREE.Vector3;
  initialScale: THREE.Vector3;
  restOffsetQuaternion: THREE.Quaternion;
}

/**
 * TalkingHead: VRM 3D Avatar İskelet Kalibrasyonu, Dinlenme Pozu Ofseti ve 
 * Katmanlı Animasyon Dönüşüm Mimarisini Yöneten Ana Motor.
 * 
 * Mimari Pipeline:
 *  1. Avatar Load (Modelin Yüklenmesi & VRM Başlatılması)
 *  2. Skeleton Calibration (İskelet Kemik Düğümlerinin ve Başlangıç Rest Transformlarının Kaydı)
 *  3. Rest Pose Offset (T-Pose / A-Pose'dan Doğal Dinlenme Duruşuna Geçiş Ofsetleri)
 *  4. Animation Layer (Ses / Ritim / Vokal Şarkı Söyleme & Yüz İfadeleri Katmanı)
 *  5. Final Bone Transform (Bileşik Kuaterniyon ile Güvenli ve Çakışmasız Kemik Dönüşümü)
 */
export class TalkingHead {
  private vrm: VRM;
  private visemeEngine: VisemeEngine;
  private calibratedBones: Map<HumanoidBoneKey, BoneCalibration> = new Map();
  private isCalibrated: boolean = false;

  // Geçici kuaterniyon ve öler nesneleri (GC Garbage Collection baskısını sıfırlar)
  private tempEuler: THREE.Euler = new THREE.Euler(0, 0, 0, 'XYZ');
  private tempAnimQ: THREE.Quaternion = new THREE.Quaternion();
  private tempFinalQ: THREE.Quaternion = new THREE.Quaternion();

  constructor(vrm: VRM) {
    this.vrm = vrm;
    this.visemeEngine = new VisemeEngine();
    this.calibrateSkeleton();
  }

  /**
   * Aşama 2: Skeleton Calibration
   * Model yüklendiğinde humanoid kemiklerini tarar, bind-pose kuaterniyonlarını 
   * ve modelin temel iskelet referanslarını kaydeder.
   */
  public calibrateSkeleton(): void {
    if (!this.vrm || !this.vrm.humanoid) return;

    this.calibratedBones.clear();

    const boneKeys: HumanoidBoneKey[] = [
      'hips',
      'spine',
      'chest',
      'upperChest',
      'neck',
      'head',
      'leftShoulder',
      'rightShoulder',
      'leftUpperArm',
      'rightUpperArm',
      'leftLowerArm',
      'rightLowerArm',
      'leftHand',
      'rightHand'
    ];

    for (const key of boneKeys) {
      const boneNode = this.vrm.humanoid.getNormalizedBoneNode(key);
      if (boneNode) {
        // Aşama 3: Rest Pose Offset Hesabı (Kemik bazlı kanonik dinlenme ofseti)
        const restOffset = this.calculateRestPoseOffsetForBone(key);

        this.calibratedBones.set(key, {
          boneName: key,
          node: boneNode,
          initialQuaternion: boneNode.quaternion.clone(),
          initialPosition: boneNode.position.clone(),
          initialScale: boneNode.scale.clone(),
          restOffsetQuaternion: restOffset
        });
      }
    }

    this.isCalibrated = true;
  }

  /**
   * Aşama 3: Rest Pose Offset Matrisi
   * VRM modelleri varsayılan olarak T-Pose (veya A-Pose) olarak başlar.
   * Modelin kollarını, omuzlarını ve omurgasını doğal, organik bir şarkıcı dinlenme
   * duruşuna (Relaxed Rest Posture) getiren göreceli kuaterniyon ofsetlerini üretir.
   */
  private calculateRestPoseOffsetForBone(key: HumanoidBoneKey): THREE.Quaternion {
    const q = new THREE.Quaternion();

    switch (key) {
      // Omuzlar: Rahat, aşağı doğru hafif depresyon açısı
      case 'leftShoulder':
        q.setFromEuler(this.tempEuler.set(0.0, 0.0, 0.05, 'XYZ'));
        break;
      case 'rightShoulder':
        q.setFromEuler(this.tempEuler.set(0.0, 0.0, -0.05, 'XYZ'));
        break;

      // Üst Kollar: Gövdenin iki yanına tamamen indirilmiş ve hafifçe öne açılı (~75-80 derece aşağı)
      case 'leftUpperArm':
        // Three-VRM normalized bone: pozitif Z sol kolu gövde yanına aşağı indirir, hafif X öne doğru getirir
        q.setFromEuler(this.tempEuler.set(0.10, -0.05, 1.35, 'XYZ'));
        break;
      case 'rightUpperArm':
        // Three-VRM normalized bone: negatif Z sağ kolu gövde yanına aşağı indirir, hafif X öne doğru getirir
        q.setFromEuler(this.tempEuler.set(0.10, 0.05, -1.35, 'XYZ'));
        break;

      // Dirsekler / Ön Kollar: Doğal dinlenme fleksiyonu (kollar aşağıdayken hafifçe içe/öne bükülü)
      case 'leftLowerArm':
        q.setFromEuler(this.tempEuler.set(0.0, 0.15, 0.10, 'XYZ'));
        break;
      case 'rightLowerArm':
        q.setFromEuler(this.tempEuler.set(0.0, -0.15, -0.10, 'XYZ'));
        break;

      // Eller ve Bilekler: Gövdeye uyumlu nötr duruş
      case 'leftHand':
        q.setFromEuler(this.tempEuler.set(0.0, 0.0, 0.0, 'XYZ'));
        break;
      case 'rightHand':
        q.setFromEuler(this.tempEuler.set(0.0, 0.0, 0.0, 'XYZ'));
        break;

      // Omurga, Boyun ve Kafa: Nötr kanonik duruş
      case 'neck':
        q.setFromEuler(this.tempEuler.set(-0.03, 0.0, 0.0, 'XYZ'));
        break;
      case 'head':
        q.setFromEuler(this.tempEuler.set(-0.06, 0.0, 0.0, 'XYZ'));
        break;
      case 'spine':
      default:
        q.identity();
        break;
    }

    return q;
  }

  /**
   * Aşama 4 & 5: Katmanlı Güncelleme Döngüsü (Update Pipeline)
   */
  public update(audio: AudioEvents, settings?: VisualizerSettings): void {
    if (!this.vrm) return;
    if (!this.isCalibrated) {
      this.calibrateSkeleton();
    }

    // -------------------------------------------------------------
    // LAYER 1: Lip Sync & Phoneme Occlusion Katmanı (En Yüksek Öncelik)
    // -------------------------------------------------------------
    const blendshapes = this.visemeEngine.update(audio, settings);
    const isSinging = blendshapes.mouth_open > 0.04 || blendshapes.jaw_drop > 0.04;

    // Bilabial Occlusion (M, B, P): Dudaklar birbirine bastığında (lip_press > 0.35)
    // ağız açıklığı morph target'ları kesinlikle 0.0 değerine kilitlenir.
    const isLipPressed = blendshapes.lip_press > 0.35;
    const pressFactor = isLipPressed ? 0.0 : Math.max(0, 1 - blendshapes.lip_press * 1.5);
    
    const valAA = isLipPressed ? 0.0 : Math.min(1.0, blendshapes.mouth_open * (1 - blendshapes.lip_round * 0.8) * pressFactor);
    const valIH = isLipPressed ? 0.0 : Math.min(1.0, blendshapes.mouth_width * 0.75 * (1 - blendshapes.lip_round) * pressFactor);
    const valEE = isLipPressed ? 0.0 : Math.min(1.0, (blendshapes.mouth_open * 0.3 + blendshapes.mouth_width * 0.7) * (1 - blendshapes.lip_round) * pressFactor);
    const valOH = isLipPressed ? 0.0 : Math.min(1.0, blendshapes.lip_round * Math.max(0.2, blendshapes.mouth_open) * 0.9 * pressFactor);
    const valOU = isLipPressed ? 0.0 : Math.min(1.0, blendshapes.lip_round * (1 - blendshapes.mouth_open * 0.3) * pressFactor);

    // VRM 1.0 Standardı
    this.vrm.expressionManager?.setValue('aa', valAA);
    this.vrm.expressionManager?.setValue('ih', valIH);
    this.vrm.expressionManager?.setValue('ee', valEE);
    this.vrm.expressionManager?.setValue('oh', valOH);
    this.vrm.expressionManager?.setValue('ou', valOU);

    // VRM 0.0 Legacy Standardı (AliciaSolid vb.)
    this.vrm.expressionManager?.setValue('A', valAA);
    this.vrm.expressionManager?.setValue('I', valIH);
    this.vrm.expressionManager?.setValue('E', valEE);
    this.vrm.expressionManager?.setValue('O', valOH);
    this.vrm.expressionManager?.setValue('U', valOU);

    // -------------------------------------------------------------
    // 6-LAYER PROCEDURAL PERFORMANCE ENGINE
    // -------------------------------------------------------------
    const perf = idleAnimationEngine.update(audio, settings, isSinging);

    // -------------------------------------------------------------
    // LAYER 2: Facial Expressions (Kaşlar, Tebessüm, Dinlenme)
    // -------------------------------------------------------------
    this.vrm.expressionManager?.setValue('happy', perf.facialExpressions.happy);
    this.vrm.expressionManager?.setValue('Joy', perf.facialExpressions.happy); // VRM 0.0
    
    this.vrm.expressionManager?.setValue('relaxed', perf.facialExpressions.relaxed);
    this.vrm.expressionManager?.setValue('Fun', perf.facialExpressions.relaxed); // VRM 0.0

    if (perf.facialExpressions.browInnerUp > 0.02) {
      this.vrm.expressionManager?.setValue('surprised', perf.facialExpressions.browInnerUp);
      this.vrm.expressionManager?.setValue('Sorrow', perf.facialExpressions.browInnerUp * 0.5);
    }

    // -------------------------------------------------------------
    // LAYER 3: Eye Tracking & Human Blinking (Göz Kırpma & Sakkadlar)
    // -------------------------------------------------------------
    const isExtremeMouth = blendshapes.mouth_open > 0.82;
    const finalBlink = isExtremeMouth ? 0 : perf.eyeTracking.blinkValue;

    this.vrm.expressionManager?.setValue('blink', finalBlink);
    this.vrm.expressionManager?.setValue('Blink', finalBlink); // VRM 0.0

    // Göz Bakış Yönü (LookAt / Eye Expression Morph Targets)
    const eyeX = perf.eyeTracking.eyeLookOffset.x;
    const eyeY = perf.eyeTracking.eyeLookOffset.y;

    const lookLeft = Math.max(0, eyeX);
    const lookRight = Math.max(0, -eyeX);
    const lookUp = Math.max(0, eyeY);
    const lookDown = Math.max(0, -eyeY);

    if (!this.vrm.lookAt || !this.vrm.lookAt.autoUpdate) {
      this.vrm.expressionManager?.setValue('lookLeft', lookLeft);
      this.vrm.expressionManager?.setValue('lookRight', lookRight);
      this.vrm.expressionManager?.setValue('lookUp', lookUp);
      this.vrm.expressionManager?.setValue('lookDown', lookDown);
    }

    if (this.vrm.lookAt && !this.vrm.lookAt.autoUpdate) {
      // In three-vrm, yaw and pitch are in DEGREES.
      // Since eyeX and eyeY are normalized offsets (approx -0.1 to 0.1),
      // we scale them to a natural range of motion (e.g., max 22 degrees yaw, 18 degrees pitch).
      this.vrm.lookAt.yaw = eyeX * 220.0;
      this.vrm.lookAt.pitch = eyeY * 180.0;
    }

    // -------------------------------------------------------------
    // LAYER 4 & 5: Breathing, Posture & Body Performance Kinematics
    // -------------------------------------------------------------
    // Omurga: Nefes alma göğüs genişlemesi ve ritim salınımı
    this.applyLayeredBoneTransform(
      'spine',
      perf.bodyMotion.spineRotation.x,
      perf.bodyMotion.spineRotation.y,
      perf.bodyMotion.spineRotation.z
    );
    
    // Boyun: Kafa hareketinin %35'i
    this.applyLayeredBoneTransform(
      'neck',
      perf.bodyMotion.neckRotation.x,
      perf.bodyMotion.neckRotation.y,
      perf.bodyMotion.neckRotation.z
    );
    
    // Kafa: Şarkı söyleme çene nodding'i + müzik temposu mikro-hareketleri
    const singingNod = isSinging ? blendshapes.jaw_drop * 0.038 : 0;
    this.applyLayeredBoneTransform(
      'head',
      perf.bodyMotion.headRotation.x + singingNod,
      perf.bodyMotion.headRotation.y,
      perf.bodyMotion.headRotation.z
    );

    // Omuzlar: 8 saniyelik nefes alma yükselmesi ve şarkı öncesi nefes refleksi
    const shElev = perf.breathing.shoulderElevation;
    this.applyLayeredBoneTransform('leftShoulder', 0, 0, shElev);
    this.applyLayeredBoneTransform('rightShoulder', 0, 0, -shElev);

    // Kollar & Eller: Rahat müzisyen dinlenme duruşu + nefes alma mikro-salınımı
    const armSpread = perf.breathing.armBreathingOffset;
    this.applyLayeredBoneTransform('leftUpperArm', 0, 0, armSpread);
    this.applyLayeredBoneTransform('rightUpperArm', 0, 0, -armSpread);
    this.applyLayeredBoneTransform('leftLowerArm', 0, 0, 0);
    this.applyLayeredBoneTransform('rightLowerArm', 0, 0, 0);
    this.applyLayeredBoneTransform('leftHand', 0, 0, 0);
    this.applyLayeredBoneTransform('rightHand', 0, 0, 0);
  }

  /**
   * Bileşik Kuaterniyon Hesaplama ve Uygulama
   * Matematiksel Formül: FinalRotation = BaseCalibrated * RestPoseOffset * AnimationLayer
   */
  private applyLayeredBoneTransform(boneKey: HumanoidBoneKey, animEulerX: number, animEulerY: number, animEulerZ: number): void {
    const calibrated = this.calibratedBones.get(boneKey);
    if (!calibrated) return;

    // 1. Animasyon katmanı kuaterniyonu
    this.tempAnimQ.setFromEuler(this.tempEuler.set(animEulerX, animEulerY, animEulerZ, 'XYZ'));

    // 2. Kuaterniyon Kompozisyonu: Base * RestOffset * Anim
    this.tempFinalQ
      .copy(calibrated.initialQuaternion)
      .multiply(calibrated.restOffsetQuaternion)
      .multiply(this.tempAnimQ);

    // 3. Kemik Düğümüne Kesin Güvenli Atama
    calibrated.node.quaternion.copy(this.tempFinalQ);
  }
}



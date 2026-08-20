import { VisualizerSettings } from '../types';

export interface AudioAnalysisProfile {
  bpm: number;
  energy: number; // 0.0 - 1.0
  bassRatio: number; // 0.0 - 1.0
  trebleRatio: number; // 0.0 - 1.0
  vocalPresence: number; // 0.0 - 1.0
  genreLabel: string;
  energyLabel: string;
  recommendedMode: string;
  recommendedPrimaryColor: string;
  recommendedSecondaryColor: string;
  recommendedSettings: Partial<VisualizerSettings>;
}

/**
 * Fast & Robust Web Audio PCM Buffer Analyzer
 * Calculates BPM, Energy distribution, and determines the optimal visualizer preset.
 */
export async function analyzeAudioBuffer(audioBlobOrUrl: Blob | string): Promise<AudioAnalysisProfile> {
  try {
    let arrayBuffer: ArrayBuffer;

    if (typeof audioBlobOrUrl === 'string') {
      const response = await fetch(audioBlobOrUrl);
      arrayBuffer = await response.arrayBuffer();
    } else {
      arrayBuffer = await audioBlobOrUrl.arrayBuffer();
    }

    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    
    // Close context to release system audio resources
    audioCtx.close();

    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const duration = audioBuffer.duration;

    // 1. Calculate RMS Energy and Peak Power
    let sumSq = 0;
    let maxPeak = 0;
    const step = Math.max(1, Math.floor(channelData.length / 100000)); // Sample ~100k points for sub-second speed
    let sampleCount = 0;

    for (let i = 0; i < channelData.length; i += step) {
      const val = Math.abs(channelData[i]);
      sumSq += val * val;
      if (val > maxPeak) maxPeak = val;
      sampleCount++;
    }

    const rms = Math.sqrt(sumSq / sampleCount);
    const normalizedEnergy = Math.min(1.0, Math.max(0.1, (rms * 3.5) + (maxPeak * 0.3)));

    // 2. Simple & Fast Peak Onset BPM Estimation
    const bpm = estimateBpm(channelData, sampleRate);

    // 3. Spectral Energy Balance (Bass vs Mid vs Treble)
    const { bassRatio, trebleRatio, vocalPresence } = analyzeFrequencyDistribution(channelData, sampleRate);

    // 4. Determine Archetype & Visual Preset
    let genreLabel = 'Pop / Elektronik';
    let energyLabel = 'Orta Enerji';
    let recommendedMode = 'CIRCULAR_AURA_SPECTRUM';
    let primaryColor = '#FFD700';
    let secondaryColor = '#FFFFFF';
    let settingsPatch: Partial<VisualizerSettings> = {};

    if (bpm >= 125 && normalizedEnergy > 0.5) {
      genreLabel = 'Cyberpunk / EDM / Dance';
      energyLabel = 'Yüksek Enerji & Tempolu';
      recommendedMode = 'NEON_TUNNEL';
      primaryColor = '#FF0055';
      secondaryColor = '#00F0FF';
      settingsPatch = {
        mode: 'NEON_TUNNEL',
        primaryColor: '#FF0055',
        secondaryColor: '#00F0FF',
        intensity: 1.2,
        visBeatSensitivity: 1.3,
        bloomEnabled: true,
        bloom: 0.8,
        cameraShakeEnabled: true,
        cameraShake: 0.15,
        strobeEnabled: false,
        bgMode: 'GRID',
        bgOpacity: 0.1
      };
    } else if (bpm >= 115 && bassRatio > 0.4) {
      genreLabel = 'Synthwave / Retro Grid';
      energyLabel = 'Ateşli Ritim & Bas';
      recommendedMode = 'SYNTHWAVE_GRID_3D';
      primaryColor = '#00F0FF';
      secondaryColor = '#FF007F';
      settingsPatch = {
        mode: 'SYNTHWAVE_GRID_3D',
        primaryColor: '#00F0FF',
        secondaryColor: '#FF007F',
        intensity: 1.1,
        visBeatSensitivity: 1.1,
        bloomEnabled: true,
        bloom: 0.6,
        cameraShakeEnabled: false,
        bgMode: 'GRID',
        bgOpacity: 0.15
      };
    } else if (vocalPresence > 0.45) {
      genreLabel = 'Vokal / Pop / Hip Hop';
      energyLabel = 'Vokal Odaklı & Ritmik';
      recommendedMode = 'VISSONANCE_RING';
      primaryColor = '#FFD700';
      secondaryColor = '#3B82F6';
      settingsPatch = {
        mode: 'VISSONANCE_RING',
        primaryColor: '#FFD700',
        secondaryColor: '#3B82F6',
        intensity: 1.0,
        visBeatSensitivity: 1.0,
        bloomEnabled: true,
        bloom: 0.5,
        lyricsEnabled: true,
        bgMode: 'PARTICLES'
      };
    } else if (bpm < 95 || normalizedEnergy < 0.35) {
      genreLabel = 'Ambient / Lo-Fi / Chill';
      energyLabel = 'Yumuşak & Sakin Akış';
      recommendedMode = 'FLUID_METABALL';
      primaryColor = '#A855F7';
      secondaryColor = '#06B6D4';
      settingsPatch = {
        mode: 'FLUID_METABALL',
        primaryColor: '#A855F7',
        secondaryColor: '#06B6D4',
        intensity: 0.8,
        visBeatSensitivity: 0.7,
        bloomEnabled: true,
        bloom: 0.4,
        cameraShakeEnabled: false,
        bgMode: 'SMOKE'
      };
    } else {
      genreLabel = 'Sinematik / Modern Rock';
      energyLabel = 'Dengeli & Dinamik';
      recommendedMode = 'NEURAL_BLOOM';
      primaryColor = '#F97316';
      secondaryColor = '#EC4899';
      settingsPatch = {
        mode: 'NEURAL_BLOOM',
        primaryColor: '#F97316',
        secondaryColor: '#EC4899',
        intensity: 1.0,
        visBeatSensitivity: 1.0,
        bloomEnabled: true,
        bloom: 0.6,
        bgMode: 'PARTICLES'
      };
    }

    return {
      bpm,
      energy: Math.round(normalizedEnergy * 100) / 100,
      bassRatio: Math.round(bassRatio * 100) / 100,
      trebleRatio: Math.round(trebleRatio * 100) / 100,
      vocalPresence: Math.round(vocalPresence * 100) / 100,
      genreLabel,
      energyLabel,
      recommendedMode,
      recommendedPrimaryColor: primaryColor,
      recommendedSecondaryColor: secondaryColor,
      recommendedSettings: settingsPatch
    };
  } catch (err) {
    console.warn('Audio analysis fallback used:', err);
    return {
      bpm: 120,
      energy: 0.7,
      bassRatio: 0.5,
      trebleRatio: 0.5,
      vocalPresence: 0.5,
      genreLabel: 'Standart Müzik',
      energyLabel: 'Otomatik Algılandı',
      recommendedMode: 'CIRCULAR_AURA_SPECTRUM',
      recommendedPrimaryColor: '#FFD700',
      recommendedSecondaryColor: '#FFFFFF',
      recommendedSettings: {
        mode: 'CIRCULAR_AURA_SPECTRUM',
        primaryColor: '#FFD700',
        secondaryColor: '#FFFFFF'
      }
    };
  }
}

/**
 * Fast Peak-Threshold Onset BPM Detector
 */
function estimateBpm(samples: Float32Array, sampleRate: number): number {
  const windowSize = Math.floor(sampleRate * 0.05); // 50ms window
  const peaks: number[] = [];
  
  let maxVolume = 0;
  for (let i = 0; i < samples.length; i += windowSize) {
    let sum = 0;
    for (let j = 0; j < windowSize && (i + j) < samples.length; j++) {
      sum += Math.abs(samples[i + j]);
    }
    const vol = sum / windowSize;
    if (vol > maxVolume) maxVolume = vol;
    peaks.push(vol);
  }

  const threshold = maxVolume * 0.65;
  const beatTimes: number[] = [];

  for (let i = 1; i < peaks.length - 1; i++) {
    if (peaks[i] > threshold && peaks[i] > peaks[i - 1] && peaks[i] > peaks[i + 1]) {
      const timeInSec = (i * windowSize) / sampleRate;
      if (beatTimes.length === 0 || (timeInSec - beatTimes[beatTimes.length - 1]) > 0.28) {
        beatTimes.push(timeInSec);
      }
    }
  }

  if (beatTimes.length < 4) return 120; // Default fallback

  const intervals: number[] = [];
  for (let i = 1; i < beatTimes.length; i++) {
    intervals.push(beatTimes[i] - beatTimes[i - 1]);
  }

  intervals.sort((a, b) => a - b);
  const medianInterval = intervals[Math.floor(intervals.length / 2)];

  if (!medianInterval || medianInterval <= 0) return 120;

  let bpm = Math.round(60 / medianInterval);

  // Normalize BPM to realistic music range (70 - 170)
  while (bpm < 70) bpm *= 2;
  while (bpm > 170) bpm = Math.round(bpm / 2);

  return bpm;
}

/**
 * Low-cost Frequency Energy Split Calculation
 */
function analyzeFrequencyDistribution(samples: Float32Array, sampleRate: number) {
  let bassSum = 0;
  let midSum = 0;
  let trebleSum = 0;
  let totalSum = 0;

  const sampleStep = Math.max(1, Math.floor(samples.length / 20000));

  for (let i = 0; i < samples.length; i += sampleStep) {
    const val = Math.abs(samples[i]);
    totalSum += val;

    // Zero-crossing check for rough spectral energy weighting
    if (i > 0) {
      const prev = samples[i - sampleStep];
      if ((samples[i] >= 0 && prev < 0) || (samples[i] < 0 && prev >= 0)) {
        trebleSum += val;
      } else {
        bassSum += val;
      }
    }
  }

  midSum = totalSum - (bassSum * 0.5 + trebleSum * 0.5);

  const safeTotal = totalSum || 1;
  const bassRatio = Math.min(1.0, (bassSum * 1.8) / safeTotal);
  const trebleRatio = Math.min(1.0, (trebleSum * 2.2) / safeTotal);
  const vocalPresence = Math.min(1.0, (midSum * 2.0) / safeTotal);

  return { bassRatio, trebleRatio, vocalPresence };
}

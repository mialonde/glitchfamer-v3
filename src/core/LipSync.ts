import { AudioEvents, VisualizerSettings } from '../types';
import { VisemeEngine, FacialBlendshapes, VisemeType, VISEME_BLENDSHAPES } from './VisemeEngine';

export { VisemeEngine, VISEME_BLENDSHAPES };
export type { FacialBlendshapes, VisemeType };

const sharedVisemeEngine = new VisemeEngine();

export function getLipSyncBlendshapes(audio: AudioEvents, settings?: VisualizerSettings): FacialBlendshapes {
    return sharedVisemeEngine.update(audio, settings);
}

export function getActiveViseme(): VisemeType {
    return sharedVisemeEngine.getActiveViseme();
}

export function getLipSyncEnergy(audio: AudioEvents, settings?: VisualizerSettings, fallbackEnergy = 0.5): number {
    const blendshapes = getLipSyncBlendshapes(audio, settings);
    return blendshapes.mouth_open > 0 ? blendshapes.mouth_open : 0;
}


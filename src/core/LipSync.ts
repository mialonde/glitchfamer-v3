import { AudioEvents, VisualizerSettings } from '../types';

export function getLipSyncEnergy(audio: AudioEvents, settings?: VisualizerSettings, fallbackEnergy = 0.5): number {
    const hasLyrics = settings && settings.syncedLyrics && settings.syncedLyrics.length > 0;
    
    if (hasLyrics) {
        const time = audio.time;
        let isSpeaking = false;
        
        for (const line of settings.syncedLyrics) {
            if (time >= line.startTime && time <= line.endTime) {
                if (line.words && line.words.length > 0) {
                    for (const word of line.words) {
                        if (time >= word.startTime && time <= word.endTime) {
                            isSpeaking = true;
                            break;
                        }
                    }
                } else {
                    isSpeaking = true;
                }
                break;
            }
        }
        
        if (isSpeaking) {
            const energy = (audio.midEnergy ?? audio.snare ?? 0) + (audio.vocalEnergy ?? 0);
            return energy > 0.05 ? Math.min(1.0, (energy - 0.05) * 4.0) : fallbackEnergy;
        } else {
            return 0;
        }
    } else {
        return 0;
    }
}

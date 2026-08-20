const fs = require('fs');
let content = fs.readFileSync('src/components/LyricsStudio.tsx', 'utf8');

// Add import
content = content.replace(
  "import { LyricsAutoSyncTab } from './lyrics/LyricsAutoSyncTab';",
  "import { LyricsAutoSyncTab } from './lyrics/LyricsAutoSyncTab';\nimport { LyricsLiveSyncTab } from './lyrics/LyricsLiveSyncTab';"
);

// Add state for tap-to-sync tab
content = content.replace(
  "const [activeTab, setActiveTab] = useState<'MANUAL' | 'STYLE' | 'SUNO' | 'AUTO'>('MANUAL');",
  "const [activeTab, setActiveTab] = useState<'MANUAL' | 'STYLE' | 'SUNO' | 'AUTO' | 'LIVE'>('MANUAL');"
);

// Add Tab Button
const tabButtonsStr = `<button
            onClick={() => setActiveTab('AUTO')}
            className={\`flex-1 py-2 text-[10px] font-bold uppercase transition-colors rounded \${activeTab === 'AUTO' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}\`}
          >
            Otomatik
          </button>`;

const newTabButtonsStr = `<button
            onClick={() => setActiveTab('AUTO')}
            className={\`flex-1 py-2 text-[10px] font-bold uppercase transition-colors rounded \${activeTab === 'AUTO' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}\`}
          >
            Otomatik
          </button>
          <button
            onClick={() => setActiveTab('LIVE')}
            className={\`flex-1 py-2 text-[10px] font-bold uppercase transition-colors rounded \${activeTab === 'LIVE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-zinc-500 hover:text-zinc-300'}\`}
          >
            Canlı Senkron
          </button>`;

content = content.replace(tabButtonsStr, newTabButtonsStr);

// Add Tab Content
const autoTabContent = `<LyricsAutoSyncTab
          rawTextInput={rawTextInput}
          duration={duration}
          onRawTextChange={setRawTextInput}
          onAutoSync={handleAutoSyncLyrics}
        />`;

const liveTabContent = `<LyricsAutoSyncTab
          rawTextInput={rawTextInput}
          duration={duration}
          onRawTextChange={setRawTextInput}
          onAutoSync={handleAutoSyncLyrics}
        />
      )}

      {activeTab === 'LIVE' && (
        <LyricsLiveSyncTab
          rawText={rawTextInput}
          onRawTextChange={setRawTextInput}
          audioRef={audioRef}
          isPlaying={isPlaying}
          onTogglePlay={onTogglePlay}
          onApplySyncedLyrics={(lines) => {
            onChange({ syncedLyrics: lines });
            setActiveTab('MANUAL');
          }}
        />`;

content = content.replace(autoTabContent, liveTabContent);

fs.writeFileSync('src/components/LyricsStudio.tsx', content);

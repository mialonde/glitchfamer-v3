import React from 'react';
import { motion } from 'motion/react';
import { Settings, Play, ChevronDown, CheckCircle2, Sliders } from 'lucide-react';

export const StyleGuide: React.FC = () => {
  return (
    <div className="min-h-screen bg-app text-content-primary p-8 md:p-16 flex justify-center font-sans">
      <div className="max-w-5xl w-full space-y-16">
        
        {/* Header */}
        <header className="space-y-2">
          <h1 className="text-3xl font-medium tracking-tight">GlitchFramer 3.0</h1>
          <p className="text-content-secondary">Design System & Token Guide</p>
        </header>

        {/* 1. Color Palette */}
        <section className="space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-content-tertiary">1. Backgrounds & Surfaces</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-md bg-app border border-border-subtle shadow-elevation-1 space-y-2">
              <div className="h-12 w-full bg-app rounded border border-border-subtle" />
              <div className="text-xs text-content-secondary">--bg-app</div>
              <div className="text-xs font-mono">#0A0A0B</div>
            </div>
            <div className="p-4 rounded-md bg-panel border border-border-subtle shadow-elevation-1 space-y-2">
              <div className="h-12 w-full bg-panel rounded border border-border-subtle" />
              <div className="text-xs text-content-secondary">--bg-panel</div>
              <div className="text-xs font-mono">#121214</div>
            </div>
            <div className="p-4 rounded-md bg-surface border border-border-subtle shadow-elevation-1 space-y-2">
              <div className="h-12 w-full bg-surface rounded border border-border-subtle" />
              <div className="text-xs text-content-secondary">--bg-surface</div>
              <div className="text-xs font-mono">#1A1A1D</div>
            </div>
            <div className="p-4 rounded-md bg-hover border border-border-subtle shadow-elevation-1 space-y-2">
              <div className="h-12 w-full bg-hover rounded border border-border-subtle" />
              <div className="text-xs text-content-secondary">--bg-hover</div>
              <div className="text-xs font-mono">#27272A</div>
            </div>
          </div>
        </section>

        {/* 2. Typography & Text Colors */}
        <section className="space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-content-tertiary">2. Typography (Inter) & Text Tones</h2>
          <div className="bg-panel rounded-lg border border-border-subtle p-8 space-y-6 shadow-elevation-2">
            <div>
              <h1 className="text-3xl font-medium tracking-tight text-content-primary">Primary Heading (3xl)</h1>
              <p className="text-content-secondary mt-1">Used for major section titles and primary content focus.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-content-primary">Secondary Component Title (lg)</h3>
              <p className="text-content-secondary mt-1 text-sm">Used for cards, panels, and distinct UI groups. Readable and neutral.</p>
            </div>
            <div className="flex gap-4 items-center">
              <span className="text-sm font-medium text-content-primary">Primary Text</span>
              <span className="text-sm text-content-secondary">Secondary Text</span>
              <span className="text-sm text-content-tertiary">Tertiary Label</span>
            </div>
          </div>
        </section>

        {/* 3. Accent & Actions */}
        <section className="space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-content-tertiary">3. Accent Color (CSS Variable) & Buttons</h2>
          <div className="flex flex-wrap gap-6 items-center bg-panel p-8 rounded-lg border border-border-subtle shadow-elevation-2">
            
            {/* Primary CTA */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-accent hover:bg-accent-hover text-accent-foreground font-medium px-6 py-2.5 rounded-md shadow-elevation-2 transition-colors flex items-center gap-2 text-sm"
            >
              <Play size={16} fill="currentColor" />
              Oluştur (Render)
            </motion.button>

            {/* Secondary Button */}
            <motion.button 
              whileHover={{ backgroundColor: 'var(--bg-hover)' }}
              whileTap={{ scale: 0.98 }}
              className="bg-surface border border-border-strong text-content-primary font-medium px-4 py-2.5 rounded-md shadow-elevation-1 transition-colors flex items-center gap-2 text-sm"
            >
              <Settings size={16} />
              Gelişmiş Ayarlar
            </motion.button>

            {/* Accent Subtle */}
            <div className="bg-accent-muted text-accent px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 border border-accent/20">
              <CheckCircle2 size={14} />
              Seçili Profil
            </div>

          </div>
        </section>

        {/* 4. Elevations / Panels */}
        <section className="space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-content-tertiary">4. UI Elevations (Layering)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-app p-6 rounded-lg border border-border-subtle shadow-elevation-1 space-y-3">
              <h3 className="font-medium">Level 1: Base / Flat</h3>
              <p className="text-sm text-content-secondary">Main application background or flat dividers. Uses shadow-elevation-1.</p>
            </div>

            <div className="bg-panel p-6 rounded-lg border border-border-subtle shadow-elevation-2 space-y-3">
              <h3 className="font-medium">Level 2: Raised Panel</h3>
              <p className="text-sm text-content-secondary">Used for sidebars, property panels, and standard cards. Uses shadow-elevation-2.</p>
            </div>

            <div className="bg-surface p-6 rounded-lg border border-border-subtle shadow-elevation-3 relative space-y-3 transform -translate-y-2">
              <h3 className="font-medium">Level 3: Floating / Dropdown</h3>
              <p className="text-sm text-content-secondary">Used for context menus, modals, and popovers. Uses shadow-elevation-3.</p>
              
              {/* Micro-interaction Example */}
              <motion.div 
                whileHover={{ backgroundColor: 'var(--bg-hover)' }}
                className="mt-4 p-2 rounded-md border border-border-subtle flex items-center justify-between cursor-pointer text-sm"
              >
                <div className="flex items-center gap-2 text-content-secondary">
                  <Sliders size={14} />
                  İnce Ayarlar
                </div>
                <ChevronDown size={14} className="text-content-tertiary" />
              </motion.div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};

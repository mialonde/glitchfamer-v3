import React from 'react';
import { motion } from 'motion/react';
import { Settings, Play, ChevronDown, CheckCircle2, Sliders } from 'lucide-react';
import { Button, Badge, Card } from './ui';

export const StyleGuide: React.FC = () => {
  return (
    <div className="min-h-screen bg-app text-content-primary p-8 md:p-16 flex justify-center font-sans">
      <div className="max-w-5xl w-full space-y-12">
        
        {/* Header */}
        <header className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">GlitchFramer 3.0</h1>
            <Badge variant="accent">Design System</Badge>
          </div>
          <p className="text-sm text-content-secondary">Design Tokens & shadcn Primitive Component Guide</p>
        </header>

        {/* 1. Color Palette */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-content-tertiary">1. Backgrounds & Surfaces</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-4 bg-app border-border-subtle space-y-2">
              <div className="h-10 w-full bg-app rounded border border-border-subtle" />
              <div className="text-xs text-content-secondary font-medium">--bg-app</div>
              <div className="text-xs font-mono text-content-tertiary">#0A0A0B</div>
            </Card>
            <Card className="p-4 bg-panel border-border-subtle space-y-2">
              <div className="h-10 w-full bg-panel rounded border border-border-subtle" />
              <div className="text-xs text-content-secondary font-medium">--bg-panel</div>
              <div className="text-xs font-mono text-content-tertiary">#121214</div>
            </Card>
            <Card className="p-4 bg-surface border-border-subtle space-y-2">
              <div className="h-10 w-full bg-surface rounded border border-border-subtle" />
              <div className="text-xs text-content-secondary font-medium">--bg-surface</div>
              <div className="text-xs font-mono text-content-tertiary">#1A1A1D</div>
            </Card>
            <Card className="p-4 bg-hover border-border-subtle space-y-2">
              <div className="h-10 w-full bg-hover rounded border border-border-subtle" />
              <div className="text-xs text-content-secondary font-medium">--bg-hover</div>
              <div className="text-xs font-mono text-content-tertiary">#27272A</div>
            </Card>
          </div>
        </section>

        {/* 2. Typography & Text Colors */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-content-tertiary">2. Typography & Text Tones</h2>
          <Card className="p-6 space-y-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-content-primary">Primary Heading (2xl)</h1>
              <p className="text-xs text-content-secondary mt-1">Used for major section titles and primary content focus.</p>
            </div>
            <div>
              <h3 className="text-base font-bold text-content-primary">Secondary Component Title (base)</h3>
              <p className="text-content-secondary mt-0.5 text-xs">Used for cards, panels, and distinct UI groups. Readable and neutral.</p>
            </div>
            <div className="flex gap-4 items-center pt-2 border-t border-border-subtle">
              <span className="text-xs font-medium text-content-primary">Primary Text</span>
              <span className="text-xs text-content-secondary">Secondary Text</span>
              <span className="text-xs text-content-tertiary">Tertiary Label</span>
            </div>
          </Card>
        </section>

        {/* 3. Accent & Actions */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-content-tertiary">3. Primitive Buttons & Badges</h2>
          <Card className="flex flex-wrap gap-4 items-center p-6">
            
            {/* Primary CTA */}
            <Button variant="accent" size="default" className="gap-2">
              <Play size={15} fill="currentColor" />
              Oluştur (Render)
            </Button>

            {/* Secondary Button */}
            <Button variant="outline" size="default" className="gap-2">
              <Settings size={15} />
              Gelişmiş Ayarlar
            </Button>

            <Button variant="secondary" size="sm">
              İkincil
            </Button>

            <Button variant="destructive" size="sm">
              Sil
            </Button>

            {/* Badges */}
            <Badge variant="accent" className="gap-1">
              <CheckCircle2 size={12} />
              Seçili Profil
            </Badge>

            <Badge variant="outline">
              Standart Etiket
            </Badge>

            <Badge variant="success">
              Tamamlandı
            </Badge>

          </Card>
        </section>

        {/* 4. Elevations / Panels */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-content-tertiary">4. UI Elevations (Layering)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <Card className="bg-app p-5 border-border-subtle space-y-2">
              <h3 className="text-xs font-bold text-content-primary">Level 1: Base / Flat</h3>
              <p className="text-xs text-content-secondary">Main application background or flat dividers.</p>
            </Card>

            <Card className="bg-panel p-5 border-border-subtle space-y-2">
              <h3 className="text-xs font-bold text-content-primary">Level 2: Raised Panel</h3>
              <p className="text-xs text-content-secondary">Used for sidebars, property panels, and standard cards.</p>
            </Card>

            <Card className="bg-surface p-5 border-border-subtle space-y-2">
              <h3 className="text-xs font-bold text-content-primary">Level 3: Floating / Dropdown</h3>
              <p className="text-xs text-content-secondary">Used for context menus, modals, and popovers.</p>
            </Card>

          </div>
        </section>

      </div>
    </div>
  );
};


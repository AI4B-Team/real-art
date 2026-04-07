import { useState, useRef, useCallback } from 'react';
import {
  ChevronDown, ChevronUp, ChevronLeft, Plus,
  Maximize2, LayoutGrid as LayoutGridIcon, Palette, Square, SlidersHorizontal,
  Upload, ImageIcon, ChevronsLeft, ChevronsRight, ChevronRight,
  Brain, Target, Eye, FileText, Zap, BookOpen, MessageSquare,
  MinusCircle, ArrowDownToLine, Check, Sparkles, RefreshCw,
  PenTool, Layers, Wand2, Type, Mic, Globe,
} from 'lucide-react';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import type { Page } from './EbookCanvasEditor';

interface PageSettingsPanelProps {
  pages: Page[];
  selectedPageId: string | null;
  onPageSelect: (id: string) => void;
  onPagesChange: (pages: Page[]) => void;
  onGridViewToggle?: () => void;
  bookTitle?: string;
  pageWidth?: number;
  pageHeight?: number;
  onDimensionsChange?: (w: number, h: number) => void;
  onOpenImageSection?: () => void;
  showLockedPagesWarning?: (actionLabel: string, onApplyAll: () => void, onApplySkipping: () => void) => boolean;
  sidebarMode?: 'design' | 'ai';
  selectedPageTitle?: string;
  pageIndex?: number;
  onSendToChat?: (prompt: string) => void;
}

type BgTab = 'color' | 'pattern' | 'image';

const STYLE_LAYOUTS = [
  { id: 'single-no-img', name: 'Single Column No Image' },
  { id: 'double-no-img', name: 'Double Column No Image' },
  { id: 'double-with-img', name: 'Double Column With Image' },
  { id: 'single-with-img', name: 'Single Column With Image' },
];

const BG_COLORS = [
  'hsl(0 0% 100%)', 'hsl(0 0% 95%)', 'hsl(0 0% 80%)', 'hsl(0 0% 10%)',
  'hsl(180 40% 60%)', 'hsl(150 50% 50%)', 'hsl(40 90% 55%)',
  'hsl(20 80% 55%)', 'hsl(0 70% 55%)', 'hsl(280 60% 55%)',
  'hsl(210 70% 55%)', 'hsl(330 70% 55%)',
];

const PATTERNS = [
  { id: 'none', label: 'None' },
  { id: 'dots', label: 'Dots' },
  { id: 'lines', label: 'Lines' },
  { id: 'grid', label: 'Grid' },
  { id: 'diagonal', label: 'Diagonal' },
  { id: 'cross', label: 'Cross' },
  { id: 'zigzag', label: 'Zigzag' },
  { id: 'waves', label: 'Waves' },
];

const BORDER_TYPES = ['none', 'solid', 'dashed', 'dotted'] as const;
const BORDER_SIZES = [0, 1, 2, 3, 4, 5];
const FORMAT_PRESETS = [
  { id: 'a4', label: 'A4', w: 595, h: 842 },
  { id: 'a5', label: 'A5', w: 420, h: 595 },
  { id: 'letter', label: 'US Letter', w: 612, h: 792 },
  { id: '6x9', label: '6×9 in', w: 432, h: 648 },
  { id: 'square', label: 'Square', w: 600, h: 600 },
  { id: 'custom', label: 'Custom', w: 0, h: 0 },
];

const PageSettingsPanel = ({
  pages, selectedPageId, onPageSelect, onPagesChange, onGridViewToggle, bookTitle = '',
  pageWidth: externalWidth = 480, pageHeight: externalHeight = 640, onDimensionsChange, onOpenImageSection,
  showLockedPagesWarning, sidebarMode = 'design', selectedPageTitle, pageIndex: externalPageIndex, onSendToChat,
}: PageSettingsPanelProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['size']));
  const [bgTab, setBgTab] = useState<BgTab>('color');
  const orientation = externalWidth > externalHeight ? 'landscape' : 'portrait';
  const [resizeContent, setResizeContent] = useState(true);
  const [hexValue, setHexValue] = useState('#FFFFFF');
  const [opacity, setOpacity] = useState(1);
  const [selectedFormat, setSelectedFormat] = useState('custom');
  const [applyTo, setApplyTo] = useState<'current' | 'all'>('current');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedPage = pages.find(p => p.id === selectedPageId);

  const updatePage = useCallback((pageId: string, patch: Partial<Page>) => {
    onPagesChange(pages.map(p => p.id === pageId ? { ...p, ...patch } : p));
  }, [pages, onPagesChange]);

  const updateSelectedPage = useCallback((patch: Partial<Page>) => {
    if (!selectedPageId) return;
    if (applyTo === 'all') {
      const lockedPages = pages.filter(p => p.locked);
      if (lockedPages.length > 0 && showLockedPagesWarning) {
        const showed = showLockedPagesWarning(
          'Apply To All Pages',
          () => onPagesChange(pages.map(p => ({ ...p, locked: false, ...patch }))),
          () => onPagesChange(pages.map(p => p.locked ? p : { ...p, ...patch })),
        );
        if (showed) return;
      }
      onPagesChange(pages.map(p => ({ ...p, ...patch })));
    } else {
      const currentPage = pages.find(p => p.id === selectedPageId);
      if (currentPage?.locked) {
        toast.error('This page is locked. Unlock it to make changes.');
        return;
      }
      updatePage(selectedPageId, patch);
    }
  }, [selectedPageId, applyTo, pages, onPagesChange, updatePage, showLockedPagesWarning]);

  const handleOrientationChange = (newOrientation: 'portrait' | 'landscape') => {
    if (newOrientation === orientation) return;
    onDimensionsChange?.(externalHeight, externalWidth);
  };

  const selectedIndex = pages.findIndex(p => p.id === selectedPageId);

  const toggleSection = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const goTo = (dir: 'first' | 'prev' | 'next' | 'last') => {
    let idx = selectedIndex;
    if (dir === 'first') idx = 0;
    else if (dir === 'prev') idx = Math.max(0, idx - 1);
    else if (dir === 'next') idx = Math.min(pages.length - 1, idx + 1);
    else idx = pages.length - 1;
    onPageSelect(pages[idx].id);
  };

  if (isCollapsed) {
    return (
      <div className="w-8 border-l border-foreground/[0.04] bg-background flex flex-col items-center py-3">
        <button onClick={() => setIsCollapsed(false)} className="p-1 rounded hover:bg-foreground/[0.05] text-muted-foreground">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const SectionToggle = ({ id, title, icon: Icon }: { id: string; title: string; icon: any }) => (
    <button onClick={() => toggleSection(id)}
      className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${expandedSections.has(id) ? 'bg-foreground/[0.12] border-l-2 border-l-accent' : 'hover:bg-foreground/[0.03] border-l-2 border-l-transparent'}`}>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      {expandedSections.has(id) ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
    </button>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <div className="w-80 border-l border-foreground/[0.04] bg-background flex flex-col shrink-0">
    {/* Tabs: Director | Format */}
    <div className="flex border-b border-foreground/[0.04] shrink-0">
      <button
        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all ${sidebarMode === 'ai' ? 'bg-foreground/[0.12] text-foreground border-b-2 border-b-accent' : 'text-muted-foreground hover:bg-foreground/[0.04]'}`}
        onClick={() => {/* Director tab is auto-shown when AI mode */}}
      >
        <Brain className="w-3.5 h-3.5" /> Director
      </button>
      <button
        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all ${sidebarMode !== 'ai' ? 'bg-foreground/[0.12] text-foreground border-b-2 border-b-accent' : 'text-muted-foreground hover:bg-foreground/[0.04]'}`}
        onClick={() => {/* Format tab is auto-shown when design mode */}}
      >
        <SlidersHorizontal className="w-3.5 h-3.5" /> Format
      </button>
    </div>

    {/* === DIRECTOR MODE (when AI is active) === */}
    {sidebarMode === 'ai' && (
      <div className="flex-1 overflow-y-auto">
        {/* Performance Snapshot */}
        <div className="px-4 py-3 border-b border-foreground/[0.04]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Page Performance</span>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black text-foreground leading-none">82</span>
              <span className="text-[10px] text-muted-foreground">/100</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 w-fit mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span className="text-[10px] font-semibold text-amber-600">Good, but underperforming</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug italic">
            "This page is visually strong but lacks a clear hook and engagement driver."
          </p>
          <div className="mt-3 space-y-1.5">
            {[
              { label: 'Readability', score: 88 },
              { label: 'Engagement', score: 76 },
              { label: 'Visual Balance', score: 82 },
            ].map(m => {
              const barColor = m.score >= 85 ? 'bg-emerald-500' : m.score >= 70 ? 'bg-amber-500' : 'bg-destructive';
              return (
                <div key={m.label} className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground w-20 shrink-0">{m.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-foreground/[0.06] overflow-hidden">
                    <div className={`h-full rounded-full ${barColor} transition-all duration-500`} style={{ width: `${m.score}%` }} />
                  </div>
                  <span className="text-[10px] font-semibold text-foreground w-6 text-right">{m.score}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Fixes */}
        <div className="border-b border-foreground/[0.04]">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Priority Fixes</span>
            <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">3 Items</span>
          </div>
          <div className="px-3 pb-3 space-y-2">
            {[
              { icon: Target, color: 'text-amber-500', bg: 'bg-amber-500/10', title: 'Weak headline — low keyword impact', desc: 'Stronger headlines get 2× more reads.', action: 'Rewrite' },
              { icon: Eye, color: 'text-destructive', bg: 'bg-destructive/10', title: 'Missing visual hierarchy', desc: 'No clear focal point hurting engagement by 40%.', action: 'Add Visual' },
              { icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10', title: 'Text too dense', desc: 'Break into shorter sections for 25% better readability.', action: 'Simplify' },
            ].map((s, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-foreground/[0.02] border border-foreground/[0.06] flex items-start gap-2">
                <div className={`p-1 rounded-md ${s.bg} mt-0.5 shrink-0`}>
                  <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-foreground leading-tight">{s.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{s.desc}</p>
                </div>
                <button
                  onClick={() => onSendToChat?.(`${s.action}: ${s.desc}`)}
                  className="text-[10px] font-bold text-accent hover:underline shrink-0 mt-0.5"
                >
                  {s.action} →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-3 py-3">
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-2 block">Quick Actions</span>
          <div className="flex flex-col gap-1">
            {[
              { label: 'Improve Writing', desc: 'Enhance clarity and flow', icon: Sparkles },
              { label: 'Fix Spelling & Grammar', desc: 'Correct errors automatically', icon: Check },
              { label: 'Make Shorter', desc: 'Condense while keeping meaning', icon: MinusCircle },
              { label: 'Make Longer', desc: 'Expand with more detail', icon: ArrowDownToLine },
              { label: 'Make Persuasive', desc: 'Increase conversion impact', icon: Zap },
              { label: 'Improve Clarity', desc: 'Sharpen readability', icon: Eye },
              { label: 'Change Tone', desc: 'Adjust writing style', icon: MessageSquare },
              { label: 'Rewrite in Plain Language', desc: 'Simplify complex text', icon: FileText },
              { label: 'Change Focus', desc: 'Shift emphasis or perspective', icon: Target },
              { label: 'Simplify Language', desc: 'Use simpler words and sentences', icon: BookOpen },
              { label: 'Add Visual', desc: 'Insert supporting imagery', icon: ImageIcon },
              { label: 'Rewrite Section', desc: 'Completely rewrite selected text', icon: RefreshCw },
              { label: 'Add Heading', desc: 'Generate a compelling heading', icon: Type },
              { label: 'Generate Summary', desc: 'Create a concise summary', icon: Layers },
              { label: 'Add Call-to-Action', desc: 'Insert a persuasive CTA', icon: Wand2 },
              { label: 'Translate', desc: 'Translate to another language', icon: Globe },
            ].map(a => (
              <button key={a.label}
                onClick={() => onSendToChat?.(`${a.label}: ${a.desc}`)}
                className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-left hover:bg-foreground/[0.04] transition-colors group">
                <a.icon className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-accent transition-colors" />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-foreground leading-tight">{a.label}</p>
                  <p className="text-[10px] text-muted-foreground leading-snug">{a.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )}

    {/* === FORMAT MODE (when design is active) === */}
    {sidebarMode !== 'ai' && (
        <div className="flex-1 overflow-y-auto">
          <SectionToggle id="size" title="Size" icon={Maximize2} />
          {expandedSections.has('size') && (
            <div className="px-4 pt-2 pb-4 space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Resize By Format</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-foreground/[0.08] text-sm text-foreground hover:border-foreground/[0.15]">
                      {FORMAT_PRESETS.find(f => f.id === selectedFormat)?.label || 'Custom'} <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-1" align="start">
                    {FORMAT_PRESETS.map(f => (
                      <button key={f.id} onClick={() => {
                        setSelectedFormat(f.id);
                        if (f.id !== 'custom' && f.w > 0) onDimensionsChange?.(f.w, f.h);
                      }}
                        className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${selectedFormat === f.id ? 'bg-accent/10 text-accent font-medium' : 'hover:bg-foreground/[0.04]'}`}>
                        {f.label}{f.w > 0 ? ` (${f.w}×${f.h})` : ''}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Orientation</label>
                <div className="flex rounded-lg border border-foreground/[0.08] overflow-hidden">
                  <button onClick={() => handleOrientationChange('portrait')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${orientation === 'portrait' ? 'bg-accent text-white' : 'text-foreground hover:bg-foreground/[0.03]'}`}>
                    <Square className="w-3 h-3" /> Portrait
                  </button>
                  <button onClick={() => handleOrientationChange('landscape')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors ${orientation === 'landscape' ? 'bg-accent text-white' : 'text-foreground hover:bg-foreground/[0.03]'}`}>
                    <Square className="w-3 h-3 rotate-90" /> Landscape
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Custom Size</label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 flex-1">
                    <span className="text-xs text-muted-foreground">W</span>
                    <input type="number" value={externalWidth} onChange={e => onDimensionsChange?.(Number(e.target.value), externalHeight)}
                      className="w-full px-2 py-1.5 rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] text-xs text-foreground focus:outline-none focus:border-accent/40" />
                  </div>
                  <span className="text-muted-foreground text-xs">⟷</span>
                  <div className="flex items-center gap-1 flex-1">
                    <span className="text-xs text-muted-foreground">H</span>
                    <input type="number" value={externalHeight} onChange={e => onDimensionsChange?.(externalWidth, Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] text-xs text-foreground focus:outline-none focus:border-accent/40" />
                  </div>
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${resizeContent ? 'bg-accent border-accent' : 'border-foreground/[0.15]'}`}
                  onClick={() => setResizeContent(!resizeContent)}>
                  {resizeContent && <span className="text-white text-[10px]">✓</span>}
                </div>
                <span className="text-xs text-foreground">Resize Content</span>
              </label>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Apply To</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-foreground/[0.08] text-sm text-foreground hover:border-foreground/[0.15]">
                      {applyTo === 'all' ? `All Pages (1-${pages.length})` : `Current Page (${selectedIndex + 1})`} <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-48 p-1" align="start">
                    <button onClick={() => setApplyTo('current')}
                      className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${applyTo === 'current' ? 'bg-accent/10 text-accent font-medium' : 'hover:bg-foreground/[0.04]'}`}>
                      Current Page ({selectedIndex + 1})
                    </button>
                    <button onClick={() => setApplyTo('all')}
                      className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${applyTo === 'all' ? 'bg-accent/10 text-accent font-medium' : 'hover:bg-foreground/[0.04]'}`}>
                      All Pages (1-{pages.length})
                    </button>
                  </PopoverContent>
                </Popover>
              </div>
              <button onClick={() => toast.success('Size applied')}
                className="w-full py-2.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors">
                Confirm
              </button>
            </div>
          )}

          {/* Style */}
          <SectionToggle id="style" title="Style" icon={LayoutGridIcon} />
          {expandedSections.has('style') && (
            <div className="px-4 pt-2 pb-4">
              <div className="grid grid-cols-2 gap-2">
                {STYLE_LAYOUTS.map(layout => (
                  <button key={layout.id} onClick={() => { updateSelectedPage({ layout: layout.id }); toast.success(`${layout.name} applied`); }}
                    className={`rounded-lg border overflow-hidden transition-all ${selectedPage?.layout === layout.id ? 'border-accent ring-1 ring-accent' : 'border-foreground/[0.06] hover:border-accent/40'}`}>
                    <div className="aspect-[3/4] bg-foreground/[0.03] flex items-center justify-center p-2">
                      {layout.id.includes('double') ? (
                        <div className="w-full h-full flex gap-1">
                          <div className="flex-1 flex flex-col gap-1">
                            <div className="h-1 bg-accent/30 rounded-sm" />
                            <div className="h-0.5 bg-foreground/[0.1] rounded-sm" />
                            <div className="h-0.5 bg-foreground/[0.1] rounded-sm w-3/4" />
                          </div>
                          <div className="flex-1 flex flex-col gap-1">
                            {layout.id.includes('with-img') ? (
                              <div className="flex-1 bg-accent/20 rounded-sm" />
                            ) : (
                              <>
                                <div className="h-0.5 bg-foreground/[0.1] rounded-sm" />
                                <div className="h-0.5 bg-foreground/[0.1] rounded-sm w-2/3" />
                              </>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex flex-col gap-1">
                          {layout.id.includes('with-img') && <div className="h-8 bg-accent/20 rounded-sm" />}
                          <div className="h-1 bg-accent/30 rounded-sm w-2/3" />
                          <div className="h-0.5 bg-foreground/[0.1] rounded-sm" />
                          <div className="h-0.5 bg-foreground/[0.1] rounded-sm w-3/4" />
                        </div>
                      )}
                    </div>
                    <p className="text-[9px] font-medium text-center py-1.5 text-foreground px-1 truncate">{layout.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Background */}
          <SectionToggle id="background" title="Background" icon={Palette} />
          {expandedSections.has('background') && (
            <div className="px-4 pt-2 pb-4 space-y-3">
              <div className="flex rounded-lg border border-foreground/[0.08] overflow-hidden">
                {(['color', 'pattern', 'image'] as BgTab[]).map(tab => (
                  <button key={tab} onClick={() => setBgTab(tab)}
                    className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${bgTab === tab ? 'bg-accent text-white' : 'text-foreground hover:bg-foreground/[0.03]'}`}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {bgTab === 'color' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-6 gap-1.5">
                    <label className="w-8 h-8 rounded-full border-2 border-dashed border-foreground/[0.15] flex items-center justify-center hover:border-accent/40 cursor-pointer">
                      <Plus className="w-3 h-3 text-muted-foreground" />
                      <input type="color" className="sr-only" onChange={e => { updateSelectedPage({ bgColor: e.target.value }); toast.success('Background color applied'); }} />
                    </label>
                    {BG_COLORS.map((c, i) => (
                      <button key={i} onClick={() => { updateSelectedPage({ bgColor: c }); toast.success('Background color applied'); }}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${selectedPage?.bgColor === c ? 'border-accent scale-110' : 'border-transparent hover:scale-105'}`}
                        style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground mb-1 block">HEX</label>
                      <input value={hexValue} onChange={e => setHexValue(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { updateSelectedPage({ bgColor: hexValue }); toast.success('Background color applied'); } }}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] text-xs font-mono text-foreground focus:outline-none focus:border-accent/40" />
                    </div>
                    <div className="w-16">
                      <label className="text-[10px] text-muted-foreground mb-1 block">Opacity</label>
                      <div className="flex items-center gap-1">
                        <input type="number" min={0} max={1} step={0.1} value={opacity} onChange={e => setOpacity(Number(e.target.value))}
                          className="w-full px-2 py-1.5 rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] text-xs text-foreground focus:outline-none focus:border-accent/40" />
                        <span className="text-[10px] text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {bgTab === 'pattern' && (
                <div className="grid grid-cols-4 gap-1.5">
                  {PATTERNS.map(p => (
                    <button key={p.id} onClick={() => { updateSelectedPage({ bgPattern: p.id }); toast.success(`${p.label} pattern applied`); }}
                      className={`aspect-square rounded-lg border hover:border-accent/40 flex items-center justify-center transition-colors ${selectedPage?.bgPattern === p.id ? 'border-accent bg-accent/5' : 'border-foreground/[0.06]'}`}>
                      <div className="w-8 h-8 bg-foreground/[0.03] rounded" />
                    </button>
                  ))}
                </div>
              )}

              {bgTab === 'image' && (
                <div className="space-y-2">
                  <button onClick={() => fileInputRef.current?.click()}
                    className="w-full py-8 border border-dashed border-foreground/[0.08] rounded-lg flex flex-col items-center gap-2 text-muted-foreground hover:border-accent/40 hover:text-accent transition-colors">
                    <ImageIcon className="w-5 h-5" />
                    <span className="text-[10px]">Click To Upload Image</span>
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      updateSelectedPage({ bgImage: url });
                      toast.success('Background image set');
                    }
                  }} />
                </div>
              )}
            </div>
          )}

          {/* Border */}
          <SectionToggle id="border" title="Border" icon={Square} />
          {expandedSections.has('border') && (
            <div className="px-4 pt-2 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Type</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-foreground/[0.08] text-sm text-foreground hover:border-foreground/[0.15] capitalize">
                        {selectedPage?.pageBorderType === 'none' || !selectedPage?.pageBorderType ? 'No Border' : selectedPage.pageBorderType} <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-36 p-1" align="start">
                      {BORDER_TYPES.map(t => (
                        <button key={t} onClick={() => updateSelectedPage({ pageBorderType: t })}
                          className={`w-full text-left px-3 py-1.5 text-sm rounded-md capitalize transition-colors ${selectedPage?.pageBorderType === t ? 'bg-accent/10 text-accent font-medium' : 'hover:bg-foreground/[0.04]'}`}>
                          {t === 'none' ? 'No Border' : t}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Style</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-foreground/[0.08] text-sm text-foreground hover:border-foreground/[0.15] capitalize">
                        {selectedPage?.pageBorderType && selectedPage.pageBorderType !== 'none' ? selectedPage.pageBorderType : 'Solid'} <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-36 p-1" align="start">
                      {(['solid', 'dashed', 'dotted'] as const).map(s => (
                        <button key={s} onClick={() => updateSelectedPage({ pageBorderType: s })}
                          className={`w-full text-left px-3 py-1.5 text-sm rounded-md capitalize transition-colors ${selectedPage?.pageBorderType === s ? 'bg-accent/10 text-accent font-medium' : 'hover:bg-foreground/[0.04]'}`}>
                          {s}
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Size</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-foreground/[0.08] text-sm text-foreground hover:border-foreground/[0.15]">
                        {selectedPage?.pageBorderWidth || 1}px <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-28 p-1" align="start">
                      {BORDER_SIZES.map(s => (
                        <button key={s} onClick={() => updateSelectedPage({ pageBorderWidth: s })}
                          className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${(selectedPage?.pageBorderWidth || 1) === s ? 'bg-accent/10 text-accent font-medium' : 'hover:bg-foreground/[0.04]'}`}>
                          {s}px
                        </button>
                      ))}
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Color</label>
                  <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-foreground/[0.08] cursor-pointer hover:border-foreground/[0.15]">
                    <div className="w-5 h-5 rounded border border-foreground/[0.1]" style={{ backgroundColor: selectedPage?.pageBorderColor || '#e5e7eb' }} />
                    <span className="text-xs text-foreground">{selectedPage?.pageBorderColor || '#e5e7eb'}</span>
                    <input type="color" className="sr-only" value={selectedPage?.pageBorderColor || '#e5e7eb'}
                      onChange={e => updateSelectedPage({ pageBorderColor: e.target.value })} />
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 p-3 mx-4 mb-4 rounded-xl bg-foreground/[0.02] border border-foreground/[0.04] text-center">
            <p className="text-[11px] text-muted-foreground italic">"Your book will be ready to publish, share, or sell."</p>
          </div>
        </div>
    )}

        {/* Bottom navigation */}
        <div className="border-t border-foreground/[0.04] px-3 py-2 flex items-center justify-center gap-1">
          <button onClick={() => goTo('first')} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05]">
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => goTo('prev')} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05]">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs text-muted-foreground px-1.5">
            <span className="font-medium text-foreground">{selectedIndex + 1}</span> / {pages.length}
          </span>
          <button onClick={() => goTo('next')} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05]">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => goTo('last')} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05]">
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
          <Tooltip><TooltipTrigger asChild>
            <button onClick={onGridViewToggle} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] ml-1">
              <LayoutGridIcon className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger><TooltipContent>Grid View</TooltipContent></Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PageSettingsPanel;

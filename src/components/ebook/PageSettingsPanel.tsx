import { useState, useRef, useCallback } from 'react';
import {
  X, ChevronDown, ChevronUp, ChevronLeft, Plus, Copy, Lock, Trash2,
  Maximize2, LayoutGrid as LayoutGridIcon, Palette, Square, SlidersHorizontal,
  Upload, ImageIcon, ChevronsLeft, ChevronsRight, ChevronRight, Unlock,
} from 'lucide-react';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import type { Page } from './EbookCanvasEditor';
import { getElementsForPage } from './EbookCanvasEditor';
import PageThumbnail from './PageThumbnail';

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
  pageWidth: externalWidth = 480, pageHeight: externalHeight = 640, onDimensionsChange,
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
      onPagesChange(pages.map(p => ({ ...p, ...patch })));
    } else {
      updatePage(selectedPageId, patch);
    }
  }, [selectedPageId, applyTo, pages, onPagesChange, updatePage]);

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

  const handlePageAction = (action: string, pageId: string) => {
    const idx = pages.findIndex(p => p.id === pageId);
    if (idx === -1) return;
    switch (action) {
      case 'add': {
        const newPage: Page = { id: crypto.randomUUID(), title: `Page ${pages.length + 1}`, type: 'chapter' };
        const arr = [...pages];
        arr.splice(idx + 1, 0, newPage);
        onPagesChange(arr);
        onPageSelect(newPage.id);
        toast.success('Page added');
        break;
      }
      case 'duplicate': {
        const dup = { ...pages[idx], id: crypto.randomUUID(), title: pages[idx].title + ' (copy)' };
        const arr = [...pages];
        arr.splice(idx + 1, 0, dup);
        onPagesChange(arr);
        toast.success('Page duplicated');
        break;
      }
      case 'lock':
        onPagesChange(pages.map(p => p.id === pageId ? { ...p, locked: !p.locked } : p));
        toast.success(pages[idx].locked ? 'Page unlocked' : 'Page locked');
        break;
      case 'delete':
        if (pages.length <= 1) return;
        onPagesChange(pages.filter(p => p.id !== pageId));
        if (selectedPageId === pageId) onPageSelect(pages[0].id);
        toast.success('Page deleted');
        break;
      case 'moveUp':
        if (idx === 0) return;
        const up = [...pages];
        [up[idx - 1], up[idx]] = [up[idx], up[idx - 1]];
        onPagesChange(up);
        break;
      case 'moveDown':
        if (idx === pages.length - 1) return;
        const dn = [...pages];
        [dn[idx], dn[idx + 1]] = [dn[idx + 1], dn[idx]];
        onPagesChange(dn);
        break;
    }
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
      className="w-full flex items-center justify-between px-4 py-3 hover:bg-foreground/[0.03] transition-colors">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
      {expandedSections.has(id) ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
    </button>
  );

  return (
    <TooltipProvider delayDuration={200}>
      <div className="w-64 border-l border-foreground/[0.04] bg-background flex flex-col shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/[0.04]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-bold text-foreground">Page Settings</span>
          </div>
          <button onClick={() => setIsCollapsed(true)} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Page Number */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/[0.04]">
            <span className="text-sm text-foreground font-medium">Page Number</span>
            <span className="text-sm font-semibold text-foreground bg-foreground/[0.04] px-3 py-1 rounded-lg min-w-[40px] text-center">
              {selectedIndex + 1}
            </span>
          </div>

          {/* Page action buttons */}
          {selectedPageId && (
            <div className="flex items-center justify-center gap-1 px-4 py-2 border-b border-foreground/[0.04]">
              <Tooltip><TooltipTrigger asChild>
                <button onClick={() => handlePageAction('add', selectedPageId)} className="p-1.5 rounded hover:bg-foreground/[0.05] text-muted-foreground">
                  <Plus className="w-4 h-4" />
                </button>
              </TooltipTrigger><TooltipContent>Add Page</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild>
                <button onClick={() => handlePageAction('duplicate', selectedPageId)} className="p-1.5 rounded hover:bg-foreground/[0.05] text-muted-foreground">
                  <Copy className="w-4 h-4" />
                </button>
              </TooltipTrigger><TooltipContent>Duplicate</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild>
                <button onClick={() => handlePageAction('lock', selectedPageId)} className="p-1.5 rounded hover:bg-foreground/[0.05] text-muted-foreground">
                  <Lock className="w-4 h-4" />
                </button>
              </TooltipTrigger><TooltipContent>Lock Page</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild>
                <button onClick={() => handlePageAction('delete', selectedPageId)} className="p-1.5 rounded hover:bg-foreground/[0.05] text-muted-foreground hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </button>
              </TooltipTrigger><TooltipContent>Delete Page</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild>
                <button onClick={() => handlePageAction('moveUp', selectedPageId)} className="p-1.5 rounded hover:bg-foreground/[0.05] text-muted-foreground">
                  <ChevronUp className="w-4 h-4" />
                </button>
              </TooltipTrigger><TooltipContent>Move Up</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild>
                <button onClick={() => handlePageAction('moveDown', selectedPageId)} className="p-1.5 rounded hover:bg-foreground/[0.05] text-muted-foreground">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </TooltipTrigger><TooltipContent>Move Down</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild>
                <button onClick={onGridViewToggle} className="p-1.5 rounded hover:bg-foreground/[0.05] text-muted-foreground">
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </TooltipTrigger><TooltipContent>Grid View</TooltipContent></Tooltip>
            </div>
          )}

          {/* Size */}
          <SectionToggle id="size" title="Size" icon={Maximize2} />
          {expandedSections.has('size') && (
            <div className="px-4 pb-4 space-y-3">
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
            <div className="px-4 pb-4">
              <div className="grid grid-cols-2 gap-2">
                {STYLE_LAYOUTS.map(layout => (
                  <button key={layout.id} onClick={() => toast.success(`${layout.name} applied`)}
                    className="rounded-lg border border-foreground/[0.06] hover:border-accent/40 overflow-hidden transition-all">
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
            <div className="px-4 pb-4 space-y-3">
              {/* Tabs */}
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
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={() => toast.success('Background image set')} />
                </div>
              )}
            </div>
          )}

          {/* Border */}
          <SectionToggle id="border" title="Border" icon={Square} />
          {expandedSections.has('border') && (
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Type</label>
                  <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-foreground/[0.08] text-xs text-foreground hover:border-foreground/[0.15]">
                    No Border <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Style</label>
                  <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-foreground/[0.08] text-xs text-foreground hover:border-foreground/[0.15]">
                    Solid <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Size</label>
                  <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-foreground/[0.08] text-xs text-foreground hover:border-foreground/[0.15]">
                    1px <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </button>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Color</label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-foreground/[0.08]">
                    <div className="w-4 h-4 rounded border border-foreground/[0.1]" style={{ backgroundColor: '#e5e7eb' }} />
                    <span className="text-xs text-foreground font-mono">#e5e7eb</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

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

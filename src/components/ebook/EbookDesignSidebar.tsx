import { useState, useRef } from 'react';
import {
  ChevronDown, ChevronUp, Layers, FileText, Image as ImageIcon,
  Plus, Pencil, Search, Sparkles, Send, Upload, Loader2,
  Type, QrCode, Video, Music, Table, CheckSquare,
  Square, Circle, Triangle, Star, Hexagon, Diamond, Pentagon,
  ArrowRight, ArrowDown, BarChart3, LineChart, PieChart,
  Smile, Tag, StickyNote, ExternalLink, MapPin,
  GripVertical, Trash2, X, Check,
  LayoutGrid, LayoutTemplate, Presentation,
  MonitorPlay, AudioLines, MousePointerClick, Layers3, Languages,
} from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import AITextEditMenu, { type AIEditAction } from './AITextEditMenu';

interface Chapter {
  id: string;
  title: string;
  type?: 'cover' | 'table of contents' | 'introduction' | 'summary' | null;
}

interface EbookDesignSidebarProps {
  bookTitle: string;
  chapters: Chapter[];
  selectedChapterId: string | null;
  onChapterSelect: (id: string) => void;
  onChapterAdd: (afterId: string) => void;
  onChapterTitleEdit: (id: string, newTitle: string) => void;
  onChapterDelete?: (id: string) => void;
  onChapterReorder?: (fromIndex: number, toIndex: number) => void;
  onAddElement?: (type: string, data?: any) => void;
}

type SectionId = 'templates' | 'content' | 'image' | 'text' | 'video' | 'audio' | 'elements' | 'interactive' | 'mockups' | 'translate';

const TEMPLATES = [
  { id: 'minimal', name: 'Minimal', color: '#f1f5f9' },
  { id: 'modern', name: 'Modern', color: '#dbeafe' },
  { id: 'classic', name: 'Classic', color: '#fef3c7' },
  { id: 'bold', name: 'Bold', color: '#fce7f3' },
  { id: 'elegant', name: 'Elegant', color: '#1e293b' },
  { id: 'nature', name: 'Nature', color: '#dcfce7' },
];

const ELEMENT_CATEGORIES: Record<string, { title: string; items: { id: string; name: string; icon: any; color: string }[] }> = {
  widgets: {
    title: 'Widgets',
    items: [
      { id: 'table-widget', name: 'Table', icon: Table, color: '#10B981' },
      { id: 'qr-code', name: 'QR Code', icon: QrCode, color: '#1F2937' },
      { id: 'video-player', name: 'Video', icon: Video, color: '#EF4444' },
      { id: 'checklist', name: 'Checklist', icon: CheckSquare, color: '#3B82F6' },
    ],
  },
  shapes: {
    title: 'Shapes',
    items: [
      { id: 'rectangle', name: 'Rectangle', icon: Square, color: '#8B5CF6' },
      { id: 'ellipse', name: 'Circle', icon: Circle, color: '#3B82F6' },
      { id: 'triangle', name: 'Triangle', icon: Triangle, color: '#F59E0B' },
      { id: 'hexagon', name: 'Hexagon', icon: Hexagon, color: '#14B8A6' },
      { id: 'star', name: 'Star', icon: Star, color: '#FBBF24' },
      { id: 'diamond', name: 'Diamond', icon: Diamond, color: '#EC4899' },
      { id: 'pentagon', name: 'Pentagon', icon: Pentagon, color: '#6366F1' },
    ],
  },
  arrows: {
    title: 'Lines & Arrows',
    items: [
      { id: 'arrow-right', name: 'Arrow Right', icon: ArrowRight, color: '#F97316' },
      { id: 'arrow-down', name: 'Arrow Down', icon: ArrowDown, color: '#F97316' },
    ],
  },
  charts: {
    title: 'Charts',
    items: [
      { id: 'bar-chart', name: 'Bar Chart', icon: BarChart3, color: '#3B82F6' },
      { id: 'line-chart', name: 'Line Chart', icon: LineChart, color: '#10B981' },
      { id: 'pie-chart', name: 'Pie Chart', icon: PieChart, color: '#F59E0B' },
    ],
  },
  stickers: {
    title: 'Stickers',
    items: [
      { id: 'emoji-smile', name: 'Happy', icon: Smile, color: '#FBBF24' },
      { id: 'tag', name: 'Tag', icon: Tag, color: '#F59E0B' },
      { id: 'note', name: 'Note', icon: StickyNote, color: '#FBBF24' },
      { id: 'sparkles', name: 'Sparkles', icon: Sparkles, color: '#A855F7' },
    ],
  },
};

const STOCK_IMAGES = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=300&h=200&fit=crop',
];

const EbookDesignSidebar = ({
  bookTitle, chapters, selectedChapterId, onChapterSelect, onChapterAdd,
  onChapterTitleEdit, onChapterDelete, onChapterReorder, onAddElement,
}: EbookDesignSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(new Set(['content']));
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [imageSearch, setImageSearch] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [elementSearch, setElementSearch] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSection = (id: SectionId) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleStartEdit = (ch: Chapter) => {
    setEditingChapterId(ch.id);
    setEditingValue(ch.title);
  };

  const handleSaveEdit = () => {
    if (editingChapterId && editingValue.trim()) {
      onChapterTitleEdit(editingChapterId, editingValue.trim());
    }
    setEditingChapterId(null);
  };

  const handleDragStart = (i: number) => setDraggedIndex(i);
  const handleDragOver = (e: React.DragEvent, i: number) => { e.preventDefault(); setDragOverIndex(i); };
  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex && onChapterReorder) {
      onChapterReorder(draggedIndex, dragOverIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onAddElement?.('image', { src: url });
    toast.success('Image added to canvas');
  };

  const handleAIAction = (action: AIEditAction) => {
    toast.success(`AI: ${action} applied`);
  };

  if (isCollapsed) {
    return (
      <div className="w-8 border-r border-foreground/[0.04] bg-background flex flex-col items-center py-3">
        <button onClick={() => setIsCollapsed(false)} className="p-1 rounded hover:bg-foreground/[0.05] text-muted-foreground" title="Open Design Panel">
          <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
        </button>
      </div>
    );
  }

  const SectionHeader = ({ id, title, icon: Icon }: { id: SectionId; title: string; icon: any }) => (
    <button onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-foreground/[0.03] transition-colors">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-semibold text-foreground">{title}</span>
      </div>
      {expandedSections.has(id) ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
    </button>
  );

  return (
    <div className="w-72 border-l border-foreground/[0.04] bg-background overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-foreground/[0.04]">
        <span className="text-xs font-bold text-foreground uppercase tracking-wider">Design</span>
        <button onClick={() => setIsCollapsed(true)} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05]" title="Close Panel">
          <ChevronDown className="w-3.5 h-3.5 rotate-90" />
        </button>
      </div>

      {/* Templates */}
      <SectionHeader id="templates" title="Templates" icon={LayoutTemplate} />
      {expandedSections.has('templates') && (
        <div className="px-3 pb-3">
          <div className="grid grid-cols-3 gap-1.5">
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={() => toast.success(`${t.name} template applied`)}
                className="group rounded-lg border border-foreground/[0.06] hover:border-accent/40 overflow-hidden transition-all">
                <div className="aspect-[3/4] flex items-center justify-center" style={{ backgroundColor: t.color }}>
                  <Presentation className="w-5 h-5 text-foreground/30" />
                </div>
                <p className="text-[10px] font-medium text-center py-1 text-foreground">{t.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content / Chapters */}
      <SectionHeader id="content" title="Content" icon={Layers} />
      {expandedSections.has('content') && (
        <div className="px-3 pb-3">
          {/* Outline header */}
          <div className="flex items-center justify-between px-2 py-1.5 mb-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <GripVertical className="w-3 h-3" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Outline</span>
            </div>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Page #</span>
          </div>
          <div className="space-y-1">
            {chapters.map((ch, i) => {
              const isSelected = selectedChapterId === ch.id;
              const isSpecial = ['cover', 'table of contents', 'introduction', 'summary'].includes(ch.type || '');
              return (
                <div key={ch.id}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={e => handleDragOver(e, i)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onChapterSelect(ch.id)}
                  className={`group flex items-center gap-2 px-2 py-2 rounded-lg transition-all cursor-pointer ${
                    isSelected ? 'bg-accent/[0.08] border border-accent/30' : 'hover:bg-foreground/[0.03] border border-transparent'
                  } ${dragOverIndex === i ? 'border-accent/50' : ''}`}>
                  {/* Drag handle - visible on selected/hover */}
                  <GripVertical className={`w-3.5 h-3.5 text-muted-foreground shrink-0 cursor-grab ${isSelected ? 'opacity-50' : 'opacity-0 group-hover:opacity-50'}`} />
                  {/* Page number */}
                  <span className={`text-xs font-semibold shrink-0 w-5 text-center ${
                    isSelected ? 'text-accent' : 'text-muted-foreground'
                  }`}>{i + 1}</span>
                  {/* Title */}
                  {editingChapterId === ch.id ? (
                    <div className="flex-1 flex items-center gap-1">
                      <Input value={editingValue} onChange={e => setEditingValue(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') setEditingChapterId(null); }}
                        className="h-6 text-xs flex-1" autoFocus />
                      <button onClick={handleSaveEdit} className="p-0.5 rounded bg-accent text-white"><Check className="w-3 h-3" /></button>
                      <button onClick={() => setEditingChapterId(null)} className="p-0.5 rounded bg-foreground/[0.1]"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <>
                      {isSpecial ? (
                        <span className="text-xs font-medium text-foreground bg-foreground/[0.05] px-2 py-0.5 rounded truncate">{ch.title}</span>
                      ) : (
                        <span className="text-xs font-medium text-foreground truncate">{ch.title}</span>
                      )}
                      <div className="flex-1" />
                      {/* Hover action buttons */}
                      <div className={`flex items-center gap-0.5 shrink-0 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                        {onChapterReorder && (
                          <>
                            <Tooltip><TooltipTrigger asChild>
                              <button onClick={e => { e.stopPropagation(); if (i > 0) onChapterReorder(i, i - 1); }} className="p-0.5 rounded hover:bg-foreground/[0.08]">
                                <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                            </TooltipTrigger><TooltipContent side="top">Move Up</TooltipContent></Tooltip>
                            <Tooltip><TooltipTrigger asChild>
                              <button onClick={e => { e.stopPropagation(); if (i < chapters.length - 1) onChapterReorder(i, i + 1); }} className="p-0.5 rounded hover:bg-foreground/[0.08]">
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                              </button>
                            </TooltipTrigger><TooltipContent side="top">Move Down</TooltipContent></Tooltip>
                          </>
                        )}
                        <Tooltip><TooltipTrigger asChild>
                          <button onClick={e => { e.stopPropagation(); onChapterAdd(ch.id); }} className="p-0.5 rounded hover:bg-foreground/[0.08]">
                            <Plus className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        </TooltipTrigger><TooltipContent side="top">Add Page After</TooltipContent></Tooltip>
                        <Tooltip><TooltipTrigger asChild>
                          <button onClick={e => { e.stopPropagation(); handleStartEdit(ch); }} className="p-0.5 rounded hover:bg-foreground/[0.08]">
                            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        </TooltipTrigger><TooltipContent side="top">Edit Title</TooltipContent></Tooltip>
                        {onChapterDelete && (
                          <Tooltip><TooltipTrigger asChild>
                            <button onClick={e => { e.stopPropagation(); onChapterDelete(ch.id); }} className="p-0.5 rounded hover:bg-foreground/[0.08]">
                              <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                            </button>
                          </TooltipTrigger><TooltipContent side="top">Delete Page</TooltipContent></Tooltip>
                        )}
                      </div>
                      {/* Page number on right */}
                      <span className={`text-[10px] font-medium shrink-0 w-5 text-right ${isSelected ? 'text-accent' : 'text-muted-foreground'}`}>{i + 1}</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <button onClick={() => onChapterAdd(chapters[chapters.length - 1]?.id || '')}
            className="w-full mt-3 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors">
            <Plus className="w-3.5 h-3.5" />Add Page
          </button>
        </div>
      )}

      {/* Images */}
      <SectionHeader id="image" title="Images" icon={ImageIcon} />
      {expandedSections.has('image') && (
        <div className="px-3 pb-3 space-y-2.5">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input type="text" value={imageSearch} onChange={e => setImageSearch(e.target.value)}
              placeholder="Search stock images..." className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] focus:outline-none focus:border-accent/40" />
          </div>
          {/* AI Generate */}
          <div className="flex gap-1.5">
            <input type="text" value={imagePrompt} onChange={e => setImagePrompt(e.target.value)}
              placeholder="Generate with AI..." className="flex-1 px-2.5 py-1.5 text-xs rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] focus:outline-none focus:border-accent/40" />
            <button onClick={() => { setIsGeneratingImage(true); setTimeout(() => { setIsGeneratingImage(false); toast.success('Image generated'); }, 2000); }}
              disabled={!imagePrompt.trim() || isGeneratingImage}
              className="px-2 py-1.5 rounded-lg bg-accent text-white text-xs disabled:opacity-50">
              {isGeneratingImage ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            </button>
          </div>
          {/* Upload */}
          <button onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-foreground/[0.08] rounded-lg text-[10px] text-muted-foreground hover:border-accent/40 hover:text-accent">
            <Upload className="w-3 h-3" />Upload Image
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          {/* Stock grid */}
          <div className="grid grid-cols-2 gap-1.5">
            {STOCK_IMAGES.map((src, i) => (
              <button key={i} onClick={() => { onAddElement?.('image', { src }); toast.success('Image added'); }}
                className="rounded-lg overflow-hidden border border-foreground/[0.06] hover:border-accent/40 transition-colors">
                <img src={src} alt="" className="w-full h-20 object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Text */}
      <SectionHeader id="text" title="Text" icon={Type} />
      {expandedSections.has('text') && (
        <div className="px-3 pb-3 space-y-1.5">
          {[
            { label: 'Heading', size: '24px', weight: 'bold' },
            { label: 'Subheading', size: '18px', weight: '600' },
            { label: 'Body Text', size: '14px', weight: 'normal' },
            { label: 'Caption', size: '11px', weight: 'normal' },
          ].map(t => (
            <button key={t.label} onClick={() => { onAddElement?.('text', { content: t.label, fontSize: parseInt(t.size) }); toast.success(`${t.label} added`); }}
              className="w-full text-left px-3 py-2 rounded-lg border border-foreground/[0.06] hover:border-accent/40 transition-colors">
              <span style={{ fontSize: t.size, fontWeight: t.weight as any }} className="text-foreground">{t.label}</span>
            </button>
          ))}
          <div className="pt-1">
            <AITextEditMenu onAction={handleAIAction}
              trigger={
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-accent/20 bg-accent/5 hover:bg-accent/10 transition-colors">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-medium text-accent">AI Text Tools</span>
                </button>
              } />
          </div>
        </div>
      )}

      {/* Elements */}
      <SectionHeader id="elements" title="Elements" icon={LayoutGrid} />
      {expandedSections.has('elements') && (
        <div className="px-3 pb-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input type="text" value={elementSearch} onChange={e => setElementSearch(e.target.value)}
              placeholder="Search elements..." className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] focus:outline-none focus:border-accent/40" />
          </div>
          {Object.entries(ELEMENT_CATEGORIES).map(([key, cat]) => {
            const filtered = cat.items.filter(i => !elementSearch || i.name.toLowerCase().includes(elementSearch.toLowerCase()));
            if (filtered.length === 0) return null;
            return (
              <div key={key}>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{cat.title}</p>
                <div className="grid grid-cols-4 gap-1">
                  {filtered.map(item => (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        <button onClick={() => { onAddElement?.(item.id, item); toast.success(`${item.name} added`); }}
                          className="flex flex-col items-center gap-0.5 p-2 rounded-lg border border-foreground/[0.04] hover:border-accent/30 hover:bg-accent/5 transition-colors">
                          <item.icon className="w-4 h-4" style={{ color: item.color }} />
                          <span className="text-[8px] text-muted-foreground truncate w-full text-center">{item.name}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>{item.name}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video */}
      <SectionHeader id="video" title="Video" icon={MonitorPlay} />
      {expandedSections.has('video') && (
        <div className="px-3 pb-3 space-y-2">
          <button onClick={() => { onAddElement?.('video', {}); toast.success('Video placeholder added'); }}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-foreground/[0.08] rounded-lg text-xs text-muted-foreground hover:border-accent/40 hover:text-accent">
            <Upload className="w-3.5 h-3.5" />Upload Video
          </button>
          <button onClick={() => toast.success('Embed link coming soon')}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-foreground/[0.08] rounded-lg text-xs text-muted-foreground hover:border-accent/40 hover:text-accent">
            <ExternalLink className="w-3.5 h-3.5" />Embed Video URL
          </button>
        </div>
      )}

      {/* Audio */}
      <SectionHeader id="audio" title="Audio" icon={AudioLines} />
      {expandedSections.has('audio') && (
        <div className="px-3 pb-3 space-y-2">
          <button onClick={() => { onAddElement?.('audio', {}); toast.success('Audio placeholder added'); }}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-foreground/[0.08] rounded-lg text-xs text-muted-foreground hover:border-accent/40 hover:text-accent">
            <Upload className="w-3.5 h-3.5" />Upload Audio
          </button>
          <button onClick={() => toast.success('Record audio coming soon')}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-foreground/[0.08] rounded-lg text-xs text-muted-foreground hover:border-accent/40 hover:text-accent">
            <Music className="w-3.5 h-3.5" />Record Audio
          </button>
        </div>
      )}

      {/* Interactive */}
      <SectionHeader id="interactive" title="Interactive" icon={MousePointerClick} />
      {expandedSections.has('interactive') && (
        <div className="px-3 pb-3 space-y-1.5">
          {[
            { id: 'button', label: 'Button', desc: 'Clickable CTA button' },
            { id: 'link', label: 'Hyperlink', desc: 'External or internal link' },
            { id: 'form', label: 'Form Field', desc: 'Input or text area' },
            { id: 'quiz', label: 'Quiz', desc: 'Interactive quiz element' },
          ].map(item => (
            <button key={item.id} onClick={() => { onAddElement?.(item.id, {}); toast.success(`${item.label} added`); }}
              className="w-full text-left px-3 py-2 rounded-lg border border-foreground/[0.06] hover:border-accent/40 transition-colors">
              <span className="text-xs font-medium text-foreground">{item.label}</span>
              <p className="text-[10px] text-muted-foreground">{item.desc}</p>
            </button>
          ))}
        </div>
      )}

      {/* Mockups */}
      <SectionHeader id="mockups" title="Mockups" icon={Layers3} />
      {expandedSections.has('mockups') && (
        <div className="px-3 pb-3">
          <div className="grid grid-cols-2 gap-1.5">
            {['Phone', 'Laptop', 'Tablet', 'Book'].map(m => (
              <button key={m} onClick={() => { onAddElement?.('mockup', { type: m.toLowerCase() }); toast.success(`${m} mockup added`); }}
                className="flex flex-col items-center gap-1 p-3 rounded-lg border border-foreground/[0.06] hover:border-accent/40 transition-colors">
                <Layers3 className="w-5 h-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">{m}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Translate */}
      <SectionHeader id="translate" title="Translate" icon={Languages} />
      {expandedSections.has('translate') && (
        <div className="px-3 pb-3 space-y-2">
          <p className="text-[10px] text-muted-foreground">Translate all text content to another language.</p>
          {['Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Arabic'].map(lang => (
            <button key={lang} onClick={() => toast.success(`Translating to ${lang}...`)}
              className="w-full text-left px-3 py-2 rounded-lg border border-foreground/[0.06] hover:border-accent/40 transition-colors text-xs text-foreground">
              {lang}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default EbookDesignSidebar;

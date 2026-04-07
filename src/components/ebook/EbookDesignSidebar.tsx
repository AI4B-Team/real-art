import { useState, useRef, useEffect } from 'react';
import {
  ChevronDown, ChevronUp, Layers, FileText, Image as ImageIcon,
  Plus, Pencil, Search, Sparkles, Send, Upload, Loader2,
  Type, QrCode, Video, Music, Table, CheckSquare,
  Square, Circle, Triangle, Star, Hexagon, Diamond, Pentagon,
  ArrowRight, ArrowDown, BarChart3, LineChart, PieChart,
  Smile, Tag, StickyNote, ExternalLink, MapPin,
  GripVertical, Trash2, X, Check, Lock,
  LayoutGrid, LayoutTemplate, Presentation,
  MonitorPlay, AudioLines, MousePointerClick, Layers3, Languages,
  Shuffle, SlidersHorizontal, Play, Users, Library,
  Brain, Award, BookOpen, TrendingUp, HelpCircle, Zap, ListChecks, GitBranch,
  Palette,
} from 'lucide-react';
import AIVAPanel from './AIVAPanel';
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
  type?: 'cover' | 'back' | 'table of contents' | 'introduction' | 'summary' | null;
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
  onSectionChange?: (sections: Set<string>) => void;
  openSection?: SectionId | null;
  onTranslate?: (scope: 'page' | 'selected' | 'book', language: string) => void;
  onReplaceImage?: ((src: string) => void) | null;
  onAIClick?: () => void;
  sidebarMode?: 'design' | 'ai';
  onSidebarModeChange?: (mode: 'design' | 'ai') => void;
  selectedPageTitle?: string;
  pageCount?: number;
  pageIndex?: number;
  onOpenImageSection?: () => void;
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
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=200&fit=crop',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=200&fit=crop',
];

const COMMUNITY_IMAGES = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&h=300&fit=crop',
];

const CREATION_IMAGES = [
  'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1633177317976-3f9bc45e1d1d?w=300&h=300&fit=crop',
  'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=300&h=300&fit=crop',
];

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
];

const TranslatePanel = ({ onTranslate }: { onTranslate?: (scope: 'page' | 'selected' | 'book', language: string) => void }) => {
  const [selectedLang, setSelectedLang] = useState('');
  const [scope, setScope] = useState<'page' | 'selected' | 'book'>('page');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = LANGUAGES.filter(l => l.name.toLowerCase().includes(search.toLowerCase()));
  const selectedLabel = LANGUAGES.find(l => l.code === selectedLang);

  return (
    <div className="px-3 pb-3 pt-2 space-y-3">
      <p className="text-xs font-semibold text-foreground">Translate To</p>
      <div className="relative">
        <button onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-foreground/[0.1] bg-foreground/[0.02] text-xs text-foreground hover:border-foreground/[0.2] transition-colors">
          <span>{selectedLabel ? `${selectedLabel.flag} ${selectedLabel.name}` : 'Select Language'}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-background border border-foreground/[0.1] rounded-lg shadow-lg max-h-48 overflow-hidden">
            <div className="p-1.5 border-b border-foreground/[0.06]">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search languages..."
                className="w-full px-2 py-1.5 text-xs rounded border border-foreground/[0.08] bg-foreground/[0.02] focus:outline-none focus:border-accent/40" autoFocus />
            </div>
            <div className="overflow-auto max-h-36 p-1">
              {filtered.map(lang => (
                <button key={lang.code} onClick={() => { setSelectedLang(lang.code); setIsOpen(false); setSearch(''); }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-left transition-colors ${selectedLang === lang.code ? 'bg-accent/10 text-accent font-medium' : 'hover:bg-foreground/[0.04]'}`}>
                  <span>{lang.flag}</span><span>{lang.name}</span>
                </button>
              ))}
              {filtered.length === 0 && <p className="text-[10px] text-muted-foreground text-center py-2">No languages found</p>}
            </div>
          </div>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground">Automatically Detect Current Language (<button type="button" onClick={() => { if (onTranslate) onTranslate('page', '__detect__'); }} className="text-accent hover:underline font-medium">Edit</button>)</p>
      <div className="space-y-1.5">
        {([
          { value: 'page' as const, label: 'Translate Page' },
          { value: 'book' as const, label: 'Translate Entire Book' },
          { value: 'selected' as const, label: 'Translate Selected Text' },
        ]).map(opt => (
          <button key={opt.value} onClick={() => setScope(opt.value)}
            className="w-full flex items-center gap-2.5 px-1 py-1.5 text-xs text-foreground rounded hover:bg-foreground/[0.03] transition-colors">
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${scope === opt.value ? 'border-accent' : 'border-foreground/20'}`}>
              {scope === opt.value && <div className="w-2 h-2 rounded-full bg-accent" />}
            </div>
            {opt.label}
          </button>
        ))}
      </div>
      <button
        onClick={() => {
          if (!selectedLang) { toast.error('Please select a language first'); return; }
          if (onTranslate) onTranslate(scope, LANGUAGES.find(l => l.code === selectedLang)!.name);
        }}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors cursor-pointer">
        <Sparkles className="w-3.5 h-3.5" />Translate
      </button>
    </div>
  );
};

const MOCKUP_CATEGORIES = [
  {
    name: 'eBook Covers',
    items: [
      { id: 'ebook-hardcover', label: 'Hardcover' },
      { id: 'ebook-softcover', label: 'Softcover' },
      { id: 'ebook-3d-spread', label: '3D Spread' },
    ],
  },
  {
    name: 'Magazines',
    items: [
      { id: 'mag-cover', label: 'Cover' },
      { id: 'mag-open', label: 'Open Spread' },
      { id: 'mag-stack', label: 'Stack' },
    ],
  },
  {
    name: 'Reports',
    items: [
      { id: 'report-cover', label: 'Cover' },
      { id: 'report-pages', label: 'Pages' },
      { id: 'report-stack', label: 'Stack' },
    ],
  },
  {
    name: 'Social Media',
    items: [
      { id: 'social-phone', label: 'Phone' },
      { id: 'social-tablet', label: 'Tablet' },
      { id: 'social-laptop', label: 'Laptop' },
    ],
  },
  {
    name: 'Advertisements',
    items: [
      { id: 'ad-billboard', label: 'Billboard' },
      { id: 'ad-poster', label: 'Poster' },
      { id: 'ad-banner', label: 'Banner' },
    ],
  },
];

const MockupsPanel = ({ onAddElement }: { onAddElement?: (type: string, data?: any) => void }) => {
  const [tab, setTab] = useState<'mockups' | 'scenes'>('mockups');
  const [search, setSearch] = useState('');

  const filtered = MOCKUP_CATEGORIES.filter(cat =>
    !search || cat.name.toLowerCase().includes(search.toLowerCase()) || cat.items.some(i => i.label.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="px-3 pt-2 pb-3 space-y-3">
      {/* Tabs */}
      <div className="flex gap-1.5">
        {(['mockups', 'scenes'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${tab === t ? 'bg-accent text-white' : 'bg-foreground/[0.06] text-muted-foreground hover:text-foreground'}`}>
            {t === 'mockups' ? 'Mockups' : 'Scenes'}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
          className="w-full pl-8 pr-3 py-2 rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] text-xs focus:outline-none focus:border-accent/40 transition-colors" />
      </div>

      {tab === 'mockups' ? (
        <div className="space-y-5">
          {filtered.map(cat => (
            <div key={cat.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-foreground">{cat.name}</span>
                <button className="text-[10px] font-semibold text-accent hover:text-accent/80 transition-colors">View all</button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {cat.items.map(item => (
                  <button key={item.id} onClick={() => { onAddElement?.('mockup', { type: item.id }); toast.success(`${item.label} mockup added`); }}
                    className="aspect-[3/4] rounded-lg bg-foreground/[0.04] border border-foreground/[0.06] hover:border-accent/40 hover:bg-foreground/[0.06] transition-all flex items-center justify-center group">
                    <Layers3 className="w-5 h-5 text-muted-foreground/40 group-hover:text-accent/60 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {[{ name: 'Studio', items: ['White', 'Dark', 'Gradient'] }, { name: 'Lifestyle', items: ['Desk', 'Café', 'Outdoor'] }].map(cat => (
            <div key={cat.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-foreground">{cat.name}</span>
                <button className="text-[10px] font-semibold text-accent hover:text-accent/80 transition-colors">View all</button>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {cat.items.map(item => (
                  <button key={item} onClick={() => { onAddElement?.('mockup', { type: 'scene', scene: item.toLowerCase() }); toast.success(`${item} scene added`); }}
                    className="aspect-[3/4] rounded-lg bg-foreground/[0.04] border border-foreground/[0.06] hover:border-accent/40 hover:bg-foreground/[0.06] transition-all flex items-center justify-center group">
                    <Layers3 className="w-5 h-5 text-muted-foreground/40 group-hover:text-accent/60 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const STOCK_VIDEOS = [
  { thumb: 'photo-1557804506-669a67965ba0', title: 'Business Meeting', duration: '0:15' },
  { thumb: 'photo-1552664730-d307ca884978', title: 'Team Collaboration', duration: '0:24' },
  { thumb: 'photo-1460925895917-afdab827c52f', title: 'Data Analytics', duration: '0:12' },
  { thumb: 'photo-1522071820081-009f0129c71c', title: 'Creative Workshop', duration: '0:17' },
  { thumb: 'photo-1507003211169-0a1dd7228f2d', title: 'Professional Portrait', duration: '0:11' },
  { thumb: 'photo-1553877522-43269d4ea984', title: 'Tech Office', duration: '0:11' },
];

const STOCK_AUDIO = [
  { title: 'Upbeat Corporate', duration: '2:30' },
  { title: 'Calm Ambient', duration: '3:15' },
  { title: 'Inspiring Piano', duration: '2:45' },
  { title: 'Tech Innovation', duration: '2:00' },
  { title: 'Soft Background', duration: '4:00' },
  { title: 'Energetic Beat', duration: '1:45' },
];

type MediaTab = 'stock' | 'creations' | 'community' | 'uploads';

const MediaTabs = ({ active, onChange, stockIcon }: { active: MediaTab; onChange: (t: MediaTab) => void; stockIcon?: React.ComponentType<any> }) => (
  <div className="flex items-center gap-0.5 border-b border-foreground/[0.06] mt-3 mb-2">
    {([
      { id: 'stock' as const, label: 'Stock', icon: stockIcon || Library },
      { id: 'creations' as const, label: 'Creations', icon: Sparkles },
      { id: 'community' as const, label: 'Community', icon: Users },
      { id: 'uploads' as const, label: 'Uploads', icon: Upload },
    ]).map(tab => (
      <button key={tab.id} onClick={() => onChange(tab.id)}
        className={`flex items-center gap-1 px-2 py-2 text-[10px] font-medium transition-colors border-b-2 ${active === tab.id ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
        <tab.icon className="w-3 h-3" />{tab.label}
      </button>
    ))}
  </div>
);

const VideoPanel = ({ onAddElement }: { onAddElement?: (type: string, data?: any) => void }) => {
  const [tab, setTab] = useState<MediaTab>('stock');
  const [search, setSearch] = useState('');

  const filtered = STOCK_VIDEOS.filter(v => !search || v.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="px-3 pb-3">
      <MediaTabs active={tab} onChange={setTab} stockIcon={Video} />
      <div className="relative mb-2">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Press [Enter] To Search"
          className="w-full pl-8 pr-3 py-2 rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] text-xs focus:outline-none focus:border-accent/40 transition-colors" />
      </div>
      {tab === 'stock' ? (
        <div className="grid grid-cols-2 gap-1.5">
          {filtered.map((v, i) => (
            <button key={i} onClick={() => { onAddElement?.('video', { src: v.thumb }); toast.success(`${v.title} added`); }}
              className="relative rounded-lg overflow-hidden group aspect-video">
              <img src={`https://images.unsplash.com/${v.thumb}?w=300&h=200&fit=crop&q=80`} alt={v.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-foreground/40 flex items-center justify-center backdrop-blur-sm">
                  <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                </div>
              </div>
              <span className="absolute bottom-1 right-1.5 text-[9px] text-white bg-foreground/60 px-1 py-0.5 rounded backdrop-blur-sm">{v.duration}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Upload className="w-6 h-6 text-muted-foreground/40 mb-2" />
          <p className="text-[10px] text-muted-foreground">No {tab} videos yet</p>
        </div>
      )}
    </div>
  );
};

const AudioPanel = ({ onAddElement }: { onAddElement?: (type: string, data?: any) => void }) => {
  const [tab, setTab] = useState<MediaTab>('stock');
  const [search, setSearch] = useState('');
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);

  const filtered = STOCK_AUDIO.filter(a => !search || a.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="px-3 pb-3">
      <MediaTabs active={tab} onChange={setTab} stockIcon={Music} />
      <div className="relative mb-2">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Press [Enter] To Search"
          className="w-full pl-8 pr-3 py-2 rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] text-xs focus:outline-none focus:border-accent/40 transition-colors" />
      </div>
      {tab === 'stock' ? (
        <div className="space-y-1.5">
          {filtered.map((a, i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border border-foreground/[0.06] hover:border-foreground/[0.12] transition-colors group">
              <button onClick={() => setPlayingIdx(playingIdx === i ? null : i)}
                className="w-10 h-10 rounded-full bg-accent/80 hover:bg-accent flex items-center justify-center shrink-0 transition-colors">
                <Play className={`w-4 h-4 text-white fill-white ${playingIdx === i ? '' : 'ml-0.5'}`} />
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{a.title}</p>
                <p className="text-[10px] text-muted-foreground">{a.duration}</p>
              </div>
              <button onClick={() => { onAddElement?.('audio', { title: a.title }); toast.success(`${a.title} added`); }}
                className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors opacity-0 group-hover:opacity-100">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Upload className="w-6 h-6 text-muted-foreground/40 mb-2" />
          <p className="text-[10px] text-muted-foreground">No {tab} audio yet</p>
        </div>
      )}
    </div>
  );
};

const INTERACTIVE_TYPES = [
  { id: 'flashcards', label: 'Flashcards', desc: 'Study cards', icon: Brain, color: '#F59E0B' },
  { id: 'quiz', label: 'Quizzes', desc: 'Test knowledge', icon: CheckSquare, color: '#8B5CF6' },
  { id: 'course', label: 'Courses', desc: 'Structured lessons', icon: BookOpen, color: '#3B82F6' },
  { id: 'certificate', label: 'Certificates', desc: 'Completion awards', icon: Award, color: '#10B981' },
];

const QUICK_ADD_ELEMENTS = [
  { id: 'progress-tracker', label: 'Progress Tracker', desc: 'Show learning progress', icon: TrendingUp, color: '#14B8A6' },
  { id: 'knowledge-check', label: 'Knowledge Check', desc: 'Quick comprehension test', icon: HelpCircle, color: '#F43F5E' },
  { id: 'interactive-exercise', label: 'Interactive Exercise', desc: 'Hands-on practice', icon: Zap, color: '#A855F7' },
  { id: 'sorting-activity', label: 'Sorting Activity', desc: 'Drag & drop categorization', icon: Shuffle, color: '#F97316' },
  { id: 'matching', label: 'Matching', desc: 'Connect related items', icon: GitBranch, color: '#6366F1' },
  { id: 'checklist', label: 'Checklist', desc: 'Step-by-step tasks', icon: ListChecks, color: '#0EA5E9' },
  { id: 'fill-in-blank', label: 'Fill in the Blank', desc: 'Complete the sentence', icon: Type, color: '#EC4899' },
  { id: 'timeline', label: 'Timeline', desc: 'Chronological events', icon: ArrowDown, color: '#06B6D4' },
  { id: 'rating-scale', label: 'Rating Scale', desc: 'Self-assessment scale', icon: Star, color: '#EAB308' },
  { id: 'accordion', label: 'Accordion', desc: 'Expandable sections', icon: Layers, color: '#64748B' },
];

const InteractivePanel = ({ onAddElement }: { onAddElement?: (type: string, data?: any) => void }) => {
  const addInteractive = (subType: string) => {
    onAddElement?.('interactive', { interactiveType: subType });
    toast.success(`${subType.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} added`);
  };

  return (
    <div className="px-3 pb-3 space-y-4">
      <p className="text-[10px] text-muted-foreground">Add interactive learning elements to your eBook</p>

      {/* Main interactive types grid */}
      <div className="grid grid-cols-2 gap-2">
        {INTERACTIVE_TYPES.map(item => (
          <button key={item.id} onClick={() => addInteractive(item.id)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-foreground/[0.08] hover:border-accent/30 hover:shadow-sm transition-all group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${item.color}15` }}>
              <item.icon className="w-5 h-5" style={{ color: item.color }} />
            </div>
            <div className="text-center">
              <span className="text-xs font-semibold text-foreground block">{item.label}</span>
              <span className="text-[10px] text-muted-foreground">{item.desc}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Quick Add Elements */}
      <div>
        <p className="text-xs font-bold text-foreground mb-2">Quick Add Elements</p>
        <div className="space-y-1.5">
          {QUICK_ADD_ELEMENTS.map(item => (
            <button key={item.id} onClick={() => addInteractive(item.id)}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-foreground/[0.06] hover:border-foreground/[0.12] hover:shadow-sm transition-all group">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${item.color}15` }}>
                <item.icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <span className="text-xs font-medium text-foreground block">{item.label}</span>
                <span className="text-[10px] text-muted-foreground">{item.desc}</span>
              </div>
              <Plus className="w-4 h-4 text-muted-foreground/40 group-hover:text-accent transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* AI Generate section */}
      <div className="rounded-xl border border-accent/20 bg-accent/[0.03] p-3 space-y-2.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-xs font-semibold text-accent">AI Generate</span>
        </div>
        <p className="text-[10px] text-muted-foreground">Automatically generate learning content from your eBook text</p>
        <button onClick={() => addInteractive('flashcards')}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-accent/20 bg-background hover:bg-accent/[0.05] text-xs font-semibold text-accent transition-colors">
          <Brain className="w-3.5 h-3.5" />Generate Flashcards
        </button>
        <button onClick={() => addInteractive('quiz')}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-accent/20 bg-background hover:bg-accent/[0.05] text-xs font-semibold text-accent transition-colors">
          <CheckSquare className="w-3.5 h-3.5" />Generate Quiz
        </button>
      </div>
    </div>
  );
};

const EbookDesignSidebar = ({
  bookTitle, chapters, selectedChapterId, onChapterSelect, onChapterAdd,
  onChapterTitleEdit, onChapterDelete, onChapterReorder, onAddElement, onSectionChange, openSection, onTranslate, onReplaceImage, onAIClick,
  sidebarMode = 'design', onSidebarModeChange, selectedPageTitle, pageCount, pageIndex, onOpenImageSection,
}: EbookDesignSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<SectionId>>(new Set(['content']));
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [imageSearch, setImageSearch] = useState('');
  const [imageTab, setImageTab] = useState<'stock' | 'creations' | 'community' | 'uploads'>('stock');
  const [imagePrompt, setImagePrompt] = useState('');
  const [elementSearch, setElementSearch] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Respond to external openSection prop
  useEffect(() => {
    if (openSection) {
      setExpandedSections(new Set<SectionId>([openSection]));
      if (isCollapsed) setIsCollapsed(false);
    }
  }, [openSection]);

  const toggleSection = (id: SectionId) => {
    setExpandedSections(prev => {
      if (prev.has(id)) {
        // Close if already open
        const next = new Set<SectionId>();
        onSectionChange?.(next as Set<string>);
        return next;
      }
      // Open only this one, close all others
      const next = new Set<SectionId>([id]);
      onSectionChange?.(next as Set<string>);
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
    if (onReplaceImage) { onReplaceImage(url); } else { onAddElement?.('image', { src: url }); toast.success('Image added to canvas'); }
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
      className={`w-full flex items-center justify-between px-3 py-2.5 transition-colors ${expandedSections.has(id) ? 'bg-foreground/[0.12] border-l-2 border-l-accent' : 'hover:bg-foreground/[0.03] border-l-2 border-l-transparent'}`}>
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-semibold text-foreground">{title}</span>
      </div>
      {expandedSections.has(id) ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
    </button>
  );

  return (
    <div className="w-80 border-l border-foreground/[0.04] bg-background flex flex-col" style={{ height: '100%' }}>
      {/* Mode toggle tabs: Design | AI */}
      <div className="flex border-b border-foreground/[0.04] shrink-0">
        <button onClick={() => onSidebarModeChange?.('design')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all ${sidebarMode === 'design' ? 'bg-foreground/[0.12] text-foreground border-b-2 border-b-accent' : 'text-muted-foreground hover:bg-foreground/[0.04]'}`}>
          <Palette className="w-3.5 h-3.5" /> Design
        </button>
        <button onClick={() => onSidebarModeChange?.('ai')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all ${sidebarMode === 'ai' ? 'bg-foreground/[0.12] text-foreground border-b-2 border-b-accent' : 'text-muted-foreground hover:bg-foreground/[0.04]'}`}>
          <Sparkles className="w-3.5 h-3.5" /> AI
        </button>
      </div>

      {/* AI Mode: AIVA Panel */}
      {sidebarMode === 'ai' && (
        <AIVAPanel
          selectedPageId={selectedChapterId}
          selectedPageTitle={selectedPageTitle || chapters.find(c => c.id === selectedChapterId)?.title}
          pageCount={pageCount || chapters.length}
          pageIndex={pageIndex ?? chapters.findIndex(c => c.id === selectedChapterId)}
          onOpenImageSection={onOpenImageSection}
        />
      )}

      {/* Design Mode */}
      {sidebarMode === 'design' && (<>
      {/* ─── Smart Action Row ─── */}
      <div className="px-3 pt-3 pb-2 border-b border-foreground/[0.04]">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3 h-3 text-accent" />
          <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Recommended Next</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'Add Headline', action: () => { onAddElement?.('text', { content: 'Headline', fontSize: 24 }); toast.success('Headline added'); } },
            { label: 'Add Image', action: () => { onAddElement?.('image'); toast.success('Image added'); } },
            { label: 'Add Section', action: () => { onAddElement?.('text', { content: 'New section content', fontSize: 14 }); toast.success('Section added'); } },
          ].map(btn => (
            <button key={btn.label} onClick={btn.action}
              className="px-2.5 py-1.5 rounded-lg bg-accent/[0.06] border border-accent/20 text-[10px] font-semibold text-accent hover:bg-accent/[0.12] transition-colors">
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── STRUCTURE ─── */}
      <div className="flex-1 overflow-y-auto">
      <div className="px-3 pt-3 pb-1">
        <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-[0.12em]">Structure</span>
      </div>

      {/* Templates */}
      <SectionHeader id="templates" title="Templates" icon={LayoutTemplate} />
      {expandedSections.has('templates') && (
        <div className="px-3 pb-3 pt-2">
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
          <div className="space-y-0.5">
            {chapters.map((ch, i) => {
              const isSelected = selectedChapterId === ch.id;
              const isSpecial = ['cover', 'back', 'table of contents', 'introduction', 'summary'].includes(ch.type || '');
              const isCoverOrBack = ch.type === 'cover' || ch.type === 'back';
              const isDragged = draggedIndex === i;
              const isDropTarget = dragOverIndex === i && draggedIndex !== null && draggedIndex !== i;
              const dropAbove = isDropTarget && draggedIndex !== null && draggedIndex > i;
              const dropBelow = isDropTarget && draggedIndex !== null && draggedIndex < i;
              return (
                <div key={ch.id} className="relative">
                  {/* Drop indicator line — above */}
                  {dropAbove && (
                    <div className="absolute -top-0.5 left-2 right-2 h-0.5 bg-accent rounded-full z-10" />
                  )}
                  <div
                    draggable={!isCoverOrBack}
                    onDragStart={() => { if (!isCoverOrBack) handleDragStart(i); }}
                    onDragOver={e => handleDragOver(e, i)}
                    onDragEnd={handleDragEnd}
                    onDragLeave={() => { if (dragOverIndex === i) setDragOverIndex(null); }}
                    onClick={() => onChapterSelect(ch.id)}
                    className={`group flex items-center gap-2 px-2 py-2 rounded-lg transition-all cursor-pointer ${
                      isDragged ? 'opacity-40 scale-95 bg-accent/5 border border-accent/20' :
                      isSelected ? 'bg-accent/[0.08] border border-accent/30' : 'hover:bg-foreground/[0.03] border border-transparent'
                    } ${isDropTarget ? 'bg-accent/[0.06]' : ''}`}>
                  {/* Drag handle or lock icon for cover/back */}
                  {isCoverOrBack ? (
                    <Lock className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                  ) : (
                    <GripVertical className={`w-3.5 h-3.5 text-muted-foreground shrink-0 cursor-grab ${isSelected ? 'opacity-50' : 'opacity-0 group-hover:opacity-50'}`} />
                  )}
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
                      <div className="flex-1 min-w-0">
                        {isSpecial ? (
                          <span className="block text-xs font-medium text-foreground bg-foreground/[0.05] px-2 py-0.5 rounded whitespace-nowrap overflow-hidden text-ellipsis">
                            {ch.title}
                          </span>
                        ) : (
                          <span className="block text-xs font-medium text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                            {ch.title}
                          </span>
                        )}
                      </div>
                      {/* Hover action buttons */}
                      {!isCoverOrBack && (
                      <div className="flex items-center gap-0.5 shrink-0 max-w-0 opacity-0 overflow-hidden pointer-events-none group-hover:max-w-[132px] group-hover:opacity-100 group-hover:ml-1 group-hover:pointer-events-auto transition-[max-width,opacity,margin] duration-200">
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
                      )}
                      {/* Page number on right */}
                      <span className={`text-[10px] font-medium shrink-0 w-5 text-right ${isSelected ? 'text-accent' : 'text-muted-foreground'}`}>{i + 1}</span>
                    </>
                  )}
                  </div>
                  {/* Drop indicator line — below */}
                  {dropBelow && (
                    <div className="absolute -bottom-0.5 left-2 right-2 h-0.5 bg-accent rounded-full z-10" />
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

      {/* ─── CREATE ─── */}
      <div className="px-3 pt-4 pb-1 border-t border-foreground/[0.04]">
        <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-[0.12em]">Create</span>
      </div>

      {/* Text */}
      <SectionHeader id="text" title="Text" icon={Type} />
      {expandedSections.has('text') && (
        <div className="px-3 pb-3 pt-2 space-y-1.5">
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
        <div className="px-3 pb-3 pt-2 space-y-3">
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

      {/* ─── UPGRADE ─── */}
      <div className="px-3 pt-4 pb-1 border-t border-foreground/[0.04]">
        <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-[0.12em]">Upgrade</span>
      </div>

      {/* Images */}
      <SectionHeader id="image" title="Image" icon={ImageIcon} />
      {expandedSections.has('image') && (
        <div className="px-3 pb-3 pt-2 space-y-2.5">
          <div className="flex items-center gap-3 text-xs border-b border-foreground/[0.06] pb-1.5">
            {([
              { id: 'stock' as const, icon: ImageIcon, label: 'Stock' },
              { id: 'creations' as const, icon: Sparkles, label: 'Creations' },
              { id: 'community' as const, icon: Layers, label: 'Community' },
              { id: 'uploads' as const, icon: Upload, label: 'Uploads' },
            ]).map(tab => (
              <button key={tab.id} onClick={() => setImageTab(tab.id)}
                className={`flex items-center gap-1 pb-1 transition-colors ${imageTab === tab.id ? 'text-accent font-medium border-b-2 border-accent' : 'text-muted-foreground hover:text-foreground'}`}>
                <tab.icon className="w-3 h-3" />{tab.label}
              </button>
            ))}
          </div>
          {(imageTab === 'stock' || imageTab === 'community') && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input type="text" value={imageSearch} onChange={e => setImageSearch(e.target.value)}
                placeholder="Press [Enter] To Search" className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-foreground/[0.08] bg-foreground/[0.02] focus:outline-none focus:border-accent/40" />
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          {imageTab === 'stock' && (
            <div className="grid grid-cols-3 gap-1.5">
              {STOCK_IMAGES.map((src, i) => (
                <button key={i} onClick={() => { if (onReplaceImage) { onReplaceImage(src); } else { onAddElement?.('image', { src }); toast.success('Image added'); } }}
                  className="rounded-lg overflow-hidden border border-foreground/[0.06] hover:border-accent/40 transition-colors aspect-square">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {imageTab === 'creations' && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <Sparkles className="w-4 h-4 text-accent" />Generate Image
              </div>
              <div className="border border-accent/30 rounded-xl p-3 space-y-2.5 bg-accent/[0.02]">
                <div className="flex items-start gap-2">
                  <button className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 hover:bg-accent/20 transition-colors" title="Image-To-Prompt">
                    <ImageIcon className="w-4 h-4 text-accent" />
                  </button>
                  <textarea value={imagePrompt} onChange={e => setImagePrompt(e.target.value)}
                    placeholder="Describe the image you want to create..."
                    rows={2}
                    className="flex-1 text-xs bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground" />
                </div>
                <div className="flex items-center gap-1.5">
                  <button className="w-8 h-8 rounded-lg bg-foreground/[0.05] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/[0.08] transition-colors" title="Auto Prompt">
                    <Shuffle className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 rounded-lg bg-foreground/[0.05] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/[0.08] transition-colors" title="Tools">
                    <SlidersHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {CREATION_IMAGES.map((src, i) => (
                  <button key={i} onClick={() => { if (onReplaceImage) { onReplaceImage(src); } else { onAddElement?.('image', { src }); toast.success('Image added'); } }}
                    className="rounded-lg overflow-hidden border border-foreground/[0.06] hover:border-accent/40 transition-colors aspect-square">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
          {imageTab === 'community' && (
            <div className="grid grid-cols-3 gap-1.5">
              {COMMUNITY_IMAGES.map((src, i) => (
                <button key={i} onClick={() => { onAddElement?.('image', { src }); toast.success('Image added'); }}
                  className="rounded-lg overflow-hidden border border-foreground/[0.06] hover:border-accent/40 transition-colors aspect-square">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {imageTab === 'uploads' && (
            <div className="space-y-4">
              <button onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-foreground/[0.12] rounded-lg text-sm text-muted-foreground hover:border-accent/40 hover:text-accent transition-colors">
                <Upload className="w-4 h-4" />Upload Images
              </button>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Upload className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No uploaded images</p>
                <p className="text-xs text-muted-foreground/60">Upload your own images</p>
              </div>
            </div>
          )}
          {(imageTab === 'stock' || imageTab === 'community') && (
            <button className="w-full text-center text-xs text-accent hover:underline py-1">Load More</button>
          )}
        </div>
      )}

      {/* Video */}
      <SectionHeader id="video" title="Video" icon={MonitorPlay} />
      {expandedSections.has('video') && (
        <VideoPanel onAddElement={onAddElement} />
      )}

      {/* Audio */}
      <SectionHeader id="audio" title="Audio" icon={AudioLines} />
      {expandedSections.has('audio') && (
        <AudioPanel onAddElement={onAddElement} />
      )}

      {/* Interactive */}
      <SectionHeader id="interactive" title="Interactive" icon={MousePointerClick} />
      {expandedSections.has('interactive') && (
        <InteractivePanel onAddElement={onAddElement} />
      )}

      {/* ─── ADVANCED (collapsed by default) ─── */}
      <div className="px-3 pt-4 pb-1 border-t border-foreground/[0.04]">
        <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-[0.12em]">Advanced</span>
      </div>

      {/* Translate */}
      <SectionHeader id="translate" title="Translate" icon={Languages} />
      {expandedSections.has('translate') && (
        <TranslatePanel onTranslate={onTranslate} />
      )}
      </div>
      </>)}
    </div>
  );
};

export default EbookDesignSidebar;

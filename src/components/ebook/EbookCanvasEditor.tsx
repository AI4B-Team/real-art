import { useState, useRef, useCallback, useEffect } from 'react';
import {
  MousePointer2, Type, Square, Circle, Image as ImageIcon, ImagePlus,
  Minus, Hand, ChevronLeft, ChevronRight, Search,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Strikethrough,
  Trash2, Copy, Lock, Unlock,
  ChevronUp, ChevronDown, RotateCcw,
  Plus, Check, X, SlidersHorizontal,
  GripVertical, MoreHorizontal, FileText, MessageSquare,
  Crop, RefreshCw, Paintbrush, SlidersVertical, Droplets,
  Square as SquareIcon, Link2, Layers, Move, Monitor, Pencil,
  Sparkles, EyeOff, Download, Files, CircleDot, Eclipse,
  BoxSelect, Maximize2, ArrowUpDown,
} from 'lucide-react';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// ─── Types ─────────────────────────────────────────
export interface Page {
  id: string;
  title: string;
  type: 'cover' | 'toc' | 'chapter' | 'chapter-page' | 'back';
  thumbnail?: string;
  locked?: boolean;
}

export interface CanvasElement {
  id: string;
  type: 'image' | 'shape' | 'text';
  x: number; y: number; width: number; height: number;
  content?: string; src?: string;
  fill?: string; stroke?: string; strokeWidth?: number;
  shapeType?: 'rectangle' | 'circle';
  fontSize?: number; fontFamily?: string; textColor?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontWeight?: 'normal' | 'bold'; fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  locked?: boolean; rotation?: number; zIndex?: number;
  opacity?: number; borderRadius?: number;
}

interface EbookCanvasEditorProps {
  pages: Page[];
  selectedPageId: string | null;
  onPageSelect: (id: string) => void;
  onPagesChange?: (pages: Page[]) => void;
  bookTitle: string;
  showPagesPanel?: boolean;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  isGridView?: boolean;
  onGridViewToggle?: () => void;
  findReplaceMode?: 'find' | 'find-replace' | null;
  onFindReplaceModeChange?: (mode: 'find' | 'find-replace' | null) => void;
  onPageSettingsToggle?: () => void;
}

// ─── Constants ─────────────────────────────────────
const TOOLS = [
  { id: 'select', icon: MousePointer2, label: 'Select (V)' },
  { id: 'hand', icon: Hand, label: 'Pan (H)' },
  { id: 'text', icon: Type, label: 'Text (T)' },
  { id: 'rectangle', icon: Square, label: 'Rectangle (R)' },
  { id: 'circle', icon: Circle, label: 'Circle (O)' },
  { id: 'line', icon: Minus, label: 'Line (L)' },
  { id: 'image', icon: ImageIcon, label: 'Image (I)' },
];

const PAGE_ACTIONS = [
  { id: 'add', icon: Plus, label: 'Add Page' },
  { id: 'duplicate', icon: Copy, label: 'Duplicate Page' },
  { id: 'lock', icon: Unlock, label: 'Toggle Lock' },
  { id: 'delete', icon: Trash2, label: 'Delete Page' },
  { id: 'moveUp', icon: ChevronUp, label: 'Move Page Up' },
  { id: 'moveDown', icon: ChevronDown, label: 'Move Page Down' },
  { id: 'settings', icon: SlidersHorizontal, label: 'Page Settings' },
];

const FONTS = ['Inter', 'Playfair Display', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Georgia', 'Merriweather'];
const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72];
const COVER_IMAGE = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop';
const STOCK_IMAGES = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop',
];

// ─── Element Generators ────────────────────────────
const createCoverElements = (title: string): CanvasElement[] => [
  { id: 'cover-image', type: 'image', x: 0, y: 0, width: 100, height: 100, src: COVER_IMAGE },
  { id: 'title-box', type: 'shape', x: 5, y: 65, width: 60, height: 25, fill: 'rgba(255,255,255,0.95)', stroke: 'transparent', shapeType: 'rectangle' },
  { id: 'title-text', type: 'text', x: 8, y: 68, width: 54, height: 12, content: title || 'STRATEGIC\nINVESTMENT', fontSize: 28, fontFamily: 'Georgia', textColor: '#1a1a2e' },
  { id: 'subtitle-text', type: 'text', x: 8, y: 82, width: 54, height: 6, content: 'A COMPREHENSIVE GUIDE', fontSize: 14, fontFamily: 'Georgia', textColor: '#0891b2' },
];

const createTocElements = (pages: Page[]): CanvasElement[] => {
  const chapterPages = pages.filter(p => p.type === 'chapter');
  return [
    { id: 'toc-header', type: 'text', x: 10, y: 8, width: 80, height: 8, content: 'TABLE OF CONTENTS', fontSize: 24, fontFamily: 'Georgia', textColor: '#1a1a2e' },
    { id: 'toc-line', type: 'shape', x: 10, y: 18, width: 20, height: 1, fill: '#0891b2', stroke: 'transparent', shapeType: 'rectangle' },
    ...chapterPages.map((page, i) => ({
      id: `toc-item${i}`, type: 'text' as const, x: 10, y: 25 + i * 7, width: 80, height: 5,
      content: `${String(i + 1).padStart(2, '0')}. ${page.title} ${'·'.repeat(30)} ${pages.indexOf(page) + 1}`,
      fontSize: 12, fontFamily: 'Georgia', textColor: '#374151',
    })),
  ];
};

const createChapterElements = (num: number, title: string): CanvasElement[] => [
  { id: `ch${num}-bg`, type: 'shape', x: 0, y: 0, width: 100, height: 25, fill: '#0d4f4f', stroke: 'transparent', shapeType: 'rectangle' },
  ...Array.from({ length: 3 }, (_, i) => ({
    id: `ch${num}-img${i}`, type: 'image' as const, x: 52 + i * 16, y: 3, width: 14, height: 18,
    src: STOCK_IMAGES[(num - 1 + i) % STOCK_IMAGES.length],
  })),
  { id: `ch${num}-num`, type: 'text', x: 10, y: 8, width: 30, height: 10, content: num.toString().padStart(2, '0'), fontSize: 48, fontFamily: 'Georgia', textColor: '#ffffff' },
  { id: `ch${num}-title`, type: 'text', x: 10, y: 28, width: 80, height: 8, content: title, fontSize: 22, fontFamily: 'Georgia', textColor: '#1a1a2e' },
  { id: `ch${num}-body`, type: 'text', x: 10, y: 40, width: 80, height: 15, content: 'This section provides a comprehensive overview of our strategic approach, detailing key methodologies and expected outcomes for stakeholders.', fontSize: 11, fontFamily: 'Georgia', textColor: '#374151' },
  { id: `ch${num}-body2`, type: 'text', x: 10, y: 58, width: 80, height: 20, content: 'Our research indicates significant growth potential in emerging markets. The data suggests a 15% increase in investor confidence over the past quarter.', fontSize: 10, fontFamily: 'Georgia', textColor: '#374151' },
];

const createChapterPageElements = (num: number, title: string): CanvasElement[] => [
  { id: `cp${num}-bg`, type: 'image', x: 0, y: 0, width: 100, height: 100, src: STOCK_IMAGES[(num - 1) % STOCK_IMAGES.length] },
  { id: `cp${num}-overlay`, type: 'shape', x: 0, y: 0, width: 100, height: 100, fill: 'rgba(0,0,0,0.5)', stroke: 'transparent', shapeType: 'rectangle' },
  { id: `cp${num}-label`, type: 'text', x: 10, y: 40, width: 80, height: 10, content: `CHAPTER ${num}`, fontSize: 18, fontFamily: 'Georgia', textColor: '#ffffff' },
  { id: `cp${num}-title`, type: 'text', x: 10, y: 48, width: 80, height: 15, content: title, fontSize: 36, fontFamily: 'Georgia', textColor: '#ffffff' },
];

const createBackElements = (): CanvasElement[] => [
  { id: 'back-bg', type: 'shape', x: 0, y: 0, width: 100, height: 100, fill: '#0d4f4f', stroke: 'transparent', shapeType: 'rectangle' },
  { id: 'back-logo', type: 'text', x: 35, y: 40, width: 30, height: 10, content: 'REAL ART', fontSize: 28, fontFamily: 'Georgia', textColor: '#ffffff', textAlign: 'center' },
  { id: 'back-tag', type: 'text', x: 25, y: 52, width: 50, height: 6, content: 'Creative Excellence', fontSize: 12, fontFamily: 'Georgia', textColor: '#94a3b8', textAlign: 'center' },
];

export const getElementsForPage = (page: Page, allPages: Page[], bookTitle: string): CanvasElement[] => {
  const chapterPages = allPages.filter(p => p.type === 'chapter');
  const chapterPagePages = allPages.filter(p => p.type === 'chapter-page');
  switch (page.type) {
    case 'cover': return createCoverElements(bookTitle);
    case 'toc': return createTocElements(allPages);
    case 'chapter': {
      const idx = chapterPages.indexOf(page);
      return createChapterElements(idx + 1, page.title);
    }
    case 'chapter-page': {
      const idx = chapterPagePages.indexOf(page);
      return createChapterPageElements(idx + 1, page.title);
    }
    case 'back': return createBackElements();
    default: return [];
  }
};

// ─── Component ─────────────────────────────────────
const EbookCanvasEditor = ({
  pages, selectedPageId, onPageSelect, onPagesChange, bookTitle,
  showPagesPanel = true, zoom: externalZoom, onZoomChange,
  isGridView = false, onGridViewToggle,
  findReplaceMode, onFindReplaceModeChange,
  onPageSettingsToggle,
}: EbookCanvasEditorProps) => {
  const [internalPages, setInternalPages] = useState<Page[]>(pages);
  const currentPages = onPagesChange ? pages : internalPages;
  const setPages = (fn: Page[] | ((p: Page[]) => Page[])) => {
    const result = typeof fn === 'function' ? fn(currentPages) : fn;
    onPagesChange ? onPagesChange(result) : setInternalPages(result);
  };

  useEffect(() => { if (!onPagesChange) setInternalPages(pages); }, [pages, onPagesChange]);

  const [activeTool, setActiveTool] = useState('select');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [pageElements, setPageElements] = useState<Record<string, CanvasElement[]>>({});
  const [dragState, setDragState] = useState<{ id: string; startX: number; startY: number; elemX: number; elemY: number } | null>(null);
  const [resizeState, setResizeState] = useState<{ id: string; handle: string; startX: number; startY: number; elemX: number; elemY: number; elemW: number; elemH: number } | null>(null);
  const [undoStack, setUndoStack] = useState<Record<string, CanvasElement[]>[]>([]);
  const [redoStack, setRedoStack] = useState<Record<string, CanvasElement[]>[]>([]);
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [draggedPageIndex, setDraggedPageIndex] = useState<number | null>(null);
  const [dragOverPageIndex, setDragOverPageIndex] = useState<number | null>(null);
  const [showAIEditModal, setShowAIEditModal] = useState(false);
  const [aiEditPrompt, setAIEditPrompt] = useState('');
  const [gridInsertHover, setGridInsertHover] = useState<number | null>(null);
  const [gridMenuOpenId, setGridMenuOpenId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const imageInputRef = useRef<HTMLInputElement>(null);
  const replaceImageInputRef = useRef<HTMLInputElement>(null);
  const isScrollingRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const findInputRef = useRef<HTMLInputElement>(null);

  // Find & Replace state
  const [findQuery, setFindQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [findMatches, setFindMatches] = useState<{ pageId: string; elementId: string; indices: number[] }[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Compute matches when query changes
  useEffect(() => {
    if (!findQuery.trim() || !findReplaceMode) {
      setFindMatches([]);
      setCurrentMatchIndex(0);
      return;
    }
    const q = findQuery.toLowerCase();
    const matches: { pageId: string; elementId: string; indices: number[] }[] = [];
    currentPages.forEach(page => {
      const elems = pageElements[page.id] || getElementsForPage(page, currentPages, bookTitle);
      elems.forEach(el => {
        if (el.type === 'text' && el.content) {
          const content = el.content.toLowerCase();
          const idxs: number[] = [];
          let pos = 0;
          while ((pos = content.indexOf(q, pos)) !== -1) {
            idxs.push(pos);
            pos += q.length;
          }
          if (idxs.length > 0) matches.push({ pageId: page.id, elementId: el.id, indices: idxs });
        }
      });
    });
    setFindMatches(matches);
    setCurrentMatchIndex(0);
  }, [findQuery, findReplaceMode, pageElements, currentPages, bookTitle]);

  // Navigate to match
  useEffect(() => {
    if (findMatches.length === 0 || !findReplaceMode) return;
    const match = findMatches[currentMatchIndex];
    if (match) {
      onPageSelect(match.pageId);
      setSelectedElementId(match.elementId);
      // Scroll to the page
      const pageEl = pageRefs.current[match.pageId];
      if (pageEl) pageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentMatchIndex, findMatches, findReplaceMode]);

  // Focus find input when panel opens
  useEffect(() => {
    if (findReplaceMode) setTimeout(() => findInputRef.current?.focus(), 100);
  }, [findReplaceMode]);

  const handleFindNext = () => {
    if (findMatches.length === 0) return;
    setCurrentMatchIndex(prev => (prev + 1) % findMatches.length);
  };

  const handleFindPrev = () => {
    if (findMatches.length === 0) return;
    setCurrentMatchIndex(prev => (prev - 1 + findMatches.length) % findMatches.length);
  };

  const handleReplaceCurrent = () => {
    if (findMatches.length === 0 || !findQuery.trim()) return;
    const match = findMatches[currentMatchIndex];
    if (!match) return;
    const elems = pageElements[match.pageId] || getElementsForPage(currentPages.find(p => p.id === match.pageId)!, currentPages, bookTitle);
    const el = elems.find(e => e.id === match.elementId);
    if (!el || !el.content) return;
    const newContent = el.content.substring(0, match.indices[0]) + replaceQuery + el.content.substring(match.indices[0] + findQuery.length);
    const newElems = elems.map(e => e.id === match.elementId ? { ...e, content: newContent } : e);
    setPageElements(prev => ({ ...prev, [match.pageId]: newElems }));
    toast.success('Replaced');
  };

  const handleReplaceAll = () => {
    if (findMatches.length === 0 || !findQuery.trim()) return;
    let count = 0;
    const newPageElements = { ...pageElements };
    currentPages.forEach(page => {
      const elems = newPageElements[page.id] || getElementsForPage(page, currentPages, bookTitle);
      let changed = false;
      const updated = elems.map(el => {
        if (el.type === 'text' && el.content && el.content.toLowerCase().includes(findQuery.toLowerCase())) {
          const regex = new RegExp(findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          const matches = el.content.match(regex);
          if (matches) count += matches.length;
          changed = true;
          return { ...el, content: el.content.replace(regex, replaceQuery) };
        }
        return el;
      });
      if (changed) newPageElements[page.id] = updated;
    });
    setPageElements(newPageElements);
    toast.success(`Replaced ${count} occurrence${count !== 1 ? 's' : ''}`);
    setFindQuery('');
  };

  // Auto-select page based on scroll position (IntersectionObserver)
  useEffect(() => {
    if (isGridView) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingRef.current) return;
        let bestEntry: IntersectionObserverEntry | null = null;
        let bestRatio = 0;
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestEntry = entry;
          }
        });
        if (bestEntry) {
          const pageId = (bestEntry as IntersectionObserverEntry).target.getAttribute('data-page-id');
          if (pageId && pageId !== selectedPageId) {
            onPageSelect(pageId);
          }
        }
      },
      { root: container, threshold: [0.3, 0.5, 0.7] }
    );

    Object.entries(pageRefs.current).forEach(([, el]) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isGridView, currentPages, selectedPageId, onPageSelect]);

  // Track scrolling state to suppress observer during active scroll
  useEffect(() => {
    if (isGridView) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      isScrollingRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
        // After scroll stops, find the most visible page
        const containerRect = container.getBoundingClientRect();
        const containerCenter = containerRect.top + containerRect.height / 2;
        let closestId: string | null = null;
        let closestDist = Infinity;
        Object.entries(pageRefs.current).forEach(([id, el]) => {
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const pageCenter = rect.top + rect.height / 2;
          const dist = Math.abs(pageCenter - containerCenter);
          if (dist < closestDist) {
            closestDist = dist;
            closestId = id;
          }
        });
        if (closestId && closestId !== selectedPageId) {
          onPageSelect(closestId);
        }
      }, 50);
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isGridView, selectedPageId, onPageSelect]);

  const internalZoom = useState(100);
  const zoom = externalZoom ?? internalZoom[0];

  const selectedPage = currentPages.find(p => p.id === selectedPageId) || currentPages[0];

  // Init elements for current page
  const currentElements = pageElements[selectedPage?.id || ''] ||
    (selectedPage ? getElementsForPage(selectedPage, currentPages, bookTitle) : []);

  const updateElements = useCallback((pageId: string, newElements: CanvasElement[]) => {
    setUndoStack(prev => [...prev.slice(-20), { ...pageElements }]);
    setRedoStack([]);
    setPageElements(prev => ({ ...prev, [pageId]: newElements }));
  }, [pageElements]);

  const selectedElement = currentElements.find(e => e.id === selectedElementId);

  // ─── Page Actions ─────────────────────────────
  const insertPageAt = (index: number) => {
    const newPage: Page = { id: crypto.randomUUID(), title: 'New Page', type: 'chapter', locked: false };
    const newPages = [...currentPages];
    newPages.splice(index, 0, newPage);
    setPages(newPages);
    onPageSelect(newPage.id);
    toast.success('Page added');
  };

  const handleAddPage = () => {
    const idx = currentPages.findIndex(p => p.id === selectedPageId);
    insertPageAt(idx + 1);
  };

  const handleDuplicatePage = () => {
    if (!selectedPage) return;
    const idx = currentPages.findIndex(p => p.id === selectedPageId);
    const dup: Page = { ...selectedPage, id: crypto.randomUUID(), title: `${selectedPage.title} (Copy)` };
    const newPages = [...currentPages];
    newPages.splice(idx + 1, 0, dup);
    setPages(newPages);
    // Copy elements too
    setPageElements(prev => ({ ...prev, [dup.id]: [...(prev[selectedPage.id] || currentElements)] }));
    onPageSelect(dup.id);
    toast.success('Page duplicated');
  };

  const handleDeletePage = (pageId?: string) => {
    const targetId = pageId || selectedPageId;
    if (currentPages.length <= 1) return;
    const page = currentPages.find(p => p.id === targetId);
    if (page?.type === 'cover' || page?.type === 'back') {
      toast.error('Cannot delete cover or back cover pages');
      return;
    }
    const idx = currentPages.findIndex(p => p.id === targetId);
    const newPages = currentPages.filter(p => p.id !== targetId);
    setPages(newPages);
    onPageSelect(newPages[Math.min(idx, newPages.length - 1)].id);
    toast.success('Page deleted');
  };

  const handleDuplicatePageById = (pageId: string) => {
    const page = currentPages.find(p => p.id === pageId);
    if (!page) return;
    const idx = currentPages.findIndex(p => p.id === pageId);
    const dup: Page = { ...page, id: crypto.randomUUID(), title: `${page.title} (Copy)` };
    const newPages = [...currentPages];
    newPages.splice(idx + 1, 0, dup);
    setPages(newPages);
    setPageElements(prev => ({ ...prev, [dup.id]: [...(prev[pageId] || getElementsForPage(page, currentPages, bookTitle))] }));
    onPageSelect(dup.id);
    toast.success('Page duplicated');
  };

  const handleMovePage = (dir: 'up' | 'down') => {
    const idx = currentPages.findIndex(p => p.id === selectedPageId);
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= currentPages.length) return;
    const newPages = [...currentPages];
    [newPages[idx], newPages[target]] = [newPages[target], newPages[idx]];
    setPages(newPages);
  };

  const handleToggleLock = () => {
    if (!selectedPage) return;
    setPages(currentPages.map(p => p.id === selectedPageId ? { ...p, locked: !p.locked } : p));
  };

  const handlePageAction = (actionId: string) => {
    switch (actionId) {
      case 'add': handleAddPage(); break;
      case 'duplicate': handleDuplicatePage(); break;
      case 'delete': handleDeletePage(); break;
      case 'moveUp': handleMovePage('up'); break;
      case 'moveDown': handleMovePage('down'); break;
      case 'lock': handleToggleLock(); break;
      case 'settings': onPageSettingsToggle?.(); break;
    }
  };

  // ─── Element Actions ──────────────────────────
  const addElement = (type: CanvasElement['type'], extra?: Partial<CanvasElement>) => {
    const newEl: CanvasElement = {
      id: crypto.randomUUID(), type, x: 20, y: 20, width: 30, height: type === 'text' ? 10 : 20,
      ...(type === 'text' ? { content: 'New Text', fontSize: 16, fontFamily: 'Inter', textColor: '#1a1a2e' } : {}),
      ...(type === 'shape' ? { fill: '#3b82f6', stroke: '#1e40af', strokeWidth: 1, shapeType: 'rectangle' } : {}),
      ...(type === 'image' ? { src: STOCK_IMAGES[0] } : {}),
      ...extra,
    };
    const pageId = selectedPage?.id || '';
    updateElements(pageId, [...currentElements, newEl]);
    setSelectedElementId(newEl.id);
    setActiveTool('select');
  };

  const deleteElement = () => {
    if (!selectedElementId || !selectedPage) return;
    updateElements(selectedPage.id, currentElements.filter(e => e.id !== selectedElementId));
    setSelectedElementId(null);
  };

  const duplicateElement = () => {
    if (!selectedElement || !selectedPage) return;
    const dup = { ...selectedElement, id: crypto.randomUUID(), x: selectedElement.x + 3, y: selectedElement.y + 3 };
    updateElements(selectedPage.id, [...currentElements, dup]);
    setSelectedElementId(dup.id);
  };

  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    if (!selectedPage) return;
    updateElements(selectedPage.id, currentElements.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  // ─── Canvas Click ─────────────────────────────
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).dataset.canvas === 'bg') {
      setSelectedElementId(null);
      setEditingTextId(null);

      if (activeTool === 'text') {
        addElement('text');
      } else if (activeTool === 'rectangle') {
        addElement('shape', { shapeType: 'rectangle' });
      } else if (activeTool === 'circle') {
        addElement('shape', { shapeType: 'circle' });
      } else if (activeTool === 'image') {
        imageInputRef.current?.click();
      }
    }
  };

  // ─── Drag ─────────────────────────────────────
  const handleElementMouseDown = (e: React.MouseEvent, el: CanvasElement, pageId?: string) => {
    if (el.locked || activeTool !== 'select') return;
    e.stopPropagation();
    if (pageId) onPageSelect(pageId);
    setSelectedElementId(el.id);
    setDragState({ id: el.id, startX: e.clientX, startY: e.clientY, elemX: el.x, elemY: el.y });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, el: CanvasElement, handle: string) => {
    e.stopPropagation();
    setResizeState({ id: el.id, handle, startX: e.clientX, startY: e.clientY, elemX: el.x, elemY: el.y, elemW: el.width, elemH: el.height });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const scale = zoom / 100;

      if (dragState) {
        const dx = (e.clientX - dragState.startX) / rect.width * 100 / scale;
        const dy = (e.clientY - dragState.startY) / rect.height * 100 / scale;
        updateElement(dragState.id, {
          x: Math.max(0, Math.min(95, dragState.elemX + dx)),
          y: Math.max(0, Math.min(95, dragState.elemY + dy)),
        });
      }

      if (resizeState) {
        const dx = (e.clientX - resizeState.startX) / rect.width * 100 / scale;
        const dy = (e.clientY - resizeState.startY) / rect.height * 100 / scale;
        const h = resizeState.handle;
        let newX = resizeState.elemX, newY = resizeState.elemY;
        let newW = resizeState.elemW, newH = resizeState.elemH;

        if (h.includes('e')) newW = Math.max(5, resizeState.elemW + dx);
        if (h.includes('w')) { newW = Math.max(5, resizeState.elemW - dx); newX = resizeState.elemX + dx; }
        if (h.includes('s')) newH = Math.max(3, resizeState.elemH + dy);
        if (h.includes('n')) { newH = Math.max(3, resizeState.elemH - dy); newY = resizeState.elemY + dy; }

        updateElement(resizeState.id, { x: newX, y: newY, width: newW, height: newH });
      }
    };

    const handleMouseUp = () => {
      setDragState(null);
      setResizeState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [dragState, resizeState, zoom]);

  // ─── Keyboard Shortcuts ───────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (editingTextId) return;
      if (e.key === 'Delete' || e.key === 'Backspace') deleteElement();
      if (e.key === 'v' || e.key === 'V') setActiveTool('select');
      if (e.key === 't' || e.key === 'T') setActiveTool('text');
      if (e.key === 'r' || e.key === 'R') setActiveTool('rectangle');
      if (e.key === 'h' || e.key === 'H') setActiveTool('hand');
      if (e.key === 'i' || e.key === 'I') setActiveTool('image');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [editingTextId, selectedElementId]);

  // ─── Image Upload ─────────────────────────────
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    addElement('image', { src: url, width: 40, height: 30 });
  };

  const handleReplaceImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedElementId) return;
    const url = URL.createObjectURL(file);
    updateElement(selectedElementId, { src: url });
    toast.success('Image replaced');
  };

  const handleAIEdit = () => {
    if (!aiEditPrompt.trim()) return;
    toast.success('AI edit applied: ' + aiEditPrompt);
    setShowAIEditModal(false);
    setAIEditPrompt('');
  };

  // ─── Page Panel DnD ───────────────────────────
  const handlePageDragStart = (idx: number) => setDraggedPageIndex(idx);
  const handlePageDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setDragOverPageIndex(idx); };
  const handlePageDragEnd = () => {
    if (draggedPageIndex !== null && dragOverPageIndex !== null && draggedPageIndex !== dragOverPageIndex) {
      const newPages = [...currentPages];
      const [moved] = newPages.splice(draggedPageIndex, 1);
      newPages.splice(dragOverPageIndex, 0, moved);
      setPages(newPages);
    }
    setDraggedPageIndex(null);
    setDragOverPageIndex(null);
  };

  // ─── Render Element ───────────────────────────
  const renderElement = (el: CanvasElement, pageId?: string) => {
    const isSelected = selectedElementId === el.id;
    const isEditing = editingTextId === el.id;
    const style: React.CSSProperties = {
      position: 'absolute', left: `${el.x}%`, top: `${el.y}%`,
      width: `${el.width}%`, height: `${el.height}%`,
      opacity: el.opacity ?? 1, borderRadius: el.borderRadius,
      transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
      cursor: activeTool === 'select' ? (el.locked ? 'not-allowed' : 'move') : 'crosshair',
      zIndex: el.zIndex ?? 1,
    };

    const selectionBorderColor = el.type === 'shape' ? 'ring-destructive' : 'ring-blue-500';
    const selectionBorder = isSelected ? `ring-2 ${selectionBorderColor} ring-offset-1` : '';

    // Type badge label
    const getTypeLabel = () => {
      switch (el.type) {
        case 'image': return 'Image';
        case 'text': return 'Text';
        case 'shape': return el.shapeType === 'circle' ? 'Circle' : 'Shape';
        default: return 'Element';
      }
    };
    const typeBadgeColor = el.type === 'shape' ? 'bg-destructive' : 'bg-blue-500';
    const TypeBadge = () => isSelected ? (
      <div className={`absolute -top-6 left-0 ${typeBadgeColor} text-white text-xs font-semibold px-2 py-0.5 rounded-sm shadow-sm z-30 whitespace-nowrap`}>
        {getTypeLabel()}
      </div>
    ) : null;

    if (el.type === 'image') {
      return (
        <div key={el.id} className={`${selectionBorder}`} style={style}
          onMouseDown={e => handleElementMouseDown(e, el, pageId)}
          onDoubleClick={() => replaceImageInputRef.current?.click()}>
          <TypeBadge />
          <img src={el.src} alt="" className="w-full h-full object-cover" draggable={false} />
          {isSelected && renderResizeHandles(el)}
          {/* Floating action bar */}
          {isSelected && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border border-foreground/[0.08] px-2 py-1.5 z-50"
              onMouseDown={e => e.stopPropagation()}>
              <button onClick={() => replaceImageInputRef.current?.click()}
                className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-foreground hover:bg-foreground/[0.05] transition-colors">
                <ImagePlus className="w-3.5 h-3.5" />Replace
              </button>
              <button onClick={() => setShowAIEditModal(true)}
                className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-foreground hover:bg-foreground/[0.05] transition-colors">
                <Sparkles className="w-3.5 h-3.5 text-accent" />Edit
              </button>
              <button onClick={deleteElement}
                className="flex items-center gap-1.5 px-2 py-1 rounded text-xs text-destructive hover:bg-destructive/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />Delete
              </button>
            </div>
          )}
        </div>
      );
    }

    if (el.type === 'shape') {
      return (
        <div key={el.id} className={`${selectionBorder}`} style={{
          ...style,
          backgroundColor: el.fill || '#3b82f6',
          border: el.stroke && el.stroke !== 'transparent' ? `${el.strokeWidth || 1}px solid ${el.stroke}` : undefined,
          borderRadius: el.shapeType === 'circle' ? '50%' : (el.borderRadius ?? 0),
        }} onMouseDown={e => handleElementMouseDown(e, el, pageId)}>
          <TypeBadge />
          {isSelected && renderResizeHandles(el)}
        </div>
      );
    }

    if (el.type === 'text') {
      return (
        <div key={el.id} className={`${selectionBorder}`} style={style}
          onMouseDown={e => handleElementMouseDown(e, el, pageId)}
          onDoubleClick={() => { setEditingTextId(el.id); setSelectedElementId(el.id); }}>
          <TypeBadge />
          {isEditing ? (
            <textarea
              autoFocus
              value={el.content || ''}
              onChange={e => updateElement(el.id, { content: e.target.value })}
              onBlur={() => setEditingTextId(null)}
              onKeyDown={e => { if (e.key === 'Escape') setEditingTextId(null); }}
              className="w-full h-full bg-transparent border-none outline-none resize-none p-1"
              style={{
                fontSize: `${(el.fontSize || 16) * zoom / 100 * 0.5}px`,
                fontFamily: el.fontFamily, color: el.textColor,
                textAlign: el.textAlign || 'left',
                fontWeight: el.fontWeight || 'normal',
                fontStyle: el.fontStyle || 'normal',
                textDecoration: el.textDecoration || 'none',
              }}
            />
          ) : (
            <div className="w-full h-full overflow-hidden p-1 whitespace-pre-wrap" style={{
              fontSize: `${(el.fontSize || 16) * zoom / 100 * 0.5}px`,
              fontFamily: el.fontFamily, color: el.textColor,
              textAlign: el.textAlign || 'left',
              fontWeight: el.fontWeight || 'normal',
              fontStyle: el.fontStyle || 'normal',
              textDecoration: el.textDecoration || 'none',
            }}>
              {el.content}
            </div>
          )}
          {isSelected && renderResizeHandles(el)}
        </div>
      );
    }

    return null;
  };

  const renderResizeHandles = (el: CanvasElement) => {
    if (el.locked) return null;
    const handles = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
    const positions: Record<string, React.CSSProperties> = {
      nw: { top: -4, left: -4, cursor: 'nwse-resize' },
      ne: { top: -4, right: -4, cursor: 'nesw-resize' },
      sw: { bottom: -4, left: -4, cursor: 'nesw-resize' },
      se: { bottom: -4, right: -4, cursor: 'nwse-resize' },
      n: { top: -4, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' },
      s: { bottom: -4, left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' },
      e: { top: '50%', right: -4, transform: 'translateY(-50%)', cursor: 'ew-resize' },
      w: { top: '50%', left: -4, transform: 'translateY(-50%)', cursor: 'ew-resize' },
    };
    return handles.map(h => (
      <div key={h} className="absolute w-2 h-2 bg-accent border border-white rounded-sm z-50"
        style={positions[h]}
        onMouseDown={e => handleResizeMouseDown(e, el, h)} />
    ));
  };

  // ─── Render ───────────────────────────────────
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-full flex-1 min-w-0">

        {/* Pages Panel */}
        {showPagesPanel && (
          <div className="w-48 border-r border-foreground/[0.04] bg-background overflow-y-auto p-2.5">
            <div className="flex items-center justify-between mb-2.5 px-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Pages ({currentPages.length})</span>
              <button onClick={onGridViewToggle}
                className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05]">
                {isGridView ? <ChevronLeft className="w-3 h-3" /> : <GripVertical className="w-3 h-3" />}
              </button>
            </div>
            <div className={isGridView ? 'grid grid-cols-2 gap-1.5' : 'space-y-1.5'}>
              {currentPages.map((page, i) => (
                <div key={page.id}
                  draggable
                  onDragStart={() => handlePageDragStart(i)}
                  onDragOver={e => handlePageDragOver(e, i)}
                  onDragEnd={handlePageDragEnd}
                  onClick={() => onPageSelect(page.id)}
                  className={`cursor-pointer rounded-lg p-2 transition-all border ${
                    selectedPageId === page.id ? 'border-accent bg-accent/5' : 'border-transparent hover:bg-foreground/[0.03]'
                  } ${dragOverPageIndex === i ? 'border-accent/50 bg-accent/10' : ''}`}>
                  {/* Thumbnail */}
                  <div className={`bg-foreground/[0.04] rounded overflow-hidden mb-1.5 ${isGridView ? 'aspect-[3/4]' : 'h-12'} flex items-center justify-center`}>
                    <span className={`text-[9px] font-bold ${selectedPageId === page.id ? 'text-accent' : 'text-muted-foreground'}`}>
                      {page.type === 'cover' ? '📕' : page.type === 'toc' ? '📋' : page.type === 'back' ? '📘' : i + 1}
                    </span>
                  </div>
                  <p className="text-[10px] font-medium text-foreground truncate">{page.title}</p>
                  {page.locked && <Lock className="w-2.5 h-2.5 text-muted-foreground" />}
                </div>
              ))}
            </div>
            <button onClick={handleAddPage}
              className="w-full mt-2 flex items-center justify-center gap-1 py-2 border-2 border-dashed border-foreground/[0.08] rounded-lg text-[10px] text-muted-foreground hover:border-accent/40 hover:text-accent transition-colors">
              <Plus className="w-3 h-3" />Add Page
            </button>
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 bg-foreground/[0.03] flex flex-col overflow-hidden">
          {isGridView ? (
            /* ─── GRID VIEW ─── */
            <div className="flex h-full flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-auto px-6 pt-6">
                <div className="flex flex-wrap content-start gap-y-6 items-start pb-4">
                  {currentPages.map((page, pageIndex) => {
                    const elems = pageElements[page.id] || getElementsForPage(page, currentPages, bookTitle);
                    const isSelected = page.id === selectedPageId;
                    const getPageTypeIcon = () => {
                      switch (page.type) {
                        case 'cover': return FileText;
                        case 'toc': return FileText;
                        case 'chapter': return FileText;
                        case 'chapter-page': return MessageSquare;
                        case 'back': return FileText;
                        default: return FileText;
                      }
                    };
                    const PageIcon = getPageTypeIcon();
                    return (
                      <div key={page.id} className="flex items-stretch">
                        {/* Insert zone with drop indicator */}
                        <div
                          className={`relative flex items-center justify-center shrink-0 transition-all duration-300 ease-in-out ${
                            (gridInsertHover === pageIndex && draggedPageIndex === null) || (dragOverPageIndex === pageIndex && draggedPageIndex !== null)
                              ? 'w-14' : 'w-2'
                          }`}
                          onMouseEnter={() => { if (draggedPageIndex === null) setGridInsertHover(pageIndex); }}
                          onMouseLeave={() => setGridInsertHover(null)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                            if (draggedPageIndex !== null && draggedPageIndex !== pageIndex) setDragOverPageIndex(pageIndex);
                          }}
                          onDragLeave={() => { if (dragOverPageIndex === pageIndex) setDragOverPageIndex(null); }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedPageIndex !== null && draggedPageIndex !== pageIndex) {
                              const newPages = [...currentPages];
                              const [moved] = newPages.splice(draggedPageIndex, 1);
                              const insertAt = pageIndex > draggedPageIndex ? pageIndex - 1 : pageIndex;
                              newPages.splice(insertAt, 0, moved);
                              setPages(newPages);
                            }
                            setDraggedPageIndex(null);
                            setDragOverPageIndex(null);
                          }}
                        >
                          {/* Red drop indicator line */}
                          <div className={`absolute inset-y-2 left-1/2 -translate-x-1/2 w-0.5 rounded-full bg-destructive transition-all duration-150 ${dragOverPageIndex === pageIndex && draggedPageIndex !== null ? 'opacity-100' : 'opacity-0'}`} />
                          {/* Add page button (only when not dragging) */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                onClick={(e) => { e.stopPropagation(); insertPageAt(pageIndex); }}
                                className={`relative z-10 w-10 h-10 rounded-full bg-background border border-foreground/[0.12] text-muted-foreground flex items-center justify-center shadow-lg transition-all duration-200 hover:border-accent hover:text-accent ${gridInsertHover === pageIndex && draggedPageIndex === null ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom">Add Page</TooltipContent>
                          </Tooltip>
                        </div>
                        {/* Page thumbnail */}
                        <div className="flex flex-col items-center gap-1.5 w-[140px]"
                          draggable
                          onDragStart={(e) => {
                            setDraggedPageIndex(pageIndex);
                            e.dataTransfer.effectAllowed = 'move';
                            (e.currentTarget as HTMLElement).style.opacity = '0.5';
                          }}
                          onDragEnd={(e) => {
                            (e.currentTarget as HTMLElement).style.opacity = '1';
                            handlePageDragEnd();
                          }}
                        >
                          <div
                            onClick={() => { onPageSelect(page.id); onGridViewToggle?.(); }}
                            className={`group relative w-full aspect-[3/4] bg-white rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                              isSelected ? 'ring-2 ring-accent shadow-lg' : 'border border-foreground/[0.08] hover:shadow-md hover:border-accent/40'
                            } ${draggedPageIndex === pageIndex ? 'opacity-50 scale-95' : ''}`}
                          >
                            <div className="w-full h-full relative">
                              <div className="absolute inset-0">
                                {elems.map(el => {
                                  if (el.type === 'image') return (
                                    <div key={el.id} className="absolute overflow-hidden" style={{ left: `${el.x}%`, top: `${el.y}%`, width: `${el.width}%`, height: `${el.height}%` }}>
                                      <img src={el.src} alt="" className="w-full h-full object-cover" draggable={false} />
                                    </div>
                                  );
                                  if (el.type === 'shape') return (
                                    <div key={el.id} className="absolute" style={{ left: `${el.x}%`, top: `${el.y}%`, width: `${el.width}%`, height: `${el.height}%`, backgroundColor: el.fill, borderRadius: el.shapeType === 'circle' ? '50%' : undefined }} />
                                  );
                                  if (el.type === 'text') return (
                                    <div key={el.id} className="absolute overflow-hidden" style={{ left: `${el.x}%`, top: `${el.y}%`, width: `${el.width}%`, height: `${el.height}%`, fontSize: `${Math.max(4, (el.fontSize || 16) * 0.3)}px`, fontFamily: el.fontFamily, color: el.textColor, fontWeight: el.fontWeight || 'normal', textAlign: el.textAlign || 'left', lineHeight: 1.2 }}>
                                      {el.content}
                                    </div>
                                  );
                                  return null;
                                })}
                              </div>
                            </div>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <Popover open={gridMenuOpenId === page.id} onOpenChange={(open) => setGridMenuOpenId(open ? page.id : null)}>
                                <PopoverTrigger asChild>
                                  <button onClick={e => e.stopPropagation()} className="w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-1.5" align="end" side="bottom">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDuplicatePageById(page.id); setGridMenuOpenId(null); }}
                                    className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-foreground/[0.04] flex items-center gap-3 transition-colors"
                                  >
                                    <Files className="w-4 h-4" /> Duplicate
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); insertPageAt(pageIndex + 1); setGridMenuOpenId(null); }}
                                    className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-foreground/[0.04] flex items-center gap-3 transition-colors"
                                  >
                                    <Plus className="w-4 h-4" /> Add Page After
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); toast.info('Hide page coming soon'); setGridMenuOpenId(null); }}
                                    className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-foreground/[0.04] flex items-center gap-3 transition-colors"
                                  >
                                    <EyeOff className="w-4 h-4" /> Hide
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); toast.info('Download page coming soon'); setGridMenuOpenId(null); }}
                                    className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-foreground/[0.04] flex items-center gap-3 transition-colors"
                                  >
                                    <Download className="w-4 h-4" /> Download
                                  </button>
                                  <div className="my-1 border-t border-foreground/[0.06]" />
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDeletePage(page.id); setGridMenuOpenId(null); }}
                                    className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-destructive/10 text-destructive flex items-center gap-3 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" /> Delete
                                  </button>
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <PageIcon className="w-3 h-3" />
                            <span className={`text-xs font-medium ${isSelected ? 'text-accent' : ''}`}>{pageIndex + 1}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Trailing insert + Add Page card */}
                  <div className="flex items-stretch">
                    <div
                      className={`relative flex items-center justify-center shrink-0 transition-all duration-300 ease-in-out ${
                        (gridInsertHover === currentPages.length && draggedPageIndex === null) || (dragOverPageIndex === currentPages.length && draggedPageIndex !== null)
                          ? 'w-14' : 'w-2'
                      }`}
                      onMouseEnter={() => { if (draggedPageIndex === null) setGridInsertHover(currentPages.length); }}
                      onMouseLeave={() => setGridInsertHover(null)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        if (draggedPageIndex !== null) setDragOverPageIndex(currentPages.length);
                      }}
                      onDragLeave={() => { if (dragOverPageIndex === currentPages.length) setDragOverPageIndex(null); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedPageIndex !== null) {
                          const newPages = [...currentPages];
                          const [moved] = newPages.splice(draggedPageIndex, 1);
                          newPages.push(moved);
                          setPages(newPages);
                        }
                        setDraggedPageIndex(null);
                        setDragOverPageIndex(null);
                      }}
                    >
                      <div className={`absolute inset-y-2 left-1/2 -translate-x-1/2 w-0.5 rounded-full bg-destructive transition-all duration-150 ${dragOverPageIndex === currentPages.length && draggedPageIndex !== null ? 'opacity-100' : 'opacity-0'}`} />
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => { e.stopPropagation(); insertPageAt(currentPages.length); }}
                            className={`relative z-10 w-10 h-10 rounded-full bg-background border border-foreground/[0.12] text-muted-foreground flex items-center justify-center shadow-lg transition-all duration-200 hover:border-accent hover:text-accent ${gridInsertHover === currentPages.length && draggedPageIndex === null ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">Add Page</TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 w-[140px]">
                      <button onClick={handleAddPage}
                        className="w-full aspect-[3/4] rounded-lg border-2 border-dashed border-foreground/[0.1] hover:border-accent/50 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer group">
                        <Plus className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
                        <span className="text-xs text-muted-foreground group-hover:text-accent transition-colors">Add Page</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* Bottom actions */}
              <div className="shrink-0 flex justify-end gap-3 px-6 pb-4 pt-3 bg-gradient-to-t from-background via-background to-transparent">
                <button onClick={onGridViewToggle} className="px-6 py-2.5 rounded-lg border border-foreground/[0.1] text-sm font-medium hover:bg-foreground/[0.04] transition-colors">
                  Cancel
                </button>
                <button onClick={onGridViewToggle} className="px-6 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors">
                  Confirm
                </button>
              </div>
            </div>
          ) : (
            /* ─── NORMAL VIEW ─── */
            <>
              {/* Unified toolbar — always visible */}
              <div className="h-10 border-b border-foreground/[0.04] bg-background flex items-center px-3 gap-1.5 shrink-0">
                {/* ── Left: 4 Creation Tool Buttons ── */}
                <Tooltip><TooltipTrigger asChild>
                  <button onClick={() => { setActiveTool('select'); setSelectedElementId(null); }}
                    className={`p-1.5 rounded transition-colors ${activeTool === 'select' ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground'}`}>
                    <MousePointer2 className="w-4 h-4" />
                  </button>
                </TooltipTrigger><TooltipContent>Select (V)</TooltipContent></Tooltip>

                <Tooltip><TooltipTrigger asChild>
                  <button onClick={() => setActiveTool('text')}
                    className={`p-1.5 rounded transition-colors ${activeTool === 'text' ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground'}`}>
                    <Type className="w-4 h-4" />
                  </button>
                </TooltipTrigger><TooltipContent>Text (T)</TooltipContent></Tooltip>

                {/* Shapes dropdown */}
                <Popover>
                  <PopoverTrigger asChild>
                    <button className={`p-1.5 rounded transition-colors flex items-center gap-0.5 ${['rectangle','circle','line'].includes(activeTool) ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground'}`}>
                      <Square className="w-4 h-4" />
                      <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-36 p-1.5" align="start">
                    {[
                      { id: 'rectangle', icon: Square, label: 'Rectangle (R)' },
                      { id: 'circle', icon: Circle, label: 'Circle (O)' },
                      { id: 'line', icon: Minus, label: 'Line (L)' },
                    ].map(shape => (
                      <button key={shape.id} onClick={() => setActiveTool(shape.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${activeTool === shape.id ? 'bg-accent/10 text-accent font-medium' : 'hover:bg-foreground/[0.04]'}`}>
                        <shape.icon className="w-4 h-4" />{shape.label}
                      </button>
                    ))}
                  </PopoverContent>
                </Popover>

                <Tooltip><TooltipTrigger asChild>
                  <button onClick={() => { setActiveTool('image'); imageInputRef.current?.click(); }}
                    className={`p-1.5 rounded transition-colors ${activeTool === 'image' ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground'}`}>
                    <ImageIcon className="w-4 h-4" />
                  </button>
                </TooltipTrigger><TooltipContent>Image (I)</TooltipContent></Tooltip>

                {/* ── Separator between tools and context toolbar ── */}
                {selectedElement && <div className="w-px h-5 bg-foreground/[0.08] mx-1" />}

                {/* ── Context: Text formatting ── */}
                {selectedElement?.type === 'text' && (
                  <>
                    <button onClick={() => toast.success('AI text tools')}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors">
                      <Sparkles className="w-3 h-3" />AI
                    </button>
                    <div className="w-px h-5 bg-foreground/[0.08]" />
                    <Select value={selectedElement.fontFamily || 'Inter'} onValueChange={v => updateElement(selectedElement.id, { fontFamily: v })}>
                      <SelectTrigger className="w-32 h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{FONTS.map(f => <SelectItem key={f} value={f}><span style={{ fontFamily: f }}>{f}</span></SelectItem>)}</SelectContent>
                    </Select>
                    <button onClick={() => updateElement(selectedElement.id, { fontSize: Math.max(8, (selectedElement.fontSize || 16) - 2) })}
                      className="p-1 rounded text-muted-foreground hover:bg-foreground/[0.05]"><Minus className="w-3 h-3" /></button>
                    <span className="text-xs font-medium w-7 text-center">{selectedElement.fontSize || 16}</span>
                    <button onClick={() => updateElement(selectedElement.id, { fontSize: Math.min(96, (selectedElement.fontSize || 16) + 2) })}
                      className="p-1 rounded text-muted-foreground hover:bg-foreground/[0.05]"><Plus className="w-3 h-3" /></button>
                    <div className="w-px h-5 bg-foreground/[0.08]" />
                    <Tooltip><TooltipTrigger asChild>
                      <input type="color" value={selectedElement.textColor || '#1a1a2e'}
                        onChange={e => updateElement(selectedElement.id, { textColor: e.target.value })}
                        className="w-6 h-6 rounded border border-foreground/[0.1] cursor-pointer" />
                    </TooltipTrigger><TooltipContent>Text Color</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={() => updateElement(selectedElement.id, { fontSize: selectedElement.fontSize === 28 ? 16 : 28, fontWeight: selectedElement.fontSize === 28 ? 'normal' : 'bold' })}
                        className={`w-7 h-7 rounded text-xs font-bold flex items-center justify-center ${selectedElement.fontSize && selectedElement.fontSize >= 28 ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-foreground/[0.05]'}`}>
                        H
                      </button>
                    </TooltipTrigger><TooltipContent>Heading</TooltipContent></Tooltip>
                    <div className="w-px h-5 bg-foreground/[0.08]" />
                    <button onClick={() => updateElement(selectedElement.id, { fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' })}
                      className={`p-1.5 rounded ${selectedElement.fontWeight === 'bold' ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-foreground/[0.05]'}`}>
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => updateElement(selectedElement.id, { fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' })}
                      className={`p-1.5 rounded ${selectedElement.fontStyle === 'italic' ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-foreground/[0.05]'}`}>
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => updateElement(selectedElement.id, { textDecoration: selectedElement.textDecoration === 'underline' ? 'none' : 'underline' })}
                      className={`p-1.5 rounded ${selectedElement.textDecoration === 'underline' ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-foreground/[0.05]'}`}>
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => updateElement(selectedElement.id, { textDecoration: selectedElement.textDecoration === 'line-through' ? 'none' : 'line-through' })}
                      className={`p-1.5 rounded ${selectedElement.textDecoration === 'line-through' ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-foreground/[0.05]'}`}>
                      <Strikethrough className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-5 bg-foreground/[0.08]" />
                    {(['left', 'center', 'right', 'justify'] as const).map(align => {
                      const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : align === 'right' ? AlignRight : AlignJustify;
                      return (
                        <button key={align} onClick={() => updateElement(selectedElement.id, { textAlign: align })}
                          className={`p-1.5 rounded ${selectedElement.textAlign === align ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-foreground/[0.05]'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </button>
                      );
                    })}
                    <div className="w-px h-5 bg-foreground/[0.08]" />
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={() => toast.success('Line Height')} className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05]"><ArrowUpDown className="w-3.5 h-3.5" /></button>
                    </TooltipTrigger><TooltipContent>Line Height</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={() => toast.success('Add Link')} className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05]"><Link2 className="w-3.5 h-3.5" /></button>
                    </TooltipTrigger><TooltipContent>Add Link</TooltipContent></Tooltip>
                    <div className="w-px h-5 bg-foreground/[0.08]" />
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={() => toast.success('Layers')} className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05]"><Layers className="w-3.5 h-3.5" /></button>
                    </TooltipTrigger><TooltipContent>Layers</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={() => toast.success('Position')} className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05]"><Move className="w-3.5 h-3.5" /></button>
                    </TooltipTrigger><TooltipContent>Position</TooltipContent></Tooltip>
                    <div className="w-px h-5 bg-foreground/[0.08]" />
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={() => updateElement(selectedElement.id, { locked: !selectedElement.locked })}
                        className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05]">
                        {selectedElement.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                    </TooltipTrigger><TooltipContent>{selectedElement.locked ? 'Unlock' : 'Lock'}</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={duplicateElement} className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05]"><Copy className="w-3.5 h-3.5" /></button>
                    </TooltipTrigger><TooltipContent>Duplicate</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={deleteElement} className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05] hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                    </TooltipTrigger><TooltipContent>Delete</TooltipContent></Tooltip>
                  </>
                )}

                {/* ── Context: Shape formatting ── */}
                {selectedElement?.type === 'shape' && (
                  <>
                    <span className="text-xs text-muted-foreground">Fill:</span>
                    <input type="color" value={selectedElement.fill || '#3b82f6'}
                      onChange={e => updateElement(selectedElement.id, { fill: e.target.value })}
                      className="w-6 h-6 rounded border border-foreground/[0.1] cursor-pointer" />
                    <span className="text-xs text-muted-foreground ml-2">Stroke:</span>
                    <input type="color" value={selectedElement.stroke || '#1e40af'}
                      onChange={e => updateElement(selectedElement.id, { stroke: e.target.value })}
                      className="w-6 h-6 rounded border border-foreground/[0.1] cursor-pointer" />
                    <button onClick={() => updateElement(selectedElement.id, { shapeType: selectedElement.shapeType === 'circle' ? 'rectangle' : 'circle' })}
                      className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05]">
                      {selectedElement.shapeType === 'circle' ? <Square className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                    </button>
                    <div className="w-px h-5 bg-foreground/[0.08]" />
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={duplicateElement} className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05]"><Copy className="w-3.5 h-3.5" /></button>
                    </TooltipTrigger><TooltipContent>Duplicate</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={deleteElement} className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05] hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                    </TooltipTrigger><TooltipContent>Delete</TooltipContent></Tooltip>
                  </>
                )}

                {/* ── Context: Image formatting ── */}
                {selectedElement?.type === 'image' && (
                  <>
                    <button onClick={() => replaceImageInputRef.current?.click()}
                      className="flex items-center gap-1.5 text-xs text-foreground px-2.5 py-1.5 rounded-lg hover:bg-foreground/[0.05] border border-foreground/[0.08]">
                      <ImagePlus className="w-3.5 h-3.5" />Replace
                    </button>
                    <button onClick={() => setShowAIEditModal(true)}
                      className="flex items-center gap-1.5 text-xs text-accent px-2.5 py-1.5 rounded-lg hover:bg-accent/10 border border-accent/20">
                      <Sparkles className="w-3.5 h-3.5" />Edit
                    </button>
                    <div className="w-px h-5 bg-foreground/[0.08]" />
                    {[
                      { icon: Crop, label: 'Crop' },
                      { icon: Droplets, label: 'Opacity (100%)' },
                      { icon: Maximize2, label: 'Resize' },
                      { icon: SlidersVertical, label: 'Filter' },
                      { icon: CircleDot, label: 'Mask' },
                      { icon: Eclipse, label: 'Shadow' },
                      { icon: SquareIcon, label: 'Corner Radius' },
                    ].map(tool => (
                      <Tooltip key={tool.label}>
                        <TooltipTrigger asChild>
                          <button onClick={() => toast.success(`${tool.label} tool`)}
                            className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground">
                            <tool.icon className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>{tool.label}</TooltipContent>
                      </Tooltip>
                    ))}
                    <div className="w-px h-5 bg-foreground/[0.08]" />
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={() => toast.success('Add Link')} className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05]"><Link2 className="w-3.5 h-3.5" /></button>
                    </TooltipTrigger><TooltipContent>Add Link</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={() => toast.success('Layers')} className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05]"><Layers className="w-3.5 h-3.5" /></button>
                    </TooltipTrigger><TooltipContent>Layers</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={() => toast.success('Position')} className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05]"><Move className="w-3.5 h-3.5" /></button>
                    </TooltipTrigger><TooltipContent>Position</TooltipContent></Tooltip>
                    <div className="w-px h-5 bg-foreground/[0.08]" />
                    <Tooltip><TooltipTrigger asChild>
                      <input type="color" defaultValue="#e5e7eb"
                        className="w-5 h-5 rounded border border-foreground/[0.1] cursor-pointer" />
                    </TooltipTrigger><TooltipContent>Border Color</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={() => toast.success('Border Style')} className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05]"><BoxSelect className="w-3.5 h-3.5" /></button>
                    </TooltipTrigger><TooltipContent>Border Style</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={() => toast.success('Border Width')} className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05]"><Maximize2 className="w-3.5 h-3.5" /></button>
                    </TooltipTrigger><TooltipContent>Border Width</TooltipContent></Tooltip>
                    <div className="w-px h-5 bg-foreground/[0.08]" />
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={() => updateElement(selectedElement.id, { locked: !selectedElement.locked })} className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05]">
                        <Lock className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger><TooltipContent>Lock</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={duplicateElement} className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05]"><Copy className="w-3.5 h-3.5" /></button>
                    </TooltipTrigger><TooltipContent>Duplicate</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={deleteElement} className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05] hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                    </TooltipTrigger><TooltipContent>Delete</TooltipContent></Tooltip>
                  </>
                )}
              </div>

              {/* ── Find & Replace Panel ── */}
              {findReplaceMode && (
                <div className="absolute top-12 right-4 z-50 bg-background border border-foreground/[0.1] rounded-xl shadow-2xl w-80 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between px-3 py-2.5 border-b border-foreground/[0.06] bg-foreground/[0.02]">
                    <span className="text-sm font-semibold text-foreground">
                      {findReplaceMode === 'find-replace' ? 'Find & Replace' : 'Find'}
                    </span>
                    <div className="flex items-center gap-1">
                      {findMatches.length > 0 && (
                        <span className="text-xs text-muted-foreground mr-1">
                          {currentMatchIndex + 1} of {findMatches.length}
                        </span>
                      )}
                      <button onClick={() => onFindReplaceModeChange?.(null)}
                        className="p-1 rounded hover:bg-foreground/[0.06] text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3 flex flex-col gap-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                        <input
                          ref={findInputRef}
                          value={findQuery}
                          onChange={e => setFindQuery(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleFindNext(); if (e.key === 'Escape') onFindReplaceModeChange?.(null); }}
                          placeholder="Find text..."
                          className="w-full pl-8 pr-3 py-2 text-sm bg-foreground/[0.04] rounded-lg border border-foreground/[0.08] focus:outline-none focus:border-accent/40 transition-colors"
                        />
                      </div>
                      <button onClick={handleFindPrev} disabled={findMatches.length === 0}
                        className="p-1.5 rounded-lg hover:bg-foreground/[0.06] text-muted-foreground disabled:opacity-30 transition-colors">
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button onClick={handleFindNext} disabled={findMatches.length === 0}
                        className="p-1.5 rounded-lg hover:bg-foreground/[0.06] text-muted-foreground disabled:opacity-30 transition-colors">
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                    {findReplaceMode === 'find-replace' && (
                      <>
                        <div className="flex items-center gap-2">
                          <input
                            value={replaceQuery}
                            onChange={e => setReplaceQuery(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleReplaceCurrent(); if (e.key === 'Escape') onFindReplaceModeChange?.(null); }}
                            placeholder="Replace with..."
                            className="flex-1 px-3 py-2 text-sm bg-foreground/[0.04] rounded-lg border border-foreground/[0.08] focus:outline-none focus:border-accent/40 transition-colors"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={handleReplaceCurrent} disabled={findMatches.length === 0}
                            className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg border border-foreground/[0.1] hover:bg-foreground/[0.04] disabled:opacity-30 transition-colors">
                            Replace
                          </button>
                          <button onClick={handleReplaceAll} disabled={findMatches.length === 0}
                            className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-accent text-white hover:bg-accent/90 disabled:opacity-30 transition-colors">
                            Replace All
                          </button>
                        </div>
                      </>
                    )}
                    {findQuery.trim() && findMatches.length === 0 && (
                      <p className="text-xs text-muted-foreground text-center py-1">No matches found</p>
                    )}
                  </div>
                </div>
              )}

              {/* Canvas - Scrollable all pages */}
              <div ref={scrollContainerRef} className="flex-1 overflow-auto py-8 px-4 relative">
                <div className="flex flex-col items-center gap-8">
                  {currentPages.map((page, pageIndex) => {
                    const elems = pageElements[page.id] || getElementsForPage(page, currentPages, bookTitle);
                    const isSelected = page.id === selectedPageId;
                    return (
                      <div key={page.id} data-page-id={page.id} ref={el => { pageRefs.current[page.id] = el; }} className="flex items-start gap-2">
                        {/* Page label */}
                        <div className="w-8 shrink-0 pt-2">
                          <p className={`text-[10px] font-medium text-center ${isSelected ? 'text-accent' : 'text-muted-foreground'}`}>
                            {pageIndex + 1}
                          </p>
                        </div>
                        {/* Page canvas */}
                        <div
                          ref={isSelected ? canvasRef : undefined}
                          data-canvas={isSelected ? 'bg' : undefined}
                          onClick={(e) => {
                            onPageSelect(page.id);
                            if (isSelected) handleCanvasClick(e);
                          }}
                          className={`bg-white rounded-lg shadow-lg relative overflow-hidden cursor-pointer transition-shadow ${
                            isSelected ? 'ring-2 ring-accent shadow-2xl' : 'border border-foreground/[0.06] hover:shadow-xl'
                          }`}
                          style={{ width: `${480 * zoom / 100}px`, height: `${640 * zoom / 100}px` }}
                        >
                          {isSelected && (
                            <div className="absolute inset-0 pointer-events-none">
                              <div className="absolute top-1/2 left-0 right-0 h-px bg-accent/10" />
                              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-accent/10" />
                            </div>
                          )}
                          {elems.map(el => renderElement(el, page.id))}
                          <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none">
                            <span className="text-[10px] text-muted-foreground">{pageIndex + 1}</span>
                          </div>
                        </div>
                        {/* Page action buttons - shown for selected page */}
                        <div className={`shrink-0 transition-all duration-300 ease-out ${
                          isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
                        }`}>
                          <div className="flex flex-col gap-1 bg-background/80 backdrop-blur-sm rounded-xl p-1 border border-foreground/[0.06] shadow-sm">
                            {PAGE_ACTIONS.map(action => {
                              const currentSelectedPage = currentPages.find(p => p.id === selectedPageId);
                              const Icon = action.id === 'lock' && currentSelectedPage?.locked ? Lock : action.icon;
                              return (
                                <Tooltip key={action.id}>
                                  <TooltipTrigger asChild>
                                    <button onClick={() => handlePageAction(action.id)}
                                      className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/[0.06] transition-colors">
                                      <Icon className="w-4 h-4" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="right">{action.label}</TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Hidden file inputs */}
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        <input ref={replaceImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleReplaceImage} />

        {/* AI Edit Modal */}
        <Dialog open={showAIEditModal} onOpenChange={setShowAIEditModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                Edit With AI
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-3">Describe how you want to modify this image:</p>
              <textarea
                value={aiEditPrompt}
                onChange={e => setAIEditPrompt(e.target.value)}
                placeholder="e.g., Make the image brighter, add a warm filter, remove the background..."
                className="w-full min-h-[100px] px-3 py-2.5 rounded-lg border border-foreground/[0.1] bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent resize-none"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAIEditModal(false)}>Cancel</Button>
              <Button onClick={handleAIEdit} disabled={!aiEditPrompt.trim()} className="bg-accent hover:bg-accent/90 text-white gap-2">
                <Sparkles className="w-4 h-4" />Apply Edit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default EbookCanvasEditor;

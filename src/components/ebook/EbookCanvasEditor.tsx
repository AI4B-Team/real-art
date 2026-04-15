import { useState, useRef, useCallback, useEffect, useLayoutEffect, forwardRef, useImperativeHandle } from 'react';
import {
  MousePointer2, Type, Square, Circle, Image as ImageIcon, ImagePlus,
  Brain, CheckSquare, BookOpen, Award, TrendingUp, HelpCircle, Zap, ListChecks, GitBranch, Shuffle as ShuffleIcon,
  Minus, Hand, ChevronLeft, ChevronRight, Search, Loader2,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Bold, Italic, Underline, Strikethrough,
  Trash2, Copy, Lock, Unlock,
  ChevronUp, ChevronDown, RotateCcw,
  Plus, Check, X, SlidersHorizontal,
  GripVertical, MoreHorizontal, FileText, MessageSquare,
  Crop, RefreshCw, Paintbrush, SlidersVertical, Droplets,
  Square as SquareIcon, Link2, Layers, Move, Monitor, Pencil,
  Sparkles, EyeOff, Download, Files, CircleDot, Eclipse, Eye, BookMarked,
  BoxSelect, Maximize2, ArrowUpDown, Upload, Highlighter, LayoutGrid, Target, MinusCircle,
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
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import AITextEditMenu, { type AIEditAction } from '@/components/ebook/AITextEditMenu';
import { supabase } from '@/integrations/supabase/client';
import { WORKSPACE_MEMBERS } from '@/lib/workspaceMembers';
import { useAIPageContext } from './useAIPageContext';
import { getContextualImages, gatherPageText } from '@/lib/contextualImageSuggestions';
import html2canvas from 'html2canvas';

// ─── Types ─────────────────────────────────────────
export interface Page {
  id: string;
  title: string;
  type: 'cover' | 'toc' | 'chapter' | 'chapter-page' | 'back' | 'blank';
  thumbnail?: string;
  locked?: boolean;
  hidden?: boolean;
  bgColor?: string;
  bgPattern?: string;
  bgImage?: string;
  pageBorderType?: 'none' | 'solid' | 'dashed' | 'dotted';
  pageBorderWidth?: number;
  pageBorderColor?: string;
  layout?: string;
}

export type ImageWrapMode = 'in-front' | 'behind' | 'square' | 'tight' | 'top-bottom';

export interface CanvasElement {
  id: string;
  type: 'image' | 'shape' | 'text' | 'interactive';
  x: number; y: number; width: number; height: number;
  content?: string; src?: string;
  fill?: string; stroke?: string; strokeWidth?: number;
  shapeType?: 'rectangle' | 'circle';
  fontSize?: number; fontFamily?: string; textColor?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  fontWeight?: 'normal' | 'bold'; fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  lineHeight?: number;
  locked?: boolean; rotation?: number; zIndex?: number;
  opacity?: number; borderRadius?: number;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted';
  borderWidth?: number; borderColor?: string;
  isPlaceholder?: boolean;
  highlightColor?: string;
  interactiveType?: string;
  interactiveData?: Record<string, any>;
  // Image filters & effects
  brightness?: number; contrast?: number; saturate?: number; blur?: number; grayscale?: number; sepia?: number;
  shadowX?: number; shadowY?: number; shadowBlur?: number; shadowColor?: string;
  objectFit?: 'cover' | 'contain' | 'fill';
  linkUrl?: string;
  // Text wrapping around images
  wrapMode?: ImageWrapMode;
  wrapMargin?: number; // margin in % around the image for text wrapping
}

export type AccessMode = 'editing' | 'viewing' | 'commenting' | 'admin';

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
  onOpenImageSection?: () => void;
  onReplaceStateChange?: (isReplacing: boolean) => void;
  onAiPanelToggle?: (isOpen: boolean) => void;
  pageWidth?: number;
  pageHeight?: number;
  accessMode?: AccessMode;
  initialPageElements?: Record<string, CanvasElement[]>;
  onPageElementsChange?: (elements: Record<string, CanvasElement[]>) => void;
  panelOffset?: number;
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
  { id: 'ai', icon: Sparkles, label: 'AI Assistant' },
  { id: 'add', icon: Plus, label: 'Add Page' },
  { id: 'duplicate', icon: Copy, label: 'Duplicate Page' },
  { id: 'lock', icon: Unlock, label: 'Lock Page' },
  { id: 'hide', icon: EyeOff, label: 'Hide Page' },
  { id: 'download', icon: Download, label: 'Download Page' },
  { id: 'delete', icon: Trash2, label: 'Delete Page' },
  { id: 'moveUp', icon: ChevronUp, label: 'Move Page Up' },
  { id: 'moveDown', icon: ChevronDown, label: 'Move Page Down' },
  { id: 'settings', icon: SlidersHorizontal, label: 'Page Settings' },
];

const FONTS = ['Inter', 'Playfair Display', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Georgia', 'Merriweather'];
const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72];
const STOCK_IMAGES = [
  // Business & Office
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop',
  // Technology
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop',
  // Nature & Landscapes
  'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=600&auto=format&fit=crop',
  // Education & Books
  'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop',
  // Creative & Abstract
  'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1604076913837-52ab5f7c4ccb?w=600&auto=format&fit=crop',
  // Health & Wellness
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&auto=format&fit=crop',
  // Food & Lifestyle
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&auto=format&fit=crop',
  // Architecture & Interior
  'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1431576901776-e539bd916ba2?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&auto=format&fit=crop',
  // Travel & Adventure
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=600&auto=format&fit=crop',
  // People & Portraits
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop',
  // Finance & Marketing
  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1563986768609-322da13575f2?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1460472178825-e5240623afd5?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop',
  // Science & Space
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop',
  // Music & Arts
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&auto=format&fit=crop',
  // Sports & Fitness
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1461896836934-bd45ba8c8cd4?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&auto=format&fit=crop',
  // Textures & Backgrounds
  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1557683316-973673baf926?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop',
  // Animals & Pets
  'https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=600&auto=format&fit=crop',
  // Fashion & Style
  'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&auto=format&fit=crop',
];

// ─── Image Seeding (different image per book/chapter, consistent for same title) ───
const strHash = (s: string): number => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return (h >>> 0);
};
const seededImage = (seed: string, offset = 0): string =>
  STOCK_IMAGES[(strHash(seed) + offset) % STOCK_IMAGES.length];

// ─── Cover palette/layout variants ───
const COVER_PALETTES = [
  { bg: '#1a1a2e', accent: '#0891b2', text: '#ffffff', sub: '#94a3b8' },
  { bg: '#0f172a', accent: '#7c3aed', text: '#f1f5f9', sub: '#94a3b8' },
  { bg: '#064e3b', accent: '#34d399', text: '#ecfdf5', sub: '#6ee7b7' },
  { bg: '#1e1b4b', accent: '#f59e0b', text: '#fef3c7', sub: '#fbbf24' },
  { bg: '#1f2937', accent: '#ef4444', text: '#ffffff', sub: '#fca5a5' },
  { bg: '#0c4a6e', accent: '#38bdf8', text: '#f0f9ff', sub: '#7dd3fc' },
];

// ─── Element Generators ────────────────────────────
const createCoverElements = (title: string): CanvasElement[] => {
  const imgSrc = seededImage(title + '-cover');
  const layoutVariant = strHash(title + '-layout') % 3;
  const palette = COVER_PALETTES[strHash(title) % COVER_PALETTES.length];

  if (layoutVariant === 0) {
    // Layout 0: Image fills top 58%, solid panel owns bottom 42%
    // Text lives entirely on the solid panel → 100% face-safe
    return [
      { id: 'cover-image', type: 'image', x: 0, y: 0, width: 100, height: 60, src: imgSrc },
      { id: 'cover-panel', type: 'shape', x: 0, y: 58, width: 100, height: 42, fill: palette.bg, stroke: 'transparent', shapeType: 'rectangle' },
      { id: 'cover-accent', type: 'shape', x: 6, y: 61, width: 22, height: 1.2, fill: palette.accent, stroke: 'transparent', shapeType: 'rectangle' },
      { id: 'title-text', type: 'text', x: 6, y: 64, width: 88, height: 22, content: title || 'Untitled Book', fontSize: 20, fontFamily: 'Georgia', textColor: palette.text, lineHeight: 1.25, fontWeight: 'bold' },
      { id: 'subtitle-text', type: 'text', x: 6, y: 89, width: 60, height: 5, content: 'YOUR COMPLETE TUTORIAL GUIDE', fontSize: 9, fontFamily: 'Inter', textColor: palette.sub },
    ] as CanvasElement[];
  } else if (layoutVariant === 1) {
    // Layout 1: Full-bleed image + SOLID opaque bottom band for text
    // Band starts at 60% so faces (typically in top 55%) are fully visible
    const stripeColor = palette.accent;
    return [
      { id: 'cover-image', type: 'image', x: 0, y: 0, width: 100, height: 100, src: imgSrc },
      { id: 'cover-band', type: 'shape', x: 0, y: 60, width: 100, height: 40, fill: palette.bg, stroke: 'transparent', shapeType: 'rectangle' },
      { id: 'cover-stripe', type: 'shape', x: 0, y: 60, width: 4, height: 40, fill: stripeColor, stroke: 'transparent', shapeType: 'rectangle' },
      { id: 'cover-rule', type: 'shape', x: 0, y: 60, width: 100, height: 0.5, fill: stripeColor, stroke: 'transparent', shapeType: 'rectangle' },
      { id: 'title-text', type: 'text', x: 8, y: 63, width: 84, height: 22, content: title || 'Untitled Book', fontSize: 20, fontFamily: 'Georgia', textColor: palette.text, lineHeight: 1.2, fontWeight: 'bold' },
      { id: 'subtitle-text', type: 'text', x: 8, y: 87, width: 60, height: 5, content: 'THE DEFINITIVE GUIDE', fontSize: 9, fontFamily: 'Inter', textColor: stripeColor },
    ] as CanvasElement[];
  } else {
    // Layout 2: Solid colour fills entire top 52%, image is bottom 48%
    // Text is above on solid bg — image below
    return [
      { id: 'cover-bg', type: 'shape', x: 0, y: 0, width: 100, height: 100, fill: palette.bg, stroke: 'transparent', shapeType: 'rectangle' },
      { id: 'title-text', type: 'text', x: 8, y: 8, width: 84, height: 30, content: title || 'Untitled Book', fontSize: 22, fontFamily: 'Georgia', textColor: palette.text, lineHeight: 1.25, fontWeight: 'bold' },
      { id: 'cover-accent', type: 'shape', x: 8, y: 41, width: 20, height: 1.2, fill: palette.accent, stroke: 'transparent', shapeType: 'rectangle' },
      { id: 'subtitle-text', type: 'text', x: 8, y: 44, width: 60, height: 5, content: 'A COMPREHENSIVE GUIDE', fontSize: 9, fontFamily: 'Inter', textColor: palette.sub },
      { id: 'cover-image', type: 'image', x: 0, y: 52, width: 100, height: 48, src: imgSrc },
    ] as CanvasElement[];
  }
};

export const buildTocElements = (pages: Page[]): CanvasElement[] => {
  const chapterPages = pages.filter(p => p.type === 'chapter');
  const maxItems = Math.min(chapterPages.length, 14);
  const startY = 20;
  const itemSpacing = maxItems > 10 ? 5.2 : maxItems > 7 ? 6.2 : 7.5;

  const elements: CanvasElement[] = [
    { id: 'toc-header', type: 'text', x: 8, y: 5, width: 84, height: 8, content: 'TABLE OF CONTENTS', fontSize: 18, fontFamily: 'Georgia', textColor: '#1a1a2e', fontWeight: 'bold' } as CanvasElement,
    { id: 'toc-accent', type: 'shape', x: 8, y: 14, width: 14, height: 0.8, fill: '#0891b2', stroke: 'transparent', shapeType: 'rectangle' } as CanvasElement,
  ];

  // Compute content page number (exclude cover, toc, back from numbering)
  const numberablePages = pages.filter(p => p.type !== 'cover' && p.type !== 'toc' && p.type !== 'back');

  chapterPages.slice(0, maxItems).forEach((page, i) => {
    const pageNum = numberablePages.indexOf(page) + 1;
    const y = startY + i * itemSpacing;
    // Chapter number
    elements.push({ id: `toc-num${i}`, type: 'text', x: 8, y, width: 8, height: itemSpacing - 0.5, content: String(i + 1).padStart(2, '0'), fontSize: 10, fontFamily: 'Inter', textColor: '#0891b2', fontWeight: 'bold' } as CanvasElement);
    // Chapter title
    elements.push({ id: `toc-title${i}`, type: 'text', x: 17, y, width: 68, height: itemSpacing - 0.5, content: page.title, fontSize: 11, fontFamily: 'Georgia', textColor: '#1f2937' } as CanvasElement);
    // Page number — right-aligned
    elements.push({ id: `toc-page${i}`, type: 'text', x: 86, y, width: 7, height: itemSpacing - 0.5, content: String(pageNum), fontSize: 10, fontFamily: 'Inter', textColor: '#6b7280', textAlign: 'right' } as CanvasElement);
    // Subtle separator line
    if (i < maxItems - 1) {
      elements.push({ id: `toc-sep${i}`, type: 'shape', x: 17, y: y + itemSpacing - 0.8, width: 76, height: 0.25, fill: '#e5e7eb', stroke: 'transparent', shapeType: 'rectangle' } as CanvasElement);
    }
  });

  return elements;
};

const createTocElements = (pages: Page[]): CanvasElement[] => buildTocElements(pages);

const CHAPTER_PALETTES = [
  { accent: '#0891b2', eyebrow: '#0891b2' },
  { accent: '#7c3aed', eyebrow: '#7c3aed' },
  { accent: '#059669', eyebrow: '#059669' },
  { accent: '#d97706', eyebrow: '#d97706' },
  { accent: '#dc2626', eyebrow: '#dc2626' },
  { accent: '#2563eb', eyebrow: '#2563eb' },
];

const CHAPTER_SUMMARIES: Record<string, string> = {
  'Getting Started': 'Learn the basics of the eBook Creator — from launching a new project to navigating the interface.',
  'The Canvas Editor': 'Master the drag-and-drop canvas where you design every page of your book visually.',
  'Templates & Themes': 'Explore 8 professionally designed templates and learn how to switch between them instantly.',
  'AI Tools & Assistant': 'Discover how the built-in AI can rewrite, expand, and improve your content automatically.',
  'Publishing & Sharing': 'Export your finished book as a PDF, share it with collaborators, or publish it online.',
};

const createChapterElements = (num: number, title: string): CanvasElement[] => {
  const imgSrc = seededImage(title + num + '-chapter', num * 3);
  const pal = CHAPTER_PALETTES[(num - 1) % CHAPTER_PALETTES.length];
  const summary = CHAPTER_SUMMARIES[title] || '';

  // Chapter covers always use a full-page image with overlay text
  return [
    { id: `ch${num}-img`, type: 'image', x: 0, y: 0, width: 100, height: 100, src: imgSrc },
    { id: `ch${num}-overlay`, type: 'shape', x: 0, y: 55, width: 100, height: 45, fill: 'rgba(0,0,0,0.55)', stroke: 'transparent', shapeType: 'rectangle' },
    { id: `ch${num}-eyebrow`, type: 'text', x: 8, y: 60, width: 50, height: 5, content: `Chapter ${num}`, fontSize: 11, fontFamily: 'Inter', textColor: pal.accent, fontWeight: 'bold' },
    { id: `ch${num}-title`, type: 'text', x: 8, y: 66, width: 84, height: 14, content: title, fontSize: 22, fontFamily: 'Georgia', textColor: '#ffffff', fontWeight: 'bold', lineHeight: 1.15 },
    { id: `ch${num}-divider`, type: 'shape', x: 8, y: 82, width: 15, height: 0.6, fill: pal.accent, stroke: 'transparent', shapeType: 'rectangle' },
    { id: `ch${num}-body`, type: 'text', x: 8, y: 85, width: 84, height: 10, content: summary, fontSize: 11, fontFamily: 'Georgia', textColor: 'rgba(255,255,255,0.75)', lineHeight: 1.4 },
  ];
};

const TUTORIAL_CONTENT: Record<string, string> = {
  'Your First AI-Generated Book': "Welcome to the eBook Creator! This tool lets you go from a simple idea to a fully designed, multi-chapter book in minutes using AI.\n\nTo create your first book, click the \"New eBook\" button on the projects page. You'll be guided through three steps: Idea, Generate, and Design. In the Idea step, type a topic or prompt — something like \"A beginner's guide to personal finance\" — and the AI will suggest polished titles for your book.\n\nOnce you pick a title, the AI generates a complete chapter outline with descriptions, page counts, and suggested topics. You can edit any chapter title, reorder chapters, add new ones, or remove ones you don't need. When you're happy with the outline, hit \"Generate eBook\" and watch as the AI writes every page.\n\nThe generation process typically takes 1–3 minutes depending on the number of chapters. You'll see a live progress overlay showing each chapter being written in real time, complete with a page-turn preview of your book taking shape.\n\nDuring generation, the AI writes each chapter sequentially, producing polished paragraphs with proper transitions, topic sentences, and supporting details. The content adapts to your chosen tone — whether that's professional for a business guide, conversational for a lifestyle blog-style book, or academic for educational materials.\n\nOnce generation completes, your book opens directly in the Design tab where you can see every page laid out on the canvas. At this point, all text is fully editable — you can rewrite any paragraph, fix phrasing, add personal anecdotes, or restructure sections to match your voice.\n\nImages are generated in the background after the text is complete. You'll see placeholder frames on chapter covers and image-enabled content pages. These fill in automatically as the AI produces contextual visuals based on each chapter's content. If an image doesn't match your vision, you can replace it with your own upload or generate a new one with a custom prompt.\n\nThe projects listing page acts as your home base. Every book you create appears here with its current status, word count, chapter count, and a thumbnail of the cover. You can open any project to continue editing, duplicate it to create a variation, or delete projects you no longer need.\n\nTip: Start with a clear, specific prompt for the best results. Instead of \"Write a book about marketing,\" try \"A practical guide to social media marketing for small business owners, covering Instagram, TikTok, and LinkedIn strategies with real-world case studies.\" The more context you give, the more tailored and useful the generated content will be.",
  'Customizing Your Outline': "The Book Blueprint step is where you shape the structure of your book before any content is generated. Think of it as the architectural plan.\n\nEach chapter card shows its title, description, estimated page count, and topics. Click any field to edit it directly. You can drag chapters to reorder them, or use the \"AI Chapter\" button to have the AI suggest a new chapter that fits the context of your existing outline.\n\nGlobal settings let you control the word count per chapter (from 500 to 3,000 words), the content type (Text Only, Text + Images, or Text + Images + Interactive), and the tone of writing (Professional, Conversational, Academic, etc.).\n\nThe Confidence Stats Bar at the top shows real-time totals: how many chapters, pages, words, and images your book will contain. Adjusting any setting instantly updates these projections so you know exactly what you're getting before generation begins.",
  'Working with Text & Images': "The canvas is your visual workspace. Every page of your book is displayed as a card that you can scroll through vertically. Click any element — text, image, or shape — to select it and reveal its editing toolbar.\n\nFor text elements, click once to select, then double-click to enter edit mode. You can type directly, change fonts, adjust sizes, toggle bold/italic, and set text alignment. The AI Text Writer tool (accessible via the sparkle icon) can rewrite, expand, shorten, or improve any selected text automatically.\n\nImages can be added by dragging from the Design sidebar or clicking the image tool. Each image element supports replace, crop, filters (brightness, contrast, saturation), and AI-powered enhancements. Content pages can optionally include a top image — toggle this on or off depending on your layout preference.\n\nShapes like rectangles and circles serve as decorative elements, dividers, or colored backgrounds. Every element can be resized, repositioned, rotated, and layered using the z-index controls.",
  'Page Management': "Pages are listed in the left sidebar and displayed sequentially on the canvas. You can add new pages using the \"+\" button, which offers three options: Chapter Cover (full-page image with overlay title), Content Page (text-focused with optional top image), and Blank Page.\n\nTo reorder pages, drag them in the sidebar or use the Move Up/Down buttons in the page action toolbar on the right side of each page. You can duplicate any page to create a copy, or delete pages you no longer need. Cover and Back Cover pages are protected and cannot be deleted.\n\nPage numbers are automatically synchronized across the left sidebar, the canvas, and the right panel. The Table of Contents page updates itself whenever you add, remove, rename, or reorder chapter pages.\n\nLocking a page prevents accidental edits — useful when you've finalized a design and want to protect it while working on other pages.",
  'Applying & Switching Templates': "The eBook Creator includes 12 professionally designed templates: Editorial, Nordic, Luxe, Slate, Terra, Split, Broadsheet, Pastel, Mono, Aurora, Rosé, and Sage. Each template defines a complete visual system — fonts, colors, layouts, and decorative elements — that transforms every page of your book simultaneously.\n\nTo switch templates, open the Design sidebar and scroll to the Templates section. Click any template thumbnail to preview it, then confirm to apply. The system preserves all your existing text content while rebuilding the visual layout with the new template's design language.\n\nEach template handles page types differently. For example, the \"Split\" template uses a two-column layout on content pages, while \"Broadsheet\" mimics a classic editorial grid. The \"Mono\" template uses stark Swiss typography, and \"Aurora\" features vibrant gradient backgrounds. Chapter covers maintain full-page images across all templates, but the overlay treatment, typography, and accent colors change to match the theme.\n\nYou can switch templates as many times as you want — your content is never lost. This makes it easy to experiment with different looks before settling on a final design.",
  'Using the AI Writing Tools': "The AI assistant is integrated throughout the editor to help you write, edit, and improve your content without leaving the canvas.\n\nThe AI Text Writer appears when you select any text element and click the sparkle icon. It offers preset actions — Improve Writing, Fix Spelling & Grammar, Make Shorter, Make Longer, Simplify Language — as well as a custom prompt field where you can give specific instructions like \"Make this more persuasive\" or \"Add a real-world example.\"\n\nThe AIVA chat panel (accessible from the left sidebar's AI tab) provides a conversational interface. You can ask it to write new sections, suggest headlines, restructure paragraphs, or even generate entirely new pages. AIVA is context-aware — it knows which page you're working on and can reference surrounding content.\n\nThe Director panel on the right sidebar provides a Performance Snapshot scoring your book on Readability, Engagement, and Visual Balance. It suggests Priority Fixes with one-click action buttons that send improvement prompts directly to AIVA.\n\nFor images, the AI can generate contextual visuals based on your page content. When you add a new Content Page or Chapter Cover, the AI automatically creates a relevant image prompt and placeholder while the final image is generated in the background.",
  'Exporting Your Finished Book': "When your book is complete, you have several options for sharing and distribution.\n\nThe Share button in the top toolbar opens a modal where you can generate a public link, invite collaborators with different permission levels (Editing, Viewing, Commenting), or copy the book to your clipboard. Collaborators can work on the book simultaneously with real-time sync.\n\nFor PDF export, click the Download button to generate a high-quality PDF that preserves all your layouts, fonts, images, and design elements exactly as they appear on the canvas. The export process handles page sizing, margins, and bleed areas automatically.\n\nYou can also duplicate your entire project from the projects listing page — useful for creating variations or A/B testing different designs. Each duplicate is fully independent and can be modified without affecting the original.\n\nThe projects listing page serves as your dashboard, showing all your books with their status (Draft, Published, Generating), word count, chapter count, and last-modified date. From here you can open any book to continue editing, or start a fresh project.",
};

const TUTORIAL_CONTINUATION: Record<string, string> = {
  'Your First AI-Generated Book': "The projects listing page acts as your home base. Every book you create appears here with its current status, word count, chapter count, and a thumbnail of the cover. You can open any project to continue editing, duplicate it to create a variation, or delete projects you no longer need.\n\nWhen you return to a project, the editor restores your exact state — scroll position, selected page, panel layout, and all unsaved edits are preserved. The auto-save system continuously writes your changes so you never lose work, even if you close the browser accidentally.\n\nFor collaborative projects, multiple people can work on the same book simultaneously. Each collaborator's cursor and selection are visible in real time, and changes merge automatically without conflicts. Use the Invite button in the top toolbar to add team members with different permission levels.\n\nTip: Start with a clear, specific prompt for the best results. Instead of \"Write a book about marketing,\" try \"A practical guide to social media marketing for small business owners, covering Instagram, TikTok, and LinkedIn strategies with real-world case studies.\" The more context you provide, the more tailored and useful the generated content will be.\n\nYou can also use the \"Rebuild My Book\" option at any time to regenerate content with different settings — change the tone from professional to conversational, increase the word count, or switch from text-only to text with images. The AI will rewrite the entire book while preserving your structural outline.",
};

const TUTORIAL_CONTENT_KEYS = Object.keys(TUTORIAL_CONTENT);

const createChapterPageElements = (num: number, title: string): CanvasElement[] => {
  const pal = CHAPTER_PALETTES[(num - 1) % CHAPTER_PALETTES.length];
  const isContinuation = !title || title.trim() === '';

  // For continuation pages, find the previous page's title to get continuation content
  let sampleText: string;
  if (isContinuation) {
    // Use continuation content keyed by previous content page title, or fall back
    const contKeys = Object.keys(TUTORIAL_CONTINUATION);
    sampleText = TUTORIAL_CONTINUATION[contKeys[(num - 1) % contKeys.length]] || TUTORIAL_CONTENT[TUTORIAL_CONTENT_KEYS[(num - 1) % TUTORIAL_CONTENT_KEYS.length]];
  } else {
    sampleText = TUTORIAL_CONTENT[title] || TUTORIAL_CONTENT[TUTORIAL_CONTENT_KEYS[(num - 1) % TUTORIAL_CONTENT_KEYS.length]];
  }

  if (isContinuation) {
    // No title, no divider — body starts near the top
    return [
      { id: `cp${num}-body`, type: 'text', x: 8, y: 5, width: 84, height: 88, content: sampleText, fontSize: 12, fontFamily: 'Georgia', textColor: '#374151', lineHeight: 1.65 },
      { id: `cp${num}-pagenum`, type: 'text', x: 82, y: 95, width: 10, height: 4, content: `${num}`, fontSize: 10, fontFamily: 'Inter', textColor: '#9ca3af', textAlign: 'right' },
    ];
  }

  return [
    { id: `cp${num}-title`, type: 'text', x: 8, y: 4, width: 78, height: 10, content: title, fontSize: 16, fontFamily: 'Georgia', textColor: '#1a1a2e', fontWeight: 'bold', lineHeight: 1.2 },
    { id: `cp${num}-divider`, type: 'shape', x: 8, y: 15.5, width: 12, height: 0.6, fill: pal.accent, stroke: 'transparent', shapeType: 'rectangle' },
    { id: `cp${num}-body`, type: 'text', x: 8, y: 18, width: 84, height: 74, content: sampleText, fontSize: 12, fontFamily: 'Georgia', textColor: '#374151', lineHeight: 1.65 },
    { id: `cp${num}-pagenum`, type: 'text', x: 82, y: 95, width: 10, height: 4, content: `${num}`, fontSize: 10, fontFamily: 'Inter', textColor: '#9ca3af', textAlign: 'right' },
  ];
};

const BACK_PALETTES = [
  { bg: '#0d4f4f', accent: '#34d399', text: '#ffffff', sub: '#6ee7b7' },
  { bg: '#1a1a2e', accent: '#818cf8', text: '#f1f5f9', sub: '#a5b4fc' },
  { bg: '#1e1b4b', accent: '#fbbf24', text: '#fef9c3', sub: '#fde68a' },
  { bg: '#0f172a', accent: '#38bdf8', text: '#e0f2fe', sub: '#7dd3fc' },
  { bg: '#064e3b', accent: '#86efac', text: '#dcfce7', sub: '#bbf7d0' },
];

const createBackElements = (title: string): CanvasElement[] => {
  const pal = BACK_PALETTES[strHash(title + '-back') % BACK_PALETTES.length];
  return [
    { id: 'back-bg', type: 'shape', x: 0, y: 0, width: 100, height: 100, fill: pal.bg, stroke: 'transparent', shapeType: 'rectangle' },
    { id: 'back-accent', type: 'shape', x: 38, y: 28, width: 24, height: 0.8, fill: pal.accent, stroke: 'transparent', shapeType: 'rectangle' },
    { id: 'back-blurb', type: 'text', x: 12, y: 32, width: 76, height: 22, content: 'This book was crafted to give you practical, actionable insights you can apply right away. Whether you\'re just getting started or looking to level up, these pages were designed with your success in mind.', fontSize: 11, fontFamily: 'Georgia', textColor: pal.sub, lineHeight: 1.7, textAlign: 'center' },
    { id: 'back-rule', type: 'shape', x: 40, y: 58, width: 20, height: 0.4, fill: pal.accent, stroke: 'transparent', shapeType: 'rectangle' },
    { id: 'back-logo', type: 'text', x: 15, y: 62, width: 70, height: 8, content: title || 'Untitled', fontSize: 14, fontFamily: 'Georgia', textColor: pal.text, fontWeight: 'bold', lineHeight: 1.3, textAlign: 'center' },
    { id: 'back-tag', type: 'text', x: 20, y: 73, width: 60, height: 5, content: 'Thank you for reading', fontSize: 10, fontFamily: 'Inter', textColor: pal.sub, textAlign: 'center' },
  ];
};

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
    case 'back': return createBackElements(bookTitle);
    case 'blank': return [];
    default: return [];
  }
};

/** Return stored elements if non-empty, otherwise generate defaults.
 *  Blank pages intentionally have 0 elements, so skip fallback for them. */
const resolvePageElements = (
  stored: Record<string, CanvasElement[]>,
  page: Page, allPages: Page[], bookTitle: string,
): CanvasElement[] => {
  const elems = stored[page.id];
  if (elems && (elems.length > 0 || page.type === 'blank')) return elems;
  return getElementsForPage(page, allPages, bookTitle);
};

const PAGE_TYPE_OPTIONS: { type: Page['type']; label: string; description: string; icon: string }[] = [
  { type: 'chapter', label: 'Chapter Cover', description: 'Full image with chapter number & title', icon: '📖' },
  { type: 'chapter-page', label: 'Content Page', description: 'Text content with title and body', icon: '📄' },
  { type: 'blank', label: 'Blank Page', description: 'Empty page to design from scratch', icon: '📃' },
];

export interface EbookCanvasEditorHandle {
  addElement: (type: string, extra?: any) => void;
  getTextElements: (scope: 'page' | 'book') => { pageId: string; elementId: string; content: string }[];
  updateTextContent: (updates: { pageId: string; elementId: string; content: string }[]) => void;
  isReplacingImage: () => boolean;
  replaceImage: (src: string) => void;
  setPageContent: (pageId: string, content: string) => void;
  undo: () => void;
  redo: () => void;
  selectElement: (elementId: string) => void;
  editElement: (elementId: string) => void;
  triggerReplaceImage: (elementId: string) => void;
}

// ─── Component ─────────────────────────────────────
const EbookCanvasEditor = forwardRef<EbookCanvasEditorHandle, EbookCanvasEditorProps>(({
  pages, selectedPageId, onPageSelect, onPagesChange, bookTitle,
  showPagesPanel = true, zoom: externalZoom, onZoomChange,
  isGridView = false, onGridViewToggle,
  findReplaceMode, onFindReplaceModeChange,
  onPageSettingsToggle, onOpenImageSection, onReplaceStateChange, onAiPanelToggle,
  pageWidth: pw = 480, pageHeight: ph = 640,
  accessMode = 'editing',
  initialPageElements, onPageElementsChange,
  panelOffset = 0,
}, ref) => {
  const [internalPages, setInternalPages] = useState<Page[]>(pages);
  const currentPages = onPagesChange ? pages : internalPages;
  const setPages = (fn: Page[] | ((p: Page[]) => Page[])) => {
    const result = typeof fn === 'function' ? fn(currentPages) : fn;
    onPagesChange ? onPagesChange(result) : setInternalPages(result);
  };

  useEffect(() => { if (!onPagesChange) setInternalPages(pages); }, [pages, onPagesChange]);

  // Sync bookTitle to cover and back cover elements when it changes
  // Uses setPageElementsRaw to avoid triggering onPageElementsChange feedback loop
  useEffect(() => {
    if (!bookTitle) return;
    setPageElementsRaw(prev => {
      const updated = { ...prev };
      let changed = false;
      currentPages.forEach(page => {
        const elems = updated[page.id];
        if (!elems) return;
        if (page.type === 'cover') {
          const titleEl = elems.find(e => e.id === 'title-text');
          if (titleEl && titleEl.content !== bookTitle) {
            updated[page.id] = elems.map(e => e.id === 'title-text' ? { ...e, content: bookTitle } : e);
            changed = true;
          }
        }
        if (page.type === 'back') {
          const logoEl = elems.find(e => e.id === 'back-logo');
          if (logoEl && logoEl.content !== bookTitle) {
            updated[page.id] = elems.map(e => e.id === 'back-logo' ? { ...e, content: bookTitle } : e);
            changed = true;
          }
        }
      });
      return changed ? updated : prev;
    });
  }, [bookTitle, currentPages]);

  // Auto-sync TOC page whenever pages are added, removed, renamed, or reordered
  // Uses setPageElementsRaw to avoid triggering onPageElementsChange feedback loop
  const tocSyncKeyRef = useRef('');
  useEffect(() => {
    const tocPage = currentPages.find(p => p.type === 'toc');
    if (!tocPage) return;
    const tocKey = currentPages
      .filter(p => p.type === 'chapter')
      .map((p, i) => `${i}:${p.title}:${currentPages.indexOf(p)}`)
      .join('|');
    if (tocKey === tocSyncKeyRef.current) return;
    tocSyncKeyRef.current = tocKey;
    setPageElementsRaw(prev => ({
      ...prev,
      [tocPage.id]: buildTocElements(currentPages),
    }));
  }, [currentPages]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-sync page number elements whenever pages are reordered, added, or removed
  const pageNumSyncKeyRef = useRef('');
  useEffect(() => {
    const pageNumKey = currentPages.map(p => p.id).join('|');
    if (pageNumKey === pageNumSyncKeyRef.current) return;
    pageNumSyncKeyRef.current = pageNumKey;
    setPageElementsRaw(prev => {
      const updated = { ...prev };
      let changed = false;
      currentPages.forEach((page, canvasIdx) => {
        const elems = updated[page.id];
        if (!elems) return;
        const newPageNum = String(canvasIdx + 1);
        const updatedElems = elems.map(el => {
          if ((el.id.endsWith('-pagenum') || el.id === 'page-number') && el.content !== newPageNum) {
            changed = true;
            return { ...el, content: newPageNum };
          }
          return el;
        });
        if (changed) updated[page.id] = updatedElems;
      });
      return changed ? updated : prev;
    });
  }, [currentPages]); // eslint-disable-line react-hooks/exhaustive-deps

  const [activeTool, setActiveTool] = useState('select');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  // Backfill empty body text elements with sample content so users can see formatting
  const backfillEmptyBodies = useCallback((elements: Record<string, CanvasElement[]>): Record<string, CanvasElement[]> => {
    let changed = false;
    const patched: Record<string, CanvasElement[]> = {};
    for (const [pageId, elems] of Object.entries(elements)) {
      const patchedElems = elems.map((el, _i) => {
        if (el.type === 'text' && (el.id.includes('body') || el.id.includes('-body')) && (!el.content || el.content.trim() === '')) {
          changed = true;
          const idx = parseInt(el.id.replace(/\D/g, '') || '0', 10);
          return { ...el, content: TUTORIAL_CONTENT[TUTORIAL_CONTENT_KEYS[idx % TUTORIAL_CONTENT_KEYS.length]] };
        }
        return el;
      });
      patched[pageId] = patchedElems;
    }
    return changed ? patched : elements;
  }, []);

  const [pageElements, setPageElementsRaw] = useState<Record<string, CanvasElement[]>>(() => backfillEmptyBodies(initialPageElements || {}));
  const setPageElements: typeof setPageElementsRaw = useCallback((update) => {
    setPageElementsRaw(prev => {
      const next = typeof update === 'function' ? update(prev) : update;
      onPageElementsChange?.(next);
      return next;
    });
  }, [onPageElementsChange]);
  useEffect(() => {
    if (!initialPageElements) return;
    setPageElementsRaw(backfillEmptyBodies(initialPageElements));
  }, [initialPageElements, backfillEmptyBodies]);
  const [dragState, setDragState] = useState<{ id: string; startX: number; startY: number; elemX: number; elemY: number } | null>(null);
  const [resizeState, setResizeState] = useState<{ id: string; handle: string; startX: number; startY: number; elemX: number; elemY: number; elemW: number; elemH: number } | null>(null);
  const [rotateState, setRotateState] = useState<{ id: string; centerX: number; centerY: number; startAngle: number; elemRotation: number } | null>(null);
  const [undoStack, setUndoStack] = useState<Record<string, CanvasElement[]>[]>([]);
  const [redoStack, setRedoStack] = useState<Record<string, CanvasElement[]>[]>([]);
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [draggedPageIndex, setDraggedPageIndex] = useState<number | null>(null);
  const [dragOverPageIndex, setDragOverPageIndex] = useState<number | null>(null);
  const [gridPagesSnapshot, setGridPagesSnapshot] = useState<Page[] | null>(null);
  const [showGridCancelConfirm, setShowGridCancelConfirm] = useState(false);
  const [showAIEditModal, setShowAIEditModal] = useState(false);
  const [replaceModalElementId, setReplaceModalElementIdRaw] = useState<string | null>(null);
  const setReplaceModalElementId = useCallback((id: string | null) => {
    setReplaceModalElementIdRaw(id);
    onReplaceStateChange?.(!!id);
  }, [onReplaceStateChange]);
  const [aiEditPrompt, setAIEditPrompt] = useState('');
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [contextualAIPrompt, setContextualAIPrompt] = useState('');
  const [aiUpdatedFeedback, setAiUpdatedFeedback] = useState(false);
  const [gridInsertHover, setGridInsertHover] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; elements: CanvasElement[]; pageId: string } | null>(null);
  const [gridMenuOpenId, setGridMenuOpenId] = useState<string | null>(null);
  const [aiExpandedPageId, setAiExpandedPageId] = useState<string | null>(null);
  const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null);
  // External drag-drop state (from sidebar)
  const [externalDropTarget, setExternalDropTarget] = useState<{ pageId: string; x: number; y: number } | null>(null);

  // ─── Shared AI Context Engine ─────────────────────────
  const selectedPageObj = currentPages.find(p => p.id === selectedPageId);
  const storedElements = pageElements[selectedPageId || ''] || [];
  const selectedPageElements = storedElements.length > 0
    ? storedElements
    : (selectedPageObj ? getElementsForPage(selectedPageObj, currentPages, bookTitle) : []);
  // hasImages: placeholder images ARE intentionally placed — count them
  const floatingHasImages = selectedPageElements.some(e => e.type === 'image' && (e.src || e.isPlaceholder));
  // hasHeadline: fontSize>=16 OR id matches title/heading keywords
  const floatingHasHeadline = selectedPageElements.some(e =>
    e.type === 'text' && (
      (e.fontSize || 0) >= 16 ||
      /title|heading|headline|header|chapter-title|masthead/i.test(e.id || '')
    ) && (e.content || '').trim().length > 0
  );
  const floatingBodyWords = selectedPageElements
    .filter(e => e.type === 'text')
    .reduce((acc, e) => acc + (e.content?.split(/\s+/).filter(Boolean).length || 0), 0);
  const floatingAiCtx = useAIPageContext(
    selectedPageObj?.type ?? null,
    selectedPageElements.length > 0,
    selectedPageElements.length,
    floatingHasImages,
    floatingHasHeadline,
    floatingBodyWords,
  );
  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const imageInputRef = useRef<HTMLInputElement>(null);
  const replaceImageInputRef = useRef<HTMLInputElement>(null);
  const isScrollingRef = useRef(false);
  const scrollSelectedRef = useRef(false); // true when page was selected via scroll observer
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingGridTargetRef = useRef<string | null>(null);
  const gridNavigationFrameRef = useRef<number | null>(null);
  const findInputRef = useRef<HTMLInputElement>(null);
  const editableTextRef = useRef<HTMLDivElement>(null);

  const cancelPendingGridNavigation = useCallback(() => {
    if (gridNavigationFrameRef.current !== null) {
      cancelAnimationFrame(gridNavigationFrameRef.current);
      gridNavigationFrameRef.current = null;
    }
  }, []);

  const handleGridPageOpen = useCallback((pageId: string) => {
    cancelPendingGridNavigation();
    pendingGridTargetRef.current = pageId;
    scrollSelectedRef.current = false;
    isScrollingRef.current = true;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
    onPageSelect(pageId);
    onGridViewToggle?.();
  }, [cancelPendingGridNavigation, onPageSelect, onGridViewToggle]);

  useEffect(() => () => cancelPendingGridNavigation(), [cancelPendingGridNavigation]);

  // Snapshot pages when entering grid view for Cancel/Confirm
  useEffect(() => {
    if (isGridView) {
      setGridPagesSnapshot(JSON.parse(JSON.stringify(currentPages)));
      setShowGridCancelConfirm(false);
    } else {
      setGridPagesSnapshot(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGridView]);

  const handleGridCancel = useCallback(() => {
    setShowGridCancelConfirm(true);
  }, []);

  const handleGridCancelConfirm = useCallback(() => {
    if (gridPagesSnapshot) {
      setPages(gridPagesSnapshot);
      toast.success('Changes discarded');
    }
    setShowGridCancelConfirm(false);
    onGridViewToggle?.();
  }, [gridPagesSnapshot, setPages, onGridViewToggle]);

  const handleGridConfirm = useCallback(() => {
    toast.success('Changes saved');
    onGridViewToggle?.();
  }, [onGridViewToggle]);

  // Helper: apply execCommand to selected text inside contentEditable
  const applyRichTextCommand = (command: string, value?: string) => {
    if (!editableTextRef.current) return;
    editableTextRef.current.focus();
    document.execCommand(command, false, value);
    // sync content back
    if (editingTextId) {
      updateElement(editingTextId, { content: editableTextRef.current.innerHTML });
    }
  };

  // Access mode helpers
  const canEdit = accessMode === 'editing' || accessMode === 'admin';
  const canComment = accessMode === 'commenting' || accessMode === 'editing' || accessMode === 'admin';
  const isViewOnly = accessMode === 'viewing';

  // Page comments state (for commenting mode)
  interface PageComment {
    id: string;
    pageId: string;
    x: number; y: number;
    text: string;
    author: string;
    timestamp: string;
    resolved: boolean;
  }
  const [pageComments, setPageComments] = useState<PageComment[]>([]);
  const [commentDraft, setCommentDraft] = useState<{ pageId: string; x: number; y: number } | null>(null);
  const [commentText, setCommentText] = useState('');
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');
  const [mentionIndex, setMentionIndex] = useState(0);
  const commentTextareaRef = useRef<HTMLTextAreaElement>(null);

  const filteredMembers = WORKSPACE_MEMBERS.filter(m =>
    m.name.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  const handleCommentTextChange = (value: string) => {
    setCommentText(value);
    const textarea = commentTextareaRef.current;
    if (!textarea) return;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = value.slice(0, cursorPos);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);
    if (atMatch) {
      setShowMentionDropdown(true);
      setMentionFilter(atMatch[1]);
      setMentionIndex(0);
    } else {
      setShowMentionDropdown(false);
    }
  };

  const insertMention = (memberName: string) => {
    const textarea = commentTextareaRef.current;
    if (!textarea) return;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = commentText.slice(0, cursorPos);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);
    if (atMatch) {
      const before = textBeforeCursor.slice(0, atMatch.index);
      const after = commentText.slice(cursorPos);
      setCommentText(`${before}@${memberName} ${after}`);
    }
    setShowMentionDropdown(false);
    textarea.focus();
  };

  const handleCommentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentionDropdown && filteredMembers.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setMentionIndex(i => Math.min(filteredMembers.length - 1, i + 1)); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setMentionIndex(i => Math.max(0, i - 1)); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertMention(filteredMembers[mentionIndex].name); return; }
      if (e.key === 'Escape') { e.preventDefault(); setShowMentionDropdown(false); return; }
    }
    if (e.key === 'Enter' && !e.shiftKey && !showMentionDropdown) { e.preventDefault(); addPageComment(); }
  };

  const renderCommentText = (text: string) => {
    const parts = text.split(/(@\w[\w\s]*?)(?=\s|$|@)/g);
    return parts.map((part, i) => {
      const member = WORKSPACE_MEMBERS.find(m => part === `@${m.name}`);
      if (member) {
        return <span key={i} className="font-semibold text-accent">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const resolveAllComments = () => {
    setPageComments(prev => prev.map(c => ({ ...c, resolved: true })));
    toast.success('All comments resolved');
  };

  const addPageComment = () => {
    if (!commentDraft || !commentText.trim()) return;
    setPageComments(prev => [...prev, {
      id: `cmt-${Date.now()}`,
      pageId: commentDraft.pageId,
      x: commentDraft.x, y: commentDraft.y,
      text: commentText.trim(),
      author: 'You',
      timestamp: 'Just now',
      resolved: false,
    }]);
    setCommentText('');
    setCommentDraft(null);
    toast.success('Comment added');
  };

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
      const elems = resolvePageElements(pageElements, page, currentPages, bookTitle);
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
    const matchPage = currentPages.find(p => p.id === match.pageId)!;
    const elems = resolvePageElements(pageElements, matchPage, currentPages, bookTitle);
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
      const elems = resolvePageElements(newPageElements, page, currentPages, bookTitle);
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
        if (isScrollingRef.current || pendingGridTargetRef.current) return;
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
            scrollSelectedRef.current = true;
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
        if (pendingGridTargetRef.current) {
          return;
        }
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
          scrollSelectedRef.current = true;
          onPageSelect(closestId);
        }
      }, 50);
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isGridView, selectedPageId, onPageSelect]);

  // Scroll to selected page when it changes (unless triggered by scroll observer)
  const prevSelectedRef = useRef<string | null>(null);
  const prevGridViewRef = useRef(isGridView);
  useLayoutEffect(() => {
    if (isGridView) {
      prevGridViewRef.current = true;
      pendingGridTargetRef.current = null;
      scrollSelectedRef.current = false;
      isScrollingRef.current = false;
      cancelPendingGridNavigation();
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
      return;
    }

    const comingFromGrid = prevGridViewRef.current;
    prevGridViewRef.current = false;
    const targetPageId = pendingGridTargetRef.current ?? selectedPageId;
    const shouldScrollToSelection = Boolean(
      targetPageId &&
      (targetPageId !== prevSelectedRef.current || comingFromGrid) &&
      (!scrollSelectedRef.current || comingFromGrid)
    );

    if (shouldScrollToSelection && targetPageId) {
      scrollSelectedRef.current = false;
      if (comingFromGrid) {
        pendingGridTargetRef.current = targetPageId;
        isScrollingRef.current = true;
      }

      let attempts = 0;
      const maxAttempts = comingFromGrid ? 18 : 6;

      const releaseGridSelectionLock = () => {
        pendingGridTargetRef.current = null;
        isScrollingRef.current = false;
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
          scrollTimeoutRef.current = null;
        }
        cancelPendingGridNavigation();
      };

      const waitForTargetAlignment = () => {
        const container = scrollContainerRef.current;
        const pageEl = pageRefs.current[targetPageId];
        if (!container || !pageEl) {
          releaseGridSelectionLock();
          return;
        }

        const topDelta = Math.abs(pageEl.getBoundingClientRect().top - container.getBoundingClientRect().top);
        if (topDelta <= 4 || attempts >= maxAttempts) {
          releaseGridSelectionLock();
          return;
        }

        attempts += 1;
        pageEl.scrollIntoView({ behavior: 'instant' as ScrollBehavior, block: 'start' });
        gridNavigationFrameRef.current = requestAnimationFrame(waitForTargetAlignment);
      };

      const scrollWhenReady = () => {
        const pageEl = pageRefs.current[targetPageId];
        if (!pageEl) {
          if (attempts >= maxAttempts) {
            releaseGridSelectionLock();
            return;
          }

          attempts += 1;
          gridNavigationFrameRef.current = requestAnimationFrame(scrollWhenReady);
          return;
        }

        pageEl.scrollIntoView({
          behavior: comingFromGrid ? 'instant' as ScrollBehavior : 'smooth',
          block: 'start',
        });

        if (comingFromGrid) {
          attempts = 0;
          gridNavigationFrameRef.current = requestAnimationFrame(waitForTargetAlignment);
        } else {
          cancelPendingGridNavigation();
        }
      };

      cancelPendingGridNavigation();
      scrollWhenReady();
    }

    prevSelectedRef.current = targetPageId ?? selectedPageId;
    scrollSelectedRef.current = false;

    return cancelPendingGridNavigation;
  }, [selectedPageId, isGridView, cancelPendingGridNavigation]);

  // On mount, scroll to top so cover page is fully visible
  const hasInitialScrolled = useRef(false);
  useEffect(() => {
    if (hasInitialScrolled.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    hasInitialScrolled.current = true;
    container.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, []);

  const internalZoom = useState(100);
  const zoomPct = externalZoom ?? internalZoom[0];

  // Compute a base scale so 100% zoom fits the full page in the container
  const [fitScale, setFitScale] = useState(1);
  useLayoutEffect(() => {
    if (isGridView) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    let frameId: number | null = null;

    const computeFit = () => {
      const liveContainer = scrollContainerRef.current;
      if (!liveContainer) return;

      const cw = liveContainer.clientWidth - 80; // padding + page label
      const ch = liveContainer.clientHeight - 64; // vertical padding
      if (cw <= 0 || ch <= 0) return;

      const scaleW = cw / pw;
      const scaleH = ch / ph;
      const nextScale = Math.min(scaleW, scaleH, 1.5);
      if (!Number.isFinite(nextScale) || nextScale <= 0) return;

      setFitScale(nextScale);
    };

    frameId = requestAnimationFrame(computeFit);

    const ro = new ResizeObserver(() => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      frameId = requestAnimationFrame(computeFit);
    });

    ro.observe(container);

    return () => {
      if (frameId !== null) {
        cancelAnimationFrame(frameId);
      }
      ro.disconnect();
    };
  }, [isGridView, pw, ph]);

  const zoom = zoomPct * fitScale;

  const selectedPage = currentPages.find(p => p.id === selectedPageId) || currentPages[0];

  // Init elements for current page
  const currentElements = selectedPage
    ? resolvePageElements(pageElements, selectedPage, currentPages, bookTitle)
    : [];

  const updateElements = useCallback((pageId: string, newElements: CanvasElement[], skipUndo = false) => {
    if (!skipUndo) {
      setUndoStack(prev => [...prev.slice(-50), { ...pageElements }]);
      setRedoStack([]);
    }
    setPageElements(prev => ({ ...prev, [pageId]: newElements }));
  }, [pageElements]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack(r => [...r, { ...pageElements }]);
    setUndoStack(s => s.slice(0, -1));
    setPageElements(prev);
  }, [undoStack, pageElements]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack(s => [...s, { ...pageElements }]);
    setRedoStack(r => r.slice(0, -1));
    setPageElements(next);
  }, [redoStack, pageElements]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) { redo(); } else { undo(); }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      // Arrow key movement for selected element
      if (selectedElementId && !editingTextId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 5 : 1;
        const el = currentElements.find(el => el.id === selectedElementId);
        if (!el || el.locked) return;
        const updates: Partial<CanvasElement> = {};
        if (e.key === 'ArrowUp')    updates.y = Math.max(0, el.y - step);
        if (e.key === 'ArrowDown')  updates.y = Math.min(100 - el.height, el.y + step);
        if (e.key === 'ArrowLeft')  updates.x = Math.max(0, el.x - step);
        if (e.key === 'ArrowRight') updates.x = Math.min(100 - el.width, el.x + step);
        updateElement(el.id, updates);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, selectedElementId, editingTextId, currentElements]);

  const selectedElement = currentElements.find(e => e.id === selectedElementId);

  // ─── Page Actions ─────────────────────────────
  const insertPageAt = (index: number, pageType: Page['type'] = 'chapter') => {
    const titleMap: Record<string, string> = {
      'chapter': 'Chapter Cover',
      'chapter-page': 'Content Page',
      'blank': 'Blank Page',
    };
    const newPage: Page = { id: crypto.randomUUID(), title: titleMap[pageType] || 'New Page', type: pageType, locked: false };
    const newPages = [...currentPages];
    newPages.splice(index, 0, newPage);
    setPages(newPages);
    onPageSelect(newPage.id);
    toast.success('Page added');
  };

  const handleAddPage = (pageType: Page['type'] = 'chapter') => {
    const idx = currentPages.findIndex(p => p.id === selectedPageId);
    insertPageAt(idx + 1, pageType);
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
    setPageElements(prev => ({ ...prev, [dup.id]: [...resolvePageElements(prev, page, currentPages, bookTitle)] }));
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

  const handleDownloadPage = async (targetPageId?: string) => {
    const pageId = targetPageId || selectedPageId;
    const page = currentPages.find(p => p.id === pageId);
    if (!page) return;
    const pageEl = pageRefs.current[pageId];
    if (!pageEl) { toast.error('Page not found'); return; }
    // Find the inner canvas div (the one with fixed pw/ph dimensions)
    const canvasDiv = pageEl.querySelector('[data-page-canvas]') as HTMLElement;
    if (!canvasDiv) { toast.error('Could not capture page'); return; }
    toast.loading('Capturing page...', { id: 'download-page' });
    try {
      const canvas = await html2canvas(canvasDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: page.bgColor || '#ffffff',
        width: pw,
        height: ph,
      });
      const link = document.createElement('a');
      link.download = `${(page.title || 'page').replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success('Page downloaded!', { id: 'download-page' });
    } catch {
      toast.error('Failed to capture page', { id: 'download-page' });
    }
  };

  const handlePageAction = (actionId: string) => {
    switch (actionId) {
      case 'ai': onPageSettingsToggle?.(); break;
      case 'add': /* handled by popover */ break;
      case 'duplicate': handleDuplicatePage(); break;
      case 'delete': handleDeletePage(); break;
      case 'moveUp': handleMovePage('up'); break;
      case 'moveDown': handleMovePage('down'); break;
      case 'lock': handleToggleLock(); break;
      case 'download': handleDownloadPage(); break;
      case 'hide':
        if (selectedPage) {
          setPages(currentPages.map(p => p.id === selectedPageId ? { ...p, hidden: !p.hidden } : p));
          toast.success(selectedPage.hidden ? 'Page visible again' : 'Page hidden from readers');
        }
        break;
      case 'settings':
        if (aiExpandedPageId) { setAiExpandedPageId(null); onAiPanelToggle?.(false); }
        onPageSettingsToggle?.();
        break;
    }
  };
  const isPageLocked = selectedPage?.locked === true;

  // ─── Element Type Resolver ─────────────────────
  // Maps sidebar element IDs (e.g. 'rectangle', 'bar-chart', 'button-primary') to
  // proper CanvasElement types with sensible defaults.
  const resolveElementType = (rawType: string, extra?: Partial<CanvasElement>): { type: CanvasElement['type']; extra: Partial<CanvasElement> } => {
    const merged: Partial<CanvasElement> = { ...extra };

    // ── Shapes ──
    const SHAPE_MAP: Record<string, Partial<CanvasElement>> = {
      rectangle: { shapeType: 'rectangle', fill: '#8B5CF6', stroke: '#6D28D9', strokeWidth: 1, width: 30, height: 20, borderRadius: 4 },
      ellipse:   { shapeType: 'circle',    fill: '#3B82F6', stroke: '#1D4ED8', strokeWidth: 1, width: 20, height: 20 },
      triangle:  { shapeType: 'rectangle', fill: '#F59E0B', stroke: '#D97706', strokeWidth: 0, width: 20, height: 18, borderRadius: 0,
                   content: '▲', fontSize: 48, textColor: '#F59E0B' },
      hexagon:   { shapeType: 'rectangle', fill: '#14B8A6', stroke: '#0D9488', strokeWidth: 1, width: 20, height: 18, borderRadius: 8 },
      star:      { shapeType: 'rectangle', fill: '#FBBF24', stroke: '#F59E0B', strokeWidth: 0, width: 18, height: 18, borderRadius: 0,
                   content: '★', fontSize: 48, textColor: '#FBBF24' },
      diamond:   { shapeType: 'rectangle', fill: '#EC4899', stroke: '#DB2777', strokeWidth: 1, width: 18, height: 22, borderRadius: 0,
                   content: '◆', fontSize: 48, textColor: '#EC4899' },
      pentagon:  { shapeType: 'rectangle', fill: '#6366F1', stroke: '#4F46E5', strokeWidth: 1, width: 20, height: 20, borderRadius: 6 },
    };
    if (SHAPE_MAP[rawType]) {
      return { type: 'shape', extra: { ...SHAPE_MAP[rawType], ...merged } };
    }

    // ── Triangle / Star / Diamond → render as interactive with SVG content ──
    if (rawType === 'triangle' || rawType === 'star' || rawType === 'diamond') {
      const SYMBOL_ELEMENTS: Record<string, { svg: string; color: string }> = {
        triangle: { svg: '▲', color: '#F59E0B' },
        star:     { svg: '★', color: '#FBBF24' },
        diamond:  { svg: '◆', color: '#EC4899' },
      };
      const s = SYMBOL_ELEMENTS[rawType];
      return { type: 'text', extra: { content: s.svg, fontSize: 64, textColor: s.color, textAlign: 'center', width: 15, height: 12, ...merged } };
    }

    // ── Lines & Arrows ──
    const ARROW_MAP: Record<string, string> = {
      'arrow-right': '→', 'arrow-down': '↓', 'arrow-up': '↑', 'arrow-left': '←',
      'chevron-right': '»', 'move-arrows': '✥',
    };
    if (ARROW_MAP[rawType]) {
      return { type: 'text', extra: { content: ARROW_MAP[rawType], fontSize: 36, textColor: rawType.startsWith('arrow') ? '#F97316' : rawType === 'chevron-right' ? '#8B5CF6' : '#FBBF24', textAlign: 'center', width: 10, height: 8, fontWeight: 'bold', ...merged } };
    }

    // ── Icons ──
    const ICON_MAP: Record<string, { symbol: string; color: string }> = {
      sun: { symbol: '☀', color: '#F59E0B' },
      smile: { symbol: '☺', color: '#FBBF24' },
      'star-icon': { symbol: '☆', color: '#FBBF24' },
      check: { symbol: '✓', color: '#10B981' },
      info: { symbol: 'ℹ', color: '#3B82F6' },
      help: { symbol: '?', color: '#8B5CF6' },
      'thumbs-up': { symbol: '👍', color: '#3B82F6' },
      message: { symbol: '💬', color: '#10B981' },
      clock: { symbol: '🕐', color: '#F59E0B' },
      calendar: { symbol: '📅', color: '#8B5CF6' },
      settings: { symbol: '⚙', color: '#6B7280' },
      share: { symbol: '🔗', color: '#3B82F6' },
    };
    if (ICON_MAP[rawType]) {
      const ic = ICON_MAP[rawType];
      return { type: 'text', extra: { content: ic.symbol, fontSize: 42, textColor: ic.color, textAlign: 'center', width: 10, height: 10, ...merged } };
    }

    // ── Stickers & Badges ──
    const STICKER_MAP: Record<string, { symbol: string; color: string }> = {
      'emoji-smile': { symbol: '😊', color: '#FBBF24' },
      'emoji-star': { symbol: '⭐', color: '#FBBF24' },
      verified: { symbol: '✅', color: '#10B981' },
      tag: { symbol: '🏷️', color: '#F59E0B' },
      sparkles: { symbol: '✨', color: '#A855F7' },
      note: { symbol: '📝', color: '#FBBF24' },
    };
    if (STICKER_MAP[rawType]) {
      const st = STICKER_MAP[rawType];
      return { type: 'text', extra: { content: st.symbol, fontSize: 48, textColor: st.color, textAlign: 'center', width: 10, height: 10, ...merged } };
    }

    // ── Charts ──
    const CHART_TYPES = ['bar-chart', 'line-chart', 'pie-chart', 'area-chart', 'donut-chart', 'trending-chart', 'gauge-chart', 'radar-chart', 'funnel-chart'];
    if (CHART_TYPES.includes(rawType)) {
      return { type: 'interactive', extra: { interactiveType: rawType, width: 55, height: 35, ...merged } };
    }

    // ── Tables & Data ──
    const TABLE_TYPES = ['basic-table', 'data-grid', 'list', 'ordered-list', 'checklist', 'columns-layout'];
    if (TABLE_TYPES.includes(rawType)) {
      if (rawType === 'checklist') {
        return { type: 'interactive', extra: { interactiveType: 'checklist', width: 50, height: 30, ...merged } };
      }
      return { type: 'interactive', extra: { interactiveType: rawType, width: 55, height: 35, ...merged } };
    }

    // ── Buttons ──
    const BUTTON_MAP: Record<string, { label: string; bg: string }> = {
      'button-primary': { label: 'Click Here', bg: '#3B82F6' },
      'button-signup': { label: 'Sign Up', bg: '#10B981' },
      'button-cta': { label: 'Get Started', bg: '#EC4899' },
    };
    if (BUTTON_MAP[rawType]) {
      const btn = BUTTON_MAP[rawType];
      return { type: 'interactive', extra: { interactiveType: rawType, interactiveData: { label: btn.label, bg: btn.bg }, width: 30, height: 8, ...merged } };
    }

    // ── Actions & Hotspots ──
    const ACTION_TYPES = ['action-link', 'action-page', 'action-popup', 'action-audio', 'action-download', 'hotspot-link'];
    if (ACTION_TYPES.includes(rawType)) {
      return { type: 'interactive', extra: { interactiveType: rawType, width: 30, height: 8, ...merged } };
    }

    // ── Widgets ──
    const WIDGET_MAP: Record<string, Partial<CanvasElement>> = {
      'text-to-image': { width: 40, height: 30 },
      map: { width: 50, height: 35 },
      'table-widget': { width: 55, height: 30 },
      'page-no': { width: 10, height: 5 },
      embed: { width: 55, height: 35 },
      tooltip: { width: 25, height: 8 },
      'auto-toc': { width: 55, height: 45 },
      'qr-code': { width: 18, height: 18 },
      countdown: { width: 35, height: 15 },
      quiz: { width: 55, height: 35 },
      slideshow: { width: 55, height: 35 },
      'video-player': { width: 55, height: 35 },
    };
    if (WIDGET_MAP[rawType]) {
      if (rawType === 'text-to-image') {
        return { type: 'image', extra: { isPlaceholder: true, ...WIDGET_MAP[rawType], ...merged } };
      }
      if (rawType === 'page-no') {
        return { type: 'text', extra: { content: '#', fontSize: 11, textColor: '#6B7280', textAlign: 'center', ...WIDGET_MAP[rawType], ...merged } };
      }
      if (rawType === 'quiz') {
        return { type: 'interactive', extra: { interactiveType: 'quiz', ...WIDGET_MAP[rawType], ...merged } };
      }
      return { type: 'interactive', extra: { interactiveType: rawType, ...WIDGET_MAP[rawType], ...merged } };
    }

    // ── Fallback: pass through as-is if it's already a valid canvas type ──
    const VALID_TYPES: CanvasElement['type'][] = ['image', 'shape', 'text', 'interactive'];
    if (VALID_TYPES.includes(rawType as any)) {
      return { type: rawType as CanvasElement['type'], extra: merged };
    }

    // Unknown → interactive with fallback rendering
    return { type: 'interactive', extra: { interactiveType: rawType, width: 40, height: 25, ...merged } };
  };

  // ─── Element Actions ──────────────────────────
  const addElement = (rawType: string, extra?: Partial<CanvasElement>) => {
    if (isPageLocked) { toast.error('This page is locked. Unlock it to make changes.'); return; }
    const { type, extra: resolvedExtra } = resolveElementType(rawType, extra);
    // Stagger position so new elements don't fully overlap existing ones
    const sameTypeCount = currentElements.filter(el => el.type === type).length;
    const offset = (sameTypeCount % 5) * 5;
    const baseX = resolvedExtra?.x ?? (20 + offset);
    const baseY = resolvedExtra?.y ?? (20 + offset);
    const newEl: CanvasElement = {
      id: crypto.randomUUID(), type, x: baseX, y: baseY,
      width: resolvedExtra?.width ?? (type === 'interactive' ? 60 : (type === 'image' ? 40 : 30)),
      height: resolvedExtra?.height ?? (type === 'text' ? 10 : (type === 'interactive' ? 30 : 25)),
      ...(type === 'text' ? { content: 'New Text', fontSize: 16, fontFamily: 'Inter', textColor: '#1a1a2e' } : {}),
      ...(type === 'shape' ? { fill: '#3b82f6', stroke: '#1e40af', strokeWidth: 1, shapeType: 'rectangle' } : {}),
      ...(type === 'image' ? { src: STOCK_IMAGES[0] } : {}),
      ...resolvedExtra,
    };
    const pageId = selectedPage?.id || '';
    updateElements(pageId, [...currentElements, newEl]);
    setSelectedElementId(newEl.id);
    setActiveTool('select');
  };

  useImperativeHandle(ref, () => ({
    addElement,
    getTextElements: (scope: 'page' | 'book') => {
      const pagesToScan = scope === 'page' && selectedPage ? [selectedPage] : currentPages;
      const results: { pageId: string; elementId: string; content: string }[] = [];
      pagesToScan.forEach(page => {
        const elems = resolvePageElements(pageElements, page, currentPages, bookTitle);
        elems.forEach(el => {
          if (el.type === 'text' && el.content) {
            results.push({ pageId: page.id, elementId: el.id, content: el.content });
          }
        });
      });
      return results;
    },
    updateTextContent: (updates: { pageId: string; elementId: string; content: string }[]) => {
      setPageElements(prev => {
        const next = { ...prev };
        updates.forEach(({ pageId, elementId, content }) => {
          const page = currentPages.find(p => p.id === pageId);
          const elems = page ? resolvePageElements(next, page, currentPages, bookTitle) : (next[pageId] || []);
          next[pageId] = elems.map(e => e.id === elementId ? { ...e, content } : e);
        });
        return next;
      });
    },
    isReplacingImage: () => !!replaceModalElementId,
    replaceImage: (src: string) => {
      if (replaceModalElementId) {
        updateElement(replaceModalElementId, { src, isPlaceholder: false });
        toast.success('Image replaced');
        setReplaceModalElementId(null);
      }
    },
    setPageContent: (pageId: string, content: string) => {
      setPageElements(prev => {
        const page = currentPages.find(p => p.id === pageId);
        const elems = page ? resolvePageElements(prev, page, currentPages, bookTitle) : (prev[pageId] || []);

        // Handle image insertion via __IMAGE__ prefix
        if (content.startsWith('__IMAGE__')) {
          const imageUrl = content.slice(9);
          const existingImage = elems.find(e => e.type === 'image');

          if (existingImage) {
            return {
              ...prev,
              [pageId]: elems.map(e => e.id === existingImage.id ? { ...e, src: imageUrl, isPlaceholder: false } : e),
            };
          }

          const imageEl: CanvasElement = {
            id: `img-${pageId}-${Date.now()}`, type: 'image',
            x: 8, y: 4, width: 84, height: 30,
            src: imageUrl,
          };
          // Find body text and shift it down to make room
          const bodyEl = elems.find(e => e.type === 'text' && e.id.includes('body'));
          if (bodyEl) {
            const updatedElems = elems.map(e => {
              if (e.id === bodyEl.id) return { ...e, y: 38, height: Math.max(10, 58) };
              if (e.id.includes('title')) return e; // keep title at top
              if (e.id.includes('divider')) return { ...e, y: 36 };
              return e;
            });
            return { ...prev, [pageId]: [imageEl, ...updatedElems] };
          }
          return { ...prev, [pageId]: [imageEl, ...elems] };
        }

        // Find existing body text element and update it, or add a new one
        const bodyEl = elems.find(e => e.type === 'text' && e.id.includes('body'));
        if (bodyEl) {
          return { ...prev, [pageId]: elems.map(e => e.id === bodyEl.id ? { ...e, content } : e) };
        }
        // Add a full-page text element
        const newEl: CanvasElement = {
          id: `body-${pageId}-${Date.now()}`, type: 'text',
          x: 8, y: 8, width: 84, height: 84,
          content, fontSize: 14, fontFamily: 'Inter', textColor: '#1a1a2e',
        };
        return { ...prev, [pageId]: [...elems, newEl] };
      });
    },
    undo,
    redo,
    selectElement: (elementId: string) => {
      setSelectedElementId(elementId);
      setActiveTool('select');
    },
    editElement: (elementId: string) => {
      setSelectedElementId(elementId);
      setEditingTextId(elementId);
      setActiveTool('select');
    },
    triggerReplaceImage: (elementId: string) => {
      setSelectedElementId(elementId);
      setReplaceModalElementId(elementId);
    },
  }), [selectedPage, currentElements, currentPages, pageElements, bookTitle, replaceModalElementId, undo, redo]);

  const deleteElement = () => {
    if (!selectedElementId || !selectedPage || isPageLocked) return;
    updateElements(selectedPage.id, currentElements.filter(e => e.id !== selectedElementId));
    setSelectedElementId(null);
  };

  const duplicateElement = () => {
    if (!selectedElement || !selectedPage || isPageLocked) return;
    const dup = { ...selectedElement, id: crypto.randomUUID(), x: selectedElement.x + 3, y: selectedElement.y + 3 };
    updateElements(selectedPage.id, [...currentElements, dup]);
    setSelectedElementId(dup.id);
  };

  const updateElement = (id: string, updates: Partial<CanvasElement>, skipUndo = false) => {
    if (!selectedPage || isPageLocked) return;
    updateElements(selectedPage.id, currentElements.map(e => e.id === id ? { ...e, ...updates } : e), skipUndo);
  };

  const handleAITextEdit = async (action: AIEditAction, params?: { tone?: string; prompt?: string }) => {
    if (!selectedElement || selectedElement.type !== 'text' || !selectedElement.content) return;
    setIsAIProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-text-edit', {
        body: { text: selectedElement.content, action, tone: params?.tone, prompt: params?.prompt },
      });
      if (error) throw error;
      if (data?.result) {
        updateElement(selectedElement.id, { content: data.result });
        toast.success('Text updated by AI');
      } else if (data?.error) {
        toast.error(data.error);
      }
    } catch (e: any) {
      toast.error(e.message || 'AI edit failed');
    } finally {
      setIsAIProcessing(false);
    }
  };

  const handleContextualAI = async (action: string) => {
    const prompt = action === 'custom' ? contextualAIPrompt.trim() : undefined;
    if (action === 'custom' && !prompt) return;

    // If no element is selected but user typed a custom prompt, treat as a general page question
    if (!selectedElement && action === 'custom') {
      setIsAIProcessing(true);
      try {
        // Gather all text content from the current page for context
        const currentPageId = selectedPageId || currentPages[0]?.id;
        const pageElems = currentPageId ? (pageElements[currentPageId] || []) : [];
        const pageTextContent = pageElems
          .filter(el => el.type === 'text' && el.content)
          .map(el => el.content)
          .join('\n\n');

        const { data, error } = await supabase.functions.invoke('ai-text-edit', {
          body: {
            text: pageTextContent || 'This is an ebook page.',
            action: 'custom',
            prompt: `The user is asking about this ebook page. Here is their question: "${prompt}". Please provide a helpful, concise answer.`,
          },
        });
        if (error) throw error;
        if (data?.result) {
          toast.success(data.result, { duration: 8000 });
        } else if (data?.error) {
          toast.error(data.error);
        }
      } catch (e: any) { toast.error(e.message || 'AI request failed'); }
      finally { setIsAIProcessing(false); setContextualAIPrompt(''); }
      return;
    }

    if (!selectedElement) return;
    if (selectedElement.type === 'text' && selectedElement.content) {
      setIsAIProcessing(true);
      try {
        const actionMap: Record<string, string> = { rewrite: 'improve-writing', improve: 'improve-writing', shorten: 'make-shorter', expand: 'make-longer' };
        const { data, error } = await supabase.functions.invoke('ai-text-edit', {
          body: { text: selectedElement.content, action: actionMap[action] || 'improve-writing', prompt },
        });
        if (error) throw error;
        if (data?.result) {
          updateElement(selectedElement.id, { content: data.result });
          setAiUpdatedFeedback(true);
          setTimeout(() => setAiUpdatedFeedback(false), 2500);
          toast.success('Updated by AI ✨');
        }
        else if (data?.error) toast.error(data.error);
      } catch (e: any) { toast.error(e.message || 'AI edit failed'); }
      finally { setIsAIProcessing(false); setContextualAIPrompt(''); }
    } else if (selectedElement.type === 'image') {
      toast.info('AI image editing coming soon');
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    setContextMenu(null);
    if (e.target === canvasRef.current || (e.target as HTMLElement).dataset.canvas === 'bg') {
      setSelectedElementId(null);
      setEditingTextId(null);
      if (aiExpandedPageId) { setAiExpandedPageId(null); onAiPanelToggle?.(false); }

      if (activeTool === 'text') {
        addElement('text');
      } else if (activeTool === 'rectangle') {
        addElement('shape', { shapeType: 'rectangle' });
      } else if (activeTool === 'circle') {
        addElement('shape', { shapeType: 'circle' });
      } else if (activeTool === 'line') {
        addElement('shape', { shapeType: 'rectangle', height: 1, fill: '#1a1a2e', stroke: 'transparent' });
      } else if (activeTool === 'image') {
        imageInputRef.current?.click();
      }
    }
  };

  // Right-click context menu for selecting overlapping elements
  const handleElementContextMenu = (e: React.MouseEvent, el: CanvasElement, pageId?: string) => {
    if (!pageId) return;
    e.preventDefault();
    e.stopPropagation();
    const page = currentPages.find(p => p.id === pageId);
    const elems = page ? resolvePageElements(pageElements, page, currentPages, bookTitle) : (pageElements[pageId] || []);
    
    // Find all elements whose bounding box contains the click point
    const pageEl = pageRefs.current[pageId];
    if (!pageEl) return;
    const pageRect = pageEl.getBoundingClientRect();
    const clickXPct = ((e.clientX - pageRect.left) / pageRect.width) * 100;
    const clickYPct = ((e.clientY - pageRect.top) / pageRect.height) * 100;
    const overlapping = elems.filter(other =>
      clickXPct >= other.x && clickXPct <= other.x + other.width &&
      clickYPct >= other.y && clickYPct <= other.y + other.height
    ).sort((a, b) => (b.zIndex ?? 1) - (a.zIndex ?? 1));
    if (overlapping.length >= 1) {
      setContextMenu({ x: e.clientX, y: e.clientY, elements: overlapping, pageId });
    }
  };

  // ─── Drag ─────────────────────────────────────
  const handleElementMouseDown = (e: React.MouseEvent, el: CanvasElement, pageId?: string) => {
    if (!canEdit) return;
    if (isPageLocked || el.locked || activeTool !== 'select') return;
    // On Mac, Ctrl+click triggers onMouseDown before onContextMenu — skip drag to let context menu work
    if (e.ctrlKey || e.button === 2) return;
    e.stopPropagation();
    if (pageId) onPageSelect(pageId);

    // Alt+Click: cycle through overlapping elements at this position
    if (e.altKey && pageId) {
      const elems = pageElements[pageId] || [];
      const overlapping = elems.filter(other => {
        // Check if click position overlaps with this element (rough check via bounding box overlap with clicked element)
        return !(other.x > el.x + el.width || other.x + other.width < el.x || other.y > el.y + el.height || other.y + other.height < el.y);
      }).sort((a, b) => (a.zIndex ?? 1) - (b.zIndex ?? 1));
      if (overlapping.length > 1) {
        const currentIdx = overlapping.findIndex(o => o.id === selectedElementId);
        const nextIdx = (currentIdx + 1) % overlapping.length;
        setSelectedElementId(overlapping[nextIdx].id);
        return;
      }
    }

    setSelectedElementId(el.id);
    // Push undo snapshot once before drag begins
    setUndoStack(prev => [...prev.slice(-50), { ...pageElements }]);
    setRedoStack([]);
    setDragState({ id: el.id, startX: e.clientX, startY: e.clientY, elemX: el.x, elemY: el.y });
  };

  const handleResizeMouseDown = (e: React.MouseEvent, el: CanvasElement, handle: string) => {
    e.stopPropagation();
    // Push undo snapshot once before resize begins
    setUndoStack(prev => [...prev.slice(-50), { ...pageElements }]);
    setRedoStack([]);
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
        }, true);
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

        updateElement(resizeState.id, { x: newX, y: newY, width: newW, height: newH }, true);
      }

      if (rotateState) {
        const angle = Math.atan2(
          e.clientY - rotateState.centerY,
          e.clientX - rotateState.centerX
        ) * (180 / Math.PI);
        let rotation = rotateState.elemRotation + (angle - rotateState.startAngle);
        for (const snap of [0, 90, 180, 270, 360]) {
          if (Math.abs(rotation - snap) < 5) { rotation = snap % 360; break; }
          if (Math.abs(rotation + 360 - snap) < 5) { rotation = snap % 360; break; }
        }
        updateElement(rotateState.id, { rotation: ((rotation % 360) + 360) % 360 }, true);
      }
    };

    const handleMouseUp = () => {
      setDragState(null);
      setResizeState(null);
      setRotateState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => { window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleMouseUp); };
  }, [dragState, resizeState, rotateState, zoom]);

  // ─── Keyboard Shortcuts ───────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Skip shortcuts when typing in inputs, textareas, or contentEditable
      const tag = (e.target as HTMLElement)?.tagName;
      const isEditable = (e.target as HTMLElement)?.isContentEditable;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || isEditable;
      if (editingTextId) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (isInput) return;
        e.preventDefault();
        deleteElement();
      }
      if (e.key === 'Enter' && selectedElementId && !isInput) {
        const el = currentElements.find(el => el.id === selectedElementId);
        if (el?.type === 'text') {
          e.preventDefault();
          setEditingTextId(el.id);
        }
      }
      if (e.key === 'Escape') {
        setSelectedElementId(null);
      }
      if (isInput) return;
      if (e.key === 'v' || e.key === 'V') setActiveTool('select');
      if (e.key === 't' || e.key === 'T') setActiveTool('text');
      if (e.key === 'r' || e.key === 'R') setActiveTool('rectangle');
      if (e.key === 'o' || e.key === 'O') setActiveTool('circle');
      if (e.key === 'l' || e.key === 'L') setActiveTool('line');
      if (e.key === 'h' || e.key === 'H') setActiveTool('hand');
      if (e.key === 'i' || e.key === 'I') setActiveTool('image');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [editingTextId, selectedElementId, currentElements]);

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
    updateElement(selectedElementId, { src: url, isPlaceholder: false });
    toast.success('Image replaced');
  };

  const handleAIEdit = async () => {
    if (!aiEditPrompt.trim() || !selectedElementId) return;
    const el = (pageElements[selectedPage?.id || ''] || []).find(e => e.id === selectedElementId);
    if (!el?.src) return;
    setIsAIProcessing(true);
    setShowAIEditModal(false);
    toast.success('AI is processing your edit: ' + aiEditPrompt);
    try {
      const { data, error } = await supabase.functions.invoke('ai-image-tools', {
        body: { action: 'style-transfer', imageUrl: el.src, prompt: aiEditPrompt },
      });
      if (error) throw error;
      if (data?.imageUrl) {
        updateElement(selectedElementId, { src: data.imageUrl });
        toast.success('Image edited successfully');
      } else {
        throw new Error('No image returned');
      }
    } catch (err: any) {
      toast.error('AI edit failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsAIProcessing(false);
      setAIEditPrompt('');
    }
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

  // ─── Dark background detection helper ────────
  const isPageDarkBg = useCallback((pageId: string) => {
    const elems = pageElements[pageId] || [];
    // Check for a large background shape with a dark fill
    const bgEl = elems.find(e => e.type === 'shape' && e.id === 'bg' && e.width >= 90 && e.height >= 90);
    if (!bgEl?.fill) return false;
    // Parse hex or hsl to determine lightness
    const fill = bgEl.fill;
    if (fill.startsWith('#')) {
      const hex = fill.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return (r * 0.299 + g * 0.587 + b * 0.114) < 128;
    }
    if (fill.includes('hsl')) {
      const match = fill.match(/(\d+(?:\.\d+)?)\s*%\s*\)/);
      if (match) return parseFloat(match[1]) < 40;
    }
    return false;
  }, [pageElements]);

  // ─── Render Element ───────────────────────────
  const renderElement = (el: CanvasElement, pageId?: string, darkBg = false) => {
    // Hide all non-replacing elements when replace mode is active
    if (replaceModalElementId && el.id !== replaceModalElementId) return null;
    const isSelected = selectedElementId === el.id;
    const isEditing = editingTextId === el.id;
    const style: React.CSSProperties = {
      position: 'absolute', left: `${el.x}%`, top: `${el.y}%`,
      width: `${el.width}%`, height: `${el.height}%`,
      opacity: el.opacity ?? 1, borderRadius: el.borderRadius,
      border: el.borderStyle && el.borderStyle !== 'none' ? `${el.borderWidth || 1}px ${el.borderStyle} ${el.borderColor || '#000000'}` : undefined,
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
        case 'interactive': return el.interactiveType ? el.interactiveType.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Interactive';
        default: return 'Element';
      }
    };
    const typeBadgeColor = el.type === 'shape' ? 'bg-destructive' : el.type === 'interactive' ? 'bg-purple-500' : 'bg-blue-500';
    const TypeBadge = () => isSelected ? (
      <div className={`absolute -top-6 left-0 ${typeBadgeColor} text-white text-xs font-semibold px-2 py-0.5 rounded-sm shadow-sm z-30 whitespace-nowrap pointer-events-none`}>
        {getTypeLabel()}
      </div>
    ) : null;

    if (el.type === 'image') {
      // Placeholder state — show recommended images + upload
      if (el.isPlaceholder || !el.src) {
        return (
          <div key={el.id} className={`${selectionBorder}`} style={style}
            onMouseDown={e => handleElementMouseDown(e, el, pageId)}
            onContextMenu={e => handleElementContextMenu(e, el, pageId)}>
            <TypeBadge />
             <div className={`w-full h-full ${darkBg ? 'bg-white/[0.08] border-white/20' : 'bg-foreground/[0.04] border-foreground/10'} border-2 border-dashed flex flex-col items-center justify-center p-4 rounded-lg`}>
                <p className={`text-sm font-medium mb-3 text-center ${darkBg ? 'text-white/70' : 'text-muted-foreground'}`}>Select A Recommended Image</p>
                <div className="flex flex-wrap gap-3 mb-4 justify-center max-w-[95%]">
                  {getContextualImages({
                    bookTitle,
                    pageTitle: selectedPage?.title,
                    pageType: selectedPage?.type,
                    surroundingText: gatherPageText(pageElements[selectedPage?.id || ''] || []),
                    excludeSrcs: [el.src || ''],
                    count: 3,
                  }).map((imgSrc, idx) => (
                   <div key={idx} className="relative group">
                     <button
                       onClick={e => { e.stopPropagation(); updateElement(el.id, { src: imgSrc, isPlaceholder: false }); toast.success('Image selected'); }}
                       className="w-20 h-20 rounded-lg border-2 border-transparent hover:border-accent overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-lg">
                       <img src={imgSrc} alt={`Suggestion ${idx + 1}`} className="w-full h-full object-cover" draggable={false} />
                     </button>
                     <button
                       onClick={e => { e.stopPropagation(); setPreviewImageSrc(imgSrc); }}
                       className={`absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${darkBg ? 'bg-white/80 hover:bg-white' : 'bg-background/80 hover:bg-background'}`}>
                       <Eye className={`w-3 h-3 ${darkBg ? 'text-black' : 'text-foreground'}`} />
                     </button>
                   </div>
                 ))}
               </div>
               <div className="flex items-center gap-2">
                 <button
                   onClick={e => { e.stopPropagation(); replaceImageInputRef.current?.click(); }}
                   className="px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 flex items-center gap-2 transition-colors">
                   <Upload className="w-4 h-4" />Upload Image
                 </button>
                 <button
                   onClick={e => { e.stopPropagation(); setReplaceModalElementId(null); }}
                   className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors ${darkBg ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-foreground/10 text-foreground hover:bg-foreground/15'}`}>
                   <X className="w-4 h-4" />Cancel
                 </button>
               </div>
             </div>
            {isSelected && renderResizeHandles(el)}
          </div>
        );
      }

      // Adjust z-index based on wrap mode
      const imgZIndex = el.wrapMode === 'behind' ? 0 : el.wrapMode === 'in-front' ? 20 : (el.zIndex ?? 1);

      return (
        <div key={el.id} className={`${selectionBorder}`} style={{ ...style, zIndex: imgZIndex }}
          onMouseDown={e => handleElementMouseDown(e, el, pageId)}
          onContextMenu={e => handleElementContextMenu(e, el, pageId)}
          onDoubleClick={() => replaceImageInputRef.current?.click()}>
          <TypeBadge />
          <img src={el.src} alt="" className={`w-full h-full ${el.objectFit === 'contain' ? 'object-contain' : el.objectFit === 'fill' ? 'object-fill' : 'object-cover'}`} draggable={false}
            style={{
              filter: [
                el.brightness !== undefined && el.brightness !== 100 ? `brightness(${el.brightness}%)` : '',
                el.contrast !== undefined && el.contrast !== 100 ? `contrast(${el.contrast}%)` : '',
                el.saturate !== undefined && el.saturate !== 100 ? `saturate(${el.saturate}%)` : '',
                el.blur ? `blur(${el.blur}px)` : '',
                el.grayscale ? `grayscale(${el.grayscale}%)` : '',
                el.sepia ? `sepia(${el.sepia}%)` : '',
              ].filter(Boolean).join(' ') || undefined,
              boxShadow: el.shadowBlur || el.shadowX || el.shadowY ? `${el.shadowX || 0}px ${el.shadowY || 0}px ${el.shadowBlur || 0}px ${el.shadowColor || 'rgba(0,0,0,0.5)'}` : undefined,
            }}
          />
          {/* Inline replace overlay — renders inside the image bounds */}
          {isSelected && replaceModalElementId === el.id && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-[10]" onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
              <p className="text-sm font-medium text-foreground mb-3 text-center">Select A Recommended Image</p>
               <div className="flex flex-wrap gap-3 mb-4 justify-center max-w-[95%]">
                {getContextualImages({
                    bookTitle,
                    pageTitle: selectedPage?.title,
                    pageType: selectedPage?.type,
                    surroundingText: gatherPageText(pageElements[selectedPage?.id || ''] || []),
                    excludeSrcs: [el.src || ''],
                    count: 3,
                  }).map((imgSrc, idx) => (
                  <div key={idx} className="relative group">
                    <button
                      onClick={e => { e.stopPropagation(); updateElement(el.id, { src: imgSrc, isPlaceholder: false }); toast.success('Image replaced'); setReplaceModalElementId(null); }}
                      className="w-20 h-20 rounded-lg border-2 border-transparent hover:border-accent overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-lg">
                      <img src={imgSrc} alt={`Suggestion ${idx + 1}`} className="w-full h-full object-cover" draggable={false} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); setPreviewImageSrc(imgSrc); }}
                      className="absolute top-1 right-1 w-6 h-6 bg-background/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background">
                      <Eye className="w-3 h-3 text-foreground" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={e => { e.stopPropagation(); replaceImageInputRef.current?.click(); }}
                  className="px-4 py-2 bg-accent text-white text-xs font-medium rounded-lg hover:bg-accent/90 flex items-center gap-2 transition-colors">
                  <Upload className="w-3.5 h-3.5" />Upload Image
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setReplaceModalElementId(null); }}
                  className="px-4 py-2 bg-foreground/10 text-foreground text-xs font-medium rounded-lg hover:bg-foreground/15 flex items-center gap-2 transition-colors">
                  <X className="w-3.5 h-3.5" />Cancel
                </button>
              </div>
            </div>
          )}
          {isSelected && renderResizeHandles(el)}
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
        }} onMouseDown={e => handleElementMouseDown(e, el, pageId)}
           onContextMenu={e => handleElementContextMenu(e, el, pageId)}>
          <TypeBadge />
          {isSelected && renderResizeHandles(el)}
        </div>
      );
    }

    if (el.type === 'text') {
      // Calculate wrap floats from sibling images on the same page
      const pageElems = pageId ? (pageElements[pageId] || []) : [];
      const wrapImages = pageElems.filter(
        sibling => sibling.type === 'image' && sibling.id !== el.id &&
        sibling.wrapMode && sibling.wrapMode !== 'in-front' && sibling.wrapMode !== 'behind'
      );

      // Build CSS float elements for images that overlap this text element
      const wrapFloats: React.ReactNode[] = [];
      wrapImages.forEach((img) => {
        const margin = img.wrapMargin ?? 2;
        // Convert image coords relative to this text element's bounds
        const relLeft = ((img.x - el.x) / el.width) * 100;
        const relTop = ((img.y - el.y) / el.height) * 100;
        const relWidth = (img.width / el.width) * 100;
        const relHeight = (img.height / el.height) * 100;
        const marginW = (margin / el.width) * 100;
        const marginH = (margin / el.height) * 100;

        // Check overlap
        const imgRight = img.x + img.width;
        const imgBottom = img.y + img.height;
        const elRight = el.x + el.width;
        const elBottom = el.y + el.height;
        if (imgRight + margin <= el.x || img.x - margin >= elRight) return;
        if (imgBottom + margin <= el.y || img.y - margin >= elBottom) return;

        if (img.wrapMode === 'top-bottom') {
          // Insert a full-width spacer at the image's vertical position
          wrapFloats.push(
            <div key={`wrap-tb-${img.id}`} style={{
              width: '100%',
              height: `${relHeight + marginH * 2}%`,
              float: 'left' as const,
              clear: 'both' as const,
              marginTop: `${Math.max(0, relTop - marginH)}%`,
            }} />
          );
        } else {
          // Square or tight: float left or right based on position
          const isLeftSide = img.x + img.width / 2 < el.x + el.width / 2;
          const floatW = relWidth + marginW * 2;
          const floatH = relHeight + marginH * 2;
          wrapFloats.push(
            <div key={`wrap-sq-${img.id}`} style={{
              width: `${Math.min(floatW, 100)}%`,
              height: `${Math.min(floatH, 100)}%`,
              float: isLeftSide ? 'left' : 'right',
              marginTop: `${Math.max(0, relTop - marginH)}%`,
              shapeOutside: img.wrapMode === 'tight'
                ? `inset(${marginH}% ${marginW}% ${marginH}% ${marginW}% round ${img.borderRadius || 0}px)`
                : undefined,
              shapeMargin: img.wrapMode === 'tight' ? `${margin * 0.3}%` : undefined,
            } as React.CSSProperties} />
          );
        }
      });

      // For 'behind' mode images, render text with higher z-index
      const hasBehindImage = pageElems.some(
        sibling => sibling.type === 'image' && sibling.wrapMode === 'behind'
      );
      const textZIndex = hasBehindImage ? Math.max((el.zIndex ?? 1), 10) : el.zIndex;

      const textStyle: React.CSSProperties = {
        fontSize: `${(el.fontSize || 16) * zoom / 100}px`,
        fontFamily: el.fontFamily, color: el.textColor,
        textAlign: el.textAlign || 'left',
        fontWeight: el.fontWeight || 'normal',
        fontStyle: el.fontStyle || 'normal',
        textDecoration: el.textDecoration || 'none',
        lineHeight: el.lineHeight ?? 1.5,
      };

      return (
        <div key={el.id} className={`${selectionBorder} group/text`} style={{ ...style, minHeight: 20, zIndex: textZIndex ?? style.zIndex }}
          onMouseDown={e => handleElementMouseDown(e, el, pageId)}
          onContextMenu={e => handleElementContextMenu(e, el, pageId)}
          onClick={() => { if (isPageLocked) return; if (isSelected && !isEditing) { setEditingTextId(el.id); } }}
          onDoubleClick={() => { if (isPageLocked) return; setEditingTextId(el.id); setSelectedElementId(el.id); }}>
          <TypeBadge />
          {isEditing ? (
            <div
              ref={editableTextRef}
              contentEditable
              suppressContentEditableWarning
              onBlur={() => {
                if (editableTextRef.current) {
                  updateElement(el.id, { content: editableTextRef.current.innerHTML });
                }
                setEditingTextId(null);
              }}
              onKeyDown={e => { if (e.key === 'Escape') { if (editableTextRef.current) updateElement(el.id, { content: editableTextRef.current.innerHTML }); setEditingTextId(null); } }}
              onMouseDown={e => e.stopPropagation()}
              onClick={e => e.stopPropagation()}
              className="w-full h-full overflow-auto p-2 whitespace-pre-wrap outline-none cursor-text"
              style={textStyle}
            >
              {wrapFloats}
              <span dangerouslySetInnerHTML={{ __html: el.content || '' }} />
            </div>
          ) : (
            <div className="w-full h-full overflow-hidden p-2 whitespace-pre-wrap select-none pointer-events-none" style={{
              background: 'transparent', ...textStyle,
            }}>
              {wrapFloats}
              <span style={{ backgroundColor: el.highlightColor || 'transparent', boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }} dangerouslySetInnerHTML={{ __html: el.content || '' }} />
            </div>
          )}
          {isSelected && renderResizeHandles(el)}
        </div>
      );
    }


    // Interactive elements
    if (el.type === 'interactive') {
      const iType = el.interactiveType || 'flashcards';
      const data = el.interactiveData || {};
      const scaledFont = (size: number) => `${size * zoom / 100 * 0.5}px`;

      const INTERACTIVE_ICONS: Record<string, typeof Brain> = {
        flashcards: Brain, quiz: CheckSquare, course: BookOpen, certificate: Award,
        'progress-tracker': TrendingUp, 'knowledge-check': HelpCircle,
        'interactive-exercise': Zap, 'sorting-activity': ShuffleIcon,
        matching: GitBranch, checklist: ListChecks,
        'fill-in-blank': Type, 'drag-drop': Move, timeline: ArrowUpDown,
        'rating-scale': CircleDot, accordion: Layers,
      };
      const INTERACTIVE_COLORS: Record<string, string> = {
        flashcards: '#F59E0B', quiz: '#8B5CF6', course: '#3B82F6', certificate: '#10B981',
        'progress-tracker': '#14B8A6', 'knowledge-check': '#F43F5E',
        'interactive-exercise': '#A855F7', 'sorting-activity': '#F97316',
        matching: '#6366F1', checklist: '#0EA5E9',
        'fill-in-blank': '#EC4899', 'drag-drop': '#84CC16', timeline: '#06B6D4',
        'rating-scale': '#EAB308', accordion: '#64748B',
      };

      const Icon = INTERACTIVE_ICONS[iType] || Zap;
      const color = INTERACTIVE_COLORS[iType] || '#8B5CF6';
      const label = iType.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

      const renderInteractiveContent = () => {
        switch (iType) {
          case 'flashcards': {
            const cards = data.cards || [{ front: 'Term 1', back: 'Definition 1' }, { front: 'Term 2', back: 'Definition 2' }, { front: 'Term 3', back: 'Definition 3' }];
            return (
              <div className="w-full h-full flex flex-col p-[3%]">
                <div className="flex items-center gap-[2%] mb-[3%]">
                  <Brain style={{ width: scaledFont(16), height: scaledFont(16), color }} />
                  <span style={{ fontSize: scaledFont(13), fontWeight: 600, color }}>Flashcards</span>
                  <span style={{ fontSize: scaledFont(10), color: '#9CA3AF', marginLeft: 'auto' }}>{cards.length} cards</span>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-[2%]">
                  {cards.slice(0, 3).map((card: any, i: number) => (
                    <div key={i} className="rounded-lg border flex flex-col items-center justify-center text-center p-[4%]"
                      style={{ borderColor: `${color}30`, backgroundColor: `${color}08` }}>
                      <span style={{ fontSize: scaledFont(11), fontWeight: 600, color: '#1F2937' }}>{card.front}</span>
                      <span style={{ fontSize: scaledFont(8), color: '#9CA3AF', marginTop: '4%' }}>Click to flip</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          case 'quiz':
          case 'knowledge-check': {
            const question = data.question || 'What is the main concept discussed in this chapter?';
            const options = data.options || ['Option A', 'Option B', 'Option C', 'Option D'];
            return (
              <div className="w-full h-full flex flex-col p-[3%]">
                <div className="flex items-center gap-[2%] mb-[3%]">
                  <CheckSquare style={{ width: scaledFont(16), height: scaledFont(16), color }} />
                  <span style={{ fontSize: scaledFont(13), fontWeight: 600, color }}>{iType === 'quiz' ? 'Quiz' : 'Knowledge Check'}</span>
                </div>
                <p style={{ fontSize: scaledFont(11), color: '#1F2937', fontWeight: 500, marginBottom: '3%' }}>{question}</p>
                <div className="flex flex-col gap-[2%] flex-1">
                  {options.map((opt: string, i: number) => (
                    <div key={i} className="rounded-lg border px-[3%] py-[2%] flex items-center gap-[2%]"
                      style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
                      <div className="rounded-full border-2 flex items-center justify-center shrink-0"
                        style={{ width: scaledFont(14), height: scaledFont(14), borderColor: '#D1D5DB' }} />
                      <span style={{ fontSize: scaledFont(10), color: '#374151' }}>{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          case 'checklist': {
            const items = data.items || ['Review chapter summary', 'Complete practice exercises', 'Take the quiz', 'Submit your notes'];
            return (
              <div className="w-full h-full flex flex-col p-[3%]">
                <div className="flex items-center gap-[2%] mb-[3%]">
                  <ListChecks style={{ width: scaledFont(16), height: scaledFont(16), color }} />
                  <span style={{ fontSize: scaledFont(13), fontWeight: 600, color }}>Checklist</span>
                </div>
                <div className="flex flex-col gap-[2%] flex-1">
                  {items.map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-[2%] rounded-lg px-[3%] py-[2%]"
                      style={{ backgroundColor: i === 0 ? `${color}10` : 'transparent' }}>
                      <div className="rounded border-2 flex items-center justify-center shrink-0"
                        style={{ width: scaledFont(14), height: scaledFont(14), borderColor: i === 0 ? color : '#D1D5DB', backgroundColor: i === 0 ? color : 'transparent', borderRadius: '3px' }}>
                        {i === 0 && <Check style={{ width: scaledFont(10), height: scaledFont(10), color: '#fff' }} />}
                      </div>
                      <span style={{ fontSize: scaledFont(10), color: i === 0 ? '#9CA3AF' : '#374151', textDecoration: i === 0 ? 'line-through' : 'none' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          case 'progress-tracker': {
            const progress = data.progress ?? 65;
            return (
              <div className="w-full h-full flex flex-col p-[3%]">
                <div className="flex items-center gap-[2%] mb-[3%]">
                  <TrendingUp style={{ width: scaledFont(16), height: scaledFont(16), color }} />
                  <span style={{ fontSize: scaledFont(13), fontWeight: 600, color }}>Progress</span>
                  <span style={{ fontSize: scaledFont(12), fontWeight: 700, color, marginLeft: 'auto' }}>{progress}%</span>
                </div>
                <div className="w-full rounded-full" style={{ height: scaledFont(10), backgroundColor: `${color}20` }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: color }} />
                </div>
                <div className="flex justify-between mt-[2%]">
                  <span style={{ fontSize: scaledFont(9), color: '#9CA3AF' }}>Chapter 4 of 12</span>
                  <span style={{ fontSize: scaledFont(9), color: '#9CA3AF' }}>~20 min left</span>
                </div>
              </div>
            );
          }
          case 'sorting-activity': {
            const categories = data.categories || ['Category A', 'Category B'];
            const sortItems = data.items || ['Item 1', 'Item 2', 'Item 3', 'Item 4'];
            return (
              <div className="w-full h-full flex flex-col p-[3%]">
                <div className="flex items-center gap-[2%] mb-[3%]">
                  <ShuffleIcon style={{ width: scaledFont(16), height: scaledFont(16), color }} />
                  <span style={{ fontSize: scaledFont(13), fontWeight: 600, color }}>Sorting Activity</span>
                </div>
                <div className="flex gap-[2%] flex-1">
                  {categories.map((cat: string, ci: number) => (
                    <div key={ci} className="flex-1 rounded-lg border-2 border-dashed p-[2%] flex flex-col items-center"
                      style={{ borderColor: `${color}40` }}>
                      <span style={{ fontSize: scaledFont(10), fontWeight: 600, color: '#374151', marginBottom: '3%' }}>{cat}</span>
                      <span style={{ fontSize: scaledFont(8), color: '#9CA3AF' }}>Drop items here</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-[1.5%] mt-[2%]">
                  {sortItems.map((item: string, i: number) => (
                    <span key={i} className="rounded-lg px-[2%] py-[1%]"
                      style={{ fontSize: scaledFont(9), backgroundColor: `${color}15`, color, fontWeight: 500, border: `1px solid ${color}30` }}>{item}</span>
                  ))}
                </div>
              </div>
            );
          }
          case 'matching': {
            const pairs = data.pairs || [{ left: 'Term A', right: 'Definition A' }, { left: 'Term B', right: 'Definition B' }, { left: 'Term C', right: 'Definition C' }];
            return (
              <div className="w-full h-full flex flex-col p-[3%]">
                <div className="flex items-center gap-[2%] mb-[3%]">
                  <GitBranch style={{ width: scaledFont(16), height: scaledFont(16), color }} />
                  <span style={{ fontSize: scaledFont(13), fontWeight: 600, color }}>Matching</span>
                </div>
                <div className="flex gap-[5%] flex-1">
                  <div className="flex-1 flex flex-col gap-[3%]">
                    {pairs.map((p: any, i: number) => (
                      <div key={i} className="rounded-lg border px-[4%] py-[3%] text-center"
                        style={{ borderColor: `${color}40`, fontSize: scaledFont(10), color: '#374151', fontWeight: 500 }}>{p.left}</div>
                    ))}
                  </div>
                  <div className="flex-1 flex flex-col gap-[3%]">
                    {pairs.map((p: any, i: number) => (
                      <div key={i} className="rounded-lg border px-[4%] py-[3%] text-center"
                        style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', fontSize: scaledFont(10), color: '#6B7280' }}>{p.right}</div>
                    ))}
                  </div>
                </div>
              </div>
            );
          }
          case 'certificate': {
            const name = data.name || 'Certificate of Completion';
            return (
              <div className="w-full h-full flex flex-col items-center justify-center p-[4%] text-center"
                style={{ border: `3px double ${color}`, borderRadius: '12px', backgroundColor: `${color}05` }}>
                <Award style={{ width: scaledFont(28), height: scaledFont(28), color, marginBottom: '3%' }} />
                <span style={{ fontSize: scaledFont(14), fontWeight: 700, color: '#1F2937' }}>{name}</span>
                <span style={{ fontSize: scaledFont(9), color: '#6B7280', marginTop: '2%' }}>Awarded to [Student Name]</span>
                <div style={{ width: '40%', height: '1px', backgroundColor: '#D1D5DB', margin: '4% 0' }} />
                <span style={{ fontSize: scaledFont(8), color: '#9CA3AF' }}>Date: ___________</span>
              </div>
            );
          }
          case 'interactive-exercise': {
            return (
              <div className="w-full h-full flex flex-col p-[3%]">
                <div className="flex items-center gap-[2%] mb-[3%]">
                  <Zap style={{ width: scaledFont(16), height: scaledFont(16), color }} />
                  <span style={{ fontSize: scaledFont(13), fontWeight: 600, color }}>Interactive Exercise</span>
                </div>
                <div className="flex-1 rounded-lg border-2 border-dashed flex flex-col items-center justify-center"
                  style={{ borderColor: `${color}40`, backgroundColor: `${color}05` }}>
                  <Zap style={{ width: scaledFont(24), height: scaledFont(24), color: `${color}60`, marginBottom: '2%' }} />
                  <span style={{ fontSize: scaledFont(11), color: '#374151', fontWeight: 500 }}>Hands-on Practice Area</span>
                  <span style={{ fontSize: scaledFont(9), color: '#9CA3AF', marginTop: '1%' }}>Students interact here</span>
                </div>
              </div>
            );
          }
          case 'fill-in-blank': {
            const sentence = data.sentence || 'The process of _______ involves converting raw data into meaningful _______.';
            return (
              <div className="w-full h-full flex flex-col p-[3%]">
                <div className="flex items-center gap-[2%] mb-[3%]">
                  <Type style={{ width: scaledFont(16), height: scaledFont(16), color }} />
                  <span style={{ fontSize: scaledFont(13), fontWeight: 600, color }}>Fill in the Blank</span>
                </div>
                <p style={{ fontSize: scaledFont(11), color: '#374151', lineHeight: 1.8 }}>{sentence}</p>
              </div>
            );
          }
          case 'timeline': {
            const events = data.events || [{ year: '2020', text: 'Event one' }, { year: '2021', text: 'Event two' }, { year: '2022', text: 'Event three' }];
            return (
              <div className="w-full h-full flex flex-col p-[3%]">
                <div className="flex items-center gap-[2%] mb-[3%]">
                  <ArrowUpDown style={{ width: scaledFont(16), height: scaledFont(16), color }} />
                  <span style={{ fontSize: scaledFont(13), fontWeight: 600, color }}>Timeline</span>
                </div>
                <div className="flex-1 flex items-center gap-[3%]">
                  {events.map((ev: any, i: number) => (
                    <div key={i} className="flex-1 flex flex-col items-center">
                      <div className="rounded-full flex items-center justify-center"
                        style={{ width: scaledFont(28), height: scaledFont(28), backgroundColor: color, color: '#fff', fontSize: scaledFont(9), fontWeight: 700 }}>{ev.year}</div>
                      {i < events.length - 1 && <div style={{ width: '100%', height: '2px', backgroundColor: `${color}30`, margin: '4% 0' }} />}
                      <span style={{ fontSize: scaledFont(9), color: '#374151', textAlign: 'center', marginTop: '2%' }}>{ev.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          case 'rating-scale': {
            return (
              <div className="w-full h-full flex flex-col p-[3%]">
                <div className="flex items-center gap-[2%] mb-[3%]">
                  <CircleDot style={{ width: scaledFont(16), height: scaledFont(16), color }} />
                  <span style={{ fontSize: scaledFont(13), fontWeight: 600, color }}>Rating Scale</span>
                </div>
                <p style={{ fontSize: scaledFont(10), color: '#374151', marginBottom: '3%' }}>How well do you understand this topic?</p>
                <div className="flex items-center justify-between">
                  {[1, 2, 3, 4, 5].map(n => (
                    <div key={n} className="flex flex-col items-center gap-[4%]">
                      <div className="rounded-full border-2 flex items-center justify-center"
                        style={{ width: scaledFont(24), height: scaledFont(24), borderColor: n <= 3 ? `${color}40` : color, backgroundColor: n <= 3 ? 'transparent' : `${color}15` }}>
                        <span style={{ fontSize: scaledFont(10), color: n <= 3 ? '#9CA3AF' : color, fontWeight: 600 }}>{n}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-[2%]">
                  <span style={{ fontSize: scaledFont(8), color: '#9CA3AF' }}>Not at all</span>
                  <span style={{ fontSize: scaledFont(8), color: '#9CA3AF' }}>Very well</span>
                </div>
              </div>
            );
          }
          case 'accordion': {
            const sections = data.sections || [{ title: 'Section 1', expanded: true }, { title: 'Section 2' }, { title: 'Section 3' }];
            return (
              <div className="w-full h-full flex flex-col p-[3%]">
                <div className="flex items-center gap-[2%] mb-[3%]">
                  <Layers style={{ width: scaledFont(16), height: scaledFont(16), color }} />
                  <span style={{ fontSize: scaledFont(13), fontWeight: 600, color }}>Accordion</span>
                </div>
                <div className="flex flex-col gap-[1.5%] flex-1">
                  {sections.map((s: any, i: number) => (
                    <div key={i} className="rounded-lg border overflow-hidden" style={{ borderColor: s.expanded ? color : '#E5E7EB' }}>
                      <div className="flex items-center justify-between px-[3%] py-[2%]"
                        style={{ backgroundColor: s.expanded ? `${color}10` : '#F9FAFB' }}>
                        <span style={{ fontSize: scaledFont(10), fontWeight: 600, color: s.expanded ? color : '#374151' }}>{s.title}</span>
                        <ChevronDown style={{ width: scaledFont(12), height: scaledFont(12), color: '#9CA3AF', transform: s.expanded ? 'rotate(180deg)' : 'none' }} />
                      </div>
                      {s.expanded && <div className="px-[3%] py-[2%]"><span style={{ fontSize: scaledFont(9), color: '#6B7280' }}>Content goes here...</span></div>}
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          // ── Charts ──
          case 'bar-chart': {
            const bars = [65, 45, 80, 55, 70, 40];
            return (
              <div className="w-full h-full flex flex-col p-[4%]">
                <div className="flex items-center gap-[2%] mb-[4%]">
                  <span style={{ fontSize: scaledFont(12), fontWeight: 600, color: '#374151' }}>Bar Chart</span>
                </div>
                <div className="flex-1 flex items-end gap-[3%] px-[2%]">
                  {bars.map((v, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div className="w-full rounded-t" style={{ height: `${v}%`, backgroundColor: ['#3B82F6','#60A5FA','#93C5FD','#3B82F6','#60A5FA','#93C5FD'][i], minHeight: 2 }} />
                      <span style={{ fontSize: scaledFont(7), color: '#9CA3AF', marginTop: '4%' }}>{String.fromCharCode(65+i)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          case 'line-chart': {
            return (
              <div className="w-full h-full flex flex-col p-[4%]">
                <span style={{ fontSize: scaledFont(12), fontWeight: 600, color: '#374151', marginBottom: '4%' }}>Line Chart</span>
                <div className="flex-1 flex items-center justify-center" style={{ border: '1px solid #E5E7EB', borderRadius: 6, backgroundColor: '#F9FAFB' }}>
                  <svg viewBox="0 0 100 50" style={{ width: '90%', height: '70%' }}>
                    <polyline points="5,40 20,25 35,30 50,15 65,20 80,8 95,12" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="5,42 20,35 35,38 50,28 65,32 80,22 95,25" fill="none" stroke="#10B98140" strokeWidth="1.5" strokeDasharray="3,3"/>
                  </svg>
                </div>
              </div>
            );
          }
          case 'pie-chart': {
            return (
              <div className="w-full h-full flex flex-col items-center justify-center p-[4%]">
                <span style={{ fontSize: scaledFont(12), fontWeight: 600, color: '#374151', marginBottom: '4%' }}>Pie Chart</span>
                <svg viewBox="0 0 42 42" style={{ width: '55%', maxHeight: '65%' }}>
                  <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#3B82F6" strokeWidth="8" strokeDasharray="40 60" strokeDashoffset="25"/>
                  <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#F59E0B" strokeWidth="8" strokeDasharray="25 75" strokeDashoffset="85"/>
                  <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#10B981" strokeWidth="8" strokeDasharray="20 80" strokeDashoffset="60"/>
                  <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#EC4899" strokeWidth="8" strokeDasharray="15 85" strokeDashoffset="40"/>
                </svg>
              </div>
            );
          }
          case 'area-chart': {
            return (
              <div className="w-full h-full flex flex-col p-[4%]">
                <span style={{ fontSize: scaledFont(12), fontWeight: 600, color: '#374151', marginBottom: '4%' }}>Area Chart</span>
                <div className="flex-1 flex items-center justify-center" style={{ borderRadius: 6, backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                  <svg viewBox="0 0 100 50" style={{ width: '90%', height: '70%' }}>
                    <polygon points="5,45 20,30 35,35 50,18 65,22 80,10 95,15 95,45" fill="#8B5CF620" stroke="#8B5CF6" strokeWidth="2"/>
                  </svg>
                </div>
              </div>
            );
          }
          case 'donut-chart': {
            return (
              <div className="w-full h-full flex flex-col items-center justify-center p-[4%]">
                <span style={{ fontSize: scaledFont(12), fontWeight: 600, color: '#374151', marginBottom: '4%' }}>Donut Chart</span>
                <svg viewBox="0 0 42 42" style={{ width: '50%', maxHeight: '60%' }}>
                  <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#EC4899" strokeWidth="5" strokeDasharray="40 60" strokeDashoffset="25"/>
                  <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#F59E0B" strokeWidth="5" strokeDasharray="30 70" strokeDashoffset="85"/>
                  <circle cx="21" cy="21" r="15.9" fill="transparent" stroke="#10B981" strokeWidth="5" strokeDasharray="30 70" strokeDashoffset="55"/>
                </svg>
                <span style={{ fontSize: scaledFont(14), fontWeight: 700, color: '#374151', position: 'absolute' }}>72%</span>
              </div>
            );
          }
          case 'trending-chart': {
            return (
              <div className="w-full h-full flex flex-col p-[4%]">
                <div className="flex items-center gap-[2%] mb-[3%]">
                  <span style={{ fontSize: scaledFont(12), fontWeight: 600, color: '#374151' }}>Trending</span>
                  <span style={{ fontSize: scaledFont(10), color: '#10B981', fontWeight: 600, marginLeft: 'auto' }}>↑ 24%</span>
                </div>
                <div className="flex-1 flex items-center justify-center" style={{ borderRadius: 6, backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                  <svg viewBox="0 0 100 40" style={{ width: '90%', height: '60%' }}>
                    <polyline points="5,35 15,30 25,32 40,20 55,22 70,12 85,8 95,5" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            );
          }
          case 'gauge-chart':
          case 'radar-chart':
          case 'funnel-chart': {
            const chartLabels: Record<string, string> = { 'gauge-chart': 'Gauge', 'radar-chart': 'Radar', 'funnel-chart': 'Funnel' };
            return (
              <div className="w-full h-full flex flex-col items-center justify-center p-[4%]" style={{ backgroundColor: `${color}08`, borderRadius: 8 }}>
                <Icon style={{ width: scaledFont(28), height: scaledFont(28), color, marginBottom: '3%' }} />
                <span style={{ fontSize: scaledFont(12), fontWeight: 600, color: '#374151' }}>{chartLabels[iType]}</span>
                <span style={{ fontSize: scaledFont(9), color: '#9CA3AF' }}>Chart Widget</span>
              </div>
            );
          }

          // ── Tables & Data ──
          case 'basic-table':
          case 'data-grid': {
            const rows = [['Name', 'Value', 'Status'], ['Item A', '120', 'Active'], ['Item B', '85', 'Pending'], ['Item C', '210', 'Active']];
            return (
              <div className="w-full h-full flex flex-col p-[3%]">
                <span style={{ fontSize: scaledFont(12), fontWeight: 600, color: '#374151', marginBottom: '3%' }}>{iType === 'data-grid' ? 'Data Grid' : 'Table'}</span>
                <div className="flex-1 overflow-hidden rounded border" style={{ borderColor: '#E5E7EB' }}>
                  {rows.map((row, ri) => (
                    <div key={ri} className="flex" style={{ backgroundColor: ri === 0 ? '#F3F4F6' : '#fff', borderBottom: ri < rows.length - 1 ? '1px solid #E5E7EB' : undefined }}>
                      {row.map((cell, ci) => (
                        <div key={ci} className="flex-1 px-[2%] py-[1.5%]" style={{ fontSize: scaledFont(9), color: ri === 0 ? '#374151' : '#6B7280', fontWeight: ri === 0 ? 600 : 400 }}>{cell}</div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          case 'list':
          case 'ordered-list': {
            const items = data.items || ['First item', 'Second item', 'Third item', 'Fourth item'];
            const isOrdered = iType === 'ordered-list';
            return (
              <div className="w-full h-full flex flex-col p-[3%]">
                <span style={{ fontSize: scaledFont(12), fontWeight: 600, color: '#374151', marginBottom: '3%' }}>{isOrdered ? 'Numbered List' : 'List'}</span>
                <div className="flex flex-col gap-[2%]">
                  {items.map((item: string, i: number) => (
                    <div key={i} className="flex items-center gap-[2%]">
                      <span style={{ fontSize: scaledFont(10), color: color, fontWeight: 600, minWidth: scaledFont(14) }}>{isOrdered ? `${i+1}.` : '•'}</span>
                      <span style={{ fontSize: scaledFont(10), color: '#374151' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          case 'columns-layout': {
            return (
              <div className="w-full h-full flex gap-[3%] p-[3%]">
                {['Column 1', 'Column 2'].map((col, i) => (
                  <div key={i} className="flex-1 rounded-lg border-2 border-dashed flex flex-col items-center justify-center p-[2%]" style={{ borderColor: '#D1D5DB' }}>
                    <span style={{ fontSize: scaledFont(10), fontWeight: 600, color: '#9CA3AF' }}>{col}</span>
                    <span style={{ fontSize: scaledFont(8), color: '#D1D5DB', marginTop: '2%' }}>Drop content here</span>
                  </div>
                ))}
              </div>
            );
          }

          // ── Buttons ──
          case 'button-primary':
          case 'button-signup':
          case 'button-cta': {
            const btnData = data || {};
            const btnLabel = btnData.label || (iType === 'button-primary' ? 'Click Here' : iType === 'button-signup' ? 'Sign Up' : 'Get Started');
            const btnBg = btnData.bg || (iType === 'button-primary' ? '#3B82F6' : iType === 'button-signup' ? '#10B981' : '#EC4899');
            return (
              <div className="w-full h-full flex items-center justify-center">
                <div className="px-[8%] py-[3%] rounded-lg text-white font-semibold flex items-center justify-center" style={{ backgroundColor: btnBg, fontSize: scaledFont(13), minWidth: '60%', textAlign: 'center' }}>
                  {btnLabel}
                </div>
              </div>
            );
          }

          // ── Actions & Hotspots ──
          case 'action-link':
          case 'action-page':
          case 'action-popup':
          case 'action-audio':
          case 'action-download':
          case 'hotspot-link': {
            const actionLabels: Record<string, string> = {
              'action-link': '🔗 Open Link', 'action-page': '📄 Go to Page',
              'action-popup': '💬 Popup', 'action-audio': '🔊 Play Audio',
              'action-download': '⬇ Download', 'hotspot-link': '🔗 Link Hotspot',
            };
            const actionColors: Record<string, string> = {
              'action-link': '#3B82F6', 'action-page': '#8B5CF6',
              'action-popup': '#F59E0B', 'action-audio': '#EC4899',
              'action-download': '#10B981', 'hotspot-link': '#06B6D4',
            };
            return (
              <div className="w-full h-full flex items-center justify-center">
                <div className="px-[6%] py-[2%] rounded-lg border-2 border-dashed flex items-center gap-[3%]"
                  style={{ borderColor: actionColors[iType] || '#6B7280', backgroundColor: `${actionColors[iType] || '#6B7280'}10`, fontSize: scaledFont(11), color: actionColors[iType] || '#374151', fontWeight: 500 }}>
                  {actionLabels[iType] || 'Action'}
                </div>
              </div>
            );
          }

          // ── Widgets ──
          case 'map': {
            return (
              <div className="w-full h-full flex flex-col items-center justify-center" style={{ backgroundColor: '#E5E7EB', borderRadius: 8 }}>
                <span style={{ fontSize: scaledFont(28) }}>📍</span>
                <span style={{ fontSize: scaledFont(11), fontWeight: 600, color: '#374151', marginTop: '2%' }}>Map</span>
                <span style={{ fontSize: scaledFont(8), color: '#9CA3AF' }}>Location widget</span>
              </div>
            );
          }
          case 'table-widget': {
            const rows = [['Col A', 'Col B'], ['Data 1', 'Data 2'], ['Data 3', 'Data 4']];
            return (
              <div className="w-full h-full flex flex-col p-[3%]">
                <span style={{ fontSize: scaledFont(12), fontWeight: 600, color: '#374151', marginBottom: '3%' }}>Table</span>
                <div className="flex-1 overflow-hidden rounded border" style={{ borderColor: '#E5E7EB' }}>
                  {rows.map((row, ri) => (
                    <div key={ri} className="flex" style={{ backgroundColor: ri === 0 ? '#F3F4F6' : '#fff', borderBottom: '1px solid #E5E7EB' }}>
                      {row.map((cell, ci) => (
                        <div key={ci} className="flex-1 px-[3%] py-[2%]" style={{ fontSize: scaledFont(9), color: ri === 0 ? '#374151' : '#6B7280', fontWeight: ri === 0 ? 600 : 400 }}>{cell}</div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            );
          }
          case 'embed': {
            return (
              <div className="w-full h-full flex flex-col items-center justify-center" style={{ backgroundColor: '#F3F4F6', borderRadius: 8, border: '2px dashed #D1D5DB' }}>
                <span style={{ fontSize: scaledFont(24) }}>🔲</span>
                <span style={{ fontSize: scaledFont(11), fontWeight: 600, color: '#374151', marginTop: '2%' }}>Embed</span>
                <span style={{ fontSize: scaledFont(8), color: '#9CA3AF' }}>Paste URL to embed</span>
              </div>
            );
          }
          case 'tooltip': {
            return (
              <div className="w-full h-full flex items-center justify-center">
                <div className="px-[6%] py-[2%] rounded-lg flex items-center gap-[3%]" style={{ backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB', fontSize: scaledFont(10), color: '#374151' }}>
                  <span style={{ fontSize: scaledFont(12), color: '#06B6D4' }}>ℹ</span>
                  Hover for info
                </div>
              </div>
            );
          }
          case 'auto-toc': {
            const tocItems = ['Chapter 1: Introduction', 'Chapter 2: Getting Started', 'Chapter 3: Advanced Topics', 'Chapter 4: Conclusion'];
            return (
              <div className="w-full h-full flex flex-col p-[3%]">
                <span style={{ fontSize: scaledFont(14), fontWeight: 700, color: '#374151', marginBottom: '4%' }}>Table of Contents</span>
                {tocItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-[1.5%]" style={{ borderBottom: '1px dotted #E5E7EB' }}>
                    <span style={{ fontSize: scaledFont(10), color: '#374151' }}>{item}</span>
                    <span style={{ fontSize: scaledFont(9), color: '#9CA3AF' }}>{i + 1}</span>
                  </div>
                ))}
              </div>
            );
          }
          case 'qr-code': {
            return (
              <div className="w-full h-full flex flex-col items-center justify-center p-[4%]" style={{ backgroundColor: '#fff' }}>
                <div style={{ width: '70%', aspectRatio: '1', backgroundColor: '#F3F4F6', border: '2px solid #E5E7EB', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: scaledFont(8), color: '#9CA3AF', textAlign: 'center' }}>QR Code</span>
                </div>
              </div>
            );
          }
          case 'countdown': {
            return (
              <div className="w-full h-full flex items-center justify-center gap-[3%]">
                {['12', '34', '56'].map((n, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div style={{ fontSize: scaledFont(20), fontWeight: 700, color: '#374151', backgroundColor: '#F3F4F6', borderRadius: 6, padding: `${scaledFont(4)} ${scaledFont(8)}` }}>{n}</div>
                    <span style={{ fontSize: scaledFont(7), color: '#9CA3AF', marginTop: '4%' }}>{['hrs', 'min', 'sec'][i]}</span>
                  </div>
                ))}
              </div>
            );
          }
          case 'slideshow': {
            return (
              <div className="w-full h-full flex flex-col items-center justify-center" style={{ backgroundColor: '#F9FAFB', borderRadius: 8, border: '1px solid #E5E7EB' }}>
                <span style={{ fontSize: scaledFont(24) }}>🖼️</span>
                <span style={{ fontSize: scaledFont(11), fontWeight: 600, color: '#374151', marginTop: '2%' }}>Slideshow</span>
                <span style={{ fontSize: scaledFont(8), color: '#9CA3AF' }}>Image carousel</span>
              </div>
            );
          }
          case 'video-player': {
            return (
              <div className="w-full h-full flex flex-col items-center justify-center" style={{ backgroundColor: '#111', borderRadius: 8 }}>
                <div style={{ width: scaledFont(36), height: scaledFont(36), borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: scaledFont(18), color: '#fff', marginLeft: '3px' }}>▶</span>
                </div>
                <span style={{ fontSize: scaledFont(9), color: '#9CA3AF', marginTop: '3%' }}>Video Player</span>
              </div>
            );
          }

          default: {
            return (
              <div className="w-full h-full flex flex-col items-center justify-center p-[3%]"
                style={{ backgroundColor: `${color}08`, border: `2px dashed ${color}30`, borderRadius: '8px' }}>
                <Icon style={{ width: scaledFont(28), height: scaledFont(28), color: `${color}60`, marginBottom: '3%' }} />
                <span style={{ fontSize: scaledFont(12), fontWeight: 600, color: '#374151' }}>{label}</span>
                <span style={{ fontSize: scaledFont(9), color: '#9CA3AF' }}>Interactive Element</span>
              </div>
            );
          }
        }
      };

      return (
        <div key={el.id} className={`${selectionBorder}`} style={style}
          onMouseDown={e => handleElementMouseDown(e, el, pageId)}
          onContextMenu={e => handleElementContextMenu(e, el, pageId)}>
          <TypeBadge />
          <div className="w-full h-full overflow-hidden rounded-lg bg-white shadow-sm">
            {renderInteractiveContent()}
          </div>
          {isSelected && renderResizeHandles(el)}
        </div>
      );
    }

  };

  const renderElementControls = (el: CanvasElement) => {
    const nearTop = el.y < 40;
    const nearBottom = (el.y + el.height) > 600;
    const posClass = nearTop
      ? 'top-2 left-1/2 -translate-x-1/2'
      : nearBottom
        ? 'left-1/2 -translate-x-1/2'
        : 'left-1/2 -translate-x-1/2';
    const topOffset = nearTop ? undefined : -52;
    const isSmall = el.width < 180 || el.height < 120;
    const btnSize = isSmall ? 'w-5 h-5' : 'w-7 h-7';
    const iconSize = isSmall ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5';
    return (
      <div className={`absolute ${posClass} flex items-center gap-2 z-50`}
        style={topOffset !== undefined ? { top: topOffset } : undefined}
        onMouseDown={e => e.stopPropagation()}>
        {[
          { icon: Move, label: 'Move', action: () => {}, cursor: 'grab' },
          { icon: RotateCcw, label: 'Rotate', action: () => updateElement(el.id, { rotation: ((el.rotation || 0) + 15) % 360 }) },
          { icon: el.locked ? Lock : Unlock, label: el.locked ? 'Unlock' : 'Lock', action: () => updateElement(el.id, { locked: !el.locked }), destructive: el.locked ? true : undefined },
          { icon: Copy, label: 'Duplicate', action: duplicateElement },
          { icon: Trash2, label: 'Delete', action: deleteElement, destructive: true },
        ].map(({ icon: Icon, label, action, destructive, cursor }) => (
          <Tooltip key={label}><TooltipTrigger asChild>
            <button onClick={action}
              className={`${btnSize} rounded-full flex items-center justify-center shadow-md border transition-colors ${
                destructive
                  ? 'bg-destructive text-destructive-foreground border-destructive/20 hover:bg-destructive/90'
                  : 'bg-accent text-accent-foreground border-accent/20 hover:bg-accent/90'
              }`}
              style={cursor ? { cursor } : undefined}>
              <Icon className={iconSize} />
            </button>
          </TooltipTrigger><TooltipContent side="top" className="text-xs">{label}</TooltipContent></Tooltip>
        ))}
      </div>
    );
  };

  const renderSelectedImageActions = (el: CanvasElement, pageId: string) => {
    if (el.type !== 'image' || !el.src || selectedElementId !== el.id || selectedPageId !== pageId) return null;
    // Hide the action bar when replace overlay is showing
    if (replaceModalElementId === el.id) return null;

    const isSmall = el.width < 25 || el.height < 25;
    const isFullPage = el.width >= 90 && el.height >= 90;
    const isReplacing = replaceModalElementId === el.id;
    const suggestions = getContextualImages({
      bookTitle,
      pageTitle: selectedPage?.title,
      pageType: selectedPage?.type,
      surroundingText: gatherPageText(pageElements[selectedPage?.id || ''] || []),
      excludeSrcs: [el.src || ''],
      count: 3,
    });
    const left = `${el.x + el.width / 2}%`;
    const top = `${el.y + el.height / 2}%`;

    const toolbarStyle: React.CSSProperties = {
      left,
      top,
      transform: 'translate(-50%, -50%)',
    };

    // Suggestions are now rendered inline inside the image element, not as a floating bar

    return (
      <>
        <div
          className="absolute z-[120] flex max-w-[calc(100%-24px)] items-center gap-1 rounded-lg border border-foreground/[0.08] bg-background/95 px-2 py-1.5 shadow-lg backdrop-blur-sm pointer-events-auto"
          style={toolbarStyle}
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
          onPointerDown={e => e.stopPropagation()}
        >
          <button
            onClick={e => {
              e.stopPropagation();
              if (isReplacing) {
                setReplaceModalElementId(null);
              } else {
                setReplaceModalElementId(el.id);
                onOpenImageSection?.();
              }
            }}
            className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors ${isReplacing ? 'bg-accent/10 text-accent font-medium' : 'text-foreground hover:bg-foreground/[0.05]'}`}
          >
            <ImagePlus className="w-3.5 h-3.5" />{isReplacing ? 'Cancel' : 'Replace'}
          </button>

          <Popover>
            <PopoverTrigger asChild>
              <button
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-foreground transition-colors hover:bg-foreground/[0.05]"
              >
                <Move className="w-3.5 h-3.5" />Position
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-44 p-2 z-[10050]"
              side="top"
              align="center"
              onMouseDown={e => e.stopPropagation()}
              onPointerDown={e => e.stopPropagation()}
            >
              <p className="mb-1.5 text-[10px] font-semibold text-muted-foreground">Quick Position</p>
              <div className="grid grid-cols-2 gap-1">
                {[
                  { label: 'Full Page', x: 0, y: 0, w: 100, h: 100, icon: '⬜' },
                  { label: 'Middle Band', x: 0, y: 25, w: 100, h: 50, icon: '↔' },
                  { label: 'Bottom Half', x: 0, y: 50, w: 100, h: 50, icon: '⬇' },
                  { label: 'Top Half', x: 0, y: 0, w: 100, h: 50, icon: '⬆' },
                  { label: 'Top Strip', x: 0, y: 0, w: 100, h: 30, icon: '▔' },
                  { label: 'Bottom Strip', x: 0, y: 70, w: 100, h: 30, icon: '▁' },
                ].map(preset => (
                  <button
                    key={preset.label}
                    onClick={e => {
                      e.stopPropagation();
                      updateElement(el.id, { x: preset.x, y: preset.y, width: preset.w, height: preset.h });
                      toast.success(`Positioned: ${preset.label}`);
                    }}
                    className="flex items-center gap-1.5 rounded px-2 py-1.5 text-[11px] text-foreground transition-colors hover:bg-foreground/[0.05]"
                  >
                    <span className="text-xs">{preset.icon}</span>{preset.label}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={e => { e.stopPropagation(); setShowAIEditModal(true); }}
                className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-foreground transition-colors hover:bg-foreground/[0.05]"
              >
                <Sparkles className="w-3.5 h-3.5 text-accent" />{!isSmall && 'Edit'}
              </button>
            </TooltipTrigger>
            {isSmall && <TooltipContent side="top">Edit</TooltipContent>}
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={e => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (selectedElementId && selectedPage) {
                    updateElements(selectedPage.id, currentElements.filter(el2 => el2.id !== el.id));
                    setSelectedElementId(null);
                    toast.success('Element deleted');
                  }
                }}
                className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-destructive transition-colors hover:bg-destructive/10"
              >
                <Trash2 className="w-3.5 h-3.5" />{!isSmall && 'Delete'}
              </button>
            </TooltipTrigger>
            {isSmall && <TooltipContent side="top">Delete</TooltipContent>}
          </Tooltip>
        </div>

      </>
    );
  };

  const renderResizeHandles = (el: CanvasElement) => {
    const handles = el.locked ? [] : ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];
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
    return (
      <>
        {renderElementControls(el)}
        {handles.map(h => (
          <div key={h} className="absolute w-2.5 h-2.5 bg-background border-2 border-accent rounded-full z-50"
            style={positions[h]}
            onMouseDown={e => handleResizeMouseDown(e, el, h)} />
        ))}
        {/* Rotation handle — line + circle above top-center */}
        {!el.locked && (
          <div className="absolute z-50" style={{ top: -30, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              className="w-4 h-4 rounded-full bg-accent border-2 border-background shadow-md cursor-grab active:cursor-grabbing flex items-center justify-center"
              onMouseDown={e => {
                e.preventDefault();
                e.stopPropagation();
                if (!canvasRef.current) return;
                const parent = (e.target as HTMLElement).closest('[style*="position"]')?.parentElement;
                if (!parent) return;
                const parentRect = parent.getBoundingClientRect();
                const centerX = parentRect.left + parentRect.width / 2;
                const centerY = parentRect.top + parentRect.height / 2;
                const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
                setUndoStack(prev => [...prev.slice(-50), { ...pageElements }]);
                setRedoStack([]);
                setRotateState({ id: el.id, centerX, centerY, startAngle, elemRotation: el.rotation || 0 });
              }}
            >
              <RotateCcw className="w-2.5 h-2.5 text-background" />
            </div>
            <div className="w-px h-3 bg-accent" />
          </div>
        )}
      </>
    );
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
                      {page.type === 'cover' ? '📕' : page.type === 'toc' ? '📋' : page.type === 'back' ? '📘' : page.type === 'blank' ? '📃' : page.type === 'chapter-page' ? '📄' : '📖'}
                    </span>
                  </div>
                  <p className="text-[10px] font-medium text-foreground truncate">{page.title}</p>
                  {page.hidden && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black text-white text-[9px] font-semibold shadow-sm mt-0.5">
                      <EyeOff className="w-2.5 h-2.5" /> Hidden Page
                    </span>
                  )}
                  {page.locked && <Lock className="w-2.5 h-2.5 text-muted-foreground" />}
                </div>
              ))}
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-full mt-2 flex items-center justify-center gap-1 py-2 border-2 border-dashed border-foreground/[0.08] rounded-lg text-[10px] text-muted-foreground hover:border-accent/40 hover:text-accent transition-colors">
                  <Plus className="w-3 h-3" />Add Page
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" side="right" align="start">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">Page Type</p>
                {PAGE_TYPE_OPTIONS.map(opt => (
                  <button key={opt.type} onClick={() => handleAddPage(opt.type)}
                    className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left hover:bg-foreground/[0.04] transition-colors">
                    <span className="text-base">{opt.icon}</span>
                    <div>
                      <p className="text-xs font-medium text-foreground">{opt.label}</p>
                      <p className="text-[10px] text-muted-foreground">{opt.description}</p>
                    </div>
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        )}

        {/* Canvas Area */}
        <div className="flex-1 bg-foreground/[0.03] flex flex-col overflow-hidden">
          {isGridView ? (
            /* ─── GRID VIEW ─── */
            <div className="flex h-full flex-1 flex-col overflow-hidden">
              <div className="flex-1 overflow-auto no-scrollbar px-6 pt-6">
                <div className="flex flex-wrap justify-center content-start gap-y-6 items-start pb-4">
                  {currentPages.map((page, pageIndex) => {
                    const elems = resolvePageElements(pageElements, page, currentPages, bookTitle);
                    const isSelected = page.id === selectedPageId;
                    const getPageTypeIcon = () => {
                      switch (page.type) {
                        case 'cover': return BookMarked;
                        case 'toc': return ListChecks;
                        case 'chapter': return BookOpen;
                        case 'chapter-page': return AlignLeft;
                        case 'back': return BookMarked;
                        case 'blank': return FileText;
                        default: return FileText;
                      }
                    };
                    const PageIcon = getPageTypeIcon();
                    return (
                      <div key={page.id} className="flex items-start">
                        {/* Insert zone with drop indicator */}
                        <div
                          className={`relative flex items-center justify-center shrink-0 transition-all duration-300 ease-in-out ${
                            (gridInsertHover === pageIndex && draggedPageIndex === null) || (dragOverPageIndex === pageIndex && draggedPageIndex !== null)
                              ? 'w-14' : 'w-2'
                          }`}
                          style={{ height: `${140 * ph / pw}px` }}
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
                          <div className={`absolute inset-y-2 left-1/2 -translate-x-1/2 w-1 rounded-full bg-accent transition-all duration-150 ${dragOverPageIndex === pageIndex && draggedPageIndex !== null ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'}`} />
                          {/* Top/bottom dots */}
                          <div className={`absolute top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-accent transition-all duration-150 ${dragOverPageIndex === pageIndex && draggedPageIndex !== null ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                          <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-accent transition-all duration-150 ${dragOverPageIndex === pageIndex && draggedPageIndex !== null ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`} />
                          {/* Add page button (only when not dragging) */}
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className={`relative z-10 w-10 h-10 rounded-full bg-background border border-foreground/[0.12] text-muted-foreground flex items-center justify-center shadow-lg transition-all duration-200 hover:border-accent hover:text-accent ${gridInsertHover === pageIndex && draggedPageIndex === null ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-2" side="bottom" align="center">
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">Page Type</p>
                              {PAGE_TYPE_OPTIONS.map(opt => (
                                <button key={opt.type} onClick={(e) => { e.stopPropagation(); insertPageAt(pageIndex, opt.type); }}
                                  className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left hover:bg-foreground/[0.04] transition-colors">
                                  <span className="text-base">{opt.icon}</span>
                                  <div>
                                    <p className="text-xs font-medium text-foreground">{opt.label}</p>
                                    <p className="text-[10px] text-muted-foreground">{opt.description}</p>
                                  </div>
                                </button>
                              ))}
                            </PopoverContent>
                          </Popover>
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
                            onClick={() => handleGridPageOpen(page.id)}
                            className={`group relative w-full bg-white rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                              isSelected ? 'ring-2 ring-accent shadow-lg' : 'border border-foreground/[0.08] hover:shadow-md hover:border-accent/40'
                            } ${draggedPageIndex === pageIndex ? 'opacity-50 scale-95' : ''} ${page.hidden ? 'opacity-50' : ''}`}
                            style={{ aspectRatio: `${pw}/${ph}` }}
                          >
                            <div className="w-full h-full relative overflow-hidden">
                              <div
                                className="absolute top-0 left-0 origin-top-left"
                                style={{ width: pw, height: ph }}
                                ref={(node) => {
                                  if (!node) return;
                                  const parent = node.parentElement;
                                  if (!parent) return;
                                  const s = parent.clientWidth / pw;
                                  node.style.transform = `scale(${s})`;
                                }}
                              >
                                {elems.map(el => {
                                  if (el.type === 'image') {
                                    if ((el as any).isPlaceholder || !el.src) return (
                                      <div key={el.id} className="absolute bg-muted/30 border border-dashed border-muted-foreground/20" style={{ left: `${el.x}%`, top: `${el.y}%`, width: `${el.width}%`, height: `${el.height}%`, opacity: el.opacity ?? 1 }} />
                                    );
                                    return (
                                      <div key={el.id} className="absolute overflow-hidden" style={{ left: `${el.x}%`, top: `${el.y}%`, width: `${el.width}%`, height: `${el.height}%`, opacity: el.opacity ?? 1, borderRadius: el.borderRadius || 0 }}>
                                        <img src={el.src} alt="" className="w-full h-full object-cover" draggable={false} />
                                      </div>
                                    );
                                  }
                                  if (el.type === 'shape') return (
                                    <div key={el.id} className="absolute" style={{ left: `${el.x}%`, top: `${el.y}%`, width: `${el.width}%`, height: `${el.height}%`, backgroundColor: el.fill || '#3b82f6', border: el.stroke && el.stroke !== 'transparent' ? `${el.strokeWidth || 1}px solid ${el.stroke}` : undefined, borderRadius: el.shapeType === 'circle' ? '50%' : (el.borderRadius ?? 0), opacity: el.opacity ?? 1 }} />
                                  );
                                  if (el.type === 'text') return (
                                    <div key={el.id} className="absolute overflow-hidden" style={{ left: `${el.x}%`, top: `${el.y}%`, width: `${el.width}%`, height: `${el.height}%`, fontSize: `${el.fontSize || 16}px`, fontFamily: el.fontFamily, color: el.textColor, fontWeight: el.fontWeight || 'normal', fontStyle: el.fontStyle || 'normal', textDecoration: el.textDecoration || 'none', textAlign: el.textAlign || 'left', lineHeight: el.lineHeight ?? 1.5, whiteSpace: 'pre-wrap', opacity: el.opacity ?? 1 }}>
                                      {el.content}
                                    </div>
                                  );
                                  return null;
                                })}
                              </div>
                            </div>
                            {page.hidden && (
                              <div className="absolute inset-0 z-[5] flex items-center justify-center bg-black/10 pointer-events-none">
                                <div className="flex items-center gap-1 bg-black backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm">
                                  <EyeOff className="w-3 h-3 text-white" />
                                  <span className="text-[10px] font-semibold text-white">Hidden Page</span>
                                </div>
                              </div>
                            )}
                            {page.locked && !page.hidden && (
                              <div className="absolute inset-0 z-[5] flex items-center justify-center bg-accent/5 pointer-events-none">
                                <div className="flex items-center gap-1 bg-accent/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm">
                                  <Lock className="w-3 h-3 text-white" />
                                  <span className="text-[10px] font-semibold text-white">Page Locked</span>
                                </div>
                              </div>
                            )}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <Popover open={gridMenuOpenId === page.id} onOpenChange={(open) => setGridMenuOpenId(open ? page.id : null)}>
                                <PopoverTrigger asChild>
                                  <button onClick={e => e.stopPropagation()} className="w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                </PopoverTrigger>
                                <PopoverContent className="z-[10050] w-48 p-1.5" align="start" side="bottom" sideOffset={8} collisionPadding={24}>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <button
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-foreground/[0.04] flex items-center gap-3 transition-colors"
                                      >
                                        <Plus className="w-4 h-4" /> Add Page After
                                      </button>
                                    </PopoverTrigger>
                                    <PopoverContent className="z-[10050] w-56 p-2" side="right" align="start" sideOffset={8} collisionPadding={24}>
                                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">Page Type</p>
                                      {PAGE_TYPE_OPTIONS.map(opt => (
                                        <button key={opt.type} onClick={(e) => { e.stopPropagation(); insertPageAt(pageIndex + 1, opt.type); setGridMenuOpenId(null); }}
                                          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left hover:bg-foreground/[0.04] transition-colors">
                                          <span className="text-base">{opt.icon}</span>
                                          <div>
                                            <p className="text-xs font-medium text-foreground">{opt.label}</p>
                                            <p className="text-[10px] text-muted-foreground">{opt.description}</p>
                                          </div>
                                        </button>
                                      ))}
                                    </PopoverContent>
                                  </Popover>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDuplicatePageById(page.id); setGridMenuOpenId(null); }}
                                    className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-foreground/[0.04] flex items-center gap-3 transition-colors"
                                  >
                                    <Files className="w-4 h-4" /> Duplicate
                                  </button>
                                   <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPages(currentPages.map(p => p.id === page.id ? { ...p, hidden: !p.hidden } : p));
                                      toast.success(page.hidden ? 'Page visible again' : 'Page hidden from readers');
                                      setGridMenuOpenId(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-foreground/[0.04] flex items-center gap-3 transition-colors"
                                  >
                                    {page.hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    {page.hidden ? 'Show' : 'Hide'}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPages(currentPages.map(p => p.id === page.id ? { ...p, locked: !p.locked } : p));
                                      toast.success(page.locked ? 'Page unlocked' : 'Page locked');
                                      setGridMenuOpenId(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-foreground/[0.04] flex items-center gap-3 transition-colors"
                                  >
                                    {page.locked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                    {page.locked ? 'Unlock Page' : 'Lock Page'}
                                  </button>
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleDownloadPage(page.id); setGridMenuOpenId(null); }}
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
                          <div className="flex items-center gap-1">
                            <PageIcon className={`w-3 h-3 ${
                              page.type === 'cover' || page.type === 'back' ? 'text-violet-400' :
                              page.type === 'toc' ? 'text-sky-400' :
                              page.type === 'chapter' ? 'text-accent' :
                              'text-muted-foreground'
                            }`} />
                            <span className={`text-xs font-medium ${isSelected ? 'text-accent' : ''}`}>
                              {page.type !== 'cover' && page.type !== 'toc' && page.type !== 'back'
                                ? currentPages.filter(p => p.type !== 'cover' && p.type !== 'toc' && p.type !== 'back').indexOf(page) + 1
                                : '–'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Trailing insert + Add Page card */}
                  <div className="flex items-start">
                    <div
                      className={`relative flex items-center justify-center shrink-0 transition-all duration-300 ease-in-out ${
                        (gridInsertHover === currentPages.length && draggedPageIndex === null) || (dragOverPageIndex === currentPages.length && draggedPageIndex !== null)
                          ? 'w-14' : 'w-2'
                      }`}
                      style={{ height: `${140 * ph / pw}px` }}
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
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className={`relative z-10 w-10 h-10 rounded-full bg-background border border-foreground/[0.12] text-muted-foreground flex items-center justify-center shadow-lg transition-all duration-200 hover:border-accent hover:text-accent ${gridInsertHover === currentPages.length && draggedPageIndex === null ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2" side="bottom" align="center">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">Page Type</p>
                          {PAGE_TYPE_OPTIONS.map(opt => (
                            <button key={opt.type} onClick={(e) => { e.stopPropagation(); insertPageAt(currentPages.length, opt.type); }}
                              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left hover:bg-foreground/[0.04] transition-colors">
                              <span className="text-base">{opt.icon}</span>
                              <div>
                                <p className="text-xs font-medium text-foreground">{opt.label}</p>
                                <p className="text-[10px] text-muted-foreground">{opt.description}</p>
                              </div>
                            </button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 w-[140px]">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className="w-full rounded-lg border-2 border-dashed border-foreground/[0.1] hover:border-accent/50 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer group"
                            style={{ aspectRatio: `${pw}/${ph}` }}>
                            <Plus className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
                            <span className="text-xs text-muted-foreground group-hover:text-accent transition-colors">Add Page</span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-2" side="top" align="center">
                          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">Page Type</p>
                          {PAGE_TYPE_OPTIONS.map(opt => (
                            <button key={opt.type} onClick={() => handleAddPage(opt.type)}
                              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left hover:bg-foreground/[0.04] transition-colors">
                              <span className="text-base">{opt.icon}</span>
                              <div>
                                <p className="text-xs font-medium text-foreground">{opt.label}</p>
                                <p className="text-[10px] text-muted-foreground">{opt.description}</p>
                              </div>
                            </button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </div>
              {/* Bottom actions */}
              <div className="shrink-0 flex justify-end gap-3 px-6 pb-4 pt-3 bg-gradient-to-t from-background via-background to-transparent">
                <button onClick={handleGridCancel} className="px-6 py-2.5 rounded-lg border border-foreground/[0.1] text-sm font-medium hover:bg-foreground/[0.04] transition-colors">
                  Cancel
                </button>
                <button onClick={handleGridConfirm} className="px-6 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors">
                  Confirm
                </button>
              </div>

              {/* Cancel confirmation dialog */}
              {showGridCancelConfirm && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="bg-background rounded-xl border border-foreground/[0.08] shadow-2xl p-6 max-w-sm w-full mx-4">
                    <h3 className="text-sm font-bold text-foreground mb-1.5">Discard Changes?</h3>
                    <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
                      Any changes you made in grid view — reordering, hiding, locking, or deleting pages — will not be saved.
                    </p>
                    <div className="flex justify-end gap-2.5">
                      <button onClick={() => setShowGridCancelConfirm(false)} className="px-4 py-2 rounded-lg border border-foreground/[0.1] text-xs font-medium hover:bg-foreground/[0.04] transition-colors">
                        Keep Editing
                      </button>
                      <button onClick={handleGridCancelConfirm} className="px-4 py-2 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors">
                        Discard Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ─── NORMAL VIEW ─── */
            <>
              {/* Commenting mode banner */}
              {accessMode === 'commenting' && (
                <div className="h-9 border-b border-accent/20 bg-accent/5 flex items-center justify-center gap-2 px-3 shrink-0">
                  <MessageSquare className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs font-medium text-accent">Commenting Mode — Click Anywhere On The Page To Leave A Comment</span>
                  <span className="text-[10px] text-accent/60 ml-2">{pageComments.length} comment{pageComments.length !== 1 ? 's' : ''}</span>
                  {pageComments.length > 0 && (
                    <>
                      <button onClick={() => setShowAllComments(!showAllComments)}
                        className="ml-2 text-[10px] font-semibold text-accent hover:underline">
                        {showAllComments ? 'Hide All' : 'See All'}
                      </button>
                      <button onClick={resolveAllComments}
                        className="ml-1 text-[10px] font-semibold text-accent hover:underline flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Resolve All
                      </button>
                    </>
                  )}
                </div>
              )}
              {/* All comments panel */}
              {showAllComments && pageComments.length > 0 && (
                <div className="border-b border-foreground/[0.06] bg-card max-h-60 overflow-y-auto">
                  <div className="px-4 py-2 flex items-center justify-between border-b border-foreground/[0.06]">
                    <span className="text-xs font-semibold text-foreground">All Comments ({pageComments.length})</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{pageComments.filter(c => c.resolved).length} resolved</span>
                      <button onClick={() => setShowAllComments(false)} className="text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <div className="divide-y divide-foreground/[0.04]">
                    {pageComments.map((c, i) => {
                      const page = currentPages.find(p => p.id === c.pageId);
                      return (
                        <div key={c.id} className={`px-4 py-2.5 flex items-start gap-3 text-xs cursor-pointer hover:bg-foreground/[0.03] transition-colors ${c.resolved ? 'opacity-50' : ''}`}
                          onClick={() => {
                            const pageIdx = currentPages.findIndex(p => p.id === c.pageId);
                            if (pageIdx >= 0) {
                              onPageSelect(c.pageId);
                              const pageEl = pageRefs.current[c.pageId];
                              if (pageEl) pageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              setActiveCommentId(c.id);
                            }
                          }}>
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5 ${c.resolved ? 'bg-muted text-muted-foreground' : 'bg-accent text-white'}`}>{i + 1}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-semibold text-foreground">{c.author}</span>
                              <span className="text-muted-foreground">on {page?.title || 'Page'}</span>
                              <span className="text-muted-foreground ml-auto">{c.timestamp}</span>
                            </div>
                            <p className="text-foreground/80 leading-relaxed">{renderCommentText(c.text)}</p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button onClick={() => setPageComments(prev => prev.map(pc => pc.id === c.id ? { ...pc, resolved: !pc.resolved } : pc))}
                              className="text-[10px] font-medium text-accent hover:underline">
                              {c.resolved ? 'Reopen' : 'Resolve'}
                            </button>
                            <button onClick={() => setPageComments(prev => prev.filter(pc => pc.id !== c.id))}
                              className="text-[10px] text-destructive hover:underline">Delete</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {isViewOnly && (
                <div className="h-9 border-b border-blue-500/20 bg-blue-500/5 flex items-center justify-center gap-2 px-3 shrink-0">
                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-xs font-medium text-blue-500">View Only — You Can Browse But Not Edit This Book</span>
                </div>
              )}
              {/* Unified toolbar — only visible when element is selected and user can edit */}
              {selectedElement && canEdit && (
<div className="h-10 border-b border-foreground/[0.04] bg-background flex items-center justify-center px-3 shrink-0" style={{ paddingLeft: panelOffset > 0 ? panelOffset : undefined, paddingRight: panelOffset < 0 ? -panelOffset : undefined }} onMouseDown={e => { e.stopPropagation(); if (editingTextId) e.preventDefault(); }} onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-1">
                {/* Select & Add Image — hidden for text elements */}
                {selectedElement?.type !== 'text' && (
                  <>
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={() => { setActiveTool('select'); setSelectedElementId(null); }}
                        className={`p-1.5 rounded transition-colors ${activeTool === 'select' ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground'}`}>
                        <MousePointer2 className="w-4 h-4" />
                      </button>
                    </TooltipTrigger><TooltipContent>Select (V)</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={() => { setActiveTool('image'); imageInputRef.current?.click(); }}
                        className={`p-1.5 rounded transition-colors ${activeTool === 'image' ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground'}`}>
                        <ImageIcon className="w-4 h-4" />
                      </button>
                    </TooltipTrigger><TooltipContent>Add Image (I)</TooltipContent></Tooltip>
                  </>
                )}

                {/* ── Context: Text formatting ── */}
                {selectedElement?.type === 'text' && (
                  <>
                    <Select value={selectedElement.fontFamily || 'Inter'} onValueChange={v => updateElement(selectedElement.id, { fontFamily: v })}>
                      <SelectTrigger className="w-32 h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{FONTS.map(f => <SelectItem key={f} value={f}><span style={{ fontFamily: f }}>{f}</span></SelectItem>)}</SelectContent>
                    </Select>
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={() => updateElement(selectedElement.id, { fontSize: Math.max(8, (selectedElement.fontSize || 16) - 2) })}
                        className="p-1 rounded text-muted-foreground hover:bg-foreground/[0.05]"><Minus className="w-3 h-3" /></button>
                    </TooltipTrigger><TooltipContent>Decrease Font Size</TooltipContent></Tooltip>
                    <span className="text-xs font-medium w-7 text-center">{selectedElement.fontSize || 16}</span>
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={() => updateElement(selectedElement.id, { fontSize: Math.min(96, (selectedElement.fontSize || 16) + 2) })}
                        className="p-1 rounded text-muted-foreground hover:bg-foreground/[0.05]"><Plus className="w-3 h-3" /></button>
                    </TooltipTrigger><TooltipContent>Increase Font Size</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <div className="relative w-7 h-7 flex items-center justify-center cursor-pointer">
                        <input type="color" value={selectedElement.textColor || '#1a1a2e'}
                          onChange={e => { if (editingTextId) { applyRichTextCommand('foreColor', e.target.value); } else { updateElement(selectedElement.id, { textColor: e.target.value }); } }}
                          onMouseDown={e => e.stopPropagation()}
                          onClick={e => e.stopPropagation()}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                        <span className="text-sm font-bold" style={{ color: selectedElement.textColor || '#1a1a2e' }}>A</span>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full" style={{ backgroundColor: selectedElement.textColor || '#1a1a2e' }} />
                      </div>
                    </TooltipTrigger><TooltipContent>Text Color</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <div className="relative">
                        <input type="color" value={selectedElement.highlightColor || '#ffff00'}
                          onChange={e => { if (editingTextId) { applyRichTextCommand('hiliteColor', e.target.value); } else { updateElement(selectedElement.id, { highlightColor: e.target.value }); } }}
                          onMouseDown={e => e.stopPropagation()}
                          onClick={e => e.stopPropagation()}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                        <div className={`w-7 h-7 rounded flex items-center justify-center cursor-pointer ${selectedElement.highlightColor ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-foreground/[0.05]'}`}>
                          <Highlighter className="w-3.5 h-3.5" />
                        </div>
                        {selectedElement.highlightColor && (
                          <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full" style={{ backgroundColor: selectedElement.highlightColor }} />
                        )}
                      </div>
                    </TooltipTrigger><TooltipContent>Highlight Color</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={() => updateElement(selectedElement.id, { fontSize: selectedElement.fontSize === 28 ? 16 : 28, fontWeight: selectedElement.fontSize === 28 ? 'normal' : 'bold' })}
                        className={`w-7 h-7 rounded text-xs font-bold flex items-center justify-center ${selectedElement.fontSize && selectedElement.fontSize >= 28 ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-foreground/[0.05]'}`}>
                        H
                      </button>
                    </TooltipTrigger><TooltipContent>Heading</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <button onMouseDown={e => e.preventDefault()} onClick={() => { if (editingTextId) { applyRichTextCommand('bold'); } else { updateElement(selectedElement.id, { fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' }); } }}
                        className={`p-1.5 rounded ${selectedElement.fontWeight === 'bold' ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-foreground/[0.05]'}`}>
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger><TooltipContent>Bold</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <button onMouseDown={e => e.preventDefault()} onClick={() => { if (editingTextId) { applyRichTextCommand('italic'); } else { updateElement(selectedElement.id, { fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' }); } }}
                        className={`p-1.5 rounded ${selectedElement.fontStyle === 'italic' ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-foreground/[0.05]'}`}>
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger><TooltipContent>Italic</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <button onMouseDown={e => e.preventDefault()} onClick={() => { if (editingTextId) { applyRichTextCommand('underline'); } else { updateElement(selectedElement.id, { textDecoration: selectedElement.textDecoration === 'underline' ? 'none' : 'underline' }); } }}
                        className={`p-1.5 rounded ${selectedElement.textDecoration === 'underline' ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-foreground/[0.05]'}`}>
                        <Underline className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger><TooltipContent>Underline</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <button onMouseDown={e => e.preventDefault()} onClick={() => { if (editingTextId) { applyRichTextCommand('strikeThrough'); } else { updateElement(selectedElement.id, { textDecoration: selectedElement.textDecoration === 'line-through' ? 'none' : 'line-through' }); } }}
                        className={`p-1.5 rounded ${selectedElement.textDecoration === 'line-through' ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-foreground/[0.05]'}`}>
                        <Strikethrough className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger><TooltipContent>Strikethrough</TooltipContent></Tooltip>
                    {(['left', 'center', 'right', 'justify'] as const).map(align => {
                      const Icon = align === 'left' ? AlignLeft : align === 'center' ? AlignCenter : align === 'right' ? AlignRight : AlignJustify;
                      const label = align === 'left' ? 'Align Left' : align === 'center' ? 'Align Center' : align === 'right' ? 'Align Right' : 'Justify';
                      return (
                        <Tooltip key={align}><TooltipTrigger asChild>
                          <button onClick={() => updateElement(selectedElement.id, { textAlign: align })}
                            className={`p-1.5 rounded ${selectedElement.textAlign === align ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-foreground/[0.05]'}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </button>
                        </TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip>
                      );
                    })}
                    {/* Line Height */}
                    <Popover>
                      <Tooltip><TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <button className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05] flex items-center gap-0.5">
                            <ArrowUpDown className="w-3.5 h-3.5" />
                            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        </PopoverTrigger>
                      </TooltipTrigger><TooltipContent>Line Height</TooltipContent></Tooltip>
                      <PopoverContent className="w-52 p-3" align="center">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-foreground">Line Height</span>
                          <span className="text-xs text-muted-foreground">{(selectedElement.lineHeight ?? 1.5).toFixed(1)}</span>
                        </div>
                        <Slider
                          value={[(selectedElement.lineHeight ?? 1.5) * 10]}
                          onValueChange={([v]) => updateElement(selectedElement.id, { lineHeight: v / 10 })}
                          min={8} max={30} step={1} className="w-full"
                        />
                      </PopoverContent>
                    </Popover>
                    {/* Link */}
                    <Popover>
                      <Tooltip><TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <button className={`p-1.5 rounded hover:bg-foreground/[0.05] ${selectedElement.linkUrl ? 'text-accent' : 'text-muted-foreground hover:text-foreground'}`}>
                            <Link2 className="w-3.5 h-3.5" />
                          </button>
                        </PopoverTrigger>
                      </TooltipTrigger><TooltipContent>Add Link</TooltipContent></Tooltip>
                      <PopoverContent className="w-64 p-3" align="center">
                        <p className="text-xs font-semibold text-foreground mb-2">Link URL</p>
                        <input type="url" placeholder="https://example.com"
                          value={selectedElement.linkUrl || ''}
                          onChange={e => updateElement(selectedElement.id, { linkUrl: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-foreground/[0.1] bg-foreground/[0.02] text-xs focus:outline-none focus:border-accent/40" />
                        {selectedElement.linkUrl && (
                          <button onClick={() => updateElement(selectedElement.id, { linkUrl: '' })}
                            className="mt-2 text-xs text-accent hover:underline">Remove Link</button>
                        )}
                      </PopoverContent>
                    </Popover>
                    {/* Layers */}
                    <Popover>
                      <Tooltip><TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <button className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground flex items-center gap-0.5">
                            <Layers className="w-3.5 h-3.5" />
                            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        </PopoverTrigger>
                      </TooltipTrigger><TooltipContent>Layers</TooltipContent></Tooltip>
                      <PopoverContent className="w-44 p-2" align="center">
                        {[
                          { label: 'Bring to Front', zIndex: 999 },
                          { label: 'Bring Forward', zIndex: Math.min(999, (selectedElement.zIndex ?? 1) + 1) },
                          { label: 'Send Backward', zIndex: Math.max(0, (selectedElement.zIndex ?? 1) - 1) },
                          { label: 'Send to Back', zIndex: 0 },
                        ].map(l => (
                          <button key={l.label} onClick={() => updateElement(selectedElement.id, { zIndex: l.zIndex })}
                            className="w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-foreground/[0.04] transition-colors">{l.label}</button>
                        ))}
                      </PopoverContent>
                    </Popover>
                    {/* Border controls */}
                    <Popover>
                      <Tooltip><TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <button className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground flex items-center gap-0.5">
                            <SquareIcon className="w-3.5 h-3.5" style={{ borderStyle: selectedElement.borderStyle || 'solid', borderWidth: 1.5, borderColor: 'currentColor', borderRadius: 2, width: 14, height: 14 }} />
                            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        </PopoverTrigger>
                      </TooltipTrigger><TooltipContent>Border</TooltipContent></Tooltip>
                      <PopoverContent className="w-56 p-3" align="center">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground">Style</span>
                            <select value={selectedElement.borderStyle || 'none'}
                              onChange={e => updateElement(selectedElement.id, { borderStyle: e.target.value as CanvasElement['borderStyle'] })}
                              className="text-xs bg-background border border-foreground/[0.1] rounded px-2 py-1">
                              <option value="none">None</option>
                              <option value="solid">Solid</option>
                              <option value="dashed">Dashed</option>
                              <option value="dotted">Dotted</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground">Width</span>
                            <input type="number" min={0} max={20} value={selectedElement.borderWidth || 1}
                              onChange={e => updateElement(selectedElement.id, { borderWidth: Number(e.target.value) })}
                              className="text-xs bg-background border border-foreground/[0.1] rounded px-2 py-1 w-16 text-center" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground">Color</span>
                            <input type="color" value={selectedElement.borderColor || '#000000'}
                              onChange={e => updateElement(selectedElement.id, { borderColor: e.target.value })}
                              className="w-6 h-6 rounded border border-foreground/[0.1] cursor-pointer" />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    {/* Position */}
                    <Popover>
                      <Tooltip><TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <button className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground flex items-center gap-0.5">
                            <Move className="w-3.5 h-3.5" />
                            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        </PopoverTrigger>
                      </TooltipTrigger><TooltipContent>Position</TooltipContent></Tooltip>
                      <PopoverContent className="w-56 p-3" align="center">
                        <p className="text-xs font-semibold text-foreground mb-2">Position</p>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {[
                            { label: 'X', key: 'x' as const },
                            { label: 'Y', key: 'y' as const },
                            { label: 'W', key: 'width' as const },
                            { label: 'H', key: 'height' as const },
                          ].map(({ label, key }) => (
                            <div key={key} className="flex items-center gap-1">
                              <span className="text-[10px] text-muted-foreground w-3">{label}</span>
                              <input type="number" value={Math.round(selectedElement[key])}
                                onChange={e => updateElement(selectedElement.id, { [key]: Number(e.target.value) })}
                                className="flex-1 px-2 py-1 rounded border border-foreground/[0.1] bg-foreground/[0.02] text-xs w-full" />
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground">Values in % of page</p>
                      </PopoverContent>
                    </Popover>
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={() => updateElement(selectedElement.id, { locked: !selectedElement.locked })}
                        className={`p-1.5 rounded ${selectedElement.locked ? 'text-destructive hover:bg-destructive/10' : 'text-muted-foreground hover:bg-foreground/[0.05]'}`}>
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
                    <Tooltip><TooltipTrigger asChild>
                      <span className="text-xs text-muted-foreground">Fill:</span>
                    </TooltipTrigger><TooltipContent>Fill Color</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <input type="color" value={selectedElement.fill || '#3b82f6'}
                        onChange={e => updateElement(selectedElement.id, { fill: e.target.value })}
                        className="w-6 h-6 rounded border border-foreground/[0.1] cursor-pointer" />
                    </TooltipTrigger><TooltipContent>Fill Color</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <span className="text-xs text-muted-foreground ml-1">Stroke:</span>
                    </TooltipTrigger><TooltipContent>Stroke Color</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <input type="color" value={selectedElement.stroke || '#1e40af'}
                        onChange={e => updateElement(selectedElement.id, { stroke: e.target.value })}
                        className="w-6 h-6 rounded border border-foreground/[0.1] cursor-pointer" />
                    </TooltipTrigger><TooltipContent>Stroke Color</TooltipContent></Tooltip>
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={() => updateElement(selectedElement.id, { shapeType: selectedElement.shapeType === 'circle' ? 'rectangle' : 'circle' })}
                        className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05]">
                        {selectedElement.shapeType === 'circle' ? <Square className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
                      </button>
                    </TooltipTrigger><TooltipContent>Toggle Shape</TooltipContent></Tooltip>
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
                    {/* Text — after Edit */}
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={() => setActiveTool('text')}
                        className={`p-1.5 rounded transition-colors ${activeTool === 'text' ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground'}`}>
                        <Type className="w-4 h-4" />
                      </button>
                    </TooltipTrigger><TooltipContent>Add Text (T)</TooltipContent></Tooltip>
                    {/* Opacity */}
                    <Popover>
                      <Tooltip><TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <button className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground flex items-center gap-0.5">
                            <Droplets className="w-3.5 h-3.5" />
                            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        </PopoverTrigger>
                      </TooltipTrigger><TooltipContent>Opacity</TooltipContent></Tooltip>
                      <PopoverContent className="w-56 p-3" align="center">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground">Opacity</span>
                            <span className="text-xs text-muted-foreground">{Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
                          </div>
                          <Slider
                            value={[(selectedElement.opacity ?? 1) * 100]}
                            onValueChange={([v]) => updateElement(selectedElement.id, { opacity: v / 100 })}
                            min={0} max={100} step={1}
                            className="w-full"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    {/* Crop / Resize */}
                    <Popover>
                      <Tooltip><TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <button className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground flex items-center gap-0.5">
                            <Crop className="w-3.5 h-3.5" />
                            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        </PopoverTrigger>
                      </TooltipTrigger><TooltipContent>Crop & Fit</TooltipContent></Tooltip>
                      <PopoverContent className="w-48 p-2" align="center">
                        <p className="text-xs font-semibold text-foreground mb-2">Object Fit</p>
                        {(['cover', 'contain', 'fill'] as const).map(fit => (
                          <button key={fit} onClick={() => updateElement(selectedElement.id, { objectFit: fit })}
                            className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors capitalize ${(selectedElement.objectFit || 'cover') === fit ? 'bg-accent/10 text-accent font-medium' : 'hover:bg-foreground/[0.04]'}`}>
                            {fit}
                          </button>
                        ))}
                      </PopoverContent>
                    </Popover>
                    {/* Resize */}
                    <Popover>
                      <Tooltip><TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <button className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground flex items-center gap-0.5">
                            <Maximize2 className="w-3.5 h-3.5" />
                            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        </PopoverTrigger>
                      </TooltipTrigger><TooltipContent>Resize & Position</TooltipContent></Tooltip>
                      <PopoverContent className="w-56 p-3" align="center">
                        <p className="text-xs font-semibold text-foreground mb-2">Size & Position</p>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {[
                            { label: 'X', key: 'x' as const },
                            { label: 'Y', key: 'y' as const },
                            { label: 'W', key: 'width' as const },
                            { label: 'H', key: 'height' as const },
                          ].map(({ label, key }) => (
                            <div key={key} className="flex items-center gap-1">
                              <span className="text-[10px] text-muted-foreground w-3">{label}</span>
                              <input type="number" value={Math.round(selectedElement[key])}
                                onChange={e => updateElement(selectedElement.id, { [key]: Number(e.target.value) })}
                                className="flex-1 px-2 py-1 rounded border border-foreground/[0.1] bg-foreground/[0.02] text-xs w-full" />
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">Values are in % of page</p>
                        <div className="border-t border-foreground/[0.06] mt-2 pt-2">
                          <p className="text-xs font-medium mb-1.5">Quick Presets</p>
                          {[
                            { label: 'Full Page', x: 0, y: 0, width: 100, height: 100 },
                            { label: 'Top Half', x: 0, y: 0, width: 100, height: 50 },
                            { label: 'Bottom Half', x: 0, y: 50, width: 100, height: 50 },
                            { label: 'Center Band', x: 0, y: 25, width: 100, height: 50 },
                          ].map(p => (
                            <button key={p.label} onClick={() => updateElement(selectedElement.id, { x: p.x, y: p.y, width: p.width, height: p.height })}
                              className="w-full text-left px-2 py-1 text-xs rounded hover:bg-foreground/[0.04] transition-colors">{p.label}</button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    {/* Filter */}
                    <Popover>
                      <Tooltip><TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <button className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground flex items-center gap-0.5">
                            <SlidersVertical className="w-3.5 h-3.5" />
                            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        </PopoverTrigger>
                      </TooltipTrigger><TooltipContent>Filter</TooltipContent></Tooltip>
                      <PopoverContent className="w-64 p-3" align="center">
                        <p className="text-xs font-semibold text-foreground mb-3">Image Adjustments</p>
                        {[
                          { label: 'Brightness', key: 'brightness' as const, min: 0, max: 200, def: 100 },
                          { label: 'Contrast', key: 'contrast' as const, min: 0, max: 200, def: 100 },
                          { label: 'Saturation', key: 'saturate' as const, min: 0, max: 200, def: 100 },
                          { label: 'Blur', key: 'blur' as const, min: 0, max: 20, def: 0 },
                          { label: 'Grayscale', key: 'grayscale' as const, min: 0, max: 100, def: 0 },
                          { label: 'Sepia', key: 'sepia' as const, min: 0, max: 100, def: 0 },
                        ].map(f => (
                          <div key={f.key} className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] text-muted-foreground w-16 shrink-0">{f.label}</span>
                            <Slider
                              value={[selectedElement[f.key] ?? f.def]}
                              onValueChange={([v]) => updateElement(selectedElement.id, { [f.key]: v })}
                              min={f.min} max={f.max} step={1} className="flex-1"
                            />
                            <span className="text-[10px] text-muted-foreground w-8 text-right">{selectedElement[f.key] ?? f.def}</span>
                          </div>
                        ))}
                        <button onClick={() => updateElement(selectedElement.id, { brightness: 100, contrast: 100, saturate: 100, blur: 0, grayscale: 0, sepia: 0 })}
                          className="mt-1 text-xs text-accent hover:underline">Reset All</button>
                      </PopoverContent>
                    </Popover>
                    {/* Mask / Clip Shape */}
                    <Popover>
                      <Tooltip><TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <button className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground flex items-center gap-0.5">
                            <CircleDot className="w-3.5 h-3.5" />
                            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        </PopoverTrigger>
                      </TooltipTrigger><TooltipContent>Mask Shape</TooltipContent></Tooltip>
                      <PopoverContent className="w-48 p-2" align="center">
                        <p className="text-xs font-semibold text-foreground mb-2">Clip Shape</p>
                        {[
                          { label: 'None (Rectangle)', radius: 0 },
                          { label: 'Rounded', radius: 12 },
                          { label: 'More Rounded', radius: 24 },
                          { label: 'Circle', radius: 9999 },
                        ].map(m => (
                          <button key={m.label} onClick={() => updateElement(selectedElement.id, { borderRadius: m.radius })}
                            className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors ${(selectedElement.borderRadius || 0) === m.radius ? 'bg-accent/10 text-accent font-medium' : 'hover:bg-foreground/[0.04]'}`}>
                            {m.label}
                          </button>
                        ))}
                      </PopoverContent>
                    </Popover>
                    {/* Shadow */}
                    <Popover>
                      <Tooltip><TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <button className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground flex items-center gap-0.5">
                            <Eclipse className="w-3.5 h-3.5" />
                            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        </PopoverTrigger>
                      </TooltipTrigger><TooltipContent>Shadow</TooltipContent></Tooltip>
                      <PopoverContent className="w-56 p-3" align="center">
                        <p className="text-xs font-semibold text-foreground mb-3">Drop Shadow</p>
                        {[
                          { label: 'X Offset', key: 'shadowX' as const, min: -50, max: 50, def: 0 },
                          { label: 'Y Offset', key: 'shadowY' as const, min: -50, max: 50, def: 0 },
                          { label: 'Blur', key: 'shadowBlur' as const, min: 0, max: 50, def: 0 },
                        ].map(s => (
                          <div key={s.key} className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] text-muted-foreground w-14 shrink-0">{s.label}</span>
                            <Slider
                              value={[selectedElement[s.key] ?? s.def]}
                              onValueChange={([v]) => updateElement(selectedElement.id, { [s.key]: v })}
                              min={s.min} max={s.max} step={1} className="flex-1"
                            />
                            <span className="text-[10px] text-muted-foreground w-6 text-right">{selectedElement[s.key] ?? s.def}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-muted-foreground">Color</span>
                          <input type="color" value={selectedElement.shadowColor || '#000000'}
                            onChange={e => updateElement(selectedElement.id, { shadowColor: e.target.value })}
                            className="w-6 h-6 rounded border border-foreground/[0.1] cursor-pointer" />
                        </div>
                        <button onClick={() => updateElement(selectedElement.id, { shadowX: 0, shadowY: 0, shadowBlur: 0, shadowColor: '#000000' })}
                          className="mt-2 text-xs text-accent hover:underline">Remove Shadow</button>
                      </PopoverContent>
                    </Popover>
                    {/* Text Wrap */}
                    <Popover>
                      <Tooltip><TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <button className={`p-1.5 rounded hover:bg-foreground/[0.05] flex items-center gap-0.5 ${selectedElement.wrapMode && selectedElement.wrapMode !== 'in-front' ? 'text-accent' : 'text-muted-foreground hover:text-foreground'}`}>
                            <LayoutGrid className="w-3.5 h-3.5" />
                            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        </PopoverTrigger>
                      </TooltipTrigger><TooltipContent>Text Wrapping</TooltipContent></Tooltip>
                      <PopoverContent className="w-56 p-3" align="center">
                        <p className="text-xs font-semibold text-foreground mb-2">Text Wrapping</p>
                        <div className="flex flex-col gap-0.5">
                          {([
                            { mode: 'in-front' as const, label: 'In Front of Text', desc: 'Image covers text' },
                            { mode: 'behind' as const, label: 'Behind Text', desc: 'Text covers image' },
                            { mode: 'square' as const, label: 'Square', desc: 'Wrap around bounding box' },
                            { mode: 'tight' as const, label: 'Tight', desc: 'Wrap close to image' },
                            { mode: 'top-bottom' as const, label: 'Top and Bottom', desc: 'Text above & below only' },
                          ]).map(opt => (
                            <button key={opt.mode} onClick={() => updateElement(selectedElement.id, { wrapMode: opt.mode })}
                              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${(selectedElement.wrapMode || 'in-front') === opt.mode ? 'bg-accent/10 text-accent' : 'hover:bg-foreground/[0.04]'}`}>
                              <span className="text-xs font-medium block">{opt.label}</span>
                              <span className="text-[10px] text-muted-foreground">{opt.desc}</span>
                            </button>
                          ))}
                        </div>
                        <div className="border-t border-foreground/[0.06] mt-2 pt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-medium text-foreground">Wrap Margin</span>
                            <span className="text-[10px] text-muted-foreground">{selectedElement.wrapMargin ?? 2}%</span>
                          </div>
                          <Slider
                            value={[selectedElement.wrapMargin ?? 2]}
                            onValueChange={([v]) => updateElement(selectedElement.id, { wrapMargin: v })}
                            min={0} max={10} step={0.5} className="w-full"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Tooltip>
                      <Popover>
                        <TooltipTrigger asChild>
                          <PopoverTrigger asChild>
                            <button className={`p-1.5 rounded transition-colors flex items-center gap-0.5 ${['rectangle','circle','line'].includes(activeTool) ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground'}`}>
                              <Square className="w-4 h-4" />
                              <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                            </button>
                          </PopoverTrigger>
                        </TooltipTrigger>
                        <TooltipContent>Shapes</TooltipContent>
                        <PopoverContent className="w-44 p-1.5" align="end">
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
                    </Tooltip>
                    {/* Border controls — right after Shapes */}
                    <Popover>
                      <Tooltip><TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <button className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground flex items-center gap-0.5">
                            <SquareIcon className="w-3.5 h-3.5" style={{ borderStyle: selectedElement.borderStyle || 'solid', borderWidth: 1.5, borderColor: 'currentColor', borderRadius: 2, width: 14, height: 14 }} />
                            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        </PopoverTrigger>
                      </TooltipTrigger><TooltipContent>Border</TooltipContent></Tooltip>
                      <PopoverContent className="w-56 p-3" align="center">
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground">Style</span>
                            <select value={selectedElement.borderStyle || 'none'}
                              onChange={e => updateElement(selectedElement.id, { borderStyle: e.target.value as CanvasElement['borderStyle'] })}
                              className="text-xs bg-background border border-foreground/[0.1] rounded px-2 py-1">
                              <option value="none">None</option>
                              <option value="solid">Solid</option>
                              <option value="dashed">Dashed</option>
                              <option value="dotted">Dotted</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground">Width</span>
                            <input type="number" min={0} max={20} value={selectedElement.borderWidth || 1}
                              onChange={e => updateElement(selectedElement.id, { borderWidth: Number(e.target.value) })}
                              className="text-xs bg-background border border-foreground/[0.1] rounded px-2 py-1 w-16 text-center" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground">Color</span>
                            <input type="color" value={selectedElement.borderColor || '#000000'}
                              onChange={e => updateElement(selectedElement.id, { borderColor: e.target.value })}
                              className="w-6 h-6 rounded border border-foreground/[0.1] cursor-pointer" />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    {/* Corner Radius */}
                    <Popover>
                      <Tooltip><TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <button className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground flex items-center gap-0.5">
                            <BoxSelect className="w-3.5 h-3.5" />
                            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        </PopoverTrigger>
                      </TooltipTrigger><TooltipContent>Corner Radius</TooltipContent></Tooltip>
                      <PopoverContent className="w-52 p-3" align="center">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-foreground">Corner Radius</span>
                          <span className="text-xs text-muted-foreground">{selectedElement.borderRadius || 0}px</span>
                        </div>
                        <Slider
                          value={[selectedElement.borderRadius || 0]}
                          onValueChange={([v]) => updateElement(selectedElement.id, { borderRadius: v })}
                          min={0} max={100} step={1} className="w-full"
                        />
                      </PopoverContent>
                    </Popover>
                    {/* Link */}
                    <Popover>
                      <Tooltip><TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <button className={`p-1.5 rounded hover:bg-foreground/[0.05] flex items-center gap-0.5 ${selectedElement.linkUrl ? 'text-accent' : 'text-muted-foreground hover:text-foreground'}`}>
                            <Link2 className="w-3.5 h-3.5" />
                          </button>
                        </PopoverTrigger>
                      </TooltipTrigger><TooltipContent>Add Link</TooltipContent></Tooltip>
                      <PopoverContent className="w-64 p-3" align="center">
                        <p className="text-xs font-semibold text-foreground mb-2">Link URL</p>
                        <input type="url" placeholder="https://example.com"
                          value={selectedElement.linkUrl || ''}
                          onChange={e => updateElement(selectedElement.id, { linkUrl: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg border border-foreground/[0.1] bg-foreground/[0.02] text-xs focus:outline-none focus:border-accent/40" />
                        {selectedElement.linkUrl && (
                          <button onClick={() => updateElement(selectedElement.id, { linkUrl: '' })}
                            className="mt-2 text-xs text-accent hover:underline">Remove Link</button>
                        )}
                      </PopoverContent>
                    </Popover>
                    {/* Layers (z-index) */}
                    <Popover>
                      <Tooltip><TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <button className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground flex items-center gap-0.5">
                            <Layers className="w-3.5 h-3.5" />
                            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        </PopoverTrigger>
                      </TooltipTrigger><TooltipContent>Layers</TooltipContent></Tooltip>
                      <PopoverContent className="w-44 p-2" align="center">
                        {[
                          { label: 'Bring to Front', zIndex: 999 },
                          { label: 'Bring Forward', zIndex: Math.min(999, (selectedElement.zIndex ?? 1) + 1) },
                          { label: 'Send Backward', zIndex: Math.max(0, (selectedElement.zIndex ?? 1) - 1) },
                          { label: 'Send to Back', zIndex: 0 },
                        ].map(l => (
                          <button key={l.label} onClick={() => updateElement(selectedElement.id, { zIndex: l.zIndex })}
                            className="w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-foreground/[0.04] transition-colors">{l.label}</button>
                        ))}
                      </PopoverContent>
                    </Popover>
                    {/* Position */}
                    <Popover>
                      <Tooltip><TooltipTrigger asChild>
                        <PopoverTrigger asChild>
                          <button className="p-1.5 rounded text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground flex items-center gap-0.5">
                            <Move className="w-3.5 h-3.5" />
                            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        </PopoverTrigger>
                      </TooltipTrigger><TooltipContent>Position</TooltipContent></Tooltip>
                      <PopoverContent className="w-48 p-2" align="center">
                        {[
                          { label: 'Full Page', x: 0, y: 0, w: 100, h: 100 },
                          { label: 'Middle Band', x: 0, y: 25, w: 100, h: 50 },
                          { label: 'Top Half', x: 0, y: 0, w: 100, h: 50 },
                          { label: 'Bottom Half', x: 0, y: 50, w: 100, h: 50 },
                          { label: 'Center', x: 25, y: 25, w: 50, h: 50 },
                        ].map(p => (
                          <button key={p.label} onClick={() => updateElement(selectedElement.id, { x: p.x, y: p.y, width: p.w, height: p.h })}
                            className="w-full text-left px-3 py-1.5 text-xs rounded-lg hover:bg-foreground/[0.04] transition-colors">{p.label}</button>
                        ))}
                      </PopoverContent>
                    </Popover>
                    <Tooltip><TooltipTrigger asChild>
                      <button onClick={() => updateElement(selectedElement.id, { locked: !selectedElement.locked })}
                        className={`p-1.5 rounded ${selectedElement.locked ? 'text-destructive hover:bg-destructive/10' : 'text-muted-foreground hover:bg-foreground/[0.05]'}`}>
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
              </div>
              </div>
              )}
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
              <div ref={scrollContainerRef} className="flex-1 overflow-auto no-scrollbar py-8 px-4 relative" onClick={(e) => { if (e.target === e.currentTarget) { setSelectedElementId(null); setEditingTextId(null); if (aiExpandedPageId) { setAiExpandedPageId(null); onAiPanelToggle?.(false); } } }}>
                <div className="flex flex-col items-center gap-8" style={{ marginLeft: panelOffset }} onClick={(e) => { if (e.target === e.currentTarget) { setSelectedElementId(null); setEditingTextId(null); if (aiExpandedPageId) { setAiExpandedPageId(null); onAiPanelToggle?.(false); } } }}>
                  {currentPages.map((page, pageIndex) => {
                    const elems = resolvePageElements(pageElements, page, currentPages, bookTitle);
                    const isSelected = page.id === selectedPageId;
                    const pageTypeLabel = page.type === 'cover' ? 'Cover' : page.type === 'toc' ? 'Table of Contents' : page.type === 'back' ? 'Back Cover' : page.type === 'chapter' ? 'Chapter Cover' : page.type === 'chapter-page' ? 'Content Page' : 'Page';
                    return (
                      <div key={page.id} data-page-id={page.id} ref={el => { pageRefs.current[page.id] = el; }} className={`relative flex flex-col items-center transition-all duration-300 ${aiExpandedPageId === page.id ? '-translate-x-[200px]' : ''}`}>
                        {/* Page label above page — hidden when an element is selected on this page */}
                        <div className={`mb-2 flex items-center justify-center gap-2 transition-opacity duration-200 ${isSelected && selectedElementId ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                          <span className={`text-[11px] font-medium ${isSelected ? 'text-foreground/70' : 'text-muted-foreground/60'}`}>
                            {pageTypeLabel} – {page.type === 'cover' || page.type === 'back' ? (bookTitle || 'Untitled Book') : (page.title || `Page ${pageIndex + 1}`)}
                          </span>
                          {page.hidden && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black text-white text-[10px] font-semibold shadow-sm">
                              <EyeOff className="w-3 h-3" /> Hidden Page
                            </span>
                          )}
                        </div>
                        <div className="relative flex items-start gap-2 justify-center">
                        {/* Page number */}
                        <div className="w-8 shrink-0 pt-2">
                          {page.type !== 'cover' && page.type !== 'toc' && page.type !== 'back' ? (
                            <p className={`text-[10px] font-medium text-center ${isSelected ? 'text-accent' : 'text-muted-foreground'}`}>
                              {currentPages.filter(p => p.type !== 'cover' && p.type !== 'toc' && p.type !== 'back').indexOf(page) + 1}
                            </p>
                          ) : (
                            <p className="text-[10px] font-medium text-center text-muted-foreground/40">–</p>
                          )}
                        </div>
                        {/* Page canvas */}
                        <div
                          ref={isSelected ? canvasRef : undefined}
                          data-canvas={isSelected ? 'bg' : undefined}
                          onClick={(e) => {
                            onPageSelect(page.id);
                            if (page.locked) { setSelectedElementId(null); return; }
                            if (isSelected && canEdit) handleCanvasClick(e);
                            if (accessMode === 'commenting' && isSelected) {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const x = ((e.clientX - rect.left) / rect.width) * 100;
                              const y = ((e.clientY - rect.top) / rect.height) * 100;
                              setCommentDraft({ pageId: page.id, x, y });
                              setActiveCommentId(null);
                            }
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.dataTransfer.dropEffect = 'copy';
                            const rect = e.currentTarget.getBoundingClientRect();
                            const yPct = ((e.clientY - rect.top) / rect.height) * 100;
                            // Snap to element boundaries (top/bottom edges of each element, plus page top/bottom)
                            const snapPoints = [0];
                            elems.forEach(el => {
                              snapPoints.push(el.y);
                              snapPoints.push(el.y + el.height);
                            });
                            snapPoints.push(100);
                            // Dedupe and sort
                            const unique = [...new Set(snapPoints)].sort((a, b) => a - b);
                            // Find nearest snap point
                            let nearest = unique[0];
                            let minDist = Math.abs(yPct - nearest);
                            for (const sp of unique) {
                              const d = Math.abs(yPct - sp);
                              if (d < minDist) { minDist = d; nearest = sp; }
                            }
                            setExternalDropTarget({ pageId: page.id, y: nearest });
                          }}
                          onDragLeave={(e) => {
                            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                              setExternalDropTarget(null);
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const raw = e.dataTransfer.getData('application/x-ebook-element');
                            if (!raw) { setExternalDropTarget(null); return; }
                            try {
                              const payload = JSON.parse(raw);
                              const rect = e.currentTarget.getBoundingClientRect();
                              const xPct = ((e.clientX - rect.left) / rect.width) * 100;
                              const yPct = ((e.clientY - rect.top) / rect.height) * 100;
                              onPageSelect(page.id);
                              // Build element at drop position
                              const dropX = Math.max(0, Math.min(80, xPct - 15));
                              const dropY = Math.max(0, Math.min(85, yPct - 5));
                              setTimeout(() => {
                                addElement(payload.type || 'text', { ...payload.data, x: dropX, y: dropY });
                                toast.success(`${payload.label || 'Element'} added`);
                              }, 0);
                            } catch { /* invalid data */ }
                            setExternalDropTarget(null);
                          }}
                          data-page-canvas
                          className={`rounded-lg shadow-lg relative cursor-pointer transition-shadow ${isSelected ? 'overflow-visible' : 'overflow-hidden'} ${
                            isSelected ? 'ring-2 ring-accent shadow-2xl' : 'border border-foreground/[0.06] hover:shadow-xl'
                          } ${externalDropTarget?.pageId === page.id ? 'ring-2 ring-accent/60' : ''}`}
                          style={{
                            width: `${pw * zoom / 100}px`, height: `${ph * zoom / 100}px`,
                            backgroundColor: page.bgColor || '#ffffff',
                            backgroundImage: page.bgImage ? `url(${page.bgImage})` : undefined,
                            backgroundSize: page.bgImage ? 'cover' : undefined,
                            border: page.pageBorderType && page.pageBorderType !== 'none'
                              ? `${page.pageBorderWidth || 1}px ${page.pageBorderType} ${page.pageBorderColor || '#e5e7eb'}`
                              : isSelected ? '2px solid hsl(var(--accent))' : '1px solid hsl(var(--foreground) / 0.06)',
                          }}
                        >
                          {/* Clip layer for page content */}
                          <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none" style={{ zIndex: 0 }}>
                            {isSelected && (
                              <div className="absolute inset-0">
                                <div className="absolute top-1/2 left-0 right-0 h-px bg-accent/10" />
                                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-accent/10" />
                              </div>
                            )}
                          </div>
                          {/* External drag-drop indicator line */}
                          {externalDropTarget?.pageId === page.id && (
                            <div
                              className="absolute left-[5%] right-[5%] pointer-events-none z-[90] transition-all duration-75"
                              style={{ top: `${externalDropTarget.y}%` }}
                            >
                              <div className="h-[2px] bg-accent/70 rounded-full" />
                            </div>
                          )}
                          {elems.map(el => renderElement(el, page.id, isPageDarkBg(page.id)))}
                          {(() => {
                            const selectedImage = elems.find(el => el.id === selectedElementId && el.type === 'image');
                            return selectedImage ? renderSelectedImageActions(selectedImage, page.id) : null;
                          })()}

                          {/* Empty-state guidance for blank/sparse pages */}
                          {isSelected && canEdit && elems.length === 0 && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-[5] pointer-events-none">
                              <div className="pointer-events-auto flex flex-col items-center gap-4 max-w-[70%]">
                                <p className="text-sm font-medium text-muted-foreground/60">This page is empty</p>
                                <div className="grid grid-cols-2 gap-2 w-full max-w-[240px]">
                                  {[
                                    { label: 'Add Headline', icon: '✏️', action: () => addElement('text', { content: 'Heading', fontSize: 28, fontWeight: 'bold', width: 60, height: 8, x: 20, y: 10 }) },
                                    { label: 'Insert Image', icon: '🖼️', action: () => addElement('image', { isPlaceholder: true, width: 80, height: 50, x: 10, y: 25 }) },
                                    { label: 'Add Body Text', icon: '📝', action: () => addElement('text', { content: 'Start writing here...', fontSize: 12, width: 80, height: 15, x: 10, y: 45 }) },
                                    { label: 'Generate with AI', icon: '✨', action: () => setShowAIEditModal(true) },
                                  ].map(item => (
                                    <button key={item.label} onClick={item.action}
                                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-foreground/[0.12] hover:border-accent/40 hover:bg-accent/[0.03] transition-all text-left group">
                                      <span className="text-sm">{item.icon}</span>
                                      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Locked page overlay */}
                          {page.locked && (
                            <div className="absolute inset-0 z-[80] flex items-center justify-center bg-foreground/[0.03] pointer-events-auto cursor-not-allowed rounded-lg">
                              <div className="flex items-center gap-1.5 bg-accent/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-accent">
                                <Lock className="w-3.5 h-3.5 text-white" />
                                <span className="text-xs font-medium text-white">Page Locked</span>
                              </div>
                            </div>
                          )}

                          {/* Hidden page overlay */}
                          {page.hidden && !page.locked && (
                            <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/10 pointer-events-none rounded-lg">
                              <div className="flex items-center gap-1 bg-black backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-sm">
                                <EyeOff className="w-3 h-3 text-white" />
                                <span className="text-[10px] font-semibold text-white">Hidden Page</span>
                              </div>
                            </div>
                          )}

                          {canComment && pageComments.filter(c => c.pageId === page.id).map((c, ci) => (
                            <div key={c.id}
                              className="absolute z-[60] pointer-events-auto cursor-pointer group"
                              style={{ left: `${c.x}%`, top: `${c.y}%`, transform: 'translate(-50%, -100%)' }}
                              onClick={e => { e.stopPropagation(); setActiveCommentId(activeCommentId === c.id ? null : c.id); }}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shadow-md transition-transform ${
                                c.resolved ? 'bg-muted text-muted-foreground' : 'bg-accent text-white'
                              } ${activeCommentId === c.id ? 'scale-125' : 'group-hover:scale-110'}`}>
                                {ci + 1}
                              </div>
                              {activeCommentId === c.id && (
                                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 w-56 bg-background border border-foreground/[0.1] rounded-xl shadow-xl p-3 z-[70]"
                                  onClick={e => e.stopPropagation()}>
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center text-[8px] font-bold text-accent">{c.author.charAt(0)}</div>
                                    <span className="text-xs font-semibold text-foreground">{c.author}</span>
                                    <span className="text-[10px] text-muted-foreground ml-auto">{c.timestamp}</span>
                                  </div>
                                  <p className="text-xs text-foreground/80 mb-2">{renderCommentText(c.text)}</p>
                                  <div className="flex gap-1.5">
                                    <button onClick={() => setPageComments(prev => prev.map(pc => pc.id === c.id ? { ...pc, resolved: !pc.resolved } : pc))}
                                      className="text-[10px] text-accent hover:underline">{c.resolved ? 'Reopen' : 'Resolve'}</button>
                                    <button onClick={() => { setPageComments(prev => prev.filter(pc => pc.id !== c.id)); setActiveCommentId(null); }}
                                      className="text-[10px] text-destructive hover:underline ml-auto">Delete</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Comment draft input */}
                          {commentDraft && commentDraft.pageId === page.id && (
                            <div className="absolute z-[70] pointer-events-auto"
                              style={{ left: `${commentDraft.x}%`, top: `${commentDraft.y}%`, transform: 'translate(-50%, -100%)' }}
                              onClick={e => e.stopPropagation()}>
                              <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-[9px] font-bold shadow-md animate-pulse mb-1 mx-auto">+</div>
                              <div className="w-56 bg-background border border-foreground/[0.1] rounded-xl shadow-xl p-3 relative">
                                <textarea
                                  ref={commentTextareaRef}
                                  value={commentText}
                                  onChange={e => handleCommentTextChange(e.target.value)}
                                  onKeyDown={handleCommentKeyDown}
                                  placeholder="Add your comment... (use @ to mention)"
                                  className="w-full text-xs bg-transparent border border-foreground/[0.08] rounded-lg p-2 outline-none focus:border-accent/40 resize-none h-16"
                                  autoFocus
                                />
                                {showMentionDropdown && filteredMembers.length > 0 && (
                                  <div className="absolute left-3 right-3 bottom-[calc(100%-4px)] bg-background border border-foreground/[0.1] rounded-lg shadow-lg z-10 max-h-32 overflow-y-auto">
                                    {filteredMembers.map((m, mi) => (
                                      <button key={m.id} onClick={() => insertMention(m.name)}
                                        className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left text-xs transition-colors ${mi === mentionIndex ? 'bg-accent/10 text-accent' : 'hover:bg-foreground/[0.04] text-foreground'}`}>
                                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ backgroundColor: m.color }}>{m.initials}</div>
                                        <span className="font-medium">{m.name}</span>
                                        <span className="text-muted-foreground ml-auto">{m.role}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                                <div className="flex gap-1.5 mt-2">
                                  <button onClick={addPageComment}
                                    className="flex-1 py-1.5 rounded-lg bg-accent text-white text-[10px] font-semibold hover:bg-accent/90 disabled:opacity-40"
                                    disabled={!commentText.trim()}>Post</button>
                                  <button onClick={() => { setCommentDraft(null); setCommentText(''); setShowMentionDropdown(false); }}
                                    className="px-3 py-1.5 rounded-lg border border-foreground/[0.08] text-[10px] font-medium hover:bg-foreground/[0.04]">Cancel</button>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="absolute bottom-2 left-0 right-0 text-center pointer-events-none" style={{ zIndex: 0 }}>
                            <span className="text-[10px] text-muted-foreground">
                              {page.type !== 'cover' && page.type !== 'back'
                                ? currentPages.filter(p => p.type !== 'cover' && p.type !== 'back').indexOf(page) + 1
                                : ''}
                            </span>
                          </div>
                        </div>
                        {/* Page action buttons - shown for selected page in edit modes */}
                        {canEdit && <div className={`absolute -right-12 top-1/2 -translate-y-1/2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-3 pointer-events-none'
                        }`}>
                          <div className="flex flex-col gap-1 bg-background/80 backdrop-blur-sm rounded-xl p-1 border border-foreground/[0.06] shadow-sm">
                            {PAGE_ACTIONS.map(action => {
                              const currentSelectedPage = currentPages.find(p => p.id === selectedPageId);
                              const isLocked = action.id === 'lock' && currentSelectedPage?.locked;
                              const isHidden = action.id === 'hide' && currentSelectedPage?.hidden;
                              const Icon = isLocked ? Lock : isHidden ? Eye : action.icon;
                              const label = isLocked ? 'Unlock Page' : isHidden ? 'Show Page' : action.label;
                              if (action.id === 'ai') {
                                const isAiOpen = aiExpandedPageId === page.id;
                                return (
                                  <div key={action.id} className="relative">
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button onClick={() => {
                                          const newId = isAiOpen ? null : page.id;
                                          setAiExpandedPageId(newId);
                                          onAiPanelToggle?.(!!newId);
                                        }}
                                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors relative ${isAiOpen ? 'bg-accent/20 text-accent' : 'bg-accent/10 hover:bg-accent/20 text-accent'}`}>
                                          <Sparkles className="w-4 h-4" />
                                          {!isAiOpen && floatingAiCtx.state === 'improvement' && page.id === selectedPageId && (
                                            <span className="absolute inset-0 rounded-lg animate-ai-glow pointer-events-none" />
                                          )}
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent side="right">AI Assistant</TooltipContent>
                                    </Tooltip>
                                    {/* Expanded AI panel — unified brain */}
                                    <div className={`absolute left-full top-0 ml-2 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isAiOpen ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-4 pointer-events-none'}`}>
                                      <div className="flex flex-col bg-background/95 backdrop-blur-md rounded-2xl border border-foreground/[0.08] shadow-lg whitespace-nowrap overflow-hidden"
                                        style={{ width: '320px', maxHeight: `${ph * zoom / 100}px` }}>
                                        {aiUpdatedFeedback ? (
                                          <div className="flex items-center justify-center gap-2 py-4 animate-in fade-in-0 duration-300">
                                            <Sparkles className="w-4 h-4 text-emerald-500" />
                                            <span className="text-xs font-semibold text-emerald-600">Updated ✨</span>
                                          </div>
                                        ) : (
                                          <>
                                            {/* Header with confidence score */}
                                            <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-foreground/[0.06]">
                                              <Sparkles className="w-3.5 h-3.5 text-accent" />
                                              <span className="text-[11px] font-bold text-foreground">AI Assistant</span>
                                              <div className="ml-auto flex items-center gap-1.5">
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                                  floatingAiCtx.state === 'ready' ? 'bg-emerald-500/10 text-emerald-600' :
                                                  floatingAiCtx.state === 'strong' ? 'bg-amber-500/10 text-amber-600' :
                                                  'bg-blue-500/10 text-blue-600'
                                                }`}>{floatingAiCtx.score}</span>
                                              </div>
                                            </div>

                                            {/* Scrollable middle area */}
                                            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">

                                            {/* State-aware header */}
                                            <div className="px-3 pt-2.5 pb-1">
                                              {floatingAiCtx.state === 'ready' ? (
                                                <div className="flex items-center gap-1.5">
                                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                  <p className="text-[11px] font-semibold text-emerald-600">Ready to Publish</p>
                                                </div>
                                              ) : (
                                                <p className="text-[11px] font-medium text-foreground/70">{floatingAiCtx.stateDescription}</p>
                                              )}
                                            </div>

                                            {/* Enhancement cards */}
                                            {floatingAiCtx.enhancements.length > 0 && (
                                              <div className="px-3 py-1.5 space-y-1.5 border-b border-foreground/[0.06]">
                                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                                                  {floatingAiCtx.state === 'ready' ? 'Optional Enhancements' : 'Smart Enhancements'}
                                                </p>
                                                {floatingAiCtx.enhancements.map((nudge) => (
                                                  <button key={nudge.id} onClick={() => {
                                                    if (nudge.ctaAction === 'add-image') {
                                                      onOpenImageSection?.();
                                                    } else {
                                                      handleContextualAI(nudge.ctaAction === 'rewrite' ? 'rewrite' : 'shorten');
                                                    }
                                                  }}
                                                    className={`w-full flex items-start gap-2 px-2.5 py-2 rounded-xl transition-colors text-left ${
                                                      nudge.isPrimary ? 'bg-accent/[0.04] border border-accent/15 hover:bg-accent/[0.07]' : 'hover:bg-foreground/[0.03]'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${nudge.dotColor}`} />
                                                    <div className="flex-1 min-w-0">
                                                      <span className="text-[10px] font-semibold text-foreground line-clamp-1">{nudge.cta}</span>
                                                      <span className="text-[10px] text-muted-foreground line-clamp-1 block">{nudge.subtitle}</span>
                                                    </div>
                                                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 mt-0.5 ${nudge.color} ${nudge.bgColor}`}>Go</span>
                                                  </button>
                                                ))}
                                              </div>
                                            )}

                                            {/* Quick Actions grid */}
                                            <div className="px-3 py-2.5 border-b border-foreground/[0.06]">
                                              <div className="grid grid-cols-4 gap-1">
                                                {[
                                                  { id: 'rewrite', label: 'Persuade', icon: Target },
                                                  { id: 'improve', label: 'Clarity', icon: Eye },
                                                  { id: 'shorten', label: 'Simplify', icon: MinusCircle },
                                                  { id: 'expand', label: 'Detail', icon: FileText },
                                                ].map(btn => (
                                                  <button key={btn.id} onClick={() => handleContextualAI(btn.id)} disabled={isAIProcessing}
                                                    className="flex flex-col items-center gap-1 py-2 rounded-lg hover:bg-accent/[0.06] transition-colors disabled:opacity-40">
                                                    <btn.icon className="w-3.5 h-3.5 text-accent" />
                                                    <span className="text-[9px] font-medium text-muted-foreground">{btn.label}</span>
                                                  </button>
                                                ))}
                                              </div>
                                            </div>
                                            </div>

                                            {/* Prompt input — pinned to bottom */}
                                            <div className="px-3 py-2.5 shrink-0 border-t border-foreground/[0.06]">
                                              <div className="flex items-start gap-1.5 border border-foreground/[0.06] rounded-xl px-2.5 py-1.5 bg-foreground/[0.02]">
                                                <Sparkles className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                                                <textarea
                                                  value={contextualAIPrompt}
                                                  onChange={e => {
                                                    setContextualAIPrompt(e.target.value);
                                                    e.target.style.height = 'auto';
                                                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                                  }}
                                                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && contextualAIPrompt.trim()) { e.preventDefault(); handleContextualAI('custom'); } }}
                                                  placeholder="Ask AI anything about this page..."
                                                  className="bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 outline-none w-full resize-none overflow-auto"
                                                  style={{ minHeight: '24px', maxHeight: '120px' }}
                                                  rows={1}
                                                />
                                              </div>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              if (action.id === 'add') {
                                return (
                                  <Popover key={action.id}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <PopoverTrigger asChild>
                                          <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-foreground/[0.06] transition-colors text-muted-foreground hover:text-foreground">
                                            <action.icon className="w-4 h-4" />
                                          </button>
                                        </PopoverTrigger>
                                      </TooltipTrigger>
                                      <TooltipContent side="right">{action.label}</TooltipContent>
                                    </Tooltip>
                                    <PopoverContent className="w-56 p-2" side="right" align="start">
                                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">Page Type</p>
                                      {PAGE_TYPE_OPTIONS.map(opt => (
                                        <button key={opt.type} onClick={() => handleAddPage(opt.type)}
                                          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left hover:bg-foreground/[0.04] transition-colors">
                                          <span className="text-base">{opt.icon}</span>
                                          <div>
                                            <p className="text-xs font-medium text-foreground">{opt.label}</p>
                                            <p className="text-[10px] text-muted-foreground">{opt.description}</p>
                                          </div>
                                        </button>
                                      ))}
                                    </PopoverContent>
                                  </Popover>
                                );
                              }
                              return (
                                <Tooltip key={action.id}>
                                  <TooltipTrigger asChild>
                                    <button onClick={() => handlePageAction(action.id)}
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-foreground/[0.06] transition-colors ${isLocked ? 'text-destructive hover:text-destructive' : 'text-muted-foreground hover:text-foreground'}`}>
                                      <Icon className="w-4 h-4" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="right">{label}</TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </div>
                        </div>}
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

        {/* Image Preview Modal */}
        <Dialog open={!!previewImageSrc} onOpenChange={() => setPreviewImageSrc(null)}>
          <DialogContent className="sm:max-w-2xl p-2">
            <DialogHeader>
              <DialogTitle>Image Preview</DialogTitle>
            </DialogHeader>
            {previewImageSrc && (
              <img src={previewImageSrc} alt="Preview" className="w-full h-auto rounded-lg object-contain max-h-[70vh]" />
            )}
          </DialogContent>
        </Dialog>

      </div>

      {/* Element selection context menu */}
      {contextMenu && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setContextMenu(null)} onContextMenu={e => { e.preventDefault(); setContextMenu(null); }} />
          <div className="fixed z-[9999] bg-background border border-foreground/10 rounded-lg shadow-xl py-1 min-w-[180px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}>
            <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Select Element</p>
            {contextMenu.elements.map((el, i) => {
              const label = el.type === 'text' ? `Text: "${(el.content || '').slice(0, 20)}${(el.content || '').length > 20 ? '…' : ''}"` :
                el.type === 'image' ? `Image${el.src ? '' : ' (placeholder)'}` :
                el.shapeType === 'circle' ? 'Circle' : 'Shape';
              const isActive = el.id === selectedElementId;
              return (
                <button key={el.id}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${isActive ? 'bg-accent/10 text-accent font-medium' : 'hover:bg-foreground/[0.04]'}`}
                  onClick={() => { setSelectedElementId(el.id); setContextMenu(null); }}>
                  <span className={`w-2 h-2 rounded-full ${el.type === 'text' ? 'bg-blue-500' : el.type === 'image' ? 'bg-emerald-500' : 'bg-destructive'}`} />
                  <span>{label}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground">z:{el.zIndex ?? 1}</span>
                </button>
              );
            })}
            <div className="border-t border-foreground/[0.06] mt-1 pt-1 px-3 py-1">
              <p className="text-[10px] text-muted-foreground">Tip: Alt+Click to cycle layers</p>
            </div>
          </div>
        </>
      )}
    </TooltipProvider>
  );
});

EbookCanvasEditor.displayName = 'EbookCanvasEditor';

export default EbookCanvasEditor;

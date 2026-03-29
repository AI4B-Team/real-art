import { useState } from 'react';
import {
  Plus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Lock, GripVertical, LayoutGrid,
  Copy, SlidersHorizontal, Trash2, ChevronUp, ChevronDown,
} from 'lucide-react';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import type { Page } from './EbookCanvasEditor';
import { getElementsForPage } from './EbookCanvasEditor';
import PageThumbnail from './PageThumbnail';

interface EbookPagesPanelProps {
  pages: Page[];
  selectedPageId: string | null;
  onPageSelect: (id: string) => void;
  onPagesChange: (pages: Page[]) => void;
  onGridViewToggle?: () => void;
  bookTitle?: string;
}

const EbookPagesPanel = ({ pages, selectedPageId, onPageSelect, onPagesChange, onGridViewToggle, bookTitle = '' }: EbookPagesPanelProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const selectedIndex = pages.findIndex(p => p.id === selectedPageId);

  const handleAddPage = () => {
    const newPage: Page = { id: crypto.randomUUID(), title: `Page ${pages.length + 1}`, type: 'chapter' };
    onPagesChange([...pages, newPage]);
    onPageSelect(newPage.id);
    toast.success('Page added');
  };

  const handleDragStart = (i: number) => setDraggedIndex(i);
  const handleDragOver = (e: React.DragEvent, i: number) => { e.preventDefault(); setDragOverIndex(i); };
  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const arr = [...pages];
      const [moved] = arr.splice(draggedIndex, 1);
      arr.splice(dragOverIndex, 0, moved);
      onPagesChange(arr);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const goTo = (dir: 'first' | 'prev' | 'next' | 'last') => {
    let idx = selectedIndex;
    if (dir === 'first') idx = 0;
    else if (dir === 'prev') idx = Math.max(0, idx - 1);
    else if (dir === 'next') idx = Math.min(pages.length - 1, idx + 1);
    else idx = pages.length - 1;
    onPageSelect(pages[idx].id);
  };

  // Page action buttons on hover
  const handlePageAction = (action: string, pageId: string) => {
    const idx = pages.findIndex(p => p.id === pageId);
    if (idx === -1) return;
    switch (action) {
      case 'duplicate': {
        const dup = { ...pages[idx], id: crypto.randomUUID(), title: pages[idx].title + ' (copy)' };
        const arr = [...pages];
        arr.splice(idx + 1, 0, dup);
        onPagesChange(arr);
        toast.success('Page duplicated');
        break;
      }
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

  if (isCollapsed) {
    return (
      <div className="w-8 border-l border-foreground/[0.04] bg-background flex flex-col items-center py-3">
        <button onClick={() => setIsCollapsed(false)} className="p-1 rounded hover:bg-foreground/[0.05] text-muted-foreground">
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="w-56 border-l border-foreground/[0.04] bg-background flex flex-col shrink-0">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-foreground/[0.04]">
          <span className="text-sm font-bold text-foreground">Pages</span>
          <div className="flex items-center gap-1">
            <button onClick={handleAddPage} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05]">
              <Plus className="w-4 h-4" />
            </button>
            <button onClick={() => setIsCollapsed(true)} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05]">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Page thumbnails */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
          {pages.map((page, i) => (
            <div key={page.id} className="group relative">
              {/* Page number */}
              <div className="flex items-start gap-2">
                <span className={`text-xs font-medium mt-1 w-5 text-right shrink-0 ${selectedPageId === page.id ? 'text-accent' : 'text-muted-foreground'}`}>
                  {i + 1}
                </span>
                <div
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={e => handleDragOver(e, i)}
                  onDragEnd={handleDragEnd}
                  onClick={() => onPageSelect(page.id)}
                  className={`flex-1 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedPageId === page.id ? 'border-accent shadow-sm' : 'border-transparent hover:border-foreground/[0.1]'
                  } ${dragOverIndex === i ? 'border-accent/50' : ''}`}
                >
                  {/* Thumbnail preview */}
                  <div className="aspect-[3/4] bg-foreground/[0.03] relative">
                    <PageThumbnail elements={getElementsForPage(page, pages, bookTitle)} />
                    {page.locked && <Lock className="w-3 h-3 text-muted-foreground absolute top-1 right-1" />}
                  </div>
                  {/* Title */}
                  <p className="text-[10px] font-medium text-foreground truncate px-1.5 py-1 bg-background">{page.title}</p>
                </div>

                {/* Hover action buttons */}
                <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => handlePageAction('duplicate', page.id)} className="p-1 rounded hover:bg-foreground/[0.05] text-muted-foreground">
                        <Copy className="w-3 h-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left">Duplicate</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => handlePageAction('moveUp', page.id)} className="p-1 rounded hover:bg-foreground/[0.05] text-muted-foreground">
                        <ChevronUp className="w-3 h-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left">Move Up</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => handlePageAction('moveDown', page.id)} className="p-1 rounded hover:bg-foreground/[0.05] text-muted-foreground">
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left">Move Down</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => handlePageAction('delete', page.id)} className="p-1 rounded hover:bg-foreground/[0.05] text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left">Delete</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          ))}
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
            <span className="font-medium text-foreground">{selectedIndex + 1}</span> /{pages.length}
          </span>
          <button onClick={() => goTo('next')} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05]">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => goTo('last')} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05]">
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
          <Tooltip>
            <TooltipTrigger asChild>
              <button onClick={onGridViewToggle} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-foreground/[0.05] ml-1">
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Grid View</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default EbookPagesPanel;

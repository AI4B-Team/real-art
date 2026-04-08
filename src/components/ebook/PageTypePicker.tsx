import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { ReactNode } from "react";

export type PageTypeOption = "chapter" | "chapter-page" | "blank";

export const PAGE_TYPE_OPTIONS: { type: PageTypeOption; label: string; description: string; icon: string }[] = [
  { type: "chapter", label: "Chapter Cover", description: "Full image with chapter number & title", icon: "📖" },
  { type: "chapter-page", label: "Chapter Content", description: "Top image with text content below", icon: "📄" },
  { type: "blank", label: "Blank Page", description: "Empty page to design from scratch", icon: "📃" },
];

interface PageTypePickerProps {
  children: ReactNode;
  onSelect: (type: PageTypeOption) => void;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}

const PageTypePicker = ({ children, onSelect, side = "right", align = "start" }: PageTypePickerProps) => (
  <Popover>
    <PopoverTrigger asChild>{children}</PopoverTrigger>
    <PopoverContent className="w-56 p-2" side={side} align={align}>
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">Page Type</p>
      {PAGE_TYPE_OPTIONS.map(opt => (
        <button
          key={opt.type}
          onClick={(e) => { e.stopPropagation(); onSelect(opt.type); }}
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left hover:bg-foreground/[0.04] transition-colors"
        >
          <span className="text-base">{opt.icon}</span>
          <div>
            <p className="text-sm font-medium">{opt.label}</p>
            <p className="text-[10px] text-muted-foreground">{opt.description}</p>
          </div>
        </button>
      ))}
    </PopoverContent>
  </Popover>
);

export default PageTypePicker;

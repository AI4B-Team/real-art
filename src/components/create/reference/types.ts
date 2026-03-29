export interface ReferenceImage {
  id: string;
  src: string;
  name: string;
}

export interface ReferencePanelProps {
  onClose: () => void;
  references: ReferenceImage[];
  onAdd: (ref: ReferenceImage) => void;
  onRemove: (id: string) => void;
}

export type SourceTab = "upload" | "import" | "creations" | "stock" | "community" | "trending";
export type MediaFilter = "all" | "image" | "video";

export interface BrowseItem {
  id: string;
  src: string;
  title: string;
  type: MediaFilter;
  creator?: string;
}

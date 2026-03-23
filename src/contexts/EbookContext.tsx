import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface Ebook {
  id: number;
  title: string;
  description: string;
  chapters: number;
  words: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  coverColor: string;
  coverImage?: string;
  tags: string[];
  progress: number;
}

interface EbookContextType {
  ebooks: Ebook[];
  setEbooks: React.Dispatch<React.SetStateAction<Ebook[]>>;
  updateEbook: (id: number, updates: Partial<Ebook>) => void;
  addEbook: (ebook: Ebook) => void;
  deleteEbook: (id: number) => void;
  getEbook: (id: number) => Ebook | undefined;
}

const EbookContext = createContext<EbookContextType | undefined>(undefined);

const INITIAL_EBOOKS: Ebook[] = [
  { id: 1, title: "The Ultimate Guide to AI Marketing", description: "A comprehensive guide to leveraging AI in your marketing strategy", chapters: 12, words: 45000, status: "published", createdAt: "2025-12-15", updatedAt: "2025-12-17", coverColor: "#10B981", coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=300&fit=crop", tags: ["Marketing", "AI", "Business"], progress: 100 },
  { id: 2, title: "Passive Income Mastery", description: "Build multiple streams of passive income with proven strategies", chapters: 8, words: 32000, status: "draft", createdAt: "2025-12-10", updatedAt: "2025-12-18", coverColor: "#6366F1", coverImage: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=200&h=300&fit=crop", tags: ["Finance", "Business"], progress: 75 },
  { id: 3, title: "Digital Product Blueprint", description: "Create and sell digital products that generate revenue 24/7", chapters: 10, words: 28000, status: "generating", createdAt: "2025-12-18", updatedAt: "2025-12-19", coverColor: "#F59E0B", coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=300&fit=crop", tags: ["Ecommerce", "Digital Products"], progress: 45 },
  { id: 4, title: "Social Media Automation Secrets", description: "Automate your social media presence and grow your audience", chapters: 6, words: 18000, status: "draft", createdAt: "2025-12-05", updatedAt: "2025-12-16", coverColor: "#EC4899", coverImage: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=300&fit=crop", tags: ["Social Media", "Automation"], progress: 60 },
  { id: 5, title: "Content Creation Playbook", description: "Master content creation across all platforms", chapters: 15, words: 52000, status: "published", createdAt: "2025-11-20", updatedAt: "2025-12-01", coverColor: "#8B5CF6", coverImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=200&h=300&fit=crop", tags: ["Content", "Marketing"], progress: 100 },
];

export const EbookProvider = ({ children }: { children: ReactNode }) => {
  const [ebooks, setEbooks] = useState<Ebook[]>(INITIAL_EBOOKS);

  const updateEbook = useCallback((id: number, updates: Partial<Ebook>) => {
    setEbooks(prev => prev.map(book =>
      book.id === id ? { ...book, ...updates, updatedAt: new Date().toISOString().split("T")[0] } : book
    ));
  }, []);

  const addEbook = useCallback((ebook: Ebook) => {
    setEbooks(prev => [ebook, ...prev]);
  }, []);

  const deleteEbook = useCallback((id: number) => {
    setEbooks(prev => prev.filter(book => book.id !== id));
  }, []);

  const getEbook = useCallback((id: number) => {
    return ebooks.find(book => book.id === id);
  }, [ebooks]);

  return (
    <EbookContext.Provider value={{ ebooks, setEbooks, updateEbook, addEbook, deleteEbook, getEbook }}>
      {children}
    </EbookContext.Provider>
  );
};

export const useEbooks = () => {
  const context = useContext(EbookContext);
  if (context === undefined) {
    throw new Error("useEbooks must be used within an EbookProvider");
  }
  return context;
};
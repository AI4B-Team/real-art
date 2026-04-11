import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Ebook {
  id: string;
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
  prompt?: string;
  tone?: string;
  language?: string;
  model?: string;
  outline?: any;
  userId?: string;
}

interface EbookContextType {
  ebooks: Ebook[];
  loading: boolean;
  setEbooks: React.Dispatch<React.SetStateAction<Ebook[]>>;
  updateEbook: (id: string, updates: Partial<Ebook>) => void;
  addEbook: (ebook: Omit<Ebook, "id">) => Promise<Ebook | null>;
  deleteEbook: (id: string) => void;
  getEbook: (id: string) => Ebook | undefined;
  refreshEbooks: () => Promise<void>;
}

const EbookContext = createContext<EbookContextType | undefined>(undefined);

const DEMO_EBOOKS: Ebook[] = [
  { id: "demo-1", title: "The Ultimate Guide to AI Marketing", description: "A comprehensive guide to leveraging AI in your marketing strategy", chapters: 12, words: 45000, status: "published", createdAt: "2025-12-15", updatedAt: "2025-12-17", coverColor: "#10B981", coverImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=300&fit=crop", tags: ["Marketing", "AI", "Business"], progress: 100 },
  { id: "demo-2", title: "Passive Income Mastery", description: "Build multiple streams of passive income with proven strategies", chapters: 8, words: 32000, status: "draft", createdAt: "2025-12-10", updatedAt: "2025-12-18", coverColor: "#6366F1", coverImage: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=200&h=300&fit=crop", tags: ["Finance", "Business"], progress: 75 },
  { id: "demo-3", title: "Digital Product Blueprint", description: "Create and sell digital products that generate revenue 24/7", chapters: 10, words: 28000, status: "generating", createdAt: "2025-12-18", updatedAt: "2025-12-19", coverColor: "#F59E0B", coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200&h=300&fit=crop", tags: ["Ecommerce", "Digital Products"], progress: 45 },
  { id: "demo-4", title: "Social Media Automation Secrets", description: "Automate your social media presence and grow your audience", chapters: 6, words: 18000, status: "draft", createdAt: "2025-12-05", updatedAt: "2025-12-16", coverColor: "#EC4899", coverImage: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=300&fit=crop", tags: ["Social Media", "Automation"], progress: 60 },
  { id: "demo-5", title: "Content Creation Playbook", description: "Master content creation across all platforms", chapters: 15, words: 52000, status: "published", createdAt: "2025-11-20", updatedAt: "2025-12-01", coverColor: "#8B5CF6", coverImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=200&h=300&fit=crop", tags: ["Content", "Marketing"], progress: 100 },
];

function mapRow(row: any): Ebook {
  return {
    id: row.id,
    title: row.title,
    description: row.description || "",
    chapters: row.chapters || 0,
    words: row.words || 0,
    status: row.status || "draft",
    createdAt: row.created_at?.split("T")[0] || "",
    updatedAt: row.updated_at?.split("T")[0] || "",
    coverColor: row.cover_color || "#6366F1",
    coverImage: row.cover_image,
    tags: row.tags || [],
    progress: row.progress || 0,
    prompt: row.prompt,
    tone: row.tone,
    language: row.language,
    model: row.model,
    outline: row.outline,
    userId: row.user_id,
  };
}

export const EbookProvider = ({ children }: { children: ReactNode }) => {
  const [ebooks, setEbooks] = useState<Ebook[]>(DEMO_EBOOKS);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const refreshEbooks = useCallback(async () => {
    if (!userId) {
      setEbooks(prev => {
        const localBooks = prev.filter(b => b.id.startsWith("local-"));
        return localBooks.length > 0 ? [...localBooks, ...DEMO_EBOOKS] : DEMO_EBOOKS;
      });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.from("ebooks").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
      if (error) throw error;
      const dbEbooks = (data || []).map(mapRow);
      setEbooks(prev => {
        const localBooks = prev.filter(b => b.id.startsWith("local-"));
        if (dbEbooks.length > 0 || localBooks.length > 0) {
          return [...localBooks, ...dbEbooks];
        }
        return DEMO_EBOOKS;
      });
    } catch (e) {
      console.error("Failed to load ebooks:", e);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshEbooks();
  }, [refreshEbooks]);

  const updateEbook = useCallback((id: string, updates: Partial<Ebook>) => {
    setEbooks(prev => prev.map(book =>
      book.id === id ? { ...book, ...updates, updatedAt: new Date().toISOString().split("T")[0] } : book
    ));
    // If it's a real UUID (not demo), persist to DB
    if (!id.startsWith("demo-") && userId) {
      const dbUpdates: {
        title?: string; description?: string; status?: string; progress?: number;
        chapters?: number; words?: number; cover_color?: string; cover_image?: string;
        tags?: string[]; outline?: any;
      } = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
      if (updates.chapters !== undefined) dbUpdates.chapters = updates.chapters;
      if (updates.words !== undefined) dbUpdates.words = updates.words;
      if (updates.coverColor !== undefined) dbUpdates.cover_color = updates.coverColor;
      if (updates.coverImage !== undefined) dbUpdates.cover_image = updates.coverImage;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.outline !== undefined) dbUpdates.outline = updates.outline;
      if (Object.keys(dbUpdates).length > 0) {
        supabase.from("ebooks").update(dbUpdates).eq("id", id).then(({ error }) => {
          if (error) console.error("Failed to update ebook:", error);
        });
      }
    }
  }, [userId]);

  const addEbook = useCallback(async (ebook: Omit<Ebook, "id">): Promise<Ebook | null> => {
    if (!userId) {
      // Demo mode: add locally with temp id
      const newEbook: Ebook = { ...ebook, id: `local-${Date.now()}` };
      setEbooks(prev => [newEbook, ...prev]);
      return newEbook;
    }
    try {
      const { data, error } = await supabase.from("ebooks").insert({
        user_id: userId,
        title: ebook.title,
        description: ebook.description,
        status: ebook.status || "draft",
        cover_color: ebook.coverColor || "#6366F1",
        cover_image: ebook.coverImage,
        tags: ebook.tags || [],
        progress: ebook.progress || 0,
        chapters: ebook.chapters || 0,
        words: ebook.words || 0,
        prompt: ebook.prompt || "",
        tone: ebook.tone || "professional",
        language: ebook.language || "en",
        model: ebook.model || "auto",
        outline: ebook.outline,
      }).select().single();
      if (error) throw error;
      const newEbook = mapRow(data);
      setEbooks(prev => [newEbook, ...prev]);
      return newEbook;
    } catch (e) {
      console.error("Failed to add ebook:", e);
      const newEbook: Ebook = { ...ebook, id: `local-${Date.now()}` };
      setEbooks(prev => [newEbook, ...prev]);
      return newEbook;
    }
  }, [userId]);

  const deleteEbook = useCallback((id: string) => {
    setEbooks(prev => prev.filter(book => book.id !== id));
    if (!id.startsWith("demo-") && !id.startsWith("local-") && userId) {
      supabase.from("ebooks").delete().eq("id", id).then(({ error }) => {
        if (error) console.error("Failed to delete ebook:", error);
      });
    }
  }, [userId]);

  const getEbook = useCallback((id: string) => {
    return ebooks.find(book => book.id === id);
  }, [ebooks]);

  return (
    <EbookContext.Provider value={{ ebooks, loading, setEbooks, updateEbook, addEbook, deleteEbook, getEbook, refreshEbooks }}>
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

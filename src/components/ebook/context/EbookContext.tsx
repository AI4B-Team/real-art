import React, { createContext, useContext, useState, useCallback } from "react";

export type EbookStatus = "draft" | "generating" | "published";
export type WizardTab = "idea" | "generate" | "design";
export type ContentType = "ebook" | "audiobook" | "presentation";
export type SourceType = "ai" | "upload" | "link" | "record";
export type ToneType = "professional" | "conversational" | "academic" | "friendly" | "authoritative" | "inspirational";
export type CreativeStyle = "default" | "minimalist" | "modern" | "classic" | "bold" | "elegant";

export interface Chapter {
  id: string;
  title: string;
  description: string;
  topics: string[];
  includeImage: boolean;
  pageCount: number;
  order: number;
}

export interface EbookSettings {
  contentType: ContentType;
  sourceType: SourceType;
  prompt: string;
  language: string;
  tone: ToneType;
  creativeStyle: CreativeStyle;
  targetAudience: string;
  chapterCount: number;
  wordsPerChapter: number;
  includeImages: boolean;
  aiModel: string;
}

export interface GeneratedBook {
  id: string;
  title: string;
  selectedTitle: string;
  titleSuggestions: string[];
  description: string;
  chapters: Chapter[];
  coverColor: string;
  coverImage?: string;
  status: EbookStatus;
  progress: number;
  template: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EbookContextType {
  studioActive: boolean;
  setStudioActive: (v: boolean) => void;
  activeTab: WizardTab;
  setActiveTab: (tab: WizardTab) => void;
  settings: EbookSettings;
  updateSettings: (partial: Partial<EbookSettings>) => void;
  isGenerating: boolean;
  generationProgress: number;
  generationStatus: string;
  currentBook: GeneratedBook | null;
  updateCurrentBook: (partial: Partial<GeneratedBook>) => void;
  library: GeneratedBook[];
  startGeneration: () => Promise<void>;
  resetStudio: () => void;
}

const defaultSettings: EbookSettings = {
  contentType: "ebook",
  sourceType: "ai",
  prompt: "",
  language: "English",
  tone: "professional",
  creativeStyle: "modern",
  targetAudience: "",
  chapterCount: 7,
  wordsPerChapter: 500,
  includeImages: true,
  aiModel: "auto",
};

const EbookContext = createContext<EbookContextType | null>(null);

const GENERATION_STEPS = [
  "Analyzing your topic...",
  "Structuring chapters...",
  "Generating content...",
  "Adding imagery...",
  "Applying design theme...",
  "Finalizing your eBook...",
];

const COVER_COLORS = [
  "#1a1a2e", "#16213e", "#0f3460", "#533483",
  "#e94560", "#0d7377", "#14a085", "#f5a623",
];

export function EbookProvider({ children }: { children: React.ReactNode }) {
  const [studioActive, setStudioActive] = useState(false);
  const [activeTab, setActiveTab] = useState<WizardTab>("idea");
  const [settings, setSettings] = useState<EbookSettings>(defaultSettings);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState("");
  const [currentBook, setCurrentBook] = useState<GeneratedBook | null>(null);
  const [library, setLibrary] = useState<GeneratedBook[]>([]);

  const updateSettings = useCallback((partial: Partial<EbookSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const updateCurrentBook = useCallback((partial: Partial<GeneratedBook>) => {
    setCurrentBook((prev) => (prev ? { ...prev, ...partial } : null));
  }, []);

  const startGeneration = useCallback(async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setActiveTab("generate");

    const initialBook: GeneratedBook = {
      id: Date.now().toString(),
      title: settings.prompt.slice(0, 60),
      selectedTitle: "",
      titleSuggestions: [],
      description: "",
      chapters: [],
      coverColor: COVER_COLORS[Math.floor(Math.random() * COVER_COLORS.length)],
      status: "generating",
      progress: 0,
      template: "modern",
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurrentBook(initialBook);

    for (let i = 0; i < GENERATION_STEPS.length; i++) {
      setGenerationStatus(GENERATION_STEPS[i]);
      await new Promise((r) => setTimeout(r, 900 + Math.random() * 600));
      const prog = Math.round(((i + 1) / GENERATION_STEPS.length) * 100);
      setGenerationProgress(prog);
      setCurrentBook((prev) => prev ? { ...prev, progress: prog } : null);
    }

    const chapters: Chapter[] = Array.from(
      { length: settings.chapterCount },
      (_, i) => ({
        id: `ch-${i}`,
        title: `Chapter ${i + 1}: ${getChapterTitle(settings.prompt, i)}`,
        description: "AI-generated chapter content will appear here.",
        topics: ["Topic A", "Topic B", "Topic C"],
        includeImage: settings.includeImages,
        pageCount: Math.ceil(settings.wordsPerChapter / 250),
        order: i,
      })
    );

    const titles = generateTitleSuggestions(settings.prompt);

    setCurrentBook((prev) =>
      prev
        ? {
            ...prev,
            chapters,
            titleSuggestions: titles,
            selectedTitle: titles[0],
            title: titles[0],
            status: "draft",
            progress: 100,
          }
        : null
    );

    setIsGenerating(false);
    setGenerationProgress(100);
  }, [settings]);

  const resetStudio = useCallback(() => {
    setStudioActive(false);
    setActiveTab("idea");
    setSettings(defaultSettings);
    setIsGenerating(false);
    setGenerationProgress(0);
    setCurrentBook(null);
  }, []);

  return (
    <EbookContext.Provider
      value={{
        studioActive, setStudioActive,
        activeTab, setActiveTab,
        settings, updateSettings,
        isGenerating, generationProgress, generationStatus,
        currentBook, updateCurrentBook,
        library, startGeneration, resetStudio,
      }}
    >
      {children}
    </EbookContext.Provider>
  );
}

export function useEbook() {
  const ctx = useContext(EbookContext);
  if (!ctx) throw new Error("useEbook must be used within EbookProvider");
  return ctx;
}

function getChapterTitle(_prompt: string, index: number): string {
  const suffixes = [
    "Introduction & Overview", "Core Principles", "Getting Started",
    "Advanced Strategies", "Common Mistakes to Avoid", "Real-World Applications",
    "Action Plan & Next Steps", "Case Studies", "Tools & Resources",
    "Mastering the Fundamentals",
  ];
  return suffixes[index] || `Deep Dive ${index + 1}`;
}

function generateTitleSuggestions(prompt: string): string[] {
  const topic = prompt.slice(0, 40) || "Your Topic";
  return [
    `The Complete Guide to ${topic}`,
    `Mastering ${topic}: A Step-by-Step Blueprint`,
    `${topic} Unlocked: Secrets the Experts Know`,
    `The ${topic} Playbook`,
    `From Zero to Expert: ${topic}`,
    `${topic}: The Definitive Handbook`,
    `${topic} in 30 Days`,
    `The ${topic} Advantage`,
    `Transform Your Results with ${topic}`,
    `${topic}: Strategies That Actually Work`,
  ];
}

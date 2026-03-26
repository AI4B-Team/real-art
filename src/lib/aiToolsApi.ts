import { supabase } from "@/integrations/supabase/client";

export type AIToolAction =
  | "remove-background"
  | "enhance"
  | "upscale"
  | "style-transfer"
  | "colorize"
  | "restore"
  | "generate";

export type AudioToolAction =
  | "text-to-speech"
  | "generate-script"
  | "generate-captions"
  | "translate";

export async function processImage(
  action: AIToolAction,
  imageUrl?: string,
  prompt?: string
): Promise<{ imageUrl?: string; text?: string; error?: string }> {
  const { data, error } = await supabase.functions.invoke("ai-image-tools", {
    body: { action, imageUrl, prompt },
  });

  if (error) return { error: error.message };
  if (data?.error) return { error: data.error };
  return { imageUrl: data?.imageUrl, text: data?.text };
}

export async function processAudio(
  action: AudioToolAction,
  text: string,
  options?: { voice?: string; language?: string }
): Promise<{ result?: string; error?: string }> {
  const { data, error } = await supabase.functions.invoke("ai-audio-tools", {
    body: { action, text, voice: options?.voice, language: options?.language },
  });

  if (error) return { error: error.message };
  if (data?.error) return { error: data.error };
  return { result: data?.result };
}

// Shared asset store for cross-mode asset management
export interface EditorAsset {
  id: string;
  type: "image" | "video" | "audio" | "text";
  name: string;
  url: string;
  thumbnail?: string;
  duration?: number;
  createdAt: Date;
  source: "upload" | "ai-generated" | "stock" | "recording";
}

let assets: EditorAsset[] = [];
const listeners: Set<() => void> = new Set();

export const assetStore = {
  getAll: () => assets,
  getByType: (type: EditorAsset["type"]) => assets.filter((a) => a.type === type),

  add: (asset: Omit<EditorAsset, "id" | "createdAt">) => {
    const newAsset: EditorAsset = {
      ...asset,
      id: `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date(),
    };
    assets = [newAsset, ...assets];
    listeners.forEach((fn) => fn());
    return newAsset;
  },

  remove: (id: string) => {
    assets = assets.filter((a) => a.id !== id);
    listeners.forEach((fn) => fn());
  },

  subscribe: (fn: () => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

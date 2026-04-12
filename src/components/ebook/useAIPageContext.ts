import { useMemo } from 'react';

// ─── Shared AI Context Engine ─────────────────────────
// Single brain powering all AI surfaces (left panel, floating assistant, right director)

export type PageState = 'strong' | 'improvement' | 'ready';

export interface AIEnhancement {
  id: string;
  category: 'headline' | 'visual' | 'readability' | 'structure' | 'engagement';
  title: string;
  subtitle: string;
  cta: string;
  ctaAction: string; // action key to route
  color: string; // tailwind text class
  bgColor: string; // tailwind bg class
  dotColor: string; // tailwind bg class for dot
  isPrimary?: boolean; // highlight one primary suggestion
}

export interface AIPageContext {
  score: number;
  state: PageState;
  stateLabel: string;
  stateDescription: string;
  readability: number;
  engagement: number;
  visualBalance: number;
  enhancements: AIEnhancement[];
  maxEnhancements: number; // progressive disclosure limit
}

/**
 * Derives a unified AI context for a given page.
 * All AI surfaces consume this — same brain, different presentation.
 */
export function useAIPageContext(
  pageType: string | null,
  hasElements: boolean,
  elementCount: number,
  hasImages: boolean,
  hasHeadline: boolean,
  bodyWordCount: number,
): AIPageContext {
  return useMemo(() => {
    // ─── Score Calculation ─────────────────────────
    let readability = 88;
    let engagement = 76;
    let visualBalance = 82;

    // Adjust based on content signals
    if (!hasHeadline) engagement -= 15;
    if (!hasImages) visualBalance -= 20;
    if (bodyWordCount > 300) readability -= 10;
    if (bodyWordCount < 20 && pageType !== 'cover' && pageType !== 'toc') readability -= 5;
    if (elementCount < 2) visualBalance -= 10;

    // Clamp
    readability = Math.max(40, Math.min(100, readability));
    engagement = Math.max(40, Math.min(100, engagement));
    visualBalance = Math.max(40, Math.min(100, visualBalance));

    const score = Math.round((readability * 0.35 + engagement * 0.4 + visualBalance * 0.25));

    // ─── State Determination ─────────────────────────
    let state: PageState;
    let stateLabel: string;
    let stateDescription: string;

    if (score >= 85) {
      state = 'ready';
      stateLabel = 'Ready to Publish';
      stateDescription = 'Everything looks solid. You\'re good to go.';
    } else if (score >= 65) {
      state = 'strong';
      stateLabel = 'Looking Strong';
      stateDescription = 'This page is strong. Here\'s how to make it exceptional:';
    } else {
      state = 'improvement';
      stateLabel = 'Can Be Improved';
      stateDescription = 'This page has potential. Here are a few ways to strengthen it:';
    }

    // ─── Enhancements (context-aware) ─────────────────────────
    const enhancements: AIEnhancement[] = [];

    // Headline enhancement
    if (!hasHeadline || score < 90) {
      enhancements.push({
        id: 'headline',
        category: 'headline',
        title: hasHeadline
          ? 'Your headline is clear — want a more attention-grabbing version?'
          : 'Adding a headline could boost engagement significantly',
        subtitle: hasHeadline ? 'Try a variation with more emotional pull' : 'A strong headline sets the tone for the entire page',
        cta: hasHeadline ? 'Try Stronger Headline' : 'Add Headline',
        ctaAction: hasHeadline ? 'rewrite' : 'add-headline',
        color: 'text-amber-600',
        bgColor: 'bg-amber-500/10',
        dotColor: 'bg-amber-500',
        isPrimary: !hasHeadline,
      });
    }

    // Visual enhancement
    if (!hasImages || score < 90) {
      enhancements.push({
        id: 'visual',
        category: 'visual',
        title: hasImages
          ? 'This section works well — could pop more with an additional visual'
          : 'A supporting visual could increase clarity and engagement',
        subtitle: hasImages ? 'Explore alternate imagery options' : 'Images help readers retain 65% more information',
        cta: hasImages ? 'Explore Visuals' : 'Add Image',
        ctaAction: 'add-image',
        color: 'text-accent',
        bgColor: 'bg-accent/10',
        dotColor: 'bg-accent',
        isPrimary: !hasImages && hasHeadline,
      });
    }

    // Readability enhancement
    if (bodyWordCount > 200 || score < 85) {
      enhancements.push({
        id: 'readability',
        category: 'readability',
        title: bodyWordCount > 300
          ? 'This section introduces several ideas — breaking it up could improve retention'
          : 'Layout is clean — could improve scannability slightly',
        subtitle: bodyWordCount > 300 ? 'Shorter paragraphs are easier to digest' : 'Small formatting tweaks can boost readability',
        cta: 'Improve Readability',
        ctaAction: 'shorten',
        color: 'text-blue-600',
        bgColor: 'bg-blue-500/10',
        dotColor: 'bg-blue-500',
      });
    }

    // Structure enhancement (only in improvement state)
    if (state === 'improvement' && elementCount < 3) {
      enhancements.push({
        id: 'structure',
        category: 'structure',
        title: 'Adding visual hierarchy could make this page more engaging',
        subtitle: 'Headings, dividers, and spacing guide the reader\'s eye',
        cta: 'Add Structure',
        ctaAction: 'add-structure',
        color: 'text-violet-600',
        bgColor: 'bg-violet-500/10',
        dotColor: 'bg-violet-500',
      });
    }

    // Mark first as primary if none set
    if (enhancements.length > 0 && !enhancements.some(e => e.isPrimary)) {
      enhancements[0].isPrimary = true;
    }

    // ─── Progressive Disclosure ─────────────────────────
    // Ready state: max 2 optional enhancements
    // Strong state: max 3
    // Improvement state: show all (max 4)
    const maxEnhancements = state === 'ready' ? 2 : state === 'strong' ? 3 : 4;

    return {
      score,
      state,
      stateLabel,
      stateDescription,
      readability,
      engagement,
      visualBalance,
      enhancements: enhancements.slice(0, maxEnhancements),
      maxEnhancements,
    };
  }, [pageType, hasElements, elementCount, hasImages, hasHeadline, bodyWordCount]);
}

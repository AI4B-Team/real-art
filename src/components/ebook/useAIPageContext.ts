import { useMemo } from 'react';

// ■■■ Shared AI Context Engine ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
// Single brain powering all AI surfaces (left panel, floating assistant, right director)
// RULE: Only suggest what's genuinely missing or genuinely improvable.
//       Never suggest adding something that already exists on the page.

export type PageState = 'strong' | 'improvement' | 'ready';

export interface AIEnhancement {
  id: string;
  category: 'headline' | 'visual' | 'readability' | 'structure' | 'engagement';
  title: string;
  subtitle: string;
  cta: string;
  ctaAction: string;
  color: string;
  bgColor: string;
  dotColor: string;
  isPrimary?: boolean;
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
  maxEnhancements: number;
}

export function useAIPageContext(
  pageType: string | null,
  hasElements: boolean,
  elementCount: number,
  hasImages: boolean,
  hasHeadline: boolean,
  bodyWordCount: number,
): AIPageContext {
  return useMemo(() => {

    // ■■ Page-type-specific baselines ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
    const isCover   = pageType === 'cover';
    const isToc     = pageType === 'toc';
    const isBack    = pageType === 'back';
    const isChapter = pageType === 'chapter';
    const isContent = pageType === 'chapter-page';
    const isSpecial = isCover || isToc || isBack;

    // ■■ Baselines (start high — only subtract for real problems) ■■■■■■■■■■■■
    let readability = 90;
    let engagement  = 82;
    let visualBalance = 88;

    // --- Readability ---
    if (isContent && bodyWordCount > 320) readability -= 12;
    if (isContent && bodyWordCount < 30 && hasElements) readability -= 8;
    if (isToc && elementCount > 18) readability -= 5;

    // --- Engagement ---
    if ((isChapter || isContent) && !hasHeadline) engagement -= 20;
    if (isCover && !hasHeadline) engagement -= 25;
    if (isContent && bodyWordCount < 10 && hasElements) engagement -= 15;

    // --- Visual balance ---
    if (isCover && !hasImages) visualBalance -= 18;
    if (isChapter && !hasImages) visualBalance -= 12;
    if (isContent && !hasImages) visualBalance -= 6;
    if (elementCount < 2 && !isSpecial) visualBalance -= 12;
    if (elementCount > 14) visualBalance -= 8;

    // Clamp all scores
    readability = Math.max(40, Math.min(100, readability));
    engagement = Math.max(40, Math.min(100, engagement));
    visualBalance = Math.max(40, Math.min(100, visualBalance));

    const score = Math.round(readability * 0.35 + engagement * 0.40 + visualBalance * 0.25);

    // ■■ State ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
    let state: PageState;
    let stateLabel: string;
    let stateDescription: string;

    if (score >= 88) {
      state = 'ready';
      stateLabel = 'Ready to Publish';
      stateDescription = "This page looks great. No issues found.";
    } else if (score >= 70) {
      state = 'strong';
      stateLabel = 'Looking Strong';
      stateDescription = "This page is solid. A couple of optional tweaks below:";
    } else {
      state = 'improvement';
      stateLabel = 'Can Be Improved';
      stateDescription = "A few things would make this page stronger:";
    }

    // ■■ Enhancements — ONLY push genuine gaps ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
    const enhancements: AIEnhancement[] = [];

    // 1. HEADLINE — only suggest if it's genuinely missing
    if (!hasHeadline && (isCover || isChapter || isContent)) {
      enhancements.push({
        id: 'headline',
        category: 'headline',
        title: isCover
          ? 'No title found on this cover — add one to anchor the design'
          : 'This page is missing a headline',
        subtitle: 'A strong headline immediately tells readers what to expect',
        cta: 'Add Headline',
        ctaAction: 'add-headline',
        color: 'text-amber-600',
        bgColor: 'bg-amber-500/10',
        dotColor: 'bg-amber-500',
        isPrimary: true,
      });
    }

    // 2. IMAGE — only suggest if genuinely missing AND it matters for this page type
    if (!hasImages && (isCover || isChapter)) {
      enhancements.push({
        id: 'visual',
        category: 'visual',
        title: isCover
          ? 'Cover has no image — visuals dramatically increase first impressions'
          : 'Chapter cover has no image — a visual helps introduce the topic',
        subtitle: 'Readers are 65% more likely to engage with image-rich pages',
        cta: 'Add Image',
        ctaAction: 'add-image',
        color: 'text-accent',
        bgColor: 'bg-accent/10',
        dotColor: 'bg-accent',
        isPrimary: !hasHeadline ? false : true,
      });
    }

    // 3. READABILITY — only if body text is genuinely problematic
    if (isContent && bodyWordCount > 320) {
      enhancements.push({
        id: 'readability',
        category: 'readability',
        title: 'This page has a lot of text — consider breaking it up',
        subtitle: 'Shorter paragraphs improve reading speed and retention',
        cta: 'Simplify',
        ctaAction: 'shorten',
        color: 'text-blue-600',
        bgColor: 'bg-blue-500/10',
        dotColor: 'bg-blue-500',
      });
    } else if (isContent && bodyWordCount < 30 && hasElements) {
      enhancements.push({
        id: 'readability',
        category: 'readability',
        title: 'This content page appears to have very little text',
        subtitle: 'Add body content to give readers something substantive to read',
        cta: 'Add Content',
        ctaAction: 'add-body',
        color: 'text-blue-600',
        bgColor: 'bg-blue-500/10',
        dotColor: 'bg-blue-500',
      });
    }

    // 4. STRUCTURE — only on improvement pages with very few elements
    if (state === 'improvement' && elementCount < 2 && !isSpecial) {
      enhancements.push({
        id: 'structure',
        category: 'structure',
        title: 'This page seems mostly empty',
        subtitle: 'Add headings, text, and visuals to build out the layout',
        cta: 'Add Structure',
        ctaAction: 'add-structure',
        color: 'text-violet-600',
        bgColor: 'bg-violet-500/10',
        dotColor: 'bg-violet-500',
      });
    }

    // ■■ Mark first as primary if none set ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
    if (enhancements.length > 0 && !enhancements.some(e => e.isPrimary)) {
      enhancements[0].isPrimary = true;
    }

    // ■■ Progressive disclosure limits ■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■
    // Ready: 0 suggestions (page is good — don't fabricate problems)
    // Strong: max 2 (only real improvement opportunities)
    // Improvement: max 3
    const maxEnhancements = state === 'ready' ? 0 : state === 'strong' ? 2 : 3;

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

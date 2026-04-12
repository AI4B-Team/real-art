# Memory: features/apps/ebook-creator/actionable-ai-nudges
Updated: now

All AI surfaces (floating assistant, Director panel, left sidebar) share a unified context engine (`useAIPageContext`) that derives score, state, and enhancements from actual page content signals (element count, images, headlines, word count).

## Three States
- **Ready** (score ≥ 85): "Ready to Publish" — green badge, 1-2 optional enhancements max, completion celebration
- **Strong** (score 65-84): "Looking Strong" — amber badge, collaborative enhancement suggestions, "This page is strong. Here's how to make it exceptional"
- **Improvement** (score < 65): "Can Be Improved" — blue badge, actionable opportunities with clear impact descriptions

## Language System
- No "weak", "missing", "needs fixing", "priority fixes"
- Uses "could be stronger", "opportunity to improve", "optional enhancement"
- Tone is collaborative coach, not critical auditor

## Card-Based Suggestions
- Each enhancement is a compact card: 1-line title + 1-line subtitle + CTA button
- One primary suggestion highlighted per page
- Progressive disclosure: ready=2 max, strong=3 max, improvement=4 max

## Synced Surfaces
- Left Panel "Final Review" pills (renamed from "Make It Yours")
- Floating AI Assistant panel (confidence score badge in header)
- Right Panel Director tab (performance metrics + smart enhancements replacing "Priority Fixes")
- All powered by same `useAIPageContext` hook

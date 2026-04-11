# Memory: features/apps/ebook-creator/dynamic-layout-engine
Updated: now

The ebook canvas editor (EbookCanvasEditor.tsx) ensures visual variety via:
- **Seeded image selection**: `strHash` + `seededImage` pick different stock images per book/chapter based on title hash (24-image pool)
- **Cover diversity**: 6 color palettes × 3 layout variants (bottom panel, side stripe, top-half colored)
- **Chapter diversity**: 6 accent palettes × 2 layout variants (text-left + image below, full-width image + overlay title)
- **Back cover diversity**: 5 palettes with image + gradient overlay
- **TOC auto-sync**: useEffect watches chapter pages for title/position changes and rebuilds TOC elements automatically via `buildTocElements`
- **Text overflow-hidden**: prevents scrolling inside text boxes on the canvas

Content pagination is handled in NewEbookPage.tsx during generation:
- `splitContent()` splits AI content at ~160 words per page
- Only the first chunk of each split gets the image prompt (no duplicate images)
- `localStorage` is cleared at the start of every new generation to prevent old book bleed-in
- Uses `getElementsForPage` directly from the canvas editor for element generation

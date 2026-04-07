# Memory: features/apps/ebook-creator/editor-ai-assistant-panel
Updated: now

The eBook Studio has a **unified AIVA (AI Creative Director)** architecture:

## Left Panel: Design | AI toggle
- **Design tab** (default): Structure, Templates, Content, Elements, Images, Video, Audio, Interactive, Translate
- **AI tab**: AIVA panel with contextual header ("Working on: [page name]"), containing:
  - **Director sub-tab**: Performance Snapshot (score/100, Readability/Engagement/Visual Balance bars), Priority Fixes (color-coded cards with action buttons), Quick Actions (vertical list)
  - **Chat sub-tab**: Persistent per-page threaded conversation with Apply/Pin/Redo on AI responses, starter prompts, message count badge

## Right Panel: Format only
- Header: "Format" with SlidersHorizontal icon
- Sections: Size, Style, Background, Border
- Bottom page navigation with grid view toggle

## Key Principle
All AI is unified under "AIVA" — one brain. Inline AI actions from canvas toolbar switch sidebar to AI mode. Director insights route to Chat tab for execution. No separate AI systems.

## Component: `src/components/ebook/AIVAPanel.tsx`
Standalone component rendered inside EbookDesignSidebar when in AI mode.

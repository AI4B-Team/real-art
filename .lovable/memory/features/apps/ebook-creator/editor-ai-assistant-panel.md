# Memory: features/apps/ebook-creator/editor-ai-assistant-panel
Updated: now

The eBook Studio uses a **Brain (left) + Coach (right)** architecture:

## Left Panel: Design | AI toggle
- **Design tab** (default): Templates, Content, Elements, Images, Video, Audio, Interactive, Translate
- **AI tab**: AIVA chat-only interface with contextual header ("Working on: [page name]"), persistent per-page threaded conversation with Apply/Pin/Redo on AI responses, starter prompts, message count. **No Director, no scoring, no analytics here.**

## Right Panel: Dynamic based on mode
- **When AI mode is ON** (sidebarMode === 'ai'):
  - Tab label: "Director" (active)
  - Performance Snapshot (score/100, Readability/Engagement/Visual Balance bars)
  - Priority Fixes (color-coded cards with action buttons that send to left AIVA chat)
  - Quick Actions (vertical list that sends to left AIVA chat)
- **When AI mode is OFF** (sidebarMode === 'design'):
  - Tab label: "Format" (active)
  - Sections: Size, Style, Background, Border

## Key Principle
Left = Input (tell AI what you want via chat)
Right = Feedback (AI tells you what to fix via Director)
Director "fix" buttons auto-send prompts to the AIVA chat on the left.
Separation of THINKING (left) vs DOING (right).

## Component: `src/components/ebook/AIVAPanel.tsx`
Chat-only panel rendered inside EbookDesignSidebar when in AI mode.

## Component: `src/components/ebook/PageSettingsPanel.tsx`
Right panel that dynamically shows Director or Format based on `sidebarMode` prop.

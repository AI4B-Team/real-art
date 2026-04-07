# Memory: features/apps/ebook-creator/editor-ai-assistant-panel
Updated: now

The eBook Studio uses a **Brain (Left) + Coach (Right)** architecture:

## Left Panel: Design | AI toggle
- **Design tab** (default): Structure (Templates, Content), Create (Text, Elements), Upgrade (Image, Video, Audio, Interactive), Advanced (Translate). Features a **Smart Action Row** under the tab header with context-aware recommended actions (e.g., "Add Headline", "Add Image", "Add Section").
- **AI tab**: AIVA chat-only interface with contextual header ("Working on: [page name]"), persistent per-page threaded conversation with Apply/Pin/Redo on AI responses, starter prompts, message count.

## Right Panel: 3 independent tabs (Director | Format | Pages)
- **Director tab** (default): Performance Snapshot (score/100, Readability/Engagement/Visual Balance bars), Priority Fixes (color-coded cards with action buttons that send to left AIVA chat), Quick Actions (16 one-click actions).
- **Format tab**: Size, Style, Background, Border controls for the selected page.
- **Pages tab**: Visual thumbnail-based page navigator with drag reorder, duplicate, move up/down, delete actions on hover. Includes "Add Page" button.

## Key Principles
- Left = Input (tell AI what you want via chat, build with design tools)
- Center = Output (canvas)
- Right = Feedback & Navigation (AI diagnosis, formatting, visual page nav)
- Director suggests → AIVA executes
- Section labels: Structure, Create (not Add), Upgrade (not Enhance), Advanced
- All three right panel tabs are independently selectable regardless of left panel mode

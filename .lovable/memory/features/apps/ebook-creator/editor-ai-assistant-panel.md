# Memory: features/apps/ebook-creator/editor-ai-assistant-panel
Updated: now

The eBook Studio right panel is a **three-tab** system: **Director | Chat | Format**.

- **Director** (Tab 1 — Diagnosis): Performance Snapshot (score out of 100 with Readability/Engagement/Visual Balance bars), Priority Fixes (color-coded action cards with inline action buttons), Quick Actions (vertical list of pills). Clicking any insight action button auto-switches to the Chat tab and sends the request there.

- **Chat** (Tab 2 — Execution): Persistent threaded AI conversation per page. Messages are stored in component state keyed by page ID. Features: suggested starter prompts when empty, user/AI message bubbles, Apply/Pin/Redo action buttons on every AI response, pinned messages section at top. Chat uses the `ai-text-edit` edge function. No more disappearing popups — all AI responses are persistent in the thread.

- **Format** (Tab 3 — Page Settings): Size, Style, Background, Border controls.

The panel width is `w-80` (320px). Section headers use `bg-foreground/[0.12]` with `border-l-accent` accent.

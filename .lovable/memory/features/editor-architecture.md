Three-mode editor (Image/Video/Audio) accessible from EditorPage top toolbar tabs.

## Components
- `ImageEditor.tsx` — Canvas-based image editor with brush/eraser/fill/text/layers, AI tools, filters, adjustments, elements, text, effects, templates, settings
- `VideoEditor.tsx` — Timeline-based video editor with storyboard, script (synced with storyboard), video brief, character, visuals, audio, captions, effects, elements, transitions, brand kit, languages, templates, tools, settings, AI chat
- `AudioEditor.tsx` — Waveform + multi-track audio editor with tracks, voice, music library, SFX, effects, TTS, templates, AI tools, settings, AI chat

## Left Panel Tab Consolidation (Single Row)
All editors use ONE row of icon tabs. Related features are grouped via sub-tab navigation within panels.

### Video Editor (9 tabs):
AI Chat, Storyboard (sub: Scenes/Script/Brief), Character, Visuals, Audio, Text (sub: Text/Captions), Effects (sub: Effects/Transitions/Elements), Templates, Settings (sub: General/Brand/Languages/AI Tools)

### Image Editor (8 tabs):
Creations, Layers, Adjustments (sub: Adjustments/Filters), AI Tools, Text, Effects (sub: Effects/Elements), Templates, Settings (sub: General/Brand)

### Audio Editor (8 tabs):
AI Chat, Tracks, Voice, Music (sub: Music/Sound FX), Effects, Text To Speech, Templates, Settings (sub: General/AI Tools)

## Cross-editor sharing
- Top toolbar in EditorPage switches between modes (image/video/audio)
- Assets created in one mode can be sent to another via the prompt box content type selector
- Video editor has audio tracks; audio editor output can feed into video timeline
- Image editor animations can export to video
- All three share Brand Kit, Export, and Templates patterns

## Prompt box
- Content type selector (Video/Audio/Image pill) with mode-specific toolbar icons
- Agent dropdown with enhance options
- Auto-prompt (shuffle) button

## Key rules
- Video-specific: Storyboard, Script, Captions, Transitions, Video Brief, Languages/Dubbing
- Image-specific: Layers, Brush/Eraser/Fill tools, Filters, Adjustments, Canvas tools
- Audio-specific: Voice/TTS, Music Library, SFX, Stem Splitter, Vocal Isolator, Waveform
- Shared: Templates, Brand Kit, Effects, Elements, Text, AI Tools, Settings
- Export only in top-right toolbar button, NOT in left panel

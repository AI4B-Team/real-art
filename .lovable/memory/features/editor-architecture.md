Three-mode editor (Image/Video/Audio) accessible from EditorPage top toolbar tabs.

## Components
- `ImageEditor.tsx` — Canvas-based image editor with brush/eraser/fill/text/layers, AI tools, filters, adjustments, elements, text, effects, brand kit, export, templates, settings
- `VideoEditor.tsx` — Timeline-based video editor with storyboard, script (synced with storyboard), video brief, character, visuals, audio, captions, effects, elements, transitions, brand kit, languages, templates, export, tools, settings, AI chat
- `AudioEditor.tsx` — Waveform + multi-track audio editor with tracks, voice, music library, SFX, effects, TTS, templates, AI tools, export, settings, AI chat

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
- Shared: Templates, Brand Kit, Export, Effects, Elements, Text, AI Tools, Settings

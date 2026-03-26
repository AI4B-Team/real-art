Three-mode editor (Image/Video/Audio) accessible from EditorPage top toolbar tabs.

## Components
- `ImageEditor.tsx` — Canvas-based image editor with brush/eraser/fill/text/layers, AI tools, filters, adjustments, elements, text, effects, templates, settings
- `VideoEditor.tsx` — Timeline-based video editor with storyboard, script (synced with storyboard), video brief, character, visuals, audio, captions, effects, elements, transitions, brand kit, languages, templates, tools, settings, AI chat, transcript, create clips, AI metadata
- `AudioEditor.tsx` — Waveform + multi-track audio editor with tracks, voice, music library, SFX, effects, TTS, templates, AI tools, settings, AI chat

## Left Panel Tab Consolidation (Single Row)
All editors use ONE row of icon tabs. Related features are grouped via sub-tab navigation within panels.

### Video Editor (16 tabs):
AI Chat, Storyboard (sub: Scenes/Script/Brief), Character, Visuals, Audio, Transcript (word tokens + filler removal + remove silences + remove retakes + fix word), Text, Translate, Effects (sub: Effects/Transitions/Elements), Captions (sub: Edit/Style), Create Clips (clip finder + social export presets), AI Notes (titles/desc/tags/chapters/show notes), Templates, Brand, AI Tools, Settings (sub: General/Brand/Languages/AI Tools)

### Image Editor (8 tabs):
Creations, Layers, Adjustments (sub: Adjustments/Filters), AI Tools, Text, Effects (sub: Effects/Elements), Templates, Settings (sub: General/Brand)

### Audio Editor (8 tabs):
AI Chat, Tracks, Voice, Music (sub: Music/Sound FX), Effects, Text To Speech, Templates, Settings (sub: General/AI Tools)

## Descript-Inspired Features (integrated)
- P1: Transcript Tab — word-timed tokens, click-to-seek, yellow highlight at playhead, filler word detection (AI Clean), batch remove fillers
- P2: Studio Sound + Remove Silences — in Transcript tab and AI Tools
- P3: Captions — Auto-generate, manual add, SRT import/export, 8 caption styles
- P4: Create Clips — AI clip finder (1/3/5 clips, 15s/30s/60s), accept/reject suggestions, social export presets (TikTok/Reels/Shorts/LinkedIn/Twitter/YouTube/Podcast)
- P5: Voice Repair — Fix Word (AI voice clone), Remove Retakes (detect repeated sentences)
- P6: AI Show Notes — Generate titles, description, tags, chapters, show notes from transcript
- EditorPage Export dropdown — Standard formats + Social Presets section

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
- Video-specific: Storyboard, Script, Captions, Transitions, Video Brief, Languages/Dubbing, Transcript, Create Clips, AI Notes
- Image-specific: Layers, Brush/Eraser/Fill tools, Filters, Adjustments, Canvas tools
- Audio-specific: Voice/TTS, Music Library, SFX, Stem Splitter, Vocal Isolator, Waveform
- Shared: Templates, Brand Kit, Effects, Elements, Text, AI Tools, Settings
- Export only in top-right toolbar button, NOT in left panel

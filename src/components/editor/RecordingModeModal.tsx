import { useState, useEffect, useCallback, useRef } from "react";
import {
  X, AudioLines, Camera, Monitor, MonitorSmartphone, Radio,
  Mic, MicOff, Video, VideoOff, Settings, ChevronDown, ChevronLeft,
  Circle, Square, Pause, Play, Timer, Volume2, Sparkles,
  RectangleHorizontal, Palette, FileText,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

type RecordingMode = "voiceover" | "camera" | "screen" | "screen-camera" | "session";

interface RecordingModeOption {
  id: RecordingMode;
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  iconBg: string;
}

const MODES: RecordingModeOption[] = [
  { id: "voiceover", icon: AudioLines, label: "Voiceover", description: "Record audio narration", color: "text-purple-600", bgColor: "bg-purple-50", iconBg: "bg-purple-100" },
  { id: "camera", icon: Camera, label: "Camera", description: "Record from webcam", color: "text-blue-600", bgColor: "bg-blue-50", iconBg: "bg-blue-100" },
  { id: "screen", icon: Monitor, label: "Screen", description: "Capture screen", color: "text-emerald-600", bgColor: "bg-emerald-50", iconBg: "bg-emerald-100" },
  { id: "screen-camera", icon: MonitorSmartphone, label: "Screen & Camera", description: "Screen + camera overlay", color: "text-amber-600", bgColor: "bg-amber-50", iconBg: "bg-amber-100" },
  { id: "session", icon: Radio, label: "Session", description: "Record live session", color: "text-rose-600", bgColor: "bg-rose-50", iconBg: "bg-rose-100" },
];

type StudioTab = "record" | "camera" | "screen" | "size" | "background" | "prompter" | "settings";

const STUDIO_TABS: { id: StudioTab; icon: React.ElementType; label: string }[] = [
  { id: "record", icon: Mic, label: "Record" },
  { id: "camera", icon: Camera, label: "Camera" },
  { id: "screen", icon: Monitor, label: "Screen" },
  { id: "size", icon: RectangleHorizontal, label: "Size" },
  { id: "background", icon: Palette, label: "Background" },
  { id: "prompter", icon: FileText, label: "Prompter" },
  { id: "settings", icon: Settings, label: "Settings" },
];

interface RecordingModeModalProps {
  open: boolean;
  onClose: () => void;
  onRecordingComplete: (mode: RecordingMode, duration: number) => void;
  editorType: "video" | "audio";
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const RecordingModeModal = ({ open, onClose, onRecordingComplete, editorType }: RecordingModeModalProps) => {
  const [step, setStep] = useState<"pick" | "studio">("pick");
  const [selectedMode, setSelectedMode] = useState<RecordingMode | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [activeStudioTab, setActiveStudioTab] = useState<StudioTab>("record");
  const [realtimeTranscription, setRealtimeTranscription] = useState(true);
  const [language, setLanguage] = useState("English");
  const [audioQuality, setAudioQuality] = useState("High Quality");
  const [waveformBars, setWaveformBars] = useState<number[]>(Array.from({ length: 40 }, () => 15));
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const waveformRef = useRef<NodeJS.Timeout | null>(null);

  // Recording timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => setRecordingTime(prev => prev + 0.1), 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRecording, isPaused]);

  // Waveform animation
  useEffect(() => {
    if (step === "studio") {
      waveformRef.current = setInterval(() => {
        setWaveformBars(
          Array.from({ length: 40 }, () =>
            isRecording && !isPaused ? 15 + Math.random() * 85 : 10 + Math.random() * 15
          )
        );
      }, isRecording ? 80 : 300);
    }
    return () => { if (waveformRef.current) clearInterval(waveformRef.current); };
  }, [step, isRecording, isPaused]);

  // Countdown
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const t = setTimeout(() => setCountdown(prev => (prev !== null ? prev - 1 : null)), 1000);
      return () => clearTimeout(t);
    } else if (countdown === 0) {
      setCountdown(null);
      setIsRecording(true);
      setRecordingTime(0);
    }
  }, [countdown]);

  const handleSelectMode = (mode: RecordingMode) => {
    setSelectedMode(mode);
    setStep("studio");
    setActiveStudioTab("record");
  };

  const handleStartRecording = useCallback(() => {
    if (!selectedMode) return;
    setCountdown(3);
    toast({ title: `Starting ${MODES.find(m => m.id === selectedMode)?.label} recording...` });
  }, [selectedMode]);

  const handlePauseResume = useCallback(() => setIsPaused(prev => !prev), []);

  const handleStopRecording = useCallback(() => {
    setIsRecording(false);
    setIsPaused(false);
    const duration = Math.max(1, Math.round(recordingTime));
    onRecordingComplete(selectedMode!, duration);
    toast({ title: "Recording saved!", description: `${formatTime(recordingTime)} of ${MODES.find(m => m.id === selectedMode)?.label} recorded` });
    setSelectedMode(null);
    setRecordingTime(0);
    setStep("pick");
    onClose();
  }, [recordingTime, selectedMode, onRecordingComplete, onClose]);

  const handleClose = useCallback(() => {
    if (isRecording) {
      handleStopRecording();
    } else {
      setSelectedMode(null);
      setRecordingTime(0);
      setCountdown(null);
      setStep("pick");
      onClose();
    }
  }, [isRecording, handleStopRecording, onClose]);

  const handleBack = () => {
    if (isRecording) return;
    setStep("pick");
    setSelectedMode(null);
  };

  const availableModes = editorType === "audio"
    ? MODES.filter(m => m.id === "voiceover" || m.id === "session")
    : MODES;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm" onClick={handleClose}>
      <div className="bg-background rounded-2xl shadow-2xl border border-foreground/[0.08] w-full max-w-3xl mx-4 overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* ─── STEP 1: Mode Picker ─── */}
        {step === "pick" && (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/[0.06]">
              <h2 className="text-lg font-display font-bold">Choose Recording Mode</h2>
              <button onClick={handleClose} className="p-2 rounded-lg hover:bg-foreground/[0.04] text-muted hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className={`grid gap-4 ${availableModes.length <= 2 ? "grid-cols-2" : "grid-cols-5"}`}>
                {availableModes.map(mode => (
                  <button key={mode.id} onClick={() => handleSelectMode(mode.id)}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 border-dashed border-foreground/[0.1] hover:border-foreground/[0.25] hover:bg-foreground/[0.02] transition-all group">
                    <div className={`w-16 h-16 rounded-2xl ${mode.iconBg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
                      <mode.icon className={`w-8 h-8 ${mode.color}`} />
                    </div>
                    <span className="text-sm font-medium text-foreground">{mode.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ─── STEP 2: Recording Studio ─── */}
        {step === "studio" && (
          <>
            {/* Header with back + close */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-foreground/[0.06]">
              <button onClick={handleBack} disabled={isRecording}
                className="p-2 rounded-lg hover:bg-foreground/[0.04] text-muted hover:text-foreground transition-colors disabled:opacity-30">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-1 rounded-full bg-foreground/[0.12]" />
              <button onClick={handleClose} className="p-2 rounded-lg hover:bg-foreground/[0.04] text-muted hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gradient preview area */}
            <div className="relative mx-4 mt-3 rounded-2xl overflow-hidden" style={{
              background: "linear-gradient(180deg, hsl(270 70% 65%) 0%, hsl(250 80% 60%) 50%, hsl(210 90% 55%) 100%)",
              minHeight: 220,
            }}>
              {/* Countdown overlay */}
              {countdown !== null && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-black/30 backdrop-blur-sm rounded-2xl">
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                    <span className="text-5xl font-display font-bold text-white">{countdown}</span>
                  </div>
                  <p className="text-white/70 text-sm mt-3">Recording starts in...</p>
                </div>
              )}

              {/* Waveform visualizer */}
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 flex items-center gap-[3px] h-8">
                {waveformBars.map((h, i) => (
                  <div key={i} className="w-[4px] rounded-full bg-white/50 transition-all duration-75"
                    style={{ height: `${Math.max(4, h * 0.3)}px` }} />
                ))}
              </div>

              {/* Timer */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="mt-6">
                  <span className="text-6xl font-mono font-bold text-white tracking-widest" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
                    {formatTime(recordingTime)}
                  </span>
                </div>
                {!isRecording && countdown === null && (
                  <p className="text-white/70 text-sm mt-2">Click Record To Start</p>
                )}
                {isRecording && isPaused && (
                  <p className="text-white/70 text-sm mt-2 animate-pulse">Paused</p>
                )}
                {isRecording && !isPaused && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse" />
                    <p className="text-white/80 text-sm font-medium">Recording</p>
                  </div>
                )}
              </div>
            </div>

            {/* Studio mode tabs */}
            <div className="flex items-center justify-center gap-1 px-4 py-4">
              {STUDIO_TABS.map(tab => {
                const isActive = activeStudioTab === tab.id;
                const isRecordTab = tab.id === "record";
                return (
                  <button key={tab.id} onClick={() => setActiveStudioTab(tab.id)}
                    className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-xl transition-all min-w-[64px] ${
                      isActive
                        ? isRecordTab
                          ? "text-accent"
                          : "text-foreground bg-foreground/[0.05]"
                        : "text-muted hover:text-foreground"
                    }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isActive && isRecordTab ? "bg-accent/10" : ""
                    }`}>
                      <tab.icon className={`w-5 h-5 ${isActive && isRecordTab ? "text-accent" : ""}`} />
                    </div>
                    <span className={`text-[11px] font-medium ${isActive && isRecordTab ? "text-accent" : ""}`}>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Recording controls (centered below tabs) */}
            {activeStudioTab === "record" && (
              <div className="px-6 pb-5 space-y-4">
                {/* Record / Pause / Stop buttons */}
                <div className="flex items-center justify-center gap-4">
                  {!isRecording && countdown === null && (
                    <button onClick={handleStartRecording}
                      className="w-16 h-16 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent/90 transition-colors shadow-lg shadow-accent/30">
                      <Circle className="w-7 h-7 fill-current" />
                    </button>
                  )}
                  {isRecording && (
                    <>
                      <button onClick={handlePauseResume}
                        className="w-12 h-12 rounded-full bg-foreground/[0.08] flex items-center justify-center text-foreground hover:bg-foreground/[0.12] transition-colors">
                        {isPaused ? <Play className="w-5 h-5 ml-0.5" /> : <Pause className="w-5 h-5" />}
                      </button>
                      <button onClick={handleStopRecording}
                        className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30">
                        <Square className="w-6 h-6 fill-current" />
                      </button>
                      <button onClick={() => { setIsRecording(false); setIsPaused(false); setRecordingTime(0); }}
                        className="w-12 h-12 rounded-full bg-foreground/[0.06] flex items-center justify-center text-muted hover:text-foreground transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Real-Time Transcription */}
                <div className="rounded-xl border border-foreground/[0.08] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm font-semibold">Real-Time Transcription</p>
                      <p className="text-xs text-muted">Start recording to see your words appear</p>
                    </div>
                  </div>
                  <Switch checked={realtimeTranscription} onCheckedChange={setRealtimeTranscription} />
                </div>

                {/* Language & Audio Quality */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted mb-1.5 block">Language</label>
                    <div className="relative">
                      <select value={language} onChange={e => setLanguage(e.target.value)}
                        className="w-full appearance-none bg-background border border-foreground/[0.1] rounded-lg px-3 py-2.5 text-sm font-medium pr-8 focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer">
                        {["English", "Spanish", "French", "German", "Italian", "Portuguese", "Japanese", "Korean", "Chinese", "Arabic", "Hindi"].map(l => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted mb-1.5 block">Audio Quality</label>
                    <div className="relative">
                      <select value={audioQuality} onChange={e => setAudioQuality(e.target.value)}
                        className="w-full appearance-none bg-background border border-foreground/[0.1] rounded-lg px-3 py-2.5 text-sm font-medium pr-8 focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer">
                        {["High Quality", "Standard", "Low (Smaller Files)"].map(q => (
                          <option key={q} value={q}>{q}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Size tab */}
            {activeStudioTab === "size" && (
              <div className="px-6 pb-5 space-y-3">
                <h3 className="text-sm font-bold">Recording Size</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "16:9", desc: "Landscape" },
                    { label: "9:16", desc: "Portrait" },
                    { label: "1:1", desc: "Square" },
                    { label: "4:3", desc: "Standard" },
                    { label: "4:5", desc: "Social" },
                    { label: "Custom", desc: "Set size" },
                  ].map(s => (
                    <button key={s.label} className="p-3 rounded-xl border border-foreground/[0.08] hover:border-accent/40 text-center transition-colors">
                      <span className="text-sm font-bold">{s.label}</span>
                      <p className="text-[10px] text-muted">{s.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Background tab */}
            {activeStudioTab === "background" && (
              <div className="px-6 pb-5 space-y-3">
                <h3 className="text-sm font-bold">Background</h3>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { color: "#000000", label: "Black" },
                    { color: "#FFFFFF", label: "White" },
                    { color: "#00B140", label: "Green" },
                    { color: "linear-gradient(135deg, #8B5CF6, #3B82F6)", label: "Gradient" },
                  ].map(bg => (
                    <button key={bg.label} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-xl border-2 border-foreground/[0.08] hover:border-accent transition-colors"
                        style={{ background: bg.color }} />
                      <span className="text-[10px] text-muted">{bg.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Prompter tab */}
            {activeStudioTab === "prompter" && (
              <div className="px-6 pb-5 space-y-3">
                <h3 className="text-sm font-bold">Teleprompter</h3>
                <textarea placeholder="Paste or type your script here..."
                  className="w-full h-32 bg-foreground/[0.03] border border-foreground/[0.08] rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/20" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">Scroll Speed</span>
                  <input type="range" min={1} max={10} defaultValue={5}
                    className="w-32 h-1.5 rounded-full appearance-none cursor-pointer bg-foreground/[0.12]
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-lg" />
                </div>
              </div>
            )}

            {/* Camera tab */}
            {activeStudioTab === "camera" && (
              <div className="px-6 pb-5 space-y-3">
                <h3 className="text-sm font-bold">Camera Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                    <span className="text-sm">Camera</span>
                    <span className="text-sm text-muted">Default Camera</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                    <span className="text-sm">Mirror</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            )}

            {/* Screen tab */}
            {activeStudioTab === "screen" && (
              <div className="px-6 pb-5 space-y-3">
                <h3 className="text-sm font-bold">Screen Capture</h3>
                <button className="w-full p-4 rounded-xl border-2 border-dashed border-foreground/[0.1] hover:border-accent/40 transition-colors text-center">
                  <Monitor className="w-8 h-8 text-muted mx-auto mb-2" />
                  <p className="text-sm font-medium">Select Screen or Window</p>
                  <p className="text-xs text-muted mt-1">Click to choose what to capture</p>
                </button>
              </div>
            )}

            {/* Settings tab */}
            {activeStudioTab === "settings" && (
              <div className="px-6 pb-5 space-y-3">
                <h3 className="text-sm font-bold">Recording Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                    <span className="text-sm">Countdown Timer</span>
                    <span className="text-sm text-muted">3 seconds</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                    <span className="text-sm">Auto-stop after</span>
                    <span className="text-sm text-muted">No limit</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                    <span className="text-sm">Noise Reduction</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-foreground/[0.08]">
                    <span className="text-sm">Echo Cancellation</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RecordingModeModal;

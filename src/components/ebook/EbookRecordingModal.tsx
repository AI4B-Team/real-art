import { useState, useEffect, useCallback, useRef } from "react";
import {
  X, Mic, MicOff, Sparkles, ChevronDown, FileText, Upload,
  Circle, Square, Pause, Play, Settings,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";

interface EbookRecordingModalProps {
  open: boolean;
  onClose: () => void;
  onComplete: (data: { transcript: string; duration: number; label: string }) => void;
}

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

type Tab = "record" | "prompter" | "settings";

const EbookRecordingModal = ({ open, onClose, onComplete }: EbookRecordingModalProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("record");
  const [realtimeTranscription, setRealtimeTranscription] = useState(true);
  const [language, setLanguage] = useState("English");
  const [audioQuality, setAudioQuality] = useState("High Quality");
  const [waveformBars, setWaveformBars] = useState<number[]>(Array.from({ length: 40 }, () => 15));
  const [transcript, setTranscript] = useState("");
  const [prompterText, setPrompterText] = useState("");
  const [prompterSpeed, setPrompterSpeed] = useState(5);
  const [showPrompterOverlay, setShowPrompterOverlay] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const waveformRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const prompterFileRef = useRef<HTMLInputElement>(null);
  const prompterScrollRef = useRef<HTMLDivElement>(null);
  const prompterAnimRef = useRef<number | null>(null);

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
    if (open) {
      waveformRef.current = setInterval(() => {
        setWaveformBars(
          Array.from({ length: 40 }, () =>
            isRecording && !isPaused ? 15 + Math.random() * 85 : 10 + Math.random() * 15
          )
        );
      }, isRecording ? 80 : 300);
    }
    return () => { if (waveformRef.current) clearInterval(waveformRef.current); };
  }, [open, isRecording, isPaused]);

  // Countdown
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      const t = setTimeout(() => setCountdown(prev => (prev !== null ? prev - 1 : null)), 1000);
      return () => clearTimeout(t);
    } else if (countdown === 0) {
      setCountdown(null);
      startActualRecording();
    }
  }, [countdown]);

  // Simulated real-time transcription
  useEffect(() => {
    if (isRecording && !isPaused && realtimeTranscription) {
      const phrases = [
        "I want to talk about ", "the importance of ", "building a strong foundation ",
        "for your business. ", "Let's explore ", "how to create value ", "for your audience. ",
        "Content is key ", "in today's market. ", "The strategies we'll cover ",
        "include marketing, ", "branding, and ", "customer engagement. ",
      ];
      const interval = setInterval(() => {
        const phrase = phrases[Math.floor(Math.random() * phrases.length)];
        setTranscript(prev => prev + phrase);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isRecording, isPaused, realtimeTranscription]);

  // Teleprompter auto-scroll
  useEffect(() => {
    if (isRecording && !isPaused && showPrompterOverlay && prompterScrollRef.current) {
      const el = prompterScrollRef.current;
      const scrollStep = () => {
        el.scrollTop += prompterSpeed * 0.3;
        prompterAnimRef.current = requestAnimationFrame(scrollStep);
      };
      prompterAnimRef.current = requestAnimationFrame(scrollStep);
      return () => { if (prompterAnimRef.current) cancelAnimationFrame(prompterAnimRef.current); };
    }
  }, [isRecording, isPaused, showPrompterOverlay, prompterSpeed]);

  const startActualRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recorder.onstop = () => { stream.getTracks().forEach(t => t.stop()); };
    } catch {
      toast({ title: "Microphone access denied", variant: "destructive" });
    }
  };

  const handleStartRecording = useCallback(() => {
    setCountdown(3);
    if (prompterText.trim()) setShowPrompterOverlay(true);
  }, [prompterText]);

  const handlePauseResume = useCallback(() => setIsPaused(prev => !prev), []);

  const handleStopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setIsPaused(false);
    setShowPrompterOverlay(false);
    const duration = Math.max(1, Math.round(recordingTime));
    const finalTranscript = transcript.trim();
    onComplete({
      transcript: finalTranscript,
      duration,
      label: `Voice Recording (${formatTime(recordingTime)})`,
    });
    toast({ title: "Recording saved!", description: `${formatTime(recordingTime)} recorded` });
    resetState();
    onClose();
  }, [recordingTime, transcript, onComplete, onClose]);

  const handleDiscard = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    setTranscript("");
    setShowPrompterOverlay(false);
  }, []);

  const resetState = () => {
    setRecordingTime(0);
    setTranscript("");
    setCountdown(null);
    setActiveTab("record");
    setShowPrompterOverlay(false);
  };

  const handleClose = useCallback(() => {
    if (isRecording) handleStopRecording();
    else { resetState(); onClose(); }
  }, [isRecording, handleStopRecording, onClose]);

  const handlePrompterFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPrompterText(ev.target?.result as string || "");
        toast({ title: "Script loaded", description: file.name });
      };
      reader.readAsText(file);
    }
    if (e.target) e.target.value = "";
  };

  if (!open) return null;

  const TABS: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: "record", icon: Mic, label: "Record" },
    { id: "prompter", icon: FileText, label: "Prompter" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm" onClick={handleClose}>
      <div className="bg-background rounded-2xl shadow-2xl border border-foreground/[0.08] w-full max-w-3xl mx-4 overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/[0.06]">
          <h2 className="text-lg font-display font-bold flex items-center gap-2">
            <Mic className="w-5 h-5 text-accent" />
            Record Audio
          </h2>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-foreground/[0.04] text-muted hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gradient preview area */}
        <div className="relative mx-4 mt-3 rounded-2xl overflow-hidden" style={{
          background: "linear-gradient(180deg, hsl(var(--accent) / 0.8) 0%, hsl(var(--accent) / 0.5) 50%, hsl(var(--accent) / 0.3) 100%)",
          minHeight: 200,
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

          {/* Teleprompter overlay */}
          {showPrompterOverlay && prompterText.trim() && (
            <div ref={prompterScrollRef} className="absolute inset-0 z-[5] overflow-hidden px-8 py-4" style={{ maskImage: "linear-gradient(to bottom, transparent 0%, black 20%, black 80%, transparent 100%)" }}>
              <p className="text-white/90 text-lg leading-relaxed font-medium whitespace-pre-wrap pt-[80px]">
                {prompterText}
              </p>
            </div>
          )}

          {/* Waveform visualizer */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 flex items-center gap-[3px] h-8" style={{ opacity: showPrompterOverlay ? 0.3 : 1 }}>
            {waveformBars.map((h, i) => (
              <div key={i} className="w-[4px] rounded-full bg-white/50 transition-all duration-75"
                style={{ height: `${Math.max(4, h * 0.3)}px` }} />
            ))}
          </div>

          {/* Timer */}
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ opacity: showPrompterOverlay ? 0.6 : 1 }}>
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

        {/* Tabs */}
        <div className="flex items-center justify-center gap-1 px-4 py-3">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            const isRecordTab = tab.id === "record";
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition-all min-w-[64px] ${
                  isActive
                    ? isRecordTab ? "text-accent" : "text-foreground bg-foreground/[0.05]"
                    : "text-muted hover:text-foreground"
                }`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isActive && isRecordTab ? "bg-accent/10" : ""}`}>
                  <tab.icon className={`w-5 h-5 ${isActive && isRecordTab ? "text-accent" : ""}`} />
                </div>
                <span className={`text-[11px] font-medium ${isActive && isRecordTab ? "text-accent" : ""}`}>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Record tab */}
        {activeTab === "record" && (
          <div className="px-6 pb-5 space-y-4">
            {/* Record / Pause / Stop */}
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
                    className="w-16 h-16 rounded-full bg-destructive flex items-center justify-center text-white hover:bg-destructive/90 transition-colors shadow-lg shadow-destructive/30">
                    <Square className="w-6 h-6 fill-current" />
                  </button>
                  <button onClick={handleDiscard}
                    className="w-12 h-12 rounded-full bg-foreground/[0.06] flex items-center justify-center text-muted hover:text-foreground transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Real-Time Transcription toggle */}
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

            {/* Live transcript display */}
            {realtimeTranscription && transcript && (
              <div className="rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] p-4 max-h-32 overflow-y-auto">
                <p className="text-xs text-muted mb-1 font-medium">Transcript</p>
                <p className="text-sm text-foreground leading-relaxed">{transcript}</p>
              </div>
            )}

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

        {/* Prompter tab */}
        {activeTab === "prompter" && (
          <div className="px-6 pb-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">Teleprompter</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => prompterFileRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground/[0.05] text-xs font-medium hover:bg-foreground/[0.08] transition-colors">
                  <Upload size={12} />Upload Script
                </button>
                <input ref={prompterFileRef} type="file" accept=".txt,.md,.doc,.docx,.rtf" className="hidden" onChange={handlePrompterFileUpload} />
              </div>
            </div>
            <textarea
              value={prompterText}
              onChange={e => setPrompterText(e.target.value)}
              placeholder="Paste or type your script here. The text will scroll automatically when you start recording..."
              className="w-full h-40 bg-foreground/[0.03] border border-foreground/[0.08] rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">Scroll Speed</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Slow</span>
                <input type="range" min={1} max={10} value={prompterSpeed} onChange={e => setPrompterSpeed(Number(e.target.value))}
                  className="w-32 h-1.5 rounded-full appearance-none cursor-pointer bg-foreground/[0.12]
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-lg" />
                <span className="text-xs text-muted">Fast</span>
              </div>
            </div>
            {prompterText.trim() && (
              <p className="text-xs text-accent font-medium">
                ✓ Script loaded — it will appear as an overlay when you start recording
              </p>
            )}
          </div>
        )}

        {/* Settings tab */}
        {activeTab === "settings" && (
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
      </div>
    </div>
  );
};

export default EbookRecordingModal;

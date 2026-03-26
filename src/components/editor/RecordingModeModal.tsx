import { useState, useEffect, useCallback, useRef } from "react";
import {
  X, AudioLines, Camera, Monitor, MonitorSmartphone, Radio,
  Mic, MicOff, Video, VideoOff, Settings, ChevronDown,
  Circle, Square, Pause, Play, Timer, Volume2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type RecordingMode = "voiceover" | "camera" | "screen" | "screen-camera" | "session";

interface RecordingModeOption {
  id: RecordingMode;
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
  bgColor: string;
}

const MODES: RecordingModeOption[] = [
  { id: "voiceover", icon: AudioLines, label: "Voiceover", description: "Record audio narration with your microphone", color: "text-purple-600", bgColor: "bg-purple-50" },
  { id: "camera", icon: Camera, label: "Camera", description: "Record video from your webcam", color: "text-blue-600", bgColor: "bg-blue-50" },
  { id: "screen", icon: Monitor, label: "Screen", description: "Capture your entire screen or a window", color: "text-emerald-600", bgColor: "bg-emerald-50" },
  { id: "screen-camera", icon: MonitorSmartphone, label: "Screen & Camera", description: "Screen recording with camera overlay", color: "text-amber-600", bgColor: "bg-amber-50" },
  { id: "session", icon: Radio, label: "Session", description: "Record a live session with guests", color: "text-rose-600", bgColor: "bg-rose-50" },
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
  const [selectedMode, setSelectedMode] = useState<RecordingMode | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [selectedMic, setSelectedMic] = useState("Default Microphone");
  const [selectedCamera, setSelectedCamera] = useState("Default Camera");
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Recording timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => setRecordingTime(prev => prev + 0.1), 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRecording, isPaused]);

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

  const handleStartRecording = useCallback(() => {
    if (!selectedMode) return;
    setCountdown(3);
    toast({ title: `Starting ${MODES.find(m => m.id === selectedMode)?.label} recording...` });
  }, [selectedMode]);

  const handlePauseResume = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  const handleStopRecording = useCallback(() => {
    setIsRecording(false);
    setIsPaused(false);
    const duration = Math.max(1, Math.round(recordingTime));
    onRecordingComplete(selectedMode!, duration);
    toast({ title: "Recording saved!", description: `${formatTime(recordingTime)} of ${MODES.find(m => m.id === selectedMode)?.label} recorded` });
    setSelectedMode(null);
    setRecordingTime(0);
    onClose();
  }, [recordingTime, selectedMode, onRecordingComplete, onClose]);

  const handleClose = useCallback(() => {
    if (isRecording) {
      handleStopRecording();
    } else {
      setSelectedMode(null);
      setRecordingTime(0);
      setCountdown(null);
      onClose();
    }
  }, [isRecording, handleStopRecording, onClose]);

  // Filter modes based on editor type
  const availableModes = editorType === "audio"
    ? MODES.filter(m => m.id === "voiceover" || m.id === "session")
    : MODES;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm" onClick={handleClose}>
      <div className="bg-background rounded-2xl shadow-2xl border border-foreground/[0.08] w-full max-w-2xl mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/[0.06]">
          <div>
            <h2 className="text-lg font-display font-bold">
              {isRecording ? "Recording in Progress" : countdown !== null ? "Get Ready..." : "Choose Recording Mode"}
            </h2>
            {!isRecording && countdown === null && (
              <p className="text-sm text-muted mt-0.5">Select how you want to record</p>
            )}
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-foreground/[0.04] text-muted hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Countdown overlay */}
        {countdown !== null && (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-accent/10 flex items-center justify-center animate-pulse">
                <span className="text-6xl font-display font-bold text-accent">{countdown}</span>
              </div>
              <p className="text-center text-muted text-sm mt-4">Recording starts in...</p>
            </div>
          </div>
        )}

        {/* Recording UI */}
        {isRecording && (
          <div className="px-6 py-8">
            {/* Timer */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-red-50 border border-red-100">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-3xl font-mono font-bold text-red-600">{formatTime(recordingTime)}</span>
                {isPaused && <span className="text-xs font-medium text-red-400 uppercase">Paused</span>}
              </div>
            </div>

            {/* Recording mode indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {(() => {
                const mode = MODES.find(m => m.id === selectedMode);
                if (!mode) return null;
                return (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${mode.bgColor}`}>
                    <mode.icon className={`w-4 h-4 ${mode.color}`} />
                    <span className={`text-sm font-medium ${mode.color}`}>{mode.label}</span>
                  </div>
                );
              })()}
            </div>

            {/* Audio level indicator */}
            <div className="flex items-center justify-center gap-1 mb-8 h-12">
              {Array.from({ length: 32 }, (_, i) => {
                const height = 20 + Math.random() * 80;
                return (
                  <div key={i} className="w-1.5 rounded-full bg-accent/60 transition-all" style={{ height: `${isPaused ? 15 : height}%`, animationDelay: `${i * 30}ms` }} />
                );
              })}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              {/* Mic toggle */}
              <button onClick={() => setMicEnabled(!micEnabled)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${micEnabled ? "bg-foreground/[0.06] text-foreground" : "bg-red-100 text-red-500"}`}>
                {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              {/* Pause/Resume */}
              <button onClick={handlePauseResume}
                className="w-14 h-14 rounded-full bg-foreground/[0.08] flex items-center justify-center text-foreground hover:bg-foreground/[0.12] transition-colors">
                {isPaused ? <Play className="w-6 h-6 ml-0.5" /> : <Pause className="w-6 h-6" />}
              </button>

              {/* Stop */}
              <button onClick={handleStopRecording}
                className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30">
                <Square className="w-6 h-6 fill-current" />
              </button>

              {/* Camera toggle (if applicable) */}
              {(selectedMode === "camera" || selectedMode === "screen-camera") && (
                <button onClick={() => setCameraEnabled(!cameraEnabled)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${cameraEnabled ? "bg-foreground/[0.06] text-foreground" : "bg-red-100 text-red-500"}`}>
                  {cameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>
              )}

              {/* Discard */}
              <button onClick={() => { setIsRecording(false); setIsPaused(false); setRecordingTime(0); setSelectedMode(null); }}
                className="w-12 h-12 rounded-full bg-foreground/[0.06] flex items-center justify-center text-muted hover:text-foreground hover:bg-foreground/[0.1] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Mode selection */}
        {!isRecording && countdown === null && (
          <div className="p-6">
            <div className="grid grid-cols-5 gap-3 mb-6">
              {availableModes.map(mode => (
                <button key={mode.id} onClick={() => setSelectedMode(mode.id)}
                  className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                    selectedMode === mode.id
                      ? "border-accent bg-accent/5 shadow-sm"
                      : "border-foreground/[0.06] hover:border-foreground/[0.15]"
                  }`}>
                  <div className={`w-14 h-14 rounded-xl ${mode.bgColor} flex items-center justify-center`}>
                    <mode.icon className={`w-7 h-7 ${mode.color}`} />
                  </div>
                  <span className="text-sm font-medium text-center">{mode.label}</span>
                </button>
              ))}
            </div>

            {/* Selected mode details */}
            {selectedMode && (
              <div className="bg-foreground/[0.02] rounded-xl border border-foreground/[0.06] p-4 mb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-sm">{MODES.find(m => m.id === selectedMode)?.label}</h3>
                    <p className="text-xs text-muted mt-1">{MODES.find(m => m.id === selectedMode)?.description}</p>
                  </div>
                  <button onClick={() => setShowSettings(!showSettings)}
                    className="p-2 rounded-lg hover:bg-foreground/[0.04] text-muted hover:text-foreground transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>

                {/* Settings panel */}
                {showSettings && (
                  <div className="mt-4 pt-4 border-t border-foreground/[0.06] space-y-3">
                    {/* Microphone */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4 text-muted" />
                        <span className="text-xs font-medium">Microphone</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setMicEnabled(!micEnabled)}
                          className={`w-8 h-5 rounded-full transition-colors relative ${micEnabled ? "bg-accent" : "bg-foreground/[0.15]"}`}>
                          <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all ${micEnabled ? "left-[14px]" : "left-[3px]"}`} />
                        </button>
                        <span className="text-xs text-muted w-36 truncate">{selectedMic}</span>
                      </div>
                    </div>

                    {/* Camera (if applicable) */}
                    {(selectedMode === "camera" || selectedMode === "screen-camera") && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Camera className="w-4 h-4 text-muted" />
                          <span className="text-xs font-medium">Camera</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setCameraEnabled(!cameraEnabled)}
                            className={`w-8 h-5 rounded-full transition-colors relative ${cameraEnabled ? "bg-accent" : "bg-foreground/[0.15]"}`}>
                            <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm absolute top-0.5 transition-all ${cameraEnabled ? "left-[14px]" : "left-[3px]"}`} />
                          </button>
                          <span className="text-xs text-muted w-36 truncate">{selectedCamera}</span>
                        </div>
                      </div>
                    )}

                    {/* Countdown */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-muted" />
                        <span className="text-xs font-medium">Countdown</span>
                      </div>
                      <span className="text-xs text-muted">3 seconds</span>
                    </div>

                    {/* Audio quality */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-muted" />
                        <span className="text-xs font-medium">Audio Quality</span>
                      </div>
                      <span className="text-xs text-muted">48kHz / 24-bit</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Start button */}
            <button onClick={handleStartRecording} disabled={!selectedMode}
              className={`w-full py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                selectedMode
                  ? "bg-accent text-white hover:bg-accent/90"
                  : "bg-foreground/[0.06] text-muted cursor-not-allowed"
              }`}>
              <Circle className="w-4 h-4 fill-current" />
              Start Recording
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecordingModeModal;

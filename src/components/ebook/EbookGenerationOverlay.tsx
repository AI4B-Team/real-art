import { useState, useEffect, useMemo } from "react";
import {
  BookOpen, FileText, ImageIcon, Palette, CheckCircle2,
  Loader2, Sparkles, PenLine, List, LayoutGrid, Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GenerationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  duration: number;
  microcopy: string[];
}

const GENERATION_STEPS: GenerationStep[] = [
  { id: "outline", title: "Creating Outline", description: "Building the structure and chapter framework for your book...", icon: List, duration: 2500, microcopy: ["Structuring your chapters…", "Mapping your ideas…", "Building the foundation…"] },
  { id: "toc", title: "Generating Table of Contents", description: "Organizing chapters and sections into a navigable index...", icon: FileText, duration: 2000, microcopy: ["Organizing your sections…", "Creating navigation…", "Indexing your content…"] },
  { id: "content", title: "Writing Content", description: "Crafting engaging content for each chapter...", icon: PenLine, duration: 4000, microcopy: ["Crafting your narrative…", "Writing chapter details…", "Making your content flow…", "Polishing paragraphs…"] },
  { id: "images", title: "Generating Images", description: "Creating custom illustrations and visuals...", icon: ImageIcon, duration: 3000, microcopy: ["Designing illustrations…", "Creating visuals…", "Rendering graphics…"] },
  { id: "layout", title: "Designing Layout", description: "Arranging content with professional typography and spacing...", icon: LayoutGrid, duration: 2000, microcopy: ["Setting typography…", "Arranging pages…", "Optimizing spacing…"] },
  { id: "styling", title: "Applying Styles", description: "Adding finishing touches and visual polish...", icon: Palette, duration: 1500, microcopy: ["Adding finishing touches…", "Polishing your book…", "Final refinements…"] },
];

interface EbookGenerationOverlayProps {
  isGenerating: boolean;
  bookTitle: string;
  onComplete: () => void;
}

const RotatingMicrocopy = ({ texts }: { texts: string[] }) => {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setIndex(prev => (prev + 1) % texts.length), 2000);
    return () => clearInterval(interval);
  }, [texts.length]);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={index}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.3 }}
        className="text-xs text-gray-500 italic block mt-1"
      >
        {texts[index]}
      </motion.span>
    </AnimatePresence>
  );
};

const EbookGenerationOverlay = ({ isGenerating, bookTitle, onComplete }: EbookGenerationOverlayProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStepIndex(0);
      setCompletedSteps(new Set());
      setOverallProgress(0);
      return;
    }

    let stepIndex = 0;
    let totalElapsed = 0;
    const totalDuration = GENERATION_STEPS.reduce((acc, step) => acc + step.duration, 0);

    const runStep = () => {
      if (stepIndex >= GENERATION_STEPS.length) {
        setCurrentStepIndex(GENERATION_STEPS.length - 1);
        setOverallProgress(96);
        return;
      }
      setCurrentStepIndex(stepIndex);
      const step = GENERATION_STEPS[stepIndex];
      const progressEnd = ((totalElapsed + step.duration) / totalDuration) * 100;
      const progressInterval = setInterval(() => {
        setOverallProgress(prev => {
          const next = prev + 0.5;
          return next > progressEnd ? progressEnd : next;
        });
      }, step.duration / ((progressEnd - ((totalElapsed / totalDuration) * 100)) / 0.5));

      setTimeout(() => {
        clearInterval(progressInterval);
        setCompletedSteps(prev => new Set([...prev, step.id]));
        totalElapsed += step.duration;
        stepIndex++;
        runStep();
      }, step.duration);
    };

    runStep();
  }, [isGenerating, onComplete]);

  if (!isGenerating) return null;

  return (
    <div className="absolute inset-0 z-50 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm overflow-y-auto">
      <div className="max-w-2xl w-full mx-auto px-4 py-12 flex flex-col items-center min-h-full justify-center">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-1">Building Your eBook</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-2">"{bookTitle}"</p>
          <div className="inline-flex items-center gap-1.5 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>This usually takes 2–4 minutes</span>
          </div>
        </motion.div>

        {/* Steps */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-6">
          <div className="space-y-2">
            {GENERATION_STEPS.map((step, index) => {
              const isCompleted = completedSteps.has(step.id);
              const isCurrent = index === currentStepIndex;
              const isFuture = !isCompleted && !isCurrent;
              const StepIcon = step.icon;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${
                    isCurrent
                      ? "bg-primary/8 border border-primary/15"
                      : isCompleted
                      ? "bg-white/3"
                      : "opacity-35"
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    isCompleted
                      ? "bg-emerald-500/20 text-emerald-400"
                      : isCurrent
                      ? "bg-primary/20 text-primary"
                      : "bg-white/5 text-gray-600"
                  }`}>
                    {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </motion.div>
                    ) : isCurrent ? (
                      <motion.div
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </motion.div>
                    ) : (
                      <StepIcon className="w-5 h-5" />
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-medium text-sm ${
                        isCurrent ? "text-white" : isCompleted ? "text-gray-400" : "text-gray-600"
                      }`}>{step.title}</h3>
                      {isCurrent && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-[10px] text-primary/70 font-medium uppercase tracking-wider"
                        >
                          In Progress
                        </motion.span>
                      )}
                    </div>
                    <AnimatePresence>
                      {isCurrent && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <RotatingMicrocopy texts={step.microcopy} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Done badge */}
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 15 }}
                      className="flex items-center gap-1 text-emerald-400"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">Done</span>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Shimmer bar on active step */}
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Overall Progress:</span>
            <span className="text-white font-medium ml-1">{Math.round(overallProgress)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden relative">
            <motion.div
              className="h-full bg-gradient-to-r from-primary/90 to-primary/60 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.3 }}
            />
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              style={{ width: "50%" }}
            />
          </div>
        </div>

        {/* Floating sparkles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div key={i} className="absolute" initial={{ x: Math.random() * 100 + "%", y: Math.random() * 100 + "%", opacity: 0, scale: 0 }} animate={{ opacity: [0, 0.6, 0], scale: [0, 1, 0], y: [null, "-20%"] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.7, ease: "easeOut" }}>
              <Sparkles className="w-4 h-4 text-primary/30" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EbookGenerationOverlay;

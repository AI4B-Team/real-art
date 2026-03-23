import { useState, useEffect } from "react";
import {
  BookOpen, FileText, ImageIcon, Palette, CheckCircle2,
  Loader2, Sparkles, PenLine, List, LayoutGrid,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GenerationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  duration: number;
}

const GENERATION_STEPS: GenerationStep[] = [
  { id: "outline", title: "Creating Outline", description: "Building the structure and chapter framework for your book...", icon: List, duration: 2500 },
  { id: "toc", title: "Generating Table of Contents", description: "Organizing chapters and sections into a navigable index...", icon: FileText, duration: 2000 },
  { id: "content", title: "Writing Content", description: "Crafting engaging content for each chapter...", icon: PenLine, duration: 4000 },
  { id: "images", title: "Generating Images", description: "Creating custom illustrations and visuals...", icon: ImageIcon, duration: 3000 },
  { id: "layout", title: "Designing Layout", description: "Arranging content with professional typography and spacing...", icon: LayoutGrid, duration: 2000 },
  { id: "styling", title: "Applying Styles", description: "Adding finishing touches and visual polish...", icon: Palette, duration: 1500 },
];

interface EbookGenerationOverlayProps {
  isGenerating: boolean;
  bookTitle: string;
  onComplete: () => void;
}

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
        setOverallProgress(100);
        setTimeout(() => onComplete(), 500);
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
    <div className="absolute inset-0 z-50 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-sm flex items-center justify-center">
      <div className="max-w-2xl w-full mx-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/80 mb-4 shadow-lg shadow-accent/30">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Building Your eBook</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">"{bookTitle}"</p>
        </motion.div>

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-6">
          <div className="space-y-3">
            {GENERATION_STEPS.map((step, index) => {
              const isCompleted = completedSteps.has(step.id);
              const isCurrent = index === currentStepIndex;
              const StepIcon = step.icon;
              return (
                <motion.div key={step.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-300 ${isCurrent ? "bg-accent/20 border border-accent/30" : isCompleted ? "bg-white/5" : "opacity-50"}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${isCompleted ? "bg-accent text-white" : isCurrent ? "bg-accent/30 text-accent" : "bg-white/10 text-gray-500"}`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : isCurrent ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}><Loader2 className="w-5 h-5" /></motion.div> : <StepIcon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-medium ${isCompleted || isCurrent ? "text-white" : "text-gray-500"}`}>{step.title}</h3>
                      {isCurrent && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-accent font-medium">In Progress...</motion.span>}
                    </div>
                    <AnimatePresence>
                      {isCurrent && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="text-sm text-gray-400 mt-0.5">{step.description}</motion.p>}
                    </AnimatePresence>
                  </div>
                  {isCompleted && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-xs text-accent font-medium">Done</motion.span>}
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Overall Progress</span>
            <span className="text-accent font-medium">{Math.round(overallProgress)}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-accent to-accent/80 rounded-full" initial={{ width: 0 }} animate={{ width: `${overallProgress}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div key={i} className="absolute" initial={{ x: Math.random() * 100 + "%", y: Math.random() * 100 + "%", opacity: 0, scale: 0 }} animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], y: [null, "-20%"] }} transition={{ duration: 2, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}>
              <Sparkles className="w-4 h-4 text-accent/50" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EbookGenerationOverlay;
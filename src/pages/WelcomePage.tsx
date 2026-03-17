import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles, Upload, FolderPlus, Compass, ArrowRight,
  Check, Image, Video, Music, ChevronRight, Star,
} from "lucide-react";
import PageShell from "@/components/PageShell";

const samplePhotos = [
  "photo-1618005182384-a83a8bd57fbe",
  "photo-1579546929518-9e396f3cc809",
  "photo-1604881991720-f91add269bed",
  "photo-1557682250-33bd709cbe85",
  "photo-1501854140801-50d01698950b",
  "photo-1543722530-d2c3201371e7",
];

interface Step {
  id: string;
  number: number;
  icon: typeof Upload;
  title: string;
  description: string;
  cta: string;
  secondaryCta?: string;
  to: string;
  secondaryTo?: string;
  color: string;
  bg: string;
  border: string;
}

const steps: Step[] = [
  {
    id: "upload",
    number: 1,
    icon: Upload,
    title: "Upload or generate your first piece",
    description: "Add an image, video, or music track — or generate one with AI in seconds.",
    cta: "Upload Art",
    secondaryCta: "Generate with AI",
    to: "/upload",
    secondaryTo: "/create?type=image",
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-950/40",
    border: "border-violet-200 dark:border-violet-800/40",
  },
  {
    id: "collection",
    number: 2,
    icon: FolderPlus,
    title: "Create your first collection",
    description: "Group your work into public galleries or private vaults — set your own pricing and access codes.",
    cta: "Create a Collection",
    secondaryCta: "Skip for now",
    to: "/collections",
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
  },
  {
    id: "explore",
    number: 3,
    icon: Compass,
    title: "Discover what others are making",
    description: "Browse 2.4M+ AI-generated images, videos, and music. Save anything to your boards.",
    cta: "Start Exploring",
    to: "/explore",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-950/40",
    border: "border-blue-200 dark:border-blue-800/40",
  },
];

const WelcomePage = () => {
  const navigate = useNavigate();
  const [completedSteps, setCompletedSteps] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("ra_onboard_done") || "[]");
    } catch {
      return [];
    }
  });

  const username = (() => {
    try { return localStorage.getItem("ra_display") || ""; } catch { return ""; }
  })();

  const allDone = completedSteps.length >= steps.length;

  useEffect(() => {
    try {
      localStorage.setItem("ra_onboard_done", JSON.stringify(completedSteps));
    } catch {}
  }, [completedSteps]);

  const markDone = (stepId: string) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps(prev => [...prev, stepId]);
    }
  };

  const handleSkipSetup = () => {
    try {
      localStorage.setItem("ra_onboard_skipped", "1");
    } catch {}
    navigate("/explore");
  };

  const handleGoToDashboard = () => {
    try {
      localStorage.removeItem("ra_new_user");
      localStorage.setItem("ra_onboard_skipped", "1");
    } catch {}
    navigate("/dashboard");
  };

  return (
    <PageShell>
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1fr_420px]">
        {/* Left — Steps */}
        <div className="px-6 md:px-12 lg:px-16 py-16 max-w-[720px]">
          {/* Header */}
          <div className="flex items-center gap-2 text-accent text-[0.82rem] font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Welcome to REAL ART
          </div>

          {username ? (
            <h1 className="font-display text-[2.4rem] font-black tracking-[-0.03em] leading-[1.08] mb-2">
              Hey {username.split(" ")[0]},<br />
              let's get you set up.
            </h1>
          ) : (
            <h1 className="font-display text-[2.4rem] font-black tracking-[-0.03em] leading-[1.08] mb-2">
              You're in.<br />
              Let's get started.
            </h1>
          )}

          <p className="text-[0.88rem] text-muted mb-10">
            Three things to do first — takes about 2 minutes.
          </p>

          {/* Steps */}
          <div className="flex flex-col gap-4">
            {steps.map((step, i) => {
              const done = completedSteps.includes(step.id);
              const locked = i > 0 && !completedSteps.includes(steps[i - 1].id);

              return (
                <div
                  key={step.id}
                  className={`rounded-2xl border p-6 transition-all ${
                    done
                      ? "border-foreground/[0.06] bg-foreground/[0.02] opacity-60"
                      : locked
                      ? `${step.border} ${step.bg} opacity-40 pointer-events-none`
                      : `${step.border} ${step.bg}`
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Step number / check */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[0.82rem] font-bold ${
                      done
                        ? "bg-green-500 text-white"
                        : `bg-foreground/[0.06] ${step.color}`
                    }`}>
                      {done ? <Check className="w-5 h-5 text-white" /> : step.number}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[0.72rem] font-semibold text-muted uppercase tracking-wider">
                          Step {step.number}
                        </span>
                        {done && (
                          <span className="text-[0.72rem] font-semibold text-green-500">Done</span>
                        )}
                      </div>

                      <h3 className="font-display text-[1.1rem] font-bold tracking-[-0.02em] mb-1">
                        {step.title}
                      </h3>
                      <p className="text-[0.84rem] text-muted leading-[1.55] mb-4">
                        {step.description}
                      </p>

                      {!done && !locked && (
                        <div className="flex items-center gap-3 flex-wrap">
                          <Link
                            to={step.to}
                            onClick={() => markDone(step.id)}
                            className="flex items-center gap-1.5 bg-foreground text-primary-foreground px-5 py-2.5 rounded-xl text-[0.84rem] font-semibold hover:bg-accent transition-colors no-underline"
                          >
                            {step.cta} <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                          {step.secondaryCta && (
                            step.secondaryTo ? (
                              <Link
                                to={step.secondaryTo}
                                onClick={() => markDone(step.id)}
                                className="text-[0.82rem] font-medium text-muted hover:text-foreground transition-colors no-underline"
                              >
                                {step.secondaryCta}
                              </Link>
                            ) : (
                              <button
                                onClick={() => markDone(step.id)}
                                className="text-[0.82rem] font-medium text-muted hover:text-foreground transition-colors"
                              >
                                {step.secondaryCta}
                              </button>
                            )
                          )}
                        </div>
                      )}

                      {done && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              const nextStep = steps[i + 1];
                              if (nextStep && !completedSteps.includes(nextStep.id)) {
                                // scroll or focus next
                              }
                            }}
                            className="flex items-center gap-1.5 bg-foreground text-primary-foreground px-5 py-2.5 rounded-xl text-[0.84rem] font-semibold hover:bg-accent transition-colors"
                          >
                            Next Step <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[0.82rem] text-muted">
                {completedSteps.length} of {steps.length} complete
              </span>
              <span className="text-[0.82rem] font-semibold">
                {Math.round((completedSteps.length / steps.length) * 100)}%
              </span>
            </div>
            <div className="h-1.5 bg-foreground/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
              />
            </div>

            {allDone ? (
              <button
                onClick={handleGoToDashboard}
                className="flex items-center justify-center gap-2 w-full bg-foreground text-primary-foreground py-3.5 rounded-xl text-[0.9rem] font-semibold hover:bg-accent transition-colors mt-6"
              >
                <Star className="w-4 h-4" /> Go to My Dashboard
              </button>
            ) : (
              <button
                onClick={handleSkipSetup}
                className="w-full text-center text-[0.82rem] text-muted hover:text-foreground transition-colors mt-4"
              >
                Skip setup — explore first
              </button>
            )}
          </div>
        </div>

        {/* Right — Mosaic preview */}
        <div className="hidden lg:block relative bg-foreground overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-2 gap-1.5 p-1.5 opacity-40">
            {samplePhotos.map((p, i) => (
              <img
                key={i}
                src={`https://images.unsplash.com/${p}?w=400&h=500&fit=crop&q=75`}
                alt=""
                className="w-full h-full object-cover rounded-lg"
              />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/60 to-foreground/30" />
          <div className="absolute bottom-0 left-0 right-0 p-10">
            <div className="flex items-center gap-2 mb-4">
              {[Image, Video, Music].map((Icon, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary-foreground/60" />
                </div>
              ))}
            </div>
            <div className="font-display text-[1.6rem] font-black text-primary-foreground tracking-[-0.03em] leading-[1.1] mb-2">
              2.4M+ pieces of AI art
            </div>
            <p className="text-[0.84rem] text-primary-foreground/50 mb-4">
              Free to download, remix, and build on
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-primary-foreground/70 hover:text-primary-foreground transition-colors no-underline"
            >
              Browse now <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default WelcomePage;

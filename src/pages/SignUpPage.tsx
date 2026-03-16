import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Download, DollarSign, Users, Eye, EyeOff } from "lucide-react";
import PageShell from "@/components/PageShell";

const photos = [
  "photo-1618005182384-a83a8bd57fbe",
  "photo-1579546929518-9e396f3cc809",
  "photo-1604881991720-f91add269bed",
  "photo-1557682250-33bd709cbe85",
  "photo-1501854140801-50d01698950b",
  "photo-1543722530-d2c3201371e7",
];

const perks = [
  { icon: Download, text: "Download 2.4M+ free images — no watermarks, ever" },
  { icon: DollarSign, text: "Earn from your shop links + platform referrals. You keep 100%." },
  { icon: Users, text: "Build collections, join communities, enter challenges" },
];

const SignUpPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "details" | "done">("email");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = () => {
    if (!email.includes("@")) { setErrors({ email: "Please enter a valid email" }); return false; }
    setErrors({}); return true;
  };

  const getStrength = () => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  };

  const strengthLabel = ["Weak", "Fair", "Strong"][getStrength() - 1] || "Weak";
  const strengthColors = ["bg-red-500", "bg-yellow-500", "bg-green-500"];

  const validateDetails = () => {
    const e: Record<string, string> = {};
    if (username.length < 3) e.username = "Username must be at least 3 characters";
    if (password.length < 8) e.password = "Password must be at least 8 characters";
    if (!agreed) e.agreed = "You must agree to the terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <PageShell>
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Left — Photo Collage */}
        <div className="hidden lg:block relative bg-foreground overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-3 gap-1.5 p-1.5 opacity-40">
            {photos.map((p, i) => (
              <img key={i} src={`https://images.unsplash.com/${p}?w=400&h=500&fit=crop&q=75`} alt="" className="w-full h-full object-cover rounded-lg" />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/60 to-foreground/30" />
          <div className="absolute bottom-0 left-0 right-0 p-12">
            <div className="font-display text-[2.4rem] font-black text-primary-foreground tracking-[-0.03em] leading-[1.08] mb-2">
              Everything Free.
            </div>
            <div className="font-display text-[2.4rem] font-black text-accent tracking-[-0.03em] leading-[1.08] mb-8">
              Creators Paid.
            </div>
            <div className="flex flex-col gap-3">
              {perks.map((perk, i) => (
                <div key={i} className="flex items-center gap-3">
                  <perk.icon className="w-4 h-4 text-primary-foreground/40 shrink-0" />
                  <span className="text-[0.84rem] text-primary-foreground/70">{perk.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div className="flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-[420px]">
            {step === "email" && (
              <>
                <div className="font-display text-[1.8rem] font-black tracking-[-0.03em] leading-none mb-1">
                  <span className="text-accent">Real</span>.Art
                </div>
                <h1 className="font-display text-[2.2rem] font-black tracking-[-0.03em] leading-[1.05] mt-6 mb-2">
                  Join Free Today
                </h1>
                <p className="text-[0.88rem] text-muted mb-8">
                  Create your account and start downloading, uploading, and earning.
                </p>

                <label className="block text-[0.82rem] font-semibold mb-2">Email Address</label>
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && validateEmail() && setStep("details")}
                  className="w-full px-4 py-3 rounded-xl bg-card border border-foreground/[0.1] text-[0.88rem] focus:outline-none focus:border-accent transition-colors mb-1"
                  placeholder="you@email.com"
                />
                {errors.email && <p className="text-[0.75rem] text-red-500 mb-3">{errors.email}</p>}

                <button
                  onClick={() => validateEmail() && setStep("details")}
                  className="w-full flex items-center justify-center gap-2 bg-foreground text-primary-foreground py-3.5 rounded-xl text-[0.9rem] font-semibold hover:bg-accent transition-colors mt-4 mb-5"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-foreground/[0.08]" />
                  <span className="text-[0.75rem] text-muted">or</span>
                  <div className="flex-1 h-px bg-foreground/[0.08]" />
                </div>

                {[
                  { label: "Continue with Google", logo: "G" },
                  { label: "Continue with Apple", logo: "⌘" },
                ].map(btn => (
                  <button key={btn.label} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-foreground/[0.1] text-[0.86rem] font-medium hover:border-foreground/30 transition-colors mb-2.5">
                    <span className="w-6 h-6 rounded-full bg-foreground/[0.06] flex items-center justify-center text-[0.72rem] font-bold">{btn.logo}</span>
                    {btn.label}
                  </button>
                ))}

                <p className="text-center text-[0.82rem] text-muted mt-6">
                  Already Have An Account?{" "}
                  <Link to="/login" className="text-accent font-semibold hover:underline">Log In</Link>
                </p>
              </>
            )}

            {step === "details" && (
              <>
                <button onClick={() => setStep("email")} className="text-[0.8rem] text-muted hover:text-foreground transition-colors mb-4 flex items-center gap-1">
                  ← Back
                </button>
                <h1 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-[1.05] mb-2">
                  Set Up Your Account
                </h1>
                <p className="text-[0.84rem] text-muted mb-8">
                  Creating account for <strong className="text-foreground">{email}</strong>
                </p>

                <label className="block text-[0.82rem] font-semibold mb-2">Username</label>
                <div className="relative mb-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-[0.88rem]">@</span>
                  <input
                    type="text" value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ""))}
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-card border border-foreground/[0.1] text-[0.88rem] focus:outline-none focus:border-accent transition-colors"
                    placeholder="username"
                  />
                </div>
                {errors.username && <p className="text-[0.75rem] text-red-500 mb-3">{errors.username}</p>}

                <label className="block text-[0.82rem] font-semibold mb-2 mt-4">Password</label>
                <div className="relative mb-1">
                  <input
                    type={showPass ? "text" : "password"} value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-foreground/[0.1] text-[0.88rem] focus:outline-none focus:border-accent transition-colors pr-12"
                    placeholder="Min 8 characters"
                  />
                  <button onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="flex items-center gap-2 mb-1 mt-2">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= getStrength() ? strengthColors[getStrength() - 1] : "bg-foreground/[0.08]"}`} />
                      ))}
                    </div>
                    <span className="text-[0.72rem] text-muted">{strengthLabel}</span>
                  </div>
                )}
                {errors.password && <p className="text-[0.75rem] text-red-500 mb-3">{errors.password}</p>}

                <div className="flex items-start gap-3 mt-5 mb-1">
                  <button onClick={() => setAgreed(!agreed)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${agreed ? "bg-foreground border-foreground" : "border-foreground/20"}`}>
                    {agreed && <Check className="w-3 h-3 text-primary-foreground" />}
                  </button>
                  <p className="text-[0.82rem] text-muted">
                    I agree to the{" "}
                    <Link to="/terms" className="text-accent hover:underline">Terms of Service</Link>
                    {" "}and{" "}
                    <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
                  </p>
                </div>
                {errors.agreed && <p className="text-[0.75rem] text-red-500 mb-3">{errors.agreed}</p>}

                <button
                  onClick={() => { if (validateDetails()) { try { localStorage.setItem("ra_auth", "1"); localStorage.setItem("ra_username", username); const display = username.replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase()); localStorage.setItem("ra_display", display); window.dispatchEvent(new Event("ra_auth_changed")); } catch {} setStep("done"); } }}
                  className="w-full bg-foreground text-primary-foreground py-3.5 rounded-xl text-[0.9rem] font-semibold hover:bg-accent transition-colors mt-5 mb-5"
                >
                  Create Account — Free
                </button>

                <p className="text-center text-[0.82rem] text-muted">
                  Already Have An Account?{" "}
                  <Link to="/login" className="text-accent font-semibold hover:underline">Log In</Link>
                </p>
              </>
            )}

            {step === "done" && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
                  <Check className="w-9 h-9 text-accent" />
                </div>
                <h1 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-[1.05] mb-3">Welcome To REAL ART</h1>
                <p className="text-[0.88rem] text-muted mb-8">Your account is ready. Start browsing, downloading, or upload your first image.</p>
                <button onClick={() => navigate("/explore")} className="w-full bg-foreground text-primary-foreground py-3.5 rounded-xl text-[0.9rem] font-semibold hover:bg-accent transition-colors mb-3">
                  Start Browsing
                </button>
                <button onClick={() => navigate("/upload")} className="w-full border border-foreground/[0.14] py-3.5 rounded-xl text-[0.9rem] font-medium hover:border-foreground/30 transition-colors">
                  Upload My First Image
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default SignUpPage;
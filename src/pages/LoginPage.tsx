import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import MinimalHeader from "@/components/MinimalHeader";
import LanguageSelector from "@/components/LanguageSelector";

const recentImages = [
  "photo-1618005182384-a83a8bd57fbe",
  "photo-1557682250-33bd709cbe85",
  "photo-1541701494587-cb58502866ab",
  "photo-1579546929518-9e396f3cc809",
  "photo-1604881991720-f91add269bed",
  "photo-1549880338-65ddcdfd017b",
];

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [lastUsedMethod, setLastUsedMethod] = useState<string>(() => {
    try { return localStorage.getItem("ra_last_login_method") || ""; } catch { return ""; }
  });

  const handleLogin = () => {
    const e: Record<string, string> = {};
    if (!email.includes("@")) e.email = "Please enter a valid email";
    if (password.length < 1) e.password = "Please enter your password";
    setErrors(e);
    if (Object.keys(e).length === 0) {
      try {
        localStorage.setItem("ra_auth", "1");
        localStorage.setItem("ra_last_login_method", "email");
        // Reset app tabs to only Create on login
        localStorage.setItem("ra_app_tabs", JSON.stringify(["create"]));
        // Set username/display from email if not already set from signup
        if (!localStorage.getItem("ra_username")) {
          const username = email.split("@")[0].replace(/[^a-zA-Z0-9._]/g, "").toLowerCase();
          localStorage.setItem("ra_username", username);
          const display = username.replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
          localStorage.setItem("ra_display", display);
        }
        window.dispatchEvent(new Event("ra_auth_changed"));
      } catch {}
      navigate("/home");
    }
  };

  return (
    <PageShell>
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Left — Photo Collage */}
        <div className="hidden lg:block relative bg-foreground overflow-hidden">
          <div className="absolute inset-0 grid grid-cols-3 gap-1.5 p-1.5 opacity-40">
            {recentImages.map((p, i) => (
              <img key={i} src={`https://images.unsplash.com/${p}?w=400&h=500&fit=crop&q=75`} alt="" className="w-full h-full object-cover rounded-lg" />
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-foreground via-foreground/60 to-foreground/30" />
          <div className="absolute bottom-0 left-0 right-0 p-12">
            <div className="font-display text-[2.4rem] font-black text-primary-foreground tracking-[-0.03em] leading-[1.08] mb-2">
              2.4 Million Free Images.
            </div>
            <div className="font-display text-[2.4rem] font-black text-accent tracking-[-0.03em] leading-[1.08] mb-6">
              Zero Strings Attached.
            </div>
            <p className="text-[0.88rem] text-primary-foreground/50 leading-[1.65] max-w-[400px]">
              Log back in to access your galleries, check your affiliate earnings, and see what's new in the community.
            </p>
          </div>
        </div>

        {/* Right — Form */}
        <div className="relative flex items-center justify-center px-6 py-16">
          <div className="absolute top-6 right-6">
            <LanguageSelector />
          </div>
          <div className="w-full max-w-[420px]">
            {!showForgot ? (
              <>
                <h1 className="font-display text-[2.2rem] font-black tracking-[-0.03em] leading-[1.05] mb-2">
                  Welcome Back
                </h1>
                <p className="text-[0.88rem] text-muted mb-8">Log in to your REAL ART account.</p>

                <div className="relative">
                  {lastUsedMethod === "email" && (
                    <span className="absolute -top-1 right-0 text-[0.68rem] font-semibold bg-accent/[0.12] text-accent px-2 py-0.5 rounded-md">Last Used</span>
                  )}
                  <label className="block text-[0.82rem] font-semibold mb-2">Email Address</label>
                  <input
                    type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-foreground/[0.1] text-[0.88rem] focus:outline-none focus:border-accent transition-colors mb-1"
                    placeholder="you@email.com"
                  />
                </div>
                {errors.email && <p className="text-[0.75rem] text-red-500 mb-3">{errors.email}</p>}

                <div className="flex items-center justify-between mt-4 mb-2">
                  <label className="text-[0.82rem] font-semibold">Password</label>
                  <button onClick={() => { setShowForgot(true); setForgotEmail(email); }} className="text-[0.78rem] text-accent hover:underline">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative mb-1">
                  <input
                    type={showPass ? "text" : "password"} value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    className="w-full px-4 py-3 rounded-xl bg-card border border-foreground/[0.1] text-[0.88rem] focus:outline-none focus:border-accent transition-colors pr-12"
                    placeholder="Enter your password"
                  />
                  <button onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[0.75rem] text-red-500 mb-3">{errors.password}</p>}

                <button onClick={handleLogin} className="w-full flex items-center justify-center gap-2 bg-foreground text-primary-foreground py-3.5 rounded-xl text-[0.9rem] font-semibold hover:bg-accent transition-colors mt-5 mb-5">
                  Log In <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-foreground/[0.08]" />
                  <span className="text-[0.75rem] text-muted">or</span>
                  <div className="flex-1 h-px bg-foreground/[0.08]" />
                </div>

                {[
                  { label: "Continue with Google", logo: "G", method: "google" },
                  { label: "Continue with Apple", logo: "⌘", method: "apple" },
                ].map(btn => (
                  <button key={btn.label} onClick={() => { localStorage.setItem("ra_last_login_method", btn.method); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-foreground/[0.1] text-[0.86rem] font-medium hover:border-foreground/30 transition-colors mb-2.5 relative">
                    <span className="w-6 h-6 rounded-full bg-foreground/[0.06] flex items-center justify-center text-[0.72rem] font-bold">{btn.logo}</span>
                    {btn.label}
                    {lastUsedMethod === btn.method && (
                      <span className="ml-auto text-[0.68rem] font-semibold bg-accent/[0.12] text-accent px-2 py-0.5 rounded-md">Last Used</span>
                    )}
                  </button>
                ))}

                <p className="text-center text-[0.82rem] text-muted mt-6">
                  Don't Have An Account?{" "}
                  <Link to="/signup" className="text-accent font-semibold hover:underline">Join Free</Link>
                </p>
              </>
            ) : (
              <>
                <button onClick={() => setShowForgot(false)} className="text-[0.8rem] text-muted hover:text-foreground transition-colors mb-4 flex items-center gap-1">
                  ← Back To Login
                </button>
                <h1 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-[1.05] mb-2">Reset Password</h1>
                <p className="text-[0.88rem] text-muted mb-8">Enter your email and we'll send you a reset link.</p>

                {!forgotSent ? (
                  <>
                    <input
                      type="email" value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && setForgotSent(true)}
                      className="w-full px-4 py-3 rounded-xl bg-card border border-foreground/[0.1] text-[0.88rem] focus:outline-none focus:border-accent transition-colors mb-4"
                      placeholder="you@email.com"
                    />
                    <button onClick={() => forgotEmail.includes("@") && setForgotSent(true)} className="w-full bg-foreground text-primary-foreground py-3.5 rounded-xl text-[0.9rem] font-semibold hover:bg-accent transition-colors">
                      Send Reset Link
                    </button>
                  </>
                ) : (
                  <div className="text-center py-6">
                    <h2 className="font-display text-[1.4rem] font-black mb-2">Check Your Inbox</h2>
                    <p className="text-[0.84rem] text-muted mb-4">
                      We sent a password reset link to <strong className="text-foreground">{forgotEmail}</strong>. It expires in 1 hour.
                    </p>
                    <button onClick={() => { setShowForgot(false); setForgotSent(false); }} className="mt-4 text-[0.8rem] text-accent hover:underline">
                      Back To Login
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default LoginPage;
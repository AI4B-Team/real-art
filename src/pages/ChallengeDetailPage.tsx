import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, Clock, Users, Trophy, Heart, Upload, Shield, Check, ThumbsUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const challengeData = {
  id: "1", title: "Cyberpunk City", status: "live", daysLeft: 7, hours: 14, minutes: 32,
  entries: 1247, prize: "$5,000", category: "Sci-Fi",
  photo: "photo-1557682250-33bd709cbe85",
  desc: "Create the most stunning cyberpunk cityscape. Neon lights, flying cars, holographic ads — push the limits of futuristic urban imagination.",
  longDesc: "We want the full sensory experience of a city that could only exist in a hyper-connected, hyper-commercial future. Think rain-slicked streets reflecting a thousand neon signs. Think monorails threading between skyscrapers wrapped in living advertisement. Think humanity crammed into every vertical inch of space, each window its own story.\n\nThis is your canvas. Make it overwhelming. Make it beautiful. Make it feel real.",
  prizes: [
    { place: "1st Place", amount: "$5,000", extras: "+ REAL CREATOR Pro (1 year) + Featured on homepage for 30 days" },
    { place: "2nd Place", amount: "$1,500", extras: "+ REAL CREATOR Pro (6 months)" },
    { place: "3rd Place", amount: "$750", extras: "+ REAL CREATOR Pro (3 months)" },
    { place: "Top 10", amount: "Recognition", extras: "+ Community badge + Leaderboard points" },
  ],
  rules: [
    "Images must be original and generated specifically for this challenge",
    "All styles and AI tools welcome",
    "Up to 3 submissions per member",
    "Must be a free REAL ART member to enter",
    "Judged on creativity, technical execution, and thematic adherence",
    "Winners announced 7 days after challenge closes",
  ],
};

const entryPhotos = [
  "photo-1557682250-33bd709cbe85","photo-1541701494587-cb58502866ab",
  "photo-1618005182384-a83a8bd57fbe","photo-1576091160550-2173dba999ef",
  "photo-1462275646964-a0e3386b89fa","photo-1547036967-23d11aacaee0",
  "photo-1579546929518-9e396f3cc809","photo-1505765050516-f72dcac9c60e",
  "photo-1506905925346-21bda4d32df4","photo-1505765050516-f72dcac9c60e",
  "photo-1549880338-65ddcdfd017b","photo-1567360425618-1594206637d2",
];
const heights = [230, 190, 260, 205, 175, 240, 215, 180, 250, 195, 220, 165];
const creators = [
  { n: "AI.Verse", i: "AV", c: "#4361ee" }, { n: "NeoPixel", i: "NP", c: "#c9184a" },
  { n: "DreamForge", i: "DF", c: "#2a9d8f" }, { n: "LuminaAI", i: "LA", c: "#e76f51" },
];
const entryTabs = ["Top Entries", "Newest", "Most Liked"];

const ChallengeDetailPage = () => {
  const { id } = useParams();
  const c = challengeData;
  const [activeTab, setActiveTab] = useState("Top Entries");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Hero */}
        <div className="relative h-[320px] md:h-[420px] overflow-hidden">
          <img
            src={`https://images.unsplash.com/${c.photo}?w=1400&h=420&fit=crop&q=85`}
            alt={c.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 flex flex-col justify-end px-6 md:px-12 pb-10 max-w-[1440px] mx-auto">
            <div className="flex items-center gap-2 text-[0.78rem] text-white/60 mb-4">
              <Link to="/" className="hover:text-white transition-colors flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Home</Link>
              <ChevronRight className="w-3 h-3 opacity-40" />
              <Link to="/challenges" className="hover:text-white transition-colors">Challenges</Link>
              <ChevronRight className="w-3 h-3 opacity-40" />
              <span className="text-white">{c.title}</span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center gap-1.5 text-[0.68rem] font-bold tracking-[0.12em] uppercase bg-accent text-white px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" /> Live Challenge
              </span>
              <span className="text-[0.72rem] text-white/50">{c.category}</span>
            </div>
            <h1 className="font-display text-[2.8rem] md:text-[4rem] font-black text-white tracking-[-0.03em] leading-none mb-3">{c.title}</h1>
            <p className="text-[0.88rem] text-white/65 max-w-[560px] leading-[1.65]">{c.desc}</p>
          </div>
        </div>

        <div className="px-6 md:px-12 max-w-[1440px] mx-auto">
          {/* Stats + CTA bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-5 border-b border-foreground/[0.06]">
            <div className="flex flex-wrap items-center gap-6">
              <div className="text-center">
                <div className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none">
                  {c.daysLeft}<span className="text-[1rem] font-bold text-muted">d</span> {c.hours}<span className="text-[1rem] font-bold text-muted">h</span> {c.minutes}<span className="text-[1rem] font-bold text-muted">m</span>
                </div>
                <div className="text-[0.68rem] text-muted uppercase tracking-[0.1em]">Remaining</div>
              </div>
              <div className="w-px h-8 bg-foreground/[0.08]" />
              <div className="text-center">
                <div className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none">{c.entries.toLocaleString()}</div>
                <div className="text-[0.68rem] text-muted uppercase tracking-[0.1em]">Entries</div>
              </div>
              <div className="w-px h-8 bg-foreground/[0.08]" />
              <div className="text-center">
                <div className="font-display text-[2rem] font-black text-accent tracking-[-0.03em] leading-none">{c.prize}</div>
                <div className="text-[0.68rem] text-muted uppercase tracking-[0.1em]">Grand Prize</div>
              </div>
            </div>
            <button className="flex items-center gap-2 bg-foreground text-primary-foreground px-6 py-3 rounded-lg text-[0.86rem] font-semibold hover:bg-accent transition-colors">
              <Upload className="w-4 h-4" /> Submit Your Entry
            </button>
          </div>

          {/* Body */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-10 py-10">
            <div>
              {/* Description */}
              <h2 className="font-display text-[1.6rem] font-black tracking-[-0.03em] mb-4">The Brief</h2>
              {c.longDesc.split("\n").map((p, i) => (
                <p key={i} className="text-[0.88rem] text-muted leading-[1.75] mb-4">{p}</p>
              ))}

              {/* Entries */}
              <div className="mt-10">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-display text-[1.8rem] font-black tracking-[-0.03em]">Entries</h2>
                  <div className="flex items-center gap-1">
                    {entryTabs.map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1.5 rounded-md text-[0.78rem] font-medium transition-colors ${activeTab === tab ? "bg-foreground text-primary-foreground" : "text-muted hover:text-foreground"}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="masonry-grid">
                  {entryPhotos.map((photo, i) => {
                    const cr = creators[i % creators.length];
                    return (
                      <Link key={i} to={`/image/${i + 20}`} className="masonry-item rounded-xl overflow-hidden block cursor-pointer group relative">
                        <img
                          src={`https://images.unsplash.com/${photo}?w=400&h=${heights[i % heights.length]}&fit=crop&q=78`}
                          alt="" loading="lazy"
                          className="w-full block rounded-xl group-hover:scale-[1.03] transition-transform duration-300"
                          style={{ height: heights[i % heights.length], objectFit: "cover" }}
                        />
                        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3" style={{ background: "var(--gradient-overlay)" }}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full flex items-center justify-center text-[0.52rem] font-bold text-white" style={{ background: cr.c }}>{cr.i}</div>
                              <span className="text-[0.7rem] text-white/90">{cr.n}</span>
                            </div>
                            <button onClick={e => e.preventDefault()} className="w-6 h-6 rounded-full border-none bg-white/20 text-white flex items-center justify-center hover:bg-white/40 transition-colors">
                              <Heart className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-5">
              {/* Prizes */}
              <div className="bg-card border border-foreground/[0.08] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Trophy className="w-4 h-4 text-accent" />
                  <span className="font-semibold text-[0.9rem]">Prize Breakdown</span>
                </div>
                <div className="flex flex-col gap-3">
                  {c.prizes.map((p, i) => (
                    <div key={i} className={`rounded-lg p-3 ${i === 0 ? "bg-accent/10 border border-accent/20" : "bg-background border border-foreground/[0.06]"}`}>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-[0.82rem]">{p.place}</span>
                        <span className={`font-display font-black text-[1.1rem] tracking-[-0.02em] ${i === 0 ? "text-accent" : ""}`}>{p.amount}</span>
                      </div>
                      <p className="text-[0.72rem] text-muted leading-[1.5]">{p.extras}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rules */}
              <div className="bg-card border border-foreground/[0.08] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-4 h-4 text-accent" />
                  <span className="font-semibold text-[0.9rem]">Rules</span>
                </div>
                <div className="flex flex-col gap-2">
                  {c.rules.map((rule, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-[0.78rem] text-muted">
                      <Check className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                      {rule}
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="bg-foreground rounded-xl p-5 relative overflow-hidden">
                <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-10"
                  style={{ background: "radial-gradient(circle, hsl(11 80% 53%), transparent)" }} />
                <div className="font-display text-[1.3rem] font-black text-primary-foreground mb-2">Ready to enter?</div>
                <p className="text-[0.78rem] text-primary-foreground/50 leading-[1.6] mb-4">Free to enter. {c.daysLeft} days remaining. Up to 3 submissions.</p>
                <button className="w-full flex items-center justify-center gap-2 bg-accent text-primary-foreground text-[0.84rem] font-semibold py-2.5 rounded-lg hover:bg-accent/90 transition-colors">
                  <Upload className="w-4 h-4" /> Submit Entry
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default ChallengeDetailPage;

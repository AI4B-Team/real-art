import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, Trophy, Clock, Users, ArrowRight } from "lucide-react";
import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";

const challenges = [
  {
    id: "1", title: "Cyberpunk City", status: "live", daysLeft: 7, entries: 1247, prize: "$5,000",
    desc: "Create the most stunning cyberpunk cityscape. Neon lights, flying cars, holographic ads — push the limits of futuristic urban art.",
    photo: "photo-1557682250-33bd709cbe85", category: "Sci-Fi",
  },
  {
    id: "2", title: "Portraits of the Future", status: "live", daysLeft: 12, entries: 834, prize: "$2,500",
    desc: "AI-generated portraits from 100 years into the future. How will we look? What will we wear? Who will we be?",
    photo: "photo-1604881991720-f91add269bed", category: "Portraits",
  },
  {
    id: "3", title: "Enchanted Forest", status: "upcoming", daysLeft: 21, entries: 0, prize: "$3,000",
    desc: "Magical, bioluminescent, ancient. Create a forest that could only exist in dreams.",
    photo: "photo-1470071459604-3b5ec3a7fe05", category: "Fantasy",
  },
  {
    id: "4", title: "Abstract Emotions", status: "past", daysLeft: 0, entries: 2100, prize: "$1,500",
    desc: "Visualize a human emotion through pure abstract art. No figures, no words — just color, form, and feeling.",
    photo: "photo-1541701494587-cb58502866ab", category: "Abstract",
  },
  {
    id: "5", title: "Luxury Spaces", status: "past", daysLeft: 0, entries: 1680, prize: "$2,000",
    desc: "The most opulent interior imaginable. Limitless budget, limitless imagination.",
    photo: "photo-1600210492486-724fe5c67fb0", category: "Luxury",
  },
  {
    id: "6", title: "Sci-Fi Vehicles", status: "past", daysLeft: 0, entries: 3200, prize: "$4,000",
    desc: "Design a vehicle from a world 500 years from now. Air, land, sea, or space — your call.",
    photo: "photo-1549880338-65ddcdfd017b", category: "Sci-Fi",
  },
];

const winners = [
  { place: "1st", title: "Cosmic Dreams", creator: "@AI.Verse", challenge: "Abstract Emotions", prize: "$1,500", photo: "photo-1618005182384-a83a8bd57fbe" },
  { place: "2nd", title: "Neon Boulevard", creator: "@NeoPixel", challenge: "Abstract Emotions", prize: "$500", photo: "photo-1557682250-33bd709cbe85" },
  { place: "3rd", title: "Electric Soul", creator: "@DreamForge", challenge: "Abstract Emotions", prize: "$250", photo: "photo-1579546929518-9e396f3cc809" },
  { place: "1st", title: "Sky Palace", creator: "@LuminaAI", challenge: "Luxury Spaces", prize: "$2,000", photo: "photo-1600210492486-724fe5c67fb0" },
];

const tabsList = ["All", "Live", "Upcoming", "Past"];

const ChallengesPage = () => {
  const [activeTab, setActiveTab] = useState("All");
  const live = challenges.filter(c => c.status === "live");
  const filtered = activeTab === "All" ? challenges : challenges.filter(c => c.status === activeTab.toLowerCase());

  return (
    <PageShell>
        {/* Header */}
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none">Challenges</h1>
              <p className="text-[0.82rem] text-muted mt-1">Compete, create, and win. Open to all skill levels.</p>
            </div>
            <div className="flex items-center gap-1.5 text-[0.82rem] text-muted">
              <Trophy className="w-4 h-4 text-accent" />
              <span><strong className="text-foreground">$47,500</strong> awarded to date</span>
            </div>
          </div>
        </div>

        {/* Live challenges hero */}
        {live.length > 0 && (
          <div className="px-6 md:px-12 mb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[1440px] mx-auto">
              {live.map(c => (
                <Link key={c.id} to={`/challenges/${c.id}`} className="block no-underline group">
                  <div className="bg-foreground rounded-2xl overflow-hidden relative cursor-pointer hover:shadow-[0_24px_64px_rgba(0,0,0,0.25)] transition-shadow h-full min-h-[380px] flex flex-col">
                    <div className="absolute inset-0 opacity-20">
                      <img src={`https://images.unsplash.com/${c.photo}?w=700&h=400&fit=crop&q=80`} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="relative p-8 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-[0.68rem] font-bold tracking-[0.14em] uppercase text-accent mb-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-dot" />
                        Live Challenge · {c.daysLeft} days left
                      </div>
                      <h2 className="font-display text-[2rem] font-black text-white leading-none mb-3">{c.title}</h2>
                      <p className="text-[0.84rem] text-white/55 leading-[1.65] mb-6 max-w-[400px]">{c.desc}</p>
                      <div className="flex items-center gap-6 mb-6">
                        <div>
                          <div className="font-display text-[1.8rem] font-black text-accent tracking-[-0.03em] leading-none">{c.prize}</div>
                          <div className="text-[0.68rem] text-white/30 uppercase tracking-[0.1em]">Grand Prize</div>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div>
                          <div className="font-bold text-white text-[1.1rem]">{c.entries.toLocaleString()}</div>
                          <div className="text-[0.68rem] text-white/30 uppercase tracking-[0.1em]">Entries</div>
                        </div>
                      </div>
                      <div className="mt-auto">
                        <button className="inline-flex items-center gap-2 bg-white text-foreground px-5 py-2.5 rounded-lg text-[0.84rem] font-bold hover:bg-accent hover:text-white transition-colors">
                          Enter Now — Free <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="px-6 md:px-12 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-1 border-b border-foreground/[0.06] mb-7">
            {tabsList.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 text-[0.85rem] font-medium transition-colors border-b-2 -mb-px ${
                  activeTab === tab ? "border-foreground text-foreground" : "border-transparent text-muted hover:text-foreground"
                }`}
              >
                {tab}
                {tab === "Live" && <span className="ml-1.5 text-[0.65rem] font-bold bg-accent text-white px-1.5 py-0.5 rounded-full">{live.length}</span>}
              </button>
            ))}
          </div>

          {/* Challenge grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
            {filtered.map(c => (
              <Link key={c.id} to={`/challenges/${c.id}`} className="block no-underline group">
                <div className="bg-card border border-foreground/[0.08] rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.1)] transition-all">
                  <div className="h-[160px] relative">
                    <img src={`https://images.unsplash.com/${c.photo}?w=500&h=300&fit=crop&q=78`} alt="" className="w-full h-full object-cover" />
                    {c.status === "live" && (
                      <div className="absolute top-3 left-3 bg-accent text-white text-[0.62rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-[0.06em] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" /> Live
                      </div>
                    )}
                    {c.status === "upcoming" && (
                      <div className="absolute top-3 left-3 bg-foreground/80 text-white text-[0.62rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-[0.06em]">Coming Soon</div>
                    )}
                    {c.status === "past" && (
                      <div className="absolute top-3 left-3 bg-muted-foreground/60 text-white text-[0.62rem] font-bold px-2.5 py-1 rounded-full uppercase tracking-[0.06em]">Ended</div>
                    )}
                    <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[0.72rem] font-bold px-2.5 py-1 rounded-full">{c.prize}</div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[0.92rem] mb-1">{c.title}</h3>
                    <p className="text-[0.78rem] text-muted leading-[1.55] mb-3 line-clamp-2">{c.desc}</p>
                    <div className="flex items-center gap-3 text-[0.72rem] text-muted">
                      {c.status === "live" && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.daysLeft} days left</span>}
                      {c.status === "upcoming" && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Opens in {c.daysLeft} days</span>}
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c.entries > 0 ? `${c.entries.toLocaleString()} entries` : "Be first to enter"}</span>
                      <span>{c.category}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Past Winners */}
          <div className="mb-16">
            <h2 className="font-display text-[1.8rem] font-black tracking-[-0.03em] mb-2">Past Winners</h2>
            <p className="text-[0.82rem] text-muted mb-6">The best work from completed challenges</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {winners.map((w, i) => (
                <div key={i} className="bg-card border border-foreground/[0.08] rounded-xl overflow-hidden">
                  <div className="aspect-square relative">
                    <img src={`https://images.unsplash.com/${w.photo}?w=300&h=300&fit=crop&q=78`} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 bg-accent text-white text-[0.6rem] font-bold px-2 py-0.5 rounded-full">{w.place}</div>
                  </div>
                  <div className="p-3">
                    <div className="font-semibold text-[0.82rem]">{w.title}</div>
                    <div className="text-[0.72rem] text-muted">{w.creator.toLowerCase()} · {w.challenge}</div>
                    <div className="text-[0.72rem] font-bold text-accent mt-1">{w.prize}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
    </PageShell>
  );
};

export default ChallengesPage;

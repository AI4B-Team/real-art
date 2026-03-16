import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, Search, Clock, ArrowRight } from "lucide-react";
import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";

const categories = ["All", "Tutorials", "Product Updates", "Creator Stories", "Industry"];

const allPosts = [
  {
    title: "How to write prompts that actually work in 2026",
    excerpt: "The difference between a mediocre image and a stunning one is almost always the prompt. After analyzing 50,000+ downloads on REAL ART, we found the patterns that top creators use every time.",
    author: "Anya Reyes", authorInit: "AR", authorColor: "#c9184a",
    date: "March 10, 2026", readTime: "8 min read", category: "Tutorials", featured: true,
    photo: "photo-1618005182384-a83a8bd57fbe",
  },
  {
    title: "Introducing Private Collection Codes: your art, your rules",
    excerpt: "Today we're launching one of the most-requested features in REAL ART history. Lock your collection, share a code, control who sees your work.",
    author: "Marcus Cole", authorInit: "MC", authorColor: "#4361ee",
    date: "March 5, 2026", readTime: "4 min read", category: "Product Updates", featured: true,
    photo: "photo-1557682250-33bd709cbe85",
  },
  {
    title: "The $47,500 question: what we learned from running 12 challenges",
    excerpt: "We've paid out $47,500 in challenge prizes. Here's everything we learned about what makes a great challenge — and the creators who keep winning.",
    author: "Priya Shah", authorInit: "PS", authorColor: "#e76f51",
    date: "February 28, 2026", readTime: "6 min read", category: "Creator Stories", featured: true,
    photo: "photo-1541701494587-cb58502866ab",
  },
  {
    title: "Why we made the affiliate program automatic",
    excerpt: "Most affiliate programs require you to copy a link, add it to your bio, and remember to share it. We thought: what if you just uploaded an image and got paid? So we built that.",
    author: "Marcus Cole", authorInit: "MC", authorColor: "#4361ee",
    date: "February 20, 2026", readTime: "5 min read", category: "Product Updates",
    photo: "photo-1549880338-65ddcdfd017b",
  },
  {
    title: "Meet the creator who made $4,200 from a single image",
    excerpt: "AI.Verse uploaded a cosmic dreamscape in January. By February, it had been downloaded 12,000 times, generated 840 affiliate clicks, and earned him $4,200 in commissions.",
    author: "Dani Kim", authorInit: "DK", authorColor: "#f72585",
    date: "February 14, 2026", readTime: "7 min read", category: "Creator Stories",
    photo: "photo-1579546929518-9e396f3cc809",
  },
  {
    title: "Midjourney v7 vs DALL-E 4: which one actually wins?",
    excerpt: "We generated the same 50 prompts in both tools and had 200 REAL ART creators vote on the results. The winner might surprise you.",
    author: "Leo Vance", authorInit: "LV", authorColor: "#7209b7",
    date: "February 7, 2026", readTime: "10 min read", category: "Industry",
    photo: "photo-1604881991720-f91add269bed",
  },
  {
    title: "The anatomy of a perfect portfolio on REAL ART",
    excerpt: "What separates the creators with 500 followers from those with 50,000? We studied 100 top creator profiles and found five things they all do.",
    author: "Priya Shah", authorInit: "PS", authorColor: "#e76f51",
    date: "January 30, 2026", readTime: "9 min read", category: "Tutorials",
    photo: "photo-1506905925346-21bda4d32df4",
  },
  {
    title: "2025 in review: the numbers behind REAL ART's first year",
    excerpt: "1.2 million downloads. $284,000 paid to creators. 6 challenges. 12 product updates. Here's everything that happened in our first full year.",
    author: "Marcus Cole", authorInit: "MC", authorColor: "#4361ee",
    date: "January 15, 2026", readTime: "12 min read", category: "Product Updates",
    photo: "photo-1558618666-fcd25c85cd64",
  },
];

const BlogPage = () => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const featured = allPosts.filter(p => p.featured);
  const filtered = allPosts.filter(p => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchQ = !query || p.title.toLowerCase().includes(query.toLowerCase()) || p.excerpt.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Breadcrumb */}
        <div className="px-6 md:px-12 py-4 flex items-center gap-2 text-[0.8rem] text-muted max-w-[1440px] mx-auto">
          <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Home</Link>
          <ChevronRight className="w-3 h-3 opacity-30" />
          <span className="text-foreground">Blog</span>
        </div>

        {/* Hero */}
        <section className="px-6 md:px-12 pt-8 pb-10 max-w-[1440px] mx-auto">
          <div className="flex items-start md:items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-display text-[clamp(2.4rem,5vw,4.2rem)] font-black tracking-[-0.03em] leading-[1.02] mb-3">The REAL ART Blog</h1>
              <p className="text-[0.94rem] text-muted">Creator stories, product updates, tutorials, and ideas.</p>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search posts..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-card border border-foreground/[0.1] text-[0.84rem] focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>
        </section>

        {/* Featured */}
        <section className="px-6 md:px-12 pb-12 max-w-[1440px] mx-auto">
          <h2 className="font-display text-[1.6rem] font-black tracking-[-0.03em] mb-5">Featured posts</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featured.map(post => (
              <article key={post.title} className="bg-card border border-foreground/[0.08] rounded-xl overflow-hidden group cursor-pointer hover:border-foreground/20 transition-colors">
                <div className="aspect-[16/9] overflow-hidden">
                  <img src={`https://images.unsplash.com/${post.photo}?w=600&h=340&fit=crop&q=80`} alt={post.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[0.68rem] font-bold text-accent uppercase tracking-[0.1em]">{post.category}</span>
                    <span className="flex items-center gap-1 text-[0.7rem] text-muted"><Clock className="w-3 h-3" /> {post.readTime}</span>
                  </div>
                  <h3 className="font-display text-[1.1rem] font-black tracking-[-0.02em] leading-[1.25] mb-2 group-hover:text-accent transition-colors">{post.title}</h3>
                  <p className="text-[0.8rem] text-muted leading-[1.6] mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-[0.5rem] font-bold text-white" style={{ background: post.authorColor }}>{post.authorInit}</div>
                    <span className="text-[0.75rem] text-muted">{post.author} · {post.date}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Category Filter + Grid */}
        <section className="px-6 md:px-12 py-12 bg-card">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex items-center gap-2 mb-8 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`border px-4 py-1.5 rounded-lg text-[0.79rem] font-medium whitespace-nowrap transition-all ${activeCategory === cat ? "bg-foreground text-primary-foreground border-foreground" : "border-foreground/[0.12] text-muted hover:text-foreground hover:border-foreground/30"}`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(post => (
                <article key={post.title} className="bg-background border border-foreground/[0.06] rounded-xl p-5 group cursor-pointer hover:border-foreground/20 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[0.68rem] font-bold text-accent uppercase tracking-[0.1em]">{post.category}</span>
                    <span className="flex items-center gap-1 text-[0.68rem] text-muted"><Clock className="w-2.5 h-2.5" /> {post.readTime}</span>
                  </div>
                  <h3 className="font-display text-[1.05rem] font-black tracking-[-0.02em] leading-[1.3] mb-2 group-hover:text-accent transition-colors">{post.title}</h3>
                  <p className="text-[0.8rem] text-muted leading-[1.6] mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[0.45rem] font-bold text-white" style={{ background: post.authorColor }}>{post.authorInit}</div>
                      <span className="text-[0.72rem] text-muted">{post.author} · {post.date}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-accent transition-colors" />
                  </div>
                </article>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <h3 className="font-display text-[1.2rem] font-black mb-2">No posts found</h3>
                <p className="text-[0.84rem] text-muted">Try a different search term or category.</p>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter */}
        <section className="px-6 md:px-12 py-16 text-center max-w-[1440px] mx-auto">
          <h2 className="font-display text-[2rem] font-black tracking-[-0.03em] leading-none mb-3">Get it in your inbox</h2>
          <p className="text-[0.88rem] text-muted mb-6">New posts every week — creator stories, tutorials, and product news.</p>
          <div className="flex items-center gap-2 justify-center max-w-[420px] mx-auto">
            <input
              type="email"
              placeholder="you@email.com"
              className="flex-1 px-4 py-2.5 rounded-lg bg-card border border-foreground/[0.1] text-[0.84rem] focus:outline-none focus:border-accent transition-colors"
            />
            <button className="bg-foreground text-primary-foreground px-6 py-2.5 rounded-lg text-[0.84rem] font-semibold hover:bg-accent transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default BlogPage;
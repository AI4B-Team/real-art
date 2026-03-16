import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";

const sections = [
  { id: "acceptance", title: "1. Acceptance of terms", content: "By accessing or using REAL ART (\"the Platform\"), you agree to be bound by these Terms of Service (\"Terms\"). If you do not agree to these Terms, do not use the Platform.\n\nThese Terms apply to all visitors, users, and creators. We may update these Terms from time to time. Continued use of the Platform after changes are posted constitutes your acceptance of the updated Terms." },
  { id: "eligibility", title: "2. Eligibility", content: "You must be at least 13 years old to use REAL ART. If you are under 18, you represent that you have your parent or guardian's permission to use the Platform.\n\nBy creating an account, you represent that the information you provide is accurate and that you are authorized to agree to these Terms." },
  { id: "accounts", title: "3. Accounts", content: "You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.\n\nYou must notify us immediately of any unauthorized use of your account at support@realart.ai.\n\nWe reserve the right to suspend or terminate accounts that violate these Terms, engage in abusive behavior, or are used for fraudulent purposes." },
  { id: "upload", title: "4. Content you upload", content: "By uploading content to REAL ART, you represent and warrant that:\n\n(a) You own or have the necessary rights to the content you upload.\n(b) The content does not infringe any third-party intellectual property, privacy, or other rights.\n(c) The content does not violate any applicable law.\n(d) You have the right to grant REAL ART the license described below.\n\nYou grant REAL ART a worldwide, non-exclusive, royalty-free license to host, display, distribute, and promote your content on the Platform and in connection with the Platform's services.\n\nYou retain all ownership rights to your content. We do not claim ownership of anything you upload." },
  { id: "standards", title: "5. Content standards", content: "You agree not to upload content that:\n\n(a) Is sexually explicit or depicts nudity in a non-artistic context\n(b) Depicts or promotes violence, self-harm, or illegal activity\n(c) Harasses, defames, or targets real identifiable individuals\n(d) Infringes any third-party intellectual property rights\n(e) Contains malware, viruses, or malicious code\n(f) Violates the privacy or personal rights of others\n(g) Is deceptive, fraudulent, or misleading\n\nWe reserve the right to remove content that violates these standards without prior notice." },
  { id: "image-license", title: "6. Image license", content: "All images on REAL ART are made available under the REAL ART Free License. You may download and use any image for personal or commercial purposes without attribution or payment.\n\nThe full terms of the image license are available at realart.ai/license.\n\nThis license applies to images downloaded from the Platform. Separate terms may apply to premium prompt packs and other paid content." },
  { id: "affiliate", title: "7. Affiliate and shop link programs", content: "REAL ART offers two separate earning programs for creators:\n\n(a) Platform referral program. Creators earn commission when users they refer purchase REAL CREATOR subscriptions. Commission rates, tier thresholds, and payment schedules are described on the Earn page and may be updated from time to time.\n\n(b) External shop and affiliate links. Creators may attach external URLs to their images, including affiliate links from third-party networks (e.g., Etsy, Amazon, Gumroad). For these external links, commissions are paid directly by the third-party affiliate network to the creator. REAL ART does not take any percentage of external affiliate commissions.\n\n(c) FTC disclosure. Images with affiliate links are automatically flagged with a disclosure badge. Creators are responsible for ensuring their affiliate links comply with the terms of their respective affiliate networks.\n\n(d) Fraud. We reserve the right to suspend earnings if we detect fraudulent referral activity, including self-referrals, incentivized clicks, or bot-generated traffic. External affiliate link fraud is governed by each network's own policies." },
  { id: "galleries", title: "8. Private collections and access codes", content: "Creators may establish private collections accessible only via access codes. The creator (\"Collection Owner\") is solely responsible for:\n\n(a) The content they publish in private collections\n(b) Managing and distributing access codes responsibly\n(c) Ensuring that access code recipients are authorized users\n\nREAL ART is not responsible for unauthorized access resulting from misuse or distribution of access codes by the Collection Owner." },
  { id: "prohibited", title: "9. Prohibited conduct", content: "You agree not to:\n\n(a) Use the Platform for any unlawful purpose\n(b) Attempt to gain unauthorized access to accounts, systems, or data\n(c) Scrape, crawl, or use automated tools to extract data from the Platform without permission\n(d) Interfere with the proper functioning of the Platform\n(e) Impersonate any person or entity\n(f) Upload or distribute viruses or malicious code" },
  { id: "ip", title: "10. Intellectual property", content: "REAL ART's name, logo, design, and underlying software are our intellectual property. You may not reproduce, distribute, or create derivative works from our brand assets without express written permission.\n\nUser-uploaded content remains the property of the creator. REAL ART claims no ownership over uploaded images." },
  { id: "disclaimers", title: "11. Disclaimers", content: "THE PLATFORM IS PROVIDED \"AS IS\" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. REAL ART DOES NOT WARRANT THAT:\n\n(a) The Platform will be uninterrupted or error-free\n(b) Content on the Platform is accurate, complete, or current\n(c) The Platform or its servers are free of viruses or harmful components\n\nTO THE FULLEST EXTENT PERMITTED BY LAW, REAL ART DISCLAIMS ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT." },
  { id: "liability", title: "12. Limitation of liability", content: "TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, REAL ART SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR GOODWILL.\n\nREAL ART'S TOTAL LIABILITY FOR ANY CLAIMS ARISING UNDER THESE TERMS SHALL NOT EXCEED THE GREATER OF (A) $100 OR (B) THE AMOUNT YOU PAID TO REAL ART IN THE 12 MONTHS PRECEDING THE CLAIM." },
  { id: "termination", title: "13. Termination", content: "You may delete your account at any time through your account settings.\n\nWe may suspend or terminate your account at any time for violation of these Terms or for any other reason at our sole discretion. We will attempt to notify you before termination except in cases of serious violations.\n\nUpon termination, your right to use the Platform ceases. Content you've published may remain on the Platform at our discretion, but will be attributed to \"Anonymous\" if your account is deleted." },
  { id: "governing", title: "14. Governing law", content: "These Terms are governed by the laws of the State of California, without regard to its conflict of laws principles. Any disputes arising under these Terms shall be resolved in the state or federal courts located in San Francisco County, California." },
  { id: "contact", title: "15. Contact", content: "Questions about these Terms? Contact us at:\n\nEmail: legal@realart.ai\nAddress: REAL ART, Inc., 1234 Creator Ave, Suite 100, San Francisco, CA 94105" },
];

const TermsPage = () => {
  return (
    <PageShell>
        {/* Breadcrumb */}
        <div className="px-6 md:px-12 py-4 flex items-center gap-2 text-[0.8rem] text-muted max-w-[1440px] mx-auto">
          <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Home</Link>
          <ChevronRight className="w-3 h-3 opacity-30" />
          <span className="text-foreground">Terms of Service</span>
        </div>

        {/* Hero */}
        <section className="px-6 md:px-12 pt-8 pb-12 max-w-[1440px] mx-auto">
          <h1 className="font-display text-[clamp(2.4rem,5vw,4.2rem)] font-black tracking-[-0.03em] leading-[1.02] mb-4">Terms of Service</h1>
          <p className="text-[0.84rem] text-muted mb-6">Last updated: March 1, 2026</p>
          <div className="bg-card border border-foreground/[0.08] rounded-xl p-5 max-w-[700px]">
            <p className="text-[0.88rem] text-muted leading-[1.7]">
              Plain English summary: Be respectful, upload only content you own, don't abuse the platform, and you're good. The legalese below is the binding version.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="px-6 md:px-12 pb-16 max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-10">
            {/* TOC */}
            <nav className="lg:sticky lg:top-24 lg:self-start hidden lg:block">
              <div className="text-[0.72rem] font-bold text-muted uppercase tracking-[0.1em] mb-3">Contents</div>
              <div className="flex flex-col gap-1">
                {sections.map(s => (
                  <a key={s.id} href={`#${s.id}`} className="text-[0.78rem] text-muted hover:text-foreground transition-colors py-1 truncate">
                    {s.title}
                  </a>
                ))}
              </div>
            </nav>

            {/* Sections */}
            <div className="flex flex-col gap-10 max-w-[760px]">
              {sections.map(s => (
                <div key={s.id} id={s.id}>
                  <h2 className="font-display text-[1.4rem] font-black tracking-[-0.02em] mb-4">{s.title}</h2>
                  {s.content.split("\n").map((para, i) => (
                    para.trim() ? (
                      <p key={i} className="text-[0.84rem] text-muted leading-[1.75] mb-2">{para}</p>
                    ) : null
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer links */}
        <section className="px-6 md:px-12 py-10 text-center border-t border-foreground/[0.06]">
          <p className="text-[0.82rem] text-muted">
            <Link to="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
            {" · "}
            <Link to="/license" className="text-accent hover:underline">Image License</Link>
            {" · "}
            <a href="mailto:legal@realart.ai" className="text-accent hover:underline">legal@realart.ai</a>
          </p>
        </section>

        <Footer />
    </PageShell>
  );
};

export default TermsPage;
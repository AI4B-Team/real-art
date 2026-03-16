import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight, Shield } from "lucide-react";
import PageShell from "@/components/PageShell";
import Footer from "@/components/Footer";

const sections = [
  { id: "collect", title: "1. Information we collect", content: [
    "**Usage data:** pages visited, images viewed, downloads, clicks, and time spent.",
    "**Device information:** IP address, browser type, operating system, and device identifiers.",
    "**Cookies:** session cookies for authentication and preference cookies for your settings.",
  ]},
  { id: "use", title: "2. How we use your information", content: [
    "Provide and improve the REAL ART platform and all its features.",
    "Process uploads, manage your account, and deliver the services you request.",
    "Send transactional emails — account confirmation, password reset, payout notifications.",
    "Send product updates and newsletter communications (you can unsubscribe at any time).",
    "Analyze usage patterns to understand how people use REAL ART and where we can improve.",
    "Detect and prevent fraud, abuse, and violations of our terms of service.",
    "Calculate and pay affiliate commissions accurately.",
  ], note: "We do not sell your personal data to third parties. We do not serve ads on REAL ART." },
  { id: "sharing", title: "3. Sharing your information", content: [
    "**Service providers:** We work with trusted third-party providers for hosting (AWS), payments (Stripe), email (Postmark), and analytics (Plausible — privacy-first). These providers only access data needed to perform their functions.",
    "**Affiliate tracking:** To calculate commissions, referral data is shared with REAL CREATOR, which is operated by the same company.",
    "**Legal requirements:** We may disclose information if required by law, subpoena, or valid legal process.",
    "**Business transfers:** If REAL ART is acquired or merges with another company, your information may be transferred as part of that transaction. We will notify you before this happens.",
  ], note: "We will never sell, rent, or trade your personal information to marketing companies or data brokers." },
  { id: "retention", title: "4. Data retention", content: [
    "We retain your account information for as long as your account is active. If you delete your account, we delete your personal data within 30 days, with the exception of:",
    "Financial records (payout history, tax documents) which we retain for 7 years as required by law.",
    "Content you've published that other users have downloaded — we retain anonymized download records for platform integrity.",
  ], note: "You can request deletion of your account and associated data at any time by emailing privacy@realart.ai." },
  { id: "cookies", title: "5. Cookies", content: [
    "**Authentication:** keeping you logged in between sessions.",
    "**Preferences:** remembering your filter and display settings.",
    "**Analytics:** understanding aggregate usage through Plausible Analytics, which does not use cross-site tracking or fingerprinting.",
    "**Affiliate tracking:** tracking platform referral clicks (90-day cookie). External affiliate link clicks are tracked by the respective affiliate network, not by REAL ART.",
  ], note: "We do not use third-party advertising cookies. You can control cookie behavior in your browser settings." },
  { id: "security", title: "6. Security", content: [
    "HTTPS everywhere — all data in transit is encrypted.",
    "Bcrypt password hashing — we never store plain-text passwords.",
    "Database encryption at rest for all user data.",
    "Regular security audits and dependency updates.",
  ], note: "No system is 100% secure. If you believe you've found a security vulnerability, please report it to security@realart.ai before disclosing it publicly." },
  { id: "rights", title: "7. Your rights", content: [
    "**Access:** request a copy of all personal data we hold about you.",
    "**Correction:** update or correct inaccurate information in your account settings.",
    "**Deletion:** request that we delete your account and personal data.",
    "**Portability:** receive your data in a machine-readable format.",
    "**Objection:** opt out of certain data processing, including marketing communications.",
  ], note: "To exercise any of these rights, email privacy@realart.ai or use the controls in your account settings. We will respond within 30 days." },
  { id: "children", title: "8. Children's privacy", content: [
    "REAL ART is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has provided us with personal information, please contact us at privacy@realart.ai and we will delete it promptly.",
  ]},
  { id: "changes", title: "9. Changes to this policy", content: [
    "We may update this Privacy Policy from time to time. When we do, we will update the effective date at the top of this page and notify registered users via email if the changes are material.",
    "Continued use of REAL ART after changes are posted constitutes your acceptance of the updated policy.",
  ]},
  { id: "contact", title: "10. Contact", content: [
    "If you have questions about this Privacy Policy or how we handle your data, contact us at:",
    "Email: privacy@realart.ai",
    "Mailing address: REAL ART, Inc., 1234 Creator Ave, Suite 100, San Francisco, CA 94105",
  ]},
];

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Breadcrumb */}
        <div className="px-6 md:px-12 py-4 flex items-center gap-2 text-[0.8rem] text-muted max-w-[1440px] mx-auto">
          <Link to="/" className="hover:text-foreground transition-colors flex items-center gap-1"><ArrowLeft className="w-3.5 h-3.5" /> Home</Link>
          <ChevronRight className="w-3 h-3 opacity-30" />
          <span className="text-foreground">Privacy Policy</span>
        </div>

        {/* Hero */}
        <section className="px-6 md:px-12 pt-8 pb-12 max-w-[1440px] mx-auto">
          <h1 className="font-display text-[clamp(2.4rem,5vw,4.2rem)] font-black tracking-[-0.03em] leading-[1.02] mb-4">Privacy Policy</h1>
          <p className="text-[0.84rem] text-muted mb-6">Last updated: March 1, 2026</p>
          <div className="bg-card border border-foreground/[0.08] rounded-xl p-5 max-w-[700px]">
            <p className="text-[0.88rem] text-muted leading-[1.7]">
              The short version: We collect the minimum data needed to run REAL ART. We don't sell your data. We don't show ads. We're transparent about everything below.
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
                  <a key={s.id} href={`#${s.id}`} className="text-[0.78rem] text-muted hover:text-foreground transition-colors py-1">
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
                  <div className="flex flex-col gap-2.5">
                    {s.content.map((item, i) => (
                      <p key={i} className="text-[0.84rem] text-muted leading-[1.75]" dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>') }} />
                    ))}
                  </div>
                  {s.note && (
                    <p className="text-[0.82rem] text-foreground/70 mt-3 bg-card border border-foreground/[0.06] rounded-lg p-3 leading-[1.65]">{s.note}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer link */}
        <section className="px-6 md:px-12 py-10 text-center border-t border-foreground/[0.06]">
          <p className="text-[0.82rem] text-muted">
            Questions? Email <a href="mailto:privacy@realart.ai" className="text-accent hover:underline">privacy@realart.ai</a> or visit our <Link to="/about" className="text-accent hover:underline">About page</Link>.
          </p>
        </section>

        <Footer />
      </div>
    </div>
  );
};

export default PrivacyPage;
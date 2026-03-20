import { useState } from "react";
import { Check, X, Zap, Star, Crown, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import PageShell from "@/components/PageShell";

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: "Free",
      icon: Zap,
      monthlyPrice: 0,
      annualPrice: 0,
      description: "Perfect for trying out the platform",
      buttonText: "Get Started Free",
      buttonVariant: "outline" as const,
      popular: false,
      href: "/signup",
      iconColor: "bg-blue-600",
      highlights: [
        "10 AI images/month",
        "2 AI videos/month",
        "Basic video editor",
        "500 MB storage",
      ],
    },
    {
      name: "Starter",
      icon: Star,
      monthlyPrice: 7,
      annualPrice: 6,
      description: "Great for individuals getting started",
      buttonText: "Start Free",
      buttonVariant: "outline" as const,
      popular: false,
      href: "/signup?plan=starter",
      iconColor: "bg-green-500",
      highlights: [
        "100 AI images/month",
        "20 AI videos/month",
        "Voice cloning (3 voices)",
        "5 GB storage",
      ],
    },
    {
      name: "Creator",
      icon: Sparkles,
      monthlyPrice: 47,
      annualPrice: 38,
      description: "For creators who want to grow faster",
      buttonText: "Start Free",
      buttonVariant: "default" as const,
      popular: true,
      href: "/signup?plan=creator",
      iconColor: "bg-accent",
      highlights: [
        "500 AI images/month",
        "100 AI videos/month",
        "AI Agents (3 automations)",
        "50 GB storage",
      ],
    },
    {
      name: "Pro",
      icon: Crown,
      monthlyPrice: 97,
      annualPrice: 78,
      description: "For professionals and teams",
      buttonText: "Start Free",
      buttonVariant: "outline" as const,
      popular: false,
      href: "/signup?plan=pro",
      iconColor: "bg-amber-500",
      highlights: [
        "Unlimited AI generation",
        "White label & API access",
        "10 team members",
        "500 GB storage",
      ],
    },
  ];

  const featureCategories = [
    {
      name: "AI Creation",
      features: [
        { name: "AI Image Generation", free: "5/mo", starter: "100/mo", creator: "500/mo", pro: "Unlimited" },
        { name: "AI Video Generation", free: false, starter: "10/mo", creator: "50/mo", pro: "Unlimited" },
        { name: "AI Music Generation", free: false, starter: "5 tracks", creator: "30 tracks", pro: "Unlimited" },
        { name: "Style Transfer", free: "3/mo", starter: "30/mo", creator: "Unlimited", pro: "Unlimited" },
        { name: "Image Upscaling", free: "3/mo", starter: "50/mo", creator: "Unlimited", pro: "Unlimited" },
        { name: "Prompt Library Access", free: "Basic", starter: "Full", creator: "Full + Packs", pro: "Full + Packs" },
        { name: "Custom Characters", free: false, starter: "3", creator: "20", pro: "Unlimited" },
        { name: "Reference Image Upload", free: true, starter: true, creator: true, pro: true },
      ],
    },
    {
      name: "Collections & Galleries",
      features: [
        { name: "Public Collections", free: "3", starter: "20", creator: "Unlimited", pro: "Unlimited" },
        { name: "Private Collections", free: false, starter: "5", creator: "Unlimited", pro: "Unlimited" },
        { name: "Gallery Pages", free: false, starter: "1", creator: "5", pro: "Unlimited" },
        { name: "Cover Image Editor", free: true, starter: true, creator: true, pro: true },
        { name: "Collection Sharing", free: true, starter: true, creator: true, pro: true },
        { name: "Smart Save Suggestions", free: false, starter: true, creator: true, pro: true },
      ],
    },
    {
      name: "Community & Social",
      features: [
        { name: "Community Access", free: true, starter: true, creator: true, pro: true },
        { name: "Community Creation", free: false, starter: "1", creator: "5", pro: "Unlimited" },
        { name: "Challenge Participation", free: true, starter: true, creator: true, pro: true },
        { name: "Challenge Creation", free: false, starter: false, creator: true, pro: true },
        { name: "Leaderboard Access", free: true, starter: true, creator: true, pro: true },
        { name: "Creator Profile Page", free: true, starter: true, creator: true, pro: true },
      ],
    },
    {
      name: "Storage & Uploads",
      features: [
        { name: "Cloud Storage", free: "500 MB", starter: "5 GB", creator: "50 GB", pro: "500 GB" },
        { name: "Upload Limit", free: "10/mo", starter: "100/mo", creator: "Unlimited", pro: "Unlimited" },
        { name: "Max File Size", free: "10 MB", starter: "50 MB", creator: "200 MB", pro: "500 MB" },
        { name: "Batch Upload", free: false, starter: true, creator: true, pro: true },
        { name: "4K Export", free: false, starter: false, creator: true, pro: true },
      ],
    },
    {
      name: "Monetization",
      features: [
        { name: "Sell Art Downloads", free: false, starter: "10 listings", creator: "Unlimited", pro: "Unlimited" },
        { name: "Affiliate Program", free: false, starter: true, creator: true, pro: true },
        { name: "Earnings Dashboard", free: false, starter: true, creator: true, pro: true },
        { name: "Custom Licensing", free: false, starter: false, creator: true, pro: true },
        { name: "Transaction Fee", free: false, starter: "5%", creator: "2%", pro: "0%" },
      ],
    },
    {
      name: "Advertising",
      features: [
        { name: "Run Ad Campaigns", free: false, starter: false, creator: true, pro: true },
        { name: "Targeting Options", free: false, starter: false, creator: "Basic", pro: "Advanced" },
        { name: "Campaign Analytics", free: false, starter: false, creator: true, pro: true },
        { name: "Priority Placement", free: false, starter: false, creator: false, pro: true },
      ],
    },
    {
      name: "Support & Extras",
      features: [
        { name: "Email Support", free: true, starter: true, creator: true, pro: true },
        { name: "Priority Support", free: false, starter: false, creator: true, pro: true },
        { name: "API Access", free: false, starter: false, creator: false, pro: true },
        { name: "Early Access Features", free: false, starter: false, creator: true, pro: true },
        { name: "Custom Branding", free: false, starter: false, creator: false, pro: true },
      ],
    },
  ];

  const faqs = [
    {
      question: "Is there a free trial?",
      answer: "Yes! All paid plans include a 7-day free trial. No credit card required to start. Explore all features before committing.",
    },
    {
      question: "Can I change my plan anytime?",
      answer: "Absolutely! You can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately for upgrades, or at the end of your billing cycle for downgrades.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal.",
    },
    {
      question: "What happens when I exceed my limits?",
      answer: "We'll notify you when you're approaching your limits. You can either upgrade your plan or purchase additional credits as needed.",
    },
    {
      question: "Can I use AI-generated art commercially?",
      answer: "Yes! All content created on our platform is yours to use commercially. Check the License page for full details on usage rights.",
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee on all paid plans. If you're not satisfied, contact us for a full refund.",
    },
    {
      question: "Is there a discount for annual billing?",
      answer: "Yes! Save up to 20% when you choose annual billing. The prices shown with the annual toggle reflect this discount.",
    },
    {
      question: "Do you offer team or enterprise plans?",
      answer: "Yes! Our Pro plan supports teams up to 10 users. For larger teams or custom enterprise needs, please contact us.",
    },
  ];

  const renderFeatureValue = (value: boolean | string) => {
    if (value === true) return <Check className="h-5 w-5 text-green-500 mx-auto" />;
    if (value === false) return <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />;
    return <span className="text-sm font-medium">{value}</span>;
  };

  return (
    <PageShell>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4 tracking-[-0.03em]">
              Choose Your Plan
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Start For Free. Upgrade When You Need More Power. Cancel Anytime.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`text-sm font-medium ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
                Monthly
              </span>
              <Switch
                checked={isAnnual}
                onCheckedChange={setIsAnnual}
                className="data-[state=checked]:bg-accent"
              />
              <span className={`text-sm font-medium ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
                Annual
              </span>
              {isAnnual && (
                <Badge variant="secondary" className="bg-accent/15 text-accent border-0">
                  Save 20%
                </Badge>
              )}
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="px-4 sm:px-6 lg:px-8 pb-16">
          <div className="max-w-7xl mx-auto">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => {
                const Icon = plan.icon;
                const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
                const annualTotal = plan.annualPrice * 12;

                return (
                  <Card
                    key={plan.name}
                    className={`relative p-6 ${plan.popular ? "border-2 border-accent shadow-lg lg:scale-105" : "border"}`}
                  >
                    {plan.popular && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white border-0">
                        Most Popular
                      </Badge>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${plan.iconColor}`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold">{plan.name}</h3>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">${price}</span>
                        {price > 0 && <span className="text-muted-foreground">/month</span>}
                      </div>
                      {isAnnual && plan.monthlyPrice > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="line-through text-muted-foreground/60">${plan.monthlyPrice}/mo</span>
                          {" "}· Billed annually (${annualTotal}/year)
                        </p>
                      )}
                      {!isAnnual && plan.monthlyPrice > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">Billed monthly</p>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground mb-6">{plan.description}</p>

                    <Link to={plan.href}>
                      <Button
                        className={`w-full mb-6 rounded-lg ${
                          plan.buttonVariant === "default"
                            ? "bg-accent hover:bg-accent/90 text-white"
                            : "border-accent text-accent hover:bg-accent hover:text-white"
                        }`}
                        variant={plan.buttonVariant}
                      >
                        {plan.buttonText}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>

                    <ul className="space-y-2 text-sm">
                      {plan.highlights.map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-center mb-4">Compare All Features</h2>
            <p className="text-muted-foreground text-center mb-12">See exactly what you get with each plan</p>

            {/* Sticky Header */}
            <div className="hidden lg:block sticky top-0 z-10 bg-background border-b mb-0">
              <div className="grid grid-cols-5 gap-4 py-4 px-6">
                <div className="font-semibold">Features</div>
                {plans.map((plan) => (
                  <div key={plan.name} className="text-center font-semibold">
                    {plan.name}
                    <div className="text-sm font-normal text-muted-foreground">
                      ${isAnnual ? plan.annualPrice : plan.monthlyPrice}/mo
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              {featureCategories.map((category) => (
                <div key={category.name} className="bg-card rounded-xl border overflow-hidden">
                  <div className="bg-muted/50 px-6 py-4 border-b">
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                  </div>
                  <div className="divide-y">
                    {category.features.map((feature, idx) => (
                      <div key={idx} className="grid grid-cols-2 lg:grid-cols-5 gap-4 px-6 py-4 hover:bg-muted/20 transition-colors">
                        <div className="col-span-2 lg:col-span-1 flex items-center gap-2">
                          <span className="text-sm">{feature.name}</span>
                        </div>
                        {/* Mobile */}
                        <div className="col-span-2 lg:hidden grid grid-cols-4 gap-2 text-center">
                          <div className="text-xs text-muted-foreground mb-1">Free</div>
                          <div className="text-xs text-muted-foreground mb-1">Starter</div>
                          <div className="text-xs text-muted-foreground mb-1">Creator</div>
                          <div className="text-xs text-muted-foreground mb-1">Pro</div>
                          <div>{renderFeatureValue(feature.free)}</div>
                          <div>{renderFeatureValue(feature.starter)}</div>
                          <div>{renderFeatureValue(feature.creator)}</div>
                          <div>{renderFeatureValue(feature.pro)}</div>
                        </div>
                        {/* Desktop */}
                        <div className="hidden lg:block text-center">{renderFeatureValue(feature.free)}</div>
                        <div className="hidden lg:block text-center">{renderFeatureValue(feature.starter)}</div>
                        <div className="hidden lg:block text-center">{renderFeatureValue(feature.creator)}</div>
                        <div className="hidden lg:block text-center">{renderFeatureValue(feature.pro)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enterprise CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 bg-gradient-to-br from-foreground to-foreground/90 text-primary-foreground border-0">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Need a Custom Enterprise Plan?</h3>
                  <p className="text-primary-foreground/70">
                    For large teams, custom integrations, dedicated support, and volume pricing.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-primary-foreground/70">
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" />Custom AI model training</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" />Dedicated account manager</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" />SLA & priority support</li>
                    <li className="flex items-center gap-2"><Check className="h-4 w-4 text-green-400" />SSO & advanced security</li>
                  </ul>
                </div>
                <a href="mailto:enterprise@realart.com?subject=Enterprise%20Plan%20Inquiry">
                  <Button size="lg" className="bg-background text-foreground hover:bg-background/90 shrink-0 rounded-lg">
                    Contact Sales
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </a>
              </div>
            </Card>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-center mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-center mb-12">Everything you need to know about our pricing</p>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, idx) => (
                <AccordionItem key={idx} value={`faq-${idx}`} className="bg-card border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-display text-3xl font-bold mb-4">Ready to Create?</h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of creators already using Real Art to bring their visions to life.
            </p>
            <Link to="/signup">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white rounded-lg">
                Start Free
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </PageShell>
  );
};

export default PricingPage;

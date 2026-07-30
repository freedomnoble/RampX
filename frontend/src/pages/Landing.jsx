import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Building2, Users, Swords, Target, GitBranch, GraduationCap,
  CalendarDays, Sparkles, Check, ShieldCheck, LogIn,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { NeuCard, NeuButton, NeuInput, NeuTag } from "@/components/neu";
import AuthModal from "@/components/AuthModal";

const FEATURES = [
  { icon: Building2, title: "Instant company brief", body: "Enter your company and product area — we pull a live overview, latest releases and shareholder news from the web in under a minute." },
  { icon: Swords, title: "Know your competitors", body: "The top 4 rivals in card form: strengths, weaknesses, how you win, and what they just shipped." },
  { icon: Users, title: "Build your board", body: "Map the people across teams who get things done. Assign a task, email them, and see it as a note on their seat." },
  { icon: Target, title: "Goals that anchor decisions", body: "Set company goals and tag every decision to them, so your work always ladders up to what matters." },
  { icon: GitBranch, title: "A decision timeline", body: "Document what you decided and why in 160 characters, organized by project. Read it back like a timeline." },
  { icon: GraduationCap, title: "Learn the space daily", body: "A swipeable flashcard deck for your industry, with a fresh concept surfaced every day and links to go deeper." },
];

const FAQS = [
  { q: "Isn't it just easier to Google all this?", a: "You could — but you'd spend your first weeks stitching together tabs, docs and half-remembered names. rampX assembles the whole picture in one place in about a minute, then keeps it organized as you learn." },
  { q: "Will the information actually be accurate?", a: "We pull from live web sources and your company's own site, then structure it for you. You stay in control — edit anything, add your board, set your real goals, and log your own decisions." },
  { q: "I'm not technical. Is this hard to set up?", a: "No setup. Answer two questions — your company and product area — and your dashboard builds itself. A short guided tour shows you around." },
  { q: "Is my data private?", a: "Your board, goals and decisions are yours. Company briefing panels are protected against casual copying, screenshots and scraping." },
  { q: "What does it cost?", a: "One simple plan at $4.95/month. No annual lock-in, cancel anytime." },
  { q: "Do I need an account to try it?", a: "No. Answer the questions and explore your dashboard first. Create an account only when you want to save it." },
];

const JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "rampX",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description:
        "rampX is a dashboard that helps you ramp up to a new role at a company faster — with a live company brief, competitor intelligence, a contact board, goals, a decision timeline, and daily industry learning.",
      offers: { "@type": "Offer", price: "4.95", priceCurrency: "USD", category: "subscription" },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

export default function Landing() {
  const { workspace } = useApp();
  const navigate = useNavigate();
  const [company, setCompany] = useState("");
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    document.title = "rampX — Ramp up to your new role, faster";
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement("meta"); m.name = "description"; document.head.appendChild(m); return m;
    })();
    meta.setAttribute("content", "rampX builds a live dashboard for your new job in minutes: company brief, competitor intel, contact board, goals, a decision timeline and daily learning. $4.95/month.");
  }, []);

  const startFlow = () => navigate("/start", { state: { company: company.trim() } });

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />

      {/* Nav */}
      <header className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl">
        <div className="bg-neu rounded-full shadow-neu px-5 py-3 flex items-center justify-between">
          <span className="font-extrabold text-ink tracking-tight text-lg">ramp<span className="text-brand-blue">X</span></span>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm font-semibold text-slate2 pr-2">$4.95/mo</span>
            {workspace && (
              <button onClick={() => navigate("/dashboard")} data-testid="landing-dashboard" className="text-sm font-bold text-brand-purple rounded-full px-4 py-2 shadow-neu-sm hover:shadow-neu transition-all">Dashboard</button>
            )}
            <button onClick={() => setLoginOpen(true)} data-testid="landing-login" className="flex items-center gap-1.5 text-sm font-bold text-brand-blue rounded-full px-4 py-2 shadow-neu-sm hover:shadow-neu transition-all">
              <LogIn size={15} /> Log in
            </button>
          </div>
        </div>
      </header>

      {/* Hero with the first question */}
      <section className="max-w-3xl mx-auto px-5 pt-36 pb-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <NeuTag color="purple" className="mb-6"><Sparkles size={12} className="mr-1" /> Your first 90 days, handled</NeuTag>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink tracking-tight leading-[1.05]">
            Ramp up to your new role in <span className="text-brand-blue">weeks, not months</span>
          </h1>
          <p className="text-lg text-slate2 mt-5 max-w-xl mx-auto leading-relaxed">
            rampX turns two questions into a living dashboard — company brief, competitors, key contacts, goals, decisions and daily learning. Start now, no account needed.
          </p>

          <NeuCard className="p-3 mt-9 flex flex-col sm:flex-row items-stretch gap-3 max-w-xl mx-auto">
            <NeuInput
              data-testid="landing-company"
              placeholder="Which company are you joining?"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && startFlow()}
              className="flex-1"
            />
            <NeuButton data-testid="landing-start" onClick={startFlow} className="shrink-0 whitespace-nowrap">
              Build my dashboard <ArrowRight size={16} className="inline ml-1" />
            </NeuButton>
          </NeuCard>
          <p className="text-xs text-slate2 mt-3 flex items-center justify-center gap-1.5">
            <ShieldCheck size={13} /> Free to try · Save later for $4.95/mo · Cancel anytime
          </p>
        </motion.div>
      </section>

      {/* What it does */}
      <section className="max-w-6xl mx-auto px-5 py-8">
        <h2 className="text-3xl font-extrabold text-ink text-center mb-3">Everything a new hire scrambles for — in one place</h2>
        <p className="text-slate2 text-center max-w-2xl mx-auto mb-12">No more juggling tabs, docs and Slack threads. rampX organizes the context you need to make good calls fast.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <NeuCard hover className="p-6 h-full">
                <div className="w-11 h-11 rounded-2xl shadow-neu-inset flex items-center justify-center text-brand-blue mb-4">
                  <f.icon size={20} />
                </div>
                <h3 className="text-[18px] font-bold text-ink mb-1.5">{f.title}</h3>
                <p className="text-[14px] text-slate2 leading-relaxed">{f.body}</p>
              </NeuCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Objections / FAQ */}
      <section className="max-w-3xl mx-auto px-5 py-16">
        <h2 className="text-3xl font-extrabold text-ink text-center mb-3">Questions you're probably asking</h2>
        <p className="text-slate2 text-center mb-10">Straight answers, no fluff.</p>
        <div className="space-y-4">
          {FAQS.map((f, i) => (
            <NeuCard key={i} className="p-6" data-testid={`faq-${i}`}>
              <h3 className="text-[16px] font-bold text-ink mb-1.5">{f.q}</h3>
              <p className="text-[14px] text-slate2 leading-relaxed">{f.a}</p>
            </NeuCard>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-md mx-auto px-5 py-16" id="pricing">
        <NeuCard className="p-8 text-center">
          <NeuTag color="blue" className="mb-4">Simple pricing</NeuTag>
          <div className="flex items-end justify-center gap-1 mb-2">
            <span className="text-5xl font-extrabold text-ink">$4.95</span>
            <span className="text-slate2 font-semibold mb-1.5">/month</span>
          </div>
          <p className="text-slate2 text-sm mb-6">One plan. Everything included. Cancel anytime.</p>
          <ul className="text-left space-y-3 mb-7">
            {["Live company brief & news", "Competitor intelligence cards", "Contact board with tasks & email", "Goals + decision timeline", "Daily learning deck", "Weekly task planner"].map((li) => (
              <li key={li} className="flex items-center gap-3 text-[14px] text-ink">
                <span className="w-5 h-5 rounded-md shadow-neu-sm flex items-center justify-center text-brand-blue"><Check size={12} strokeWidth={3} /></span>
                {li}
              </li>
            ))}
          </ul>
          <NeuButton data-testid="pricing-start" onClick={startFlow} className="w-full">
            Start free <ArrowRight size={16} className="inline ml-1" />
          </NeuButton>
          <p className="text-xs text-slate2 mt-3">Explore your dashboard before you pay a cent.</p>
        </NeuCard>
      </section>

      {/* Final CTA */}
      <section className="max-w-2xl mx-auto px-5 pb-24 text-center">
        <h2 className="text-3xl font-extrabold text-ink mb-4">Your new role is waiting. Hit the ground running.</h2>
        <NeuButton data-testid="cta-start" onClick={startFlow} className="text-base">
          Build my dashboard <ArrowRight size={16} className="inline ml-1" />
        </NeuButton>
      </section>

      <footer className="border-t border-[#dbe1e8] py-8 text-center text-sm text-slate2">
        <p>© {new Date().getFullYear()} rampX — ramp up to your new role, faster.</p>
      </footer>

      <AuthModal open={loginOpen} onClose={() => setLoginOpen(false)} initialMode="login" onSuccess={() => navigate("/dashboard")} />
    </div>
  );
}

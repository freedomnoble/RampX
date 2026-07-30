import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Search, Sparkles, Building2, Boxes, LogIn, Link2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { NeuCard, NeuButton, NeuInput } from "@/components/neu";
import AuthModal from "@/components/AuthModal";

const LOADING_STEPS = [
  "Finding the company website…",
  "Scanning recent news & releases…",
  "Mapping the competitive landscape…",
  "Pulling shareholder & investor signals…",
  "Building your learning deck…",
];

export default function Onboarding() {
  const { research, workspace } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [company, setCompany] = useState(location.state?.company || "");
  const [url, setUrl] = useState("");
  const [productArea, setProductArea] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (workspace && !loading) navigate("/dashboard");
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setLoadingStep((s) => (s + 1) % LOADING_STEPS.length), 2200);
    return () => clearInterval(t);
  }, [loading]);

  const start = async () => {
    setError("");
    setLoading(true);
    try {
      await research(company.trim(), productArea.trim(), url.trim());
      sessionStorage.setItem("rampx_run_tour", "1");
      navigate("/dashboard");
    } catch (e) {
      setError("We couldn't complete the research. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <button
        data-testid="onboard-login"
        onClick={() => setLoginOpen(true)}
        className="fixed top-5 right-5 z-40 flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-brand-blue bg-neu shadow-neu hover:shadow-neu-hover active:shadow-neu-inset transition-all"
      >
        <LogIn size={16} /> Log in
      </button>
      <div className="w-full max-w-xl">
        <div className="text-center mb-10 animate-fade-up">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-ink tracking-tight">
            ramp<span className="text-brand-blue">X</span>
          </h1>
          <p className="text-[15px] text-slate2 mt-3">Ramp up to your new role — faster.</p>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <NeuCard className="p-10 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                  className="w-16 h-16 mx-auto rounded-full shadow-neu-inset flex items-center justify-center text-brand-blue mb-6"
                >
                  <Sparkles size={26} />
                </motion.div>
                <h2 className="text-[20px] font-bold text-ink mb-2">Researching {company}</h2>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingStep}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="text-[15px] text-slate2"
                  >
                    {LOADING_STEPS[loadingStep]}
                  </motion.p>
                </AnimatePresence>
                <p className="text-xs text-slate2 mt-6">This can take up to a minute — we're reading live sources.</p>
              </NeuCard>
            </motion.div>
          ) : step === 0 ? (
            <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <NeuCard className="p-8">
                <div className="w-12 h-12 rounded-2xl shadow-neu-inset flex items-center justify-center text-brand-purple mb-5">
                  <Building2 size={22} />
                </div>
                <h2 className="text-[20px] font-bold text-ink mb-1">Which company are you joining?</h2>
                <p className="text-[15px] text-slate2 mb-6">e.g. First Advantage, Stripe, Notion…</p>
                <NeuInput
                  data-testid="onboard-company"
                  autoFocus
                  placeholder="Company name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && company.trim() && setStep(1)}
                />
                <div className="mt-3 relative">
                  <Link2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A6B4C8]" />
                  <NeuInput
                    data-testid="onboard-url"
                    className="!pl-11"
                    placeholder="Company website (optional)"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && company.trim() && setStep(1)}
                  />
                </div>
                <p className="text-xs text-slate2 mt-2">Adding a site helps us pull more accurate, up-to-date info.</p>
                <div className="flex justify-end mt-6">
                  <NeuButton data-testid="onboard-next" disabled={!company.trim()} onClick={() => setStep(1)}>
                    Next <ArrowRight size={16} className="inline ml-1" />
                  </NeuButton>
                </div>
              </NeuCard>
            </motion.div>
          ) : (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <NeuCard className="p-8">
                <div className="w-12 h-12 rounded-2xl shadow-neu-inset flex items-center justify-center text-brand-pink mb-5">
                  <Boxes size={22} />
                </div>
                <h2 className="text-[20px] font-bold text-ink mb-1">What's the product area?</h2>
                <p className="text-[15px] text-slate2 mb-6">e.g. identity verification & background checks</p>
                <NeuInput
                  data-testid="onboard-product"
                  autoFocus
                  placeholder="Product area"
                  value={productArea}
                  onChange={(e) => setProductArea(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && productArea.trim() && start()}
                />
                {error && <p className="text-brand-pink text-sm font-semibold mt-3" data-testid="onboard-error">{error}</p>}
                <div className="flex justify-between items-center mt-6">
                  <button onClick={() => setStep(0)} className="text-sm font-semibold text-slate2 hover:text-ink" data-testid="onboard-back">Back</button>
                  <NeuButton data-testid="onboard-start" disabled={!productArea.trim()} onClick={start}>
                    <Search size={16} className="inline mr-2" /> Build my dashboard
                  </NeuButton>
                </div>
              </NeuCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AuthModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        initialMode="login"
        onSuccess={() => navigate("/dashboard")}
      />
    </div>
  );
}

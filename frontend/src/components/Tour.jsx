import React, { useState, useEffect, useLayoutEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const PADDING = 10;

export default function Tour({ steps, onClose }) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState(null);
  const step = steps[i];

  const measure = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(step.selector);
    if (!el) { setRect(null); return; }
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    }, 320);
  }, [step]);

  useLayoutEffect(() => { measure(); }, [measure]);
  useEffect(() => {
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [measure]);

  if (!step) return null;

  const next = () => (i < steps.length - 1 ? setI(i + 1) : onClose());
  const prev = () => i > 0 && setI(i - 1);

  // tooltip placement — kept inside the viewport
  const vh = window.innerHeight;
  const TIP_EST = 220;
  let tipTop;
  let translate;
  if (!rect) {
    tipTop = vh / 2;
    translate = "translate(-50%,-50%)";
  } else {
    const below = rect.top + rect.height + PADDING + 8;
    const placeBelow = below + TIP_EST < vh;
    if (placeBelow) {
      tipTop = Math.min(below, vh - 24);
      translate = "translateX(-50%)";
    } else {
      // place above the target, but never above the top edge
      tipTop = Math.max(rect.top - 8, TIP_EST + 24);
      translate = "translate(-50%,-100%)";
    }
  }

  return (
    <div className="fixed inset-0 z-[120]" data-testid="tour">
      {/* spotlight */}
      {rect ? (
        <div
          className="absolute rounded-3xl transition-all duration-300 pointer-events-none"
          style={{
            top: rect.top - PADDING,
            left: rect.left - PADDING,
            width: rect.width + PADDING * 2,
            height: rect.height + PADDING * 2,
            boxShadow: "0 0 0 9999px rgba(45,55,72,0.55)",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-[rgba(45,55,72,0.55)]" />
      )}

      {/* tooltip */}
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute left-1/2 w-[calc(100%-2rem)] max-w-sm"
          style={{ top: tipTop, transform: translate }}
        >
          <div className="bg-neu rounded-3xl shadow-neu p-6 relative">
            <button onClick={onClose} data-testid="tour-close" className="absolute top-4 right-4 text-slate2 hover:text-ink rounded-full p-1.5 shadow-neu-sm">
              <X size={14} />
            </button>
            <p className="text-xs font-bold text-brand-purple uppercase tracking-wide mb-1">
              Step {i + 1} of {steps.length}
            </p>
            <h3 className="text-[18px] font-bold text-ink mb-1.5">{step.title}</h3>
            <p className="text-[14px] text-slate2 leading-relaxed">{step.body}</p>
            <div className="flex items-center justify-between mt-5">
              <button onClick={onClose} data-testid="tour-skip" className="text-sm font-semibold text-slate2 hover:text-ink">Skip</button>
              <div className="flex items-center gap-2">
                {i > 0 && (
                  <button onClick={prev} data-testid="tour-prev" className="text-sm font-bold text-slate2 rounded-full px-4 py-2 shadow-neu-sm hover:shadow-neu transition-all">Back</button>
                )}
                <button onClick={next} data-testid="tour-next" className="text-sm font-bold text-brand-blue rounded-full px-5 py-2 shadow-neu hover:shadow-neu-hover active:shadow-neu-inset transition-all">
                  {i < steps.length - 1 ? "Next" : "Done"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

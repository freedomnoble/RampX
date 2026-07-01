import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Check, AlertTriangle, Sparkles, Rocket } from "lucide-react";
import { NeuCard } from "@/components/neu";

export default function CompetitorGrid({ competitors = [], companyName }) {
  if (!competitors.length) {
    return <p className="text-slate2 text-sm">No competitor data yet.</p>;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6" data-testid="competitor-grid">
      {competitors.slice(0, 4).map((c, i) => (
        <motion.div
          key={c.name + i}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.5 }}
        >
          <NeuCard hover className="p-6 h-full flex flex-col" data-testid={`competitor-card-${i}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl shadow-neu-inset flex items-center justify-center text-brand-purple font-extrabold">
                {c.name?.[0] || "?"}
              </div>
              <h3 className="text-[18px] font-bold text-ink leading-tight">{c.name}</h3>
            </div>

            <div className="mb-3">
              <p className="flex items-center gap-1.5 text-xs font-bold text-brand-blue mb-1.5"><Check size={13} /> Strengths</p>
              <ul className="space-y-1">
                {(c.strengths || []).map((s, j) => (
                  <li key={j} className="text-[13px] text-slate2 leading-snug">• {s}</li>
                ))}
              </ul>
            </div>

            <div className="mb-3">
              <p className="flex items-center gap-1.5 text-xs font-bold text-brand-pink mb-1.5"><AlertTriangle size={13} /> Weaknesses</p>
              <ul className="space-y-1">
                {(c.weaknesses || []).map((s, j) => (
                  <li key={j} className="text-[13px] text-slate2 leading-snug">• {s}</li>
                ))}
              </ul>
            </div>

            <div className="mb-3 rounded-2xl shadow-neu-inset p-3">
              <p className="flex items-center gap-1.5 text-xs font-bold text-brand-purple mb-1"><Sparkles size={13} /> How {companyName || "we"} differ</p>
              <p className="text-[13px] text-ink leading-snug">{c.differentiation}</p>
            </div>

            <div className="mt-auto pt-2">
              <p className="flex items-center gap-1.5 text-xs font-bold text-slate2 mb-1"><Rocket size={13} /> Recent release</p>
              <p className="text-[13px] text-slate2 leading-snug">{c.recent_release}</p>
            </div>
          </NeuCard>
        </motion.div>
      ))}
    </div>
  );
}

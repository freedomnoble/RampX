import React from "react";
import { motion } from "framer-motion";
import { Check, AlertTriangle, Sparkles, Rocket, Globe, Linkedin } from "lucide-react";
import { NeuCard } from "@/components/neu";

const searchUrl = (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`;
const linkedinUrl = (name) => `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(name)}`;

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
          <NeuCard hover className="p-6 h-full flex flex-col relative" data-testid={`competitor-card-${i}`}>
            {/* corner links */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <a
                href={c.website || searchUrl(`${c.name} official site`)}
                target="_blank" rel="noreferrer"
                title="Visit site"
                data-testid={`competitor-site-${i}`}
                className="w-8 h-8 rounded-xl bg-neu shadow-neu-sm flex items-center justify-center text-slate2 hover:text-brand-blue transition-all duration-300"
              >
                <Globe size={15} strokeWidth={2.2} />
              </a>
              <a
                href={c.linkedin || linkedinUrl(c.name)}
                target="_blank" rel="noreferrer"
                title="LinkedIn"
                data-testid={`competitor-linkedin-${i}`}
                className="w-8 h-8 rounded-xl bg-neu shadow-neu flex items-center justify-center text-slate2 transition-all duration-300 hover:text-brand-blue hover:shadow-[0_0_18px_rgba(107,146,229,0.75),inset_1px_1px_2px_rgba(255,255,255,0.9)]"
              >
                <Linkedin size={15} strokeWidth={2.2} />
              </a>
            </div>

            <div className="flex items-center gap-3 mb-4 pr-20">
              <div className="w-10 h-10 rounded-2xl shadow-neu-inset flex items-center justify-center text-brand-purple font-extrabold shrink-0">
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

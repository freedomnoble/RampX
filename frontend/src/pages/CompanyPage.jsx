import React from "react";
import { Building2, Globe, Rocket, Newspaper, ArrowUpRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { NeuCard, NeuTag } from "@/components/neu";

export default function CompanyPage() {
  const { workspace } = useApp();
  const ws = workspace || {};
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-28 pb-16">
      <h1 className="text-4xl font-extrabold text-ink tracking-tight mb-2 animate-fade-up flex items-center gap-3">
        <Building2 className="text-brand-blue" /> {ws.company_name}
      </h1>
      <p className="text-[15px] text-slate2 mb-8">{ws.product_area}</p>

      <NeuCard className="p-7 mb-8 protect" data-testid="company-overview">
        <h2 className="text-[20px] font-bold text-ink mb-3">About the company</h2>
        <p className="text-[15px] text-slate2 leading-relaxed">{ws.overview}</p>
        {ws.website && (
          <a href={ws.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-5 text-sm font-bold text-brand-blue shadow-neu-sm rounded-full px-4 py-2" data-testid="company-website">
            <Globe size={15} /> {ws.website.replace(/^https?:\/\//, "")}
          </a>
        )}
      </NeuCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 protect">
        <NeuCard className="p-6" data-testid="company-releases">
          <h3 className="text-[18px] font-bold text-ink flex items-center gap-2 mb-4"><Rocket size={18} className="text-brand-pink" /> Latest releases</h3>
          <div className="space-y-3">
            {(ws.releases || []).map((r, i) => (
              <div key={i} className="rounded-2xl shadow-neu-inset p-4">
                <NeuTag color="pink">{r.date || "Recent"}</NeuTag>
                <p className="text-[15px] font-bold text-ink mt-2">{r.title}</p>
                <p className="text-[13px] text-slate2 mt-1">{r.summary}</p>
                {r.url && <a href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue mt-2">Source <ArrowUpRight size={12} /></a>}
              </div>
            ))}
          </div>
        </NeuCard>

        <NeuCard className="p-6" data-testid="company-news">
          <h3 className="text-[18px] font-bold text-ink flex items-center gap-2 mb-4"><Newspaper size={18} className="text-brand-purple" /> Shareholder & news</h3>
          <div className="space-y-3">
            {(ws.news || []).map((n, i) => (
              <div key={i} className="rounded-2xl shadow-neu-inset p-4">
                <NeuTag color="purple">{n.date || "Recent"}</NeuTag>
                <p className="text-[15px] font-bold text-ink mt-2">{n.title}</p>
                <p className="text-[13px] text-slate2 mt-1">{n.summary}</p>
                {n.url && <a href={n.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue mt-2">Source <ArrowUpRight size={12} /></a>}
              </div>
            ))}
          </div>
        </NeuCard>
      </div>
    </div>
  );
}

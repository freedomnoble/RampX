import React from "react";
import { useApp } from "@/context/AppContext";
import CompetitorGrid from "@/components/CompetitorGrid";

export default function CompetitorsPage() {
  const { workspace } = useApp();
  const ws = workspace || {};
  return (
    <div className="max-w-[1500px] mx-auto px-4 sm:px-8 pt-28 pb-16">
      <h1 className="text-4xl font-extrabold text-ink tracking-tight mb-2 animate-fade-up">Competitor knowledge</h1>
      <p className="text-[15px] text-slate2 mb-8">
        The top players in {ws.product_area} — their strengths, weaknesses, how {ws.company_name} differs, and what they shipped recently.
      </p>
      <CompetitorGrid competitors={ws.competitors} companyName={ws.company_name} />
    </div>
  );
}

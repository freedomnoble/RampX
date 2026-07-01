import React from "react";
import { GraduationCap } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { NeuCard } from "@/components/neu";
import LearningDeck from "@/components/LearningDeck";

export default function LearningPage() {
  const { workspace } = useApp();
  const ws = workspace || {};
  const cards = ws.flashcards || [];
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-28 pb-16">
      <h1 className="text-4xl font-extrabold text-ink tracking-tight mb-2 animate-fade-up flex items-center gap-3">
        <GraduationCap className="text-brand-purple" /> Learn the space
      </h1>
      <p className="text-[15px] text-slate2 mb-8">
        Swipe or flip cards to master {ws.product_area}. A new concept surfaces to the top every day.
      </p>

      <NeuCard className="p-8 flex justify-center mb-10">
        <LearningDeck cards={cards} />
      </NeuCard>

      <h2 className="text-[20px] font-bold text-ink mb-4">All concepts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {cards.map((c, i) => (
          <NeuCard key={i} hover className="p-5" data-testid={`concept-${i}`}>
            <p className="text-[16px] font-bold text-ink">{c.term}</p>
            <p className="text-[14px] text-slate2 mt-1">{c.concept}</p>
            {c.resource_url && (
              <a href={c.resource_url} target="_blank" rel="noreferrer" className="inline-block mt-3 text-xs font-bold text-brand-blue">
                {c.resource_label || "Learn more"} →
              </a>
            )}
          </NeuCard>
        ))}
      </div>
    </div>
  );
}

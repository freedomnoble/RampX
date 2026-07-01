import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, RotateCw, Sparkles } from "lucide-react";
import { NeuTag } from "@/components/neu";

// deterministic daily rotation so the top card changes each day
function dailyOffset(len) {
  if (!len) return 0;
  const day = Math.floor(Date.now() / 86400000);
  return day % len;
}

export default function LearningDeck({ cards = [], compact }) {
  const start = useMemo(() => dailyOffset(cards.length), [cards.length]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!cards.length) {
    return <p className="text-slate2 text-sm">No learning cards yet.</p>;
  }

  const order = cards.map((_, i) => cards[(start + i) % cards.length]);
  const remaining = order.slice(index);
  const top = remaining[0];

  const advance = () => {
    setFlipped(false);
    setIndex((i) => (i + 1) % order.length);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className={"relative w-full " + (compact ? "h-[250px]" : "h-[340px] max-w-[460px]")}>
        {remaining.slice(0, 3).reverse().map((card, ri) => {
          const stackPos = remaining.slice(0, 3).length - 1 - ri;
          const isTop = stackPos === 0;
          return (
            <motion.div
              key={card.term + index}
              className="absolute inset-0"
              style={{ zIndex: 10 - stackPos, transformOrigin: "center top" }}
              initial={false}
              animate={{ scale: 1 - stackPos * 0.045, y: stackPos * 12, x: stackPos * 8, opacity: 1 - stackPos * 0.1 }}
              drag={isTop ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, info) => { if (Math.abs(info.offset.x) > 110) advance(); }}
              whileDrag={{ rotate: 4 }}
              data-testid={isTop ? "learning-top-card" : undefined}
            >
              <div
                onClick={() => isTop && setFlipped((f) => !f)}
                className="bg-neu rounded-3xl shadow-neu w-full h-full p-6 flex flex-col cursor-pointer select-none"
              >
                {isTop && (
                  <div className="flex items-center justify-between mb-2">
                    <NeuTag color="blue"><Sparkles size={12} className="mr-1" /> Today's concept</NeuTag>
                    <span className="text-xs text-slate2 font-semibold">{order.length} cards</span>
                  </div>
                )}
                <h3 className="text-[20px] font-bold text-ink mt-1">{card.term}</h3>
                {!flipped || !isTop ? (
                  <p className="text-[15px] text-slate2 mt-3 leading-relaxed">{card.concept}</p>
                ) : (
                  <div className="mt-3 flex-1 overflow-y-auto">
                    <p className="text-[14px] text-ink leading-relaxed">{card.detail}</p>
                    {card.resource_url && (
                      <a
                        href={card.resource_url} target="_blank" rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-brand-blue shadow-neu-sm rounded-full px-4 py-2"
                        data-testid="learning-resource-link"
                      >
                        <ExternalLink size={14} /> {card.resource_label || "Learn more"}
                      </a>
                    )}
                  </div>
                )}
                {isTop && (
                  <p className="text-xs text-slate2 mt-auto pt-3">
                    {flipped ? "Tap to flip back" : "Tap to flip · swipe to move on"}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="flex items-center gap-3 mt-5">
        <button
          onClick={advance}
          data-testid="learning-next"
          className="flex items-center gap-2 text-sm font-bold text-brand-purple shadow-neu rounded-full px-5 py-2.5 hover:shadow-neu-hover active:shadow-neu-inset transition-all"
        >
          <RotateCw size={15} /> Next card
        </button>
      </div>
    </div>
  );
}

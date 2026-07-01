import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, Rocket, Newspaper, GraduationCap, ArrowUpRight, Plus, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { NeuCard, NeuTag } from "@/components/neu";
import BoardSeats from "@/components/BoardSeats";
import LearningDeck from "@/components/LearningDeck";
import CompetitorGrid from "@/components/CompetitorGrid";

function SaveBanner({ onOpen }) {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="mb-8">
      <NeuCard className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3" data-testid="save-banner">
        <p className="text-[14px] text-ink font-semibold flex items-center gap-2">
          <Sparkles size={16} className="text-brand-blue" />
          Nice dashboard! Create a free account to save it and pick up where you left off.
        </p>
        <button onClick={onOpen} data-testid="save-banner-btn"
          className="text-sm font-bold text-brand-blue rounded-full px-5 py-2.5 shadow-neu hover:shadow-neu-hover active:shadow-neu-inset transition-all whitespace-nowrap">
          Save my dashboard
        </button>
      </NeuCard>
    </motion.div>
  );
}

export default function Dashboard({ onAuthOpen }) {
  const { workspace, user } = useApp();
  const ws = workspace || {};
  const goals = ws.goals || [];
  const releases = ws.releases || [];
  const news = ws.news || [];
  const topRelease = releases[0];

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-8 pt-28 pb-16">
      <div className="mb-8 animate-fade-up">
        <p className="text-[13px] text-slate2 font-semibold uppercase tracking-wide">Ramping up at</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-ink tracking-tight">{ws.company_name}</h1>
        <p className="text-[15px] text-slate2 mt-1">{ws.product_area}</p>
      </div>

      {!user && <SaveBanner onOpen={onAuthOpen} />}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Company Goals — left */}
        <div className="lg:col-span-3 order-1">
          <NeuCard className="p-6 h-full" data-testid="goals-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-ink flex items-center gap-2"><Target size={18} className="text-brand-blue" /> Company Goals</h3>
              <Link to="/goals" className="text-slate2 hover:text-brand-blue p-1.5 rounded-full shadow-neu-sm" data-testid="goals-link"><Plus size={15} /></Link>
            </div>
            {goals.length === 0 ? (
              <p className="text-sm text-slate2">No goals yet. <Link to="/goals" className="text-brand-blue font-semibold">Add some →</Link></p>
            ) : (
              <div className="space-y-3">
                {goals.map((g) => (
                  <div key={g.id} className="rounded-2xl shadow-neu-inset p-3" data-testid={`goal-${g.id}`}>
                    <p className="text-[14px] font-bold text-ink leading-snug">{g.title}</p>
                    {g.description && <p className="text-xs text-slate2 mt-1">{g.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </NeuCard>
        </div>

        {/* Center: Board top + Learning under */}
        <div className="lg:col-span-6 order-3 lg:order-2 space-y-6 lg:space-y-8">
          <NeuCard className="p-6" data-testid="board-card">
            <BoardSeats />
          </NeuCard>
          <NeuCard className="p-6 flex flex-col items-center" data-testid="learning-card">
            <div className="w-full flex items-center justify-between mb-4">
              <h3 className="text-[18px] font-bold text-ink flex items-center gap-2"><GraduationCap size={18} className="text-brand-purple" /> Learn the space</h3>
              <Link to="/learning" className="text-sm font-semibold text-brand-purple" data-testid="learning-link">Open deck →</Link>
            </div>
            <LearningDeck cards={ws.flashcards || []} compact />
          </NeuCard>
        </div>

        {/* Latest Release — right */}
        <div className="lg:col-span-3 order-2 lg:order-3">
          <NeuCard className="p-6 h-full" data-testid="release-card">
            <h3 className="text-[18px] font-bold text-ink flex items-center gap-2 mb-4"><Rocket size={18} className="text-brand-pink" /> Latest from {ws.company_name}</h3>
            {topRelease ? (
              <div className="rounded-2xl shadow-neu-inset p-4 mb-4">
                <NeuTag color="pink">{topRelease.date || "Recent"}</NeuTag>
                <p className="text-[15px] font-bold text-ink mt-2 leading-snug">{topRelease.title}</p>
                <p className="text-[13px] text-slate2 mt-1">{topRelease.summary}</p>
                {topRelease.url && <a href={topRelease.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue mt-2">Read <ArrowUpRight size={13} /></a>}
              </div>
            ) : <p className="text-sm text-slate2 mb-4">No releases found.</p>}

            <p className="text-xs font-bold text-slate2 uppercase tracking-wide flex items-center gap-1.5 mb-2"><Newspaper size={13} /> Shareholder / news</p>
            <div className="space-y-2">
              {news.slice(0, 3).map((n, i) => (
                <a key={i} href={n.url || "#"} target={n.url ? "_blank" : undefined} rel="noreferrer"
                   className="block rounded-2xl shadow-neu-sm p-3 hover:shadow-neu transition-all" data-testid={`news-${i}`}>
                  <p className="text-[13px] font-semibold text-ink leading-snug">{n.title}</p>
                  <p className="text-xs text-slate2 mt-0.5">{n.date}</p>
                </a>
              ))}
            </div>
          </NeuCard>
        </div>
      </div>

      {/* Competitors — full width bottom */}
      <div className="mt-8 lg:mt-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[20px] font-bold text-ink">Competitive landscape</h2>
          <Link to="/competitors" className="text-sm font-semibold text-brand-blue" data-testid="competitors-link">Details →</Link>
        </div>
        <CompetitorGrid competitors={ws.competitors} companyName={ws.company_name} />
      </div>
    </div>
  );
}

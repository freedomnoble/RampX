import React, { useState } from "react";
import { Target, Plus, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { NeuCard, NeuInput, NeuTextarea, NeuButton, NeuTag } from "@/components/neu";

export default function GoalsPage() {
  const { workspace, updateWorkspace, uid } = useApp();
  const goals = workspace?.goals || [];
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const add = () => {
    if (!title.trim()) return;
    updateWorkspace((ws) => ({
      ...ws,
      goals: [...(ws.goals || []), { id: uid(), title: title.trim(), description: description.trim(), source: "custom" }],
    }));
    setTitle(""); setDescription("");
  };
  const remove = (id) =>
    updateWorkspace((ws) => ({ ...ws, goals: (ws.goals || []).filter((g) => g.id !== id) }));

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 pt-28 pb-16">
      <h1 className="text-4xl font-extrabold text-ink tracking-tight mb-2 animate-fade-up flex items-center gap-3">
        <Target className="text-brand-blue" /> Company Goals
      </h1>
      <p className="text-[15px] text-slate2 mb-8">Keep every decision coupled to what the company is trying to achieve.</p>

      <NeuCard className="p-6 mb-8" data-testid="goal-form">
        <div className="space-y-3">
          <NeuInput data-testid="goal-title" placeholder="Goal (e.g. Reduce verification turnaround to under 2 hours)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <NeuTextarea data-testid="goal-desc" rows={2} placeholder="Why it matters (optional)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <NeuButton data-testid="goal-add" onClick={add} className="w-full py-2.5 text-sm"><Plus size={15} className="inline mr-2" /> Add goal</NeuButton>
        </div>
      </NeuCard>

      <div className="space-y-4">
        {goals.map((g) => (
          <NeuCard key={g.id} className="p-5 flex items-start justify-between gap-4" data-testid={`goal-item-${g.id}`}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[16px] font-bold text-ink">{g.title}</p>
                {g.source === "suggested" && <NeuTag color="blue">AI suggested</NeuTag>}
              </div>
              {g.description && <p className="text-[14px] text-slate2">{g.description}</p>}
            </div>
            <button onClick={() => remove(g.id)} data-testid={`goal-remove-${g.id}`} className="text-slate2 hover:text-brand-pink p-2 rounded-full shadow-neu-sm shrink-0"><Trash2 size={15} /></button>
          </NeuCard>
        ))}
        {goals.length === 0 && <p className="text-center text-slate2 text-sm py-6">No goals yet.</p>}
      </div>
    </div>
  );
}

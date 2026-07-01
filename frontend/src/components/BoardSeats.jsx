import React, { useState } from "react";
import { Plus, Trash2, UserPlus } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { NeuCard, NeuInput, NeuButton, NeuTag } from "@/components/neu";

const AVATARS = [
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=srgb&fm=jpg&w=200&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=srgb&fm=jpg&w=200&q=80",
  "https://images.pexels.com/photos/11655430/pexels-photo-11655430.jpeg?auto=compress&cs=tinysrgb&w=200",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?crop=entropy&cs=srgb&fm=jpg&w=200&q=80",
];

export default function BoardSeats({ full }) {
  const { workspace, updateWorkspace, uid } = useApp();
  const board = workspace?.board || [];
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", department: "", notes: "" });

  const addMember = () => {
    if (!form.name.trim()) return;
    const avatar = AVATARS[board.length % AVATARS.length];
    updateWorkspace((ws) => ({
      ...ws,
      board: [...(ws.board || []), { id: uid(), avatar, ...form }],
    }));
    setForm({ name: "", role: "", department: "", notes: "" });
    setAdding(false);
  };

  const remove = (id) =>
    updateWorkspace((ws) => ({ ...ws, board: (ws.board || []).filter((m) => m.id !== id) }));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[18px] font-bold text-ink">Your Board</h3>
          <p className="text-[13px] text-slate2">Key people across departments who get things done</p>
        </div>
        <button
          data-testid="board-add-toggle"
          onClick={() => setAdding((a) => !a)}
          className="rounded-2xl p-2.5 text-brand-blue shadow-neu hover:shadow-neu-hover active:shadow-neu-inset transition-all"
        >
          <Plus size={18} className={adding ? "rotate-45 transition-transform" : "transition-transform"} />
        </button>
      </div>

      {adding && (
        <NeuCard inset className="p-4 mb-4 space-y-3 animate-fade-up">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NeuInput data-testid="board-name" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <NeuInput data-testid="board-role" placeholder="Role / title" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
            <NeuInput data-testid="board-dept" placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            <NeuInput data-testid="board-notes" placeholder="Why they matter" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <NeuButton data-testid="board-save" onClick={addMember} className="w-full text-sm py-2.5">
            <UserPlus size={15} className="inline mr-2" /> Assign seat
          </NeuButton>
        </NeuCard>
      )}

      {board.length === 0 && !adding ? (
        <div className="text-center py-8 text-slate2 text-sm">
          No board members yet — assign the people you meet across teams.
        </div>
      ) : (
        <div className={"grid gap-4 " + (full ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-2 md:grid-cols-3")}>
          {board.map((m) => (
            <NeuCard key={m.id} hover className="p-4 flex flex-col items-center text-center relative" data-testid={`board-member-${m.id}`}>
              <button
                onClick={() => remove(m.id)}
                data-testid={`board-remove-${m.id}`}
                className="absolute top-2 right-2 text-slate2 hover:text-brand-pink p-1.5 rounded-full shadow-neu-sm"
              >
                <Trash2 size={13} />
              </button>
              <img src={m.avatar} alt={m.name} className="w-14 h-14 rounded-full object-cover shadow-neu mb-2" />
              <p className="font-bold text-ink text-sm leading-tight">{m.name}</p>
              <p className="text-xs text-slate2">{m.role}</p>
              {m.department && <NeuTag color="purple" className="mt-2">{m.department}</NeuTag>}
              {full && m.notes && <p className="text-xs text-slate2 mt-2 italic">{m.notes}</p>}
            </NeuCard>
          ))}
        </div>
      )}
    </div>
  );
}

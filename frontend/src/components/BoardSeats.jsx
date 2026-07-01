import React, { useState } from "react";
import { Plus, Trash2, UserPlus, User } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { NeuCard, NeuInput, NeuButton, NeuTag } from "@/components/neu";

export default function BoardSeats({ full }) {
  const { workspace, updateWorkspace, uid } = useApp();
  const board = workspace?.board || [];
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", department: "", notes: "" });

  const addMember = () => {
    if (!form.name.trim()) return;
    updateWorkspace((ws) => ({
      ...ws,
      board: [...(ws.board || []), { id: uid(), ...form }],
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
      ) : full ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {board.map((m) => (
            <NeuCard key={m.id} hover className="p-4 flex flex-col items-center text-center relative" data-testid={`board-member-${m.id}`}>
              <button
                onClick={() => remove(m.id)}
                data-testid={`board-remove-${m.id}`}
                className="absolute top-2 right-2 text-slate2 hover:text-brand-pink p-1.5 rounded-full shadow-neu-sm"
              >
                <Trash2 size={13} />
              </button>
              <div className="w-14 h-14 rounded-full shadow-neu flex items-center justify-center text-slate2 mb-2">
                <User size={26} strokeWidth={2} />
              </div>
              <p className="font-bold text-ink text-sm leading-tight">{m.name}</p>
              <p className="text-xs text-slate2">{m.role}</p>
              {m.department && <NeuTag color="purple" className="mt-2">{m.department}</NeuTag>}
              {m.notes && <p className="text-xs text-slate2 mt-2 italic">{m.notes}</p>}
            </NeuCard>
          ))}
        </div>
      ) : (
        <div className="relative w-full" style={{ height: `${140 + Math.min(board.length, 6) * 4}px` }} data-testid="board-arc">
          {board.map((m, i) => {
            const n = board.length;
            const t = n === 1 ? 0.5 : i / (n - 1);
            const leftPct = n === 1 ? 50 : 8 + t * 84;
            const top = (1 - Math.sin(Math.PI * t)) * 78;
            return (
              <div
                key={m.id}
                data-testid={`board-member-${m.id}`}
                className="absolute flex flex-col items-center text-center group"
                style={{ left: `${leftPct}%`, top: `${top}px`, transform: "translateX(-50%)", width: "88px" }}
              >
                <button
                  onClick={() => remove(m.id)}
                  data-testid={`board-remove-${m.id}`}
                  className="absolute -top-1 -right-1 z-10 text-slate2 hover:text-brand-pink p-1 rounded-full bg-neu shadow-neu-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={11} />
                </button>
                <div className="w-14 h-14 rounded-full shadow-neu flex items-center justify-center text-slate2 mb-1.5 hover:shadow-neu-hover transition-all">
                  <User size={24} strokeWidth={2} />
                </div>
                <p className="font-bold text-ink text-[13px] leading-tight truncate w-full">{m.name}</p>
                <p className="text-[11px] text-slate2 leading-tight truncate w-full">{m.role}</p>
                {m.department && <span className="text-[10px] font-bold text-brand-purple mt-0.5 truncate w-full">{m.department}</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

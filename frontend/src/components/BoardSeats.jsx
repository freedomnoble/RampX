import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, UserPlus, User, Mail, Pencil, MessageSquareQuote, X, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { NeuCard, NeuInput, NeuButton, NeuTag, NeuTextarea } from "@/components/neu";

const EMPTY = { name: "", role: "", department: "", email: "", notes: "" };

export default function BoardSeats({ full }) {
  const { workspace, updateWorkspace, uid } = useApp();
  const board = workspace?.board || [];
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [selectedId, setSelectedId] = useState(null);

  const selected = board.find((m) => m.id === selectedId) || null;

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY);
    setAdding((a) => !a);
  };

  const openEdit = (m) => {
    setEditingId(m.id);
    setForm({ name: m.name || "", role: m.role || "", department: m.department || "", email: m.email || "", notes: m.notes || "" });
    setAdding(true);
    setSelectedId(null);
  };

  const saveMember = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      updateWorkspace((ws) => ({
        ...ws,
        board: (ws.board || []).map((m) => (m.id === editingId ? { ...m, ...form } : m)),
      }));
    } else {
      updateWorkspace((ws) => ({ ...ws, board: [...(ws.board || []), { id: uid(), task: "", ...form }] }));
    }
    setForm(EMPTY);
    setEditingId(null);
    setAdding(false);
  };

  const remove = (id) => {
    updateWorkspace((ws) => ({ ...ws, board: (ws.board || []).filter((m) => m.id !== id) }));
    setSelectedId(null);
  };

  const setTask = (id, task) =>
    updateWorkspace((ws) => ({ ...ws, board: (ws.board || []).map((m) => (m.id === id ? { ...m, task } : m)) }));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[18px] font-bold text-ink">Your Board</h3>
          <p className="text-[13px] text-slate2">Key people across departments who get things done</p>
        </div>
        <button
          data-testid="board-add-toggle"
          onClick={openAdd}
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
            <NeuInput data-testid="board-email" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <NeuInput data-testid="board-notes" className="sm:col-span-2" placeholder="Why they matter" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <NeuButton data-testid="board-save" onClick={saveMember} className="w-full text-sm py-2.5">
            <UserPlus size={15} className="inline mr-2" /> {editingId ? "Save changes" : "Assign seat"}
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
            <NeuCard
              key={m.id} hover data-testid={`board-member-${m.id}`}
              onClick={() => setSelectedId(m.id)}
              className="p-4 flex flex-col items-center text-center relative cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full shadow-neu flex items-center justify-center text-slate2 mb-2 relative">
                <User size={26} strokeWidth={2} />
                {m.task && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-brand-pink shadow-neu-sm flex items-center justify-center"><MessageSquareQuote size={9} className="text-white" /></span>}
              </div>
              <p className="font-bold text-ink text-sm leading-tight">{m.name}</p>
              <p className="text-xs text-slate2">{m.role}</p>
              {m.department && <NeuTag color="purple" className="mt-2">{m.department}</NeuTag>}
              {m.notes && <p className="text-xs text-slate2 mt-2 italic">{m.notes}</p>}
            </NeuCard>
          ))}
        </div>
      ) : (
        <div className="relative w-full" style={{ height: `${160 + Math.min(board.length, 6) * 4}px` }} data-testid="board-arc">
          {board.map((m, i) => {
            const n = board.length;
            const t = n === 1 ? 0.5 : i / (n - 1);
            const leftPct = n === 1 ? 50 : 8 + t * 84;
            const top = (1 - Math.sin(Math.PI * t)) * 78 + 8;
            return (
              <div
                key={m.id}
                data-testid={`board-member-${m.id}`}
                className="absolute flex flex-col items-center text-center group cursor-pointer"
                style={{ left: `${leftPct}%`, top: `${top}px`, transform: "translateX(-50%)", width: "88px" }}
                onClick={() => setSelectedId(m.id)}
              >
                {/* thought bubble on hover */}
                {m.task && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-44 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-20" data-testid={`board-bubble-${m.id}`}>
                    <div className="bg-neu rounded-2xl shadow-neu px-3 py-2 text-[12px] text-ink leading-snug">
                      {m.task}
                    </div>
                    <div className="w-2.5 h-2.5 rounded-full bg-neu shadow-neu-sm mx-auto -mt-1" />
                    <div className="w-1.5 h-1.5 rounded-full bg-neu shadow-neu-sm mx-auto mt-0.5" />
                  </div>
                )}
                <div className="w-14 h-14 rounded-full shadow-neu flex items-center justify-center text-slate2 mb-1.5 group-hover:shadow-neu-hover transition-all relative">
                  <User size={24} strokeWidth={2} />
                  {m.task && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-brand-pink shadow-neu-sm flex items-center justify-center"><MessageSquareQuote size={9} className="text-white" /></span>}
                </div>
                <p className="font-bold text-ink text-[13px] leading-tight truncate w-full">{m.name}</p>
                <p className="text-[11px] text-slate2 leading-tight truncate w-full">{m.role}</p>
                {m.department && <span className="text-[10px] font-bold text-brand-purple mt-0.5 truncate w-full">{m.department}</span>}
              </div>
            );
          })}
        </div>
      )}

      <MemberModal
        member={selected}
        onClose={() => setSelectedId(null)}
        onEdit={openEdit}
        onRemove={remove}
        onSaveTask={setTask}
      />
    </div>
  );
}

function MemberModal({ member, onClose, onEdit, onRemove, onSaveTask }) {
  const [task, setTaskLocal] = useState("");
  React.useEffect(() => { setTaskLocal(member?.task || ""); }, [member]);
  if (!member) return null;

  const mailto = () => {
    const subject = encodeURIComponent(member.task ? `Re: ${member.task}` : `Quick sync`);
    const body = encodeURIComponent(`Hi ${member.name?.split(" ")[0] || ""},\n\n`);
    window.location.href = `mailto:${member.email || ""}?subject=${subject}&body=${body}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#ECF0F3]/70 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} data-testid="board-modal"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-neu rounded-3xl shadow-neu p-7 w-full max-w-md relative"
        >
          <button onClick={onClose} data-testid="board-modal-close" className="absolute top-5 right-5 text-slate2 hover:text-ink rounded-full p-2 shadow-neu-sm">
            <X size={16} />
          </button>

          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full shadow-neu flex items-center justify-center text-slate2 shrink-0">
              <User size={30} strokeWidth={2} />
            </div>
            <div className="min-w-0">
              <h3 className="text-[20px] font-bold text-ink leading-tight truncate">{member.name}</h3>
              <p className="text-[14px] text-slate2 truncate">{member.role}</p>
              {member.department && <NeuTag color="purple" className="mt-1.5">{member.department}</NeuTag>}
            </div>
          </div>

          {member.notes && <p className="text-[14px] text-slate2 italic mb-5">"{member.notes}"</p>}

          <div className="mb-5">
            <p className="text-xs font-bold text-slate2 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <MessageSquareQuote size={13} /> Assigned quote / task
            </p>
            <NeuTextarea
              data-testid="board-task-input"
              rows={2}
              placeholder="e.g. Approve the Q3 vendor shortlist"
              value={task}
              onChange={(e) => setTaskLocal(e.target.value)}
            />
            <div className="flex gap-2 mt-2">
              <button
                data-testid="board-task-save"
                onClick={() => onSaveTask(member.id, task.trim())}
                className="flex items-center gap-1.5 text-sm font-bold text-brand-blue rounded-full px-4 py-2 shadow-neu hover:shadow-neu-hover active:shadow-neu-inset transition-all"
              >
                <Check size={14} /> {member.task ? "Update task" : "Assign task"}
              </button>
              {member.task && (
                <button
                  data-testid="board-task-clear"
                  onClick={() => { onSaveTask(member.id, ""); setTaskLocal(""); }}
                  className="text-sm font-semibold text-slate2 rounded-full px-4 py-2 shadow-neu-sm hover:text-brand-pink transition-all"
                >
                  Clear
                </button>
              )}
            </div>
            <p className="text-[11px] text-slate2 mt-1.5">One task at a time — it shows as a thought bubble on the dashboard.</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              data-testid="board-email-btn"
              onClick={mailto}
              disabled={!member.email}
              className="flex flex-col items-center gap-1 py-3 rounded-2xl text-brand-purple shadow-neu hover:shadow-neu-hover active:shadow-neu-inset transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Mail size={18} /> <span className="text-xs font-bold">Email</span>
            </button>
            <button
              data-testid="board-edit-btn"
              onClick={() => onEdit(member)}
              className="flex flex-col items-center gap-1 py-3 rounded-2xl text-brand-blue shadow-neu hover:shadow-neu-hover active:shadow-neu-inset transition-all"
            >
              <Pencil size={18} /> <span className="text-xs font-bold">Edit</span>
            </button>
            <button
              data-testid="board-delete-btn"
              onClick={() => onRemove(member.id)}
              className="flex flex-col items-center gap-1 py-3 rounded-2xl text-brand-pink shadow-neu hover:shadow-neu-hover active:shadow-neu-inset transition-all"
            >
              <Trash2 size={18} /> <span className="text-xs font-bold">Remove</span>
            </button>
          </div>
          {!member.email && <p className="text-[11px] text-slate2 mt-3 text-center">Add an email via Edit to enable emailing.</p>}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

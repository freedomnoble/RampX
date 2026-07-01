import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Plus, X, Check, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const SUGGESTIONS = [
  "Book recurring 1:1s with each of your board members",
  "Ask your manager: what does success look like in 90 days?",
  "Map the company's top 3 goals to your daily work",
  "Shadow a customer call to learn the product firsthand",
  "Write down 5 things that confused you this week",
  "Identify who owns each decision you depend on",
  "Read the latest quarterly update / shareholder call",
  "List questions to ask the product & sales teams",
  "Set up a personal wiki to organize what you learn",
  "Review each competitor and note our differentiation",
];

const todayName = () => DAYS[(new Date().getDay() + 6) % 7]; // Mon-indexed

const uid = () => Math.random().toString(36).slice(2, 10);

export default function TaskDrawer() {
  const { workspace, updateWorkspace } = useApp();
  const [open, setOpen] = useState(false);
  const [activeDay, setActiveDay] = useState(todayName());
  const [drafts, setDrafts] = useState({});

  if (!workspace) return null;
  const tasks = workspace.tasks || {};

  const setDayTasks = (day, updater) =>
    updateWorkspace((ws) => {
      const cur = (ws.tasks && ws.tasks[day]) || [];
      const next = typeof updater === "function" ? updater(cur) : updater;
      return { ...ws, tasks: { ...(ws.tasks || {}), [day]: next } };
    });

  const addTask = (day, text) => {
    const t = (text || "").trim();
    if (!t) return;
    setDayTasks(day, (cur) => [...cur, { id: uid(), text: t, done: false }]);
    setDrafts((d) => ({ ...d, [day]: "" }));
  };
  const toggle = (day, id) =>
    setDayTasks(day, (cur) => cur.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  const removeTask = (day, id) =>
    setDayTasks(day, (cur) => cur.filter((x) => x.id !== id));

  const dateLine = new Date().toLocaleString(undefined, {
    month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
  });

  const dayIndex = DAYS.indexOf(activeDay);
  const suggestions = [
    SUGGESTIONS[(dayIndex * 2) % SUGGESTIONS.length],
    SUGGESTIONS[(dayIndex * 2 + 1) % SUGGESTIONS.length],
  ];

  return (
    <>
      {/* Floating calendar FAB */}
      <button
        data-testid="task-fab"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[80] w-14 h-14 rounded-full bg-neu shadow-neu flex items-center justify-center text-brand-blue hover:shadow-neu-hover active:shadow-neu-inset transition-all"
        title="Weekly tasks"
      >
        <CalendarDays size={22} strokeWidth={2.2} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[90] bg-[#ECF0F3]/60 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              data-testid="task-drawer-overlay"
            />
            <motion.div
              className="fixed top-0 right-0 h-full w-full max-w-[400px] z-[95] bg-neu shadow-neu flex flex-col"
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              data-testid="task-drawer"
            >
              <div className="flex items-center justify-between px-6 pt-6 pb-3">
                <h2 className="text-[20px] font-extrabold text-ink tracking-tight">Your Week</h2>
                <button
                  data-testid="task-drawer-close"
                  onClick={() => setOpen(false)}
                  className="text-slate2 hover:text-ink rounded-full p-2 shadow-neu-sm"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-8">
                {DAYS.map((day) => {
                  const isActive = day === activeDay;
                  const dayTasks = tasks[day] || [];
                  return (
                    <motion.div key={day} layout className="border-b border-[#dbe1e8] last:border-0">
                      <button
                        onClick={() => setActiveDay(day)}
                        data-testid={`day-${day.toLowerCase()}`}
                        className="w-full text-left py-5"
                      >
                        <span className={"text-[26px] font-extrabold uppercase tracking-tight transition-colors " + (isActive ? "text-ink" : "text-[#b7c0cc] hover:text-slate2")}>
                          {day}
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {isActive && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="pb-6">
                              {day === todayName() && (
                                <p className="text-[13px] text-slate2 -mt-2 mb-4">{dateLine}</p>
                              )}

                              <div className="space-y-2.5">
                                {dayTasks.map((t) => (
                                  <div key={t.id} className="flex items-center gap-3 group" data-testid={`task-${t.id}`}>
                                    <button
                                      onClick={() => toggle(day, t.id)}
                                      data-testid={`task-toggle-${t.id}`}
                                      className={"w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all " +
                                        (t.done ? "bg-brand-pink shadow-neu-sm text-white" : "shadow-neu-inset text-transparent")}
                                    >
                                      <Check size={13} strokeWidth={3} />
                                    </button>
                                    <span className={"text-[15px] flex-1 transition-all " + (t.done ? "line-through text-brand-pink/80" : "text-ink")}>
                                      {t.text}
                                    </span>
                                    <button
                                      onClick={() => removeTask(day, t.id)}
                                      data-testid={`task-remove-${t.id}`}
                                      className="opacity-0 group-hover:opacity-100 text-slate2 hover:text-brand-pink transition-opacity"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              {/* add task */}
                              <div className="mt-4">
                                <input
                                  data-testid={`task-add-input-${day.toLowerCase()}`}
                                  value={drafts[day] || ""}
                                  onChange={(e) => setDrafts((d) => ({ ...d, [day]: e.target.value }))}
                                  onKeyDown={(e) => e.key === "Enter" && addTask(day, drafts[day])}
                                  placeholder="Add a new task…"
                                  className="w-full bg-transparent border-b border-[#cfd6de] pb-2 text-[15px] text-ink placeholder:text-[#a8b2bf] outline-none focus:border-brand-blue transition-colors"
                                />
                              </div>

                              {/* suggestions */}
                              <div className="mt-6 rounded-2xl shadow-neu-inset p-4">
                                <p className="flex items-center gap-1.5 text-xs font-bold text-brand-purple uppercase tracking-wide mb-3">
                                  <Sparkles size={13} /> Suggested · first 30–60 days
                                </p>
                                <div className="space-y-2.5">
                                  {suggestions.map((s, i) => (
                                    <div key={i} className="flex items-start gap-2.5" data-testid={`suggestion-${i}`}>
                                      <button
                                        onClick={() => addTask(day, s)}
                                        data-testid={`suggestion-add-${i}`}
                                        className="mt-0.5 w-5 h-5 rounded-md shadow-neu-sm flex items-center justify-center text-brand-blue shrink-0 hover:shadow-neu-hover active:shadow-neu-inset transition-all"
                                        title="Add to this day"
                                      >
                                        <Plus size={13} strokeWidth={2.6} />
                                      </button>
                                      <span className="text-[13px] text-slate2 leading-snug">{s}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

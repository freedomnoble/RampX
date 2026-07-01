import React, { useState, useMemo } from "react";
import { GitBranch, Plus, FolderPlus, Trash2, CornerDownRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { NeuCard, NeuInput, NeuTextarea, NeuButton, NeuTag } from "@/components/neu";

export default function DecisionsPage() {
  const { workspace, updateWorkspace, uid } = useApp();
  const ws = workspace || {};
  const projects = ws.projects || [{ id: "default", name: "General" }];
  const goals = ws.goals || [];
  const decisions = ws.decisions || [];

  const [activeProject, setActiveProject] = useState(projects[0]?.id || "default");
  const [newProject, setNewProject] = useState("");
  const [title, setTitle] = useState("");
  const [rationale, setRationale] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTag, setCustomTag] = useState("");
  const [buildsOn, setBuildsOn] = useState("");

  const projectDecisions = useMemo(
    () => decisions.filter((d) => d.project_id === activeProject).sort((a, b) => new Date(a.created_at) - new Date(b.created_at)),
    [decisions, activeProject]
  );

  const addProject = () => {
    if (!newProject.trim()) return;
    const id = uid();
    updateWorkspace((w) => ({ ...w, projects: [...(w.projects || []), { id, name: newProject.trim() }] }));
    setActiveProject(id);
    setNewProject("");
  };

  const toggleTag = (t) =>
    setSelectedTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const addCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags((p) => [...p, customTag.trim()]);
      setCustomTag("");
    }
  };

  const addDecision = () => {
    if (!title.trim()) return;
    updateWorkspace((w) => ({
      ...w,
      decisions: [
        ...(w.decisions || []),
        {
          id: uid(),
          project_id: activeProject,
          title: title.trim(),
          rationale: rationale.slice(0, 160),
          tags: selectedTags,
          parent_id: buildsOn || null,
          created_at: new Date().toISOString(),
        },
      ],
    }));
    setTitle(""); setRationale(""); setSelectedTags([]); setBuildsOn("");
  };

  const remove = (id) =>
    updateWorkspace((w) => ({ ...w, decisions: (w.decisions || []).filter((d) => d.id !== id) }));

  const decisionTitle = (id) => decisions.find((d) => d.id === id)?.title;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 pt-28 pb-16">
      <h1 className="text-4xl font-extrabold text-ink tracking-tight mb-2 animate-fade-up flex items-center gap-3">
        <GitBranch className="text-brand-blue" /> Decision Tree
      </h1>
      <p className="text-[15px] text-slate2 mb-8">Document what you decided, and why — tagged to company goals. Read it back like a timeline.</p>

      {/* Project selector */}
      <div className="flex flex-wrap items-center gap-2 mb-6" data-testid="project-tabs">
        {projects.map((p) => (
          <button key={p.id} onClick={() => setActiveProject(p.id)} data-testid={`project-${p.id}`}
            className={"rounded-full px-4 py-2 text-sm font-semibold transition-all " +
              (activeProject === p.id ? "shadow-neu-inset text-brand-blue" : "shadow-neu text-slate2 hover:text-ink")}>
            {p.name}
          </button>
        ))}
        <div className="flex items-center gap-2 ml-2">
          <NeuInput data-testid="project-name" className="!py-2 !px-4 w-44 text-sm" placeholder="New project" value={newProject} onChange={(e) => setNewProject(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addProject()} />
          <button onClick={addProject} data-testid="project-add" className="text-brand-purple p-2.5 rounded-full shadow-neu hover:shadow-neu-hover active:shadow-neu-inset"><FolderPlus size={16} /></button>
        </div>
      </div>

      {/* Add decision */}
      <NeuCard className="p-6 mb-10" data-testid="decision-form">
        <h3 className="text-[16px] font-bold text-ink mb-4">Log a decision</h3>
        <div className="space-y-3">
          <NeuInput data-testid="decision-title" placeholder="What did you decide?" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div>
            <NeuTextarea data-testid="decision-rationale" rows={2} maxLength={160} placeholder="Why? (max 160 characters)" value={rationale} onChange={(e) => setRationale(e.target.value)} />
            <p className="text-xs text-slate2 text-right mt-1">{rationale.length}/160</p>
          </div>

          <div>
            <p className="text-xs font-bold text-slate2 uppercase tracking-wide mb-2">Tag to goals</p>
            <div className="flex flex-wrap gap-2">
              {goals.map((g) => (
                <button key={g.id} onClick={() => toggleTag(g.title)} data-testid={`tag-goal-${g.id}`}
                  className={"text-xs font-bold px-3 py-1.5 rounded-full transition-all " +
                    (selectedTags.includes(g.title) ? "shadow-neu-inset text-brand-blue" : "shadow-neu-sm text-slate2")}>
                  {g.title}
                </button>
              ))}
              {goals.length === 0 && <span className="text-xs text-slate2">Add goals first to tag them.</span>}
            </div>
            <div className="flex items-center gap-2 mt-3">
              <NeuInput data-testid="custom-tag" className="!py-2 !px-4 text-sm max-w-xs" placeholder="Add a personal sub-goal tag" value={customTag} onChange={(e) => setCustomTag(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCustomTag()} />
              <button onClick={addCustomTag} data-testid="custom-tag-add" className="text-brand-pink p-2.5 rounded-full shadow-neu"><Plus size={15} /></button>
            </div>
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedTags.map((t) => <NeuTag key={t} color="purple">{t}</NeuTag>)}
              </div>
            )}
          </div>

          {projectDecisions.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate2 uppercase tracking-wide mb-2">Builds on (optional)</p>
              <select data-testid="builds-on" value={buildsOn} onChange={(e) => setBuildsOn(e.target.value)}
                className="w-full bg-neu rounded-2xl px-4 py-3 text-ink shadow-neu-inset outline-none text-sm">
                <option value="">— None —</option>
                {projectDecisions.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
              </select>
            </div>
          )}

          <NeuButton data-testid="decision-add" onClick={addDecision} className="w-full py-2.5 text-sm"><Plus size={15} className="inline mr-2" /> Add to timeline</NeuButton>
        </div>
      </NeuCard>

      {/* Timeline */}
      <h3 className="text-[18px] font-bold text-ink mb-5">Timeline</h3>
      {projectDecisions.length === 0 ? (
        <p className="text-center text-slate2 text-sm py-6">No decisions logged for this project yet.</p>
      ) : (
        <div className="relative pl-8" data-testid="decision-timeline">
          <div className="absolute left-[11px] top-2 bottom-2 w-[3px] rounded-full bg-[#d9dfe6] shadow-[inset_1px_1px_2px_rgba(166,180,200,0.8)]" />
          <div className="space-y-6">
            {projectDecisions.map((d) => (
              <div key={d.id} className="relative" data-testid={`decision-${d.id}`}>
                <div className="absolute -left-8 top-3 w-6 h-6 rounded-full bg-neu shadow-neu-inset flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-brand-blue" />
                </div>
                <NeuCard className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[16px] font-bold text-ink">{d.title}</p>
                      <p className="text-xs text-slate2 mt-0.5">{new Date(d.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p>
                    </div>
                    <button onClick={() => remove(d.id)} data-testid={`decision-remove-${d.id}`} className="text-slate2 hover:text-brand-pink p-2 rounded-full shadow-neu-sm shrink-0"><Trash2 size={14} /></button>
                  </div>
                  {d.rationale && <p className="text-[14px] text-slate2 mt-2 leading-relaxed">{d.rationale}</p>}
                  {d.parent_id && decisionTitle(d.parent_id) && (
                    <p className="flex items-center gap-1.5 text-xs text-brand-purple font-semibold mt-2"><CornerDownRight size={13} /> builds on "{decisionTitle(d.parent_id)}"</p>
                  )}
                  {d.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {d.tags.map((t) => <NeuTag key={t} color="blue">{t}</NeuTag>)}
                    </div>
                  )}
                </NeuCard>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

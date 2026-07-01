import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { NeuButton, NeuInput } from "@/components/neu";

export default function AuthModal({ open, onClose, initialMode = "register", onSuccess }) {
  const { register, login } = useApp();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) { setMode(initialMode); setError(""); }
  }, [open, initialMode]);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = mode === "register"
      ? await register(email, password, name)
      : await login(email, password);
    setLoading(false);
    if (res.ok) { onClose(); onSuccess && onSuccess(); }
    else setError(res.error);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#ECF0F3]/70 backdrop-blur-sm"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        data-testid="auth-modal"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
          className="bg-neu rounded-3xl shadow-neu p-8 w-full max-w-md relative"
        >
          <button onClick={onClose} data-testid="auth-close" className="absolute top-5 right-5 text-slate2 hover:text-ink rounded-full p-2 shadow-neu-sm">
            <X size={18} />
          </button>
          <h2 className="text-[24px] font-bold text-ink mb-1">
            {mode === "register" ? "Save your dashboard" : "Welcome back"}
          </h2>
          <p className="text-[15px] text-slate2 mb-6">
            {mode === "register"
              ? "Create an account to keep your board, goals and decisions."
              : "Sign in to load your saved workspace."}
          </p>
          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <NeuInput data-testid="auth-name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
            )}
            <NeuInput data-testid="auth-email" type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <NeuInput data-testid="auth-password" type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <p className="text-brand-pink text-sm font-semibold" data-testid="auth-error">{error}</p>}
            <NeuButton data-testid="auth-submit" type="submit" disabled={loading} className="w-full">
              {loading ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}
            </NeuButton>
          </form>
          <button
            data-testid="auth-toggle"
            onClick={() => { setMode(mode === "register" ? "login" : "register"); setError(""); }}
            className="mt-5 text-sm text-slate2 hover:text-brand-blue w-full text-center font-semibold"
          >
            {mode === "register" ? "Already have an account? Sign in" : "Need an account? Create one"}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

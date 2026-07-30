import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { api, apiErr } from "@/lib/api";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const uid = () => Math.random().toString(36).slice(2, 10);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null); // null = anon, object = logged in
  const [authChecked, setAuthChecked] = useState(false);
  const [workspace, setWorkspace] = useState(null);
  const saveTimer = useRef(null);

  // Load local workspace on boot
  useEffect(() => {
    const local = localStorage.getItem("rampx_workspace");
    if (local) {
      try { setWorkspace(JSON.parse(local)); } catch {}
    }
    const token = localStorage.getItem("rampx_token");
    if (token) {
      api.get("/auth/me")
        .then(async ({ data }) => {
          setUser(data);
          const ws = await api.get("/workspace");
          if (ws.data?.data) {
            setWorkspace(ws.data.data);
            localStorage.setItem("rampx_workspace", JSON.stringify(ws.data.data));
          }
        })
        .catch(() => localStorage.removeItem("rampx_token"))
        .finally(() => setAuthChecked(true));
    } else {
      setAuthChecked(true);
    }
  }, []);

  const persist = useCallback((ws, loggedIn) => {
    localStorage.setItem("rampx_workspace", JSON.stringify(ws));
    if (loggedIn) {
      clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        api.put("/workspace", { data: ws }).catch(() => {});
      }, 700);
    }
  }, []);

  const updateWorkspace = useCallback((updater) => {
    setWorkspace((prev) => {
      const base = prev || {};
      const next = typeof updater === "function" ? updater(base) : { ...base, ...updater };
      persist(next, !!user);
      return next;
    });
  }, [persist, user]);

  const research = async (company_name, product_area, url = "") => {
    const { data } = await api.post("/research", { company_name, product_area, url });
    const ws = {
      ...data,
      goals: (data.goals_suggestions || []).slice(0, 3).map((t) => ({ id: uid(), title: t, description: "", source: "suggested" })),
      board: [],
      projects: [{ id: "default", name: "General" }],
      decisions: [],
      flashcards: data.flashcards || [],
    };
    setWorkspace(ws);
    persist(ws, !!user);
    return ws;
  };

  const register = async (email, password, name) => {
    try {
      const { data } = await api.post("/auth/register", { email, password, name });
      localStorage.setItem("rampx_token", data.access_token);
      setUser(data.user);
      // persist current local workspace to the account
      const local = localStorage.getItem("rampx_workspace");
      if (local) await api.put("/workspace", { data: JSON.parse(local) }).catch(() => {});
      return { ok: true };
    } catch (e) {
      return { ok: false, error: apiErr(e.response?.data?.detail) || e.message };
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("rampx_token", data.access_token);
      setUser(data.user);
      const ws = await api.get("/workspace");
      if (ws.data?.data) {
        setWorkspace(ws.data.data);
        localStorage.setItem("rampx_workspace", JSON.stringify(ws.data.data));
      } else {
        const local = localStorage.getItem("rampx_workspace");
        if (local) await api.put("/workspace", { data: JSON.parse(local) }).catch(() => {});
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: apiErr(e.response?.data?.detail) || e.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("rampx_token");
    setUser(null);
  };

  const resetWorkspace = () => {
    localStorage.removeItem("rampx_workspace");
    setWorkspace(null);
  };

  return (
    <AppContext.Provider value={{
      user, authChecked, workspace, updateWorkspace, research,
      register, login, logout, resetWorkspace, uid,
    }}>
      {children}
    </AppContext.Provider>
  );
}

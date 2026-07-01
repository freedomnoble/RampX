import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Building2, Users, Swords, Target, GitBranch, GraduationCap, LogIn, LogOut } from "lucide-react";
import { useApp } from "@/context/AppContext";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/company", label: "Company", icon: Building2 },
  { to: "/board", label: "Board", icon: Users },
  { to: "/competitors", label: "Competitors", icon: Swords },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/decisions", label: "Decisions", icon: GitBranch },
  { to: "/learning", label: "Learning", icon: GraduationCap },
];

export default function TopNav({ onAuthOpen }) {
  const { user, logout } = useApp();
  const navigate = useNavigate();

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-fit" data-testid="top-nav">
      <div className="bg-neu rounded-full shadow-neu px-2 py-2 flex items-center gap-1 overflow-x-auto no-scrollbar">
        <span className="hidden sm:flex items-center px-4 font-extrabold text-ink tracking-tight select-none">
          ramp<span className="text-brand-blue">X</span>
        </span>
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            data-testid={`nav-${label.toLowerCase()}`}
            className={({ isActive }) =>
              "flex items-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-semibold transition-all duration-200 whitespace-nowrap " +
              (isActive
                ? "shadow-neu-inset text-brand-blue"
                : "text-slate2 hover:text-ink")
            }
          >
            <Icon size={17} strokeWidth={2.2} />
            <span className="hidden lg:inline">{label}</span>
          </NavLink>
        ))}
        <div className="pl-1">
          {user ? (
            <button
              data-testid="nav-logout"
              onClick={() => { logout(); navigate("/dashboard"); }}
              className="flex items-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-semibold text-slate2 hover:text-brand-pink shadow-neu-sm transition-all whitespace-nowrap"
            >
              <LogOut size={17} strokeWidth={2.2} />
              <span className="hidden lg:inline">Sign out</span>
            </button>
          ) : (
            <button
              data-testid="nav-signin"
              onClick={onAuthOpen}
              className="flex items-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-bold text-brand-blue shadow-neu-sm hover:shadow-neu transition-all"
            >
              <LogIn size={17} strokeWidth={2.2} />
              <span className="hidden md:inline">Save</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import React from "react";

const cx = (...c) => c.filter(Boolean).join(" ");

export function NeuCard({ className, children, inset, hover, ...props }) {
  return (
    <div
      className={cx(
        "bg-neu rounded-3xl transition-all duration-300",
        inset ? "shadow-neu-inset" : "shadow-neu",
        hover && "hover:shadow-neu-hover",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function NeuButton({ className, children, variant = "primary", ...props }) {
  const color =
    variant === "primary" ? "text-brand-blue"
    : variant === "secondary" ? "text-brand-purple"
    : variant === "pink" ? "text-brand-pink"
    : "text-slate2";
  return (
    <button
      className={cx(
        "bg-neu rounded-full font-bold px-6 py-3 shadow-neu",
        "hover:shadow-neu-hover active:shadow-neu-inset transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        color, className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function NeuIconButton({ className, children, active, ...props }) {
  return (
    <button
      className={cx(
        "bg-neu rounded-2xl p-3 flex items-center justify-center transition-all duration-200",
        active ? "shadow-neu-inset text-brand-blue" : "shadow-neu hover:shadow-neu-hover text-slate2",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function NeuInput({ className, ...props }) {
  return (
    <input
      className={cx(
        "w-full bg-neu rounded-2xl px-5 py-4 text-ink shadow-neu-inset outline-none",
        "border-none focus:ring-2 focus:ring-brand-blue/40 transition-all placeholder:text-[#A6B4C8]",
        className
      )}
      {...props}
    />
  );
}

export function NeuTextarea({ className, ...props }) {
  return (
    <textarea
      className={cx(
        "w-full bg-neu rounded-2xl px-5 py-4 text-ink shadow-neu-inset outline-none resize-none",
        "border-none focus:ring-2 focus:ring-brand-blue/40 transition-all placeholder:text-[#A6B4C8]",
        className
      )}
      {...props}
    />
  );
}

export function NeuTag({ children, color = "pink", className, ...props }) {
  const c =
    color === "blue" ? "text-brand-blue"
    : color === "purple" ? "text-brand-purple"
    : "text-brand-pink";
  return (
    <span
      className={cx(
        "inline-flex items-center bg-neu text-xs font-bold px-3 py-1 rounded-full shadow-neu-sm",
        c, className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

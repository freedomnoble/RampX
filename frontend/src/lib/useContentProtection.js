import { useEffect } from "react";

// Best-effort deterrent against screenshots, printing, copying and casual scraping
// of protected content (elements carrying the `.protect` class).
export function useContentProtection() {
  useEffect(() => {
    const hide = () => document.body.classList.add("app-hidden");
    const show = () => document.body.classList.remove("app-hidden");

    const onVis = () => (document.hidden ? hide() : show());
    const onCtx = (e) => { if (e.target.closest && e.target.closest(".protect")) e.preventDefault(); };
    const onCopy = (e) => {
      if (e.target.closest && e.target.closest(".protect")) {
        e.preventDefault();
        try { e.clipboardData.setData("text/plain", ""); } catch {}
      }
    };
    const onKey = (e) => {
      // PrintScreen: momentarily blur + wipe clipboard
      if (e.key === "PrintScreen") {
        hide();
        try { navigator.clipboard && navigator.clipboard.writeText(""); } catch {}
        setTimeout(show, 1400);
      }
      // Block Save / Print of the page
      if ((e.ctrlKey || e.metaKey) && ["s", "p"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    document.addEventListener("visibilitychange", onVis);
    document.addEventListener("contextmenu", onCtx);
    document.addEventListener("copy", onCopy);
    document.addEventListener("keydown", onKey);
    window.addEventListener("blur", hide);
    window.addEventListener("focus", show);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      document.removeEventListener("contextmenu", onCtx);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("blur", hide);
      window.removeEventListener("focus", show);
      show();
    };
  }, []);
}

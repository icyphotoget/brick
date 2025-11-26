import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // zatvaranje dropdowna kad klikneš izvan njega
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goToLogin = () => {
    setOpen(false);
    navigate("/login");
  };

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs font-semibold text-slate-800 shadow-md transition hover:bg-slate-50 hover:shadow-lg"
      >
        <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
        <span>Log in</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200 bg-white p-3 text-xs shadow-xl shadow-slate-300/70 z-50">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
            Continue with
          </p>

          <button
            type="button"
            onClick={goToLogin}
            className="mb-2 flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-[11px] font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-white"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow">
              <span className="text-[12px] font-black text-[#4285F4]">
                G
              </span>
            </span>
            <span>Sign in with Google</span>
          </button>

          <button
            type="button"
            onClick={goToLogin}
            className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-[11px] font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
          >
            <span className="text-base">📧</span>
            <span>Continue with email</span>
          </button>

          <p className="mt-3 text-[10px] leading-snug text-slate-400">
            We only use your account to identify your bricks on the wall.
          </p>
        </div>
      )}
    </div>
  );
}

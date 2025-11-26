import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!user) return null;

  const email = user.email ?? "";
  const fullName =
    (user.user_metadata && (user.user_metadata.full_name as string)) || "";
  const displayName = fullName || email || "User";

  const initials = (() => {
    if (fullName) {
      const parts = fullName.split(" ").filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0][0].toUpperCase();
    }
    if (email) return email[0].toUpperCase();
    return "U";
  })();

  const goMyBricks = () => {
    setOpen(false);
    navigate("/my-bricks");
  };

  const goSettings = () => {
    setOpen(false);
    // za sada placeholder – možeš kasnije napraviti /settings
    // navigate("/settings");
    alert("Settings coming soon 😄");
  };

  const handleLogout = async () => {
    setOpen(false);
    await signOut();
  };

  return (
    <div className="relative" ref={ref}>
      {/* Avatar trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-slate-800 shadow-sm hover:bg-white hover:shadow-md transition"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-brickYellow shadow-inner">
          {initials}
        </div>
        <span className="hidden max-w-[120px] truncate text-[11px] text-slate-600 sm:inline">
          {displayName}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-3 text-xs shadow-xl shadow-slate-300/70 z-50">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-[12px] font-bold text-brickYellow">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[12px] font-semibold text-slate-800">
                {displayName}
              </div>
              {email && (
                <div className="truncate text-[11px] text-slate-500">
                  {email}
                </div>
              )}
            </div>
          </div>

          <div className="mb-2 h-px bg-slate-100" />

          <button
            onClick={goMyBricks}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[12px] text-slate-800 hover:bg-slate-50"
          >
            <span className="text-sm">🧱</span>
            <span>My bricks</span>
          </button>

          <button
            onClick={goSettings}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[12px] text-slate-800 hover:bg-slate-50"
          >
            <span className="text-sm">⚙️</span>
            <span>Account settings</span>
          </button>

          <div className="mt-2 h-px bg-slate-100" />

          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-[12px] font-medium text-rose-600 hover:bg-rose-50"
          >
            <span className="text-sm">↩</span>
            <span>Log out</span>
          </button>
        </div>
      )}
    </div>
  );
}

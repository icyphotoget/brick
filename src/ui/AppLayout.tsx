import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import LoginMenu from "./LoginMenu";
import UserMenu from "./UserMenu";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-sky flex flex-col">
      {/* HEADER */}
      <header className="w-full border-b border-white/40 bg-sky/80 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:flex-nowrap">
          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 shadow-sm hover:bg-white"
          >
            <div className="h-7 w-7 rounded-brick bg-brickYellow shadow" />
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                The Internet
              </span>
              <span className="text-sm font-bold text-slate-900">
                Brick Wall
              </span>
            </div>
          </Link>

          {/* RIGHT SIDE: nav items */}
          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
            {/* Simple inline nav (can extend later) */}
            <div className="hidden text-xs font-medium text-slate-700 sm:flex sm:items-center sm:gap-4">
              <Link
                to="/wall"
                className="rounded-full px-3 py-1 hover:bg-white/60"
              >
                View wall
              </Link>
              {user && (
                <Link
                  to="/my-bricks"
                  className="rounded-full px-3 py-1 hover:bg-white/60"
                >
                  My bricks
                </Link>
              )}
            </div>

            {/* Auth menu */}
            {!user ? <LoginMenu /> : <UserMenu />}

            {/* CTA: Buy a brick */}
            <button
              onClick={() => navigate("/wall#buy")}
              className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 sm:px-4 sm:text-sm"
            >
              Buy a brick
            </button>
          </div>
        </nav>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 relative z-0">{children}</main>

      {/* FOOTER (optional, quick mobile nice touch) */}
      <footer className="border-t border-white/40 bg-sky/80">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3 text-[11px] text-slate-600 sm:text-xs">
          <span>© {new Date().getFullYear()} Brick Wall</span>
          <span className="opacity-80">
            Built with 🧱, chaos & Solana dreams
          </span>
        </div>
      </footer>
    </div>
  );
}

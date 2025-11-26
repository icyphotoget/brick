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
      {/* HEADER NA VRHU S VISOKIM Z-INDEXOM */}
      <header className="relative z-40 w-full border-b border-white/40 bg-sky/80 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          {/* LOGO */}
          <div className="flex items-center gap-2">
            <span
              className="text-3xl font-black text-brickYellow drop-shadow-sm cursor-pointer"
              onClick={() => navigate("/")}
            >
              Brick
            </span>
          </div>

          {/* NAV LINKS (DESKTOP) */}
          <div className="hidden items-center gap-6 text-sm font-medium text-slate-700 md:flex">
            <Link to="/wall">Wall</Link>

            {user && <Link to="/my-bricks">My Bricks</Link>}

            {/* Ako nije logiran → LoginMenu, ako je → UserMenu */}
            {user ? <UserMenu /> : <LoginMenu />}

            <button
              className="rounded-full bg-brickYellow px-4 py-2 text-slate-900 shadow-md"
              onClick={() => navigate("/wall#buy")}
            >
              Buy a brick
            </button>
          </div>
        </nav>
      </header>

      {/* CONTENT */}
      <main className="flex-1 relative z-0">{children}</main>
    </div>
  );
}

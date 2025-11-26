// src/ui/AppLayout.tsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

type AppLayoutProps = {
  children: React.ReactNode;
};

function WalletConnectButton() {
  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();

  const handleClick = () => {
    setVisible(true);
  };

  const shortAddress =
    connected && publicKey
      ? `${publicKey.toBase58().slice(0, 4)}…${publicKey
          .toBase58()
          .slice(-4)}`
      : null;

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur hover:border-slate-500 hover:bg-white transition"
    >
      <span
        className={`h-2 w-2 rounded-full ${
          connected ? "bg-emerald-400" : "bg-slate-300"
        }`}
      />
      <span>{shortAddress ?? "Select wallet"}</span>
    </button>
  );
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const onWallPage = location.pathname === "/wall";
  const onMyBricksPage = location.pathname === "/my-bricks";

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/");
    } catch (err: any) {
      alert("Logout failed: " + err.message);
    }
  };

  const handleBuyClick = () => {
    navigate("/wall#buy");
  };

  const AuthButton = () =>
    user ? (
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm hover:bg-white"
      >
        Log out
      </button>
    ) : (
      <button
        type="button"
        onClick={() => navigate("/login")}
        className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm hover:bg-white"
      >
        Log in
      </button>
    );

  return (
    <div className="min-h-screen bg-sky flex flex-col">
      {/* NAVBAR */}
      <header className="w-full border-b border-white/40 bg-sky/80 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          {/* Left: logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brickYellow shadow-sm">
              <span className="text-xs font-black text-slate-900">🧱</span>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                THE INTERNET
              </span>
              <span className="text-sm font-bold text-slate-900">
                Brick Wall
              </span>
            </div>
          </Link>

          {/* Right: links + actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View wall link */}
            <Link
              to="/wall"
              className={`hidden sm:inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
                onWallPage
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-700 hover:bg-white/60"
              }`}
            >
              View wall
            </Link>

            {/* My bricks link – only when logged in */}
            {user && (
              <Link
                to="/my-bricks"
                className={`hidden sm:inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${
                  onMyBricksPage
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-700 hover:bg-white/60"
                }`}
              >
                My bricks
              </Link>
            )}

            {/* Wallet connect */}
            <WalletConnectButton />

            {/* Auth button */}
            <AuthButton />

            {/* Primary CTA: Buy a brick */}
            <button
              type="button"
              onClick={handleBuyClick}
              className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-slate-800"
            >
              Buy a brick
            </button>
          </div>
        </nav>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}

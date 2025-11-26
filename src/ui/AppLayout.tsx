// src/ui/AppLayout.tsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

type Props = {
  children: React.ReactNode;
};

function shortenPubkey(pk: string) {
  return pk.slice(0, 4) + "…" + pk.slice(-4);
}

export default function AppLayout({ children }: Props) {
  const { user, signOut, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { publicKey, connected } = useWallet();
  const { setVisible } = useWalletModal();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err: any) {
      alert("Google login failed: " + err.message);
    }
  };

  const handleBuyBrick = () => {
    navigate("/wall#buy");
    setMenuOpen(false);
  };

  const handleMyBricks = () => {
    navigate("/my-bricks");
    setMenuOpen(false);
  };

  const handleLogoClick = () => {
    if (location.pathname === "/") return;
    navigate("/");
  };

  const handleWalletClick = () => {
    setVisible(true);
    setMenuOpen(false);
  };

  const topButtonBase =
    "inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm hover:bg-white";

  let menuLabel: string;
  if (user?.email) {
    menuLabel = user.email.split("@")[0]; // part before @
  } else if (connected && publicKey) {
    menuLabel = shortenPubkey(publicKey.toBase58());
  } else {
    menuLabel = "Menu";
  }

  const handleToggleMenu = () => {
    setMenuOpen((open) => !open);
  };

  return (
    <div className="min-h-screen bg-sky flex flex-col">
      <header className="w-full border-b border-white/40 bg-sky/80 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          {/* LOGO */}
          <button
            type="button"
            onClick={handleLogoClick}
            className="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm hover:bg-white"
          >
            <span className="h-6 w-6 rounded-full bg-brickYellow" />
            <div className="flex flex-col leading-none">
              <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                THE INTERNET
              </span>
              <span className="text-xs font-bold">Brick Wall</span>
            </div>
          </button>

          {/* RIGHT SIDE ACTIONS */}
          <div className="flex items-center gap-2">
            {/* Single menu button with dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={handleToggleMenu}
                className={topButtonBase}
              >
                <span className="text-sm">☰</span>
                <span>{menuLabel}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 z-50 mt-2 w-40 rounded-2xl border border-white/70 bg-white/95 py-2 text-xs text-slate-800 shadow-lg">
                  {user && (
                    <button
                      type="button"
                      onClick={handleMyBricks}
                      className="flex w-full items-center px-3 py-1.5 text-left hover:bg-slate-50"
                    >
                      🧱 My bricks
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleWalletClick}
                    className="flex w-full items-center px-3 py-1.5 text-left hover:bg-slate-50"
                  >
                    💼 Select wallet
                  </button>

                  <div className="my-1 h-px bg-slate-100" />

                  {user ? (
                    <button
                      type="button"
                      onClick={() => {
                        signOut();
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center px-3 py-1.5 text-left text-red-500 hover:bg-slate-50"
                    >
                      ⎋ Log out
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        await handleGoogleLogin();
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center px-3 py-1.5 text-left hover:bg-slate-50"
                    >
                      🔑 Log in
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Primary CTA */}
            <button
              type="button"
              onClick={handleBuyBrick}
              className="ml-1 inline-flex items-center rounded-full bg-brickYellow px-4 py-1.5 text-xs font-semibold text-slate-900 shadow-md hover:brightness-105"
            >
              Buy a brick
            </button>
          </div>
        </nav>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}

// src/pages/LoginPage.tsx
import React, { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

export default function LoginPage() {
  const { signInWithGoogle, signInWithMagicLink, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [sendingLink, setSendingLink] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { publicKey } = useWallet();

  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get("redirect") || "/";

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate(redirect);
    } catch (err: any) {
      alert("Google login failed: " + err.message);
    }
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      alert("Please enter your email.");
      return;
    }
    try {
      setSendingLink(true);
      await signInWithMagicLink(email.trim(), redirect);
      alert("Magic login link sent! Check your email.");
    } catch (err: any) {
      alert("Email login failed: " + err.message);
    } finally {
      setSendingLink(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] items-center justify-center bg-sky px-4">
      <div className="w-full max-w-md rounded-3xl bg-white/95 p-6 shadow-xl">
        <h1 className="text-xl font-bold text-slate-900">
          Log in to claim your brick
        </h1>
        <p className="mt-1 text-xs text-slate-600">
          Use Google or email for your Brick Wall account. You can also connect
          your Solana wallet for payments.
        </p>

        {/* CONTINUE WITH */}
        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-slate-800 disabled:opacity-60"
          >
            <span>Continue with Google</span>
          </button>

          <form onSubmit={handleEmailSubmit} className="space-y-2">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Or continue with email
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
            <button
              type="submit"
              disabled={sendingLink}
              className="flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:opacity-60"
            >
              {sendingLink ? "Sending magic link..." : "Send magic login link"}
            </button>
          </form>
        </div>

        {/* SOLANA WALLET SECTION */}
        <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-700">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Connect Solana wallet
          </div>
          <p className="mb-3 text-[11px] text-slate-600">
            This connects your wallet for SOL / USDC payments. Your Brick Wall
            account is still based on your Google or email login.
          </p>
          <div className="flex flex-col gap-2">
            <WalletMultiButton />
            {publicKey && (
              <div className="text-[11px] text-slate-500">
                Connected wallet:{" "}
                <span className="font-mono">
                  {publicKey.toBase58().slice(0, 4)}…
                  {publicKey.toBase58().slice(-4)}
                </span>
              </div>
            )}
          </div>
        </div>

        <p className="mt-4 text-[11px] text-slate-500">
          After logging in, head to the wall and click any empty brick to buy
          it. 🧱
        </p>
      </div>
    </div>
  );
}

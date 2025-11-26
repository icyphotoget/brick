import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setError(null);
    try {
      await signInWithEmail(email);
      setSent(true);
    } catch (err: any) {
      setError(err?.message ?? "Failed to send magic link");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err?.message ?? "Google login failed");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white/80 p-6 shadow-lg backdrop-blur">
        <h1 className="mb-1 text-center text-2xl font-bold text-slate-900">
          Log in
        </h1>
        <p className="mb-6 text-center text-sm text-slate-600">
          Claim your bricks, edit your messages, and flex on the timeline.
        </p>

        {/* EMAIL FORM */}
        <form onSubmit={handleEmailSubmit} className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
            Email address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@internet.com"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          />
          <button
            type="submit"
            disabled={submitting}
            className="mt-1 w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Sending..." : "Send magic link"}
          </button>
        </form>

        {/* STATUS */}
        {sent && (
          <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            Magic link sent! Check your email on this device.
          </p>
        )}
        {error && (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </p>
        )}

        {/* DIVIDER */}
        <div className="my-5 flex items-center gap-3 text-[11px] text-slate-500">
          <div className="h-px flex-1 bg-slate-200" />
          <span>or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* GOOGLE BUTTON */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span>Continue with Google</span>
        </button>

        <p className="mt-6 text-center text-[11px] text-slate-500">
          <Link to="/" className="font-medium text-slate-700 underline">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}

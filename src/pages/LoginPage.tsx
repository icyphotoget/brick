import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function LoginPage() {
  const { signInWithEmail, signInWithGoogle, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await signInWithEmail(email); // baca error ako ne valja
      setSent(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error sending magic link.");
    }

    setSubmitting(false);
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    setError(null);

    try {
      await signInWithGoogle(); // Supabase OAuth redirect
      // na uspjeh ionako ide redirect
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google sign-in failed.");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-14">
      {/* Title */}
      <h1 className="text-3xl font-black text-slate-900">Sign in</h1>
      <p className="mt-1 text-sm text-slate-600">
        Choose your preferred sign-in method.
      </p>

      {/* Optional: show loading state, but does NOT block buttons */}
      {loading && (
        <p className="mt-3 text-[12px] text-slate-500">
          Initializing authentication…
        </p>
      )}

      {/* Google Login */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={submitting}
        className={`mt-6 mb-4 flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow hover:bg-slate-100 transition ${
          submitting ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt=""
          className="h-5 w-5"
        />
        {submitting ? "Connecting…" : "Sign in with Google"}
      </button>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-300/40" />
        <span className="text-xs text-slate-500">or</span>
        <div className="h-px flex-1 bg-slate-300/40" />
      </div>

      {/* Email Login */}
      {sent ? (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-800">
          Magic link sent to <strong>{email}</strong> — check your inbox!
        </div>
      ) : (
        <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email…"
            className="w-full rounded-xl border border-slate-300/40 bg-white/80 px-4 py-3 text-sm shadow-inner outline-none focus:border-sky-400"
          />

          <button
            type="submit"
            disabled={submitting}
            className={`rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-slate-800 transition ${
              submitting ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {submitting ? "Sending…" : "Send magic link"}
          </button>
        </form>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Back link */}
      <div className="mt-8 text-center">
        <Link
          to="/"
          className="text-sm text-slate-600 underline-offset-4 hover:underline"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

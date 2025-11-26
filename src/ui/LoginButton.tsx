import { useState, useRef, useEffect } from "react";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabaseClient";

export default function LoginButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const { user } = useAuth();

  // close dropdown when clicking outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const signInGoogle = async () => {
    setOpen(false);

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth/callback"
      }
    });
  };

  const signInEmailMagicLink = async () => {
    const email = prompt("Enter your email for magic link:");
    if (!email) return;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
    });

    if (error) alert(error.message);
    else alert("Magic link sent, check your inbox!");
  };

  return (
    <div className="relative" ref={ref}>
      {/* Main button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-md hover:bg-slate-50 transition"
      >
        {user ? "Account" : "Log in"}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200 p-3 animate-fadeIn z-50">

          {/* Google */}
          <button
            onClick={signInGoogle}
            className="w-full flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50 transition"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              className="w-5 h-5"
            />
            <span className="text-sm font-medium text-slate-800">
              Sign in with Google
            </span>
          </button>

          {/* Email login */}
          <button
            onClick={signInEmailMagicLink}
            className="w-full mt-2 flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50 transition"
          >
            <span className="text-slate-600 text-xl">📧</span>
            <span className="text-sm font-medium text-slate-800">
              Send Magic Link
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

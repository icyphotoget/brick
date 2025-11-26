import { useState } from "react";
import { signInWithGoogle } from "../lib/auth";

type Props = {
  className?: string;
};

export default function GoogleSignInButton({ className = "" }: Props) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
      // Supabase će redirectat, pa tu ne moramo raditi ništa dalje
    } catch (e: any) {
      alert("Google sign-in failed: " + e.message);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white shadow">
        <span className="text-[12px] font-black text-[#4285F4]">G</span>
      </span>
      <span>{loading ? "Signing in..." : "Sign in with Google"}</span>
    </button>
  );
}

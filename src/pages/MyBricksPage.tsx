import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabaseClient";

type Brick = {
  id: string;
  brick_index: number;
  color: string | null;
  message: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  x_url: string | null;
};

export default function MyBricksPage() {
  const { user } = useAuth();
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("bricks")
        .select("*")
        .eq("owner_id", user.id)
        .order("brick_index", { ascending: true });
      if (!error && data) setBricks(data as Brick[]);
      setLoading(false);
    };
    load();
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-2xl flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-3 text-2xl font-bold text-slate-900 sm:text-3xl">
          You’re not logged in
        </h1>
        <p className="mb-5 text-sm text-slate-600 sm:text-base">
          Log in to see the bricks you own, edit your messages, and show off
          your questionable investments.
        </p>
        <Link
          to="/login"
          className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <h1 className="mb-2 text-center text-2xl font-bold text-slate-900 sm:text-3xl">
        My bricks
      </h1>
      <p className="mb-6 text-center text-sm text-slate-600 sm:text-base">
        All the bricks you&apos;ve claimed on the wall. You&apos;re basically a
        digital landlord now.
      </p>

      {loading ? (
        <p className="text-center text-sm text-slate-500">Loading bricks…</p>
      ) : bricks.length === 0 ? (
        <div className="mx-auto max-w-md rounded-2xl bg-white/80 p-5 text-center text-sm text-slate-700 shadow">
          <p className="mb-3">
            You don&apos;t own any bricks yet. This is tragic but fixable.
          </p>
          <Link
            to="/wall#buy"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            Buy your first brick
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bricks.map((brick) => {
            const colorClass =
              brick.color === "yellow"
                ? "bg-brickYellow"
                : brick.color === "blue"
                ? "bg-brickBlue"
                : brick.color === "pink"
                ? "bg-brickPink"
                : brick.color === "green"
                ? "bg-brickGreen"
                : "bg-brickOrange";

            return (
              <div
                key={brick.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm"
              >
                <div
                  className={`mb-3 h-16 w-full rounded-brick ${colorClass} shadow-inner`}
                />
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Brick #{brick.brick_index}
                </div>
                {brick.message ? (
                  <p className="mb-3 text-sm text-slate-800">
                    {brick.message}
                  </p>
                ) : (
                  <p className="mb-3 text-sm italic text-slate-500">
                    No message. Silent but deadly.
                  </p>
                )}

                <div className="mt-auto space-y-2 text-[11px] text-slate-600">
                  <p className="font-semibold text-slate-700">
                    Linked socials:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {brick.facebook_url && (
                      <a
                        href={brick.facebook_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 hover:bg-slate-200"
                      >
                        <span>📘</span>
                        <span>Facebook</span>
                      </a>
                    )}
                    {brick.instagram_url && (
                      <a
                        href={brick.instagram_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 hover:bg-slate-200"
                      >
                        <span>📸</span>
                        <span>Instagram</span>
                      </a>
                    )}
                    {brick.youtube_url && (
                      <a
                        href={brick.youtube_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 hover:bg-slate-200"
                      >
                        <span>▶️</span>
                        <span>YouTube</span>
                      </a>
                    )}
                    {brick.tiktok_url && (
                      <a
                        href={brick.tiktok_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 hover:bg-slate-200"
                      >
                        <span>🎵</span>
                        <span>TikTok</span>
                      </a>
                    )}
                    {brick.x_url && (
                      <a
                        href={brick.x_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 hover:bg-slate-200"
                      >
                        <span>𝕏</span>
                        <span>X / Twitter</span>
                      </a>
                    )}
                    {!brick.facebook_url &&
                      !brick.instagram_url &&
                      !brick.youtube_url &&
                      !brick.tiktok_url &&
                      !brick.x_url && (
                        <span className="text-slate-400">
                          No socials linked yet.
                        </span>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

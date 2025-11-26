// src/pages/MyBricksPage.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/auth";

type MyBrick = {
  id: number;
  brick_index: number;
  color: string;
  message: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  x_url: string | null;
  owner_id: string | null;
};

const WALL_WIDTH = 1000;

export default function MyBricksPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bricks, setBricks] = useState<MyBrick[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Current user id:", user.id);

        const { data, error } = await supabase
          .from("bricks")
          .select(
            "id, brick_index, color, message, facebook_url, instagram_url, youtube_url, tiktok_url, x_url, owner_id, status"
          )
          .eq("owner_id", user.id)
          .eq("status", "sold")
          .order("brick_index", { ascending: true });

        if (error) throw error;

        setBricks((data ?? []) as MyBrick[]);
      } catch (err: any) {
        console.error("Error loading my bricks:", err);
        setError(err.message ?? "Failed to load bricks.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto flex h-[calc(100vh-64px)] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <h1 className="text-xl font-bold text-slate-900">
          Log in to view your bricks
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          You need to be logged in with the same account you used to buy your bricks.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center text-slate-600">
        Loading your bricks...
      </div>
    );
  }

  const userIdShort = `${user.id.slice(0, 6)}…${user.id.slice(-6)}`;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col px-4 py-8">
      <div className="mb-4 rounded-2xl bg-white/90 p-4 shadow">
        <h1 className="text-lg font-bold text-slate-900">Your bricks</h1>
        <p className="mt-1 text-xs text-slate-600">
          Logged in as <span className="font-semibold">{user.email}</span>
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Supabase user id:{" "}
          <span className="font-mono">{userIdShort}</span>
        </p>
        <p className="mt-1 text-xs text-slate-600">
          We&apos;re showing all bricks where <code>owner_id</code> equals this user id.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-600">
          {error}
        </div>
      )}

      {bricks.length === 0 ? (
        <div className="rounded-2xl bg-white/90 p-4 text-sm text-slate-700 shadow">
          <p className="font-semibold">You don&apos;t own any bricks (yet).</p>
          <p className="mt-1 text-xs text-slate-500">
            If you previously bought bricks under a different login (for example a
            different Google account or a magic-link email), log out and sign in with
            that same account to see them here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bricks.map((b) => {
            const x = b.brick_index % WALL_WIDTH;
            const y = Math.floor(b.brick_index / WALL_WIDTH);

            return (
              <div
                key={b.id}
                className="flex gap-3 rounded-2xl bg-white/90 p-3 text-xs text-slate-800 shadow"
              >
                <div
                  className="mt-1 h-10 w-20 rounded-brick shadow-inner"
                  style={{ backgroundColor: b.color || "#FFD352" }}
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <div className="font-semibold">
                      Brick #{b.brick_index} (x={x}, y={y})
                    </div>
                    <div className="text-[10px] text-slate-500">
                      owner_id:{" "}
                      <span className="font-mono">
                        {b.owner_id
                          ? `${b.owner_id.slice(0, 6)}…${b.owner_id.slice(-6)}`
                          : "null"}
                      </span>
                    </div>
                  </div>
                  {b.message && (
                    <p className="mt-1 text-[11px] text-slate-700 line-clamp-3">
                      {b.message}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabaseClient";

type Brick = {
  id: number;
  brick_index: number;
  color: string;
  message: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  x_url: string | null;
};

export default function MyBricksPage() {
  const { user, loading } = useAuth();
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [loadingBricks, setLoadingBricks] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setBricks([]);
        setLoadingBricks(false);
        return;
      }

      setLoadingBricks(true);
      setError(null);

      const { data, error } = await supabase
        .from("bricks")
        .select(
          "id, brick_index, color, message, facebook_url, instagram_url, youtube_url, tiktok_url, x_url"
        )
        .eq("owner_id", user.id)
        .order("brick_index", { ascending: true });

      if (error) {
        console.error("Error loading user bricks:", error);
        setError("Could not load your bricks. Please try again.");
        setLoadingBricks(false);
        return;
      }

      setBricks((data ?? []) as Brick[]);
      setLoadingBricks(false);
    };

    load();
  }, [user?.id]);

  const getCoords = (idx: number) => ({
    x: idx % 1000,
    y: Math.floor(idx / 1000),
  });

  if (loading || loadingBricks) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900 md:text-3xl">
              My Bricks
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Loading your corner of the wall…
            </p>
          </div>
          <div className="h-9 w-28 animate-pulse rounded-full bg-white/70" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm shadow-sky-900/5"
            >
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200/70" />
              <div className="mt-3 h-16 animate-pulse rounded-xl bg-slate-200/60" />
              <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-200/60" />
              <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-slate-200/60" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-4 text-2xl font-black text-slate-900 md:text-3xl">
          My Bricks
        </h1>
        <p className="max-w-md text-sm text-slate-600">
          You need to be logged in to see the bricks you own.
        </p>
        <div className="mt-6 inline-flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            Log in
          </Link>
          <Link
            to="/wall"
            className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
          >
            Or go claim a brick first →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {/* HEADER */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 md:text-3xl">
            My Bricks
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            All the bricks you&apos;ve claimed on the 1,000,000-brick wall.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-medium text-slate-700 shadow-sm">
          <span className="text-base">🧱</span>
          {bricks.length === 0 ? (
            <span>You don&apos;t own any bricks yet</span>
          ) : (
            <span>
              You own <span className="font-semibold">{bricks.length}</span>{" "}
              {bricks.length === 1 ? "brick" : "bricks"}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* EMPTY STATE */}
      {bricks.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-white/70 bg-white/80 p-8 text-center shadow-sm shadow-sky-900/5">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100">
            <span className="text-2xl">🧱</span>
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            No bricks… yet
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Go grab your first brick on the wall and it will show up here
            instantly.
          </p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              to="/wall"
              className="rounded-full bg-brickYellow px-5 py-2 text-sm font-semibold text-slate-900 shadow-md hover:shadow-lg"
            >
              Buy a brick
            </Link>
            <Link
              to="/"
              className="text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
            >
              Back to home
            </Link>
          </div>
        </div>
      ) : (
        /* GRID OF BRICKS */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bricks.map((b) => {
            const coords = getCoords(b.brick_index);

            return (
              <div
                key={b.id}
                className="flex flex-col rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm shadow-sky-900/5"
              >
                {/* Top row: title + coords */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Brick #{b.brick_index}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      x={coords.x}, y={coords.y}
                    </div>
                  </div>
                  <a
                    href={`/wall?brick=${b.brick_index}`}
                    className="text-[11px] font-medium text-sky-700 underline-offset-4 hover:underline"
                  >
                    View on wall
                  </a>
                </div>

                {/* Brick preview */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-16 w-24 items-center justify-center rounded-2xl bg-sky-50 p-1.5 shadow-inner">
                    <div
                      className="h-10 w-full rounded-lg border border-black/10 shadow-sm"
                      style={{
                        background: b.color || "#FDE68A",
                      }}
                    />
                  </div>
                  <div className="flex-1 text-xs text-slate-600">
                    {b.message ? (
                      <p className="line-clamp-3 break-words">
                        {b.message}
                      </p>
                    ) : (
                      <p className="italic text-slate-400">
                        No message added.
                      </p>
                    )}
                  </div>
                </div>

                {/* Social links */}
                {(b.facebook_url ||
                  b.instagram_url ||
                  b.youtube_url ||
                  b.tiktok_url ||
                  b.x_url) && (
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                    {b.facebook_url && (
                      <a
                        href={b.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-slate-100 px-2 py-1 hover:bg-slate-200"
                      >
                        Facebook
                      </a>
                    )}
                    {b.instagram_url && (
                      <a
                        href={b.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-slate-100 px-2 py-1 hover:bg-slate-200"
                      >
                        Instagram
                      </a>
                    )}
                    {b.youtube_url && (
                      <a
                        href={b.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-slate-100 px-2 py-1 hover:bg-slate-200"
                      >
                        YouTube
                      </a>
                    )}
                    {b.tiktok_url && (
                      <a
                        href={b.tiktok_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-slate-100 px-2 py-1 hover:bg-slate-200"
                      >
                        TikTok
                      </a>
                    )}
                    {b.x_url && (
                      <a
                        href={b.x_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full bg-slate-100 px-2 py-1 hover:bg-slate-200"
                      >
                        X
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

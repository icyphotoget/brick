// src/pages/HomePage.tsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const TOTAL_BRICKS = 1_000_000;

type FeaturedBrick = {
  brick_index: number;
  color: string;
  message: string | null;
  x: number | null;
  y: number | null;
  instagram_url: string | null;
  x_url: string | null;
};

type SimpleBrick = {
  brick_index: number;
  color: string | null;
  message: string | null;
};

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function HomePage() {
  const navigate = useNavigate();

  const [claimedCount, setClaimedCount] = useState<number | null>(null);
  const [featured, setFeatured] = useState<FeaturedBrick | null>(null);
  const [recentBricks, setRecentBricks] = useState<SimpleBrick[]>([]);
  const [randomBricks, setRandomBricks] = useState<SimpleBrick[]>([]);
  const [loadingRandom, setLoadingRandom] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) exact count of sold bricks
        const { count, error: countError } = await supabase
          .from("bricks")
          .select("*", { count: "exact", head: true })
          .eq("status", "sold");

        if (countError) throw countError;

        // 2) latest sold brick as "featured"
        const { data: featuredRows, error: featuredError } = await supabase
          .from("bricks")
          .select("brick_index, color, message, x, y, instagram_url, x_url")
          .eq("status", "sold")
          .order("id", { ascending: false })
          .limit(1);

        if (featuredError) throw featuredError;

        // 3) recent bricks for ticker + random section
        const { data: recentRows, error: recentError } = await supabase
          .from("bricks")
          .select("brick_index, color, message")
          .eq("status", "sold")
          .order("id", { ascending: false })
          .limit(30);

        if (recentError) throw recentError;

        if (!cancelled) {
          setClaimedCount(count ?? 0);
          setFeatured(
            featuredRows && featuredRows.length > 0
              ? (featuredRows[0] as FeaturedBrick)
              : null
          );
          const recent = (recentRows ?? []) as SimpleBrick[];
          setRecentBricks(recent);
          setRandomBricks(shuffle(recent).slice(0, 10));
        }
      } catch (err: any) {
        console.error("Error loading homepage stats:", err);
        if (!cancelled) {
          setError(err.message ?? "Failed to load data.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const claimedText =
    claimedCount != null
      ? `${claimedCount.toLocaleString()} claimed so far`
      : "Loading claimed bricks…";

  const handleBuyClick = () => {
    navigate("/wall#buy");
  };

  const handleSeeFeaturedBrick = () => {
    if (!featured) {
      navigate("/wall");
      return;
    }
    navigate(`/wall?brick=${featured.brick_index}`);
  };

  const handleBrickPreviewClick = (brickIndex: number) => {
    navigate(`/wall?brick=${brickIndex}`);
  };

  const handleReloadRandom = () => {
    if (!recentBricks.length) return;
    setLoadingRandom(true);
    setTimeout(() => {
      setRandomBricks(shuffle(recentBricks).slice(0, 10));
      setLoadingRandom(false);
    }, 150); // tiny delay just for visual feedback
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-16 pt-10 sm:pt-14 lg:pt-16">
      {/* Hero + Featured */}
      <section className="flex flex-col gap-10 lg:flex-row lg:items-center">
        <div className="max-w-xl">
          <div className="mb-3 inline-flex items-center rounded-full bg-white/80 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
            <span className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-400" />
            OWN YOUR SPOT ON THE WALL
          </div>

          <h1 className="text-3xl font-black leading-tight text-slate-900 sm:text-4xl md:text-5xl">
            Own a piece of the
            <br />
            1,000,000-brick
            <br />
            digital wall
          </h1>

          <p className="mt-4 text-sm text-slate-700 sm:text-base">
            Buy a colorful brick, leave a custom message, add your socials and
            claim a permanent spot on the internet&apos;s most ridiculous wall.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleBuyClick}
              className="rounded-full bg-brickYellow px-5 py-2 text-sm font-semibold text-slate-900 shadow-md hover:brightness-105"
            >
              Buy a brick
            </button>

            <Link
              to="/wall"
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
            >
              View the wall
            </Link>

            {/* Fullscreen wall link removed */}
          </div>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[11px] text-slate-600 shadow-sm">
            <span role="img" aria-label="bricks">
              🧱
            </span>
            <span>{TOTAL_BRICKS.toLocaleString()} total bricks</span>
            <span className="text-slate-400">•</span>
            <span>{claimedText}</span>
            <span className="hidden text-slate-400 sm:inline">
              • Live wall, updated instantly
            </span>
          </div>

          {error && (
            <p className="mt-3 text-xs text-red-500">
              Failed to load live stats. The wall still works – this is just
              the fancy numbers breaking: {error}
            </p>
          )}
        </div>

        {/* Featured brick card */}
        <div className="w-full max-w-md rounded-3xl bg-white/90 p-4 shadow-lg sm:p-5">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="text-amber-500">FEATURED</span>
            <span className="text-emerald-500">● Owned</span>
          </div>

          <h2 className="text-sm font-bold text-slate-900 sm:text-base">
            Brick of the day
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Today&apos;s highlighted brick from the wall of 1,000,000.
          </p>

          <div className="mt-4 flex items-start gap-3">
            <div
              className="h-14 w-24 rounded-brick shadow-inner"
              style={{
                backgroundColor: featured?.color ?? "#FFD352",
              }}
            />
            <div className="flex-1 text-xs text-slate-800">
              <div className="font-semibold">
                {featured
                  ? `Brick #${featured.brick_index}`
                  : "Random brick spinning up..."}
              </div>
              {/* Coordinates intentionally hidden */}
              <div className="mt-1 text-xs italic text-slate-700 line-clamp-3">
                {featured?.message || `"My tiny corner of the internet."`}
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            {featured?.instagram_url && (
              <a
                href={featured.instagram_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 hover:bg-slate-100"
              >
                <span>📸</span>
                <span>@bricklover</span>
              </a>
            )}
            {featured?.x_url && (
              <a
                href={featured.x_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 hover:bg-slate-100"
              >
                <span>𝕏</span>
                <span>@bricklover</span>
              </a>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-600">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                <span>Claimed bricks</span>
              </div>
              <div>Want your own featured brick?</div>
            </div>

            <button
              type="button"
              onClick={handleSeeFeaturedBrick}
              className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              See this brick on the wall →
            </button>
          </div>
        </div>
      </section>

      {/* Recent bricks ticker */}
      {recentBricks.length > 0 && (
        <section className="mt-10">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Recent bricks
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {recentBricks.map((b) => (
              <button
                key={b.brick_index}
                type="button"
                onClick={() => handleBrickPreviewClick(b.brick_index)}
                className="min-w-[180px] rounded-2xl bg-white/80 px-3 py-2 text-left text-[11px] text-slate-700 shadow-sm hover:bg-white"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-6 w-10 rounded-brick shadow-inner"
                    style={{ backgroundColor: b.color ?? "#FFD352" }}
                  />
                  <div className="flex-1">
                    <div className="font-semibold">
                      Brick #{b.brick_index}
                    </div>
                    <div className="line-clamp-1 text-[10px] text-slate-500">
                      {b.message || "No message yet."}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Why buy a brick section */}
      <section className="mt-10">
        <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Why buy a brick?
        </div>
        <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/90 p-4 shadow-sm">
            <div className="mb-1 text-xs font-semibold text-slate-500">
              🎯 Permanent
            </div>
            <p className="text-[12px]">
              Your brick keeps its message, color and links as long as the wall
              exists. It&apos;s your tiny permanent spot on the internet.
            </p>
          </div>
          <div className="rounded-2xl bg-white/90 p-4 shadow-sm">
            <div className="mb-1 text-xs font-semibold text-slate-500">
              🎨 Custom
            </div>
            <p className="text-[12px]">
              Pick a color, write something funny, shout out a friend or link to
              your socials, project or brand.
            </p>
          </div>
          <div className="rounded-2xl bg-white/90 p-4 shadow-sm">
            <div className="mb-1 text-xs font-semibold text-slate-500">
              🌍 Social
            </div>
            <p className="text-[12px]">
              People can discover you through the wall, share your brick on X
              and highlight it straight from the grid.
            </p>
          </div>
        </div>
      </section>

      {/* Random bricks section */}
      {recentBricks.length > 0 && (
        <section className="mt-10">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Explore the wall
            </div>
            <button
              type="button"
              onClick={handleReloadRandom}
              disabled={loadingRandom}
              className="text-[11px] font-semibold text-slate-600 underline-offset-2 hover:underline disabled:opacity-60"
            >
              {loadingRandom ? "Shuffling…" : "Show 10 random bricks"}
            </button>
          </div>

          <div className="grid gap-3 text-[11px] text-slate-700 sm:grid-cols-5">
            {randomBricks.map((b) => (
              <button
                key={`rand-${b.brick_index}`}
                type="button"
                onClick={() => handleBrickPreviewClick(b.brick_index)}
                className="flex flex-col items-start gap-1 rounded-2xl bg-white/90 p-3 text-left shadow-sm hover:bg-white"
              >
                <div
                  className="h-6 w-full rounded-brick shadow-inner"
                  style={{ backgroundColor: b.color ?? "#FFD352" }}
                />
                <div className="mt-1 font-semibold">#{b.brick_index}</div>
                <div className="line-clamp-2 text-[10px] text-slate-500">
                  {b.message || "Empty brick. Waiting for a message."}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 text-xs text-slate-500">
        Live wall • {TOTAL_BRICKS.toLocaleString()} bricks
      </div>
    </div>
  );
}

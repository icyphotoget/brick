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

export default function HomePage() {
  const navigate = useNavigate();

  const [claimedCount, setClaimedCount] = useState<number | null>(null);
  const [featured, setFeatured] = useState<FeaturedBrick | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) exact count of sold bricks (fast)
        const { count, error: countError } = await supabase
          .from("bricks")
          .select("*", { count: "exact", head: true })
          .eq("status", "sold");

        if (countError) throw countError;

        // 2) one featured brick (latest sold)
        const { data: featuredRows, error: featuredError } = await supabase
          .from("bricks")
          .select(
            "brick_index, color, message, x, y, instagram_url, x_url"
          )
          .eq("status", "sold")
          .order("id", { ascending: false })
          .limit(1);

        if (featuredError) throw featuredError;

        if (!cancelled) {
          setClaimedCount(count ?? 0);
          setFeatured(
            featuredRows && featuredRows.length > 0
              ? (featuredRows[0] as FeaturedBrick)
              : null
          );
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

  // NEW: go to this specific featured brick on the wall
  const handleSeeFeaturedBrick = () => {
    if (!featured) {
      navigate("/wall");
      return;
    }
    navigate(`/wall?brick=${featured.brick_index}`);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 pb-16 pt-10 sm:pt-14 lg:pt-16">
      {/* Hero */}
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

            <Link
              to="/wall"
              className="text-xs font-semibold text-slate-600 underline-offset-2 hover:underline"
            >
              Fullscreen wall
            </Link>
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
              {/* Coordinates removed on purpose */}
              <div className="mt-1 text-xs italic text-slate-700 line-clamp-3">
                {featured?.message ||
                  `"My tiny corner of the internet."`}
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

      <div className="mt-10 text-xs text-slate-500">
        Live wall • {TOTAL_BRICKS.toLocaleString()} bricks
      </div>
    </div>
  );
}

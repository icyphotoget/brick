import React from "react";
import { Link } from "react-router-dom";

type HeroSectionProps = {
  onBuyClick?: () => void;
  onViewWallClick?: () => void;
  onFullscreenClick?: () => void;
};

export function HeroSection({
  onBuyClick,
  onViewWallClick,
  onFullscreenClick,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-100 to-sky-200">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl flex-col gap-12 px-4 py-10 lg:flex-row lg:items-center lg:py-16">
        {/* LEFT: TEXT */}
        <div className="flex-1">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-900/70 shadow-sm">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
            Own your spot on the wall
          </p>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
            Own a piece of the
            <span className="block text-sky-800">
              1,000,000-brick digital wall
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-base text-slate-700/90 md:text-lg">
            Buy a colorful brick, leave a custom message, add your socials and
            claim a permanent spot on the internet&apos;s most ridiculous wall.
          </p>

          {/* CTA BUTTONS */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onBuyClick}
              className="inline-flex items-center justify-center rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-400/40 transition hover:-translate-y-0.5 hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-sky-100"
            >
              Buy a brick
            </button>

            <button
              type="button"
              onClick={onViewWallClick}
              className="inline-flex items-center justify-center rounded-full border border-sky-900/10 bg-white/70 px-5 py-3 text-sm font-semibold text-sky-900/80 shadow-sm transition hover:bg-white hover:shadow-md focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-sky-100"
            >
              View the wall
            </button>

            <button
              type="button"
              onClick={onFullscreenClick}
              className="text-sm font-medium text-sky-900/70 underline-offset-4 hover:text-sky-900 hover:underline"
            >
              Fullscreen wall
            </button>
          </div>

          {/* STATS / SOCIAL PROOF */}
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-medium text-slate-700 shadow-sm">
            <span className="text-base">🧱</span>
            <span>1,000,000 total bricks</span>
            <span className="text-slate-400">•</span>
            <span>2,384 claimed so far</span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="hidden sm:inline">Live wall, updated instantly</span>
          </div>
        </div>

        {/* RIGHT: PREVIEW CARD */}
        <div className="flex-1">
          <div className="relative">
            {/* glow */}
            <div className="absolute -inset-4 rounded-[32px] bg-sky-300/40 blur-3xl" />
            <div className="relative rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-xl shadow-sky-900/10 backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    1,000,000-brick digital wall
                  </h2>
                  <p className="mt-1 text-xs text-slate-600">
                    Every brick is unique. Click one to make it yours.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-500">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                  Live
                </div>
              </div>

              {/* MINI WALL PREVIEW */}
              <div className="mt-4 h-40 rounded-2xl border border-sky-100 bg-sky-100/80 p-2">
                <div className="relative h-full w-full overflow-hidden rounded-2xl bg-sky-50">
                  {/* Fake bricks grid */}
                  <div className="absolute inset-2 grid grid-cols-20 gap-[2px]">
                    {Array.from({ length: 400 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-full w-full rounded-[2px]"
                        style={{
                          opacity: 0.9,
                          backgroundColor:
                            [
                              "#FDE68A",
                              "#BFDBFE",
                              "#FCA5A5",
                              "#A7F3D0",
                              "#E9D5FF",
                            ][i % 5],
                        }}
                      />
                    ))}
                  </div>

                  {/* Tooltip */}
                  <div className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-medium text-slate-700 shadow">
                    Hovering #582308
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                <div className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded-sm bg-amber-300" />
                  <span>Claimed bricks</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="inline-block h-3 w-3 rounded-sm border border-slate-200 bg-white" />
                  <span>Available</span>
                </div>
                <span className="text-slate-400">•</span>
                <span>Click anywhere on the wall to start.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

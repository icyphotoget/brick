import React from "react";

interface HeroSectionProps {
  onBuyClick?: () => void;
  onViewWallClick?: () => void;
  onFullscreenClick?: () => void;
  Preview?: React.ReactNode; // e.g. <MiniWallPreview />
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onBuyClick,
  onViewWallClick,
  onFullscreenClick,
  Preview,
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-sky-100/80 to-sky-200/80">
      <div className="mx-auto flex max-w-5xl flex-col-reverse gap-8 px-4 py-10 md:flex-row md:items-center md:py-16">
        {/* LEFT: TEXT + CTAS */}
        <div className="flex-1 space-y-6 animate-fadeIn">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium text-slate-700 shadow-sm sm:text-xs">
            <span className="inline-block h-2 w-2 rounded-full bg-brickGreen" />
            Digital brick marketplace for unhinged geniuses
          </p>

          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Own a brick on the internet&apos;s weirdest wall.
          </h1>

          <p className="max-w-xl text-sm text-slate-700 sm:text-base md:text-lg">
            Buy a tiny piece of chaotic real estate, leave a message, link your
            socials, or immortalize your most questionable idea. There are only
            1,000 bricks — once they&apos;re gone, they&apos;re gone.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onBuyClick}
              className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-slate-800 sm:text-base"
            >
              Buy a brick
            </button>
            <button
              onClick={onViewWallClick}
              className="rounded-full border border-slate-300 bg-white/80 px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-white sm:text-base"
            >
              View the wall
            </button>
            {onFullscreenClick && (
              <button
                onClick={onFullscreenClick}
                className="text-xs font-medium text-slate-600 underline-offset-2 hover:underline"
              >
                Go fullscreen
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-4 text-[11px] text-slate-600 sm:text-xs">
            <span>🔒 Powered by Supabase auth</span>
            <span>🧱 1,000 total bricks</span>
            <span>⚡ Solana payments incoming</span>
          </div>
        </div>

        {/* RIGHT: PREVIEW */}
        <div className="flex-1">
          <div className="mx-auto w-full max-w-sm rounded-3xl border border-white/60 bg-white/70 p-3 shadow-xl backdrop-blur">
            {Preview ? (
              Preview
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-sky-200 text-xs text-slate-500">
                Mini wall preview goes here
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

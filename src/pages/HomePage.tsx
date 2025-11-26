import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import FullWallCanvas, { SoldBrick } from "../ui/FullWallCanvas";
import BuyBrickModal, { BuyBrickFormValues } from "../ui/BuyBrickModal";

type ReserveResponse = {
  brick: {
    id: number;
    brick_index: number;
    x: number;
    y: number;
    color: string;
    message: string | null;
    facebook_url?: string | null;
    instagram_url?: string | null;
    youtube_url?: string | null;
    tiktok_url?: string | null;
    x_url?: string | null;
  };
};

type FeaturedBrick = {
  brick_index: number;
  color: string;
  message: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  x_url: string | null;
};

export default function HomePage() {
  const [soldBricks, setSoldBricks] = useState<SoldBrick[]>([]);
  const [loadingWall, setLoadingWall] = useState(true);
  const [hoverBrickIndex, setHoverBrickIndex] = useState<number | null>(null);

  const [buyOpen, setBuyOpen] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<{ x: number; y: number } | null>(null);

  const [selectedBrickIndex, setSelectedBrickIndex] = useState<number | null>(
    null
    
  );

  const [claimedCount, setClaimedCount] = useState<number | null>(null);
  const [featuredBrick, setFeaturedBrick] = useState<FeaturedBrick | null>(null);

  // sve kupljene cigle s porukama/linkovima (za preview + botd)
  const [bricksMeta, setBricksMeta] = useState<FeaturedBrick[]>([]);
  const [previewBrick, setPreviewBrick] = useState<FeaturedBrick | null>(null);

  const getCoords = (idx: number) => ({
    x: idx % 1000,
    y: Math.floor(idx / 1000),
  });

  const pickBrickOfTheDay = (bricks: FeaturedBrick[]): FeaturedBrick | null => {
    if (!bricks.length) return null;
    const todayStr = new Date().toISOString().slice(0, 10);
    let hash = 0;
    for (let i = 0; i < todayStr.length; i++) {
      hash = (hash * 31 + todayStr.charCodeAt(i)) | 0;
    }
    const index = Math.abs(hash) % bricks.length;
    return bricks[index];
  };

  // učitaj prodane cigle + count + featured
  useEffect(() => {
    const loadSoldBricks = async () => {
      setLoadingWall(true);

      const { data, error, count } = await supabase
        .from("bricks")
        .select(
          "brick_index, color, message, facebook_url, instagram_url, youtube_url, tiktok_url, x_url",
          { count: "exact" }
        )
        .eq("status", "sold")
        .order("brick_index", { ascending: true })
        .limit(20000);

      if (error) {
        console.error("Error loading bricks:", error);
        setLoadingWall(false);
        return;
      }

      const bricks = (data ?? []) as FeaturedBrick[];
      setBricksMeta(bricks);

      const mappedForCanvas: SoldBrick[] =
        bricks.map((b) => ({
          brick_index: b.brick_index,
          color: b.color || "#FFD352",
        })) || [];

      setSoldBricks(mappedForCanvas);

      if (typeof count === "number") {
        setClaimedCount(count);
      } else {
        setClaimedCount(bricks.length);
      }

      const botd = pickBrickOfTheDay(bricks);
      setFeaturedBrick(botd);

      setLoadingWall(false);
    };

    loadSoldBricks();
  }, []);

  // realtime updejt
  useEffect(() => {
    const channel = supabase
      .channel("bricks-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bricks",
        },
        (payload) => {
          const newRow: any = payload.new;
          if (!newRow) return;
          if (newRow.status !== "sold") return;

          const brickIndex = newRow.brick_index as number;
          const color = (newRow.color as string) || "#FFD352";

          // canvas
          setSoldBricks((prev) => {
            if (prev.some((b) => b.brick_index === brickIndex)) return prev;
            return [...prev, { brick_index: brickIndex, color }];
          });

          // meta (za preview/botd)
          const meta: FeaturedBrick = {
            brick_index: brickIndex,
            color,
            message: newRow.message ?? null,
            facebook_url: newRow.facebook_url ?? null,
            instagram_url: newRow.instagram_url ?? null,
            youtube_url: newRow.youtube_url ?? null,
            tiktok_url: newRow.tiktok_url ?? null,
            x_url: newRow.x_url ?? null,
          };

          setBricksMeta((prev) => {
            if (prev.some((b) => b.brick_index === brickIndex)) return prev;
            return [...prev, meta];
          });

          setClaimedCount((prev) => (prev == null ? 1 : prev + 1));

          // ne mijenjamo brick of the day usred dana – ostaje stabilan
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // klik na ciglu s canvasa
  const handleBrickClick = (brickIndex: number, x: number, y: number) => {
  const existing = bricksMeta.find((b) => b.brick_index === brickIndex);

  if (existing) {
    setPreviewBrick(existing);
    setSelectedBrickIndex(null);
    setSelectedCoords(null);
  } else {
    setPreviewBrick(null);
    setSelectedBrickIndex(brickIndex);
    setSelectedCoords({ x, y });
    setBuyOpen(true);
  }
};
  const currentInfo =
    hoverBrickIndex != null
      ? {
          index: hoverBrickIndex,
          ...getCoords(hoverBrickIndex),
        }
      : null;

  const handleComplete = async (values: BuyBrickFormValues) => {
    if (selectedBrickIndex == null) {
      alert("No brick selected.");
      return;
    }

    try {
      const { data, error } = await supabase.rpc<ReserveResponse>(
  "reserve_brick_and_create_order",
  {
    p_brick_index: selectedBrickIndex,
    p_x: selectedCoords?.x ?? null,
    p_y: selectedCoords?.y ?? null,
    p_color: values.color,
    p_message: values.message,
    p_facebook_url: values.facebook_url ?? null,
    p_instagram_url: values.instagram_url ?? null,
    p_youtube_url: values.youtube_url ?? null,
    p_tiktok_url: values.tiktok_url ?? null,
    p_x_url: values.x_url ?? null,
    p_is_gift: values.is_gift,
    p_recipient_name: values.recipient_name ?? null,
    p_recipient_email: values.recipient_email ?? null,
    p_gift_note: values.gift_note ?? null,
  }
);

      if (error) {
        console.error("Supabase error:", error);
        alert("Purchase failed: " + error.message);
        return;
      }

      if (!data || !data.brick) {
        alert("No brick returned from server.");
        return;
      }

      const brick = data.brick;

      setSoldBricks((prev) => {
        if (prev.some((b) => b.brick_index === brick.brick_index)) return prev;
        return [
          ...prev,
          {
            brick_index: brick.brick_index,
            color: brick.color,
          },
        ];
      });

      setClaimedCount((prev) => (prev == null ? 1 : prev + 1));

      // dodaj u meta (da odmah radi preview za tu ciglu)
      setBricksMeta((prev) => {
        if (prev.some((b) => b.brick_index === brick.brick_index)) return prev;
        return [
          ...prev,
          {
            brick_index: brick.brick_index,
            color: brick.color,
            message: brick.message,
            facebook_url: brick.facebook_url ?? null,
            instagram_url: brick.instagram_url ?? null,
            youtube_url: brick.youtube_url ?? null,
            tiktok_url: brick.tiktok_url ?? null,
            x_url: brick.x_url ?? null,
          },
        ];
      });

      // poruka ovisno jel gift ili ne
      if (values.is_gift) {
        alert(
          `Success! Gift brick #${brick.brick_index} is now reserved for ${values.recipient_email || "your friend"}.`
        );
      } else {
        alert(
          `Success! Brick #${brick.brick_index} is now yours (x=${brick.x}, y=${brick.y}).`
        );
      }

      setBuyOpen(false);
    } catch (e: any) {
      console.error(e);
      alert("Unexpected error during purchase.");
    }
  };

  const claimedText = useMemo(() => {
    if (claimedCount == null) return "— claimed so far";
    if (claimedCount === 0) return "No bricks claimed yet";
    if (claimedCount === 1) return "1 brick claimed so far";
    return `${claimedCount.toLocaleString()} bricks claimed so far`;
  }, [claimedCount]);

  const featuredCoords = featuredBrick
    ? getCoords(featuredBrick.brick_index)
    : null;

  const previewCoords = previewBrick
    ? getCoords(previewBrick.brick_index)
    : null;

  return (
    <div className="flex flex-col">
      {/* ⭐ HERO sekcija */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-100/80 to-sky-200/80">
        <div className="mx-auto flex min-h-[70vh] max-w-5xl flex-col gap-10 px-4 py-12 md:flex-row md:items-center lg:py-16">
          {/* LEFT */}
          <div className="flex-1">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-900/70 shadow-sm">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
              Own your spot on the wall
            </p>

            <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
              Own a piece of the
              <span className="block text-sky-800">
                1,000,000-brick digital wall
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-base text-slate-700/90 md:text-lg">
              Buy a colorful brick, leave a custom message, add your socials and
              claim a permanent spot on the internet&apos;s most ridiculous wall.
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  if (selectedBrickIndex == null) {
                    const el = document.getElementById("wall");
                    el?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    setBuyOpen(true);
                  }
                }}
                className="inline-flex items-center justify-center rounded-full bg-brickYellow px-6 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-amber-400/40 transition hover:-translate-y-0.5 hover:bg-amber-300"
              >
                Buy a brick
              </button>

              <a
                href="#wall"
                className="inline-flex items-center justify-center rounded-full border border-sky-900/10 bg-white/70 px-5 py-3 text-sm font-semibold text-sky-900/80 shadow-sm hover:bg-white hover:shadow-md"
              >
                View the wall
              </a>

              <Link
                to="/wall"
                className="text-sm font-medium text-sky-900/70 underline-offset-4 hover:text-sky-900 hover:underline"
              >
                Fullscreen wall
              </Link>
            </div>

            {/* Stats – live */}
            <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-xs font-medium text-slate-700 shadow-sm">
              <span className="text-base">🧱</span>
              <span>1,000,000 total bricks</span>
              <span className="text-slate-400">•</span>
              <span>{claimedText}</span>
              <span className="text-slate-400 hidden sm:inline">•</span>
              <span className="hidden sm:inline">Live wall, updated instantly</span>
            </div>
          </div>

          {/* ⭐ RIGHT — BRICK OF THE DAY (live meta) */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute -inset-4 rounded-[32px] bg-amber-200/25 blur-3xl" />
              <div className="relative rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-xl shadow-sky-900/10 backdrop-blur">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-500">
                      Featured
                    </p>
                    <h2 className="text-sm font-semibold text-slate-900">
                      Brick of the day
                    </h2>
                    <p className="mt-1 text-xs text-slate-600">
                      Today&apos;s highlighted brick from all claimed bricks.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-600">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                    {claimedCount && claimedCount > 0 ? "Owned" : "Waiting"}
                  </div>
                </div>

                {featuredBrick && featuredCoords ? (
                  <>
                    {/* Brick visual */}
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex h-16 w-28 items-center justify-center rounded-2xl bg-sky-50 p-2 shadow-inner">
                        <div
                          className="h-10 w-full rounded-lg border border-amber-300 shadow-sm"
                          style={{
                            background:
                              featuredBrick.color || "#FDE68A",
                          }}
                        />
                      </div>

                      <div className="space-y-1 text-xs text-slate-700">
                        <div className="font-semibold text-slate-900">
                          Brick #{featuredBrick.brick_index}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Coords: x={featuredCoords.x}, y={featuredCoords.y}
                        </div>
                        <div className="mt-2 text-[11px] italic text-slate-600">
                          {featuredBrick.message
                            ? `"${featuredBrick.message}"`
                            : `"My tiny corner of the internet."`}
                        </div>
                      </div>
                    </div>

                    {/* Socials */}
                    {(featuredBrick.instagram_url ||
                      featuredBrick.facebook_url ||
                      featuredBrick.youtube_url ||
                      featuredBrick.tiktok_url ||
                      featuredBrick.x_url) && (
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-slate-600">
                        {featuredBrick.instagram_url && (
                          <a
                            href={featuredBrick.instagram_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 hover:bg-slate-200"
                          >
                            <span>📸</span>
                            <span>Instagram</span>
                          </a>
                        )}
                        {featuredBrick.facebook_url && (
                          <a
                            href={featuredBrick.facebook_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 hover:bg-slate-200"
                          >
                            <span>📘</span>
                            <span>Facebook</span>
                          </a>
                        )}
                        {featuredBrick.youtube_url && (
                          <a
                            href={featuredBrick.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 hover:bg-slate-200"
                          >
                            <span>▶️</span>
                            <span>YouTube</span>
                          </a>
                        )}
                        {featuredBrick.tiktok_url && (
                          <a
                            href={featuredBrick.tiktok_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 hover:bg-slate-200"
                          >
                            <span>🎵</span>
                            <span>TikTok</span>
                          </a>
                        )}
                        {featuredBrick.x_url && (
                          <a
                            href={featuredBrick.x_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 hover:bg-slate-200"
                          >
                            <span>𝕏</span>
                            <span>X</span>
                          </a>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-5 text-xs text-slate-600">
                    <p className="font-semibold text-slate-800">
                      No bricks claimed yet.
                    </p>
                    <p className="mt-1">
                      Be the first to claim a brick and you&apos;ll instantly
                      appear here as the Brick of the Day.
                    </p>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-sm bg-amber-300" />
                    <span>Claimed bricks</span>
                    <span className="text-slate-400">•</span>
                    <span>Want your own featured brick?</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("wall");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-slate-800"
                  >
                    Get your brick →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ⭐ LIVE WALL */}
      <section
        id="wall"
        className="mx-auto mb-10 flex w-full max-w-6xl flex-col gap-3 px-4"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Live wall · 1,000,000 bricks
            </h2>
            <p className="mt-1 text-[11px] text-slate-500">
              Scroll to zoom, drag to pan. Click an empty brick to buy, click a
              claimed one to peek at it.
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium text-slate-600 shadow-sm sm:flex">
            <span className="inline-flex h-3 w-3 rounded-sm bg-amber-300 border border-amber-400" />
            <span>Claimed brick</span>
            <span className="text-slate-300">•</span>
            <span className="inline-flex h-3 w-3 rounded-sm border border-slate-300 bg-sky-100" />
            <span>Empty space</span>
          </div>
        </div>

        <div className="h-[420px] rounded-3xl border border-white/70 bg-gradient-to-br from-sky-100 via-sky-200 to-sky-300 shadow-inner overflow-hidden relative">
          {loadingWall ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-600">
              Loading wall...
            </div>
          ) : (
            <>
              <FullWallCanvas
  soldBricks={soldBricks}
  onBrickClick={handleBrickClick}
  onBrickHover={(idx) => setHoverBrickIndex(idx)}
/>

              {/* info bubble */}
              <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
                <div className="pointer-events-auto rounded-full bg-white/90 px-4 py-2 text-[11px] font-medium text-slate-700 shadow">
                  {currentInfo
                    ? `Brick #${currentInfo.index} · x=${currentInfo.x}, y=${currentInfo.y}`
                    : "Hover to inspect bricks, click to select one ✨"}
                </div>
              </div>

              {/* preview kupljene cigle */}
              {previewBrick && previewCoords && (
                <div className="absolute bottom-3 left-3 max-w-xs rounded-2xl border border-white/80 bg-white/95 p-4 text-xs text-slate-700 shadow-lg shadow-slate-900/10">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Brick preview
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        Brick #{previewBrick.brick_index}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        x={previewCoords.x}, y={previewCoords.y}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPreviewBrick(null)}
                      className="text-[11px] text-slate-400 hover:text-slate-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-10 w-16 items-center justify-center rounded-xl bg-sky-50 p-1 shadow-inner">
                      <div
                        className="h-7 w-full rounded-md border border-black/10 shadow-sm"
                        style={{
                          background: previewBrick.color || "#FDE68A",
                        }}
                      />
                    </div>
                    <div className="flex-1 text-[11px] text-slate-700">
                      {previewBrick.message ? (
                        <p className="line-clamp-3 break-words">
                          {previewBrick.message}
                        </p>
                      ) : (
                        <p className="italic text-slate-400">
                          No message attached.
                        </p>
                      )}
                    </div>
                  </div>

                  {(previewBrick.facebook_url ||
                    previewBrick.instagram_url ||
                    previewBrick.youtube_url ||
                    previewBrick.tiktok_url ||
                    previewBrick.x_url) && (
                    <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
                      {previewBrick.instagram_url && (
                        <a
                          href={previewBrick.instagram_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-slate-100 px-2 py-1 hover:bg-slate-200"
                        >
                          Instagram
                        </a>
                      )}
                      {previewBrick.facebook_url && (
                        <a
                          href={previewBrick.facebook_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-slate-100 px-2 py-1 hover:bg-slate-200"
                        >
                          Facebook
                        </a>
                      )}
                      {previewBrick.youtube_url && (
                        <a
                          href={previewBrick.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-slate-100 px-2 py-1 hover:bg-slate-200"
                        >
                          YouTube
                        </a>
                      )}
                      {previewBrick.tiktok_url && (
                        <a
                          href={previewBrick.tiktok_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-slate-100 px-2 py-1 hover:bg-slate-200"
                        >
                          TikTok
                        </a>
                      )}
                      {previewBrick.x_url && (
                        <a
                          href={previewBrick.x_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-slate-100 px-2 py-1 hover:bg-slate-200"
                        >
                          X
                        </a>
                      )}
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      Want your own little rectangle?
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewBrick(null);
                        const el = document.getElementById("wall");
                        el?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-semibold text-white hover:bg-slate-800"
                    >
                      Claim a brick →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <BuyBrickModal
        open={buyOpen}
        onClose={() => setBuyOpen(false)}
        onComplete={handleComplete}
      />
    </div>
  );
}

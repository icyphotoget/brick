// src/ui/BrickDetailsModal.tsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../lib/auth";

export type BrickDetails = {
  id: number;
  brick_index: number;
  color: string;
  message: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
  tiktok_url?: string | null;
  x_url?: string | null;
};

type Props = {
  open: boolean;
  brick: BrickDetails | null;
  onClose: () => void;
};

export default function BrickDetailsModal({ open, brick, onClose }: Props) {
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState<number | null>(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    const loadLikes = async () => {
      if (!open || !brick) return;

      try {
        // total likes
        const { count, error: countError } = await supabase
          .from("brick_likes")
          .select("*", { count: "exact", head: true })
          .eq("brick_index", brick.brick_index);

        if (countError) throw countError;
        setLikeCount(count ?? 0);

        // whether current user liked
        if (user) {
          const { data, error: likeError } = await supabase
            .from("brick_likes")
            .select("id")
            .eq("brick_index", brick.brick_index)
            .eq("user_id", user.id)
            .maybeSingle();

          if (likeError && likeError.code !== "PGRST116") throw likeError; // ignore "no rows"
          setHasLiked(!!data);
        } else {
          setHasLiked(false);
        }
      } catch (err) {
        console.error("Error loading likes for brick:", err);
      }
    };

    loadLikes();
  }, [open, brick?.brick_index, user]);

  if (!open || !brick) return null;

  const {
    brick_index,
    color,
    message,
    facebook_url,
    instagram_url,
    youtube_url,
    tiktok_url,
    x_url,
  } = brick;

  const coords = {
    x: brick_index % 1000,
    y: Math.floor(brick_index / 1000),
  };

  const handleShareOnX = () => {
    try {
      const baseUrl =
        typeof window !== "undefined"
          ? `${window.location.origin}/wall?brick=${brick_index}`
          : "https://brick-five.vercel.app/wall";

      const textMessage = message?.trim()
        ? `Check out Brick #${brick_index} on the 1,000,000-brick wall: "${message.trim()}"`
        : `Check out Brick #${brick_index} on the 1,000,000-brick wall`;

      const text = encodeURIComponent(textMessage);
      const url = encodeURIComponent(baseUrl);

      const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Failed to open X share URL", err);
      alert("Couldn't open X share window. Please try again.");
    }
  };

  const toggleLike = async () => {
    if (!brick) return;
    if (!user) {
      alert("Log in to like bricks.");
      return;
    }

    setLikeLoading(true);
    try {
      if (hasLiked) {
        const { error } = await supabase
          .from("brick_likes")
          .delete()
          .eq("brick_index", brick.brick_index)
          .eq("user_id", user.id);

        if (error) throw error;
        setHasLiked(false);
        setLikeCount((c) => (c ?? 1) - 1);
      } else {
        const { error } = await supabase
          .from("brick_likes")
          .insert({ brick_index: brick.brick_index, user_id: user.id });

        if (error) throw error;
        setHasLiked(true);
        setLikeCount((c) => (c ?? 0) + 1);
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      alert("Could not update like. Please try again.");
    } finally {
      setLikeLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md max-h-[90vh] rounded-3xl bg-white shadow-xl">
        {/* Make inside a flex column so content scrolls and footer stays fixed */}
        <div className="flex max-h-[90vh] flex-col p-5 overflow-hidden">
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            {/* Header */}
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Brick details
                </div>
                <div className="mt-1 text-sm font-bold text-slate-900">
                  Brick #{brick_index} · x={coords.x}, y={coords.y}
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                Close
              </button>
            </div>

            {/* Brick preview */}
            <div className="mb-4 flex items-center gap-3">
              <div
                className="h-12 w-24 rounded-brick shadow-inner"
                style={{ backgroundColor: color || "#FFD352" }}
              />
              <div className="text-[11px] text-slate-600">
                <div>From the 1,000,000-brick digital wall.</div>
                <div>Each brick is unique and permanent.</div>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className="mb-4 rounded-2xl bg-slate-50 px-3 py-2 text-[12px] text-slate-800">
                “{message}”
              </div>
            )}

            {/* Social links */}
            {(facebook_url ||
              instagram_url ||
              youtube_url ||
              tiktok_url ||
              x_url) && (
              <div className="mb-4 space-y-1 text-[11px] text-slate-600">
                <div className="font-semibold text-slate-700">
                  Social links
                </div>
                <div className="flex flex-wrap gap-2">
                  {x_url && (
                    <a
                      href={x_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white hover:bg-slate-800"
                    >
                      𝕏 profile
                    </a>
                  )}
                  {instagram_url && (
                    <a
                      href={instagram_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-pink-500/90 px-3 py-1 text-[11px] font-semibold text-white hover:bg-pink-500"
                    >
                      Instagram
                    </a>
                  )}
                  {youtube_url && (
                    <a
                      href={youtube_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-red-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-red-700"
                    >
                      YouTube
                    </a>
                  )}
                  {tiktok_url && (
                    <a
                      href={tiktok_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white hover:bg-slate-800"
                    >
                      TikTok
                    </a>
                  )}
                  {facebook_url && (
                    <a
                      href={facebook_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-blue-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-blue-700"
                    >
                      Facebook
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer – stays visible, same look */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 flex-shrink-0">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={toggleLike}
                disabled={likeLoading}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${
                  hasLiked
                    ? "bg-rose-500 text-white hover:bg-rose-600"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                } disabled:opacity-60`}
              >
                <span>{hasLiked ? "♥" : "♡"}</span>
                <span>{hasLiked ? "Liked" : "Like this brick"}</span>
                <span className="ml-1 text-[10px] opacity-80">
                  {likeCount ?? 0}
                </span>
              </button>

              <button
                type="button"
                onClick={handleShareOnX}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                <span className="text-sm">𝕏</span>
                <span>Share</span>
              </button>
            </div>

            <div className="text-[10px] text-slate-500">
              Likes are per user · You can unlike anytime.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

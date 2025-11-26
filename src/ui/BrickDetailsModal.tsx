import React from "react";

type BrickDetails = {
  id: number;
  brick_index?: number;
  color: string;
  message?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
  tiktok_url?: string | null;
  x_url?: string | null;
};

type BrickDetailsProps = {
  open: boolean;
  brick: BrickDetails | null;
  onClose: () => void;
};

const socials = [
  { key: "facebook_url" as const, label: "Facebook", icon: "📘" },
  { key: "instagram_url" as const, label: "Instagram", icon: "📸" },
  { key: "youtube_url" as const, label: "YouTube", icon: "▶️" },
  { key: "tiktok_url" as const, label: "TikTok", icon: "🎵" },
  { key: "x_url" as const, label: "X / Twitter", icon: "𝕏" },
];

export default function BrickDetailsModal({
  open,
  brick,
  onClose,
}: BrickDetailsProps) {
  if (!open || !brick) return null;

  const colorStyle = {
    backgroundColor: brick.color || "#FFD352",
  };

  const hasAnySocial = socials.some((s) => {
    const value = (brick as any)[s.key];
    return typeof value === "string" && value.trim().length > 0;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-4 sm:p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              Brick #{brick.brick_index ?? brick.id}
            </h2>
            <p className="mt-1 text-xs text-slate-600 sm:text-sm">
              A proudly chaotic piece of the internet.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
          >
            ✕
          </button>
        </div>

        {/* Color preview */}
        <div
          className="mb-4 h-16 w-full rounded-brick shadow-inner"
          style={colorStyle}
        />

        {/* Message */}
        <div className="mb-4">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Message on this brick
          </h3>
          {brick.message ? (
            <p className="whitespace-pre-wrap text-sm text-slate-800">
              {brick.message}
            </p>
          ) : (
            <p className="text-sm italic text-slate-500">
              This brick has no message. Mysterious.
            </p>
          )}
        </div>

        {/* Social links */}
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            Linked socials
          </h3>
          {hasAnySocial ? (
            <div className="flex flex-wrap gap-2 text-xs">
              {socials.map((s) => {
                const value = (brick as any)[s.key];
                if (!value) return null;
                return (
                  <a
                    key={s.key}
                    href={value}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-slate-800 hover:bg-slate-200"
                  >
                    <span>{s.icon}</span>
                    <span>{s.label}</span>
                  </a>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              This brick has no linked socials.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

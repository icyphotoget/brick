type BrickDetailsProps = {
  open: boolean;
  brick: {
    id: number;
    brick_index?: number;
    color: string;
    message?: string | null;
    facebook_url?: string | null;
    instagram_url?: string | null;
    youtube_url?: string | null;
    tiktok_url?: string | null;
    x_url?: string | null;
  } | null;
  onClose: () => void;
};

export default function BrickDetailsModal({
  open,
  brick,
  onClose
}: BrickDetailsProps) {
  if (!open || !brick) return null;

  const socials = [
    { key: "facebook_url", label: "Facebook" },
    { key: "instagram_url", label: "Instagram" },
    { key: "youtube_url", label: "YouTube" },
    { key: "tiktok_url", label: "TikTok" },
    { key: "x_url", label: "X" }
  ] as const;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="relative z-50 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Brick #{brick.brick_index ?? brick.id}
            </h2>
            <p className="text-sm text-slate-600">
              Someone bought this brick and left a message.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-2 py-1 text-sm text-slate-500 hover:bg-slate-200"
          >
            ✕
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <div
            className="h-10 w-16 rounded-brick shadow-md"
            style={{ backgroundColor: brick.color }}
          />
          <div className="text-sm text-slate-800">
            {brick.message || "No message on this brick."}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-700">Social links</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {socials.map((s) => {
              const url = (brick as any)[s.key] as string | null | undefined;
              if (!url) return null;
              return (
                <a
                  key={s.key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-slate-100 px-3 py-1"
                >
                  {s.label}
                </a>
              );
            })}
            {!socials.some((s) => (brick as any)[s.key]) && (
              <span className="text-xs text-slate-500">
                This brick has no linked socials.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

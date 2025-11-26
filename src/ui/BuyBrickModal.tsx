import React, { useEffect, useState, FormEvent } from "react";

const COLORS = [
  { value: "#FFD352", label: "Yellow" },
  { value: "#8FD3FF", label: "Blue" },
  { value: "#FF9BD0", label: "Pink" },
  { value: "#8BE7B2", label: "Green" },
  { value: "#FF9F6E", label: "Orange" },
];

export type BuyBrickFormValues = {
  color: string;
  message: string;
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  tiktok_url?: string;
  x_url?: string;
  is_gift?: boolean;
  recipient_name?: string;
  recipient_email?: string;
  gift_note?: string;
};

type BuyBrickModalProps = {
  open: boolean;
  onClose: () => void;
  onComplete: (values: BuyBrickFormValues) => Promise<void> | void;
};

const initialFormValues: BuyBrickFormValues = {
  color: COLORS[0]?.value ?? "#FFD352",
  message: "",
  facebook_url: "",
  instagram_url: "",
  youtube_url: "",
  tiktok_url: "",
  x_url: "",
  is_gift: false,
  recipient_name: "",
  recipient_email: "",
  gift_note: "",
};

export default function BuyBrickModal({
  open,
  onClose,
  onComplete,
}: BuyBrickModalProps) {
  const [form, setForm] = useState<BuyBrickFormValues>(initialFormValues);
  const [submitting, setSubmitting] = useState(false);
  const [showLinks, setShowLinks] = useState(false);

  // Reset form whenever the modal is opened
  useEffect(() => {
    if (open) {
      setForm(initialFormValues);
      setShowLinks(false);
      setSubmitting(false);
    }
  }, [open]);

  const handleChange =
    (field: keyof BuyBrickFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleToggleGift = () => {
    setForm((prev) => ({
      ...prev,
      is_gift: !prev.is_gift,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.color) {
      alert("Please pick a brick color.");
      return;
    }

    if (!form.message.trim()) {
      const confirmNoMessage = window.confirm(
        "You didn't write a message. Do you want to continue anyway?"
      );
      if (!confirmNoMessage) return;
    }

    if (form.is_gift) {
      if (!form.recipient_email?.trim()) {
        alert("Please enter a recipient email for the gift.");
        return;
      }
    }

    try {
      setSubmitting(true);
      await onComplete({
        ...form,
        facebook_url: form.facebook_url || undefined,
        instagram_url: form.instagram_url || undefined,
        youtube_url: form.youtube_url || undefined,
        tiktok_url: form.tiktok_url || undefined,
        x_url: form.x_url || undefined,
        recipient_name: form.recipient_name || undefined,
        recipient_email: form.recipient_email || undefined,
        gift_note: form.gift_note || undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-4 sm:p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              Buy a brick
            </h2>
            <p className="mt-1 text-xs text-slate-600 sm:text-sm">
              Pick a color, write something unhinged, optionally link your
              socials, and claim your spot on the wall.
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Colors */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({ ...prev, color: c.value }))
                  }
                  className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-medium shadow-sm ${
                    form.color === c.value
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-white text-slate-800 hover:border-slate-400"
                  }`}
                >
                  <span
                    className="h-4 w-4 rounded-brick shadow-inner"
                    style={{ backgroundColor: c.value }}
                  />
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-600">
              Message on your brick
            </label>
            <textarea
              value={form.message}
              onChange={handleChange("message")}
              rows={4}
              maxLength={280}
              placeholder="Your confession, meme, manifesto, or love letter to your future self..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
            <div className="mt-1 text-right text-[11px] text-slate-500">
              {form.message.length}/280
            </div>
          </div>

          {/* Social links toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowLinks((v) => !v)}
              className="text-xs font-semibold text-slate-700 underline-offset-2 hover:underline"
            >
              {showLinks ? "Hide social links" : "Add social links (optional)"}
            </button>
            {showLinks && (
              <div className="mt-3 space-y-2">
                <input
                  type="url"
                  value={form.facebook_url}
                  onChange={handleChange("facebook_url")}
                  placeholder="Facebook URL"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
                <input
                  type="url"
                  value={form.instagram_url}
                  onChange={handleChange("instagram_url")}
                  placeholder="Instagram URL"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
                <input
                  type="url"
                  value={form.youtube_url}
                  onChange={handleChange("youtube_url")}
                  placeholder="YouTube URL"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
                <input
                  type="url"
                  value={form.tiktok_url}
                  onChange={handleChange("tiktok_url")}
                  placeholder="TikTok URL"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
                <input
                  type="url"
                  value={form.x_url}
                  onChange={handleChange("x_url")}
                  placeholder="X / Twitter URL"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            )}
          </div>

          {/* Gift toggle + fields */}
          <div className="rounded-2xl bg-slate-50 px-3 py-3 text-xs text-slate-700">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={!!form.is_gift}
                onChange={handleToggleGift}
                className="mt-0.5 h-3 w-3 rounded border-slate-300 text-slate-900"
              />
              <span>
                Make this a gift brick
                <span className="block text-[11px] font-normal text-slate-500">
                  We&apos;ll email the recipient with your message and their
                  brick details.
                </span>
              </span>
            </label>

            {form.is_gift && (
              <div className="mt-3 space-y-2">
                <input
                  type="text"
                  value={form.recipient_name}
                  onChange={handleChange("recipient_name")}
                  placeholder="Recipient name (optional)"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
                <input
                  type="email"
                  value={form.recipient_email}
                  onChange={handleChange("recipient_email")}
                  placeholder="Recipient email (required)"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  required
                />
                <textarea
                  value={form.gift_note}
                  onChange={handleChange("gift_note")}
                  rows={3}
                  placeholder="Short note to include in the gift email (optional)"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none ring-offset-2 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-2 flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-brickYellow px-5 py-2 text-xs sm:text-sm font-semibold text-slate-900 shadow-md hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Processing..."
                : form.is_gift
                ? "Confirm & send gift"
                : "Confirm & buy"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

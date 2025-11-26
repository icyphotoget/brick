import { useState, FormEvent } from "react";

const COLORS = [
  { value: "#FFD352", label: "Yellow" },
  { value: "#8FD3FF", label: "Blue" },
  { value: "#FF9BD0", label: "Pink" },
  { value: "#8BE7B2", label: "Green" },
  { value: "#FF9F6E", label: "Orange" }
];

export type BuyBrickFormValues = {
  color: string;
  message: string;
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  tiktok_url?: string;
  x_url?: string;

  // GIFT
  is_gift: boolean;
  recipient_name?: string;
  recipient_email?: string;
  gift_note?: string;
};

type BuyBrickModalProps = {
  open: boolean;
  onClose: () => void;
  onComplete: (values: BuyBrickFormValues) => void;
};

export default function BuyBrickModal({
  open,
  onClose,
  onComplete
}: BuyBrickModalProps) {
  const [color, setColor] = useState(COLORS[0].value);
  const [message, setMessage] = useState("");

  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [tiktokUrl, setTiktokUrl] = useState("");
  const [xUrl, setXUrl] = useState("");

  // ⭐ GIFT FIELDS
  const [isGift, setIsGift] = useState(false);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [giftNote, setGiftNote] = useState("");

  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      alert("Please add a short message for your brick 🙂");
      return;
    }

    if (isGift) {
      if (!recipientName.trim()) {
        alert("Please enter the recipient's name.");
        return;
      }
      if (!recipientEmail.trim() || !recipientEmail.includes("@")) {
        alert("Please enter a valid recipient email.");
        return;
      }
    }

    setSubmitting(true);

    const values: BuyBrickFormValues = {
      color,
      message: message.trim(),
      facebook_url: facebookUrl.trim() || undefined,
      instagram_url: instagramUrl.trim() || undefined,
      youtube_url: youtubeUrl.trim() || undefined,
      tiktok_url: tiktokUrl.trim() || undefined,
      x_url: xUrl.trim() || undefined,

      // ⭐ GIFT INFO
      is_gift: isGift,
      recipient_name: isGift ? recipientName.trim() : undefined,
      recipient_email: isGift ? recipientEmail.trim() : undefined,
      gift_note: isGift ? giftNote.trim() : undefined
    };

    onComplete(values);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="relative z-50 w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        {/* header */}
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Buy a brick for $1
            </h2>
            <p className="text-sm text-slate-600">
              Choose a color, write a message, add socials and (optionally) send it as a gift.
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

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* color */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-800">
              Brick color
            </label>

            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`h-9 w-9 rounded-brick border-2 shadow-sm ${
                    color === c.value
                      ? "border-slate-900"
                      : "border-transparent opacity-80"
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          {/* message */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-800">
              Message on your brick
            </label>

            <textarea
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none focus:border-brickYellow focus:ring-2 focus:ring-brickYellow/40"
              rows={3}
              maxLength={80}
              placeholder="Mark was here 👋"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="mt-1 text-right text-[11px] text-slate-500">
              {message.length}/80 characters
            </div>
          </div>

          {/* socials */}
          <div className="space-y-2 rounded-2xl bg-slate-50 p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-700">
                Optional: link your socials
              </p>
            </div>

            <div className="space-y-1.5">
              <input type="url" placeholder="Facebook profile URL"
                className="input" value={facebookUrl} onChange={(e) => setFacebookUrl(e.target.value)} />

              <input type="url" placeholder="Instagram profile URL"
                className="input" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} />

              <input type="url" placeholder="YouTube channel URL"
                className="input" value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />

              <input type="url" placeholder="TikTok profile URL"
                className="input" value={tiktokUrl} onChange={(e) => setTiktokUrl(e.target.value)} />

              <input type="url" placeholder="X (Twitter) profile URL"
                className="input" value={xUrl} onChange={(e) => setXUrl(e.target.value)} />
            </div>
          </div>

          {/* ⭐ GIFT SECTION */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={isGift}
                onChange={(e) => setIsGift(e.target.checked)}
              />
              Send this brick as a gift
            </label>

            {isGift && (
              <div className="mt-3 space-y-2 text-sm">

                <input
                  placeholder="Recipient name"
                  className="input"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />

                <input
                  placeholder="Recipient email"
                  className="input"
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />

                <textarea
                  placeholder="Personal note (optional)"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  rows={2}
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* footer */}
          <div className="mt-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-800">
              Price: <span className="text-slate-900">$1</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-brickYellow px-5 py-2 text-sm font-semibold text-slate-900 shadow-md hover:brightness-105"
            >
              {isGift ? "Confirm & send gift" : "Confirm & buy"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

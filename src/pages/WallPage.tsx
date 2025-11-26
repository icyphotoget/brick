import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import FullWallCanvas, { SoldBrick } from "../ui/FullWallCanvas";
import BuyBrickModal, { BuyBrickFormValues } from "../ui/BuyBrickModal";
import BrickDetailsModal from "../ui/BrickDetailsModal";
import { useAuth } from "../lib/auth";

const WALL_WIDTH = 1000;

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
  } | null;
  order: {
    id: string;
    status: string;
    total_usd_cents: number;
  } | null;
};

export default function WallPage() {
  const location = useLocation();
  const { user } = useAuth();

  const [soldBricks, setSoldBricks] = useState<SoldBrick[]>([]);
  const [loadingWall, setLoadingWall] = useState(true);

  const [buyOpen, setBuyOpen] = useState(false);
  const [selectedBrickIndex, setSelectedBrickIndex] = useState<number | null>(
    null
  );

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedBrickDetails, setSelectedBrickDetails] =
    useState<ReserveResponse["brick"] | null>(null);

  const [hoverBrickIndex, setHoverBrickIndex] = useState<number | null>(null);

  const [myBrickIndexes, setMyBrickIndexes] = useState<number[]>([]);
  const [highlightMyBricks, setHighlightMyBricks] = useState(false);

  // učitaj sve prodane cigle (bojanje zida)
  useEffect(() => {
    const loadSoldBricks = async () => {
      const { data, error } = await supabase
        .from("bricks")
        .select(
          "brick_index, color"
        )
        .eq("status", "sold");

      if (error) {
        console.error(error);
        alert("Error loading wall: " + error.message);
      } else {
        const mapped: SoldBrick[] =
          (data ?? []).map((b: any) => ({
            brick_index: b.brick_index,
            color: b.color || "#FFD352"
          })) || [];
        setSoldBricks(mapped);
      }
      setLoadingWall(false);
    };

    loadSoldBricks();
  }, []);

  // učitaj moje cigle
  useEffect(() => {
    if (!user) {
      setMyBrickIndexes([]);
      setHighlightMyBricks(false);
      return;
    }

    const loadMyBricks = async () => {
      const { data, error } = await supabase
        .from("bricks")
        .select("brick_index")
        .eq("owner_id", user.id);

      if (error) {
        console.error(error);
        return;
      }

      setMyBrickIndexes(
        (data ?? []).map((b: any) => b.brick_index as number)
      );
    };

    loadMyBricks();
  }, [user]);

  // ako dođeš na /wall?brick=123 možemo auto selektati tu ciglu (kasnije)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const brickParam = params.get("brick");
    if (brickParam) {
      const idx = parseInt(brickParam, 10);
      if (!Number.isNaN(idx)) {
        setSelectedBrickIndex(idx);
      }
    }
  }, [location.search]);

  const handleBrickClick = (brickIndex: number) => {
    setSelectedBrickIndex(brickIndex);

    // provjeri je li već sold – ako je, otvori detalje
    const existing = soldBricks.find((b) => b.brick_index === brickIndex);
    if (existing) {
      // za detalje idealno dohvatiti real ciglu iz Supabase
      setSelectedBrickDetails({
        id: brickIndex,
        brick_index: brickIndex,
        x: brickIndex % WALL_WIDTH,
        y: Math.floor(brickIndex / WALL_WIDTH),
        color: existing.color,
        message: null,
        facebook_url: null,
        instagram_url: null,
        youtube_url: null,
        tiktok_url: null,
        x_url: null
      });
      setDetailsOpen(true);
    } else {
      // nova cigla za kupnju
      setBuyOpen(true);
    }
  };

  const handleComplete = async (values: BuyBrickFormValues) => {
    if (selectedBrickIndex == null) {
      alert("Nema odabrane cigle.");
      return;
    }

    try {
      const { data, error } = await supabase.rpc<ReserveResponse>(
        "reserve_brick_and_create_order",
        {
          p_brick_index: selectedBrickIndex,
          p_color: values.color,
          p_message: values.message,
          p_facebook_url: values.facebook_url ?? null,
          p_instagram_url: values.instagram_url ?? null,
          p_youtube_url: values.youtube_url ?? null,
          p_tiktok_url: values.tiktok_url ?? null,
          p_x_url: values.x_url ?? null
        }
      );

      if (error) {
        console.error("Supabase error:", error);
        alert("Greška pri kupnji cigle: " + error.message);
        return;
      }

      if (!data || !data.brick) {
        alert("Nešto je pošlo po zlu – nema vraćene cigle.");
        return;
      }

      const brick = data.brick;

      // dodaj u globalni zid
      setSoldBricks((prev) => {
        if (prev.some((b) => b.brick_index === brick.brick_index)) return prev;
        return [
          ...prev,
          {
            brick_index: brick.brick_index,
            color: brick.color
          }
        ];
      });

      // ako sam logiran, dodaj i u moje cigle
      if (user) {
        setMyBrickIndexes((prev) =>
          prev.includes(brick.brick_index)
            ? prev
            : [...prev, brick.brick_index]
        );
      }

      alert(
        `Kupnja uspješna! Tvoja cigla je #${brick.brick_index} (x=${brick.x}, y=${brick.y})`
      );
      setBuyOpen(false);
    } catch (e: any) {
      console.error(e);
      alert("Neočekivana greška, pokušaj ponovno.");
    }
  };

  const currentBrickIndex = hoverBrickIndex ?? selectedBrickIndex;

  const currentBrickCoords = useMemo(() => {
    if (currentBrickIndex == null) return null;
    return {
      index: currentBrickIndex,
      x: currentBrickIndex % WALL_WIDTH,
      y: Math.floor(currentBrickIndex / WALL_WIDTH)
    };
  }, [currentBrickIndex]);

  const shareUrl =
    currentBrickIndex != null
      ? `${window.location.origin}/wall?brick=${currentBrickIndex}`
      : null;

  const handleShare = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link kopiran u međuspremnik! 📋");
    } catch {
      alert("Nisam uspio kopirati, ali link je: " + shareUrl);
    }
  };

  const handleFindMyBricks = () => {
    if (!user) {
      alert("Prijavi se da vidiš svoje cigle.");
      return;
    }
    if (myBrickIndexes.length === 0) {
      alert("Još nemaš nijednu ciglu. Klikni na zid i kupi jednu! 🧱");
      return;
    }
    setHighlightMyBricks(true);
    setSelectedBrickIndex(myBrickIndexes[0]);
  };

  const highlightedIndexes = highlightMyBricks ? myBrickIndexes : [];

  if (loadingWall) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center text-slate-600">
        Loading wall...
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col">
      <div className="relative flex-1">
        {/* cijeli ekran = zid */}
        <FullWallCanvas
          soldBricks={soldBricks}
          onBrickClick={handleBrickClick}
          onBrickHover={(idx) => setHoverBrickIndex(idx)}
          highlightedBrickIndexes={highlightedIndexes}
        />

        {/* HUD gore */}
        <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
          <div className="pointer-events-auto flex items-center gap-4 rounded-full bg-white/85 px-4 py-2 text-xs shadow">
            <span className="font-semibold text-slate-800">
              {currentBrickCoords
                ? `Brick #${currentBrickCoords.index} (x=${currentBrickCoords.x}, y=${currentBrickCoords.y})`
                : "Hover or click a brick"}
            </span>
            {shareUrl && (
              <button
                onClick={handleShare}
                className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-white"
              >
                Share this brick
              </button>
            )}
            {user && (
              <button
                onClick={handleFindMyBricks}
                className="rounded-full bg-brickYellow px-3 py-1 text-[11px] font-semibold text-slate-900"
              >
                Find my bricks
              </button>
            )}
          </div>
        </div>
      </div>

      <BuyBrickModal
        open={buyOpen}
        onClose={() => setBuyOpen(false)}
        onComplete={handleComplete}
      />

      <BrickDetailsModal
        open={detailsOpen}
        brick={selectedBrickDetails}
        onClose={() => setDetailsOpen(false)}
      />
    </div>
  );
}

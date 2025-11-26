// src/pages/WallPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import FullWallCanvas, { SoldBrick } from "../ui/FullWallCanvas";
import BuyBrickModal, { BuyBrickFormValues } from "../ui/BuyBrickModal";
import BrickDetailsModal from "../ui/BrickDetailsModal";
import { useAuth } from "../lib/auth";

import {
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
} from "@solana/spl-token";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const WALL_WIDTH = 1000;

const PRICE_SOL = 0.05;
const PRICE_USDC = 5;

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

type WallBrick = {
  id: number;
  brick_index: number;
  color: string;
  message: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  x_url: string | null;
  owner_id: string | null;
};

export default function WallPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected } = useWallet();

  const merchantWallet = useMemo(() => {
    const key = import.meta.env.VITE_SOLANA_MERCHANT_WALLET;
    if (!key) return null;
    try {
      return new PublicKey(key);
    } catch {
      console.error("Invalid VITE_SOLANA_MERCHANT_WALLET");
      return null;
    }
  }, []);

  const usdcMint = useMemo(() => {
    const key = import.meta.env.VITE_SOLANA_USDC_MINT;
    if (!key) return null;
    try {
      return new PublicKey(key);
    } catch {
      console.error("Invalid VITE_SOLANA_USDC_MINT");
      return null;
    }
  }, []);

  const [loadingWall, setLoadingWall] = useState(true);
  const [bricks, setBricks] = useState<WallBrick[]>([]);
  const [soldBricks, setSoldBricks] = useState<SoldBrick[]>([]);

  const [buyOpen, setBuyOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [selectedBrickIndex, setSelectedBrickIndex] = useState<number | null>(
    null
  );
  const [selectedCoords, setSelectedCoords] = useState<{ x: number; y: number } | null>(
    null
  );
  const [selectedBrickDetails, setSelectedBrickDetails] =
    useState<WallBrick | null>(null);

  const [hoveredBrickIndex, setHoveredBrickIndex] = useState<number | null>(
    null
  );
  const [highlightMyBricks, setHighlightMyBricks] = useState(false);

  useEffect(() => {
    if (location.hash === "#buy") {
      // If user isn’t logged in, send them to login
      if (!user) {
        navigate("/login?redirect=/wall#buy");
      } else {
        setBuyOpen(true);
      }
    }
  }, [location.hash, navigate, user]);

  useEffect(() => {
    const loadSold = async () => {
      setLoadingWall(true);
      const { data, error } = await supabase
        .from("bricks")
        .select(
          "id, brick_index, color, message, facebook_url, instagram_url, youtube_url, tiktok_url, x_url, owner_id, status"
        )
        .eq("status", "sold")
        .order("brick_index", { ascending: true })
        .limit(20000);

      if (error) {
        console.error("Error loading wall:", error);
        alert("Error loading wall: " + error.message);
        setLoadingWall(false);
        return;
      }

      const rows = (data ?? []) as any[];
      const mappedBricks: WallBrick[] = rows.map((row) => ({
        id: row.id,
        brick_index: row.brick_index,
        color: row.color || "#FFD352",
        message: row.message ?? null,
        facebook_url: row.facebook_url ?? null,
        instagram_url: row.instagram_url ?? null,
        youtube_url: row.youtube_url ?? null,
        tiktok_url: row.tiktok_url ?? null,
        x_url: row.x_url ?? null,
        owner_id: row.owner_id ?? null,
      }));

      setBricks(mappedBricks);
      setSoldBricks(
        mappedBricks.map((b) => ({
          brick_index: b.brick_index,
          color: b.color,
        }))
      );
      setLoadingWall(false);
    };

    loadSold();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("bricks-realtime-wall")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bricks" },
        (payload) => {
          const newRow: any = payload.new;
          if (!newRow) return;
          if (newRow.status !== "sold") return;

          const brickIndex = newRow.brick_index;
          const color = newRow.color || "#FFD352";

          setBricks((prev) => {
            const exists = prev.some((b) => b.brick_index === brickIndex);
            const updated: WallBrick = {
              id: newRow.id,
              brick_index: brickIndex,
              color,
              message: newRow.message ?? null,
              facebook_url: newRow.facebook_url ?? null,
              instagram_url: newRow.instagram_url ?? null,
              youtube_url: newRow.youtube_url ?? null,
              tiktok_url: newRow.tiktok_url ?? null,
              x_url: newRow.x_url ?? null,
              owner_id: newRow.owner_id ?? null,
            };
            if (exists) {
              return prev.map((b) =>
                b.brick_index === brickIndex ? updated : b
              );
            }
            return [...prev, updated];
          });

          setSoldBricks((prev) => {
            if (prev.some((b) => b.brick_index === brickIndex)) return prev;
            return [...prev, { brick_index: brickIndex, color }];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const myBrickIndexes = useMemo(() => {
    if (!user) return [];
    return bricks
      .filter((b) => b.owner_id === user.id)
      .map((b) => b.brick_index);
  }, [bricks, user]);

  const highlightedIndexes = highlightMyBricks ? myBrickIndexes : [];

  const getCoords = (idx: number) => ({
    x: idx % WALL_WIDTH,
    y: Math.floor(idx / WALL_WIDTH),
  });

  const handleBrickClick = (brickIndex: number, x: number, y: number) => {
    const existing = bricks.find((b) => b.brick_index === brickIndex);

    if (existing) {
      // Viewing an existing brick is allowed without login
      setSelectedBrickDetails(existing);
      setDetailsOpen(true);
      setSelectedBrickIndex(brickIndex);
      setSelectedCoords({ x, y });
      return;
    }

    // NEW: require login to buy a brick
    if (!user) {
      alert("You need to be logged in to buy a brick.");
      navigate("/login?redirect=/wall#buy");
      return;
    }

    setSelectedBrickIndex(brickIndex);
    setSelectedCoords({ x, y });
    setBuyOpen(true);
    setDetailsOpen(false);
  };

  const { connection: solConnection } = useConnection();

  const payWithSol = async () => {
    if (!connected || !publicKey) {
      throw new Error("Connect your Solana wallet first.");
    }
    if (!merchantWallet) {
      throw new Error("Merchant wallet is not configured.");
    }

    const lamports = Math.round(PRICE_SOL * LAMPORTS_PER_SOL);
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: merchantWallet,
        lamports,
      })
    );

    const sig = await sendTransaction(tx, solConnection);
    await solConnection.confirmTransaction(sig, "confirmed");
    return sig;
  };

  const payWithUsdc = async () => {
    if (!connected || !publicKey) {
      throw new Error("Connect your Solana wallet first.");
    }
    if (!merchantWallet) {
      throw new Error("Merchant wallet is not configured.");
    }
    if (!usdcMint) {
      throw new Error("USDC mint is not configured.");
    }

    const fromTokenAccount = await getAssociatedTokenAddress(
      usdcMint,
      publicKey
    );
    const toTokenAccount = await getAssociatedTokenAddress(
      usdcMint,
      merchantWallet
    );

    const amount = Math.round(PRICE_USDC * 1_000_000);
    const tx = new Transaction().add(
      createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        publicKey,
        amount
      )
    );

    const sig = await sendTransaction(tx, solConnection);
    await solConnection.confirmTransaction(sig, "confirmed");
    return sig;
  };

  const handleComplete = async (values: BuyBrickFormValues) => {
    // NEW: double-safety – must be logged in and have a brick selected
    if (!user) {
      alert("You need to be logged in to buy a brick.");
      setBuyOpen(false);
      return;
    }
    if (!buyOpen || selectedBrickIndex == null) {
      return;
    }

    try {
      let signature: string | undefined;

      if (values.paymentToken === "SOL") {
        signature = await payWithSol();
      } else {
        signature = await payWithUsdc();
      }

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
          p_is_gift: values.is_gift ?? false,
          p_recipient_name: values.recipient_name ?? null,
          p_recipient_email: values.recipient_email ?? null,
          p_gift_note: values.gift_note ?? null,
        }
      );

      if (error) {
        console.error("Supabase error:", error);
        alert("Purchase failed after payment: " + error.message);
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

      setBricks((prev) => {
        const exists = prev.some((b) => b.brick_index === brick.brick_index);
        const updated: WallBrick = {
          id: brick.id,
          brick_index: brick.brick_index,
          color: brick.color,
          message: brick.message ?? null,
          facebook_url: brick.facebook_url ?? null,
          instagram_url: brick.instagram_url ?? null,
          youtube_url: brick.youtube_url ?? null,
          tiktok_url: brick.tiktok_url ?? null,
          x_url: brick.x_url ?? null,
          owner_id: user.id,
        };
        if (exists) {
          return prev.map((b) =>
            b.brick_index === brick.brick_index ? updated : b
          );
        }
        return [...prev, updated];
      });

      const coords = getCoords(brick.brick_index);
      const paymentLabel = values.paymentToken === "SOL" ? "SOL" : "USDC";

      if (values.is_gift) {
        alert(
          `Gift brick purchased with ${paymentLabel}! Brick #${brick.brick_index} is reserved and the recipient will get an email.`
        );
      } else {
        alert(
          `Success! You paid with ${paymentLabel}. Brick #${brick.brick_index} is now yours (x=${coords.x}, y=${coords.y}).`
        );
      }

      setBuyOpen(false);
    } catch (e: any) {
      console.error(e);
      alert(e?.message || "Unexpected error during Solana payment.");
    }
  };

  const handleHover = (brickIndex: number | null) => {
    setHoveredBrickIndex(brickIndex);
  };

  const handleToggleMyBricks = () => {
    if (!user) {
      alert("You need to be logged in to highlight your bricks.");
      return;
    }
    if (!myBrickIndexes.length) {
      alert(
        "You don't own any bricks yet. Click somewhere on the wall to buy one! 🧱"
      );
      return;
    }
    setHighlightMyBricks((prev) => !prev);
  };

  if (loadingWall) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center text-slate-600">
        Loading wall...
      </div>
    );
  }

  const hoveredCoords =
    hoveredBrickIndex != null ? getCoords(hoveredBrickIndex) : null;

  return (
    <div className="flex min-h-[400px] h-[calc(100vh-64px)] flex-col overflow-hidden">
      <div className="relative flex-1">
       {/* <div className="pointer-events-auto absolute left-3 top-3 z-10">
  <WalletMultiButton />
</div> */}


        <FullWallCanvas
          soldBricks={soldBricks}
          onBrickClick={handleBrickClick}
          onBrickHover={handleHover}
          highlightedBrickIndexes={highlightedIndexes}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex flex-wrap items-center justify-center gap-2 px-3 text-[11px] sm:text-xs md:text-sm">
          <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-full bg-white/85 px-3 py-2 shadow">
            <span className="font-semibold text-slate-800">
              {hoveredBrickIndex != null && hoveredCoords
                ? `Brick #${hoveredBrickIndex} (x=${hoveredCoords.x}, y=${hoveredCoords.y})`
                : "Tap or hover a brick to inspect it"}
            </span>

            <button
              type="button"
              onClick={handleToggleMyBricks}
              className="rounded-full bg-brickYellow px-3 py-1 text-[11px] font-semibold text-slate-900 hover:brightness-105"
            >
              {highlightMyBricks ? "Hide my bricks" : "Highlight my bricks"}
            </button>

            <span className="ml-2 text-[10px] text-slate-500">
              Price: {PRICE_SOL} SOL or {PRICE_USDC} USDC
            </span>
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
        brick={
          selectedBrickDetails && {
            id: selectedBrickDetails.id,
            brick_index: selectedBrickDetails.brick_index,
            color: selectedBrickDetails.color,
            message: selectedBrickDetails.message,
            facebook_url: selectedBrickDetails.facebook_url,
            instagram_url: selectedBrickDetails.instagram_url,
            youtube_url: selectedBrickDetails.youtube_url,
            tiktok_url: selectedBrickDetails.tiktok_url,
            x_url: selectedBrickDetails.x_url,
          }
        }
        onClose={() => setDetailsOpen(false)}
      />
    </div>
  );
}

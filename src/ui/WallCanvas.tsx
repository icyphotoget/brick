import { useEffect, useRef, useState } from "react";
import type React from "react";

export type Brick = {
  id: number;
  x: number;
  y: number;
  color: string;
  brick_index?: number;
  message?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
  tiktok_url?: string | null;
  x_url?: string | null;
};

type WallCanvasProps = {
  bricks: Brick[];
  width: number;
  height: number;
  onBrickClick?: (brick: Brick) => void;
};

export default function WallCanvas({ bricks, onBrickClick }: WallCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scale, setScale] = useState(0.4);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const isPanning = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      setScale((s) => Math.min(4, Math.max(0.1, s * factor)));
    };

    const onDown = (e: MouseEvent) => {
      isPanning.current = true;
      lastPos.current = { x: e.clientX, y: e.clientY };
    };

    const onMove = (e: MouseEvent) => {
      if (!isPanning.current) return;
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      lastPos.current = { x: e.clientX, y: e.clientY };
      setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
    };

    const onUp = () => {
      isPanning.current = false;
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("mousedown", onDown);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);
    ctx.save();

    ctx.translate(offset.x, offset.y);

    const brickW = 16 * scale;
    const brickH = 10 * scale;
    const gapX = 0.6 * scale; // malo “mortara” lijevo/desno
    const gapY = 0.05 * scale; // gotovo ništa između redova
    const radius = 3 * scale;

    for (const b of bricks) {
      const px = b.x * (brickW + gapX);
      const py = b.y * (brickH + gapY);

      if (brickH < 3) {
        ctx.fillStyle = b.color;
        ctx.fillRect(px, py, brickW, brickH);
        continue;
      }

      drawLegoBrick(ctx, px, py, brickW, brickH, radius, b.color);
    }

    ctx.restore();
  }, [bricks, offset, scale]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onBrickClick) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left - offset.x;
    const clickY = e.clientY - rect.top - offset.y;

    const brickW = 16 * scale;
    const brickH = 10 * scale;
    const gapX = 0.6 * scale;
    const gapY = 0.05 * scale;

    const gridX = Math.floor(clickX / (brickW + gapX));
    const gridY = Math.floor(clickY / (brickH + gapY));

    const brick = bricks.find((b) => b.x === gridX && b.y === gridY);
    if (brick) onBrickClick(brick);
  };

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full rounded-3xl bg-sky shadow-inner"
      width={1200}
      height={700}
      onClick={handleClick}
    />
  );
}

/**
 * Realistična LEGO kocka:
 * - zaobljena baza s vertikalnim gradientom
 * - lagani gloss gore
 * - 2 studa gore, bez sjene koja strši ispod cigle
 */
function drawLegoBrick(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  color: string
) {
  ctx.save();

  // --- baza cigle s vertikalnim gradientom ---
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, lighten(color, 0.18));
  grad.addColorStop(1, darken(color, 0.18));

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // tanke linije “contact” zona da izgleda kao da se kocke dodiruju
  ctx.strokeStyle = darken(color, 0.25);
  ctx.lineWidth = Math.max(1, h * 0.05);
  ctx.stroke();

  // lagani gloss na gornjoj trećini
  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 1, y + 1, w - 2, h * 0.3);
  const gloss = ctx.createLinearGradient(x, y, x, y + h * 0.3);
  gloss.addColorStop(0, "rgba(255,255,255,0.45)");
  gloss.addColorStop(1, "rgba(255,255,255,0.0)");
  ctx.fillStyle = gloss;
  ctx.fill();
  ctx.restore();

  // unutarnji shadow pri dnu (unutar cigle, ne ispod!)
  ctx.save();
  ctx.beginPath();
  ctx.rect(x + 1, y + h * 0.7, w - 2, h * 0.3);
  const innerShadow = ctx.createLinearGradient(
    x,
    y + h * 0.7,
    x,
    y + h
  );
  innerShadow.addColorStop(0, "rgba(0,0,0,0.15)");
  innerShadow.addColorStop(1, "rgba(0,0,0,0.3)");
  ctx.fillStyle = innerShadow;
  ctx.fill();
  ctx.restore();

  // --- LEGO studovi ---
  const studRadius = w * 0.18;
  const studHeight = h * 0.35;
  const studY = y + h * 0.04;
  const leftX = x + w * 0.30;
  const rightX = x + w * 0.70;

  drawStud(ctx, leftX, studY, studRadius, studHeight, color);
  drawStud(ctx, rightX, studY, studRadius, studHeight, color);

  ctx.restore();
}

function drawStud(
  ctx: CanvasRenderingContext2D,
  cx: number,
  topY: number,
  radius: number,
  height: number,
  color: string
) {
  ctx.save();

  const bottomY = topY + height;

  const bodyGrad = ctx.createLinearGradient(cx, topY, cx, bottomY);
  bodyGrad.addColorStop(0, lighten(color, 0.3));
  bodyGrad.addColorStop(1, darken(color, 0.2));

  // tijelo cilindra
  ctx.beginPath();
  ctx.ellipse(
    cx,
    (topY + bottomY) / 2,
    radius,
    radius * 0.65,
    0,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // top kapica
  ctx.beginPath();
  ctx.ellipse(cx, topY, radius, radius * 0.55, 0, 0, Math.PI * 2);
  ctx.fillStyle = lighten(color, 0.35);
  ctx.fill();

  // highlight gore lijevo
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.ellipse(
    cx - radius * 0.35,
    topY - radius * 0.15,
    radius * 0.35,
    radius * 0.22,
    0,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.globalAlpha = 1;

  ctx.restore();
}

// --- helperi za boje ---

function lighten(hex: string, amount: number) {
  return shadeColor(hex, amount);
}
function darken(hex: string, amount: number) {
  return shadeColor(hex, -amount);
}

function shadeColor(hex: string, amount: number) {
  if (!hex.startsWith("#") || (hex.length !== 7 && hex.length !== 4)) return hex;

  let r: number, g: number, b: number;

  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }

  const adj = (c: number) =>
    Math.max(0, Math.min(255, Math.round(c + c * amount)));

  const nr = adj(r);
  const ng = adj(g);
  const nb = adj(b);

  return (
    "#" +
    nr.toString(16).padStart(2, "0") +
    ng.toString(16).padStart(2, "0") +
    nb.toString(16).padStart(2, "0")
  );
}

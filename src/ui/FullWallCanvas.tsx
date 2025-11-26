import React, { useEffect, useMemo, useRef, useState } from "react";

const WALL_WIDTH = 1000;
const WALL_HEIGHT = 1000;

export type SoldBrick = {
  brick_index: number;
  color: string;
};

type FullWallCanvasProps = {
  soldBricks: SoldBrick[];
  onBrickClick?: (brickIndex: number, x: number, y: number) => void;
  onBrickHover?: (brickIndex: number | null) => void;
  highlightedBrickIndexes?: number[];
};

type LayoutInfo = {
  width: number;
  height: number;
  cellSize: number;
  offsetX: number;
  offsetY: number;
};

export default function FullWallCanvas({
  soldBricks,
  onBrickClick,
  onBrickHover,
  highlightedBrickIndexes = [],
}: FullWallCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [size, setSize] = useState({ width: 0, height: 0 });
  const [layout, setLayout] = useState<LayoutInfo | null>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const isPanning = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const [hoverBrick, setHoverBrick] = useState<number | null>(null);

  const isPinching = useRef(false);
  const pinchStartDistance = useRef(0);
  const pinchStartZoom = useRef(1);

  const soldMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const b of soldBricks) map.set(b.brick_index, b.color);
    return map;
  }, [soldBricks]);

  // container size
  useEffect(() => {
    const cont = containerRef.current;
    if (!cont) return;

    const resize = () => {
      const rect = cont.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const clampZoom = (z: number) => Math.min(12, Math.max(0.5, z));

  // layout from size/zoom/pan
  useEffect(() => {
    if (size.width === 0 || size.height === 0) return;

    const shortestSide = Math.min(size.width, size.height);
    const baseCell =
      shortestSide < 600
        ? Math.max(3, Math.floor(shortestSide / 200))
        : Math.max(2, Math.floor(shortestSide / 300));

    const cellSize = baseCell * zoom;
    const wallW = cellSize * WALL_WIDTH;
    const wallH = cellSize * WALL_HEIGHT;

    const offsetX = (size.width - wallW) / 2 + pan.x;
    const offsetY = (size.height - wallH) / 2 + pan.y;

    setLayout({
      width: size.width,
      height: size.height,
      cellSize,
      offsetX,
      offsetY,
    });
  }, [size, zoom, pan]);

  // draw grid + sold bricks
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !layout) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = layout.width * dpr;
    canvas.height = layout.height * dpr;

    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, layout.width, layout.height);

    const { width, height, cellSize, offsetX, offsetY } = layout;

    // background
    ctx.fillStyle = "#E0F2FE";
    ctx.fillRect(0, 0, width, height);

    // visible indices
    const startXIndex = Math.max(0, Math.floor(-offsetX / cellSize));
    const endXIndex = Math.min(
      WALL_WIDTH,
      Math.ceil((width - offsetX) / cellSize)
    );
    const startYIndex = Math.max(0, Math.floor(-offsetY / cellSize));
    const endYIndex = Math.min(
      WALL_HEIGHT,
      Math.ceil((height - offsetY) / cellSize)
    );

    // grid lines
    ctx.beginPath();
    ctx.strokeStyle = "rgba(148, 163, 184, 0.25)"; // slate-400 @ 25%
    ctx.lineWidth = 0.5;

    for (let xIdx = startXIndex; xIdx <= endXIndex; xIdx++) {
      const x = offsetX + xIdx * cellSize;
      ctx.moveTo(x, offsetY + startYIndex * cellSize);
      ctx.lineTo(x, offsetY + endYIndex * cellSize);
    }

    for (let yIdx = startYIndex; yIdx <= endYIndex; yIdx++) {
      const y = offsetY + yIdx * cellSize;
      ctx.moveTo(offsetX + startXIndex * cellSize, y);
      ctx.lineTo(offsetX + endXIndex * cellSize, y);
    }

    ctx.stroke();

    // sold bricks on top
    for (const [brickIndex, color] of soldMap.entries()) {
      const xIdx = brickIndex % WALL_WIDTH;
      const yIdx = Math.floor(brickIndex / WALL_WIDTH);

      if (
        xIdx < startXIndex ||
        xIdx > endXIndex ||
        yIdx < startYIndex ||
        yIdx > endYIndex
      ) {
        continue;
      }

      const x = offsetX + xIdx * cellSize;
      const y = offsetY + yIdx * cellSize;

      ctx.fillStyle = color;
      ctx.fillRect(
        x + 0.5,
        y + 0.5,
        cellSize - 1,
        cellSize - 1
      );
    }
  }, [layout, soldMap]);

  // point -> brick index
  const computeBrickIndexFromPoint = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !layout) return null;
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;

    const { cellSize, offsetX, offsetY } = layout;
    const gx = Math.floor((px - offsetX) / cellSize);
    const gy = Math.floor((py - offsetY) / cellSize);

    if (gx < 0 || gx >= WALL_WIDTH || gy < 0 || gy >= WALL_HEIGHT) return null;

    const brickIndex = gy * WALL_WIDTH + gx;
    return { brickIndex, x: gx, y: gy };
  };

  // mouse
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onBrickClick) return;
    const info = computeBrickIndexFromPoint(e.clientX, e.clientY);
    if (!info) return;
    onBrickClick(info.brickIndex, info.x, info.y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning.current) {
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      lastPos.current = { x: e.clientX, y: e.clientY };
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
      return;
    }

    const info = computeBrickIndexFromPoint(e.clientX, e.clientY);
    const idx = info?.brickIndex ?? null;
    setHoverBrick(idx);
    onBrickHover?.(idx);
  };

  const handleMouseLeave = () => {
    setHoverBrick(null);
    onBrickHover?.(null);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isPanning.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  useEffect(() => {
    const stop = () => {
      isPanning.current = false;
    };
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchend", stop);
    window.addEventListener("touchcancel", stop);
    return () => {
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchend", stop);
      window.removeEventListener("touchcancel", stop);
    };
  }, []);

  // WHEEL: trap scroll on container so page doesn't move
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setZoom((z) => clampZoom(z * (e.deltaY > 0 ? 0.9 : 1.1)));
  };

  // touch
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      isPanning.current = true;
      lastPos.current = { x: t.clientX, y: t.clientY };
    } else if (e.touches.length === 2) {
      const [t1, t2] = [e.touches[0], e.touches[1]];
      const dx = t2.clientX - t1.clientX;
      const dy = t2.clientY - t1.clientY;
      const dist = Math.hypot(dx, dy);
      isPinching.current = true;
      pinchStartDistance.current = dist;
      pinchStartZoom.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1 && !isPinching.current) {
      e.preventDefault();
      const t = e.touches[0];
      const dx = t.clientX - lastPos.current.x;
      const dy = t.clientY - lastPos.current.y;
      lastPos.current = { x: t.clientX, y: t.clientY };
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    } else if (e.touches.length === 2) {
      e.preventDefault();
      const [t1, t2] = [e.touches[0], e.touches[1]];
      const dx = t2.clientX - t1.clientX;
      const dy = t2.clientY - t1.clientY;
      const dist = Math.hypot(dx, dy);

      if (!pinchStartDistance.current) {
        pinchStartDistance.current = dist;
        pinchStartZoom.current = zoom;
      }

      if (pinchStartDistance.current) {
        const factor = dist / pinchStartDistance.current;
        const targetZoom = clampZoom(pinchStartZoom.current * factor);
        setZoom(targetZoom);
      }
    }
  };

  const handleTouchEnd = () => {
    isPinching.current = false;
    pinchStartDistance.current = 0;
  };

  // overlays
  const overlays: { key: string; brickIndex: number; isMine?: boolean }[] = [];
  for (const idx of highlightedBrickIndexes) {
    overlays.push({ key: `mine-${idx}`, brickIndex: idx, isMine: true });
  }
  if (hoverBrick != null) {
    overlays.push({ key: `hover-${hoverBrick}`, brickIndex: hoverBrick });
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full bg-sky touch-none"
      onWheel={handleWheel}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-crosshair"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Zoom controls */}
      <div className="pointer-events-auto absolute bottom-3 right-3 flex flex-col gap-1 rounded-full bg-white/80 p-1 shadow">
        <button
          type="button"
          className="rounded-full px-2 text-xs font-bold text-slate-800"
          onClick={() => setZoom((z) => clampZoom(z * 1.3))}
        >
          +
        </button>
        <button
          type="button"
          className="rounded-full px-2 text-xs font-bold text-slate-800"
          onClick={() => setZoom((z) => clampZoom(z / 1.3))}
        >
          −
        </button>
        <button
          type="button"
          className="rounded-full px-2 text-[10px] font-medium text-slate-600"
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
        >
          reset
        </button>
      </div>

      {/* Highlights */}
      {layout &&
        overlays.map((o) => {
          const { cellSize, offsetX, offsetY } = layout;
          const xIdx = o.brickIndex % WALL_WIDTH;
          const yIdx = Math.floor(o.brickIndex / WALL_WIDTH);

          const left = offsetX + xIdx * cellSize;
          const top = offsetY + yIdx * cellSize;
          const sizePx = cellSize;

          const border = o.isMine
            ? "border border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]"
            : "border-2 border-slate-900";

          return (
            <div
              key={o.key}
              className={`pointer-events-none absolute rounded-sm ${border}`}
              style={{
                left,
                top,
                width: sizePx,
                height: sizePx,
              }}
            />
          );
        })}
    </div>
  );
}

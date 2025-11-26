import { useEffect, useMemo, useRef, useState } from "react";

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

  const [baseCellSize, setBaseCellSize] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const isPanning = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const [hoverBrick, setHoverBrick] = useState<number | null>(null);

  // pinch state (mobile)
  const isPinching = useRef(false);
  const pinchStartDistance = useRef(0);
  const pinchStartZoom = useRef(1);

  // map sold bricks -> color
  const soldMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const b of soldBricks) map.set(b.brick_index, b.color);
    return map;
  }, [soldBricks]);

  // track container size
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

  // base cell size (fits entire wall at zoom 1)
  useEffect(() => {
    if (size.width === 0 || size.height === 0) return;
    const cell = Math.max(
      1,
      Math.floor(
        Math.min(size.width / WALL_WIDTH, size.height / WALL_HEIGHT)
      )
    );
    setBaseCellSize(cell);
  }, [size]);

  // global mouseup → stop panning
  useEffect(() => {
    const handleUp = () => {
      isPanning.current = false;
    };
    window.addEventListener("mouseup", handleUp);
    window.addEventListener("touchend", handleUp);
    window.addEventListener("touchcancel", handleUp);
    return () => {
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchend", handleUp);
      window.removeEventListener("touchcancel", handleUp);
    };
  }, []);

  const clampZoom = (z: number) => Math.min(20, Math.max(0.3, z));

  // helper: zoom around a given point (canvas coordinates)
  const zoomAroundPoint = (factor: number, pointX: number, pointY: number) => {
    if (size.width === 0 || size.height === 0) return;

    setZoom((prevZoom) => {
      const nextZoom = clampZoom(prevZoom * factor);
      if (nextZoom === prevZoom) return prevZoom;

      setPan((prevPan) => {
        const cellOld = Math.max(1, baseCellSize * prevZoom);
        const cellNew = Math.max(1, baseCellSize * nextZoom);

        const wallWOld = cellOld * WALL_WIDTH;
        const wallHOld = cellOld * WALL_HEIGHT;
        const wallWNew = cellNew * WALL_WIDTH;
        const wallHNew = cellNew * WALL_HEIGHT;

        const offsetXOld = (size.width - wallWOld) / 2 + prevPan.x;
        const offsetYOld = (size.height - wallHOld) / 2 + prevPan.y;

        const worldX = (pointX - offsetXOld) / cellOld;
        const worldY = (pointY - offsetYOld) / cellOld;

        const offsetXNew = pointX - worldX * cellNew;
        const offsetYNew = pointY - worldY * cellNew;

        const panXNew = offsetXNew - (size.width - wallWNew) / 2;
        const panYNew = offsetYNew - (size.height - wallHNew) / 2;

        return { x: panXNew, y: panYNew };
      });

      return nextZoom;
    });
  };

  // compute layout info whenever size / zoom / pan change
  useEffect(() => {
    if (size.width === 0 || size.height === 0) return;
    const cellSize = Math.max(1, baseCellSize * zoom);
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
  }, [size, baseCellSize, zoom, pan]);

  // draw canvas
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

    // background
    ctx.fillStyle = "#E0F2FE"; // tailwind sky-200-ish
    ctx.fillRect(0, 0, layout.width, layout.height);

    const { cellSize, offsetX, offsetY } = layout;

    // draw only sold bricks
    for (const [brickIndex, color] of soldMap.entries()) {
      const xIdx = brickIndex % WALL_WIDTH;
      const yIdx = Math.floor(brickIndex / WALL_WIDTH);

      const x = offsetX + xIdx * cellSize;
      const y = offsetY + yIdx * cellSize;

      // skip if completely off-screen
      if (x + cellSize < 0 || y + cellSize < 0) continue;
      if (x > layout.width || y > layout.height) continue;

      ctx.fillStyle = color;
      ctx.fillRect(
        x + 0.5,
        y + 0.5,
        cellSize - 1,
        cellSize - 1
      );
    }
  }, [layout, soldMap]);

  // helper: client coords -> brick index
  const computeBrickIndexFromPoint = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !layout) return null;
    const rect = canvas.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;

    const { cellSize, offsetX, offsetY } = layout;
    const gx = Math.floor((px - offsetX) / cellSize);
    const gy = Math.floor((py - offsetY) / cellSize);

    if (gx < 0 || gx >= WALL_WIDTH || gy < 0 || gy >= WALL_HEIGHT) {
      return null;
    }

    const brickIndex = gy * WALL_WIDTH + gx;
    return { brickIndex, x: gx, y: gy };
  };

  // mouse handlers (desktop)
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

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    zoomAroundPoint(factor, mouseX, mouseY);
  };

  // touch handlers (mobile)
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      // one finger → start panning
      const t = e.touches[0];
      isPanning.current = true;
      lastPos.current = { x: t.clientX, y: t.clientY };
    } else if (e.touches.length === 2) {
      // two fingers → start pinch
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
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (e.touches.length === 1 && !isPinching.current) {
      // one finger drag → pan
      e.preventDefault();
      const t = e.touches[0];
      const dx = t.clientX - lastPos.current.x;
      const dy = t.clientY - lastPos.current.y;
      lastPos.current = { x: t.clientX, y: t.clientY };
      setPan((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
    } else if (e.touches.length === 2) {
      // pinch zoom
      e.preventDefault();
      const [t1, t2] = [e.touches[0], e.touches[1]];
      const dx = t2.clientX - t1.clientX;
      const dy = t2.clientY - t1.clientY;
      const dist = Math.hypot(dx, dy);

      if (!isPinching.current) {
        isPinching.current = true;
        pinchStartDistance.current = dist;
        pinchStartZoom.current = zoom;
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const centerX = (t1.clientX + t2.clientX) / 2 - rect.left;
      const centerY = (t1.clientY + t2.clientY) / 2 - rect.top;

      const scaleFactor =
        dist && pinchStartDistance.current
          ? dist / pinchStartDistance.current
          : 1;

      const targetZoom = clampZoom(pinchStartZoom.current * scaleFactor);
      const factor = targetZoom / zoom || 1;
      zoomAroundPoint(factor, centerX, centerY);
    }
  };

  const handleTouchEnd = () => {
    if (isPinching.current && pinchStartDistance.current) {
      isPinching.current = false;
      pinchStartDistance.current = 0;
    }
    isPanning.current = false;
  };

  // overlays (for hover + highlighted bricks)
  const overlays: {
    key: string;
    brickIndex: number;
    isHover?: boolean;
    isMine?: boolean;
  }[] = [];

  if (hoverBrick != null) {
    overlays.push({
      key: `hover-${hoverBrick}`,
      brickIndex: hoverBrick,
      isHover: true,
    });
  }

  for (const idx of highlightedBrickIndexes) {
    overlays.push({
      key: `mine-${idx}`,
      brickIndex: idx,
      isMine: true,
    });
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full bg-sky touch-none"
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-crosshair"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />

      {/* Zoom controls – especially useful on mobile */}
      <div className="pointer-events-auto absolute bottom-3 right-3 flex flex-col gap-1 rounded-full bg-white/80 p-1 shadow">
        <button
          type="button"
          className="rounded-full px-2 text-xs font-bold text-slate-800"
          onClick={() => zoomAroundPoint(1.1, size.width / 2, size.height / 2)}
        >
          +
        </button>
        <button
          type="button"
          className="rounded-full px-2 text-xs font-bold text-slate-800"
          onClick={() => zoomAroundPoint(0.9, size.width / 2, size.height / 2)}
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

      {/* Hover / highlight overlays */}
      {layout &&
        overlays.map((o) => {
          const { cellSize, offsetX, offsetY } = layout;
          const xIdx = o.brickIndex % WALL_WIDTH;
          const yIdx = Math.floor(o.brickIndex / WALL_WIDTH);

          const left = offsetX + xIdx * cellSize;
          const top = offsetY + yIdx * cellSize;
          const sizePx = cellSize;

          const border =
            o.isHover && o.isMine
              ? "border-2 border-white"
              : o.isHover
              ? "border-2 border-slate-900"
              : "border border-amber-400";

          const glow =
            o.isMine && !o.isHover
              ? "shadow-[0_0_8px_rgba(251,191,36,0.9)]"
              : "";

          return (
            <div
              key={o.key}
              className={`pointer-events-none absolute rounded-sm ${border} ${glow}`}
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

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

  // map: brick_index -> color
  const soldMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const b of soldBricks) {
      map.set(b.brick_index, b.color);
    }
    return map;
  }, [soldBricks]);

  // resize → canvas prati parent
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

  // cell size
  useEffect(() => {
    if (size.width === 0 || size.height === 0) return;
    const cell = Math.max(
      1,
      Math.floor(Math.min(size.width / WALL_WIDTH, size.height / WALL_HEIGHT))
    );
    setBaseCellSize(cell);
  }, [size]);

  // global mouseup → stop panning
  useEffect(() => {
    const handleUp = () => {
      isPanning.current = false;
    };
    window.addEventListener("mouseup", handleUp);
    return () => window.removeEventListener("mouseup", handleUp);
  }, []);

  // draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.width === 0 || size.height === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size.width, size.height);

    const cellSize = Math.max(1, baseCellSize * zoom);
    const wallPixelWidth = cellSize * WALL_WIDTH;
    const wallPixelHeight = cellSize * WALL_HEIGHT;

    const offsetX = (size.width - wallPixelWidth) / 2 + pan.x;
    const offsetY = (size.height - wallPixelHeight) / 2 + pan.y;

    setLayout({
      width: size.width,
      height: size.height,
      cellSize,
      offsetX,
      offsetY,
    });

    // background
    ctx.fillStyle = "#e5edff";
    ctx.fillRect(0, 0, size.width, size.height);

    // wall rect
    ctx.fillStyle = "#dbe4ff";
    ctx.fillRect(offsetX, offsetY, wallPixelWidth, wallPixelHeight);

    // visible range
    const minX = Math.max(0, Math.floor(-offsetX / cellSize));
    const maxX = Math.min(
      WALL_WIDTH - 1,
      Math.ceil((size.width - offsetX) / cellSize) - 1
    );
    const minY = Math.max(0, Math.floor(-offsetY / cellSize));
    const maxY = Math.min(
      WALL_HEIGHT - 1,
      Math.ceil((size.height - offsetY) / cellSize) - 1
    );

    // draw sold bricks
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const brickIndex = y * WALL_WIDTH + x;
        const color = soldMap.get(brickIndex);
        if (!color) continue;

        const px = offsetX + x * cellSize;
        const py = offsetY + y * cellSize;

        ctx.fillStyle = color;
        ctx.fillRect(px, py, cellSize, cellSize);
      }
    }

    // grid lines
    if (cellSize >= 4) {
      ctx.strokeStyle = "rgba(15,23,42,0.18)";
      ctx.lineWidth = Math.min(1.5, cellSize * 0.05);

      for (let x = minX; x <= maxX + 1; x++) {
        const gx = offsetX + x * cellSize;
        ctx.beginPath();
        ctx.moveTo(gx, offsetY + minY * cellSize);
        ctx.lineTo(gx, offsetY + (maxY + 1) * cellSize);
        ctx.stroke();
      }

      for (let y = minY; y <= maxY + 1; y++) {
        const gy = offsetY + y * cellSize;
        ctx.beginPath();
        ctx.moveTo(offsetX + minX * cellSize, gy);
        ctx.lineTo(offsetX + (maxX + 1) * cellSize, gy);
        ctx.stroke();
      }
    }
  }, [size, baseCellSize, zoom, pan, soldMap]);

  const computeBrickIndexFromPoint = (
    clientX: number,
    clientY: number
  ): { brickIndex: number; x: number; y: number } | null => {
    const canvas = canvasRef.current;
    if (!canvas || !layout) return null;

    const rect = canvas.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    const { cellSize, offsetX, offsetY } = layout;

    const wallPixelWidth = cellSize * WALL_WIDTH;
    const wallPixelHeight = cellSize * WALL_HEIGHT;

    const localX = clickX - offsetX;
    const localY = clickY - offsetY;

    if (
      localX < 0 ||
      localY < 0 ||
      localX >= wallPixelWidth ||
      localY >= wallPixelHeight
    ) {
      return null;
    }

    const x = Math.floor(localX / cellSize);
    const y = Math.floor(localY / cellSize);

    if (x < 0 || x >= WALL_WIDTH || y < 0 || y >= WALL_HEIGHT) return null;

    const brickIndex = y * WALL_WIDTH + x;
    return { brickIndex, x, y };
  };

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

  const clampZoom = (z: number) => Math.min(20, Math.max(0.3, z));

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // spriječi scroll stranice
    const canvas = canvasRef.current;
    if (!canvas || size.width === 0 || size.height === 0) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const factor = e.deltaY > 0 ? 0.9 : 1.1;

    const prevZoom = zoom;
    const newZoom = clampZoom(prevZoom * factor);
    if (newZoom === prevZoom) return;

    setZoom(newZoom);

    setPan((prevPan) => {
      const cellOld = Math.max(1, baseCellSize * prevZoom);
      const cellNew = Math.max(1, baseCellSize * newZoom);

      const wallWOld = cellOld * WALL_WIDTH;
      const wallHOld = cellOld * WALL_HEIGHT;
      const wallWNew = cellNew * WALL_WIDTH;
      const wallHNew = cellNew * WALL_HEIGHT;

      const offsetXOld = (size.width - wallWOld) / 2 + prevPan.x;
      const offsetYOld = (size.height - wallHOld) / 2 + prevPan.y;

      const worldX = (mouseX - offsetXOld) / cellOld;
      const worldY = (mouseY - offsetYOld) / cellOld;

      const offsetXNew = mouseX - worldX * cellNew;
      const offsetYNew = mouseY - worldY * cellNew;

      const panXNew = offsetXNew - (size.width - wallWNew) / 2;
      const panYNew = offsetYNew - (size.height - wallHNew) / 2;

      return { x: panXNew, y: panYNew };
    });
  };

  // overlays for hover / highlighted bricks
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
    <div ref={containerRef} className="relative h-full w-full bg-sky">
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-crosshair"
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      />
      {layout &&
        overlays.map((o) => {
          const { cellSize, offsetX, offsetY } = layout;
          const x = o.brickIndex % WALL_WIDTH;
          const y = Math.floor(o.brickIndex / WALL_WIDTH);
          const left = offsetX + x * cellSize;
          const top = offsetY + y * cellSize;
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

// src/ui/FullWallCanvas.tsx
import React, { useEffect, useRef, useState } from "react";
import ZoomControls from "./ZoomControls";

export type SoldBrick = {
  brick_index: number;
  color: string;
};

type Props = {
  soldBricks: SoldBrick[];
  onBrickClick: (brickIndex: number, x: number, y: number) => void;
  onBrickHover?: (brickIndex: number | null) => void;
  highlightedBrickIndexes?: number[];
};

const WALL_WIDTH = 1000;
const WALL_HEIGHT = 1000;
const BRICK_SIZE = 16;

export default function FullWallCanvas({
  soldBricks,
  onBrickClick,
  onBrickHover,
  highlightedBrickIndexes = [],
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(0.1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const [isDragging, setIsDragging] = useState(false);
  const [dragged, setDragged] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });

  const lastPointer = useRef({ x: 0, y: 0 });

  // ---------------- CALCULATE MIN SCALE (fit whole wall) ----------------
  useEffect(() => {
    const updateMinScale = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      const wallPixelWidth = WALL_WIDTH * BRICK_SIZE;
      const wallPixelHeight = WALL_HEIGHT * BRICK_SIZE;

      const scaleX = width / wallPixelWidth;
      const scaleY = height / wallPixelHeight;
      const newMinScale = Math.min(scaleX, scaleY);

      setMinScale(newMinScale);

      // Ensure we never go below the min scale
      setScale((prev) => Math.max(prev, newMinScale));

      // Center the wall (only depends on scale, so OK to recalc)
      const wallWidthScaled = wallPixelWidth * Math.max(scale, newMinScale);
      const wallHeightScaled = wallPixelHeight * Math.max(scale, newMinScale);

      const newOffset = {
        x: (width - wallWidthScaled) / 2,
        y: (height - wallHeightScaled) / 2,
      };

      setOffset((prev) => {
        // if previous offset is 0, we're probably initialising – center
        if (prev.x === 0 && prev.y === 0) return newOffset;
        return prev;
      });
    };

    updateMinScale();
    window.addEventListener("resize", updateMinScale);
    return () => window.removeEventListener("resize", updateMinScale);
  }, [scale]);

  // ---------------- DRAW WALL ----------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pixelRatio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    ctx.clearRect(0, 0, width, height);

    const brickSize = BRICK_SIZE * scale;

    // Background color (same as page)
    ctx.fillStyle = "#CDE6F5";
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = "rgba(0,0,0,0.06)";
    ctx.lineWidth = 1;

    const cols = Math.ceil(width / brickSize) + 2;
    const rows = Math.ceil(height / brickSize) + 2;

    for (let i = -1; i < cols; i++) {
      const x = i * brickSize + (offset.x % brickSize);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let i = -1; i < rows; i++) {
      const y = i * brickSize + (offset.y % brickSize);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw sold bricks
    for (const brick of soldBricks) {
      const idx = brick.brick_index;
      const xIndex = idx % WALL_WIDTH;
      const yIndex = Math.floor(idx / WALL_WIDTH);

      const x = xIndex * brickSize + offset.x;
      const y = yIndex * brickSize + offset.y;

      ctx.fillStyle = brick.color || "#FFD352";
      ctx.fillRect(x, y, brickSize, brickSize);
    }

    // Highlight user bricks
    if (highlightedBrickIndexes.length) {
      ctx.globalAlpha = 0.4;
      ctx.fillStyle = "#22C55E";

      for (const idx of highlightedBrickIndexes) {
        const xIndex = idx % WALL_WIDTH;
        const yIndex = Math.floor(idx / WALL_WIDTH);

        const x = xIndex * brickSize + offset.x;
        const y = yIndex * brickSize + offset.y;

        ctx.fillRect(x, y, brickSize, brickSize);
      }

      ctx.globalAlpha = 1;
    }
  }, [soldBricks, scale, offset, highlightedBrickIndexes]);

  // ---------------- HELPERS ----------------
  const getBrickIndexFromPoint = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();

    const brickSize = BRICK_SIZE * scale;
    const xCoord = (clientX - rect.left - offset.x) / brickSize;
    const yCoord = (clientY - rect.top - offset.y) / brickSize;

    const bx = Math.floor(xCoord);
    const by = Math.floor(yCoord);
    if (bx < 0 || by < 0 || bx >= WALL_WIDTH || by >= WALL_HEIGHT) return null;

    const index = by * WALL_WIDTH + bx;
    return { index, x: bx, y: by };
  };

  // ---------------- DRAGGING ----------------
  const startDrag = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragged(false);
    dragStart.current = { x: clientX, y: clientY };
    offsetStart.current = { ...offset };
    lastPointer.current = { x: clientX, y: clientY };
  };

  const doDrag = (clientX: number, clientY: number) => {
    if (!isDragging) return;

    lastPointer.current = { x: clientX, y: clientY };

    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;

    if (!dragged && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      setDragged(true); // user is actually dragging
    }

    setOffset({
      x: offsetStart.current.x + dx,
      y: offsetStart.current.y + dy,
    });
  };

  const stopDragAndMaybeClick = () => {
    setIsDragging(false);

    // If user moved more than threshold, don't treat as click
    if (dragged) return;

    // Interpret as a click at last pointer position
    const { x, y } = lastPointer.current;
    const brickInfo = getBrickIndexFromPoint(x, y);
    if (!brickInfo) return;

    onBrickClick(brickInfo.index, brickInfo.x, brickInfo.y);
  };

  // ---------------- MOUSE EVENTS ----------------
  const handleMouseDown = (e: React.MouseEvent) => {
    startDrag(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    doDrag(e.clientX, e.clientY);

    if (onBrickHover) {
      const info = getBrickIndexFromPoint(e.clientX, e.clientY);
      onBrickHover(info ? info.index : null);
    }
  };

  const handleMouseUp = () => {
    stopDragAndMaybeClick();
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setDragged(false);
    if (onBrickHover) onBrickHover(null);
  };

  // ---------------- TOUCH EVENTS ----------------
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    startDrag(t.clientX, t.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    doDrag(t.clientX, t.clientY);

    if (onBrickHover) {
      const info = getBrickIndexFromPoint(t.clientX, t.clientY);
      onBrickHover(info ? info.index : null);
    }
  };

  const handleTouchEnd = () => {
    stopDragAndMaybeClick();
  };

  // ---------------- ZOOM ----------------
  const zoomIn = () => setScale((s) => Math.min(4, s + 0.2));
  const zoomOut = () =>
    setScale((s) => {
      const next = s - 0.2;
      return next < minScale ? minScale : next;
    });

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  };

  // ---------------- RENDER ----------------
  return (
    <div className="relative h-full w-full touch-none overflow-hidden">
      {/* Top-right zoom controls */}
      <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} />

      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      />
    </div>
  );
}

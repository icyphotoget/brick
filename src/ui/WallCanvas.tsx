// src/ui/FullWallCanvas.tsx
import React, { useRef, useEffect, useState } from "react";
import ZoomControls from "./ZoomControls";

type Props = {
  bricks: any[];
  onBrickClick: (index: number) => void;
};

export default function FullWallCanvas({ bricks, onBrickClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });

  const BRICK_SIZE = 20;
  const GRID_SIZE = 1000; // 1M bricks (1000x1000)

  // ---------------------------
  // DRAW GRID + BRICKS
  // ---------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * pixelRatio;
    canvas.height = canvas.clientHeight * pixelRatio;
    ctx.scale(pixelRatio, pixelRatio);

    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    const brickSize = BRICK_SIZE * scale;

    // Draw claimed bricks
    for (const brick of bricks) {
      ctx.fillStyle = brick.color ?? "#FFD966";

      const bx = brick.x * brickSize + offset.x;
      const by = brick.y * brickSize + offset.y;

      ctx.fillRect(bx, by, brickSize, brickSize);
    }

    // Draw grid lines (subtle)
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.lineWidth = 1;

    const cols = Math.ceil(canvas.clientWidth / brickSize) + 2;
    const rows = Math.ceil(canvas.clientHeight / brickSize) + 2;

    for (let i = -1; i < cols; i++) {
      const x = i * brickSize + (offset.x % brickSize);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.clientHeight);
      ctx.stroke();
    }

    for (let i = -1; i < rows; i++) {
      const y = i * brickSize + (offset.y % brickSize);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.clientWidth, y);
      ctx.stroke();
    }
  }, [bricks, scale, offset]);

  // ---------------------------
  // MOUSE + TOUCH DRAGGING
  // ---------------------------
  const startDrag = (x: number, y: number) => {
    setIsDragging(true);
    dragStart.current = { x, y };
    offsetStart.current = { ...offset };
  };

  const doDrag = (x: number, y: number) => {
    if (!isDragging) return;

    const dx = x - dragStart.current.x;
    const dy = y - dragStart.current.y;

    setOffset({
      x: offsetStart.current.x + dx,
      y: offsetStart.current.y + dy,
    });
  };

  const stopDrag = () => setIsDragging(false);

  // Mouse
  const handleMouseDown = (e: React.MouseEvent) =>
    startDrag(e.clientX, e.clientY);
  const handleMouseMove = (e: React.MouseEvent) =>
    doDrag(e.clientX, e.clientY);
  const handleMouseUp = () => stopDrag();

  // Touch
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    startDrag(t.clientX, t.clientY);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    const t = e.touches[0];
    doDrag(t.clientX, t.clientY);
  };
  const handleTouchEnd = () => stopDrag();

  // ---------------------------
  // ZOOM
  // ---------------------------
  const zoomIn = () => setScale((s) => Math.min(s + 0.2, 4));
  const zoomOut = () => setScale((s) => Math.max(s - 0.2, 0.4));

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  };

  // ---------------------------
  // CLICK BRICK
  // ---------------------------
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (isDragging) return; // prevent click during drag

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();

    const x = (e.clientX - rect.left - offset.x) / (BRICK_SIZE * scale);
    const y = (e.clientY - rect.top - offset.y) / (BRICK_SIZE * scale);

    const bx = Math.floor(x);
    const by = Math.floor(y);

    if (bx >= 0 && by >= 0 && bx < GRID_SIZE && by < GRID_SIZE) {
      const index = by * GRID_SIZE + bx;
      onBrickClick(index);
    }
  };

  // ---------------------------
  // COMPONENT RENDER
  // ---------------------------
  return (
    <div
      ref={containerRef}
      className="relative w-full h-full touch-none overflow-hidden"
    >
      {/* Zoom controls */}
      <ZoomControls onZoomIn={zoomIn} onZoomOut={zoomOut} />

      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={stopDrag}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
      />
    </div>
  );
}

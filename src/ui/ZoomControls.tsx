// src/ui/ZoomControls.tsx
import React from "react";

type Props = {
  onZoomIn: () => void;
  onZoomOut: () => void;
};

export default function ZoomControls({ onZoomIn, onZoomOut }: Props) {
  return (
    <div
      className="
        absolute 
        top-3 right-3 
        z-50 
        flex flex-col gap-3
        pointer-events-auto
      "
    >
      <button
        onClick={onZoomIn}
        className="
          w-12 h-12 sm:w-14 sm:h-14
          rounded-full
          bg-white
          shadow-lg shadow-black/20
          flex items-center justify-center
          text-2xl sm:text-3xl font-bold
          hover:bg-slate-100
          active:scale-95
          transition
        "
      >
        +
      </button>

      <button
        onClick={onZoomOut}
        className="
          w-12 h-12 sm:w-14 sm:h-14
          rounded-full
          bg-white
          shadow-lg shadow-black/20
          flex items-center justify-center
          text-2xl sm:text-3xl font-bold
          hover:bg-slate-100
          active:scale-95
          transition
        "
      >
        –
      </button>
    </div>
  );
}

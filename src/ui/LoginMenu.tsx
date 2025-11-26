import React from "react";
import { useNavigate } from "react-router-dom";

export default function LoginMenu() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/login");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-full bg-white/80 px-4 py-1.5 text-xs font-semibold text-slate-900 shadow-sm hover:bg-white sm:text-sm"
    >
      Log in
    </button>
  );
}

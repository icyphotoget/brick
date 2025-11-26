// src/main.tsx

// polyfills (Buffer) – must be first
import "./polyfills";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import AppLayout from "./ui/AppLayout";
import { AuthProvider } from "./lib/auth";

import HomePage from "./pages/HomePage";
import WallPage from "./pages/WallPage";
import LoginPage from "./pages/LoginPage";
import MyBricksPage from "./pages/MyBricksPage";
import { SolanaProvider } from "./solana/SolanaProvider";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <SolanaProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/wall" element={<WallPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/my-bricks" element={<MyBricksPage />} />
            </Routes>
          </AppLayout>
        </SolanaProvider>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);

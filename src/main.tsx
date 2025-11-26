import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./ui/AppLayout";
import HomePage from "./pages/HomePage";
import WallPage from "./pages/WallPage";
import LoginPage from "./pages/LoginPage";
import MyBricksPage from "./pages/MyBricksPage";
import { AuthProvider } from "./lib/auth";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/wall" element={<WallPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/my-bricks" element={<MyBricksPage />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);

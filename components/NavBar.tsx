"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(true);
  const router = useRouter();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark", !darkMode);
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav className="bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo / Branding */}
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            ✅ TaskPro
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 items-center">
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition text-sm font-medium text-white flex items-center gap-2"
            title="Toggle theme"
          >
            {darkMode ? "🌙" : "☀️"}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition text-sm font-medium text-white flex items-center gap-2"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

"use client";
import { useState } from "react";
import UserMenu from "./UserMenu";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState<boolean>(true);

  const toggleDarkMode = (): void => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark", !darkMode);
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

        {/* User Menu */}
        <UserMenu darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      </div>
    </nav>
  );
}

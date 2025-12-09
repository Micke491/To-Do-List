"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface UserMenuProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ darkMode, toggleDarkMode }) => {
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = (): void => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  // Klik van menija zatvara dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Krug sa plusićem */}
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 flex items-center justify-center rounded-full bg-linear-to-r from-blue-400 to-purple-500 text-white font-bold hover:opacity-90 transition"
      >
        +
      </button>

      {/* Dropdown meni */}
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-900 text-white shadow-lg rounded-md p-2 border border-gray-700 z-50">
          <button
            onClick={toggleDarkMode}
            className="w-full text-left px-3 py-2 hover:bg-gray-800 rounded transition"
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 hover:bg-gray-800 rounded transition"
          >
            🚪 Logout
          </button>
          <button
            onClick={() => alert("Donacija link ovde")}
            className="w-full text-left px-3 py-2 hover:bg-gray-800 rounded transition"
          >
            💖 Donation
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;

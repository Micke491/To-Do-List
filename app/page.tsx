"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-800 text-white">
      <h1 className="text-4xl font-bold mb-8">Welcome to My App 🚀</h1>
      <div className="space-x-4">
        <button
          onClick={() => router.push("/login")}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition"
        >
          Login
        </button>
        <button
          onClick={() => router.push("/register")}
          className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg shadow-md transition"
        >
          Register
        </button>
      </div>
    </div>
  );
}

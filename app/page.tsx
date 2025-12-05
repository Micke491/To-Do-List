"use client";

import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Navigation */}
      <nav className="bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            ✅ TaskPro
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-sm font-medium"
            >
              🔐 Login
            </button>
            <button
              onClick={() => router.push("/register")}
              className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition text-sm font-medium"
            >
              ➕ Register
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12">
        <div className="max-w-2xl text-center space-y-8">
          <div>
            <h1 className="text-6xl md:text-7xl font-extrabold mb-4 bg-linear-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              TaskPro
            </h1>
            <p className="text-xl text-gray-300">
              Your personal task management assistant
            </p>
          </div>

          <p className="text-lg text-gray-400 leading-relaxed">
            Stay organized and productive with our intuitive to-do list application. Create tasks, set priorities, track progress, and achieve your goals efficiently.
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-blue-500 transition">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="text-lg font-bold mb-2">Create Tasks</h3>
              <p className="text-gray-400 text-sm">Easily add new tasks with titles, descriptions, and categories</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-purple-500 transition">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-lg font-bold mb-2">Set Priorities</h3>
              <p className="text-gray-400 text-sm">Mark tasks as high, medium, or low priority</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:border-pink-500 transition">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-lg font-bold mb-2">Track Progress</h3>
              <p className="text-gray-400 text-sm">Monitor completion rates and task statistics</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => router.push("/register")}
              className="px-8 py-3 bg-linear-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-bold text-lg transition shadow-lg"
            >
              🚀 Get Started
            </button>
            <button
              onClick={() => router.push("/login")}
              className="px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg font-bold text-lg transition"
            >
              📖 Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

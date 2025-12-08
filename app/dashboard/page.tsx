"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/NavBar";
import toast from "react-hot-toast";

interface Task {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: "red" | "yellow" | "green";
  completed: boolean;
  dueDate?: string;
  createdAt?: string;
  isOverdue?: boolean;
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ title: "", description: "", category: "", dueDate: "", priority: "green" });
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editData, setEditData] = useState({ title: "", description: "", category: "", dueDate: "", priority: "green" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [searchTitle, setSearchTitle] = useState("");
  const [filterPriority, setFilterPriority] = useState<"all" | "red" | "yellow" | "green">("all");
  const [filterCompleted, setFilterCompleted] = useState<"all" | "active" | "completed">("all");
  const [sortBy, setSortBy] = useState<"created" | "priority" | "title">("created");
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const router = useRouter();

  // Update statistics
  const updateStats = (taskList: Task[]) => {
    const total = taskList.length;
    const completed = taskList.filter((t) => t.completed).length;
    const pending = total - completed;
    setStats({ total, completed, pending });
  };

  // 🔥 Fetch tasks – protected with JWT
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return; // optionally redirect
    fetch("/api/tasks", {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!res.ok) {
          if (res.status === 401) {
            // token invalid or expired
            localStorage.removeItem("token");
            router.push("/login");
            return;
          }
          throw new Error(json?.message || `${res.status} ${res.statusText}`);
        }
        setTasks(json || []);
        updateStats(json || []);
      })
      .catch((err) => {
        console.error("Failed to fetch tasks", err);
        setError(String(err?.message ?? err));
      })
      .finally(() => setLoading(false));
  }, []);

  // 🔥 Add Task with token
  const addTask = async () => {
    setError("");
    if (!newTask.title.trim()) {
      setError("Title is required");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setAdding(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(newTask),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        const serverMsg = errJson?.message ?? errJson?.error ?? `${res.status} ${res.statusText}`;
        setError(String(serverMsg));
        return;
      }

      const createdTask = await res.json();
      const updatedTasks = [...tasks, createdTask];
      setTasks(updatedTasks);
      updateStats(updatedTasks);
      setNewTask({ title: "", description: "", category: "", dueDate: "", priority: "green" });
      setError("");
    } catch (err) {
      console.error("Error adding task:", err);
      setError(String(err));
    } finally {
      setAdding(false);
    }
    toast.success("📝 Task created successfully!")
  };

  // 🔥 Toggle completion
  const toggleCompletion = async (id: string, completed: boolean) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({ completed: !completed }),
      });

      if (!res.ok) {
        let errorMsg = `${res.status} ${res.statusText}`;
        try {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const errJson = await res.json();
            const serverMsg = errJson?.message ?? errJson?.error ?? JSON.stringify(errJson);
            errorMsg += " - " + serverMsg;
          } else {
            const text = await res.text();
            if (text) errorMsg += " - " + text;
          }
        } catch (parseErr) {
          console.error("Failed to parse error body", parseErr);
        }
        console.error("Failed to toggle completion:", errorMsg);
        setError(errorMsg);
        return;
      }

      const updatedTask = await res.json();
      const updatedTasks = tasks.map((task) => (task._id === id ? updatedTask : task));
      setTasks(updatedTasks);
      updateStats(updatedTasks);
      setError("");

      if (!completed) {
      toast.success("Task complete ✅");
    } else {
      toast.success("Task undo ↩️")
    }
    } catch (err) {
      console.error("Failed to toggle completion", err);
      setError(String(err));
    }
  };

  // 🔥 Delete task
  const deleteTask = async (id: string) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (!res.ok) {
        let errorMsg = `${res.status} ${res.statusText}`;
        try {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const errJson = await res.json();
            const serverMsg = errJson?.message ?? errJson?.error ?? JSON.stringify(errJson);
            errorMsg += " - " + serverMsg;
          } else {
            const text = await res.text();
            if (text) errorMsg += " - " + text;
          }
        } catch (parseErr) {
          console.error("Failed to parse error body", parseErr);
        }
        console.error("Failed to delete task:", errorMsg);
        setError(errorMsg);
        return;
      }

      setTasks(tasks.filter((task) => task._id !== id));
      updateStats(tasks.filter((task) => task._id !== id));
      setError("");
    } catch (err) {
      console.error("Failed to delete task", err);
      setError(String(err));
    }
    toast.success("🗑️ Task deleted successfully!")
  };

  const startEdit = (task: Task) => {
    setEditingTask(task._id);
    setEditData({
      title: task.title,
      description: task.description,
      category: task.category,
      dueDate: task.dueDate || "",
      priority: task.priority,
    });
  };

  // 🔥 Save edit
  const saveEdit = async (id: string) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(editData),
      });

      if (!res.ok) {
        let errorMsg = `${res.status} ${res.statusText}`;
        try {
          const contentType = res.headers.get("content-type") || "";
          if (contentType.includes("application/json")) {
            const errJson = await res.json();
            const serverMsg = errJson?.message ?? errJson?.error ?? JSON.stringify(errJson);
            errorMsg += " - " + serverMsg;
          } else {
            const text = await res.text();
            if (text) errorMsg += " - " + text;
          }
        } catch (parseErr) {
          console.error("Failed to parse error body", parseErr);
        }
        console.error("Failed to edit task:", errorMsg);
        setError(errorMsg);
        return;
      }

      const updatedTask = await res.json();
      const updatedTasks = tasks.map((task) => (task._id === id ? updatedTask : task));
      setTasks(updatedTasks);
      updateStats(updatedTasks);
      setEditingTask(null);
      setError("");
    } catch (err) {
      console.error("Failed to edit task", err);
      setError(String(err));
    }
    toast.success("✏️ Task edited successfully!")
  };

  const logout = () => {
    localStorage.removeItem("token");
    setTasks([]);
    router.push("/");
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Invalid date";
    }
  };

  // Filter and sort tasks
  const filteredAndSorted = tasks
    .filter((task) => {
      // Filter by search title
      if (searchTitle && !task.title.toLowerCase().includes(searchTitle.toLowerCase())) return false;
      // Filter by priority
      if (filterPriority !== "all" && task.priority !== filterPriority) return false;
      // Filter by completion status
      if (filterCompleted === "active" && task.completed) return false;
      if (filterCompleted === "completed" && !task.completed) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "created") {
        // Sort by creation time, newest first
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      } else if (sortBy === "priority") {
        // Sort by priority: red > yellow > green
        const priorityOrder = { red: 0, yellow: 1, green: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === "title") {
        // Sort alphabetically by title
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-blue-400 to-purple-500">
              My Tasks
            </h1>
            <p className="text-gray-400 mt-2">Organize and manage your daily tasks efficiently</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition text-sm"
          >
            ← Home
          </button>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-linear-to-br from-blue-600 to-blue-800 p-6 rounded-xl shadow-lg">
            <div className="text-sm font-semibold text-blue-100">Total Tasks</div>
            <div className="text-4xl font-bold mt-2">{stats.total}</div>
            <div className="text-xs text-blue-200 mt-1">All your tasks</div>
          </div>
          <div className="bg-linear-to-br from-yellow-500 to-orange-600 p-6 rounded-xl shadow-lg">
            <div className="text-sm font-semibold text-yellow-100">Pending</div>
            <div className="text-4xl font-bold mt-2">{stats.pending}</div>
            <div className="text-xs text-yellow-200 mt-1">Tasks to complete</div>
          </div>
          <div className="bg-linear-to-br from-green-600 to-green-800 p-6 rounded-xl shadow-lg">
            <div className="text-sm font-semibold text-green-100">Completed</div>
            <div className="text-4xl font-bold mt-2">{stats.completed}</div>
            <div className="text-xs text-green-200 mt-1">{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% Complete</div>
          </div>
        </div>

        {/* Add Task Form */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg space-y-4 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">➕ Add New Task</h2>
          <input
            placeholder="Task Title *"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <input
            placeholder="Description (optional)"
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Category (optional)"
              value={newTask.category}
              onChange={(e) =>
                setNewTask({ ...newTask, category: e.target.value })
              }
              className="px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <select
              value={newTask.priority}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  priority: e.target.value as "red" | "yellow" | "green",
                })
              }
              className="px-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="green">🟢 Low Priority</option>
              <option value="yellow">🟡 Medium Priority</option>
              <option value="red">🔴 High Priority</option>
            </select>
          </div>
          <input
            type="date"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <button
            onClick={addTask}
            disabled={adding}
            className={`w-full bg-blue-600 hover:bg-blue-700 rounded-lg py-3 font-semibold transition text-white ${
              adding ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {adding ? "⏳ Adding..." : "✨ Add Task"}
          </button>
          {error && <p className="text-sm text-red-400 bg-red-900 bg-opacity-30 p-3 rounded-lg">{error}</p>}
        </div>

        {/* Search & Filters */}
        <div className="bg-gray-800 p-6 rounded-xl shadow-lg space-y-4 border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">🔍 Search & Filter</h2>
          <input
            type="text"
            placeholder="Search tasks by title..."
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as any)}
              className="px-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="all">All Priorities</option>
              <option value="red">🔴 High Priority</option>
              <option value="yellow">🟡 Medium Priority</option>
              <option value="green">🟢 Low Priority</option>
            </select>
            <select
              value={filterCompleted}
              onChange={(e) => setFilterCompleted(e.target.value as any)}
              className="px-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="all">All Tasks</option>
              <option value="active">📋 Active Only</option>
              <option value="completed">✅ Completed Only</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="created">Sort: Newest First</option>
              <option value="priority">Sort: By Priority</option>
              <option value="title">Sort: By Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              <p className="text-gray-300 mt-4">Loading your tasks...</p>
            </div>
          ) : !filteredAndSorted.length ? (
            <div className="text-center p-12 bg-gray-800 rounded-xl border border-gray-700">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-gray-300 text-lg">
                {tasks.length === 0
                  ? "No tasks yet. Add your first task above to get started!"
                  : "No tasks match your search or filters. Try adjusting your criteria."}
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {filteredAndSorted.map((task) =>
                task._id ? (
                  <li
                    key={task._id}
                    className={`rounded-xl p-6 shadow-lg transition transform hover:shadow-xl border ${
                      task.completed 
                        ? "bg-linear-to-r from-green-900 to-green-800 border-green-700 opacity-75" 
                        : "bg-gray-800 border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    {editingTask === task._id ? (
                      <div className="flex flex-col gap-3 bg-gray-700 p-4 rounded-lg">
                        <input
                          value={editData.title}
                          placeholder="Task Title"
                          onChange={(e) =>
                            setEditData({ ...editData, title: e.target.value })
                          }
                          className="px-3 py-2 rounded bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          value={editData.description}
                          placeholder="Description"
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              description: e.target.value,
                            })
                          }
                          className="px-3 py-2 rounded bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          value={editData.category}
                          placeholder="Category"
                          onChange={(e) =>
                            setEditData({ ...editData, category: e.target.value })
                          }
                          className="px-3 py-2 rounded bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                          value={editData.priority}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              priority: e.target.value as
                                | "red"
                                | "yellow"
                                | "green",
                            })
                          }
                          className="px-3 py-2 rounded bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="green">🟢 Low Priority</option>
                          <option value="yellow">🟡 Medium Priority</option>
                          <option value="red">🔴 High Priority</option>
                        </select>
                        <input
                          type="date"
                          value={editData.dueDate}
                          onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                          className="px-3 py-2 rounded bg-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => saveEdit(task._id)}
                            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-medium transition"
                          >
                            ✅ Save
                          </button>
                          <button
                            onClick={() => setEditingTask(null)}
                            className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded font-medium transition"
                          >
                            ❌ Cancel
                          </button>
                        </div>
                      </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <strong className="text-xl text-white wrap-break-word">{task.title}</strong>
                          {task.category && (
                            <div className="inline-block ml-3 px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                              📂 {task.category}
                            </div>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-bold ml-2 shrink-0 ${
                            task.priority === "red"
                              ? "bg-red-600 text-white"
                              : task.priority === "yellow"
                              ? "bg-yellow-500 text-black"
                              : "bg-green-600 text-white"
                          }`}
                        >
                          {task.priority === "red" ? "🔴 HIGH" : task.priority === "yellow" ? "🟡 MEDIUM" : "🟢 LOW"}
                        </span>
                      </div>
                      {task.description && <p className="text-gray-300 mb-3 text-sm">{task.description}</p>}
                      <p className="text-gray-500 text-xs mb-4">📅 Created: {formatDate(task.createdAt)}</p>
                      {task.dueDate && (
                        <p
                          className={`text-xs mb-6 ${
                            task.isOverdue ? "text-red-400 font-bold" : "text-gray-500"

                          }`}
                        >
                          ⏰ Due: {formatDate(task.dueDate)} {task.isOverdue && " (Overdue)"}
                        </p>
                      )}
                      <div className="flex gap-2 flex-wrap mt-2">
                        <button
                          onClick={() =>
                            toggleCompletion(task._id, task.completed)
                          }
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                            task.completed
                              ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                              : "bg-blue-600 hover:bg-blue-700 text-white"
                          }`}
                        >
                          {task.completed ? "↩️ Undo" : "✔️ Complete"}
                        </button>
                        <button
                          onClick={() => startEdit(task)}
                          className="bg-yellow-600 hover:bg-yellow-700 rounded-lg py-2 px-3 text-sm font-medium transition text-white"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => deleteTask(task._id)}
                          className="bg-red-600 hover:bg-red-700 rounded-lg py-2 px-3 text-sm font-medium transition text-white"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </>
                  )}
                  </li>
                ) : null
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}


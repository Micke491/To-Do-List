"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Task {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: "red" | "yellow" | "green";
  completed: boolean;
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ title: "", description: "", category: "", priority: "green" });
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editData, setEditData] = useState({ title: "", description: "", category: "", priority: "green" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const router = useRouter();

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
      setTasks([...tasks, createdTask]);
      setNewTask({ title: "", description: "", category: "", priority: "green" });
      setError("");
    } catch (err) {
      console.error("Error adding task:", err);
      setError(String(err));
    } finally {
      setAdding(false);
    }
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
      setTasks(tasks.map((task) => (task._id === id ? updatedTask : task)));
      setError("");
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
      setError("");
    } catch (err) {
      console.error("Failed to delete task", err);
      setError(String(err));
    }
  };

  const startEdit = (task: Task) => {
    setEditingTask(task._id);
    setEditData({
      title: task.title,
      description: task.description,
      category: task.category,
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
      setTasks(tasks.map((task) => (task._id === id ? updatedTask : task)));
      setEditingTask(null);
      setError("");
    } catch (err) {
      console.error("Failed to edit task", err);
      setError(String(err));
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setTasks([]);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Dashboard – To-Do List</h1>
        <div className="flex gap-2">
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Add Task Form */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-md mb-8 max-w-2xl mx-auto flex flex-col gap-4">
        <input
          placeholder="Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          className="w-full px-4 py-2 rounded-lg bg-gray-700"
        />
        <input
          placeholder="Description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          className="w-full px-4 py-2 rounded-lg bg-gray-700"
        />
        <input
          placeholder="Category"
          value={newTask.category}
          onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
          className="w-full px-4 py-2 rounded-lg bg-gray-700"
        />
        <select
          value={newTask.priority}
          onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as "red" | "yellow" | "green" })}
          className="w-full px-4 py-2 rounded-lg bg-gray-700"
        >
          <option value="green">Green</option>
          <option value="yellow">Yellow</option>
          <option value="red">Red</option>
        </select>
        <button onClick={addTask} disabled={adding} className={`bg-blue-600 hover:bg-blue-700 rounded-lg py-2 mt-2 ${adding ? 'opacity-60 cursor-not-allowed' : ''}`}>
          {adding ? 'Adding...' : 'Add Task'}
        </button>
        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
      </div>

      {/* Task List */}
      <ul className="max-w-2xl mx-auto">
        {loading ? (
          <li className="text-center text-gray-300">Loading tasks...</li>
        ) : !tasks.length ? (
          <li className="text-center p-8 text-gray-300">No tasks yet. Add your first task above.</li>
        ) : (
          tasks.map((task) =>
            task._id ? (
              <li
                key={task._id}
                className={`border rounded-lg p-4 mb-4 flex flex-col gap-2 transition-all duration-200 ${
                  task.completed ? "bg-green-700" : "bg-gray-800"
                }`}
              >
              {editingTask === task._id ? (
                <div className="flex flex-col gap-2">
                  <input
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="px-2 py-1 rounded bg-gray-700"
                  />
                  <input
                    value={editData.description}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="px-2 py-1 rounded bg-gray-700"
                  />
                  <input
                    value={editData.category}
                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                    className="px-2 py-1 rounded bg-gray-700"
                  />
                  <select
                    value={editData.priority}
                    onChange={(e) =>
                      setEditData({ ...editData, priority: e.target.value as "red" | "yellow" | "green" })
                    }
                    className="px-2 py-1 rounded bg-gray-700"
                  >
                    <option value="green">Green</option>
                    <option value="yellow">Yellow</option>
                    <option value="red">Red</option>
                  </select>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => saveEdit(task._id)} className="bg-blue-600 px-3 py-1 rounded">
                      Save
                    </button>
                    <button onClick={() => setEditingTask(null)} className="bg-gray-600 px-3 py-1 rounded">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <strong className="text-lg text-white">{task.title}</strong>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        task.priority === "red"
                          ? "bg-red-600"
                          : task.priority === "yellow"
                          ? "bg-yellow-500 text-black"
                          : "bg-green-600"
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-gray-300">{task.description}</p>
                  <p className="text-gray-400 text-sm">{task.category}</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => toggleCompletion(task._id, task.completed)}
                      className={`py-1 px-3 rounded-lg text-sm ${
                        task.completed
                          ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {task.completed ? "Undo" : "Complete"}
                    </button>
                    <button
                      onClick={() => startEdit(task)}
                      className="bg-yellow-600 hover:bg-yellow-700 rounded-lg py-1 px-3 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTask(task._id)}
                      className="bg-red-600 hover:bg-red-700 rounded-lg py-1 px-3 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
              </li>
            ) : null
          )
        )}
      </ul>
    </div>
  );
}

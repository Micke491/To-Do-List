"use client";

import { useState, useEffect } from "react";

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

  useEffect(() => {
    fetch("/api/tasks")
      .then(res => res.json())
      .then(data => setTasks(data));
  }, []);

  const addTask = async () => {
    if (!newTask.title.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask)
    });
    const createdTask = await res.json();
    setTasks([...tasks, createdTask]);
    setNewTask({ title: "", description: "", category: "", priority: "green" });
  };

  const toggleCompletion = async (id: string, completed: boolean) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed })
      });
      const updatedTask = await res.json();
      setTasks(tasks.map(task => task._id === id ? updatedTask : task));
    } catch (err) {
      console.error("Failed to toggle completion", err);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      setTasks(tasks.filter(task => task._id !== id));
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  const startEdit = (task: Task) => {
    setEditingTask(task._id);
    setEditData({
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority
    });
  };

  const saveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData)
      });
      const updatedTask = await res.json();
      setTasks(tasks.map(task => task._id === id ? updatedTask : task));
      setEditingTask(null);
    } catch (err) {
      console.error("Failed to edit task", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Dashboard – To-Do List</h1>

      {/* Add Task Form */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-md mb-8 max-w-2xl mx-auto flex flex-col gap-4">
        <input
          placeholder="Title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          className="w-full px-4 py-2 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          placeholder="Description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          className="w-full px-4 py-2 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          placeholder="Category"
          value={newTask.category}
          onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
          className="w-full px-4 py-2 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={newTask.priority}
          onChange={(e) =>
            setNewTask({ ...newTask, priority: e.target.value as "red" | "yellow" | "green" })
          }
          className="w-full px-4 py-2 rounded-lg bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="green">Green</option>
          <option value="yellow">Yellow</option>
          <option value="red">Red</option>
        </select>
        <button
          onClick={addTask}
          className="bg-blue-600 hover:bg-blue-700 rounded-lg py-2 mt-2 transition shadow-md"
        >
          Add Task
        </button>
      </div>

      {/* Task List */}
      <ul className="max-w-2xl mx-auto">
        {tasks.map((task) =>
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
                    onChange={(e) => setEditData({ ...editData, priority: e.target.value as "red" | "yellow" | "green" })}
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
                      className={`py-1 px-3 rounded-lg text-sm transition ${
                        task.completed
                          ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      {task.completed ? "Undo" : "Complete"}
                    </button>
                    <button
                      onClick={() => startEdit(task)}
                      className="bg-yellow-600 hover:bg-yellow-700 rounded-lg py-1 px-3 text-sm transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTask(task._id)}
                      className="bg-red-600 hover:bg-red-700 rounded-lg py-1 px-3 text-sm transition"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
}
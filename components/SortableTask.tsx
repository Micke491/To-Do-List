"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export interface Task {
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

interface SortableTaskProps {
  task: Task;
  children: React.ReactNode;
}

export default function SortableTask({ task, children }: SortableTaskProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });

  // Stil za drag efekat
  const style: React.CSSProperties = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 999 : undefined,
    cursor: "grab",
  };

  return (
    <li ref={setNodeRef} style={style} className="relative">
      {/* DRAG HANDLE: ovde se aktivira drag */}
      <div
        {...listeners}
        {...attributes}
        className="absolute -top-2 -left-2 p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 cursor-grab select-none transition"
        title="Drag to reorder"
      >
        ⠿
      </div>

      {/* TASK CONTENT */}
      <div className="pointer-events-auto ml-6">{children}</div>
    </li>
  );
}
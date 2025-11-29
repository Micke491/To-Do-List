import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  description: string;   // ➕ dodato polje
  category: string;
  priority: "red" | "yellow" | "green";
  completed: boolean;
}

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String }, // ➕ dodato polje
  category: { type: String },
  priority: { type: String, enum: ["red", "yellow", "green"], default: "green" },
  completed: { type: Boolean, default: false },
});

export default mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

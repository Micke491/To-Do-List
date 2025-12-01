import mongoose, { Schema, Document } from "mongoose";

export interface ITask extends Document {
  title: string;
  description: string;
  category: string;
  priority: "red" | "yellow" | "green";
  completed: boolean;
  userId: mongoose.Types.ObjectId; // ➕ ZAŠTITA
}

const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  priority: { type: String, enum: ["red", "yellow", "green"], default: "green" },
  completed: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
});

export default mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

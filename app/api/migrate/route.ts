import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await connectDB();

    // Find all tasks and convert userId from string to ObjectId
    const tasks = await Task.find({});
    let updated = 0;

    for (const task of tasks) {
      if (typeof task.userId === "string") {
        try {
          task.userId = new mongoose.Types.ObjectId(task.userId);
          await task.save();
          updated++;
        } catch (err) {
          console.error(`Failed to migrate task ${task._id}:`, err);
        }
      }
    }

    return NextResponse.json({ message: `Migrated ${updated} tasks` }, { status: 200 });
  } catch (err: any) {
    console.error("Migration error:", err);
    return NextResponse.json(
      { message: err?.message ?? "Migration failed", error: String(err) },
      { status: 500 }
    );
  }
}

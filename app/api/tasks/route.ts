import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Task from "@/models/task";
import { verifyToken } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(req: Request) {
  try {
    await connectDB();

    const { search, status, priority } = Object.fromEntries(new URL(req.url).searchParams);

    if (search) {
      const regex = new RegExp(search as string, "i");
      const tasks = await Task.find({ title: regex });
      return NextResponse.json(tasks);
    }
    const user = verifyToken(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const userId = new mongoose.Types.ObjectId(String(user.id));
    // Query by ObjectId to ensure ownership matching works reliably
    const tasks = await Task.find({ userId }).sort({ position: 1 });

    // Debug logging only in development
    if (process.env.NODE_ENV === "development") {
      console.debug("GET /api/tasks", {
        userId: userId.toString(),
        userIdString: String(user.id),
        tasksFound: tasks.length,
      });
    }

    return NextResponse.json(tasks);
  } catch (err: any) {
    console.error("GET /api/tasks error", err);
    return NextResponse.json(
      { message: err?.message ?? "Server error", error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const user = verifyToken(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const userId = new mongoose.Types.ObjectId(String(user.id));

    const lastTask = await Task.findOne({ userId }).sort({ position: -1 });
    const newPosition  = lastTask ? lastTask.position + 1 : 0;

    const task = await Task.create({
      ...body,
      userId, // ⬅ KORISNIK KOJI JE KREIRAO TASK
      position: newPosition,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/tasks error", err);
    return NextResponse.json(
      { message: err?.message ?? "Server error", error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

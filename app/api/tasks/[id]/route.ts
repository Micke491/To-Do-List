import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import { verifyToken } from "@/lib/auth";
import mongoose from "mongoose";

// helper to normalize Next.js context.params which may be a promise in some Next versions
async function resolveParams(context: any) {
  if (!context) return { id: "" };
  const p = context.params;
  if (!p) return { id: "" };
  // if params is a Promise (some Next typings), await it
  if (typeof (p as any).then === "function") return await p;
  return p;
}

function computeIsOverdue(dueDate: Date | undefined, completed: boolean): boolean {
  if (completed) return false;
  if (!dueDate) return false;
  const now = new Date();
  return dueDate < now;
}

// GET single task
export async function GET(req: Request, context: any) {
  const params = await resolveParams(context);
  try {
    await connectDB();

    const user = verifyToken(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    // Validate id
    if (!mongoose.Types.ObjectId.isValid(params.id))
      return NextResponse.json({ message: "Not found" }, { status: 404 });

    const task = await Task.findById(params.id);

    if (!task) return NextResponse.json({ message: "Not found" }, { status: 404 });

    // Ensure the task belongs to the user
    if (task.userId.toString() !== String(user.id)) 
      return NextResponse.json({ message: "Not found" }, { status: 404 });

    const isOverdue = computeIsOverdue(task.dueDate, task.completed);

    return NextResponse.json({
      ...task.toObject(),
      isOverdue,
    });

  } catch (err: any) {
    console.error("GET /api/tasks/[id] error", err);
    return NextResponse.json(
      { message: err?.message ?? "Server error", error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

// UPDATE
export async function PUT(req: Request, context: any) {
  const params = await resolveParams(context);
  try {
    await connectDB();

    const user = verifyToken(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    if (!mongoose.Types.ObjectId.isValid(params.id))
      return NextResponse.json({ message: "Not found" }, { status: 404 });

    const data = await req.json();

    if (data.dueDate) {
      data.dueDate = new Date(data.dueDate);
    }
    
    // Use a single ownership-aware query. Compare userId as ObjectId.
    const userId = new mongoose.Types.ObjectId(String(user.id));
    const updated = await Task.findOneAndUpdate(
      { _id: params.id, userId },
      data,
      { new: true }
    );

    if (!updated) return NextResponse.json({ message: "Not found" }, { status: 404 });

    const isOverdue = computeIsOverdue(updated.dueDate, updated.completed);

    return NextResponse.json({
      ...updated.toObject(),
      isOverdue,
    });
  } catch (err: any) {
    console.error("PUT /api/tasks/[id] error", err);
    return NextResponse.json(
      { message: err?.message ?? "Server error", error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

// DELETE
export async function DELETE(req: Request, context: any) {
  const params = await resolveParams(context);
  try {
    await connectDB();

    const user = verifyToken(req);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    if (!mongoose.Types.ObjectId.isValid(params.id))
      return NextResponse.json({ message: "Not found" }, { status: 404 });

    const userId = new mongoose.Types.ObjectId(String(user.id));
    const deleted = await Task.findOneAndDelete({ _id: params.id, userId });

    if (!deleted) return NextResponse.json({ message: "Not found" }, { status: 404 });

    return NextResponse.json({ message: "Task deleted" });
  } catch (err: any) {
    console.error("DELETE /api/tasks/[id] error", err);
    return NextResponse.json(
      { message: err?.message ?? "Server error", error: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}


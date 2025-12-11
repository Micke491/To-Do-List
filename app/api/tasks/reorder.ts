import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Task from "@/models/Task";
import { verifyToken } from "@/lib/auth";
import mongoose from "mongoose";

export async function PUT(req: Request) {
  try {
    await connectDB();

    const user = verifyToken(req);
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { orderedIds } = await req.json();
    if (!Array.isArray(orderedIds))
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });

    const userId = new mongoose.Types.ObjectId(String(user.id));

    // Zapisivanje redosleda
    await Promise.all(
      orderedIds.map((id, index) =>
        Task.findOneAndUpdate(
          { _id: id, userId },
          { position: index },
          { new: false }
        )
      )
    );

    return NextResponse.json({ message: "Order saved" });
  } catch (err: any) {
    console.error("REORDER error", err);
    return NextResponse.json(
      { message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}

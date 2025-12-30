import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";

// Checklist Item Schema
const ChecklistItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

// Checklist Schema
const ChecklistSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: "" },
  strategy: { type: String, required: true },
  items: [ChecklistItemSchema],
  isActive: { type: Boolean, default: false },
  completionRate: { type: Number, default: 0 },
  timesUsed: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Checklist = mongoose.models.Checklist || mongoose.model("Checklist", ChecklistSchema);

// GET - Fetch specific checklist
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const checklist = await Checklist.findOne({
      _id: id,
      userId: session.user.email,
    });

    if (!checklist) {
      return NextResponse.json(
        { error: "Checklist not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      checklist 
    });

  } catch (error) {
    console.error("Error fetching checklist:", error);
    return NextResponse.json(
      { error: "Failed to fetch checklist" },
      { status: 500 }
    );
  }
}

// PUT - Update checklist
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, strategy, items, isActive } = body;

    if (!name || !strategy || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Name, strategy, and items are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // If this checklist is set as active, deactivate others
    if (isActive) {
      await Checklist.updateMany(
        { userId: session.user.email, _id: { $ne: id } },
        { isActive: false }
      );
    }

    const checklist = await Checklist.findOneAndUpdate(
      { _id: id, userId: session.user.email },
      {
        name,
        description: description || "",
        strategy,
        items: items.map((item: any) => ({
          id: item.id || Date.now().toString(),
          text: item.text,
          completed: false,
        })),
        isActive: isActive || false,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!checklist) {
      return NextResponse.json(
        { error: "Checklist not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      checklist 
    });

  } catch (error) {
    console.error("Error updating checklist:", error);
    return NextResponse.json(
      { error: "Failed to update checklist" },
      { status: 500 }
    );
  }
}

// DELETE - Delete checklist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const checklist = await Checklist.findOneAndDelete({
      _id: id,
      userId: session.user.email,
    });

    if (!checklist) {
      return NextResponse.json(
        { error: "Checklist not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Checklist deleted successfully" 
    });

  } catch (error) {
    console.error("Error deleting checklist:", error);
    return NextResponse.json(
      { error: "Failed to delete checklist" },
      { status: 500 }
    );
  }
}
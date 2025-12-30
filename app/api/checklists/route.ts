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

// GET - Fetch all checklists for user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const checklists = await Checklist.find({ 
      userId: session.user.email 
    }).sort({ updatedAt: -1 });

    return NextResponse.json({ 
      success: true, 
      checklists 
    });

  } catch (error) {
    console.error("Error fetching checklists:", error);
    return NextResponse.json(
      { error: "Failed to fetch checklists" },
      { status: 500 }
    );
  }
}

// POST - Create new checklist
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
        { userId: session.user.email },
        { isActive: false }
      );
    }

    const checklist = new Checklist({
      userId: session.user.email,
      name,
      description: description || "",
      strategy,
      items: items.map((item: any) => ({
        id: item.id || Date.now().toString(),
        text: item.text,
        completed: false,
      })),
      isActive: isActive || false,
      completionRate: 0,
      timesUsed: 0,
    });

    await checklist.save();

    return NextResponse.json({ 
      success: true, 
      checklist 
    });

  } catch (error) {
    console.error("Error creating checklist:", error);
    return NextResponse.json(
      { error: "Failed to create checklist" },
      { status: 500 }
    );
  }
}
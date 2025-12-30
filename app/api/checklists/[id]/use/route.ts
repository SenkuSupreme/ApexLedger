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

// Checklist Usage Schema (to track individual uses)
const ChecklistUsageSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  checklistId: { type: String, required: true },
  checklistName: { type: String, required: true },
  strategy: { type: String, required: true },
  completedItems: [ChecklistItemSchema],
  completionRate: { type: Number, required: true },
  usedAt: { type: Date, default: Date.now },
  tradeId: { type: String }, // Optional: link to a specific trade
});

const ChecklistUsage = mongoose.models.ChecklistUsage || mongoose.model("ChecklistUsage", ChecklistUsageSchema);

// POST - Record checklist usage
export async function POST(
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
    const { completedItems, tradeId } = body;

    if (!completedItems || !Array.isArray(completedItems)) {
      return NextResponse.json(
        { error: "Completed items are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get the checklist
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

    // Calculate completion rate
    const completedCount = completedItems.filter((item: any) => item.completed).length;
    const completionRate = Math.round((completedCount / completedItems.length) * 100);

    // Record the usage
    const usage = new ChecklistUsage({
      userId: session.user.email,
      checklistId: id,
      checklistName: checklist.name,
      strategy: checklist.strategy,
      completedItems,
      completionRate,
      tradeId: tradeId || null,
    });

    await usage.save();

    // Update checklist statistics
    const totalUsages = await ChecklistUsage.countDocuments({
      checklistId: id,
      userId: session.user.email,
    });

    const avgCompletionRate = await ChecklistUsage.aggregate([
      { 
        $match: { 
          checklistId: id, 
          userId: session.user.email 
        } 
      },
      { 
        $group: { 
          _id: null, 
          avgCompletion: { $avg: "$completionRate" } 
        } 
      },
    ]);

    const newAvgCompletion = avgCompletionRate.length > 0 
      ? Math.round(avgCompletionRate[0].avgCompletion) 
      : completionRate;

    // Update the checklist with new stats
    await Checklist.findByIdAndUpdate(id, {
      timesUsed: totalUsages,
      completionRate: newAvgCompletion,
      updatedAt: new Date(),
    });

    return NextResponse.json({ 
      success: true, 
      usage,
      stats: {
        timesUsed: totalUsages,
        completionRate: newAvgCompletion,
      }
    });

  } catch (error) {
    console.error("Error recording checklist usage:", error);
    return NextResponse.json(
      { error: "Failed to record checklist usage" },
      { status: 500 }
    );
  }
}

// GET - Get checklist usage history
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

    const usages = await ChecklistUsage.find({
      checklistId: id,
      userId: session.user.email,
    }).sort({ usedAt: -1 });

    return NextResponse.json({ 
      success: true, 
      usages 
    });

  } catch (error) {
    console.error("Error fetching checklist usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch checklist usage" },
      { status: 500 }
    );
  }
}
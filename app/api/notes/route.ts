import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Note from "@/lib/models/Note";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();

    // Get query params
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "20");
    const isQuickNote = searchParams.get("isQuickNote");
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const isDetailed = searchParams.get("isDetailed");

    const query: any = {
      // @ts-ignore
      userId: session.user.id,
    };

    if (isDetailed !== null) {
      if (isDetailed === "true") query.isDetailed = true;
      if (isDetailed === "false") query.isDetailed = false;
    } else {
      // Default to returning ONLY notebook notes (not detailed) 
      // if the parameter is missing (e.g., standard notebook view)
      query.isDetailed = false;
    }

    if (isQuickNote !== null) {
      if (isQuickNote === "true") query.isQuickNote = true;
      if (isQuickNote === "false") query.isQuickNote = false;
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const notes = await Note.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(limit);

    return NextResponse.json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error("Notes GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await req.json();
    const { 
      title, content, category, tags, isQuickNote, priority, color, 
      isDetailed, blocks, canvasElements 
    } = body;

    const note = await Note.create({
      title,
      content: content || "",
      category: category || "other",
      tags: tags || [],
      isQuickNote: isQuickNote || false,
      priority: priority || "medium",
      color: color || "#fef3c7",
      isDetailed: isDetailed || false,
      blocks: blocks || [],
      canvasElements: canvasElements || [],
      // @ts-ignore
      userId: session.user.id,
      isPinned: false,
    });

    return NextResponse.json({
      success: true,
      note,
    });
  } catch (error) {
    console.error("Notes POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create note" },
      { status: 500 }
    );
  }
}
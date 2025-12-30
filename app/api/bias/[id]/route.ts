import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;

    // In production, update the bias entry in your database
    const updatedBias = {
      _id: id,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      bias: updatedBias
    });

  } catch (error) {
    console.error("Bias PUT error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update bias entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // In production, delete the bias entry from your database
    // For now, just return success
    
    return NextResponse.json({
      success: true,
      message: "Bias entry deleted successfully"
    });

  } catch (error) {
    console.error("Bias DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete bias entry" },
      { status: 500 }
    );
  }
}
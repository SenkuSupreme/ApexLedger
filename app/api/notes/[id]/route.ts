import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, category, tags, isPinned } = body;

    // In production, update the note in your database
    const updatedNote = {
      _id: id,
      title,
      content,
      category,
      tags,
      isPinned,
      // @ts-ignore
      userId: session.user.id,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      note: updatedNote
    });
  } catch (error) {
    console.error('Note PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update note' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    // In production, delete the note from your database
    
    return NextResponse.json({
      success: true,
      message: "Note deleted successfully"
    });
  } catch (error) {
    console.error('Note DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}
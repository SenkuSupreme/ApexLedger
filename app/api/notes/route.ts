import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // In production, fetch from your database
    // For now, return empty array
    return NextResponse.json({
      success: true,
      notes: []
    });
  } catch (error) {
    console.error('Notes GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, content, category, tags, isPinned } = body;

    // In production, save to your database
    const note = {
      _id: Date.now().toString(),
      title,
      content,
      category,
      tags,
      isPinned,
      // @ts-ignore
      userId: session.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      note
    });
  } catch (error) {
    console.error('Notes POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create note' },
      { status: 500 }
    );
  }
}
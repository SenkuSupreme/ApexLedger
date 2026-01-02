import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import ChatMessage from '@/lib/models/ChatMessage';
import User from '@/lib/models/User';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const messages = await ChatMessage.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('userId', 'username name image');

    return NextResponse.json(messages.reverse());
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { content } = await req.json();
    if (!content) {
      return NextResponse.json({ message: 'Content required' }, { status: 400 });
    }

    await dbConnect();
    // @ts-ignore
    const userId = session.user.id;
    
    const newMessage = await ChatMessage.create({
      userId,
      content,
    });

    const populatedMessage = await ChatMessage.findById(newMessage._id).populate('userId', 'username name image');

    return NextResponse.json(populatedMessage);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Strategy from '@/lib/models/Strategy';
import { authOptions } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await dbConnect();
    
    const strategy = await Strategy.findOne({ 
      _id: id, 
      // @ts-ignore
      userId: session.user.id 
    }).lean();

    if (!strategy) {
      return NextResponse.json({ message: 'Strategy not found' }, { status: 404 });
    }

    return NextResponse.json(strategy);
  } catch (error) {
    console.error('Fetch strategy error:', error);
    return NextResponse.json({ message: 'Error fetching strategy' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    await dbConnect();

    // Safety: Strip protected fields
    const { _id, userId, ...updateData } = body;

    const strategy = await Strategy.findOneAndUpdate(
      { 
        _id: id, 
        // @ts-ignore
        userId: session.user.id 
      },
      { $set: updateData },
      { new: true }
    );

    if (!strategy) {
      return NextResponse.json({ message: 'Strategy not found' }, { status: 404 });
    }

    return NextResponse.json(strategy);
  } catch (error) {
    console.error('Update strategy error:', error);
    return NextResponse.json({ message: 'Error updating strategy' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await dbConnect();
    
    const strategy = await Strategy.findOneAndDelete({ 
      _id: id, 
      // @ts-ignore
      userId: session.user.id 
    });

    if (!strategy) {
      return NextResponse.json({ message: 'Strategy not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Strategy deleted successfully' });
  } catch (error) {
    console.error('Delete strategy error:', error);
    return NextResponse.json({ message: 'Error deleting strategy' }, { status: 500 });
  }
}
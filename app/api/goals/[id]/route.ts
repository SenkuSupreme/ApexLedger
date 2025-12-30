import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Goal from '@/lib/models/Goal';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();
    
    const goal = await Goal.findOne({
      _id: id,
      userId: session.user.email
    });
    
    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }
    
    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error fetching goal:', error);
    return NextResponse.json({ error: 'Failed to fetch goal' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    await dbConnect();
    
    const goal = await Goal.findOneAndUpdate(
      { _id: id, userId: session.user.email },
      body,
      { new: true }
    );
    
    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }
    
    return NextResponse.json(goal);
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();
    
    const goal = await Goal.findOneAndDelete({
      _id: id,
      userId: session.user.email
    });
    
    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
}
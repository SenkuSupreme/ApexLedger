import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Habit from '@/lib/models/Habit';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();
    
    const habit = await Habit.findOne({
      _id: id,
      userId: session.user.email
    });
    
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }
    
    return NextResponse.json(habit);
  } catch (error) {
    console.error('Error fetching habit:', error);
    return NextResponse.json({ error: 'Failed to fetch habit' }, { status: 500 });
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
    
    const habit = await Habit.findOneAndUpdate(
      { _id: id, userId: session.user.email },
      body,
      { new: true }
    );
    
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }
    
    return NextResponse.json(habit);
  } catch (error) {
    console.error('Error updating habit:', error);
    return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 });
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
    
    const habit = await Habit.findOneAndDelete({
      _id: id,
      userId: session.user.email
    });
    
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Error deleting habit:', error);
    return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 });
  }
}
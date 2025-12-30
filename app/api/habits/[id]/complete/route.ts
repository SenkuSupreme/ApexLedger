import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Habit from '@/lib/models/Habit';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { count = 1, notes } = await request.json();
    await dbConnect();
    
    const habit = await Habit.findOne({
      _id: id,
      userId: session.user.email
    });
    
    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if already completed today
    const existingCompletion = habit.completions.find(
      (completion: { date: Date; count: number; notes?: string }) => completion.date.toDateString() === today.toDateString()
    );

    if (existingCompletion) {
      existingCompletion.count += count;
      if (notes) existingCompletion.notes = notes;
    } else {
      habit.completions.push({
        date: today,
        count,
        notes
      });
      
      // Update streak
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const yesterdayCompletion = habit.completions.find(
        (completion: { date: Date; count: number; notes?: string }) => completion.date.toDateString() === yesterday.toDateString()
      );
      
      if (yesterdayCompletion || habit.streak === 0) {
        habit.streak += 1;
        if (habit.streak > habit.longestStreak) {
          habit.longestStreak = habit.streak;
        }
      } else {
        habit.streak = 1;
      }
    }
    
    await habit.save();
    return NextResponse.json(habit);
  } catch (error) {
    console.error('Error completing habit:', error);
    return NextResponse.json({ error: 'Failed to complete habit' }, { status: 500 });
  }
}
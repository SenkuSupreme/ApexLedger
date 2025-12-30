import mongoose from 'mongoose';

export interface IHabit {
  _id?: string;
  title: string;
  description?: string;
  category: 'trading' | 'health' | 'learning' | 'productivity' | 'other';
  frequency: 'daily' | 'weekly' | 'monthly';
  targetCount: number; // how many times per frequency period
  streak: number;
  longestStreak: number;
  completions: Array<{
    date: Date;
    count: number;
    notes?: string;
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  tags?: string[];
}

const HabitSchema = new mongoose.Schema<IHabit>({
  title: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: ['trading', 'health', 'learning', 'productivity', 'other'], 
    default: 'other' 
  },
  frequency: { 
    type: String, 
    enum: ['daily', 'weekly', 'monthly'], 
    default: 'daily' 
  },
  targetCount: { type: Number, default: 1, min: 1 },
  streak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  completions: [{
    date: { type: Date, required: true },
    count: { type: Number, default: 1 },
    notes: { type: String }
  }],
  isActive: { type: Boolean, default: true },
  userId: { type: String, required: true },
  tags: [{ type: String }]
}, {
  timestamps: true
});

export default mongoose.models.Habit || mongoose.model<IHabit>('Habit', HabitSchema);
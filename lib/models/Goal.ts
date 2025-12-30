import mongoose from 'mongoose';

export interface IGoal {
  _id?: string;
  title: string;
  description?: string;
  category: 'trading' | 'learning' | 'financial' | 'personal' | 'other';
  status: 'not-started' | 'in-progress' | 'completed' | 'paused';
  priority: 'low' | 'medium' | 'high';
  targetDate?: Date;
  progress: number; // 0-100
  milestones: Array<{
    title: string;
    completed: boolean;
    completedAt?: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  tags?: string[];
}

const GoalSchema = new mongoose.Schema<IGoal>({
  title: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    enum: ['trading', 'learning', 'financial', 'personal', 'other'], 
    default: 'other' 
  },
  status: { 
    type: String, 
    enum: ['not-started', 'in-progress', 'completed', 'paused'], 
    default: 'not-started' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  targetDate: { type: Date },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  milestones: [{
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date }
  }],
  userId: { type: String, required: true },
  tags: [{ type: String }]
}, {
  timestamps: true
});

export default mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema);
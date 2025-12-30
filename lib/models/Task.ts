import mongoose from 'mongoose';

export interface ITask {
  _id?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  tags?: string[];
  assignee?: string;
}

const TaskSchema = new mongoose.Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String },
  status: { 
    type: String, 
    enum: ['todo', 'in-progress', 'done'], 
    default: 'todo' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  dueDate: { type: Date },
  userId: { type: String, required: true },
  tags: [{ type: String }],
  assignee: { type: String }
}, {
  timestamps: true
});

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
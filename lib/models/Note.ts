import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  category: {
    type: String,
    enum: ['trading', 'strategy', 'market', 'personal', 'idea', 'lesson', 'other'],
    default: 'other',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  isQuickNote: {
    type: Boolean,
    default: false,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: '#fef3c7', // Default yellow paper color
  },
  portfolioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio',
  },
  tradeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trade',
  },
  attachments: [{
    filename: String,
    url: String,
    type: String,
  }],
  reminderDate: Date,
  isArchived: {
    type: Boolean,
    default: false,
  },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
NoteSchema.index({ userId: 1, createdAt: -1 });
NoteSchema.index({ userId: 1, category: 1 });
NoteSchema.index({ userId: 1, isPinned: -1, createdAt: -1 });
NoteSchema.index({ userId: 1, isQuickNote: 1 });

// Virtual for formatted date
NoteSchema.virtual('formattedDate').get(function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

export default mongoose.models.Note || mongoose.model('Note', NoteSchema);
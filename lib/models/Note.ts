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
  isDetailed: {
    type: Boolean,
    default: false,
  },
  blocks: [{
    id: String,
    type: { 
        type: String, 
        enum: ['h1', 'h2', 'h3', 'text', 'todo', 'callout', 'divider', 'image', 'quote', 'bullet', 'code', 'table', 'toggle', 'number', 'bookmark'] 
    },
    content: String,
    checked: Boolean, // for todo
    metadata: mongoose.Schema.Types.Mixed // for any additional block data
  }],
  canvasElements: [{
    id: String,
    type: { type: String, enum: ['image', 'note', 'shape'] },
    content: String, // URL for image, text for note
    position: {
      x: Number,
      y: Number,
    },
    size: {
      width: Number,
      height: Number,
    },
    rotation: Number,
    zIndex: Number,
  }],
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

if (mongoose.models.Note) {
  delete mongoose.models.Note;
}

const Note = mongoose.model('Note', NoteSchema);
export default Note;
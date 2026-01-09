import mongoose from 'mongoose';

const StrategySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  // Core Info
  coreInfo: {
    marketFocus: [String], // Forex, Indices, Crypto, etc.
    instrumentFocus: [String],
    htfBias: String,
    executionTimeframe: String,
    confirmationTimeframe: String,
  },
  // Market
  market: {
    biasFramework: String,
    bestSessions: [String],
    keyConditions: String,
  },
  // Setup
  setup: {
    setupName: String,
    entrySignal: String,
    confluences: [String],
    slPlacement: String,
    tpManagement: String,
  },
  // Execution
  execution: {
    checklist: [String],
    executionStyle: String, // Market, Limit, Stop
    slManagement: String,
    tpManagement: String,
  },
  // Risk
  risk: {
    riskStrategy: String,
    generalRisk: String,
    conditionsToAvoid: [String],
  },
  // Additionals
  additionals: {
    goals: String,
    scenarios: String,
    improvements: String,
    notes: String,
    links: [String],
    books: [String],
  },
  customSections: [{
    title: String,
    content: String,
    icon: String, // lucide icon name
  }],
  // Freestyle Canvas Elements (images, sticky notes, etc.)
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
  // Dynamic Notion-like Blocks
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
  isTemplate: {
    type: Boolean,
    default: false,
  },
  checklist: [String],
}, { timestamps: true });

StrategySchema.index({ userId: 1 });

export default mongoose.models.Strategy || mongoose.model('Strategy', StrategySchema);

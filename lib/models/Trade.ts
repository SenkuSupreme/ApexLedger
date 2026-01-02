import mongoose from 'mongoose';

const TradeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  symbol: {
    type: String,
    required: true,
  },
  assetType: {
    type: String,
    enum: ['stock', 'forex', 'crypto', 'cfd', 'futures', 'indices'],
    required: true,
  },
  exchange: String,
  timestampEntry: {
    type: Date,
    required: true,
  },
  timestampExit: Date,
  entryPrice: {
    type: Number,
    required: true,
  },
  exitPrice: Number,
  stopLoss: Number,
  takeProfit: Number,

  quantity: {
    type: Number,
    required: true,
  },
  direction: {
    type: String,
    enum: ['long', 'short'],
    required: true,
  },
  leverage: {
    type: String,
    default: '1:1',
  },
  fees: {
    type: Number,
    default: 0,
  },
  pnl: Number, // Net PnL
  grossPnl: Number,
  pnlCurrency: {
    type: String,
    default: 'USD',
  },
  pnlUnit: {
    type: String,
    enum: ['$', 'pips'],
    default: '$'
  },
  // Risk Management & Calculations
  accountRisk: {
    type: Number, // Percentage of account risked
    default: 0
  },
  riskAmount: {
    type: Number, // Dollar amount at risk
    default: 0
  },
  portfolioBalance: {
    type: Number, // Portfolio balance at time of trade
    default: 0
  },
  rMultiple: Number,
  
  // Basic Info
  status: {
    type: String,
    enum: ['Open', 'Closed', 'Pending'],
    default: 'Closed'
  },
  
  // Analysis Tabs
  newsImpact: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'None'],
    default: 'None'
  },
  dailyBias: String,
  marketCondition: [String],
  marketEnvironment: String,
  executionArchitecture: String,
  signalTrigger: String,
  technicalConfluence: String,
  tradeType: String,
  entryTimeframe: String,
  sessions: [String],
  entrySignal: [String],
  confluences: [String],
  keyLevels: [String],

  // Execution & Risk
  orderType: {
    type: String,
    enum: ['Market', 'Limit', 'Stop'],
    default: 'Market'
  },
  stopLossUnit: {
    type: String,
    enum: ['pips', '$'],
    default: '$'
  },
  riskPercentage: Number,
  slManagement: [String],
  targetRR: Number,
  actualRR: Number,
  maxRR: Number,
  tpManagement: [String],

  // Results
  outcome: String,
  setupGrade: {
    type: Number, // 1=D, 2=C, 3=B, 4=A, 5=A+
    min: 1,
    max: 5
  },
  emotion: {
    type: String,
    enum: ['confident', 'nervous', 'excited', 'frustrated', 'calm', 'greedy', 'fearful', 'neutral']
  },
  mistakes: String,
  description: String,
  noteToSelf: String,
  screenshots: [String],
  chartLink: String,

  tags: [String],
  notes: String,
  strategyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Strategy',
  },
  inBacktest: {
    type: Boolean,
    default: false,
  },
  aiAnalysis: {
    type: Object,
    default: {},
  },
  portfolioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio',
  },
}, { timestamps: true });

// Optimize index for frequently filtered and sorted fields
TradeSchema.index({ userId: 1, portfolioId: 1, timestampEntry: -1 });
TradeSchema.index({ userId: 1, inBacktest: 1 });
TradeSchema.index({ userId: 1, symbol: 1 });

export default mongoose.models.Trade || mongoose.model('Trade', TradeSchema);
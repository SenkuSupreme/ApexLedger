import mongoose from 'mongoose';

const MarketDataSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    index: true
  },
  assetType: {
    type: String,
    enum: ['forex', 'crypto', 'cfd', 'futures', 'stocks', 'indices'],
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  bid: Number,
  ask: Number,
  open: Number,
  high: Number,
  low: Number,
  close: Number,
  volume: Number,
  change: Number,
  changePercent: Number,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  source: {
    type: String,
    enum: ['twelvedata', 'finhub', 'alpha_vantage'],
    default: 'twelvedata'
  }
}, { 
  timestamps: true,
  // TTL index to automatically delete old data after 7 days
  expireAfterSeconds: 7 * 24 * 60 * 60
});

// Compound index for efficient queries
MarketDataSchema.index({ symbol: 1, timestamp: -1 });
MarketDataSchema.index({ assetType: 1, timestamp: -1 });

export default mongoose.models.MarketData || mongoose.model('MarketData', MarketDataSchema);
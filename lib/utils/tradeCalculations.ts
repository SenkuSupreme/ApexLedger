// Trade calculation utilities for auto-calculating risk, P&L, and R:R ratios with real market data

export interface Trade {
  _id?: string;
  pnl?: number;
  riskAmount?: number;
  [key: string]: any;
}

export interface TradeCalculationInput {
  entryPrice: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  quantity: number;
  direction: 'long' | 'short';
  portfolioBalance: number;
  fees?: number;
  assetType?: string;
  symbol?: string;
  currentPrice?: number; // For real-time calculations
}

export interface TradeCalculationResult {
  // Risk Calculations
  riskAmount: number;
  accountRisk: number; // Percentage
  
  // P&L Calculations
  grossPnl: number;
  netPnl: number;
  unrealizedPnl?: number; // For open positions
  
  // Risk-Reward Ratios
  rMultiple: number;
  targetRR: number; // Based on take profit
  actualRR: number; // Based on exit price
  
  // Additional Metrics
  positionValue: number;
  riskPerShare: number;
  pipValue?: number; // For forex
  contractSize?: number; // For CFDs/Futures
}

// Comprehensive contract specifications for all asset types
function getContractSpecs(assetType: string, symbol: string) {
  const specs = {
    contractSize: 1,
    pipValue: 1,
    pipPosition: 4,
    pointValue: 1 // Value per point movement
  };

  // Normalize symbol for easier matching
  const normalizedSymbol = symbol.toUpperCase();

  switch (assetType) {
    case 'forex':
      // Precious Metals
      if (normalizedSymbol.includes('XAU') || normalizedSymbol === 'GOLD') {
        specs.contractSize = 100; // 100 ounces per lot
        specs.pipValue = 10; // $10 per 0.01 movement
        specs.pointValue = 1; // $1 per $1 movement
        specs.pipPosition = 2;
      } else if (normalizedSymbol.includes('XAG') || normalizedSymbol === 'SILVER') {
        specs.contractSize = 5000; // 5000 ounces per lot
        specs.pipValue = 50; // $50 per 0.001 movement
        specs.pointValue = 1;
        specs.pipPosition = 3;
      } else if (normalizedSymbol.includes('XPT') || normalizedSymbol === 'PLATINUM') {
        specs.contractSize = 50; // 50 ounces per lot
        specs.pipValue = 5; // $5 per 0.01 movement
        specs.pointValue = 1;
        specs.pipPosition = 2;
      } else if (normalizedSymbol.includes('XPD') || normalizedSymbol === 'PALLADIUM') {
        specs.contractSize = 100; // 100 ounces per lot
        specs.pipValue = 10; // $10 per 0.01 movement
        specs.pointValue = 1;
        specs.pipPosition = 2;
      }
      // Oil and Energy
      else if (normalizedSymbol.includes('OIL') || normalizedSymbol === 'USOIL' || normalizedSymbol === 'BRENT') {
        specs.contractSize = 1000; // 1000 barrels per lot
        specs.pipValue = 10; // $10 per 0.01 movement
        specs.pointValue = 1;
        specs.pipPosition = 2;
      }
      // Standard Forex Pairs
      else if (normalizedSymbol.includes('JPY')) {
        specs.contractSize = 100000; // Standard lot
        specs.pipValue = 10; // $10 per pip for USD account
        specs.pointValue = 0.01;
        specs.pipPosition = 2; // JPY pairs have 2 decimal places
      } else {
        specs.contractSize = 100000; // Standard lot
        specs.pipValue = 10; // $10 per pip for USD account
        specs.pointValue = 0.0001;
        specs.pipPosition = 4; // Most pairs have 4 decimal places
      }
      break;

    case 'crypto':
      // Major cryptocurrencies
      if (normalizedSymbol.includes('BTC')) {
        specs.contractSize = 1;
        specs.pipValue = 1;
        specs.pointValue = 1;
        specs.pipPosition = 2;
      } else if (normalizedSymbol.includes('ETH')) {
        specs.contractSize = 1;
        specs.pipValue = 1;
        specs.pointValue = 1;
        specs.pipPosition = 2;
      } else {
        specs.contractSize = 1;
        specs.pipValue = 1;
        specs.pointValue = 1;
        specs.pipPosition = 4;
      }
      break;

    case 'indices':
      // Major indices
      if (normalizedSymbol.includes('SPX') || normalizedSymbol.includes('SP500')) {
        specs.contractSize = 50; // $50 per point
        specs.pipValue = 50;
        specs.pointValue = 50;
        specs.pipPosition = 2;
      } else if (normalizedSymbol.includes('NAS') || normalizedSymbol.includes('NDX')) {
        specs.contractSize = 20; // $20 per point
        specs.pipValue = 20;
        specs.pointValue = 20;
        specs.pipPosition = 2;
      } else if (normalizedSymbol.includes('DOW') || normalizedSymbol.includes('DJI')) {
        specs.contractSize = 5; // $5 per point
        specs.pipValue = 5;
        specs.pointValue = 5;
        specs.pipPosition = 0;
      } else if (normalizedSymbol.includes('DAX')) {
        specs.contractSize = 25; // €25 per point
        specs.pipValue = 25;
        specs.pointValue = 25;
        specs.pipPosition = 1;
      } else if (normalizedSymbol.includes('FTSE')) {
        specs.contractSize = 10; // £10 per point
        specs.pipValue = 10;
        specs.pointValue = 10;
        specs.pipPosition = 1;
      } else {
        specs.contractSize = 1;
        specs.pipValue = 1;
        specs.pointValue = 1;
        specs.pipPosition = 1;
      }
      break;

    case 'stocks':
      specs.contractSize = 1; // 1 share
      specs.pipValue = 1;
      specs.pointValue = 1;
      specs.pipPosition = 2;
      break;

    case 'cfd':
      // CFDs follow similar rules to their underlying assets
      if (normalizedSymbol.includes('XAU') || normalizedSymbol === 'GOLD') {
        specs.contractSize = 100;
        specs.pipValue = 10;
        specs.pointValue = 1;
        specs.pipPosition = 2;
      } else if (normalizedSymbol.includes('OIL')) {
        specs.contractSize = 1000;
        specs.pipValue = 10;
        specs.pointValue = 1;
        specs.pipPosition = 2;
      } else {
        specs.contractSize = 1;
        specs.pipValue = 1;
        specs.pointValue = 1;
        specs.pipPosition = 2;
      }
      break;

    case 'futures':
      // Futures contracts have specific multipliers
      if (normalizedSymbol.includes('ES')) { // E-mini S&P 500
        specs.contractSize = 50;
        specs.pipValue = 50;
        specs.pointValue = 50;
        specs.pipPosition = 2;
      } else if (normalizedSymbol.includes('NQ')) { // E-mini Nasdaq
        specs.contractSize = 20;
        specs.pipValue = 20;
        specs.pointValue = 20;
        specs.pipPosition = 2;
      } else if (normalizedSymbol.includes('YM')) { // E-mini Dow
        specs.contractSize = 5;
        specs.pipValue = 5;
        specs.pointValue = 5;
        specs.pipPosition = 0;
      } else {
        specs.contractSize = 1;
        specs.pipValue = 1;
        specs.pointValue = 1;
        specs.pipPosition = 2;
      }
      break;

    default:
      specs.contractSize = 1;
      specs.pipValue = 1;
      specs.pointValue = 1;
      specs.pipPosition = 2;
  }

  return specs;
}

export function calculateTradeMetrics(input: TradeCalculationInput): TradeCalculationResult {
  const {
    entryPrice,
    exitPrice,
    stopLoss,
    takeProfit,
    quantity,
    direction,
    portfolioBalance,
    fees = 0,
    assetType = 'forex',
    symbol = '',
    currentPrice
  } = input;

  const contractSpecs = getContractSpecs(assetType, symbol);
  const normalizedSymbol = symbol.toUpperCase();

  // Calculate position value
  let positionValue = 0;
  let effectiveQuantity = quantity;

  // Position value calculation based on asset type
  if (assetType === 'forex' || assetType === 'cfd') {
    if (normalizedSymbol.includes('XAU') || normalizedSymbol.includes('XAG') || 
        normalizedSymbol.includes('XPT') || normalizedSymbol.includes('XPD') ||
        normalizedSymbol.includes('OIL')) {
      // Precious metals and commodities
      effectiveQuantity = quantity * contractSpecs.contractSize;
      positionValue = entryPrice * effectiveQuantity;
    } else {
      // Standard forex pairs
      effectiveQuantity = quantity * contractSpecs.contractSize;
      positionValue = effectiveQuantity; // For forex, position value is the base currency amount
    }
  } else if (assetType === 'indices' || assetType === 'futures') {
    // Indices and futures use point values
    positionValue = entryPrice * quantity * contractSpecs.contractSize;
  } else {
    // Stocks and crypto
    positionValue = entryPrice * quantity;
  }

  // Calculate risk per unit
  let riskPerShare = 0;
  if (stopLoss && entryPrice) {
    riskPerShare = Math.abs(entryPrice - stopLoss);
  }

  // Calculate total risk amount
  let riskAmount = 0;
  
  if (assetType === 'forex' || assetType === 'cfd') {
    if (normalizedSymbol.includes('XAU') || normalizedSymbol.includes('XAG') || 
        normalizedSymbol.includes('XPT') || normalizedSymbol.includes('XPD') ||
        normalizedSymbol.includes('OIL')) {
      // Precious metals and commodities: Risk = Price Difference × Lot Size × Contract Size
      riskAmount = riskPerShare * quantity * contractSpecs.contractSize;
    } else {
      // Standard forex pairs: Risk = Pip Difference × Pip Value × Lot Size
      const pipDifference = riskPerShare / contractSpecs.pointValue;
      riskAmount = pipDifference * contractSpecs.pipValue * quantity;
    }
  } else if (assetType === 'indices' || assetType === 'futures') {
    // Indices and futures: Risk = Point Difference × Point Value × Contracts
    riskAmount = riskPerShare * contractSpecs.pointValue * quantity;
  } else {
    // Stocks and crypto: Risk = Price Difference × Shares
    riskAmount = riskPerShare * quantity;
  }

  // Calculate account risk percentage
  const accountRisk = portfolioBalance > 0 ? (riskAmount / portfolioBalance) * 100 : 0;

  // Calculate gross P&L (yield)
  let grossPnl = 0;
  let unrealizedPnl = 0;

  const calculatePnL = (entryPrice: number, exitPrice: number) => {
    const priceDifference = direction === 'long' ? (exitPrice - entryPrice) : (entryPrice - exitPrice);
    
    if (assetType === 'forex' || assetType === 'cfd') {
      if (normalizedSymbol.includes('XAU') || normalizedSymbol.includes('XAG') || 
          normalizedSymbol.includes('XPT') || normalizedSymbol.includes('XPD') ||
          normalizedSymbol.includes('OIL')) {
        // Precious metals and commodities
        return priceDifference * quantity * contractSpecs.contractSize;
      } else {
        // Standard forex pairs
        const pipDifference = priceDifference / contractSpecs.pointValue;
        return pipDifference * contractSpecs.pipValue * quantity;
      }
    } else if (assetType === 'indices' || assetType === 'futures') {
      // Indices and futures
      return priceDifference * contractSpecs.pointValue * quantity;
    } else {
      // Stocks and crypto
      return priceDifference * quantity;
    }
  };

  // Calculate realized P&L
  if (exitPrice && entryPrice) {
    grossPnl = calculatePnL(entryPrice, exitPrice);
  }

  // Calculate unrealized P&L for open positions
  if (currentPrice && entryPrice && !exitPrice) {
    unrealizedPnl = calculatePnL(entryPrice, currentPrice);
  }

  // Calculate net P&L (after fees/commission)
  const netPnl = grossPnl - fees;

  // Calculate R-Multiples and Risk-Reward Ratios
  let rMultiple = 0;
  let actualRR = 0;
  let targetRR = 0;

  if (riskAmount > 0) {
    // Actual R-Multiple (based on exit price or current price)
    const priceForCalculation = exitPrice || currentPrice;
    if (priceForCalculation) {
      const reward = calculatePnL(entryPrice, priceForCalculation);
      rMultiple = reward / riskAmount;
      actualRR = rMultiple;
    }

    // Target R-Multiple (based on take profit)
    if (takeProfit) {
      const targetReward = calculatePnL(entryPrice, takeProfit);
      targetRR = targetReward / riskAmount;
    }
  }

  return {
    riskAmount: Number(riskAmount.toFixed(2)),
    accountRisk: Number(accountRisk.toFixed(2)),
    grossPnl: Number(grossPnl.toFixed(2)),
    netPnl: Number(netPnl.toFixed(2)),
    unrealizedPnl: unrealizedPnl ? Number(unrealizedPnl.toFixed(2)) : undefined,
    rMultiple: Number(rMultiple.toFixed(2)),
    targetRR: Number(targetRR.toFixed(2)),
    actualRR: Number(actualRR.toFixed(2)),
    positionValue: Number(positionValue.toFixed(2)),
    riskPerShare: Number(riskPerShare.toFixed(5)),
    pipValue: contractSpecs.pipValue,
    contractSize: contractSpecs.contractSize
  };
}

// Helper function to format currency
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

// Helper function to format percentage
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

// Helper function to format R-Multiple
export function formatRMultiple(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}R`;
}

// Calculate portfolio metrics
export function calculatePortfolioMetrics(trades: Trade[], initialBalance: number) {
  const totalPnl = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const currentBalance = initialBalance + totalPnl;
  const totalRisk = trades.reduce((sum, trade) => sum + (trade.riskAmount || 0), 0);
  const winningTrades = trades.filter(trade => (trade.pnl || 0) > 0);
  const losingTrades = trades.filter(trade => (trade.pnl || 0) < 0);
  
  return {
    currentBalance: Number(currentBalance.toFixed(2)),
    totalPnl: Number(totalPnl.toFixed(2)),
    totalRisk: Number(totalRisk.toFixed(2)),
    winRate: trades.length > 0 ? Number(((winningTrades.length / trades.length) * 100).toFixed(2)) : 0,
    averageWin: winningTrades.length > 0 ? Number((winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / winningTrades.length).toFixed(2)) : 0,
    averageLoss: losingTrades.length > 0 ? Number((losingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / losingTrades.length).toFixed(2)) : 0,
    profitFactor: losingTrades.length > 0 ? Number((Math.abs(winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)) / Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0))).toFixed(2)) : 0
  };
}

// Test function to verify XAUUSD calculations
export function testXAUUSDCalculation() {
  const testInput: TradeCalculationInput = {
    entryPrice: 2652.182,
    stopLoss: 2634.486,
    takeProfit: 2705.337,
    quantity: 0.2,
    direction: 'long',
    portfolioBalance: 10000,
    fees: 3,
    assetType: 'forex',
    symbol: 'XAUUSD'
  };

  const result = calculateTradeMetrics(testInput);
  
  console.log('XAUUSD Test Results:');
  console.log(`Risk Amount: $${result.riskAmount} (Expected: $353.92)`);
  console.log(`Account Risk: ${result.accountRisk}% (Expected: 3.54%)`);
  console.log(`Target R:R: ${result.targetRR.toFixed(1)}:1 (Expected: 3.0:1)`);
  
  return result;
}
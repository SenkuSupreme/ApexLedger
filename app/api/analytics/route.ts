
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Trade from '@/lib/models/Trade';
import Portfolio from '@/lib/models/Portfolio';
import { calculateTradeMetrics } from '@/lib/utils/tradeCalculations';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const portfolioId = searchParams.get('portfolioId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  await dbConnect();
  
  // @ts-ignore
  const query: any = { userId: session.user.id };

  if (portfolioId && portfolioId !== 'all') {
      query.portfolioId = portfolioId;
  }

  if (startDate && endDate) {
      query.timestampEntry = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
      };
  }

  // Calculate Lifetime PnL for live balance
  const balanceTradesQuery: any = { userId: (session.user as any).id };
  if (portfolioId && portfolioId !== 'all') {
    balanceTradesQuery.portfolioId = portfolioId;
  }
  const allTimeTrades = await Trade.find(balanceTradesQuery).select('pnl entryPrice exitPrice quantity direction fees assetType symbol status portfolioBalance').lean();
  
  let totalAllTimePnl = 0;
  allTimeTrades.forEach((t: any) => {
      if (t.status === 'Open') return;
      if (t.entryPrice && t.exitPrice && t.quantity) {
          try {
              const m = calculateTradeMetrics({
                  entryPrice: t.entryPrice,
                  exitPrice: t.exitPrice,
                  quantity: t.quantity,
                  direction: t.direction || "long",
                  portfolioBalance: t.portfolioBalance || 10000, 
                  fees: t.fees || 0,
                  assetType: t.assetType || "forex",
                  symbol: t.symbol || "",
              });
              totalAllTimePnl += m.netPnl;
          } catch(e) {
              totalAllTimePnl += (t.pnl || 0);
          }
      } else {
          totalAllTimePnl += (t.pnl || 0);
      }
  });

  // Fetch Portfolio static data
  let initialBalance = 0;
  let deposits = 0;
  let withdrawals = 0;

  if (portfolioId && portfolioId !== 'all') {
      const portfolio = await Portfolio.findOne({ _id: portfolioId, userId: (session.user as any).id }).lean();
      if (portfolio) {
          initialBalance = (portfolio as any).initialBalance || 0;
          deposits = (portfolio as any).deposits || 0;
          withdrawals = (portfolio as any).withdrawals || 0;
      }
  } else {
      const portfolios = await Portfolio.find({ userId: (session.user as any).id }).lean();
      initialBalance = portfolios.reduce((sum, p) => sum + ((p as any).initialBalance || 0), 0);
      deposits = portfolios.reduce((sum, p) => sum + ((p as any).deposits || 0), 0);
      withdrawals = portfolios.reduce((sum, p) => sum + ((p as any).withdrawals || 0), 0);
  }

  // Anchor strictly to initialBalance to avoid double counting
  // If the user has not set initialBalance, it starts from 0 effectively.
  const baseBalance = initialBalance;
  const liveBalance = baseBalance + totalAllTimePnl + deposits - withdrawals;

  const balance = liveBalance;

  // Use .lean() to skip Mongoose hydration for massive speed gains in analytical processing
  // @ts-ignore
  const trades = await Trade.find(query).sort({ timestampEntry: 1 }).lean(); 

  // Helper function to get complete calculated metrics for a trade
  const getTradeMetrics = (trade: any) => {
    // If we have all the required data, calculate comprehensive metrics
    if (trade.entryPrice && trade.exitPrice && trade.quantity) {
      try {
        const metrics = calculateTradeMetrics({
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice || undefined,
          stopLoss: trade.stopLoss || undefined,
          takeProfit: trade.takeProfit || undefined,
          quantity: trade.quantity,
          direction: trade.direction || "long",
          portfolioBalance: trade.portfolioBalance || 10000,
          fees: trade.fees || 0,
          assetType: trade.assetType || "forex",
          symbol: trade.symbol || "",
        });
        return {
          netPnl: metrics.netPnl,
          grossPnl: metrics.grossPnl,
          rMultiple: metrics.rMultiple,
          riskAmount: metrics.riskAmount,
          accountRisk: metrics.accountRisk,
          targetRR: metrics.targetRR,
          actualRR: metrics.actualRR,
          positionValue: metrics.positionValue,
        };
      } catch (error) {
        console.error("Error calculating metrics for trade:", trade._id, error);
      }
    }
    
    // Fallback to stored values or zero
    return {
      netPnl: trade.pnl || 0,
      grossPnl: trade.grossPnl || trade.pnl || 0,
      rMultiple: trade.rMultiple || 0,
      riskAmount: trade.riskAmount || 0,
      accountRisk: trade.accountRisk || 0,
      targetRR: trade.targetRR || 0,
      actualRR: trade.actualRR || 0,
      positionValue: (trade.entryPrice || 0) * (trade.quantity || 0),
    };
  };

  // Initialize metrics
  let totalPnl = 0;
  let totalGrossPnl = 0;
  let totalFees = 0;
  let totalRiskAmount = 0;
  let totalPositionValue = 0;
  let wins = 0;
  let losses = 0;
  let breakevens = 0;
  let totalTrades = trades.length;
  let totalR = 0;
  let totalWinPnl = 0;
  let totalLossPnl = 0;
  let totalWinR = 0;
  let totalLossR = 0;
  
  const heatmapData: Record<string, any> = {};
  const emotionBreakdown: Record<string, number> = {};
  const gradeBreakdown: Record<string, { count: number; avgPnl: number; totalPnl: number; avgR: number; totalR: number }> = {};
  const monthlyData: Record<string, { pnl: number; trades: number; wins: number; losses: number; totalR: number }> = {};
  const assetTypeBreakdown: Record<string, { count: number; pnl: number; avgR: number }> = {};
  const strategyBreakdown: Record<string, { count: number; pnl: number; wins: number; totalR: number }> = {};
  const symbolMap = new Map<string, { count: number; pnl: number }>();
  const directionBreakdown = { long: { count: 0, pnl: 0, wins: 0 }, short: { count: 0, pnl: 0, wins: 0 } };
  const dayOfWeekBreakdown: Record<string, { count: number; pnl: number; wins: number }> = {
    'Monday': { count: 0, pnl: 0, wins: 0 },
    'Tuesday': { count: 0, pnl: 0, wins: 0 },
    'Wednesday': { count: 0, pnl: 0, wins: 0 },
    'Thursday': { count: 0, pnl: 0, wins: 0 },
    'Friday': { count: 0, pnl: 0, wins: 0 },
    'Saturday': { count: 0, pnl: 0, wins: 0 },
    'Sunday': { count: 0, pnl: 0, wins: 0 }
  };
  let peakEquity = baseBalance;
  let maxDrawdown = 0;
  let currentEquity = baseBalance;
  let currentDrawdown = 0;
  let drawdownPeriods: Array<{ start: string; end: string; amount: number; duration: number }> = [];
  let drawdownStart: string | null = null;

  // Streak tracking
  let currentStreak = 0;
  let currentStreakType: 'win' | 'loss' | 'neutral' = 'neutral';
  let bestWinStreak = 0;
  let worstLossStreak = 0;
  let tempWinStreak = 0;
  let tempLossStreak = 0;

  // Process each trade and calculate comprehensive metrics
  const processedTrades = trades.map((trade: any) => {
    const metrics = getTradeMetrics(trade);
    const pnl = metrics.netPnl;
    const grossPnl = metrics.grossPnl;
    const rMultiple = metrics.rMultiple;
    
    // Accumulate totals
    totalPnl += pnl;
    totalGrossPnl += grossPnl;
    totalFees += trade.fees || 0;
    totalRiskAmount += metrics.riskAmount;
    totalPositionValue += metrics.positionValue;
    totalR += rMultiple;

    // Symbol distribution
    const symbol = trade.symbol || "UNKNOWN";
    const currentSymbol = symbolMap.get(symbol) || { count: 0, pnl: 0 };
    symbolMap.set(symbol, {
      count: currentSymbol.count + 1,
      pnl: currentSymbol.pnl + pnl,
    });
    
    // Track wins/losses with more precision
    if (pnl > 0.01) {
      wins++;
      totalWinPnl += pnl;
      totalWinR += rMultiple;
      
      // Streak tracking
      if (currentStreakType === 'win') {
        currentStreak++;
        tempWinStreak++;
      } else {
        currentStreak = 1;
        currentStreakType = 'win';
        tempWinStreak = 1;
        tempLossStreak = 0;
      }
      
      if (tempWinStreak > bestWinStreak) {
        bestWinStreak = tempWinStreak;
      }
    } else if (pnl < -0.01) {
      losses++;
      totalLossPnl += Math.abs(pnl);
      totalLossR += Math.abs(rMultiple);
      
      // Streak tracking
      if (currentStreakType === 'loss') {
        currentStreak++;
        tempLossStreak++;
      } else {
        currentStreak = 1;
        currentStreakType = 'loss';
        tempLossStreak = 1;
        tempWinStreak = 0;
      }
      
      if (tempLossStreak > worstLossStreak) {
        worstLossStreak = tempLossStreak;
      }
    } else {
      breakevens++;
      // Reset streak on breakeven
      currentStreak = 0;
      currentStreakType = 'neutral';
      tempWinStreak = 0;
      tempLossStreak = 0;
    }

    // Equity curve and drawdown tracking
    currentEquity += pnl;
    if (currentEquity > peakEquity) {
      // New peak - end any current drawdown
      if (drawdownStart && currentDrawdown > 0) {
        const drawdownEnd = new Date(trade.timestampEntry).toISOString().split('T')[0];
        const startDate = new Date(drawdownStart);
        const endDate = new Date(drawdownEnd);
        const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        
        drawdownPeriods.push({
          start: drawdownStart,
          end: drawdownEnd,
          amount: currentDrawdown,
          duration
        });
      }
      
      peakEquity = currentEquity;
      currentDrawdown = 0;
      drawdownStart = null;
    } else {
      // In drawdown
      currentDrawdown = peakEquity - currentEquity;
      if (currentDrawdown > maxDrawdown) {
        maxDrawdown = currentDrawdown;
      }
      if (!drawdownStart) {
        drawdownStart = new Date(trade.timestampEntry).toISOString().split('T')[0];
      }
    }

    // Emotion tracking
    if (trade.emotion) {
      emotionBreakdown[trade.emotion] = (emotionBreakdown[trade.emotion] || 0) + 1;
    }

    // Setup grade tracking with R-Multiple
    if (trade.setupGrade) {
      const gradeMap: Record<number, string> = { 1: 'D', 2: 'C', 3: 'B', 4: 'A', 5: 'A+' };
      const grade = gradeMap[trade.setupGrade] || 'Unknown';
      
      if (!gradeBreakdown[grade]) {
        gradeBreakdown[grade] = { count: 0, avgPnl: 0, totalPnl: 0, avgR: 0, totalR: 0 };
      }
      gradeBreakdown[grade].count++;
      gradeBreakdown[grade].totalPnl += pnl;
      gradeBreakdown[grade].totalR += rMultiple;
      gradeBreakdown[grade].avgPnl = gradeBreakdown[grade].totalPnl / gradeBreakdown[grade].count;
      gradeBreakdown[grade].avgR = gradeBreakdown[grade].totalR / gradeBreakdown[grade].count;
    }

    // Asset type breakdown
    const assetType = trade.assetType || 'unknown';
    if (!assetTypeBreakdown[assetType]) {
      assetTypeBreakdown[assetType] = { count: 0, pnl: 0, avgR: 0 };
    }
    assetTypeBreakdown[assetType].count++;
    assetTypeBreakdown[assetType].pnl += pnl;
    assetTypeBreakdown[assetType].avgR = 
      (assetTypeBreakdown[assetType].avgR * (assetTypeBreakdown[assetType].count - 1) + rMultiple) / 
      assetTypeBreakdown[assetType].count;

    // Direction breakdown
    const direction = trade.direction || 'long';
    if (direction === 'long' || direction === 'short') {
      const dir = direction as 'long' | 'short';
      directionBreakdown[dir].count++;
      directionBreakdown[dir].pnl += pnl;
      if (pnl > 0) directionBreakdown[dir].wins++;
    }

    // Strategy tracking
    const strategyName = trade.strategyId?.name || 'Uncategorized';
    if (!strategyBreakdown[strategyName]) {
      strategyBreakdown[strategyName] = { count: 0, pnl: 0, wins: 0, totalR: 0 };
    }
    strategyBreakdown[strategyName].count++;
    strategyBreakdown[strategyName].pnl += pnl;
    strategyBreakdown[strategyName].totalR += rMultiple;
    if (pnl > 0) strategyBreakdown[strategyName].wins++;

    // Day of Week tracking
    const dayName = new Date(trade.timestampEntry).toLocaleDateString('en-US', { weekday: 'long' });
    if (dayOfWeekBreakdown[dayName]) {
      dayOfWeekBreakdown[dayName].count++;
      dayOfWeekBreakdown[dayName].pnl += pnl;
      if (pnl > 0) dayOfWeekBreakdown[dayName].wins++;
    }

    // Daily heatmap data
    const dateStr = new Date(trade.timestampEntry).toISOString().split('T')[0];
    if (!heatmapData[dateStr]) {
      heatmapData[dateStr] = { date: dateStr, count: 0, pnl: 0, wins: 0, losses: 0, avgR: 0, totalR: 0 };
    }
    heatmapData[dateStr].count++;
    heatmapData[dateStr].pnl += pnl;
    heatmapData[dateStr].totalR += rMultiple;
    heatmapData[dateStr].avgR = heatmapData[dateStr].totalR / heatmapData[dateStr].count;
    if (pnl > 0) heatmapData[dateStr].wins++;
    if (pnl < 0) heatmapData[dateStr].losses++;

    // Monthly data aggregation
    const monthStr = new Date(trade.timestampEntry).toISOString().slice(0, 7); // YYYY-MM
    if (!monthlyData[monthStr]) {
      monthlyData[monthStr] = { pnl: 0, trades: 0, wins: 0, losses: 0, totalR: 0 };
    }
    monthlyData[monthStr].pnl += pnl;
    monthlyData[monthStr].trades++;
    monthlyData[monthStr].totalR += rMultiple;
    if (pnl > 0) monthlyData[monthStr].wins++;
    if (pnl < 0) monthlyData[monthStr].losses++;

    return {
      ...trade,
      calculatedMetrics: metrics,
      equityValue: currentEquity
    };
  });

  // Generate equity curve
  const equityCurve: any[] = [];
  
  // Add initial point
  if (processedTrades.length > 0) {
    equityCurve.push({
      name: 'Start',
      value: Number(baseBalance.toFixed(2)),
      date: processedTrades[0].timestampEntry,
      pnl: 0,
      rMultiple: 0,
      tradeNumber: 0
    });
  }

  processedTrades.forEach((trade, index) => {
    equityCurve.push({
      name: new Date(trade.timestampEntry).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: trade.equityValue,
      date: trade.timestampEntry,
      pnl: trade.calculatedMetrics.netPnl,
      rMultiple: trade.calculatedMetrics.rMultiple,
      tradeNumber: index + 1
    });
  });

  const heatmap = Object.values(heatmapData);
  
  // Convert monthly data to array and sort by date
  const monthlyDataArray = Object.entries(monthlyData)
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      pnl: Number(data.pnl.toFixed(2)),
      trades: data.trades,
      wins: data.wins,
      losses: data.losses,
      winRate: data.trades > 0 ? Number(((data.wins / data.trades) * 100).toFixed(1)) : 0,
      avgR: data.trades > 0 ? Number((data.totalR / data.trades).toFixed(2)) : 0,
      monthKey: month
    }))
    .sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  
  // Find Best/Worst Day
  let bestDay = { date: '', pnl: -Infinity, count: 0 };
  let worstDay = { date: '', pnl: Infinity, count: 0 };
  
  heatmap.forEach((day: any) => {
    if (day.pnl > bestDay.pnl) bestDay = day;
    if (day.pnl < worstDay.pnl) worstDay = day;
  });

  // Calculate comprehensive statistics
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
  const lossRate = totalTrades > 0 ? (losses / totalTrades) * 100 : 0;
  const breakevenRate = totalTrades > 0 ? (breakevens / totalTrades) * 100 : 0;
  
  const avgWin = wins > 0 ? totalWinPnl / wins : 0;
  const avgLoss = losses > 0 ? totalLossPnl / losses : 0;
  const avgWinR = wins > 0 ? totalWinR / wins : 0;
  const avgLossR = losses > 0 ? totalLossR / losses : 0;
  
  // Calculate Profit Factor
  const profitFactor = totalLossPnl > 0 ? totalWinPnl / totalLossPnl : totalWinPnl > 0 ? 999 : 0;

  // Expectancy = (Win % * Avg Win) - (Loss % * Avg Loss)
  const expectancy = totalTrades > 0 ? ((wins/totalTrades) * avgWin) - ((losses/totalTrades) * avgLoss) : 0;
  
  // Average metrics
  const averageR = totalTrades > 0 ? totalR / totalTrades : 0;
  const averageRiskAmount = totalTrades > 0 ? totalRiskAmount / totalTrades : 0;
  const averagePositionSize = totalTrades > 0 ? totalPositionValue / totalTrades : 0;
  
  // Risk metrics
  const maxRiskPerTrade = Math.max(...processedTrades.map(t => t.calculatedMetrics.riskAmount), 0);
  const avgAccountRisk = totalTrades > 0 ? 
    processedTrades.reduce((sum, t) => sum + t.calculatedMetrics.accountRisk, 0) / totalTrades : 0;

  // Recent trades for dashboard (last 10 with full calculated metrics)
  const recentTrades = processedTrades.slice(-10).reverse().map((t: any) => ({
    _id: t._id,
    symbol: t.symbol,
    pnl: t.calculatedMetrics.netPnl,
    grossPnl: t.calculatedMetrics.grossPnl,
    rMultiple: t.calculatedMetrics.rMultiple,
    riskAmount: t.calculatedMetrics.riskAmount,
    accountRisk: t.calculatedMetrics.accountRisk,
    emotion: t.emotion,
    setupGrade: t.setupGrade,
    timestampEntry: t.timestampEntry,
    timestampExit: t.timestampExit,
    direction: t.direction,
    assetType: t.assetType,
    entryPrice: t.entryPrice,
    exitPrice: t.exitPrice,
    quantity: t.quantity
  }));

  const stats = {
    // Core Performance Metrics
    totalPnl: Number(totalPnl.toFixed(2)),
    totalGrossPnl: Number(totalGrossPnl.toFixed(2)),
    totalFees: Number(totalFees.toFixed(2)),
    netReturn: Number(((totalPnl / (totalPositionValue || 1)) * 100).toFixed(2)),
    
    // Trade Statistics
    totalTrades,
    wins,
    losses,
    breakevens,
    winRate: Number(winRate.toFixed(1)),
    lossRate: Number(lossRate.toFixed(1)),
    breakevenRate: Number(breakevenRate.toFixed(1)),
    
    // P&L Analysis
    avgWin: Number(avgWin.toFixed(2)),
    avgLoss: Number(avgLoss.toFixed(2)),
    profitFactor: Number(profitFactor.toFixed(2)),
    expectancy: Number(expectancy.toFixed(2)),
    
    // Risk Metrics
    averageR: Number(averageR.toFixed(2)),
    avgWinR: Number(avgWinR.toFixed(2)),
    avgLossR: Number(avgLossR.toFixed(2)),
    totalRiskAmount: Number(totalRiskAmount.toFixed(2)),
    averageRiskAmount: Number(averageRiskAmount.toFixed(2)),
    maxRiskPerTrade: Number(maxRiskPerTrade.toFixed(2)),
    avgAccountRisk: Number(avgAccountRisk.toFixed(2)),
    
    // Drawdown Analysis
    maxDrawdown: Number(maxDrawdown.toFixed(2)),
    maxDrawdownPercent: totalPositionValue > 0 ? Number(((maxDrawdown / totalPositionValue) * 100).toFixed(2)) : 0,
    drawdownPeriods: drawdownPeriods.slice(-5), // Last 5 drawdown periods
    currentDrawdown: Number(currentDrawdown.toFixed(2)),
    
    // Position Analysis
    averagePositionSize: Number(averagePositionSize.toFixed(2)),
    totalPositionValue: Number(totalPositionValue.toFixed(2)),
    
    // Best/Worst Performance
    bestDay: bestDay.pnl !== -Infinity ? {
      ...bestDay,
      pnl: Number(bestDay.pnl.toFixed(2))
    } : null,
    worstDay: worstDay.pnl !== Infinity ? {
      ...worstDay,
      pnl: Number(worstDay.pnl.toFixed(2))
    } : null,

    // Chart Data
    equityCurve,
    heatmap,
    monthlyData: monthlyDataArray,
    
    // Breakdowns
    emotionBreakdown,
    gradeBreakdown,
    assetTypeBreakdown,
    strategyBreakdown,
    directionBreakdown,
    dayOfWeekBreakdown,
    
    // Recent Activity
    recentTrades,
    allTrades: processedTrades, // Add all trades for time analysis
    
    // Additional Insights
    consistency: {
      consecutiveWins: tempWinStreak,
      consecutiveLosses: tempLossStreak,
      longestWinStreak: bestWinStreak,
      longestLossStreak: worstLossStreak,
      currentStreak,
      currentStreakType,
      bestWinStreak,
      worstLossStreak
    },

    // Activity Map & Distribution (Needed for Widgets)
    distribution: symbolMap.size > 0 ? 
      Array.from(symbolMap.entries())
        .map(([name, val]: [string, any]) => ({
          name,
          count: val.count,
          pnl: val.pnl,
          percentage: totalTrades > 0 ? Math.round((val.count / totalTrades) * 100) : 0,
        }))
        .sort((a: any, b: any) => b.count - a.count)
        .slice(0, 4) : [],
    
    summary: {
      mostActive: symbolMap.size > 0 ? Array.from(symbolMap.entries())
        .sort((a: any, b: any) => b[1].count - a[1].count)[0]?.[0] || "N/A" : "N/A",
      totalPnL: totalPnl
    },
    
    // Portfolio Balance Stats
    currentBalance: balance,
    balance: balance,
    initialBalance: initialBalance,
    allTimePnl: totalAllTimePnl
  };

  return NextResponse.json(stats);
}

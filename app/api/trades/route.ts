
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Trade from '@/lib/models/Trade';
import Strategy from '@/lib/models/Strategy';
import Portfolio from '@/lib/models/Portfolio';
import { authOptions } from '@/lib/auth';
import { calculateTradeMetrics } from '@/lib/utils/tradeCalculations';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  
  await dbConnect();
  
  // Force registration of models to avoid MissingSchemaError
  const _s = Strategy;
  const _p = Portfolio;
  
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const sort = searchParams.get('sort') || 'timestampEntry'; // default sort field
  const order = searchParams.get('order') === 'ask' ? 1 : -1; // default desc
  const symbol = searchParams.get('symbol');
  const status = searchParams.get('status'); // 'win' or 'loss'
  const portfolioId = searchParams.get('portfolioId');
  const strategyId = searchParams.get('strategyId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  // Build Filter
  const filter: any = { 
      // @ts-ignore
      userId: session.user.id,
      inBacktest: type === 'backtest' ? true : { $ne: true } 
  };
  
  if (symbol) {
      filter.symbol = { $regex: symbol, $options: 'i' };
  }

  if (status === 'win') {
      filter.pnl = { $gt: 0 };
  } else if (status === 'loss') {
      filter.pnl = { $lt: 0 };
  }

  if (portfolioId && portfolioId !== 'all') {
      filter.portfolioId = portfolioId;
  }

  if (strategyId && strategyId !== 'all') {
      filter.strategyId = strategyId;
  }

  if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          filter.timestampEntry = {
              $gte: start,
              $lte: end
          };
      }
  }

  // Calculate Skip
  const skip = (page - 1) * limit;

  // Fetch Trades with Pagination
  const trades = await Trade.find(filter)
    .populate('strategyId', 'name isTemplate')
    .populate('portfolioId', 'name accountType')
    .sort({ [sort]: order })
    .skip(skip)
    .limit(limit)
    .lean();
    
  // Transform the populated strategy and portfolio data
  const transformedTrades = trades.map((trade: any) => {
    let result = {
      ...trade,
      strategy: trade.strategyId ? {
        _id: trade.strategyId._id,
        name: trade.strategyId.name,
        isTemplate: trade.strategyId.isTemplate
      } : null,
      portfolio: trade.portfolioId ? {
        _id: trade.portfolioId._id,
        name: trade.portfolioId.name,
        accountType: trade.portfolioId.accountType
      } : null
    };

    // Recalculate robust metrics for display to fix legacy facade issues
    if (trade.entryPrice && trade.exitPrice && trade.quantity) {
      try {
        const metrics = calculateTradeMetrics({
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice,
          stopLoss: trade.stopLoss,
          takeProfit: trade.takeProfit,
          quantity: trade.quantity,
          direction: trade.direction || 'long',
          portfolioBalance: trade.portfolioBalance || 10000,
          fees: trade.fees || 0,
          assetType: trade.assetType || 'forex',
          symbol: trade.symbol || '',
        });
        result.pnl = metrics.netPnl;
        result.grossPnl = metrics.grossPnl;
        result.rMultiple = metrics.rMultiple;
        result.actualRR = metrics.actualRR;
      } catch (e) {
        // Fallback to stored values
      }
    }

    return result;
  });
    
  // Get Total Count for Pagination UI
  const total = await Trade.countDocuments(filter);
  
  return NextResponse.json({
      trades: transformedTrades,
      pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
      }
  });

}


export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    await dbConnect();

    // Handle stringified tags in case it comes from input as string
    let tags = body.tags;
    if (typeof tags === 'string') {
        tags = tags.split(',').map((t: string) => t.trim()).filter((t: string) => t);
    }

    // Clean up the data before saving
    const cleanedBody = { ...body };
    
    // Remove empty strategyId to prevent ObjectId cast error
    if (!cleanedBody.strategyId || cleanedBody.strategyId === '') {
      delete cleanedBody.strategyId;
    }
    
    // Remove empty portfolioId to prevent ObjectId cast error
    if (!cleanedBody.portfolioId || cleanedBody.portfolioId === '' || cleanedBody.portfolioId === 'all') {
      delete cleanedBody.portfolioId;
    }

    // Ensure assetType is valid
    const validAssetTypes = ['stock', 'forex', 'crypto', 'cfd', 'futures', 'indices'];
    if (!validAssetTypes.includes(cleanedBody.assetType)) {
      cleanedBody.assetType = 'forex'; // Default fallback
    }

    // Ensure required fields are present and valid
    if (!cleanedBody.symbol || !cleanedBody.entryPrice || !cleanedBody.quantity) {
      return NextResponse.json({ 
        message: 'Missing required fields: symbol, entryPrice, and quantity are required' 
      }, { status: 400 });
    }

    // Convert string numbers to actual numbers
    const numericFields = [
      'entryPrice', 'exitPrice', 'stopLoss', 'takeProfit', 'quantity', 
      'fees', 'pnl', 'grossPnl', 'accountRisk', 'riskAmount', 
      'portfolioBalance', 'rMultiple', 'targetRR', 'actualRR', 'maxRR',
      'riskPercentage', 'setupGrade'
    ];

    numericFields.forEach((field: string) => {
      if (cleanedBody[field] !== undefined && cleanedBody[field] !== '') {
        const num = Number(cleanedBody[field]);
        if (!isNaN(num)) {
          cleanedBody[field] = num;
        } else {
          delete cleanedBody[field]; // Remove invalid numbers
        }
      } else {
        delete cleanedBody[field]; // Remove empty strings
      }
    });

    // Calculate robust metrics before saving
    if (cleanedBody.entryPrice && cleanedBody.quantity) {
      try {
        const metrics = calculateTradeMetrics({
          entryPrice: cleanedBody.entryPrice,
          exitPrice: cleanedBody.exitPrice,
          stopLoss: cleanedBody.stopLoss,
          takeProfit: cleanedBody.takeProfit,
          quantity: cleanedBody.quantity,
          direction: cleanedBody.direction || 'long',
          portfolioBalance: cleanedBody.portfolioBalance || 10000,
          fees: cleanedBody.fees || 0,
          assetType: cleanedBody.assetType || 'forex',
          symbol: cleanedBody.symbol || '',
        });

        // Use calculated metrics if not manually overridden or if naive
        // We prioritize calculated metrics for consistency unless user explicitly provided something very different
        cleanedBody.pnl = metrics.netPnl;
        cleanedBody.grossPnl = metrics.grossPnl;
        cleanedBody.rMultiple = metrics.rMultiple;
        cleanedBody.riskAmount = metrics.riskAmount;
        cleanedBody.accountRisk = metrics.accountRisk;
        cleanedBody.targetRR = metrics.targetRR;
        cleanedBody.actualRR = metrics.actualRR;
      } catch (e) {
        console.error("Error calculating metrics during creation:", e);
      }
    }

    const trade = await Trade.create({
      ...cleanedBody,
      tags,
      // @ts-ignore
      userId: session.user.id,
    });

    return NextResponse.json(trade, { status: 201 });
  } catch (error) {
    console.error('Create trade error:', error);
    return NextResponse.json({ 
      message: 'Error creating trade', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

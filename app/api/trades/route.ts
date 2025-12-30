
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Trade from '@/lib/models/Trade';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
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
      filter.timestampEntry = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
      };
  }

  // Calculate Skip
  const skip = (page - 1) * limit;

  await dbConnect();
  
  // Fetch Trades with Pagination
  const trades = await Trade.find(filter)
    .populate('strategyId', 'name isTemplate')
    .populate('portfolioId', 'name accountType')
    .sort({ [sort]: order })
    .skip(skip)
    .limit(limit)
    .lean();
    
  // Transform the populated strategy and portfolio data
  const transformedTrades = trades.map((trade: any) => ({
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
  }));
    
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

    numericFields.forEach(field => {
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

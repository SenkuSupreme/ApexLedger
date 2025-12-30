import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { marketDataService } from '@/lib/services/marketDataService';
import MarketData from '@/lib/models/MarketData';
import dbConnect from '@/lib/db';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol');
  const assetType = searchParams.get('assetType');

  if (!symbol || !assetType) {
    return NextResponse.json({ message: 'Symbol and assetType required' }, { status: 400 });
  }

  try {
    const price = await marketDataService.getLatestPrice(symbol, assetType);
    
    if (price === null) {
      return NextResponse.json({ message: 'Price not available' }, { status: 404 });
    }

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      assetType,
      price,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Market data API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { symbols } = await req.json();
    
    if (!Array.isArray(symbols)) {
      return NextResponse.json({ message: 'Symbols array required' }, { status: 400 });
    }

    // Update symbols in background
    marketDataService.updateMultipleSymbols(symbols).catch(console.error);

    return NextResponse.json({ message: 'Update started', count: symbols.length });
  } catch (error) {
    console.error('Market data update error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Get historical data for a symbol
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol');
  const assetType = searchParams.get('assetType');
  const hours = parseInt(searchParams.get('hours') || '24');

  if (!symbol || !assetType) {
    return NextResponse.json({ message: 'Symbol and assetType required' }, { status: 400 });
  }

  try {
    await dbConnect();
    
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const historicalData = await MarketData.find({
      symbol: symbol.toUpperCase(),
      assetType,
      timestamp: { $gte: startTime }
    }).sort({ timestamp: 1 }).lean();

    return NextResponse.json({
      symbol: symbol.toUpperCase(),
      assetType,
      data: historicalData,
      count: historicalData.length
    });
  } catch (error) {
    console.error('Historical data API error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
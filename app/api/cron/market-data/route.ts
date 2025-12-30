import { NextResponse } from 'next/server';
import { marketDataService } from '@/lib/services/marketDataService';
import Trade from '@/lib/models/Trade';
import dbConnect from '@/lib/db';

// This endpoint can be called by a cron job service like Vercel Cron or external cron
export async function GET(req: Request) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Get unique symbols from open trades
    const openTrades = await Trade.find({ 
      status: 'Open',
      timestampExit: { $exists: false }
    }).distinct('symbol');

    // Get unique asset types
    const assetTypes = await Trade.find({
      symbol: { $in: openTrades }
    }).distinct('assetType');

    // Create symbol-assetType pairs
    const symbolPairs: { symbol: string; assetType: string }[] = [];
    
    for (const symbol of openTrades) {
      const tradeWithSymbol = await Trade.findOne({ symbol }).select('assetType');
      if (tradeWithSymbol) {
        symbolPairs.push({
          symbol,
          assetType: tradeWithSymbol.assetType
        });
      }
    }

    // Add some common symbols for demo
    const commonSymbols = [
      { symbol: 'EURUSD', assetType: 'forex' },
      { symbol: 'GBPUSD', assetType: 'forex' },
      { symbol: 'USDJPY', assetType: 'forex' },
      { symbol: 'BTCUSD', assetType: 'crypto' },
      { symbol: 'ETHUSD', assetType: 'crypto' },
      { symbol: 'AAPL', assetType: 'stocks' },
      { symbol: 'SPX500', assetType: 'indices' }
    ];

    const allSymbols = [...symbolPairs, ...commonSymbols];
    
    // Remove duplicates
    const uniqueSymbols = allSymbols.filter((item, index, self) => 
      index === self.findIndex(t => t.symbol === item.symbol && t.assetType === item.assetType)
    );

    console.log(`Updating ${uniqueSymbols.length} symbols via cron job`);

    // Update market data (this runs in background)
    await marketDataService.updateMultipleSymbols(uniqueSymbols);

    return NextResponse.json({
      success: true,
      message: `Updated ${uniqueSymbols.length} symbols`,
      symbols: uniqueSymbols.map(s => s.symbol),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({
      success: false,
      message: 'Cron job failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Manual trigger endpoint
export async function POST(req: Request) {
  try {
    const { symbols } = await req.json();
    
    if (!Array.isArray(symbols)) {
      return NextResponse.json({ message: 'Symbols array required' }, { status: 400 });
    }

    await marketDataService.updateMultipleSymbols(symbols);

    return NextResponse.json({
      success: true,
      message: `Manually updated ${symbols.length} symbols`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Manual update error:', error);
    return NextResponse.json({
      success: false,
      message: 'Manual update failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
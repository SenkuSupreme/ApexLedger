import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Trade from '@/lib/models/Trade';

import { calculateTradeMetrics } from '@/lib/utils/tradeCalculations';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const portfolioId = searchParams.get('portfolioId');
  const month = searchParams.get('month'); // YYYY-MM format
  
  await dbConnect();
  
  // @ts-ignore
  const query: any = { userId: session.user.id, inBacktest: { $ne: true } };

  if (portfolioId && portfolioId !== 'all') {
    try {
      query.portfolioId = portfolioId;
    } catch (e) {
      console.error("Invalid portfolioId in calendar query:", portfolioId);
    }
  }

  console.log("Calendar API Query:", JSON.stringify(query));

  // If month is specified, filter by that month
  if (month) {
    const [year, monthNum] = month.split('-');
    const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(monthNum), 0);
    
    query.timestampEntry = {
      $gte: startDate,
      $lte: endDate
    };
  } else {
    // Default to last 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    query.timestampEntry = {
      $gte: threeMonthsAgo
    };
  }

  try {
    const trades = await Trade.find(query)
      .select('timestampEntry pnl entryPrice exitPrice quantity direction fees assetType symbol emotion')
      .lean();
    
    console.log(`Fetched ${trades.length} trades for calendar`);
    
    // Group trades by date
    const calendarData: Record<string, any> = {};
    
    trades.forEach((trade: any) => {
      if (!trade.timestampEntry) return;
      
      const dateStr = new Date(trade.timestampEntry).toISOString().split('T')[0];
      
      if (!calendarData[dateStr]) {
        calendarData[dateStr] = {
          date: dateStr,
          trades: 0,
          pnl: 0,
          emotions: []
        };
      }
      
      let pnl = Number(trade.pnl) || 0;
      
      // Calculate correct PnL if possible (institutional consistency)
      if (trade.entryPrice && trade.exitPrice && trade.quantity) {
        try {
          const metrics = calculateTradeMetrics({
            entryPrice: Number(trade.entryPrice),
            exitPrice: Number(trade.exitPrice),
            stopLoss: Number(trade.stopLoss || 0),
            takeProfit: Number(trade.takeProfit || 0),
            quantity: Number(trade.quantity),
            direction: trade.direction === "short" ? "short" : "long",
            portfolioBalance: Number(trade.portfolioBalance || 10000),
            fees: Number(trade.fees || 0),
            assetType: (trade.assetType || "forex").toLowerCase() as any,
            symbol: trade.symbol || "",
          });
          pnl = metrics.netPnl;
        } catch (e) {
          // Fallback to stored pnl if calculation fails
        }
      }
      
      calendarData[dateStr].trades++;
      calendarData[dateStr].pnl += pnl;
      
      if (trade.emotion && !calendarData[dateStr].emotions.includes(trade.emotion)) {
        calendarData[dateStr].emotions.push(trade.emotion);
      }
    });

    // Convert to array and add dominant emotion
    const result = Object.values(calendarData).map((day: any) => ({
      date: day.date,
      trades: day.trades,
      pnl: day.pnl,
      emotion: day.emotions.length > 0 ? day.emotions[0] : null // Take first emotion for simplicity
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Calendar data fetch error:', error);
    return NextResponse.json({ message: 'Error fetching calendar data' }, { status: 500 });
  }
}
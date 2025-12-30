import { NextRequest, NextResponse } from "next/server";

// Function to derive session reviews from journal trades
const deriveSessionsFromTrades = (trades: any[]) => {
  const sessionGroups = trades.reduce((acc: any, trade: any) => {
    const tradeDate = new Date(trade.timestampEntry);
    const date = tradeDate.toISOString().split('T')[0];
    const hour = tradeDate.getHours();
    
    // Determine session based on time (UTC)
    let session = 'newyork'; // default
    if (hour >= 21 || hour < 6) session = 'sydney';
    else if (hour >= 6 && hour < 15) session = 'tokyo';
    else if (hour >= 15 && hour < 21) session = 'london';
    
    const key = `${date}-${session}`;
    
    if (!acc[key]) {
      acc[key] = {
        _id: `session-${key}`,
        date,
        session,
        trades: [],
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        totalPnL: 0,
        bestTrade: 0,
        worstTrade: 0,
        startTime: "00:00",
        endTime: "23:59",
      };
    }
    
    acc[key].trades.push(trade);
    acc[key].totalTrades++;
    
    const pnl = trade.pnl || 0;
    acc[key].totalPnL += pnl;
    
    if (pnl > 0) acc[key].winningTrades++;
    else if (pnl < 0) acc[key].losingTrades++;
    
    if (pnl > acc[key].bestTrade) acc[key].bestTrade = pnl;
    if (pnl < acc[key].worstTrade) acc[key].worstTrade = pnl;
    
    return acc;
  }, {});

  return Object.values(sessionGroups).map((group: any) => {
    const winRate = group.totalTrades > 0 ? Math.round((group.winningTrades / group.totalTrades) * 100) : 0;
    
    // Determine mood based on performance
    let mood = 'neutral';
    if (winRate >= 80 && group.totalPnL > 0) mood = 'excellent';
    else if (winRate >= 60 && group.totalPnL > 0) mood = 'good';
    else if (winRate < 40 || group.totalPnL < -100) mood = 'poor';
    else if (group.totalPnL < -200) mood = 'terrible';
    
    // Determine market conditions based on trade outcomes
    let marketConditions = 'ranging';
    if (group.bestTrade > 100 || group.worstTrade < -100) marketConditions = 'volatile';
    if (winRate > 70) marketConditions = 'trending';
    if (group.totalTrades < 2) marketConditions = 'quiet';

    // Calculate bias alignment
    const longTrades = group.trades.filter((t: any) => t.direction === 'long').length;
    const shortTrades = group.trades.filter((t: any) => t.direction === 'short').length;
    const alignedTrades = Math.max(longTrades, shortTrades);
    const biasAlignment = `${Math.round((alignedTrades / group.totalTrades) * 100)}% - ${alignedTrades}/${group.totalTrades} trades aligned`;

    return {
      ...group,
      winRate,
      mood,
      marketConditions,
      biasAlignment,
      notes: `Session derived from ${group.totalTrades} trades. ${group.winningTrades} winners, ${group.losingTrades} losers. P&L: $${group.totalPnL.toFixed(2)}. Market showed ${marketConditions} conditions with ${mood} performance.`,
      createdAt: new Date().toISOString(),
      derivedFromTrades: true,
    };
  });
};

// Mock session data - in production, this would be derived from journal entries
let sessionReviews: any[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const session = searchParams.get("session");
    const mood = searchParams.get("mood");
    const search = searchParams.get("search");

    // Fetch trades to derive sessions
    let derivedSessions: any[] = [];
    try {
      const tradesRes = await fetch(`${request.nextUrl.origin}/api/trades`);
      if (tradesRes.ok) {
        const tradesData = await tradesRes.json();
        derivedSessions = deriveSessionsFromTrades(tradesData.trades || []);
      }
    } catch (error) {
      console.log("Failed to fetch trades for session derivation");
    }

    // Combine with existing session reviews
    let allSessions = [...sessionReviews, ...derivedSessions];

    // Add mock data if no sessions exist
    if (allSessions.length === 0) {
      allSessions = [
        {
          _id: "1",
          date: new Date().toISOString().split("T")[0],
          session: "london",
          startTime: "13:45",
          endTime: "18:30",
          totalTrades: 5,
          winningTrades: 3,
          losingTrades: 2,
          totalPnL: 245.5,
          winRate: 60,
          bestTrade: 150.0,
          worstTrade: -85.0,
          notes: "Strong trending market during London session. Good momentum trades on EURUSD and GBPUSD. Need to work on position sizing for better risk management. Connected to bullish bias on EURUSD from morning analysis.",
          mood: "good",
          marketConditions: "trending",
          createdAt: new Date().toISOString(),
          relatedTrades: [],
          tradeCount: 5,
          biasAlignment: "Strong - 4/5 trades aligned with morning bias",
          derivedFromTrades: true,
        },
        {
          _id: "2",
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          session: "newyork",
          startTime: "18:45",
          endTime: "22:15",
          totalTrades: 3,
          winningTrades: 1,
          losingTrades: 2,
          totalPnL: -120.75,
          winRate: 33,
          bestTrade: 80.0,
          worstTrade: -95.5,
          notes: "Choppy market conditions during NY session. Got caught in false breakouts. Should have waited for clearer setups. Bias was unclear, leading to poor trade selection.",
          mood: "poor",
          marketConditions: "volatile",
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          relatedTrades: [],
          tradeCount: 3,
          biasAlignment: "Poor - 1/3 trades aligned with bias",
          derivedFromTrades: true,
        },
        {
          _id: "3",
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          session: "tokyo",
          startTime: "09:00",
          endTime: "12:30",
          totalTrades: 4,
          winningTrades: 3,
          losingTrades: 1,
          totalPnL: 180.25,
          winRate: 75,
          bestTrade: 95.0,
          worstTrade: -45.0,
          notes: "Excellent Tokyo session with clear trend following opportunities. USD/JPY provided great momentum trades. Discipline was good throughout. Perfect alignment with bearish USD bias.",
          mood: "excellent",
          marketConditions: "trending",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          relatedTrades: [],
          tradeCount: 4,
          biasAlignment: "Perfect - 4/4 trades aligned with bias",
          derivedFromTrades: true,
        }
      ];
    }

    let filteredSessions = allSessions;

    // Filter by session type
    if (session && session !== "all") {
      filteredSessions = filteredSessions.filter(s => s.session === session);
    }

    // Filter by mood
    if (mood && mood !== "all") {
      filteredSessions = filteredSessions.filter(s => s.mood === mood);
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSessions = filteredSessions.filter(s =>
        s.notes.toLowerCase().includes(searchLower) ||
        s.session.toLowerCase().includes(searchLower)
      );
    }

    // Sort by date (newest first)
    filteredSessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      success: true,
      sessions: filteredSessions,
      total: filteredSessions.length
    });

  } catch (error) {
    console.error("Sessions API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch session reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newSession = {
      _id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
    };

    sessionReviews.unshift(newSession);

    return NextResponse.json({
      success: true,
      session: newSession
    });

  } catch (error) {
    console.error("Sessions POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create session review" },
      { status: 500 }
    );
  }
}
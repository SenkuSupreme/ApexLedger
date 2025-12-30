import { NextRequest, NextResponse } from "next/server";

// Mock database - in production, use MongoDB or your preferred database
let biasEntries: any[] = [
  {
    _id: "1",
    date: new Date().toISOString().split("T")[0],
    symbol: "EURUSD",
    bias: "bullish",
    timeframe: "D1",
    confidence: 75,
    keyLevels: {
      support: [1.0850, 1.0800],
      resistance: [1.0950, 1.1000],
    },
    technicalFactors: [
      "Break of key resistance at 1.0920",
      "Bullish divergence on RSI",
      "Higher highs and higher lows"
    ],
    fundamentalFactors: [
      "ECB hawkish stance",
      "Strong eurozone data",
      "USD weakness"
    ],
    riskFactors: [
      "Fed meeting next week",
      "US CPI data release"
    ],
    targetPrice: 1.1050,
    invalidationLevel: 1.0820,
    notes: "Strong bullish momentum after breaking key resistance. Watch for continuation above 1.0950.",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "2",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    symbol: "XAUUSD",
    bias: "bearish",
    timeframe: "H4",
    confidence: 60,
    keyLevels: {
      support: [1980, 1960],
      resistance: [2020, 2040],
    },
    technicalFactors: [
      "Failed to break 2020 resistance",
      "Bearish divergence forming",
      "Lower highs pattern"
    ],
    fundamentalFactors: [
      "USD strength",
      "Rising yields",
      "Risk-on sentiment"
    ],
    riskFactors: [
      "Geopolitical tensions",
      "Inflation data pending"
    ],
    targetPrice: 1950,
    invalidationLevel: 2025,
    notes: "Gold showing weakness after failing to break key resistance. Target lower levels.",
    status: "active",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    let filteredBiases = [...biasEntries];

    // Filter by symbol
    if (symbol && symbol !== "all") {
      filteredBiases = filteredBiases.filter(bias => bias.symbol === symbol);
    }

    // Filter by status
    if (status && status !== "all") {
      filteredBiases = filteredBiases.filter(bias => bias.status === status);
    }

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filteredBiases = filteredBiases.filter(bias =>
        bias.symbol.toLowerCase().includes(searchLower) ||
        bias.notes.toLowerCase().includes(searchLower) ||
        bias.technicalFactors.some((factor: string) => factor.toLowerCase().includes(searchLower)) ||
        bias.fundamentalFactors.some((factor: string) => factor.toLowerCase().includes(searchLower))
      );
    }

    // Sort by date (newest first)
    filteredBiases.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({
      success: true,
      biases: filteredBiases,
      total: filteredBiases.length
    });

  } catch (error) {
    console.error("Bias API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch bias entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newBias = {
      _id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    biasEntries.unshift(newBias);

    return NextResponse.json({
      success: true,
      bias: newBias
    });

  } catch (error) {
    console.error("Bias POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create bias entry" },
      { status: 500 }
    );
  }
}